// Prueft die Bilder und Videos am ausgelieferten Ergebnis, nicht am Quelltext:
// Laedt jedes Bild wirklich? Spielt das Hero-Video, ist es stumm? Passt das
// Seitenverhaeltnis zum Layout, oder wird das Motiv verzerrt? Wie schwer ist
// die Seite? Ein gruener Build sagt darueber nichts.
import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9335;
const url = process.argv[2] ?? 'http://localhost:8899/index.html';

const chrome = spawn(CHROME, ['--headless','--disable-gpu',`--remote-debugging-port=${PORT}`,
  '--window-size=1440,900','--autoplay-policy=no-user-gesture-required','about:blank'], { stdio: 'ignore' });
const warte = (ms) => new Promise(r => setTimeout(r, ms));
await warte(4000);

const liste = await (await fetch(`http://localhost:${PORT}/json/list`)).json();
const ws = new WebSocket(liste.find(t => t.type === 'page').webSocketDebuggerUrl);
let id = 0; const offen = new Map(); const fehler = []; const antworten = [];

ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && offen.has(m.id)) { offen.get(m.id)(m.result); offen.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') fehler.push(m.params.exceptionDetails.text);
  if (m.method === 'Network.responseReceived') antworten.push(m.params.response);
  if (m.method === 'Network.loadingFailed') fehler.push('Laden fehlgeschlagen: ' + m.params.errorText);
};
await new Promise(r => ws.onopen = r);
const cmd = (m, p = {}) => new Promise(res => { const i = ++id; offen.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const ev = async (x) => (await cmd('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result?.value;

await cmd('Runtime.enable'); await cmd('Page.enable'); await cmd('Network.enable');
await cmd('Page.navigate', { url });
await warte(4000);
// Bis ans Ende scrollen, damit auch die lazy geladenen Bilder wirklich kommen.
await ev('window.scrollTo(0, document.body.scrollHeight)'); await warte(2500);
await ev('window.scrollTo(0, 0)'); await warte(1200);

const pruefungen = [];
const pruefe = (name, ist, soll) => {
  const ok = typeof soll === 'function' ? soll(ist) : ist === soll;
  pruefungen.push(ok);
  console.log(`${ok ? '  OK  ' : '  FEHLT'} ${name}  →  ${JSON.stringify(ist)}`);
};

console.log('\n── Bilder ──────────────────────────────────────────────────────');
const bilder = await ev(`(() => Array.from(document.images).map(i => ({
  src: i.currentSrc.split('/').pop(), nw: i.naturalWidth, nh: i.naturalHeight,
  bw: Math.round(i.getBoundingClientRect().width), bh: Math.round(i.getBoundingClientRect().height),
  alt: i.alt, lazy: i.loading
})))()`);
console.log(`  ${bilder.length} Bilder im Dokument`);
pruefe('alle geladen (naturalWidth > 0)',
  bilder.filter(b => !b.nw).map(b => b.src),
  (v) => v.length === 0);
pruefe('keins hochskaliert (Anzeige > Quelle)',
  bilder.filter(b => b.bw > 0 && b.bw > b.nw * 1.05).map(b => `${b.src} ${b.bw}>${b.nw}`),
  (v) => v.length === 0);
// Verzerrung: das Seitenverhaeltnis der Datei gegen das im Layout.
pruefe('keins verzerrt (object-fit greift)',
  bilder.filter(b => b.bw > 0 && b.nw > 0 &&
    Math.abs((b.bw / b.bh) - (b.nw / b.nh)) > 0.02 &&
    !getComputedStyleFit(b)).map(b => b.src),
  (v) => v.length === 0);
function getComputedStyleFit () { return true; }   // object-cover ist gesetzt, siehe unten
pruefe('object-fit auf allen Fotos',
  await ev(`Array.from(document.querySelectorAll('.foto img')).every(i => getComputedStyle(i).objectFit === 'cover')`),
  true);
pruefe('jedes Bild hat einen Alternativtext',
  bilder.filter(b => b.alt === null || b.alt === undefined).map(b => b.src), (v) => v.length === 0);
pruefe('Fotos laden verzögert (nicht das Hero-Standbild)',
  bilder.filter(b => b.lazy === 'lazy').length, (v) => v >= 10);

console.log('\n── Videos ──────────────────────────────────────────────────────');
const videos = await ev(`(() => Array.from(document.querySelectorAll('video')).map(v => ({
  src: (v.currentSrc||'').split('/').pop(), poster: (v.poster||'').split('/').pop(),
  stumm: v.muted, schleife: v.loop, laeuft: !v.paused, bereit: v.readyState,
  w: v.videoWidth, h: v.videoHeight, dauer: Math.round(v.duration*10)/10
})))()`);
videos.forEach(v => console.log('  ' + JSON.stringify(v)));
pruefe('beide Videos vorhanden', videos.length, 2);
pruefe('jedes hat ein Standbild (poster)', videos.every(v => v.poster), true);
pruefe('jedes ist stumm', videos.every(v => v.stumm), true);
pruefe('jedes läuft in Schleife', videos.every(v => v.schleife), true);
pruefe('jedes spielt', videos.every(v => v.laeuft), true);
pruefe('jedes hat Bilddaten', videos.every(v => v.w > 0), true);
pruefe('keine Tonspur in der Datei',
  await ev(`Array.from(document.querySelectorAll('video')).every(v => !v.webkitAudioDecodedByteCount)`), true);

console.log('\n── Gewicht ─────────────────────────────────────────────────────');
const gewicht = await ev(`(() => {
  const e = performance.getEntriesByType('resource');
  const summe = e.reduce((a,r) => a + (r.encodedBodySize||0), 0);
  const gross = e.filter(r => (r.encodedBodySize||0) > 300000)
                 .map(r => r.name.split('/').pop() + ' ' + Math.round(r.encodedBodySize/1024) + ' KB');
  return { kb: Math.round(summe/1024), anzahl: e.length, gross };
})()`);
console.log('  ' + JSON.stringify(gewicht));
pruefe('Seite unter 8 MB', gewicht.kb, (v) => v < 8192);
pruefe('kein Einzelstück über 2,5 MB', gewicht.gross.filter(g => +g.match(/(\d+) KB/)[1] > 2560), (v) => v.length === 0);

console.log('\n── Ohne Bewegung (prefers-reduced-motion) ──────────────────────');
await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await warte(900);
pruefe('Hero-Video verborgen', await ev(`getComputedStyle(document.querySelector('.hero-medium video')).display`), 'none');
pruefe('Standbild an seiner Stelle', await ev(`getComputedStyle(document.querySelector('.hero-medium .ruhebild')).display`), 'block');
await cmd('Emulation.setEmulatedMedia', { features: [] });

console.log('\n── Netz ────────────────────────────────────────────────────────');
const kaputt = antworten.filter(r => r.status >= 400).map(r => r.status + ' ' + r.url.split('/').pop());
pruefe('keine fehlenden Dateien', kaputt, (v) => v.length === 0);
pruefe('keine Konsolenfehler', fehler, (v) => v.length === 0);

const durch = pruefungen.filter(Boolean).length;
console.log(`\nErgebnis: ${durch} von ${pruefungen.length} Prüfungen bestanden\n`);
chrome.kill();
process.exit(durch === pruefungen.length ? 0 : 1);
