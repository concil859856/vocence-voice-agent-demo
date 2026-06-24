/* Vocence real-time voice agent — demo wiring.
 *
 * This file shows the ENTIRE client-side integration. A real app needs only:
 *   1. <script src="https://widget.vocence.ai/v1/widget.js" defer></script>
 *   2. a <vocence-agent agent-id=... embed-token=... server="https://voice.vocence.ai">
 * Everything below is just to make every option live-configurable for the demo.
 */

const $ = (id) => document.getElementById(id);

// --- Optional: prefill from URL (?agent=...&token=...) so you can share a
//     ready-to-test link. Falls back to the public demo agent. -------------
const params = new URLSearchParams(location.search);
const DEFAULTS = {
  agentId: params.get('agent') || '10eaf090e10948f3a22fa6eb55247b37',   // demo "Bittensor Guide"
  embedToken: params.get('token') || 'vet_3861f6833d33a27bb3d35e9e',     // demo token (origin-open)
  server: params.get('server') || 'https://voice.vocence.ai',
};
$('agentId').value = DEFAULTS.agentId;
$('embedToken').value = DEFAULTS.embedToken;
$('server').value = DEFAULTS.server;

let agentEl = null;

function readConfig() {
  return {
    agentId: $('agentId').value.trim(),
    embedToken: $('embedToken').value.trim(),
    server: $('server').value.trim().replace(/\/+$/, ''),
    position: $('position').value,
    theme: $('theme').value,
    language: $('language').value,
    greeting: $('greeting').value.trim(),
    accent: $('accent').value,
    voiceEnabled: $('voiceEnabled').checked,
    openOnLoad: $('openOnLoad').checked,
  };
}

function log(msg, kind = '') {
  const row = document.createElement('div');
  row.className = 'log-row ' + kind;
  const t = new Date().toLocaleTimeString();
  row.textContent = `[${t}] ${msg}`;
  const box = $('log');
  if (box.firstChild && box.firstChild.classList.contains('muted')) box.innerHTML = '';
  box.prepend(row);
  const lc = document.getElementById('logCount');
  if (lc) lc.textContent = box.children.length + ' events';
}

// Reflect the configured real-time host in the topbar pill.
function syncHostPill() {
  const pill = document.getElementById('hostPill');
  if (pill) { try { pill.textContent = new URL($('server').value).host; } catch { /* partial input */ } }
}

// --- Build (or rebuild) the <vocence-agent> element from current config ---
function mountAgent() {
  const c = readConfig();
  if (!c.agentId || !c.embedToken) { log('Agent ID and embed token are required.', 'err'); return; }

  // Tear down a previous instance.
  if (agentEl && agentEl.parentNode) agentEl.parentNode.removeChild(agentEl);

  agentEl = document.createElement('vocence-agent');
  agentEl.setAttribute('agent-id', c.agentId);
  agentEl.setAttribute('embed-token', c.embedToken);
  agentEl.setAttribute('server', c.server);
  agentEl.setAttribute('position', c.position);
  agentEl.setAttribute('theme', c.theme);
  agentEl.setAttribute('language', c.language);
  if (c.greeting) agentEl.setAttribute('greeting', c.greeting);
  agentEl.setAttribute('voice-enabled', String(c.voiceEnabled));
  if (c.openOnLoad) agentEl.setAttribute('open-on-load', 'true');
  // Theming via CSS custom property (see widget README for the full list).
  agentEl.style.setProperty('--voc-accent', c.accent);

  // Surface widget lifecycle events in the demo log.
  ['open', 'close', 'error', 'ready', 'message'].forEach((ev) =>
    agentEl.addEventListener(ev, (e) => log(`event: ${ev}` + (e.detail ? ' ' + JSON.stringify(e.detail).slice(0, 120) : ''),
      ev === 'error' ? 'err' : 'ok')));

  // Inline vs floating mount.
  const inline = c.position === 'inline';
  const mount = $('inlineMount');
  mount.hidden = !inline;
  (inline ? mount : document.body).appendChild(agentEl);

  renderSnippet(c);
  log(`agent mounted (${c.position}) → ${c.server}`, 'ok');
}

function renderSnippet(c) {
  const attrs = [
    `agent-id="${c.agentId}"`,
    `embed-token="${c.embedToken}"`,
    // server is now the widget default — only emit it when overridden.
    c.server && c.server !== 'https://voice.vocence.ai' ? `server="${c.server}"` : '',
    c.position !== 'bottom-right' ? `position="${c.position}"` : '',
    c.theme !== 'auto' ? `theme="${c.theme}"` : '',
    c.language !== 'auto' ? `language="${c.language}"` : '',
    c.greeting ? `greeting="${c.greeting}"` : '',
    !c.voiceEnabled ? `voice-enabled="false"` : '',
    c.openOnLoad ? `open-on-load="true"` : '',
  ].filter(Boolean).join('\n              ');
  $('snippet').textContent =
    `<script src="https://widget.vocence.ai/v1/widget.js" defer></` + `script>\n` +
    `<vocence-agent ${attrs}></vocence-agent>`;
}

// --- Wire up the controls ---
$('apply').addEventListener('click', mountAgent);
$('startVoice').addEventListener('click', async () => {
  if (!agentEl) mountAgent();
  try { await agentEl.startVoice?.(); log('startVoice() called', 'ok'); }
  catch (e) { log('startVoice failed: ' + e.message, 'err'); }
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('snippet').textContent); log('snippet copied', 'ok'); }
  catch { log('copy failed (clipboard blocked)', 'err'); }
});
// Live-update the snippet as you tweak fields.
['agentId','embedToken','server','position','theme','language','greeting','accent','voiceEnabled','openOnLoad']
  .forEach((id) => $(id).addEventListener('input', () => { renderSnippet(readConfig()); if (id === 'server') syncHostPill(); }));

// Initial render + auto-mount so the demo is live on load.
renderSnippet(readConfig());
syncHostPill();
window.addEventListener('load', mountAgent);
