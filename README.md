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
- caches the run in extension storage

## how it works

1. **popup** — pick how many reels to analyze (1 / 2 / 3 / 5) and hit *start analysis*.
2. **content script** — runs on instagram. for each reel it waits for the video to be ready, grabs 3 frames off the `<video>` element via canvas, then (if more reels are queued) simulates an arrow-down keypress to scroll to the next reel and waits for the url to change.
3. **background** — sends each reel's frames + analysis prompt to the openrouter chat completions endpoint and returns parsed json.
4. once every reel is analyzed, a combined report is saved and downloaded.

## autoscroll

when more than 1 reel is selected, the extension moves between reels on its own:

- analyzes the current reel
- dispatches an `arrowdown` keydown to advance to the next one
- waits for the url to change, settles briefly, then repeats

single-reel mode just analyzes whatever is on screen and stops.

## supported counts

`1`, `2`, `3`, `5` — selectable from the popup. one is the default.

## install

this is distributed as packaged builds only:

- `reel-analyst.crx` — chrome / chromium
- `reel-analyst.xpi` — firefox

### chrome / chromium (.crx)

chrome blocks installing `.crx` files from outside the web store by default, so use one of these:

**drag-and-drop**
1. go to `chrome://extensions`
2. enable **developer mode** (top right)
3. drag `reel-analyst.crx` onto the page and confirm the install

**if chrome refuses the .crx** (common on newer versions), unzip it instead:
1. rename `reel-analyst.crx` to `reel-analyst.zip` and extract it
2. go to `chrome://extensions` → enable **developer mode**
3. click **load unpacked** and select the extracted folder

### firefox (.xpi)

firefox requires extensions to be signed for permanent install. for a signed `.xpi`, just open it in firefox and confirm. if it's unsigned, load it temporarily:

1. go to `about:debugging#/runtime/this-firefox`
2. click **load temporary add-on**
3. select `reel-analyst.xpi`

> temporary add-ons are removed when firefox restarts. to keep it installed permanently, the `.xpi` must be signed through mozilla.

## model

uses a free vision-capable model on openrouter (`:free` tier). if it's rate-limited or unavailable, swap in another free vision model from openrouter.

## permissions

- `storage` — cache collected reels and the final report
- `activeTab` / `scripting` — talk to the active instagram tab
- host access to `instagram.com` (run the content script) and `openrouter.ai` (api calls)

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
- captured frames can come back blank if instagram serves video on a cross-origin/tainted canvas
- analysis quality depends entirely on the free model you pick

## roadmap ideas

- settings panel for api key + model
- custom analysis prompt from the popup
- in-popup results view instead of (or alongside) the json download
- support for tiktok / youtube shorts
