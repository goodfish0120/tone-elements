(function(){
  "use strict";

  const api = window.RatioPosition = window.RatioPosition || {};

  api.notes = [
    ["G2", 98], ["C3", 130.81], ["G3", 196], ["A3", 220],
    ["C4", 261.63], ["E4", 329.63], ["A4", 440], ["C5", 523.25]
  ];

  api.ratioPresets = [
    ["1:1", 1, 1], ["2:1", 2, 1], ["3:2", 3, 2], ["5:4", 5, 4],
    ["6:7", 6, 7], ["7:6", 7, 6], ["7:4", 7, 4], ["9:8", 9, 8],
    ["11:8", 11, 8], ["13:8", 13, 8], ["5:3", 5, 3], ["8:5", 8, 5]
  ];

  api.createState = () => {
    const state = {
      version:"0.3-ratio-position",
      anchorHz:220,
      masterGain:.82,
      ratio:{numerator:6, denominator:7, offsetCents:0, octaveMin:-1, octaveMax:6},
      draft:{wave:"sine", gain:.22, attack:.018, hold:.42, release:.58, phaseDeg:0, lfoHz:.35, lfoCents:0},
      layers:[api.makeAnchorLayer()]
    };
    const starter = api.candidates(state).find(candidate => candidate.octave === 2) || api.candidates(state)[0];
    state.layers.push(api.makeResponseLayer(state, starter));
    return state;
  };

  api.makeAnchorLayer = () => ({
    id:"anchor",
    type:"anchor",
    enabled:true,
    solo:false,
    locked:true,
    numerator:1,
    denominator:1,
    octave:0,
    offsetCents:0,
    wave:"sine",
    gain:.30,
    attack:.025,
    hold:.72,
    release:.34,
    phaseDeg:0,
    lfoHz:0,
    lfoCents:0
  });

  api.makeResponseLayer = (state, candidate) => ({
    id:`r-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    type:"ratio",
    enabled:true,
    solo:false,
    locked:false,
    numerator:candidate.numerator,
    denominator:candidate.denominator,
    octave:candidate.octave,
    offsetCents:candidate.offsetCents,
    wave:state.draft.wave,
    gain:state.draft.gain,
    attack:state.draft.attack,
    hold:state.draft.hold,
    release:state.draft.release,
    phaseDeg:state.draft.phaseDeg,
    lfoHz:state.draft.lfoHz,
    lfoCents:state.draft.lfoCents
  });

  api.candidates = state => {
    const ratio = api.currentRatio(state);
    const low = Math.min(ratio.octaveMin, ratio.octaveMax);
    const high = Math.max(ratio.octaveMin, ratio.octaveMax);
    const result = [];
    for(let octave=low; octave<=high; octave++){
      const frequencyHz = api.frequencyFromRatio(
        state.anchorHz,
        ratio.numerator,
        ratio.denominator,
        octave,
        ratio.offsetCents
      );
      result.push({
        numerator:ratio.numerator,
        denominator:ratio.denominator,
        octave,
        offsetCents:ratio.offsetCents,
        frequencyHz,
        centsFromAnchor:api.centsFromAnchor(ratio.numerator, ratio.denominator, octave, ratio.offsetCents),
        audible:frequencyHz >= 20 && frequencyHz <= 12000
      });
    }
    return result;
  };

  api.currentRatio = state => ({
    numerator:api.clampInt(state.ratio.numerator, 1, 64),
    denominator:api.clampInt(state.ratio.denominator, 1, 64),
    offsetCents:api.clamp(Number(state.ratio.offsetCents) || 0, -1200, 1200),
    octaveMin:api.clampInt(state.ratio.octaveMin, -8, 12),
    octaveMax:api.clampInt(state.ratio.octaveMax, -8, 12)
  });

  api.frequencyFromRatio = (anchorHz, numerator, denominator, octave, cents=0) => {
    const anchor = api.clamp(Number(anchorHz) || 220, 10, 24000);
    const n = api.clamp(Number(numerator) || 1, 1, 128);
    const d = api.clamp(Number(denominator) || 1, 1, 128);
    return anchor * (n / d) * Math.pow(2, Number(octave) || 0) * Math.pow(2, (Number(cents) || 0) / 1200);
  };

  api.layerFrequency = (state, layer) => api.frequencyFromRatio(
    state.anchorHz,
    layer.numerator,
    layer.denominator,
    layer.octave,
    layer.offsetCents
  );

  api.layerLabel = layer => layer.type === "anchor"
    ? "1:1 k=0"
    : `${layer.numerator}:${layer.denominator} k=${layer.octave}`;

  api.layerRole = layer => layer.type === "anchor"
    ? "anchor"
    : `${layer.offsetCents >= 0 ? "+" : ""}${Math.round(layer.offsetCents)}c`;

  api.centsFromAnchor = (numerator, denominator, octave, cents=0) =>
    1200 * Math.log2((numerator / denominator) * Math.pow(2, octave)) + cents;

  api.duration = state => {
    const max = Math.max(...state.layers.map(layer => layer.enabled ? layer.attack + layer.hold + layer.release : 0), .25);
    return Number((max + .06).toFixed(3));
  };

  api.activeLayers = state => {
    const enabled = state.layers.filter(layer => layer.enabled);
    const solo = enabled.filter(layer => layer.solo);
    return solo.length ? solo : enabled;
  };

  api.profile = state => ({
    version:state.version,
    formula:"anchorHz * (numerator / denominator) * 2^octave * 2^(offsetCents / 1200)",
    anchorHz:state.anchorHz,
    masterGain:state.masterGain,
    ratio:api.currentRatio(state),
    durationSec:api.duration(state),
    layers:state.layers.map(layer => ({
      id:layer.id,
      enabled:layer.enabled,
      solo:layer.solo,
      type:layer.type,
      ratio:`${layer.numerator}/${layer.denominator}`,
      octave:layer.octave,
      offsetCents:layer.offsetCents,
      frequencyHz:Number(api.layerFrequency(state, layer).toFixed(4)),
      wave:layer.wave,
      gain:layer.gain,
      attack:layer.attack,
      hold:layer.hold,
      release:layer.release,
      phaseDeg:layer.phaseDeg,
      lfoHz:layer.lfoHz,
      lfoCents:layer.lfoCents
    }))
  });

  api.formatHz = hz => {
    if(hz >= 1000) return `${(hz / 1000).toFixed(hz >= 10000 ? 1 : 2)}k`;
    return hz.toFixed(hz >= 100 ? 1 : 2);
  };

  api.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  api.clampInt = (x, a, b) => Math.round(api.clamp(Number(x) || 0, a, b));
})();
