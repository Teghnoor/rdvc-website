// Prueft die Seite ueber das DevTools-Protokoll: Konsolenfehler, Seitenhoehe,
// und wie viele Abschnitte tatsaechlich sichtbar sind.
import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const url = process.argv[2] ?? 'http://localhost:8899/index.html';

const chrome = spawn(CHROME, [
  '--headless', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  '--window-size=1440,900', 'about:blank'
], { stdio: 'ignore' });

const warte = (ms) => new Promise(r => setTimeout(r, ms));
await warte(1500);

const liste = await (await fetch(`http://localhost:${PORT}/json/list`)).json();
const ziel = liste.find(t => t.type === 'page');
const ws = new WebSocket(ziel.webSocketDebuggerUrl);
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

await cmd('Runtime.enable');
await cmd('Page.enable');
await cmd('Page.navigate', { url });
await warte(3500);

const ev = async (expr) => (await cmd('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.value;

console.log('URL:            ', url);
console.log('Titel:          ', await ev('document.title'));
console.log('Seitenhoehe:    ', await ev('document.documentElement.scrollHeight') + ' px');
console.log('Breite/Overflow:', await ev('document.documentElement.scrollWidth') + ' / ' + await ev('window.innerWidth'));
console.log('.rv gesamt:     ', await ev("document.querySelectorAll('.rv').length"));
console.log('.rv sichtbar:   ', await ev("document.querySelectorAll('.rv.on').length"));
console.log('unsichtbar:     ', await ev("[...document.querySelectorAll('.rv:not(.on)')].map(e=>e.querySelector('h2,h3')?.textContent?.trim().slice(0,40)??e.className.slice(0,30)).join(' | ')"));
console.log('Formularschritte:', await ev("document.querySelectorAll('.fstep').length"));
console.log('Konsolenfehler: ', fehler.length ? fehler.join('\n  ') : 'keine');

ws.close(); chrome.kill();
