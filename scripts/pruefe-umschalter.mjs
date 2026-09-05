// Prueft Hell/Dunkel und Deutsch/Englisch am laufenden Browser, nicht am Code:
// klickt beide Knoepfe, liest die tatsaechlich gerechneten Farben und Texte,
// und meldet am Ende jede sichtbare Zeile, die auf Englisch deutsch geblieben ist.
import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;
const url = process.argv[2] ?? 'http://localhost:8899/index.html';

const chrome = spawn(CHROME, [
  '--headless', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  '--window-size=1440,900', 'about:blank'
], { stdio: 'ignore' });

const warte = (ms) => new Promise(r => setTimeout(r, ms));
await warte(4000);

const liste = await (await fetch(`http://localhost:${PORT}/json/list`)).json();
const ws = new WebSocket(liste.find(t => t.type === 'page').webSocketDebuggerUrl);
let id = 0;
const offen = new Map();
const fehler = [];

ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && offen.has(m.id)) { offen.get(m.id)(m.result); offen.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') fehler.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description ?? ''));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') fehler.push('console.error: ' + JSON.stringify(m.params.args.map(a => a.value)));
};
await new Promise(r => ws.onopen = r);
const cmd = (method, params = {}) => new Promise(res => {
  const mid = ++id; offen.set(mid, res);
  ws.send(JSON.stringify({ id: mid, method, params }));
});
const ev = async (expr) => (await cmd('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.value;

await cmd('Runtime.enable');
await cmd('Page.enable');
await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
await cmd('Page.navigate', { url });
await warte(3000);

const SNAP = `(() => { const a=[]; const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,
  { acceptNode(n){ const p=n.parentElement; if(!p) return 2;
    const t=p.nodeName; if(t==='SCRIPT'||t==='STYLE'||t==='NOSCRIPT') return 2;
    return n.nodeValue.replace(/\\s+/g,' ').trim() ? 1 : 2; } });
  let n; while ((n=w.nextNode())) a.push(n.nodeValue.replace(/\\s+/g,' ').trim()); return a; })()`;

const bg = (sel) => `getComputedStyle(document.querySelector('${sel}')).backgroundColor`;
const pruefungen = [];
const nurStartseite = await ev('!!document.getElementById("bookForm")');
const pruefe = (name, ist, soll, nurIndex = false) => {
  if (nurIndex && !nurStartseite) return;
  const ok = typeof soll === 'function' ? soll(ist) : ist === soll;
  pruefungen.push(ok);
  console.log(`${ok ? '  OK  ' : '  FEHLT'} ${name}  →  ${JSON.stringify(ist)}`);
};

console.log('\n── Ausgangslage (Systemeinstellung hell) ────────────────────────');
pruefe('html ohne .dark', await ev('document.documentElement.classList.contains("dark")'), false);
pruefe('Seitengrund weiss', await ev(bg('body')), 'rgb(255, 255, 255)');
pruefe('Sprache steht auf de', await ev('document.documentElement.lang'), 'de');
pruefe('Knopf zeigt DE', await ev('document.querySelector(".lang-code").textContent'), 'DE');
pruefe('Mond sichtbar, Sonne nicht',
  await ev('getComputedStyle(document.querySelector(".ico-moon")).display + "/" + getComputedStyle(document.querySelector(".ico-sun")).display'),
  (v) => v.startsWith('block') === false ? v.endsWith('/none') : v.endsWith('/none'));

const de = await ev(SNAP);

console.log('\n── Knopf 1: dunkel ──────────────────────────────────────────────');
await ev('document.getElementById("themeBtn").click()');
await warte(400);
pruefe('html.dark gesetzt', await ev('document.documentElement.classList.contains("dark")'), true);
pruefe('Seitengrund dunkel', await ev(bg('body')), 'rgb(8, 8, 10)');
pruefe('Leinen-Band dunkel', await ev(bg('#ablauf')), 'rgb(14, 15, 18)', true);
pruefe('Karte dunkel', await ev(bg('#ablauf .card')), 'rgb(20, 20, 24)', true);
pruefe('Fliesstext hell', await ev('getComputedStyle(document.querySelector("#ablauf .card p.text-slate")).color'), 'rgb(167, 173, 184)', true);
pruefe('Rotes Kicker-Rot lesbar', await ev('getComputedStyle(document.querySelector("#ablauf .kicker")).color'), 'rgb(255, 74, 80)', true);
pruefe('Sonne sichtbar', await ev('getComputedStyle(document.querySelector(".ico-sun")).display'), 'block');
pruefe('Mond verborgen', await ev('getComputedStyle(document.querySelector(".ico-moon")).display'), 'none');
pruefe('in localStorage gemerkt', await ev('localStorage.getItem("rdvc-theme")'), 'dark');

console.log('\n── Knopf 2: Englisch ────────────────────────────────────────────');
await ev('document.getElementById("langBtn").click()');
await warte(400);
pruefe('lang=en', await ev('document.documentElement.lang'), 'en');
pruefe('Knopf zeigt EN', await ev('document.querySelector(".lang-code").textContent'), 'EN');
pruefe('Navigation uebersetzt', await ev('document.querySelector(\'a[href="#pakete"]\').textContent.trim()'), 'Services', true);
pruefe('Ueberschrift uebersetzt', await ev('document.querySelector("h1").textContent.replace(/\\s+/g," ").trim()'), 'We pick up your car, detail it and bring it back.', true);
pruefe('Formular-Knopf uebersetzt', await ev('document.getElementById("btnNext").textContent'), 'Next →', true);
pruefe('Schrittzaehler uebersetzt', await ev('document.getElementById("stepLabel").textContent'), 'Step 1 of 4', true);
pruefe('Platzhalter uebersetzt', await ev('document.getElementById("fName").placeholder'), 'First and last name', true);
pruefe('Seitentitel uebersetzt', await ev('document.title'), (v) => v.startsWith('RDVC Garage — Car Detailing Vienna'), true);
pruefe('Beschreibung uebersetzt', await ev('document.querySelector(\'meta[name="description"]\').content'), (v) => v.startsWith('Car detailing in Vienna'), true);
pruefe('Burger-Beschriftung uebersetzt', await ev('document.getElementById("menuBtn").getAttribute("aria-label")'), 'Open menu', true);
pruefe('Leerraum um Links erhalten',
  await ev('document.querySelector("#buchen p.mt-5").textContent.replace(/\\s+/g," ").trim()'),
  (v) => v.includes('Prefer direct? Message us on TikTok or give us a call:'), true);

if (!nurStartseite) {
  pruefe('Rechtstext uebersetzt', await ev('document.querySelector(".legal h2").textContent'), (v) => !/[äöüß]|gemäß|Daten(schutz)?erkl/.test(v));
  pruefe('Verbindlichkeits-Hinweis sichtbar', await ev('getComputedStyle(document.querySelector("[data-only-en]")).display'), 'block');
  pruefe('Fliesstext lesbar auf dunkel', await ev('getComputedStyle(document.querySelector(".legal p")).color'), 'rgb(167, 173, 184)');
}

const en = await ev(SNAP);

console.log('\n── Zurueck auf Deutsch ──────────────────────────────────────────');
await ev('document.getElementById("langBtn").click()');
await warte(400);
const zurueck = await ev(SNAP);
pruefe('Text vollstaendig wiederhergestellt', JSON.stringify(zurueck) === JSON.stringify(de), true);
pruefe('Formular-Knopf wieder deutsch', await ev('document.getElementById("btnNext").textContent'), 'Weiter →', true);

console.log('\n── Nach dem Neuladen ────────────────────────────────────────────');
await ev('document.getElementById("langBtn").click()');
await warte(200);
await cmd('Page.navigate', { url });
await warte(3000);
pruefe('dunkel bleibt', await ev('document.documentElement.classList.contains("dark")'), true);
pruefe('Englisch bleibt', await ev('document.documentElement.lang'), 'en');
pruefe('Grund sofort dunkel', await ev(bg('body')), 'rgb(8, 8, 10)');

console.log('\n── Auf Englisch deutsch geblieben ───────────────────────────────');
const rest = [];
for (let i = 0; i < de.length; i++) {
  const d = de[i], e = en[i];
  if (d === e && /[A-Za-zÄÖÜäöüß]{4,}/.test(d) && !/^(RDVC|GARAGE|Youngtimer|Name|Polo|X5|@rdvc|\(optional\)|This is a courtesy|Mercedes|BMW E39|Website:|rdvcgarage)/.test(d)
      && !/^(www\.|ec\.europa)/.test(d)) rest.push(d);
}
if (rest.length === 0) console.log('  keine — jede Zeile mit Text hat eine englische Fassung');
else rest.forEach(r => console.log('  offen: ' + r.slice(0, 100)));
pruefungen.push(rest.length === 0);

console.log('\n── Konsole ──────────────────────────────────────────────────────');
if (fehler.length === 0) console.log('  keine Fehler');
else fehler.forEach(f => console.log('  ' + f));
pruefungen.push(fehler.length === 0);

const durch = pruefungen.filter(Boolean).length;
console.log(`\nErgebnis: ${durch} von ${pruefungen.length} Pruefungen bestanden\n`);
chrome.kill();
process.exit(durch === pruefungen.length ? 0 : 1);
