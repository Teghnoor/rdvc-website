import { spawn } from 'node:child_process';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', PORT=9335;
const chrome=spawn(CHROME,['--headless','--disable-gpu',`--remote-debugging-port=${PORT}`,'about:blank'],{stdio:'ignore'});
const warte=ms=>new Promise(r=>setTimeout(r,ms)); await warte(1500);
const liste=await (await fetch(`http://localhost:${PORT}/json/list`)).json();
const ws=new WebSocket(liste.find(t=>t.type==='page').webSocketDebuggerUrl);
let id=0; const offen=new Map(); const fehler=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.id&&offen.has(m.id)){offen.get(m.id)(m.result);offen.delete(m.id);}
  if(m.method==='Runtime.exceptionThrown')fehler.push(m.params.exceptionDetails.text);};
await new Promise(r=>ws.onopen=r);
const cmd=(m,p={})=>new Promise(res=>{const mid=++id;offen.set(mid,res);ws.send(JSON.stringify({id:mid,method:m,params:p}));});
await cmd('Runtime.enable');
await cmd('Page.navigate',{url:'http://localhost:8899/index.html'}); await warte(2500);
const ev=async x=>(await cmd('Runtime.evaluate',{expression:x,returnByValue:true})).result?.value;

const pruef=(bed,text,detail='')=>console.log(`[${bed?'  OK  ':' FEHL '}] ${text}${detail?' — '+detail:''}`);

// 1. Weiter ohne Auswahl muss blockieren
await ev("document.getElementById('btnNext').click()");
pruef(await ev("!document.getElementById('formError').classList.contains('hidden')"),
      'Weiter ohne Leistung wird abgewiesen', await ev("document.getElementById('formError').textContent"));
pruef(await ev("document.getElementById('stepLabel').textContent") === 'Schritt 1 von 4',
      'Bleibt auf Schritt 1');

// 2. Leistung waehlen, weiter
await ev("document.querySelector('.opt-btn[data-value=\"RDVC Paint Care\"]').click()");
await ev("document.getElementById('btnNext').click()"); await warte(300);
pruef(await ev("document.getElementById('stepLabel').textContent")==='Schritt 2 von 4','Schritt 2 erreicht');

// 3. Klasse waehlen
await ev("document.querySelector('.opt-btn[data-value=\"SUV / Van\"]').click()");
await ev("document.getElementById('btnNext').click()"); await warte(300);
pruef(await ev("document.getElementById('stepLabel').textContent")==='Schritt 3 von 4','Schritt 3 erreicht');

// 4. Ungueltige PLZ
await ev("document.getElementById('fPlz').value='abc'");
await ev("document.getElementById('btnNext').click()");
pruef(await ev("!document.getElementById('formError').classList.contains('hidden')"),'Ungueltige PLZ wird abgewiesen');

// 5. Gueltig ausfuellen
await ev("document.getElementById('fPlz').value='1160'; document.getElementById('fDatum').value='2026-09-15'");
await ev("document.getElementById('btnNext').click()"); await warte(300);
pruef(await ev("document.getElementById('stepLabel').textContent")==='Schritt 4 von 4','Schritt 4 erreicht');

// 6. Zurueck funktioniert
await ev("document.getElementById('btnBack').click()"); await warte(300);
pruef(await ev("document.getElementById('stepLabel').textContent")==='Schritt 3 von 4','Zurueck springt korrekt');
pruef(await ev("document.getElementById('fPlz').value")==='1160','Eingaben bleiben beim Zurueckspringen erhalten');
await ev("document.getElementById('btnNext').click()"); await warte(300);

// 7. Pflichtfelder
await ev("document.getElementById('btnNext').click()");
pruef((await ev("document.getElementById('formError').textContent")).includes('Namen'),'Fehlender Name wird abgewiesen');
await ev("document.getElementById('fName').value='Max Mustermann'; document.getElementById('fAuto').value='BMW E36'; document.getElementById('fTel').value='+43 660 1234567'");
await ev("document.getElementById('fEmail').value='kaputt@'");
await ev("document.getElementById('btnNext').click()");
pruef((await ev("document.getElementById('formError').textContent")).includes('E-Mail'),'Kaputte E-Mail wird abgewiesen');
await ev("document.getElementById('fEmail').value='max@beispiel.at'");
await ev("document.getElementById('btnNext').click()");
pruef((await ev("document.getElementById('formError').textContent")).includes('Datenverarbeitung'),'Fehlende Zustimmung wird abgewiesen');

// 8. Absenden ohne Endpunkt darf NICHT faelschlich Erfolg melden
await ev("document.getElementById('fDsgvo').checked=true");
await ev("document.getElementById('btnNext').click()"); await warte(500);
pruef(await ev("document.getElementById('formSuccess').classList.contains('hidden')"),
      'Ohne Endpunkt wird KEIN falscher Erfolg gemeldet');
pruef((await ev("document.getElementById('formError').textContent")).includes('noch nicht eingerichtet'),
      'Stattdessen ehrlicher Hinweis', await ev("document.getElementById('formError').textContent"));

console.log('\nKonsolenfehler:', fehler.length?fehler.join(' | '):'keine');
ws.close(); chrome.kill();
