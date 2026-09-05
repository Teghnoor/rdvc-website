// Prueft den Fragenhelfer am laufenden Browser, nicht am Quelltext.
//
// Der wichtigste Test steht unten: die Preise stehen zweimal — in den
// Paketkarten und in der Antwort des Helfers. Laufen sie auseinander,
// bekommt der Kunde im Chat einen anderen Preis als auf der Seite, und
// das faellt erst auf, wenn er danach fragt. Deshalb hier ein Gate.
//
// Zweiter Punkt: jede hinterlegte Frage muss ihren EIGENEN Eintrag
// treffen. Wenn zwei Eintraege sich Schlagworte teilen, antwortet der
// Helfer selbstbewusst falsch — schlimmer als gar nicht zu antworten.
import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9339;
const url = process.argv[2] ?? 'http://localhost:8899/index.html';

const chrome = spawn(CHROME, ['--headless','--disable-gpu',`--remote-debugging-port=${PORT}`,
  '--window-size=1440,900','about:blank'], { stdio: 'ignore' });
const warte = (ms) => new Promise(r => setTimeout(r, ms));
await warte(4000);

const liste = await (await fetch(`http://localhost:${PORT}/json/list`)).json();
const ws = new WebSocket(liste.find(t => t.type === 'page').webSocketDebuggerUrl);
let id = 0; const offen = new Map(); const fehler = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && offen.has(m.id)) { offen.get(m.id)(m.result); offen.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') fehler.push(m.params.exceptionDetails.text);
};
await new Promise(r => ws.onopen = r);
const cmd = (m, p = {}) => new Promise(res => { const i = ++id; offen.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const ev  = async (x) => (await cmd('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result?.value;

await cmd('Runtime.enable'); await cmd('Page.enable');
await cmd('Page.navigate', { url }); await warte(3000);

const pruefungen = [];
const pruefe = (name, ist, soll) => {
  const ok = typeof soll === 'function' ? soll(ist) : ist === soll;
  pruefungen.push(ok);
  console.log(`${ok ? '  OK  ' : '  FEHLT'} ${name}  →  ${JSON.stringify(ist)?.slice(0, 130)}`);
};

console.log('\n── Bedienung ───────────────────────────────────────────────────');
pruefe('Knopf vorhanden',        await ev('!!document.querySelector(".bot-knopf")'), true);
pruefe('Panel anfangs zu',       await ev('document.querySelector(".bot-panel").hidden'), true);
await ev('document.querySelector(".bot-knopf").click()'); await warte(300);
pruefe('oeffnet auf Klick',      await ev('!document.querySelector(".bot-panel").hidden'), true);
pruefe('aria-expanded gesetzt',  await ev('document.querySelector(".bot-knopf").getAttribute("aria-expanded")'), 'true');
pruefe('Begruessung steht da',   await ev('document.querySelectorAll(".bot-blase").length'), n => n >= 1);
pruefe('Vorschlaege angeboten',  await ev('document.querySelectorAll(".bot-chip").length'), n => n >= 3);
await ev('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))'); await warte(250);
pruefe('Escape schliesst',       await ev('document.querySelector(".bot-panel").hidden'), true);
await ev('document.querySelector(".bot-knopf").click()'); await warte(300);

console.log('\n── Trifft jede Frage ihren eigenen Eintrag? ─────────────────────');
const treffer = await ev(`(() => {
  const w = window.RDVC_BOT.wissen, aus = [];
  w.forEach(e => {
    const g = window.RDVC_BOT.suche(e.frage.de);
    aus.push({ id: e.id, traf: g ? g.id : null });
  });
  return JSON.stringify(aus);
})()`);
const daneben = JSON.parse(treffer).filter(x => x.traf !== x.id);
daneben.forEach(x => console.log(`  daneben: "${x.id}" landet bei "${x.traf}"`));
pruefe('jede Frage trifft sich selbst', daneben.length, 0);

console.log('\n── Antwortet er, statt zu raten? ────────────────────────────────');
pruefe('Preisfrage erkannt',   await ev('window.RDVC_BOT.suche("was kostet eine politur")?.id'), 'preise');
pruefe('Kaufanfrage erkannt',  await ev('window.RDVC_BOT.suche("steht der e39 zum verkauf")?.id'), 'autokauf');
pruefe('Abholung erkannt',     await ev('window.RDVC_BOT.suche("kommt ihr zu mir")?.id'), 'abholung');
pruefe('Englisch erkannt',     await ev('window.RDVC_BOT.suche("how much does it cost")?.id'), 'preise');
pruefe('Unsinn wird NICHT geraten', await ev('window.RDVC_BOT.suche("wie ist das wetter morgen")'), null);

console.log('\n── Stimmen die Preise im Helfer mit der Seite ueberein? ─────────');
const seite = await ev(`JSON.stringify([...document.querySelectorAll('#pakete .price-num')].map(e => e.textContent.trim()))`);
const imBot = await ev(`window.RDVC_BOT.wissen.find(e => e.id === 'preise').antwort.de`);
const preise = JSON.parse(seite);
console.log('  Seite:  ' + preise.join('  '));
preise.forEach(p => {
  const zahl = p.replace(/[^0-9]/g, '');
  pruefe(`Preis ${p} steht auch im Helfer`, imBot.replace(/[^0-9]/g, '').includes(zahl), true);
});

console.log('\n── Zweisprachig ────────────────────────────────────────────────');
await ev(`document.querySelector('.bot-eingabe input').value='was kostet das';
  document.querySelector('.bot-eingabe').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}))`);
await warte(400);
const vorher = await ev('document.querySelectorAll(".bot-blase").length');
pruefe('Frage und Antwort im Verlauf', vorher, n => n >= 3);
await ev('document.getElementById("langBtn").click()'); await warte(600);
pruefe('Verlauf gleich lang nach Sprachwechsel', await ev('document.querySelectorAll(".bot-blase").length'), vorher);
pruefe('Antwort jetzt englisch',
  await ev('[...document.querySelectorAll(".bot-bot")].pop().textContent'), s => /Basic Care/.test(s) && /package|price|cost/i.test(s));
pruefe('Vorschlaege englisch',
  await ev('document.querySelector(".bot-chip")?.textContent'), s => !!s && !/[äöüß]/.test(s));
await ev('document.getElementById("langBtn").click()'); await warte(500);

console.log('\n── WhatsApp ────────────────────────────────────────────────────');
const nummerGesetzt = await ev('!!(window.RDVC_KONTAKT && window.RDVC_KONTAKT.whatsapp)');
pruefe('wa.me-Links nur wenn eine Nummer hinterlegt ist',
  await ev(`[...document.querySelectorAll('a')].filter(a => /wa\\.me/.test(a.href)).length`),
  n => (nummerGesetzt ? n > 0 : n === 0));
console.log('  Nummer in kontakt.js gesetzt: ' + nummerGesetzt);
if (!nummerGesetzt) {
  pruefe('Rueckfall fuehrt zum Formular, nicht ins Leere',
    await ev(`document.querySelector('.bot-wa')?.getAttribute('href')`), h => /#buchen/.test(h || ''));
  pruefe('Rueckfall traegt nicht das WhatsApp-Gruen',
    await ev(`document.querySelector('.bot-wa')?.classList.contains('bot-wa-aus')`), true);
}
// Mit Testnummer: wird ueberall ein echter wa.me-Link daraus?
await ev(`window.RDVC_KONTAKT.whatsapp = '436641234567';
  document.dispatchEvent(new Event('rdvc:lang'))`);
await warte(300);
pruefe('mit Nummer wird der Knopf zu wa.me',
  await ev(`document.querySelector('.bot-wa')?.getAttribute('href')`), h => /^https:\/\/wa\.me\/436641234567/.test(h || ''));
pruefe('Text ist vorformuliert',
  await ev(`decodeURIComponent(document.querySelector('.bot-wa')?.getAttribute('href') || '')`), h => /RDVC/.test(h));

console.log('\n── Konsole ─────────────────────────────────────────────────────');
if (fehler.length === 0) console.log('  keine Fehler');
else fehler.forEach(f => console.log('  ' + f));
pruefungen.push(fehler.length === 0);

const durch = pruefungen.filter(Boolean).length;
console.log(`\nErgebnis: ${durch} von ${pruefungen.length} Pruefungen bestanden\n`);
chrome.kill();
process.exit(durch === pruefungen.length ? 0 : 1);
