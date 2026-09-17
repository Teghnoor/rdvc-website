import { spawn } from 'node:child_process';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', PORT=9334;
const chrome = spawn(CHROME,['--headless','--disable-gpu',`--remote-debugging-port=${PORT}`,'about:blank'],{stdio:'ignore'});
const warte=ms=>new Promise(r=>setTimeout(r,ms)); await warte(1500);
const liste=await (await fetch(`http://localhost:${PORT}/json/list`)).json();
const ws=new WebSocket(liste.find(t=>t.type==='page').webSocketDebuggerUrl);
let id=0; const offen=new Map(); const fehler=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.id&&offen.has(m.id)){offen.get(m.id)(m.result);offen.delete(m.id);}
  if(m.method==='Runtime.exceptionThrown')fehler.push(m.params.exceptionDetails.text);};
await new Promise(r=>ws.onopen=r);
const cmd=(method,params={})=>new Promise(res=>{const mid=++id;offen.set(mid,res);ws.send(JSON.stringify({id:mid,method,params}));});
await cmd('Runtime.enable'); await cmd('Page.enable');
// Echte Handy-Metriken — --window-size reicht dafuer nicht aus
await cmd('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
// URL als Argument, damit auch die Leistungsseiten geprueft werden koennen.
// Ohne Argument bleibt es die Startseite wie bisher.
const url = process.argv[2] ?? 'http://localhost:8899/index.html';
await cmd('Page.navigate',{url}); await warte(3500);
const ev=async x=>(await cmd('Runtime.evaluate',{expression:x,returnByValue:true})).result?.value;
console.log('Viewport:        ', await ev('window.innerWidth')+'x'+await ev('window.innerHeight'));
console.log('scrollWidth:     ', await ev('document.documentElement.scrollWidth'));
console.log('Horiz. Overflow: ', await ev('document.documentElement.scrollWidth > window.innerWidth ? "JA - FEHLER" : "nein"'));
console.log('Ueberbreite El.: ', await ev("[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right > window.innerWidth+1).map(e=>e.tagName+'.'+String(e.className).slice(0,40)).slice(0,5).join(' | ') || 'keine'"));
console.log('Sticky-CTA da:   ', await ev("!!document.querySelector('.sticky-cta') && getComputedStyle(document.querySelector('.sticky-cta')).display"));
// Den Menue-Knopf gibt es nur auf der Startseite.
console.log('Menue-Knopf:     ', await ev("document.getElementById('menuBtn') ? getComputedStyle(document.getElementById('menuBtn')).display : 'nicht auf dieser Seite'"));
console.log('Konsolenfehler:  ', fehler.length?fehler.join(' | '):'keine');
const shot=await cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
const fs=await import('node:fs'); const name = url.endsWith('index.html') ? 'rdvc-mobil.png' : 'rdvc-mobil-' + url.split('/').pop().replace('.html','') + '.png';
fs.writeFileSync(name,Buffer.from(shot.data,'base64'));
console.log('Screenshot:      ', name);
ws.close(); chrome.kill();
