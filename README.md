# reel analyst

a browser extension that analyzes instagram reels in the background using a free openrouter model. it captures frames from the reel you're watching, sends them to an llm, and gets back a structured breakdown of *why* the reel works — plus a fresh reel idea inspired by it.

you can point it at 1, 2, 3, or 5 reels at a time. when you pick more than one, it autoscrolls through them, analyzing each in sequence, then drops a json report when it's done.

## what it does

- captures 3 frames from the currently playing reel
- sends them to a free model on openrouter for analysis
- returns a structured json breakdown per reel:
  - `niche` — what the reel is about
  - `hook_strategy` — how it grabs attention in the first seconds
  - `emotional_trigger` — what feeling it's leaning on
  - `editing_style` — pacing, cuts, transitions, text overlay style
  - `intended_audience` — who it's made for
  - `performance_reason` — why it likely performs well
  - `inspired_reel_idea` — a new reel concept based on what works here
- batches results into one report and auto-downloads it as `reel_analysis_report.json`
- caches the run in extension storage (`collectedReels`, `finalReport`)

## how it works

1. **popup** — pick how many reels to analyze (1 / 2 / 3 / 5) and hit *start analysis*. the count is sent to the content script on the active tab.
2. **content script** — runs on instagram. for each reel it waits for the video to be ready, grabs 3 frames off the `<video>` element via canvas, then (if more reels are queued) simulates an arrow-down keypress to scroll to the next reel and waits for the url to change.
3. **background script** — receives each reel and calls the openrouter chat completions endpoint with the frames + analysis prompt, returning parsed json.
4. once every reel is analyzed, a combined report is saved to storage and downloaded.

## autoscroll

when more than 1 reel is selected, the extension moves between reels on its own:

- analyzes the current reel
- dispatches an `arrowdown` keydown to advance to the next one
- waits for the url to change, settles for ~1.5s, then repeats

single-reel mode just analyzes whatever is on screen and stops.

## supported counts

`1`, `2`, `3`, `5` — selectable from the popup. one is the default.

## install

### chrome / chromium

1. go to `chrome://extensions`
2. enable **developer mode** (top right)
3. click **load unpacked**
4. select the `build/chrome` folder (or the project root)

### firefox

1. go to `about:debugging#/runtime/this-firefox`
2. click **load temporary add-on**
3. select `build/firefox/manifest.json`

a prebuilt `dist/reel-analyst.xpi` and `dist/reel-analyst.crx` are also included.

## setup — api key

the extension calls openrouter, so you need a free api key.

1. make an account at [openrouter.ai](https://openrouter.ai) and create an api key
2. open `openrouter.js` and `background.js`
3. replace the `API_KEY` value with your own key

> **security note:** the source ships with a hardcoded key for convenience during development. **do not publish or share the extension with a real key inside it** — anyone with the file can use your credits. rotate the bundled key before doing anything with this, and ideally load the key from extension storage / a settings field instead of hardcoding it.

## model

uses a free vision-capable model on openrouter (`:free` tier). you can swap the `model` string in `openrouter.js` / `background.js` for any other free vision model openrouter offers if the default is rate-limited or unavailable.

## permissions

- `storage` — cache collected reels and the final report
- `activeTab` / `scripting` — talk to the active instagram tab
- host access to `instagram.com` (run the content script) and `openrouter.ai` (api calls)

## project structure

```
reel-analyst/
├── manifest.json        manifest v3, gecko id for firefox
├── popup.html           count picker ui (1/2/3/5)
├── popup.css            popup styling
├── popup.js             handles selection + sends start message
├── content.js           frame capture, autoscroll, analysis loop, report download
├── background.js        openrouter api call (background)
├── openrouter.js        standalone analyze helper
├── build/
│   ├── chrome/          chrome build
│   └── firefox/         firefox build
└── dist/
    ├── reel-analyst.xpi firefox package
    ├── reel-analyst.crx chrome package
    └── reel-analyst.pem signing key
```

## usage

1. open instagram and start watching a reel
2. click the extension icon
3. pick 1, 2, 3, or 5
4. hit **start analysis**
5. wait — it'll autoscroll through the reels if you picked more than one
6. a `reel_analysis_report.json` downloads when it finishes, and you'll get an alert

## limitations & notes

- built for instagram reels; selectors target instagram's `<video>` element and url behavior, so layout changes on their end can break capture/scroll
- frames are captured at low res (320×568, jpeg q0.5) to keep payloads small
- free models can be slow or rate-limited; there are deliberate delays between calls
- captured frames can be blank if instagram serves video on a tainted/cross-origin canvas — if frames come back null, that's why
- analysis quality depends entirely on the free model you pick

## roadmap ideas

- settings panel for api key + model instead of hardcoding
- custom analysis prompt from the popup
- in-popup results view instead of (or alongside) the json download
- support for tiktok / youtube shorts
