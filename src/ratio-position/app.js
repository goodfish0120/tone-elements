(function(){
  "use strict";

  const api = window.RatioPosition;
  const $ = id => document.getElementById(id);
  const ui = {
    anchorPreset:$("anchorPreset"),
    anchorHz:$("anchorHz"),
    numerator:$("numerator"),
    denominator:$("denominator"),
    ratioPresets:$("ratioPresets"),
    offsetCents:$("offsetCents"),
    offsetReadout:$("offsetReadout"),
    octaveMin:$("octaveMin"),
    octaveMax:$("octaveMax"),
    wave:$("wave"),
    gain:$("gain"),
    gainReadout:$("gainReadout"),
    attack:$("attack"),
    attackReadout:$("attackReadout"),
    hold:$("hold"),
    holdReadout:$("holdReadout"),
    release:$("release"),
    releaseReadout:$("releaseReadout"),
    play:$("play"),
    clear:$("clear"),
    json:$("json"),
    wav:$("wav"),
    status:$("status"),
    frequencyMap:$("frequencyMap"),
    sumAnchor:$("sumAnchor"),
    sumRatio:$("sumRatio"),
    sumCandidates:$("sumCandidates"),
    sumDuration:$("sumDuration"),
    candidateList:$("candidateList"),
    layerList:$("layerList"),
    layerCount:$("layerCount")
  };

  let state = api.createState();

  init();

  function init(){
    ui.anchorPreset.innerHTML = `<option value="custom">custom</option>` + api.notes.map(([label, hz]) =>
      `<option value="${hz}">${label} ${hz}Hz</option>`
    ).join("");
    ui.ratioPresets.innerHTML = api.ratioPresets.map(([label, n, d]) =>
      `<button data-n="${n}" data-d="${d}" type="button">${label}</button>`
    ).join("");
    bindInputs();
    render();
    window.addEventListener("resize", () => render());
  }

  function bindInputs(){
    ui.anchorPreset.addEventListener("input", () => {
      if(ui.anchorPreset.value === "custom") return;
      state.anchorHz = Number(ui.anchorPreset.value);
      render();
    });
    ui.anchorHz.addEventListener("input", () => {
      state.anchorHz = api.clamp(Number(ui.anchorHz.value) || 220, 20, 2000);
      render();
    });
    for(const [node, key] of [[ui.numerator, "numerator"], [ui.denominator, "denominator"], [ui.offsetCents, "offsetCents"], [ui.octaveMin, "octaveMin"], [ui.octaveMax, "octaveMax"]]){
      node.addEventListener("input", () => {
        state.ratio[key] = Number(node.value);
        render();
      });
    }
    ui.ratioPresets.addEventListener("click", ev => {
      const btn = ev.target.closest("button[data-n]");
      if(!btn) return;
      state.ratio.numerator = Number(btn.dataset.n);
      state.ratio.denominator = Number(btn.dataset.d);
      render();
    });
    ui.wave.addEventListener("input", () => {
      state.draft.wave = ui.wave.value;
      renderReadouts();
    });
    for(const [node, key, scale] of [[ui.gain, "gain", 100], [ui.attack, "attack", 100], [ui.hold, "hold", 100], [ui.release, "release", 100]]){
      node.addEventListener("input", () => {
        state.draft[key] = Number(node.value) / scale;
        renderReadouts();
      });
    }
    ui.play.addEventListener("click", () => api.playState(state, text => ui.status.textContent = text));
    ui.clear.addEventListener("click", () => {
      state.layers = state.layers.filter(layer => layer.locked);
      render();
    });
    ui.json.addEventListener("click", () => downloadText("tone-elements-ratio-profile.json", JSON.stringify(api.profile(state), null, 2)));
    ui.wav.addEventListener("click", async () => {
      ui.status.textContent = "rendering wav...";
      const buffer = await api.renderOffline(state);
      downloadBlob("tone-elements-ratio.wav", api.audioBufferToWav(buffer));
      ui.status.textContent = "wav downloaded";
    });
    ui.candidateList.addEventListener("click", ev => {
      const btn = ev.target.closest("button[data-octave]");
      if(!btn) return;
      const octave = Number(btn.dataset.octave);
      const candidate = api.candidates(state).find(item => item.octave === octave);
      if(candidate) state.layers.push(api.makeResponseLayer(state, candidate));
      render();
    });
    ui.layerList.addEventListener("click", handleLayerClick);
    ui.layerList.addEventListener("input", handleLayerInput);
  }

  function render(){
    const ratio = api.currentRatio(state);
    const matchedAnchor = api.notes.find(([, hz]) => Math.abs(hz - state.anchorHz) < .01);
    ui.anchorHz.value = Number(state.anchorHz.toFixed(2));
    ui.anchorPreset.value = matchedAnchor ? String(matchedAnchor[1]) : "custom";
    ui.numerator.value = ratio.numerator;
    ui.denominator.value = ratio.denominator;
    ui.offsetCents.value = ratio.offsetCents;
    ui.octaveMin.value = ratio.octaveMin;
    ui.octaveMax.value = ratio.octaveMax;
    ui.wave.value = state.draft.wave;
    ui.gain.value = Math.round(state.draft.gain * 100);
    ui.attack.value = Math.round(state.draft.attack * 100);
    ui.hold.value = Math.round(state.draft.hold * 100);
    ui.release.value = Math.round(state.draft.release * 100);
    renderReadouts();
    renderSummary();
    renderCandidates();
    renderLayers();
    api.drawFrequencyMap(ui.frequencyMap, state);
  }

  function renderReadouts(){
    ui.offsetReadout.textContent = `${Math.round(state.ratio.offsetCents)}c`;
    ui.gainReadout.textContent = `${Math.round(state.draft.gain * 100)}%`;
    ui.attackReadout.textContent = `${state.draft.attack.toFixed(2)}s`;
    ui.holdReadout.textContent = `${state.draft.hold.toFixed(2)}s`;
    ui.releaseReadout.textContent = `${state.draft.release.toFixed(2)}s`;
  }

  function renderSummary(){
    const ratio = api.currentRatio(state);
    const candidates = api.candidates(state);
    ui.sumAnchor.textContent = `${api.formatHz(state.anchorHz)}Hz`;
    ui.sumRatio.textContent = `${ratio.numerator}:${ratio.denominator}`;
    ui.sumCandidates.textContent = candidates.filter(candidate => candidate.audible).length;
    ui.sumDuration.textContent = `${api.duration(state).toFixed(2)}s`;
  }

  function renderCandidates(){
    const candidates = api.candidates(state);
    ui.candidateList.innerHTML = candidates.map(candidate => `
      <article class="candidate-card ${candidate.audible ? "" : "offrange"}">
        <div class="candidate-main">
          <b>${candidate.frequencyHz.toFixed(2)}Hz</b>
          <span>${candidate.numerator}:${candidate.denominator} / k=${candidate.octave} / ${Math.round(candidate.centsFromAnchor)}c</span>
        </div>
        <button data-octave="${candidate.octave}" type="button" ${candidate.audible ? "" : "disabled"}>+</button>
      </article>
    `).join("");
  }

  function renderLayers(){
    ui.layerCount.textContent = String(state.layers.length);
    ui.layerList.innerHTML = state.layers.map(layer => layerCard(layer)).join("");
  }

  function layerCard(layer){
    const freq = api.layerFrequency(state, layer);
    const enabled = layer.enabled ? "" : "disabled";
    return `
      <article class="layer-card ${enabled}" data-id="${layer.id}">
        <div class="layer-head">
          <button class="icon-btn" data-action="enable" type="button" title="on/off">${layer.enabled ? "on" : "off"}</button>
          <button class="icon-btn solo ${layer.solo ? "active" : ""}" data-action="solo" type="button" title="solo">S</button>
          <button class="icon-btn" data-action="remove" type="button" title="remove" ${layer.locked ? "disabled" : ""}>x</button>
          <div class="layer-title">
            <div class="layer-name">${api.layerLabel(layer)}</div>
            <div class="layer-role">${api.layerRole(layer)}</div>
          </div>
        </div>
        <div class="layer-meta">
          <span>${freq.toFixed(2)}Hz</span>
          <span>${layer.wave}</span>
        </div>
        <div class="layer-controls">
          ${rangeField("gain", "gain", layer.gain, 0, 100, `${Math.round(layer.gain * 100)}%`)}
          ${rangeField("offsetCents", "cents", layer.offsetCents, -100, 100, `${Math.round(layer.offsetCents)}c`, layer.locked)}
          ${rangeField("attack", "attack", layer.attack, 1, 80, `${layer.attack.toFixed(2)}s`)}
          ${rangeField("hold", "hold", layer.hold, 1, 180, `${layer.hold.toFixed(2)}s`)}
          ${rangeField("release", "release", layer.release, 2, 240, `${layer.release.toFixed(2)}s`)}
          ${rangeField("phaseDeg", "phase", layer.phaseDeg, 0, 359, `${Math.round(layer.phaseDeg)}deg`)}
        </div>
      </article>
    `;
  }

  function rangeField(field, label, value, min, max, shown, disabled=false){
    const raw = field === "gain" ? Math.round(value * 100)
      : field === "attack" || field === "hold" || field === "release" ? Math.round(value * 100)
      : Math.round(value);
    return `
      <label class="mini-field">
        <span>${label}<b>${shown}</b></span>
        <input data-field="${field}" type="range" min="${min}" max="${max}" value="${raw}" ${disabled ? "disabled" : ""} />
      </label>
    `;
  }

  function handleLayerClick(ev){
    const btn = ev.target.closest("button[data-action]");
    if(!btn) return;
    const layer = layerFromEvent(btn);
    if(!layer) return;
    if(btn.dataset.action === "enable"){
      layer.enabled = !layer.enabled;
      if(!layer.enabled) layer.solo = false;
    }
    if(btn.dataset.action === "solo") layer.solo = !layer.solo;
    if(btn.dataset.action === "remove" && !layer.locked) state.layers = state.layers.filter(item => item.id !== layer.id);
    render();
  }

  function handleLayerInput(ev){
    const input = ev.target.closest("input[data-field]");
    if(!input) return;
    const layer = layerFromEvent(input);
    if(!layer) return;
    const value = Number(input.value);
    const field = input.dataset.field;
    if(field === "gain") layer.gain = value / 100;
    if(field === "offsetCents") layer.offsetCents = value;
    if(field === "attack" || field === "hold" || field === "release") layer[field] = value / 100;
    if(field === "phaseDeg") layer.phaseDeg = value;
    renderLayers();
    renderSummary();
    api.drawFrequencyMap(ui.frequencyMap, state);
  }

  function layerFromEvent(node){
    const card = node.closest(".layer-card");
    return state.layers.find(layer => layer.id === card?.dataset.id);
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
