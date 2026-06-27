(function(){
  "use strict";

  window.SoundLab = window.SoundLab || {};

  window.SoundLab.ratioSets = {
    simple: [1, 2, 3, 5 / 2, 4, 5, 6],
    seven: [1, 7 / 4, 2, 7 / 3, 3, 7 / 2, 5],
    bell: [1, 2.01, 2.72, 3.83, 5.41, 7.18, 9.02],
    sparse: [1, 2, 3, 5]
  };

  window.SoundLab.materialPresets = {
    fork: {gain:[1,.06,.025,.012,.008,.004,.003], decay:1.1, bright:.15, damp:.18, noise:.00},
    crystal: {gain:[.75,.18,.14,.22,.16,.11,.08], decay:1.35, bright:.8, damp:.12, noise:.02},
    metal: {gain:[.85,.42,.35,.26,.2,.16,.12], decay:1.8, bright:.55, damp:.18, noise:.05},
    leather: {gain:[.85,.18,.08,.035,.018,.01,.006], decay:.42, bright:.12, damp:.78, noise:.18},
    organic: {gain:[.8,.26,.18,.09,.055,.035,.02], decay:.9, bright:.28, damp:.48, noise:.16}
  };

  window.SoundLab.labels = {
    fork:"乾淨", crystal:"水晶", metal:"金屬", leather:"皮革", organic:"有機",
    simple:"2/3/5", seven:"7系", bell:"鐘狀", sparse:"稀疏"
  };
})();
