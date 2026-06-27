(function(){
  "use strict";

  const api = window.SoundLab;
  const $ = id => document.getElementById(id);
  const controlIds = ["note","material","geometry","attack","body","tail","bloom","drift","noise","damping","surface"];
  const controls = Object.fromEntries(controlIds.map(id => [id, $(id)]));
  const status = $("status");
  const canvas = $("viz");

  controlIds.forEach(id => controls[id].addEventListener("input", update));
  $("play").addEventListener("click", () => api.playProfile(currentProfile(), text => status.textContent = text));
  $("random").addEventListener("click", randomize);
  $("json").addEventListener("click", () => api.downloadText("single-note-profile.json", JSON.stringify(currentProfile(), null, 2)));
  $("wav").addEventListener("click", async () => {
    status.textContent = "rendering wav...";
    const buffer = await api.renderOffline(currentProfile());
    api.downloadBlob("single-note.wav", api.audioBufferToWav(buffer));
    status.textContent = "wav downloaded";
  });
  window.addEventListener("resize", update);

  function currentProfile(){
    return api.buildProfile(controls);
  }

  function update(){
    $("attackV").textContent = `${controls.attack.value} ms`;
    $("bodyV").textContent = `${controls.body.value} ms`;
    $("tailV").textContent = `${controls.tail.value} ms`;
    $("bloomV").textContent = `${controls.bloom.value}%`;
    $("driftV").textContent = `${controls.drift.value}%`;
    $("noiseV").textContent = `${controls.noise.value}%`;
    $("dampingV").textContent = `${controls.damping.value}%`;
    const profile = currentProfile();
    $("profile").textContent = JSON.stringify(profile, null, 2);
    $("mPartials").textContent = profile.partials.length;
    $("mRelations").textContent = profile.relations.length;
    $("mDuration").textContent = `${profile.gesture.durationSec.toFixed(2)}s`;
    $("mCharacter").textContent = `${api.labels[profile.material]} + ${api.labels[profile.geometry]}`;
    api.drawProfile(canvas, profile);
  }

  function randomize(){
    controls.note.value = api.pick(["196","220","261.63","329.63","440"]);
    controls.material.value = api.pick(Object.keys(api.materialPresets));
    controls.geometry.value = api.pick(Object.keys(api.ratioSets));
    controls.surface.value = api.pick(["none","crystal","fire","lightning","rot"]);
    controls.attack.value = Math.round(api.rand(4,120));
    controls.body.value = Math.round(api.rand(120,1200) / 10) * 10;
    controls.tail.value = Math.round(api.rand(160,2100) / 10) * 10;
    controls.bloom.value = Math.round(api.rand(0,92));
    controls.drift.value = Math.round(api.rand(0,72));
    controls.noise.value = Math.round(api.rand(0,64));
    controls.damping.value = Math.round(api.rand(8,88));
    update();
  }

  update();
})();
