(function(){
  "use strict";

  const api = window.RatioPosition;
  let audioCtx = null;

  api.ensureAudio = async () => {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === "suspended") await audioCtx.resume();
    return audioCtx;
  };

  api.playState = async (state, onStatus) => {
    const ctx = await api.ensureAudio();
    const start = ctx.currentTime + .04;
    const out = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    out.gain.value = api.clamp(state.masterGain ?? .82, .03, 1.2);
    limiter.threshold.value = -12;
    limiter.knee.value = 10;
    limiter.ratio.value = 8;
    limiter.attack.value = .004;
    limiter.release.value = .18;
    out.connect(limiter).connect(ctx.destination);
    api.renderState(ctx, state, out, start);
    onStatus?.("playing");
    setTimeout(() => onStatus?.("ready"), api.duration(state) * 1000 + 160);
  };

  api.renderOffline = state => {
    const sampleRate = 48000;
    const duration = api.duration(state);
    const ctx = new OfflineAudioContext(2, Math.ceil(sampleRate * duration), sampleRate);
    const out = ctx.createGain();
    out.gain.value = api.clamp(state.masterGain ?? .82, .03, 1.2);
    out.connect(ctx.destination);
    api.renderState(ctx, state, out, 0);
    return ctx.startRendering();
  };

  api.renderState = (ctx, state, destination, startTime) => {
    for(const layer of api.activeLayers(state)){
      renderLayer(ctx, state, layer, destination, startTime);
    }
  };

  function renderLayer(ctx, state, layer, dest, baseTime){
    const freq = api.clamp(api.layerFrequency(state, layer), 10, 18000);
    const attack = api.clamp(layer.attack, .001, 1.2);
    const hold = api.clamp(layer.hold, .001, 4);
    const release = api.clamp(layer.release, .006, 4);
    const duration = attack + hold + release;
    const phase = ((Number(layer.phaseDeg) || 0) % 360 + 360) % 360;
    const t = baseTime + phase / 360 / freq;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = layer.wave || "sine";
    osc.frequency.setValueAtTime(freq, t);
    addDetuneLfo(ctx, osc.detune, t, duration, layer.lfoHz, layer.lfoCents);
    envelope(gain.gain, t, attack, hold, release, layer.gain);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + duration + .04);
  }

  function envelope(param, t, attack, hold, release, peak){
    const a = Math.max(.001, attack);
    const h = Math.max(.001, hold);
    const r = Math.max(.006, release);
    const p = Math.max(.0001, peak);
    param.cancelScheduledValues(t);
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(p, t + a);
    param.setValueAtTime(p, t + a + h);
    param.linearRampToValueAtTime(0, t + a + h + r);
  }

  function addDetuneLfo(ctx, target, t, duration, hz=0, cents=0){
    if(!hz || !cents) return;
    const lfo = ctx.createOscillator();
    const amount = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(api.clamp(Number(hz) || 0, .01, 40), t);
    amount.gain.value = api.clamp(Number(cents) || 0, -1200, 1200);
    lfo.connect(amount).connect(target);
    lfo.start(t);
    lfo.stop(t + duration + .04);
  }

  api.audioBufferToWav = buffer => {
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const samples = buffer.length;
    const ab = new ArrayBuffer(44 + samples * channels * 2);
    const view = new DataView(ab);
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + samples * channels * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, samples * channels * 2, true);
    let offset = 44;
    for(let i=0; i<samples; i++) for(let ch=0; ch<channels; ch++){
      const v = api.clamp(buffer.getChannelData(ch)[i], -1, 1);
      view.setInt16(offset, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      offset += 2;
    }
    return new Blob([view], {type:"audio/wav"});
  };

  function writeString(view, offset, text){
    for(let i=0; i<text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  }
})();
