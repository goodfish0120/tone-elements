(function(){
  "use strict";

  const api = window.SoundLab;
  const {clamp, map, mapLog} = api;

  api.drawProfile = (canvas, profile) => {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.floor(rect.width * dpr));
    canvas.height = Math.max(2, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const w = rect.width;
    const h = rect.height;
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0,0,w,h);
    drawGrid(ctx,w,h);

    const minF = profile.rootHz * .85;
    const maxF = Math.max(...profile.partials.map(p => p.freqHz)) * 1.35;
    const total = profile.gesture.durationSec;
    for(const partial of profile.partials) drawPartial(ctx, partial, minF, maxF, total, w, h);
    for(const relation of profile.relations) drawRelation(ctx, relation, profile.partials, minF, maxF, w, h);
    drawSurfaceHint(ctx, profile, w, h);
  };

  function drawPartial(ctx, partial, minF, maxF, total, w, h){
    const y = mapLog(partial.freqHz, minF, maxF, h - 42, 34);
    const x0 = map(partial.bloomDelaySec, 0, total, 34, w - 28);
    const x1 = w - 28;
    const hue = 190 + Math.min(90, partial.ratio * 14);
    const wiggle = Math.abs(partial.driftCents) * .45;
    ctx.strokeStyle = `hsla(${hue},90%,65%,${clamp(.22 + partial.gain, .25, .9)})`;
    ctx.lineWidth = 1 + partial.gain * 8;
    ctx.beginPath();
    for(let x=x0; x<=x1; x+=8){
      const t = map(x, 34, w - 28, 0, total);
      const yy = y + Math.sin(t * partial.driftRateHz * Math.PI * 2 + partial.ratio) * wiggle;
      x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
    ctx.fillStyle = "#eaf6ff";
    ctx.font = "11px -apple-system,BlinkMacSystemFont,sans-serif";
    ctx.fillText(`${partial.id} x${partial.ratio}`, 10, y + 4);
  }

  function drawRelation(ctx, relation, partials, minF, maxF, w, h){
    const a = partials.find(p => p.id === relation.a);
    const b = partials.find(p => p.id === relation.b);
    if(!a || !b) return;
    const ya = mapLog(a.freqHz, minF, maxF, h - 42, 34);
    const yb = mapLog(b.freqHz, minF, maxF, h - 42, 34);
    ctx.strokeStyle = "rgba(255,209,102,.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w - 56, ya);
    ctx.lineTo(w - 56, yb);
    ctx.stroke();
  }

  function drawGrid(ctx,w,h){
    ctx.strokeStyle = "rgba(145,160,181,.12)";
    ctx.lineWidth = 1;
    for(let i=0;i<=6;i++){
      const x = 34 + i * (w - 62) / 6;
      ctx.beginPath(); ctx.moveTo(x,20); ctx.lineTo(x,h-26); ctx.stroke();
    }
    for(let i=0;i<=5;i++){
      const y = 26 + i * (h - 62) / 5;
      ctx.beginPath(); ctx.moveTo(6,y); ctx.lineTo(w-10,y); ctx.stroke();
    }
  }

  function drawSurfaceHint(ctx, profile,w,h){
    if(profile.surface === "none") return;
    const color = {crystal:"rgba(92,200,255,.85)", fire:"rgba(255,184,77,.75)", lightning:"rgba(184,146,255,.85)", rot:"rgba(255,107,122,.7)"}[profile.surface];
    const count = {crystal:18, fire:44, lightning:22, rot:28}[profile.surface] || 0;
    ctx.fillStyle = color;
    for(let i=0;i<count;i++){
      const x = 42 + Math.random() * (w - 82);
      const y = 34 + Math.random() * (h - 82);
      const r = profile.surface === "lightning" ? Math.random() * 2.2 + .7 : Math.random() * 3.8 + .8;
      ctx.beginPath();
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
    }
  }
})();
