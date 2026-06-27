(function(){
  "use strict";

  const api = window.LayerStack;

  api.drawTimeline = (canvas, stack) => {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.floor(rect.width * dpr));
    canvas.height = Math.max(2, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const w = rect.width;
    const h = rect.height;
    const padL = 126;
    const padR = 18;
    const padT = 24;
    const laneGap = 8;
    const duration = api.stackDuration(stack);
    const laneH = Math.max(46, (h - padT - 22 - laneGap * (stack.layers.length - 1)) / stack.layers.length);
    ctx.fillStyle = "#050605";
    ctx.fillRect(0,0,w,h);
    drawGrid(ctx, w, h, padL, padR, padT, duration);

    stack.layers.forEach((layer, i) => {
      const y = padT + i * (laneH + laneGap);
      drawLane(ctx, layer, stack, {x:padL, y, w:w - padL - padR, h:laneH}, duration);
    });
  };

  function drawLane(ctx, layer, stack, box, duration){
    const active = layer.enabled;
    const soloActive = stack.layers.some(l => l.enabled && l.solo);
    const audition = !soloActive || layer.solo;
    ctx.fillStyle = active && audition ? "rgba(255,255,255,.035)" : "rgba(255,255,255,.015)";
    roundRect(ctx, 8, box.y, box.x - 18, box.h, 8, true, false);
    ctx.fillStyle = active ? "#f2f5ef" : "rgba(242,245,239,.42)";
    ctx.font = "700 12px -apple-system,BlinkMacSystemFont,sans-serif";
    ctx.fillText(layer.name, 18, box.y + 18);
    ctx.fillStyle = layer.solo ? "#f6c85f" : "rgba(152,163,154,.9)";
    ctx.font = "11px -apple-system,BlinkMacSystemFont,sans-serif";
    ctx.fillText(layer.preset, 18, box.y + 35);

    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    const x0 = box.x + layer.start / duration * box.w;
    const x1 = box.x + (layer.start + layer.length) / duration * box.w;
    const color = layer.color;
    const alpha = active && audition ? .82 : .22;
    ctx.fillStyle = hexToRgba(color, alpha * .16);
    roundRect(ctx, x0, box.y + 6, Math.max(3, x1 - x0), box.h - 12, 8, true, false);
    ctx.strokeStyle = hexToRgba(color, alpha);
    ctx.lineWidth = layer.solo ? 2.4 : 1.3;
    roundRect(ctx, x0, box.y + 6, Math.max(3, x1 - x0), box.h - 12, 8, false, true);

    if(layer.kind === "harmonics") drawHarmonics(ctx, layer, stack, box, duration, alpha);
    if(layer.kind === "dots") drawDots(ctx, layer, stack, box, duration, alpha);
    if(layer.kind === "petals") drawPetals(ctx, layer, stack, box, duration, alpha);
    if(layer.kind === "tail") drawTail(ctx, layer, box, duration, alpha);
    if(layer.kind === "base" || layer.kind === "noise") drawEnvelope(ctx, layer, box, duration, alpha);
  }

  function drawHarmonics(ctx, layer, stack, box, duration, alpha){
    const nodes = api.buildHarmonicNodes(layer, stack.rootHz);
    nodes.forEach((node, i) => {
      const x = box.x + node.time / duration * box.w;
      const end = box.x + (node.time + node.duration) / duration * box.w;
      const y = box.y + 12 + (i + .5) * (box.h - 24) / nodes.length;
      ctx.strokeStyle = hexToRgba(layer.color, alpha * api.clamp(node.gain * 7, .25, 1));
      ctx.lineWidth = 1.4 + node.gain * 10;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(end, y + Math.sin(i * 2.1) * 4);
      ctx.stroke();
      ctx.fillStyle = "rgba(242,245,239,.8)";
      ctx.font = "10px -apple-system,BlinkMacSystemFont,sans-serif";
      if(end - x > 44) ctx.fillText(node.tag, x + 5, y - 4);
    });
  }

  function drawDots(ctx, layer, stack, box, duration, alpha){
    for(const ev of api.buildDotEvents(layer, stack)){
      const x = box.x + ev.time / duration * box.w;
      const y = box.y + 9 + api.clamp(Math.log(ev.freqHz / 160) / Math.log(10000 / 160), 0, 1) * (box.h - 18);
      ctx.fillStyle = hexToRgba(layer.color, alpha * .8);
      ctx.beginPath();
      ctx.arc(x, box.y + box.h - (y - box.y), ev.mode === "lightning" ? 2.8 : 2.1, 0, Math.PI * 2);
      ctx.fill();
      if(ev.mode === "lightning"){
        ctx.strokeStyle = hexToRgba(layer.color, alpha * .45);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, box.y + box.h - (y - box.y));
        ctx.lineTo(x + 10 * ev.sweep, box.y + box.h - (y - box.y) + (ev.sweep > 1 ? -8 : 8));
        ctx.stroke();
      }
    }
  }

  function drawPetals(ctx, layer, stack, box, duration, alpha){
    for(const ev of api.buildPetalEvents(layer, stack)){
      const x = box.x + ev.time / duration * box.w;
      const ww = Math.max(8, ev.duration / duration * box.w);
      const y = box.y + 10 + api.clamp(Math.log(ev.freqHz / 120) / Math.log(3000 / 120), 0, 1) * (box.h - 20);
      ctx.save();
      ctx.translate(x + ww / 2, box.y + box.h - (y - box.y));
      ctx.rotate((ev.endFreqHz > ev.freqHz ? -1 : 1) * .22);
      ctx.fillStyle = hexToRgba(layer.color, alpha * .24);
      ctx.strokeStyle = hexToRgba(layer.color, alpha * .78);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0,0,ww / 2,5 + ev.roughness * 6,0,0,Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawTail(ctx, layer, box, duration, alpha){
    const x = box.x + layer.start / duration * box.w;
    const ww = layer.length / duration * box.w;
    const grad = ctx.createLinearGradient(x,0,x+ww,0);
    grad.addColorStop(0, hexToRgba(layer.color, alpha * .32));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    roundRect(ctx, x, box.y + box.h * .28, ww, box.h * .44, 8, true, false);
  }

  function drawEnvelope(ctx, layer, box, duration, alpha){
    const x = box.x + layer.start / duration * box.w;
    const ww = layer.length / duration * box.w;
    const yMid = box.y + box.h / 2;
    ctx.strokeStyle = hexToRgba(layer.color, alpha * .72);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, yMid + 12);
    ctx.lineTo(x + ww * .12, yMid - 10);
    ctx.lineTo(x + ww * .72, yMid - 4);
    ctx.lineTo(x + ww, yMid + 12);
    ctx.stroke();
  }

  function drawGrid(ctx, w, h, padL, padR, padT, duration){
    ctx.strokeStyle = "rgba(255,255,255,.07)";
    ctx.lineWidth = 1;
    const lines = Math.max(4, Math.ceil(duration / .5));
    for(let i=0;i<=lines;i++){
      const t = duration * i / lines;
      const x = padL + (w - padL - padR) * i / lines;
      ctx.beginPath();
      ctx.moveTo(x, padT - 10);
      ctx.lineTo(x, h - 16);
      ctx.stroke();
      ctx.fillStyle = "rgba(152,163,154,.75)";
      ctx.font = "10px -apple-system,BlinkMacSystemFont,sans-serif";
      ctx.fillText(`${t.toFixed(1)}s`, x + 3, 14);
    }
  }

  function hexToRgba(hex, alpha){
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;
  }

  function roundRect(ctx,x,y,w,h,r,fill,stroke){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    if(fill) ctx.fill();
    if(stroke) ctx.stroke();
  }
})();
