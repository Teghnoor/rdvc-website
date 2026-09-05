/* RDVC-Fragenhelfer — beantwortet die haeufigsten Fragen sofort und uebergibt
   den Rest an WhatsApp.

   Bewusst OHNE Sprachmodell: die Seite ist statisch, ein API-Schluessel im
   Frontend waere oeffentlich. Der Helfer trifft ueber Schlagworte, gewichtet
   nach Treffern, und sagt ehrlich Bescheid, wenn er nichts findet, statt zu
   raten. Falsche Preisauskunft kostet mehr als eine ehrliche Weiterleitung.

   Zweisprachig: jeder Eintrag traegt DE und EN. Die Sprache kommt aus
   <html lang>, das Ereignis rdvc:lang zeichnet den Verlauf neu. */
(function () {
  'use strict';

  var K = window.RDVC_KONTAKT || {};
  var sprache = function () { return document.documentElement.lang === 'en' ? 'en' : 'de'; };
  var t = function (paar) { return paar[sprache()]; };

  /* ── Wissen ───────────────────────────────────────────────────────────
     Preise stehen hier ein zweites Mal. Wer sie auf der Seite aendert,
     muss sie hier mitaendern — pruefe-bot.mjs vergleicht beide und faellt
     durch, wenn sie auseinanderlaufen. */
  var WISSEN = [
    {
      id: 'preise',
      wort: { de: ['preis','preise','kostet','kosten','teuer','was zahlt','wieviel','wie viel','tarif'],
              en: ['price','prices','cost','costs','how much','expensive','rate'] },
      frage:  { de: 'Was kostet das?', en: 'What does it cost?' },
      antwort:{ de: 'Vier Pakete, alle mit Handwäsche, Fenster und Felgen außen:\n\n' +
                    '• RDVC Basic Care — 70 €, innen gesaugt und abgestaubt\n' +
                    '• RDVC Interior Care — ab 120 €, Innenraum intensiv\n' +
                    '• RDVC Paint Care — 250 €, Politur in zwei Durchgängen plus Innen intensiv\n' +
                    '• RDVC Premium Care — 699 €, dazu Keramikversiegelung\n\n' +
                    'Bei Interior Care hängt der Preis vom Zustand ab, den sehen wir beim Zustandscheck. ' +
                    'Was dazukommt, sagen wir vorher.',
                en: 'Four packages, each with a hand wash, windows and wheels on the outside:\n\n' +
                    '• RDVC Basic Care — 70 €, vacuumed and dusted inside\n' +
                    '• RDVC Interior Care — from 120 €, deep interior clean\n' +
                    '• RDVC Paint Care — 250 €, two passes of polish plus deep interior\n' +
                    '• RDVC Premium Care — 699 €, ceramic coating on top\n\n' +
                    'For Interior Care the price depends on the condition, which we see at the check. ' +
                    'Anything extra we tell you beforehand.' }
    },
    {
      id: 'abholung',
      wort: { de: ['abholen','abholung','holen','bringen','hol','bring','mobil','vorbeikommen','kommt ihr','zu mir','anfahrt','fahren','hinfahren','vorbei','selber bringen','werkstatt'],
              en: ['pick up','pickup','collect','deliver','delivery','mobile','come to me','do you come','drive to you','workshop'] },
      frage:  { de: 'Muss ich zu euch fahren?', en: 'Do I have to come to you?' },
      antwort:{ de: 'Nein. Wir holen den Wagen bei Ihnen ab, arbeiten in unserer Halle und bringen ihn zurück. ' +
                    'Sie müssen nirgendwo hinfahren und nicht warten.\n\n' +
                    'In der Halle gearbeitet wird aus zwei Gründen: In Wien darf auf öffentlichem Grund nicht ' +
                    'gewaschen werden, und Politur braucht gleichmäßiges Licht und Windstille.',
                en: 'No. We collect the car from you, work on it in our workshop and bring it back. ' +
                    'You do not have to drive anywhere or wait around.\n\n' +
                    'We work indoors for two reasons: washing on public ground is not allowed in Vienna, ' +
                    'and polishing needs even light and no wind.' }
    },
    {
      id: 'dauer',
      wort: { de: ['lange','dauer','dauert','wie lang','weg','zeit','stunden','tage'],
              en: ['how long','duration','take','takes','days','hours','time'] },
      frage:  { de: 'Wie lange ist mein Auto weg?', en: 'How long is my car away?' },
      antwort:{ de: 'Basic Care am selben Tag, Interior Care meist auch, bei starker Verschmutzung einen Tag. ' +
                    'Paint Care braucht einen Tag, Premium Care mit Keramik ein bis zwei.\n\n' +
                    'Den genauen Zeitraum sagen wir bei der Zusage, nicht erst bei der Abholung.',
                en: 'Basic Care the same day, Interior Care usually too, a day if the car is heavily soiled. ' +
                    'Paint Care takes a day, Premium Care with ceramic one to two.\n\n' +
                    'We tell you the exact window when we confirm, not when we collect the car.' }
    },
    {
      id: 'gebiet',
      wort: { de: ['wien','bezirk','gebiet','umgebung','wo seid','standort','niederösterreich','entfernung','weit'],
              en: ['vienna','area','district','where are you','location','how far','distance'] },
      frage:  { de: 'Wo seid ihr unterwegs?', en: 'Which area do you cover?' },
      antwort:{ de: 'Wien und der Speckgürtel. Sagen Sie uns Ihre Postleitzahl, dann sagen wir Ihnen, ' +
                    'ob die Abholung passt und was sie kostet.',
                en: 'Vienna and the surrounding belt. Tell us your postcode and we will say whether ' +
                    'a pick-up works and what it costs.' }
    },
    {
      id: 'keramik',
      wort: { de: ['keramik','versiegelung','coating','beschichtung','schutz','wachs','wie lange hält'],
              en: ['ceramic','coating','sealant','wax','protection','how long does it last'] },
      frage:  { de: 'Was bringt Keramik?', en: 'What does a ceramic coating do?' },
      antwort:{ de: 'Eine normale Versiegelung hält ein halbes Jahr, Keramik zwei bis fünf Jahre. ' +
                    'Sinnvoll ist sie nur auf korrigiertem Lack, deshalb gibt es sie nicht einzeln, ' +
                    'sondern zusammen mit der Politur in RDVC Premium Care für 699 €.',
                en: 'A normal sealant lasts about six months, ceramic two to five years. ' +
                    'It only makes sense on corrected paint, so we do not sell it separately — ' +
                    'it comes with the polish in RDVC Premium Care at 699 €.' }
    },
    {
      id: 'youngtimer',
      wort: { de: ['youngtimer','oldtimer','klassiker','alte autos','altes auto','alter wagen','e30','e39','w124','w140','190e','sammler','lack dünn','originallack'],
              /* 'alt' allein blieb unter der Trefferschwelle und war ausserdem
                 zu unspezifisch — es steckt in zu vielen harmlosen Saetzen. */
              en: ['youngtimer','oldtimer','classic','vintage','collector','old car','thin paint','original paint'] },
      frage:  { de: 'Könnt ihr auch alte Autos?', en: 'Do you work on classic cars?' },
      antwort:{ de: 'Das ist unser Schwerpunkt. Bei einem 190er oder einem E39 ist der Lack oft dünn und ' +
                    'schon einmal poliert worden, da wird vorher gemessen statt drauflos poliert. ' +
                    'Wenn eine Stelle nicht mehr hergibt, sagen wir das, statt sie durchzupolieren.',
                en: 'That is our focus. On a 190E or an E39 the paint is often thin and has been polished ' +
                    'before, so we measure first instead of just going at it. If an area has nothing left ' +
                    'to give, we say so instead of polishing through it.' }
    },
    {
      id: 'autokauf',
      wort: { de: ['kaufen','verkauf','verkauft','zu verkaufen','steht der','preis für den','auto kaufen','abzugeben','km','baujahr'],
              en: ['buy','sell','for sale','is it for sale','purchase','mileage','year'] },
      frage:  { de: 'Verkauft ihr auch Autos?', en: 'Do you sell cars too?' },
      antwort:{ de: 'Ja. Was gerade abzugeben ist, steht auf der Seite unter „Fahrzeuge". Jedes davon ist ' +
                    'durch unsere eigene Aufbereitung gegangen.\n\n' +
                    'Wenn Sie etwas Bestimmtes suchen, schreiben Sie uns — in der Halle steht oft mehr, ' +
                    'als online zu sehen ist.',
                en: 'Yes. Whatever is currently available is on the page under “Cars”. Every one of them ' +
                    'has been through our own detailing.\n\n' +
                    'If you are after something specific, message us — there is often more in the ' +
                    'workshop than is listed online.' }
    },
    {
      id: 'zustand',
      wort: { de: ['tierhaare','hund','katze','nikotin','raucher','schimmel','geruch','stinkt','dreckig','verschmutzt','sand','aufpreis','schlimm','katastrophe','versaut','verdreckt'],
              en: ['pet hair','dog','cat','nicotine','smoke','mould','mold','smell','dirty','sand','surcharge','really bad','bad state','filthy'] },
      frage:  { de: 'Mein Auto ist wirklich schlimm', en: 'My car is in a really bad state' },
      antwort:{ de: 'Tierhaare, Nikotin, Schimmel oder Bausand kosten Zeit. Wir sehen das beim Zustandscheck ' +
                    'vor Ort und nennen den Aufpreis, bevor wir losfahren. Sie können dann immer noch nein sagen. ' +
                    'Nachträgliche Positionen auf der Rechnung gibt es bei uns nicht.',
                en: 'Pet hair, nicotine, mould or building sand cost time. We see that at the check on site ' +
                    'and name the surcharge before we drive off. You can still say no at that point. ' +
                    'Items added to the invoice afterwards do not happen here.' }
    },
    {
      id: 'termin',
      wort: { de: ['termin','buchen','anfragen','anmelden','warteliste','wie schnell','platz frei','termine'],
              en: ['appointment','booking','book a','availability','free slot','how soon'] },
      frage:  { de: 'Wie bekomme ich einen Termin?', en: 'How do I book?' },
      antwort:{ de: 'Über das Formular auf dieser Seite — vier Schritte, danach melden wir uns mit Fixpreis ' +
                    'und Termin. Schneller geht es per WhatsApp.',
                en: 'Through the form on this page — four steps, then we come back with a fixed price and ' +
                    'a date. WhatsApp is quicker.' }
    },
    {
      id: 'zahlung',
      wort: { de: ['zahlen','zahlung','bar','karte','überweisung','rechnung','anzahlung'],
              en: ['pay','payment','cash','card','invoice','transfer','deposit'] },
      frage:  { de: 'Wie kann ich zahlen?', en: 'How can I pay?' },
      antwort:{ de: 'Das klären wir direkt bei der Anfrage — schreiben Sie uns kurz, dann bekommen Sie eine ' +
                    'verbindliche Antwort statt einer allgemeinen.',
                en: 'We sort that out with your enquiry — message us and you get a binding answer instead ' +
                    'of a general one.' }
    }
  ];

  var TEXTE = {
    titel:      { de: 'Fragen zum Auto?', en: 'Questions about your car?' },
    unter:      { de: 'Antwortet sofort · kein Warten', en: 'Answers right away · no waiting' },
    gruss:      { de: 'Servus. Fragen Sie einfach — Preise, Ablauf, wie lange es dauert. Was ich nicht weiß, ' +
                      'gebe ich weiter, statt zu raten.',
                  en: 'Hello. Ask away — prices, how it works, how long it takes. What I do not know I pass ' +
                      'on rather than guess.' },
    platzhalter:{ de: 'Frage eintippen …', en: 'Type your question …' },
    senden:     { de: 'Senden', en: 'Send' },
    oeffnen:    { de: 'Fragen', en: 'Ask' },
    schliessen: { de: 'Schließen', en: 'Close' },
    nichts:     { de: 'Das kann ich nicht sicher beantworten, und geraten hilft Ihnen nicht. ' +
                      'Schreiben Sie uns direkt, dann bekommen Sie eine verbindliche Antwort. ' +
                      'Oder fragen Sie eines davon:',
                  en: 'I cannot answer that with any certainty, and guessing does not help you. ' +
                      'Message us directly for a binding answer. Or try one of these:' },
    waKnopf:    { de: 'Auf WhatsApp schreiben', en: 'Message us on WhatsApp' },
    waFehlt:    { de: 'Direkt zum Formular', en: 'Go to the form' },
    waText:     { de: 'Hallo RDVC, ich habe eine Frage: ', en: 'Hi RDVC, I have a question: ' },
    mehr:       { de: 'Häufig gefragt:', en: 'Frequently asked:' }
  };

  /* ── Treffer suchen ──────────────────────────────────────────────────
     Ein laengeres Schlagwort wiegt schwerer als ein kurzes: „keramik"
     soll nicht gegen „was" verlieren. Unter der Schwelle wird nicht
     geraten, sondern weitergeleitet. */
  function suche(eingabe) {
    var text = ' ' + eingabe.toLowerCase().replace(/[^\wäöüß\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
    var besteId = null, bestePunkte = 0;
    WISSEN.forEach(function (e) {
      var punkte = 0;
      /* Immer beide Sprachlisten: wer die Seite auf Deutsch liest, tippt
         trotzdem manchmal englisch, und umgekehrt. */
      e.wort.de.concat(e.wort.en).forEach(function (w) {
        if (text.indexOf(' ' + w) !== -1 || text.indexOf(w + ' ') !== -1) punkte += w.length;
      });
      if (punkte > bestePunkte) { bestePunkte = punkte; besteId = e; }
    });
    return bestePunkte >= 4 ? besteId : null;
  }

  /* ── Aufbau ──────────────────────────────────────────────────────── */
  var knopf = document.createElement('button');
  knopf.type = 'button';
  knopf.className = 'bot-knopf';
  knopf.setAttribute('aria-expanded', 'false');
  knopf.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
    '<span class="bot-knopf-text"></span>';

  var panel = document.createElement('div');
  panel.className = 'bot-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.innerHTML =
    '<div class="bot-kopf">' +
      '<div><p class="bot-titel"></p><p class="bot-unter"></p></div>' +
      '<button type="button" class="bot-zu" aria-label="">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="bot-verlauf" role="log" aria-live="polite"></div>' +
    '<div class="bot-chips"></div>' +
    '<form class="bot-eingabe"><input type="text" autocomplete="off"><button type="submit"></button></form>' +
    '<div class="bot-fuss"></div>';

  document.body.appendChild(knopf);
  document.body.appendChild(panel);

  var verlauf = panel.querySelector('.bot-verlauf');
  var chips   = panel.querySelector('.bot-chips');
  var form    = panel.querySelector('.bot-eingabe');
  var feld    = form.querySelector('input');
  var fuss    = panel.querySelector('.bot-fuss');

  /* Was gesagt wurde, wird gemerkt statt nur gezeichnet — beim
     Sprachwechsel wird der Verlauf sonst inkonsistent zweisprachig. */
  var gesagt = [];

  function blase(wer, inhalt) {
    var d = document.createElement('div');
    d.className = 'bot-blase bot-' + wer;
    inhalt.split('\n').forEach(function (zeile, i) {
      if (i) d.appendChild(document.createElement('br'));
      d.appendChild(document.createTextNode(zeile));
    });
    verlauf.appendChild(d);
    verlauf.scrollTop = verlauf.scrollHeight;
    return d;
  }

  function zeichneChips(liste) {
    chips.textContent = '';
    liste.forEach(function (e) {
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'bot-chip';
      c.textContent = t(e.frage);
      c.addEventListener('click', function () { frage(t(e.frage), e); });
      chips.appendChild(c);
    });
  }

  function vorschlaege() {
    var offen = WISSEN.filter(function (e) {
      return !gesagt.some(function (g) { return g.eintrag === e; });
    });
    zeichneChips((offen.length ? offen : WISSEN).slice(0, 4));
  }

  function frage(text, treffer) {
    gesagt.push({ wer: 'ich', text: text });
    blase('ich', text);
    var e = treffer || suche(text);
    if (e) {
      gesagt.push({ wer: 'bot', eintrag: e });
      blase('bot', t(e.antwort));
    } else {
      gesagt.push({ wer: 'bot', text: 'nichts' });
      blase('bot', t(TEXTE.nichts));
    }
    vorschlaege();
  }

  function zeichneFuss() {
    fuss.textContent = '';
    var link = document.createElement('a');
    var wa = K.waLink && K.waLink(t(TEXTE.waText));
    if (wa) {
      link.href = wa; link.target = '_blank'; link.rel = 'noopener';
      link.textContent = t(TEXTE.waKnopf);
      link.className = 'bot-wa';
    } else {
      link.href = document.getElementById('buchen') ? '#buchen' : 'index.html#buchen';
      link.textContent = t(TEXTE.waFehlt);
      link.className = 'bot-wa bot-wa-aus';   /* nicht gruen: es ist kein WhatsApp */
      link.addEventListener('click', function () { zu(); });
    }
    fuss.appendChild(link);
  }

  /* Beim Sprachwechsel den ganzen Verlauf neu zeichnen, statt Deutsch und
     Englisch untereinander stehen zu lassen. */
  function neuZeichnen() {
    knopf.querySelector('.bot-knopf-text').textContent = t(TEXTE.oeffnen);
    knopf.setAttribute('aria-label', t(TEXTE.titel));
    panel.querySelector('.bot-titel').textContent = t(TEXTE.titel);
    panel.querySelector('.bot-unter').textContent = t(TEXTE.unter);
    panel.querySelector('.bot-zu').setAttribute('aria-label', t(TEXTE.schliessen));
    feld.placeholder = t(TEXTE.platzhalter);
    form.querySelector('button').textContent = t(TEXTE.senden);
    verlauf.textContent = '';
    blase('bot', t(TEXTE.gruss));
    gesagt.forEach(function (g) {
      if (g.wer === 'ich') blase('ich', g.text);
      else if (g.eintrag) blase('bot', t(g.eintrag.antwort));
      else blase('bot', t(TEXTE.nichts));
    });
    vorschlaege();
    zeichneFuss();
  }

  function auf() {
    panel.hidden = false;
    knopf.setAttribute('aria-expanded', 'true');
    knopf.classList.add('bot-knopf-aktiv');
    feld.focus();
  }
  function zu() {
    panel.hidden = true;
    knopf.setAttribute('aria-expanded', 'false');
    knopf.classList.remove('bot-knopf-aktiv');
    knopf.focus();
  }

  knopf.addEventListener('click', function () { panel.hidden ? auf() : zu(); });
  panel.querySelector('.bot-zu').addEventListener('click', zu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) zu(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = feld.value.trim();
    if (!v) return;
    feld.value = '';
    frage(v);
  });
  document.addEventListener('rdvc:lang', neuZeichnen);

  neuZeichnen();
  window.RDVC_BOT = { suche: suche, wissen: WISSEN, oeffnen: auf };
})();
