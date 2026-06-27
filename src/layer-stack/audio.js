(function(){
  "use strict";

  const api = window.LayerStack;
  let audioCtx = null;

  api.ensureAudio = async () => {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === "suspended") await audioCtx.resume();
    return audioCtx;
  };

  api.playStack = async (stack, onStatus) => {
    const ctx = await api.ensureAudio();
    const start = ctx.currentTime + .04;
    const out = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    out.gain.value = api.clamp(stack.masterGain ?? .86, .05, 1.25);
    limiter.threshold.value = -11;
    limiter.knee.value = 10;
    limiter.ratio.value = 9;
    limiter.attack.value = .004;
    limiter.release.value = .18;
    out.connect(limiter).connect(ctx.destination);
    api.renderStack(ctx, stack, out, start);
    onStatus?.("playing");
    setTimeout(() => onStatus?.("ready"), api.stackDuration(stack) * 1000 + 150);
  };

  api.renderOffline = stack => {
    const sampleRate = 48000;
    const duration = api.stackDuration(stack);
    const ctx = new OfflineAudioContext(2, Math.ceil(sampleRate * duration), sampleRate);
    const out = ctx.createGain();
    out.gain.value = api.clamp(stack.masterGain ?? .86, .05, 1.25);
    out.connect(ctx.destination);
    api.renderStack(ctx, stack, out, 0);
    return ctx.startRendering();
  };

  api.renderStack = (ctx, stack, destination, startTime) => {
    for(const layer of api.activeLayers(stack)){
      if(layer.kind === "base") renderBase(ctx, stack, layer, destination, startTime);
      if(layer.kind === "harmonics") renderHarmonics(ctx, stack, layer, destination, startTime);
      if(layer.kind === "dots") renderDots(ctx, stack, layer, destination, startTime);
      if(layer.kind === "petals") renderPetals(ctx, stack, layer, destination, startTime);
      if(layer.kind === "noise") renderNoise(ctx, layer, destination, startTime);
      if(layer.kind === "tail") renderTail(ctx, stack, layer, destination, startTime);
    }
  };

  function renderBase(ctx, stack, layer, dest, baseTime){
    const p = layer.params;
    const t = baseTime + layer.start;
    const dur = Math.max(.06, layer.length);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = p.wave || "sine";
    osc.frequency.setValueAtTime(stack.rootHz, t);
    osc.detune.setValueAtTime((p.bendFrom || 0) + (p.driftCents || 0), t);
    osc.detune.linearRampToValueAtTime((p.bendTo || 0) + (p.driftCents || 0), t + dur);
    addDetuneLfo(ctx, osc.detune, t, dur, p.wobbleHz, p.wobbleCents * api.lerp(.35, 1.35, layer.strength));
    envelope(gain.gain, t, dur, layer.gain * api.lerp(.45, 1.2, layer.strength), p.attack, p.release);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + dur + .03);
  }

  function renderHarmonics(ctx, stack, layer, dest, baseTime){
    for(const node of api.buildHarmonicNodes(layer, stack.rootHz)){
      const t = baseTime + node.time;
      const dur = Math.max(.05, node.duration);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(node.freqHz, t);
      addDetuneLfo(ctx, osc.detune, t, dur, .2 + node.ratio * .07, Math.abs(node.cents) * .16 * layer.strength);
      envelope(gain.gain, t, dur, node.gain, node.attack, node.release);
      osc.connect(gain).connect(dest);
      osc.start(t);
      osc.stop(t + dur + .03);
    }
  }

  function renderDots(ctx, stack, layer, dest, baseTime){
    for(const ev of api.buildDotEvents(layer, stack)){
      const t = baseTime + ev.time;
      const dur = Math.max(.012, ev.duration);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = ev.mode === "crackle" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(ev.freqHz, t);
      const target = api.clamp(ev.freqHz * ev.sweep, 40, 12000);
      if(Math.abs(target - ev.freqHz) > 4) osc.frequency.exponentialRampToValueAtTime(target, t + dur * .72);
      envelope(gain.gain, t, dur, ev.gain, Math.min(.01, dur * .25), Math.max(.01, dur * .7));
      osc.connect(gain).connect(dest);
      osc.start(t);
      osc.stop(t + dur + .02);
    }
  }

  function renderPetals(ctx, stack, layer, dest, baseTime){
    for(const ev of api.buildPetalEvents(layer, stack)){
      const t = baseTime + ev.time;
      const dur = Math.max(.04, ev.duration);
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      noise.buffer = makeNoiseBuffer(ctx, dur, ev.roughness);
      filter.type = "bandpass";
      filter.Q.value = ev.mode === "fire" ? 2.4 : 1.35;
      filter.frequency.setValueAtTime(ev.freqHz, t);
      filter.frequency.exponentialRampToValueAtTime(api.clamp(ev.endFreqHz, 80, 9000), t + dur * .82);
      envelope(gain.gain, t, dur, ev.gain, dur * .22, dur * .58);
      noise.connect(filter).connect(gain).connect(dest);
      noise.start(t);
      noise.stop(t + dur + .03);

      const tone = ctx.createOscillator();
      const toneGain = ctx.createGain();
      tone.type = "sine";
      tone.frequency.setValueAtTime(api.clamp(ev.freqHz * .5, 70, 4000), t);
      tone.frequency.exponentialRampToValueAtTime(api.clamp(ev.endFreqHz * .45, 70, 5000), t + dur * .75);
      envelope(toneGain.gain, t, dur, ev.gain * .34, dur * .26, dur * .54);
      tone.connect(toneGain).connect(dest);
      tone.start(t);
      tone.stop(t + dur + .03);
    }
  }

  function renderNoise(ctx, layer, dest, baseTime){
    const p = layer.params;
    const t = baseTime + layer.start;
    const dur = Math.max(.08, layer.length);
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = makeNoiseBuffer(ctx, dur, p.roughness);
    filter.type = p.color || "bandpass";
    filter.frequency.value = p.frequency;
    filter.Q.value = p.q;
    envelope(gain.gain, t, dur, layer.gain * api.lerp(.04, .22, layer.strength), p.attack, p.release);
    src.connect(filter).connect(gain).connect(dest);
    src.start(t);
    src.stop(t + dur + .03);
  }

  function renderTail(ctx, stack, layer, dest, baseTime){
    const p = layer.params;
    const t = baseTime + layer.start;
    const dur = Math.max(.08, layer.length);
    for(const partial of p.partials){
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = p.mode === "rotten" ? "triangle" : "sine";
      const freq = api.freqFromRatio(stack.rootHz, partial.ratio, partial.octave, partial.cents);
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.setValueAtTime(0, t);
      osc.detune.linearRampToValueAtTime((p.drift || 0) * (partial.cents >= 0 ? 1 : -1), t + dur * .8);
      addDetuneLfo(ctx, osc.detune, t, dur, .38 + Math.abs(partial.cents) * .015, (p.drift || 0) * .18);
      envelope(gain.gain, t, dur, partial.gain * layer.gain * api.lerp(.55, 1.45, layer.strength), .035, Math.max(.08, dur * .72));
      osc.connect(gain).connect(dest);
      osc.start(t);
      osc.stop(t + dur + .03);
    }
    if(p.noise > 0){
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      src.buffer = makeNoiseBuffer(ctx, dur, api.clamp(p.noise * 2.8, .15, .95));
      filter.type = p.mode === "rotten" ? "bandpass" : "highpass";
      filter.frequency.value = p.mode === "rotten" ? 520 : 1800;
      filter.Q.value = p.mode === "rotten" ? 1.7 : .7;
      envelope(gain.gain, t, dur, p.noise * layer.gain * .28 * api.lerp(.7, 1.45, layer.strength), .06, dur * .75);
      src.connect(filter).connect(gain).connect(dest);
      src.start(t);
      src.stop(t + dur + .03);
    }
  }

  function envelope(param, t, dur, peak, attack=.02, release=.2){
    const a = api.clamp(attack, .001, dur * .45);
    const r = api.clamp(release, .006, dur * .92);
    const end = t + dur;
    const releaseStart = Math.max(t + a, end - r);
    param.cancelScheduledValues(t);
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(Math.max(.0001, peak), t + a);
    param.setValueAtTime(Math.max(.0001, peak), releaseStart);
    param.linearRampToValueAtTime(0, end);
  }

  function addDetuneLfo(ctx, target, t, dur, hz=0, cents=0){
    if(!hz || !cents) return;
    const lfo = ctx.createOscillator();
    const amount = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(hz, t);
    amount.gain.value = cents;
    lfo.connect(amount).connect(target);
    lfo.start(t);
    lfo.stop(t + dur + .03);
  }

  function makeNoiseBuffer(ctx, duration, roughness=.5){
    const length = Math.max(16, Math.ceil(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    const mix = api.clamp(roughness, .05, .98);
    for(let i=0;i<length;i++){
      const white = Math.random() * 2 - 1;
      last = last * (1 - mix) + white * mix;
      data[i] = last;
    }
    return buffer;
  }

  api.audioBufferToWav = buffer => {
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const samples = buffer.length;
    const ab = new ArrayBuffer(44 + samples * channels * 2);
    const view = new DataView(ab);
    writeString(view,0,"RIFF");
    view.setUint32(4,36 + samples * channels * 2,true);
    writeString(view,8,"WAVE");
    writeString(view,12,"fmt ");
    view.setUint32(16,16,true);
    view.setUint16(20,1,true);
    view.setUint16(22,channels,true);
    view.setUint32(24,sampleRate,true);
    view.setUint32(28,sampleRate * channels * 2,true);
    view.setUint16(32,channels * 2,true);
    view.setUint16(34,16,true);
    writeString(view,36,"data");
    view.setUint32(40,samples * channels * 2,true);
    let offset = 44;
    for(let i=0;i<samples;i++) for(let ch=0;ch<channels;ch++){
      const v = api.clamp(buffer.getChannelData(ch)[i], -1, 1);
      view.setInt16(offset, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      offset += 2;
    }
    return new Blob([view], {type:"audio/wav"});
  };

  function writeString(view, offset, text){
    for(let i=0;i<text.length;i++) view.setUint8(offset+i, text.charCodeAt(i));
  }
})();
