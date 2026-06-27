(function(){
  "use strict";

  const api = window.SoundLab = window.SoundLab || {};

  api.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  api.lerp = (a, b, t) => a + (b - a) * t;
  api.map = (x, a, b, c, d) => c + (d - c) * ((x - a) / (b - a));
  api.mapLog = (x, a, b, c, d) => api.map(Math.log(x / a) / Math.log(b / a), 0, 1, c, d);
  api.pick = xs => xs[Math.floor(Math.random() * xs.length)];
  api.rand = (a, b) => a + Math.random() * (b - a);

  api.downloadBlob = (name, blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  };

  api.downloadText = (name, text) => {
    api.downloadBlob(name, new Blob([text], {type:"application/json"}));
  };
})();
