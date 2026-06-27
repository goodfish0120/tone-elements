(function(){
  "use strict";

  const api = window.LayerStack = window.LayerStack || {};

  api.notes = [
    ["G3 196Hz",196], ["A3 220Hz",220], ["C4 261.63Hz",261.63],
    ["E4 329.63Hz",329.63], ["A4 440Hz",440]
  ];

  api.layerDefs = {
    base:{
      label:"Base tone", role:"基準音：穩定、晃動或回彈", color:"#69c7ff",
      presets:{
        steady:{label:"stable line", params:{wave:"sine", attack:.025, release:.22, wobbleHz:0, wobbleCents:0, driftCents:0, bendFrom:0, bendTo:0}},
        wobble:{label:"slow wobble", params:{wave:"sine", attack:.03, release:.28, wobbleHz:.72, wobbleCents:9, driftCents:4, bendFrom:0, bendTo:5}},
        bounce:{label:"elastic bend", params:{wave:"triangle", attack:.012, release:.2, wobbleHz:2.4, wobbleCents:5, driftCents:0, bendFrom:-42, bendTo:0}},
        unstable:{label:"unstable core", params:{wave:"sine", attack:.02, release:.35, wobbleHz:1.3, wobbleCents:18, driftCents:-16, bendFrom:10, bendTo:-12}}
      }
    },
    harmonics:{
      label:"Harmonics", role:"比例、跨八度、detune、各自衰退", color:"#f6c85f",
      presets:{
        clean235:{label:"clean 2/3/5 spread", params:{detuneScale:2, nodes:[
          {ratio:2, octave:0, cents:0, gain:.20, start:.02, attack:.015, release:.55, tag:"2:1"},
          {ratio:3/2, octave:1, cents:2, gain:.14, start:.10, attack:.025, release:.85, tag:"3:2 +8"},
          {ratio:5/4, octave:2, cents:-1, gain:.10, start:.16, attack:.018, release:1.05, tag:"5:4 +16"},
          {ratio:5/2, octave:1, cents:3, gain:.08, start:.24, attack:.012, release:.72, tag:"5:2 +8"}
        ]}},
        wide357:{label:"wide 3/5/7 geometry", params:{detuneScale:8, nodes:[
          {ratio:3/2, octave:0, cents:0, gain:.16, start:.05, attack:.02, release:.7, tag:"3:2"},
          {ratio:5/4, octave:1, cents:4, gain:.13, start:.14, attack:.02, release:1.0, tag:"5:4 +8"},
          {ratio:7/4, octave:1, cents:-6, gain:.10, start:.22, attack:.03, release:.9, tag:"7:4 +8"},
          {ratio:7/3, octave:2, cents:8, gain:.07, start:.30, attack:.018, release:.62, tag:"7:3 +16"}
        ]}},
        detunedMetal:{label:"detuned metal peaks", params:{detuneScale:16, nodes:[
          {ratio:2.01, octave:0, cents:0, gain:.18, start:.00, attack:.01, release:1.1, tag:"2.01"},
          {ratio:2.72, octave:0, cents:-7, gain:.14, start:.08, attack:.014, release:1.25, tag:"2.72"},
          {ratio:3.83, octave:0, cents:11, gain:.11, start:.18, attack:.018, release:1.0, tag:"3.83"},
          {ratio:7/4, octave:2, cents:-14, gain:.08, start:.25, attack:.02, release:.82, tag:"7:4 +16"}
        ]}}
      }
    },
    dots:{
      label:"Dots", role:"水晶點、閃電點、碎裂點", color:"#b899ff",
      presets:{
        crystal:{label:"crystal sparks", params:{mode:"crystal", count:16, minDur:.025, maxDur:.12, minHz:1200, maxHz:7600, spread:"ratio"}},
        lightning:{label:"lightning branches", params:{mode:"lightning", count:22, minDur:.012, maxDur:.07, minHz:480, maxHz:6200, spread:"cluster"}},
        crackle:{label:"dirty crackle", params:{mode:"crackle", count:24, minDur:.018, maxDur:.09, minHz:220, maxHz:3300, spread:"random"}}
      }
    },
    petals:{
      label:"Petals", role:"片狀表面事件：展開、滑動、收掉", color:"#ff9c48",
      presets:{
        fire:{label:"fire leaf petals", params:{mode:"fire", count:24, minDur:.08, maxDur:.26, minHz:260, maxHz:2400, sweepMin:1.04, sweepMax:1.46, roughness:.55}},
        ember:{label:"slow ember petals", params:{mode:"ember", count:12, minDur:.16, maxDur:.42, minHz:180, maxHz:1350, sweepMin:.86, sweepMax:1.18, roughness:.35}}
      }
    },
    noise:{
      label:"Noise surface", role:"摩擦、氣、髒、火焰底色", color:"#73d483",
      presets:{
        air:{label:"soft air", params:{color:"bandpass", frequency:1300, q:.85, roughness:.18, attack:.06, release:.32}},
        friction:{label:"dry friction", params:{color:"bandpass", frequency:720, q:2.2, roughness:.62, attack:.018, release:.24}},
        dirty:{label:"dirty surface", params:{color:"lowpass", frequency:1150, q:1.1, roughness:.9, attack:.035, release:.48}}
      }
    },
    tail:{
      label:"Tail result", role:"最後的結果，一定淡到 0", color:"#ff6578",
      presets:{
        clean:{label:"clean fade", params:{mode:"clean", partials:[{ratio:2, octave:1, gain:.12, cents:0},{ratio:5/4, octave:2, gain:.08, cents:1}], noise:.00, drift:1}},
        shimmer:{label:"shimmer fade", params:{mode:"shimmer", partials:[{ratio:5/4, octave:2, gain:.10, cents:3},{ratio:3/2, octave:3, gain:.07, cents:-2}], noise:.02, drift:5}},
        rotten:{label:"rotten fade", params:{mode:"rotten", partials:[{ratio:7/4, octave:0, gain:.12, cents:-18},{ratio:9/5, octave:1, gain:.07, cents:23}], noise:.20, drift:22}},
        fracture:{label:"fracture fade", params:{mode:"fracture", partials:[{ratio:2.1, octave:1, gain:.10, cents:0},{ratio:3.7, octave:1, gain:.08, cents:14}], noise:.12, drift:18}}
      }
    }
  };

  api.recipes = [
    {id:"fire_petals", label:"Fire Petals", sub:"先看葉片感", rootHz:220, masterGain:.9, layers:[
      ["base","wobble",{gain:.36,start:0,length:1.9,strength:.52}],
      ["harmonics","clean235",{gain:.18,start:.05,length:1.8,strength:.48}],
      ["dots","crystal",{enabled:false,gain:.18,start:.12,length:1.45,strength:.32}],
      ["petals","fire",{gain:.72,start:.08,length:1.7,strength:.9}],
      ["noise","air",{gain:.28,start:.04,length:1.8,strength:.55}],
      ["tail","clean",{gain:.22,start:1.18,length:.9,strength:.55}]
    ]},
    {id:"crystal_dots", label:"Crystal Dots", sub:"高頻點點", rootHz:261.63, masterGain:.86, layers:[
      ["base","steady",{gain:.24,start:0,length:1.7,strength:.45}],
      ["harmonics","clean235",{gain:.42,start:.02,length:1.8,strength:.75}],
      ["dots","crystal",{gain:.78,start:.05,length:1.55,strength:.9}],
      ["petals","fire",{enabled:false,gain:.2,start:.2,length:1.2,strength:.25}],
      ["noise","air",{gain:.12,start:0,length:1.8,strength:.22}],
      ["tail","shimmer",{gain:.48,start:.78,length:1.15,strength:.8}]
    ]},
    {id:"lightning_branch", label:"Lightning Branch", sub:"分叉短事件", rootHz:196, masterGain:.92, layers:[
      ["base","bounce",{gain:.18,start:0,length:.55,strength:.6}],
      ["harmonics","wide357",{gain:.24,start:.02,length:.9,strength:.62}],
      ["dots","lightning",{gain:.9,start:.02,length:.72,strength:1}],
      ["petals","ember",{enabled:false,gain:.1,start:.18,length:.7,strength:.2}],
      ["noise","friction",{gain:.28,start:.02,length:.7,strength:.55}],
      ["tail","fracture",{gain:.34,start:.45,length:.72,strength:.78}]
    ]},
    {id:"rotten_harvest", label:"Rotten Harvest", sub:"髒尾巴", rootHz:220, masterGain:.9, layers:[
      ["base","unstable",{gain:.34,start:0,length:1.45,strength:.72}],
      ["harmonics","wide357",{gain:.38,start:.04,length:1.5,strength:.7}],
      ["dots","crackle",{gain:.42,start:.22,length:1.3,strength:.74}],
      ["petals","ember",{gain:.28,start:.28,length:1.25,strength:.45}],
      ["noise","dirty",{gain:.54,start:.08,length:1.85,strength:.86}],
      ["tail","rotten",{gain:.72,start:.82,length:1.3,strength:1}]
    ]},
    {id:"rare_pickup", label:"Rare Pickup", sub:"短攻擊 + 清亮尾巴", rootHz:329.63, masterGain:.86, layers:[
      ["base","bounce",{gain:.25,start:0,length:.9,strength:.7}],
      ["harmonics","clean235",{gain:.55,start:.02,length:1.5,strength:.85}],
      ["dots","crystal",{gain:.72,start:.05,length:.95,strength:.78}],
      ["petals","fire",{enabled:false,gain:.16,start:.2,length:.8,strength:.25}],
      ["noise","air",{gain:.08,start:0,length:1.1,strength:.2}],
      ["tail","shimmer",{gain:.44,start:.44,length:1.2,strength:.78}]
    ]}
  ];

  api.clone = value => JSON.parse(JSON.stringify(value));
  api.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  api.lerp = (a, b, t) => a + (b - a) * t;
  api.freqFromRatio = (rootHz, ratio, octave, cents=0) => rootHz * ratio * Math.pow(2, octave) * Math.pow(2, cents / 1200);

  api.makeStack = recipeId => {
    const recipe = api.recipes.find(r => r.id === recipeId) || api.recipes[0];
    return {
      version:"0.2-layer-stack",
      title:recipe.label,
      recipe:recipe.id,
      rootHz:recipe.rootHz,
      masterGain:recipe.masterGain,
      seed:api.hashString(recipe.id),
      layers:recipe.layers.map((spec, index) => api.makeLayer(spec[0], spec[1], spec[2] || {}, index))
    };
  };

  api.makeLayer = (kind, preset, overrides={}, index=0) => {
    const def = api.layerDefs[kind];
    const chosen = def.presets[preset] ? preset : Object.keys(def.presets)[0];
    return {
      id:`${kind}-${index}`,
      kind,
      preset:chosen,
      name:def.label,
      role:def.role,
      color:def.color,
      enabled:overrides.enabled ?? true,
      solo:false,
      gain:overrides.gain ?? .5,
      start:overrides.start ?? 0,
      length:overrides.length ?? 1.2,
      strength:overrides.strength ?? .7,
      params:api.clone(def.presets[chosen].params)
    };
  };

  api.applyPreset = layer => {
    layer.params = api.clone(api.layerDefs[layer.kind].presets[layer.preset].params);
  };

  api.stackDuration = stack => {
    const end = Math.max(...stack.layers.map(layer => layer.enabled ? layer.start + layer.length : 0), 1);
    return Number((end + .08).toFixed(3));
  };

  api.activeLayers = stack => {
    const enabled = stack.layers.filter(layer => layer.enabled);
    const solo = enabled.filter(layer => layer.solo);
    return solo.length ? solo : enabled;
  };

  api.eventSummary = stack => {
    let count = 0;
    for(const layer of stack.layers){
      if(layer.kind === "harmonics") count += api.buildHarmonicNodes(layer, stack.rootHz).length;
      if(layer.kind === "dots") count += api.buildDotEvents(layer, stack).length;
      if(layer.kind === "petals") count += api.buildPetalEvents(layer, stack).length;
      if(layer.kind === "tail") count += layer.params.partials.length;
      if(layer.kind === "base" || layer.kind === "noise") count += 1;
    }
    return count;
  };

  api.buildHarmonicNodes = (layer, rootHz) => {
    return layer.params.nodes.map((node, i) => {
      const extra = (i - layer.params.nodes.length / 2) * layer.params.detuneScale * (layer.strength - .5) * .12;
      const cents = node.cents + extra;
      const start = layer.start + node.start * layer.length;
      return {
        ...node,
        id:`H${i}`,
        cents,
        time:start,
        duration:Math.max(.08, layer.start + layer.length - start),
        freqHz:api.freqFromRatio(rootHz, node.ratio, node.octave, cents),
        gain:node.gain * layer.gain * api.lerp(.45, 1.35, layer.strength)
      };
    });
  };

  api.buildDotEvents = (layer, stack) => {
    const p = layer.params;
    const rng = api.rng(stack.seed + api.hashString(layer.id + layer.preset));
    const count = Math.max(1, Math.round(p.count * api.lerp(.35, 1.35, layer.strength)));
    const events = [];
    const ratios = [1, 5/4, 3/2, 7/4, 2, 5/2, 3, 4, 5];
    for(let i=0;i<count;i++){
      const cluster = p.spread === "cluster" ? Math.floor(i / Math.max(2, count / 4)) : 0;
      const baseT = p.spread === "cluster" ? (cluster / 4) + rng() * .11 : rng();
      const time = layer.start + api.clamp(baseT, 0, .98) * layer.length;
      const dur = api.lerp(p.minDur, p.maxDur, rng()) * api.lerp(.75, 1.25, layer.strength);
      let freq;
      if(p.spread === "ratio"){
        const ratio = ratios[Math.floor(rng() * ratios.length)];
        const octave = 1 + Math.floor(rng() * 4);
        freq = api.freqFromRatio(stack.rootHz, ratio, octave, api.lerp(-9, 9, rng()));
      }else{
        freq = api.lerp(p.minHz, p.maxHz, Math.pow(rng(), p.mode === "lightning" ? .62 : 1.2));
      }
      events.push({
        id:`D${i}`,
        time,
        duration:dur,
        freqHz:api.clamp(freq, 90, 11000),
        gain:layer.gain * api.lerp(.025, .11, rng()) * api.lerp(.75, 1.55, layer.strength),
        sweep:p.mode === "lightning" ? api.lerp(.55, 2.2, rng()) : api.lerp(.92, 1.18, rng()),
        mode:p.mode
      });
    }
    return events.sort((a,b) => a.time - b.time);
  };

  api.buildPetalEvents = (layer, stack) => {
    const p = layer.params;
    const rng = api.rng(stack.seed + api.hashString(layer.id + layer.preset));
    const count = Math.max(1, Math.round(p.count * api.lerp(.3, 1.25, layer.strength)));
    const events = [];
    for(let i=0;i<count;i++){
      const time = layer.start + rng() * Math.max(.01, layer.length - p.maxDur * .45);
      const duration = api.lerp(p.minDur, p.maxDur, rng());
      const freq = api.lerp(p.minHz, p.maxHz, Math.pow(rng(), .75));
      events.push({
        id:`P${i}`,
        time,
        duration,
        freqHz:freq,
        endFreqHz:freq * api.lerp(p.sweepMin, p.sweepMax, rng()),
        gain:layer.gain * api.lerp(.025, .09, rng()) * api.lerp(.75, 1.5, layer.strength),
        roughness:p.roughness,
        mode:p.mode
      });
    }
    return events.sort((a,b) => a.time - b.time);
  };

  api.hashString = text => {
    let h = 2166136261;
    for(let i=0;i<String(text).length;i++){
      h ^= String(text).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  api.rng = seed => {
    let x = seed >>> 0 || 123456789;
    return () => {
      x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
      return ((x >>> 0) / 4294967296);
    };
  };
})();
