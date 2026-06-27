(function(){
  "use strict";

  const api = window.LayerStack;
  const $ = id => document.getElementById(id);
  const ui = {
    recipes:$("recipes"),
    root:$("rootNote"),
    master:$("masterGain"),
    play:$("play"),
    randomize:$("randomize"),
    json:$("json"),
    wav:$("wav"),
    status:$("status"),
    timeline:$("timeline"),
    layerList:$("layerList"),
    profile:$("profile"),
    sumLayers:$("sumLayers"),
    sumEvents:$("sumEvents"),
    sumDuration:$("sumDuration"),
    sumSolo:$("sumSolo")
  };

  let stack = api.makeStack("fire_petals");

  init();

  function init(){
    ui.root.innerHTML = api.notes.map(([label, hz]) => `<option value="${hz}">${label}</option>`).join("");
    buildRecipes();
    bindTransport();
    render();
    window.addEventListener("resize", render);
  }

  function buildRecipes(){
    ui.recipes.innerHTML = api.recipes.map(recipe => `
      <button class="recipe" data-recipe="${recipe.id}">
        <b>${recipe.label}</b>
        <span>${recipe.sub}</span>
      </button>
    `).join("");
    ui.recipes.querySelectorAll("[data-recipe]").forEach(btn => {
      btn.addEventListener("click", () => {
        stack = api.makeStack(btn.dataset.recipe);
        render();
      });
    });
  }

  function bindTransport(){
    ui.root.addEventListener("input", () => {
      stack.rootHz = Number(ui.root.value);
      render();
    });
    ui.master.addEventListener("input", () => {
      stack.masterGain = Number(ui.master.value) / 100;
      render();
    });
    ui.play.addEventListener("click", () => api.playStack(stack, text => ui.status.textContent = text));
    ui.randomize.addEventListener("click", () => {
      const rng = api.rng(Date.now() % 4294967295);
      stack.seed = api.hashString(`${stack.recipe}-${Date.now()}`);
      for(const layer of stack.layers){
        if(!layer.enabled) continue;
        layer.strength = api.clamp(layer.strength * api.lerp(.82, 1.18, rng()), .05, 1);
        layer.gain = api.clamp(layer.gain * api.lerp(.84, 1.16, rng()), .03, 1);
      }
      render();
    });
    ui.json.addEventListener("click", () => downloadText("layer-stack-profile.json", JSON.stringify(exportProfile(), null, 2)));
    ui.wav.addEventListener("click", async () => {
      ui.status.textContent = "rendering wav...";
      const buffer = await api.renderOffline(stack);
      downloadBlob("layer-stack.wav", api.audioBufferToWav(buffer));
      ui.status.textContent = "wav downloaded";
    });
  }

  function render(){
    ui.root.value = String(stack.rootHz);
    ui.master.value = String(Math.round((stack.masterGain ?? .86) * 100));
    document.querySelectorAll(".recipe").forEach(btn => btn.classList.toggle("active", btn.dataset.recipe === stack.recipe));
    buildLayers();
    api.drawTimeline(ui.timeline, stack);
    renderSummary();
    ui.profile.textContent = JSON.stringify(exportProfile(), null, 2);
  }

  function buildLayers(){
    ui.layerList.innerHTML = stack.layers.map((layer, index) => layerCard(layer, index)).join("");
    ui.layerList.querySelectorAll(".layer-card").forEach(card => {
      const layer = stack.layers[Number(card.dataset.index)];
      card.querySelector("[data-action='enable']").addEventListener("click", () => {
        layer.enabled = !layer.enabled;
        if(!layer.enabled) layer.solo = false;
        render();
      });
      card.querySelector("[data-action='solo']").addEventListener("click", () => {
        layer.solo = !layer.solo;
        render();
      });
      card.querySelector("[data-field='preset']").addEventListener("input", ev => {
        layer.preset = ev.target.value;
        api.applyPreset(layer);
        render();
      });
      for(const field of ["gain","strength","start","length"]){
        card.querySelector(`[data-field='${field}']`).addEventListener("input", ev => {
          const v = Number(ev.target.value) / 100;
          layer[field] = field === "length" ? Math.max(.08, v) : v;
          render();
        });
      }
    });
  }

  function layerCard(layer, index){
    const def = api.layerDefs[layer.kind];
    const presets = Object.entries(def.presets).map(([id, preset]) =>
      `<option value="${id}" ${layer.preset === id ? "selected" : ""}>${preset.label}</option>`
    ).join("");
    return `
      <article class="layer-card ${layer.enabled ? "" : "disabled"}" data-index="${index}">
        <div class="layer-head">
          <button class="toggle" data-action="enable" title="on/off">${layer.enabled ? "on" : "off"}</button>
          <button class="solo ${layer.solo ? "active" : ""}" data-action="solo" title="solo">S</button>
          <div class="layer-title">
            <div class="layer-name" style="color:${layer.color}">${layer.name}</div>
            <div class="layer-role">${layer.role}</div>
          </div>
          <select data-field="preset">${presets}</select>
        </div>
        <div class="layer-controls">
          ${rangeField("gain","volume",layer.gain)}
          ${rangeField("strength","strength",layer.strength)}
          ${rangeField("start","start",layer.start,"s")}
          ${rangeField("length","length",layer.length,"s")}
        </div>
      </article>
    `;
  }

  function rangeField(field, label, value, suffix=""){
    const shown = suffix === "s" ? `${value.toFixed(2)}s` : `${Math.round(value * 100)}%`;
    const min = field === "length" ? 8 : 0;
    const max = field === "start" || field === "length" ? 240 : 100;
    return `
      <label class="mini-field">
        <span>${label}<b>${shown}</b></span>
        <input data-field="${field}" type="range" min="${min}" max="${max}" value="${Math.round(value * 100)}" />
      </label>
    `;
  }

  function renderSummary(){
    const active = api.activeLayers(stack);
    const solo = stack.layers.filter(layer => layer.enabled && layer.solo);
    ui.sumLayers.textContent = active.length;
    ui.sumEvents.textContent = api.eventSummary(stack);
    ui.sumDuration.textContent = `${api.stackDuration(stack).toFixed(2)}s`;
    ui.sumSolo.textContent = solo.length ? solo.map(layer => layer.name.split(" ")[0]).join("+") : "mix";
  }

  function exportProfile(){
    return {
      ...stack,
      durationSec:api.stackDuration(stack),
      activeLayerIds:api.activeLayers(stack).map(layer => layer.id),
      generated:{
        eventCount:api.eventSummary(stack),
        note:"Every enabled layer has its own envelope and fades to zero."
      }
    };
  }

  function downloadBlob(name, blob){
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function downloadText(name, text){
    downloadBlob(name, new Blob([text], {type:"application/json"}));
  }
})();
