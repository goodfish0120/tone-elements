(function(){
  "use strict";

  const api = window.RatioPosition;

  api.drawFrequencyMap = (canvas, state) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(320, Math.round(rect.width * dpr));
    const height = Math.max(240, Math.round(rect.height * dpr));
    if(canvas.width !== width || canvas.height !== height){
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = width / dpr;
    const h = height / dpr;
    const pad = {l:48, r:24, t:30, b:38};
    const minHz = 30;
    const maxHz = 14000;
    const xForHz = hz => {
      const t = (Math.log2(hz) - Math.log2(minHz)) / (Math.log2(maxHz) - Math.log2(minHz));
      return pad.l + api.clamp(t, 0, 1) * (w - pad.l - pad.r);
    };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#050605";
    ctx.fillRect(0, 0, w, h);
    drawGrid(ctx, xForHz, h, pad);
    drawAnchor(ctx, state, xForHz, h, pad);
    drawCandidates(ctx, state, xForHz, h, pad);
    drawLayers(ctx, state, xForHz, h, pad);
  };

  function drawGrid(ctx, xForHz, h, pad){
    const ticks = [55, 110, 220, 440, 880, 1760, 3520, 7040, 14080];
    ctx.strokeStyle = "#18201b";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#667169";
    ctx.font = "11px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
    for(const hz of ticks){
      const x = xForHz(hz);
      ctx.beginPath();
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, h - pad.b);
      ctx.stroke();
      ctx.fillText(api.formatHz(hz), x - 14, h - 14);
    }
    ctx.strokeStyle = "#2d342f";
    ctx.beginPath();
    ctx.moveTo(pad.l, h - pad.b);
    ctx.lineTo(xForHz(14000), h - pad.b);
    ctx.stroke();
  }

  function drawAnchor(ctx, state, xForHz, h, pad){
    const x = xForHz(state.anchorHz);
    ctx.strokeStyle = "#69c7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, pad.t);
    ctx.lineTo(x, h - pad.b);
    ctx.stroke();
    ctx.fillStyle = "#69c7ff";
    ctx.font = "700 12px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
    ctx.fillText(`anchor ${api.formatHz(state.anchorHz)}Hz`, x + 7, pad.t + 14);
  }

  function drawCandidates(ctx, state, xForHz, h, pad){
    const y = pad.t + 72;
    const candidates = api.candidates(state);
    ctx.font = "11px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
    for(const candidate of candidates){
      const x = xForHz(candidate.frequencyHz);
      ctx.fillStyle = candidate.audible ? "#f6c85f" : "#665a36";
      ctx.beginPath();
      ctx.arc(x, y, candidate.audible ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = candidate.audible ? "#d9c178" : "#756a45";
      ctx.fillText(`k=${candidate.octave}`, x - 10, y + 19);
    }
  }

  function drawLayers(ctx, state, xForHz, h, pad){
    const layers = state.layers;
    const laneTop = pad.t + 150;
    const laneHeight = Math.max(24, Math.min(42, (h - pad.b - laneTop) / Math.max(1, layers.length)));
    ctx.font = "12px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
    layers.forEach((layer, index) => {
      const y = laneTop + index * laneHeight + laneHeight * .5;
      const x = xForHz(api.layerFrequency(state, layer));
      ctx.strokeStyle = layer.type === "anchor" ? "#69c7ff" : "#b899ff";
      ctx.globalAlpha = layer.enabled ? 1 : .32;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = layer.type === "anchor" ? "#69c7ff" : "#b899ff";
      ctx.beginPath();
      ctx.arc(x, y, 6 + layer.gain * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#dfe9dd";
      ctx.fillText(`${api.layerLabel(layer)}  ${api.formatHz(api.layerFrequency(state, layer))}Hz`, Math.min(x + 12, xForHz(14000) - 145), y + 4);
      ctx.globalAlpha = 1;
    });
  }
})();
