# Tone Elements

中文暫名：音色元素

這個專案用來研究「如何用音色元素組合出虛構聲音」。

目前方向不是先做完整音樂生成器，而是先建立一個實驗環境：

- 從真實聲音或音檔抓出共振指紋
- 把 partial、noise、pulse、時間包絡整理成可描述的結構
- 觀察不同結構如何對應到稀有、神聖、腐化、安全、危險等聽感
- 之後再把這些結構轉成可重建、可變形、可輸出的音色素材

## 直接使用

- GitHub Pages：<https://goodfish0120.github.io/tone-elements/>
- 比例位置原型：<https://goodfish0120.github.io/tone-elements/lab/layer-stack-lab.html>
- 舊單音原型：<https://goodfish0120.github.io/tone-elements/lab/single-note-lab.html>

## 名字

`tone-elements` 是對外專案名稱。

- `tone` = 音色、聲音質感
- `elements` = 元素、組件、概念原子

正式描述可以用「音色元素」：

> 設計聲音，不是設計單一波形，而是設計一個共振結構，以及結構中每個元素隨時間變化的方式。

## 目前檔案

- `index.html`：GitHub Pages 入口，會進入比例位置原型
- `lab/layer-stack-lab.html`：比例位置原型，負責把基準音、比例、跨八度位置、cents 偏移與時間包絡拆成可疊加圖層
- `lab/resonance-tuner.html`：原始 Resonance Tuner，負責分析聲音指紋
- `lab/single-note-lab.html`：單音結構原型，負責設計一個可聽的虛擬音色
- `docs/current-requirements.md`：目前正在形成的工程需求與視覺化需求
- `docs/project-purpose.md`：項目目的
- `docs/deep-research-report.md`：前期研究報告
- `spec/`：之後放 `resonance-profile.json` 規格
- `examples/`：之後放範例聲音與 profile
- `src/single-note/`：單音原型的 profile、audio、visualizer、wav 等模組
