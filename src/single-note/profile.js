(function(){
  "use strict";

  const api = window.SoundLab;
  const {clamp, lerp} = api;

  api.buildProfile = controls => {
    const root = Number(controls.note.value);
    const mat = api.materialPresets[controls.material.value];
    const ratios = api.ratioSets[controls.geometry.value];
    const attack = Number(controls.attack.value) / 1000;
    const body = Number(controls.body.value) / 1000;
    const tail = Number(controls.tail.value) / 1000;
    const bloom = Number(controls.bloom.value) / 100;
    const drift = Number(controls.drift.value) / 100;
    const noise = clamp(Number(controls.noise.value) / 100 + mat.noise, 0, 1);
    const damping = clamp(Number(controls.damping.value) / 100 * .75 + mat.damp * .25, 0, 1);
    const duration = attack + body + tail + .25;

    const partials = ratios.map((ratio, i) => {
      const baseGain = mat.gain[i] ?? mat.gain[mat.gain.length - 1] * .65;
      const high = i / Math.max(1, ratios.length - 1);
      const bloomDelay = i === 0 ? 0 : bloom * lerp(.02, .34, high);
      const decay = Math.max(.08, (tail + body * .5) * mat.decay * lerp(1.25, .42, damping) * lerp(1.1, .65, high * damping));
      const bellBend = controls.geometry.value === "bell" ? i * 1.8 : 0;
      const detuneCents = drift * (Math.sin(i * 1.9 + root * .01) * lerp(1, 11, high) + bellBend);
      return {
        id:`P${i}`,
        ratio:Number(ratio.toFixed(5)),
        freqHz:Number((root * ratio).toFixed(2)),
        gain:Number((baseGain * lerp(.85, 1.5, bloom * high) * lerp(1, .7, damping * high)).toFixed(4)),
        decaySec:Number(decay.toFixed(3)),
        bloomDelaySec:Number(bloomDelay.toFixed(3)),
        driftCents:Number(detuneCents.toFixed(2)),
        driftRateHz:Number((lerp(.08, 1.7, drift) * (1 + i * .11)).toFixed(3))
      };
    });

    return {
      version:"0.1-prototype",
      mode:"single-note",
      rootHz:root,
      material:controls.material.value,
      geometry:controls.geometry.value,
      surface:controls.surface.value,
      gesture:{attackSec:attack, bodySec:body, tailSec:tail, durationSec:Number(duration.toFixed(3)), bloom, drift, noise, damping},
      partials,
      relations:api.buildRelations(partials),
      noiseLayer:{amount:Number(noise.toFixed(3)), color:mat.bright > .5 ? "bright" : damping > .55 ? "damped-low-mid" : "mid"},
      note:"single note only; identity + inner motion + result tail"
    };
  };

  api.buildRelations = partials => {
    const candidates = [[2,1],[3,2],[4,3],[5,4],[5,3],[5,2],[7,4],[7,5],[7,3],[7,2],[3,1],[4,1],[5,1],[7,1]];
    const out = [];
    for(let i=0;i<partials.length;i++) for(let j=i+1;j<partials.length;j++){
      const r = partials[j].freqHz / partials[i].freqHz;
      let best = null;
      for(const [a,b] of candidates){
        const target = a / b;
        const cents = 1200 * Math.log2(r / target);
        const score = Math.abs(cents) + (a + b) * .18;
        if(!best || score < best.score) best = {ratio:`${a}:${b}`, errorCents:cents, score};
      }
      if(Math.abs(best.errorCents) <= 42){
        out.push({a:partials[i].id, b:partials[j].id, ratio:best.ratio, errorCents:Number(best.errorCents.toFixed(1))});
      }
    }
    return out;
  };
})();
