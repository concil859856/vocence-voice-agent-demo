# Vocence — Real-Time Voice Agent · Implementation Template

Drop a **real-time, talk-to-it voice agent** onto any website with two lines of
HTML. This repo is a ready-to-use template: a polished interactive demo you can
run locally, plus a minimal copy-paste example and full integration docs.

The widget handles everything — microphone capture, voice-activity detection,
streaming the audio over a WebSocket, and playing back the agent's spoken
replies. You bring an **Agent ID** and an **embed token** from Vocence Studio.

---

## Quick start

```html
<script src="https://widget.vocence.ai/v1/widget.js" defer></script>
<vocence-agent agent-id="YOUR_AGENT_ID" embed-token="vet_..."></vocence-agent>
```

That's the whole integration. The script registers a `<vocence-agent>` custom
element; a floating mic launcher appears in the bottom-right. No `server`
attribute, no build step, no backend.

> Get your **Agent ID** and **embed token** from Vocence Studio. The embed
> token is scoped to a single agent and is safe to ship in public HTML.

---

## Run the interactive demo

A full playground with every option exposed live (position, theme, language,
greeting, accent color, voice/text), a live preview, the generated snippet, and
an event log.

```bash
python3 serve.py 8090      # → http://localhost:8090
```

Open it, click the mic, **allow microphone access**, and talk. Switch to the
**Text** tab to type instead.

> **Microphone requires a secure context.** Browsers only grant mic access on
> `https://` or `http://localhost`. The bundled `serve.py` binds to localhost,
> so local testing works. When you deploy, serve the page over HTTPS.

---

## Configuration

Set these as attributes on `<vocence-agent>`:

| Attribute | Required | Default | Description |
|---|:---:|---|---|
| `agent-id` | ✅ | — | Which agent to run (from Studio) |
| `embed-token` | ✅ | — | `vet_...` token; authorizes + bills the agent owner |
| `server` | — | `https://voice.vocence.ai` | Real-time host. Leave default unless self-hosting. |
| `position` | — | `bottom-right` | `bottom-right` · `bottom-left` · `inline` |
| `theme` | — | `auto` | `auto` · `dark` · `light` |
| `language` | — | `auto` | STT language hint (e.g. `English`) |
| `greeting` | — | — | One-line message shown in the panel |
| `voice-enabled` | — | `true` | `false` ships a text-only widget |
| `open-on-load` | — | `false` | Auto-open the panel on load |

### Theming

Override CSS custom properties on the element. Everything (bubbles, buttons,
mic, avatar) derives from the accent:

```css
vocence-agent {
  --voc-accent: #6d5efc;        /* your brand color */
  --voc-radius: 20px;
  --voc-font: 'Inter', system-ui, sans-serif;
}
```

Set `theme="light"` for a light palette, or `theme="auto"` to follow the OS.

---

## JavaScript API & events

Drive the element programmatically:

```js
const agent = document.querySelector('vocence-agent');
agent.open();             // open the panel
agent.startVoice();       // open + start a voice call
agent.sendText('Hi!');    // send a text message
agent.close();            // end + close
```

Listen for lifecycle events (all prefixed `vocence:`):

```js
agent.addEventListener('vocence:open',  () => {});
agent.addEventListener('vocence:close', () => {});
agent.addEventListener('vocence:error', (e) => console.warn(e.detail)); // {code, message}
agent.addEventListener('vocence:turn',  (e) => console.log(e.detail));  // {role:'user'|'agent', text}
```

---

## How it works

- **`widget.vocence.ai/v1/widget.js`** — the widget bundle + its in-browser
  voice-activity-detection assets (served via CDN).
- **`voice.vocence.ai`** — the real-time host: the agent opens its WebSocket
  here and fetches the agent's public display info. This host is intentionally
  **not** behind the CDN edge, so the WebSocket handshake is never challenged or
  blocked. It's the widget's default `server`.

The page you build is plain static files — there's no Vocence backend to run.

---

## Deploy

These are static files. Host `index.html`, `demo.js`, `demo.css` (or just your
own page with the snippet) on any static host, CDN, or your app's `public/`
folder. **Serve over HTTPS** so the microphone works.

To use this repo as your starting point: replace the demo `agent-id` /
`embed-token` (prefilled in `demo.js` for the live playground) with your own.

---

## Frameworks

It's a standard custom element — works in any framework.

**React**
```jsx
import { useEffect } from 'react';

export function Agent({ agentId, token }) {
  useEffect(() => {
    if (!document.querySelector('script[data-vocence]')) {
      const s = document.createElement('script');
      s.src = 'https://widget.vocence.ai/v1/widget.js';
      s.defer = true; s.dataset.vocence = '1';
      document.head.appendChild(s);
    }
  }, []);
  return <vocence-agent agent-id={agentId} embed-token={token} />;
}
```

**Vue / Svelte / Angular** — add the `<script>` once, then use `<vocence-agent>`
in any template. (For Vue, mark it a custom element in your build config.)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Mic permission denied / no prompt | You're not on `https://` or `localhost`. Serve over HTTPS. |
| Stale widget after an update | Browsers cache `widget.js` ~5 min. Hard-refresh, or version the URL (`?v=N`). |
| Nothing happens on click | Open DevTools → Console; check `vocence:error` events for `code`/`message`. |
| Agent name shows "Agent" | Cosmetic — the public name lookup is optional and non-blocking. |

---

## Repo structure

```
index.html        Interactive demo dashboard (the playground)
demo.js           Wires the config panel to <vocence-agent> (full integration example)
demo.css          Dashboard styling
serve.py          Zero-dependency local preview server (python3 serve.py [port])
examples/
  minimal.html    The bare two-line integration — copy this to start
README.md         This file
```

---

## License

MIT — use it, change it, ship it.
