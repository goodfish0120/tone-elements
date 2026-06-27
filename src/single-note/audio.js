(function(){
  "use strict";

  const api = window.SoundLab;
  const {clamp, lerp} = api;
  let audioCtx = null;

  api.ensureAudio = async () => {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === "suspended") await audioCtx.resume();
    return audioCtx;
  };

  api.playProfile = async (profile, onStatus) => {
    const ctx = await api.ensureAudio();
    const now = ctx.currentTime + .04;
    const out = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    out.gain.value = .74;
    limiter.threshold.value = -10;
    limiter.knee.value = 8;
    limiter.ratio.value = 10;
    limiter.attack.value = .003;
    limiter.release.value = .16;
    out.connect(limiter).connect(ctx.destination);
    api.renderGraph(ctx, profile, out, now);
    onStatus?.("playing");
    setTimeout(() => onStatus?.("ready"), profile.gesture.durationSec * 1000 + 120);
  };

  api.renderOffline = profile => {
    const sampleRate = 48000;
    const length = Math.ceil(sampleRate * profile.gesture.durationSec);
    const off = new OfflineAudioContext(2, length, sampleRate);
    const out = off.createGain();
    out.gain.value = .76;
    out.connect(off.destination);
    api.renderGraph(off, profile, out, 0);
    return off.startRendering();
  };

  api.renderGraph = (ctx, profile, destination, start) => {
    for(const partial of profile.partials) addPartial(ctx, profile, partial, destination, start);
    addNoise(ctx, profile, destination, start);
    addSurfaceEvents(ctx, profile, destination, start);
  };

  function addPartial(ctx, profile, partial, destination, start){
    const g = profile.gesture;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(partial.freqHz, start);

    if(g.drift > 0){
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(partial.driftRateHz, start);
      lfoGain.gain.value = partial.freqHz * (Math.pow(2, partial.driftCents / 1200) - 1);
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start(start);
      lfo.stop(start + g.durationSec);
    }

    const onset = start + partial.bloomDelaySec;
    const peak = clamp(partial.gain * .38, 0, .42);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, onset + g.attackSec);
    gain.gain.setTargetAtTime(peak * .55, onset + g.attackSec + g.bodySec * .25, Math.max(.03, partial.decaySec * .42));
    gain.gain.setTargetAtTime(0.0001, start + g.attackSec + g.bodySec, Math.max(.035, partial.decaySec));
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + g.durationSec);
  }

  function addNoise(ctx, profile, destination, start){
    const amount = profile.gesture.noise;
    if(amount <= .015) return;
    const len = Math.ceil(ctx.sampleRate * profile.gesture.durationSec);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for(let i=0;i<len;i++){
      const white = Math.random() * 2 - 1;
      last = last * .86 + white * .14;
      data[i] = profile.noiseLayer.color === "bright" ? white * .65 + last * .35 : last;
    }
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = buffer;
    filter.type = profile.noiseLayer.color === "bright" ? "highpass" : "bandpass";
    filter.frequency.value = profile.noiseLayer.color === "bright" ? 1600 : 780;
    filter.Q.value = profile.noiseLayer.color === "bright" ? .7 : 1.8;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(amount * .16, start + profile.gesture.attackSec);
    gain.gain.setTargetAtTime(0.0001, start + profile.gesture.attackSec + profile.gesture.bodySec, Math.max(.05, profile.gesture.tailSec * .38));
    src.connect(filter).connect(gain).connect(destination);
    src.start(start);
    src.stop(start + profile.gesture.durationSec);
  }

  function addSurfaceEvents(ctx, profile, destination, start){
    const mode = profile.surface;
    if(mode === "none") return;
    const g = profile.gesture;
    const count = {crystal:9, fire:18, lightning:13, rot:8}[mode] || 0;
    for(let i=0;i<count;i++){
      const partial = profile.partials[Math.min(profile.partials.length - 1, 2 + Math.floor(Math.random() * Math.max(1, profile.partials.length - 2)))] || profile.partials[profile.partials.length - 1];
      const t = surfaceTime(mode, i, count, g);
      const freq = partial.freqHz * (mode === "lightning" ? lerp(1.25, 2.8, Math.random()) : lerp(.92, 1.35, Math.random()));
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = mode === "rot" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, start + t);
      if(mode === "fire") osc.frequency.exponentialRampToValueAtTime(freq * lerp(.96, 1.08, Math.random()), start + t + .12);
      if(mode === "lightning") osc.frequency.exponentialRampToValueAtTime(freq * lerp(.65, 1.8, Math.random()), start + t + .025);
      const dur = {crystal:lerp(.06,.28,Math.random()), fire:lerp(.035,.18,Math.random()), lightning:lerp(.012,.075,Math.random()), rot:lerp(.08,.34,Math.random())}[mode];
      const amp = {crystal:.055, fire:.035, lightning:.065, rot:.045}[mode] * lerp(.55,1.2,Math.random()) * (mode === "rot" ? g.noise + .2 : g.bloom + .25);
      gain.gain.setValueAtTime(0, start + t);
      gain.gain.linearRampToValueAtTime(amp, start + t + Math.min(.012, dur * .3));
      gain.gain.exponentialRampToValueAtTime(.0001, start + t + dur);
      osc.connect(gain).connect(destination);
      osc.start(start + t);
      osc.stop(start + t + dur + .02);
    }
  }

  function surfaceTime(mode, i, count, gesture){
    if(mode === "lightning") return gesture.attackSec + Math.pow(i / count, 1.8) * .18 + Math.random() * .025;
    if(mode === "crystal") return gesture.attackSec + .04 + i * (gesture.bodySec + gesture.tailSec * .25) / count + Math.random() * .08;
    if(mode === "rot") return gesture.attackSec + gesture.bodySec * .55 + i * gesture.tailSec * .45 / count + Math.random() * .08;
    return gesture.attackSec + Math.random() * (gesture.bodySec + gesture.tailSec * .35);
  }
})();
