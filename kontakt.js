/* Ein Ort fuer alle Kontaktwege. Formular, FAQ-Bot, Fusszeile und die
   Rechtsseiten lesen hier — sonst steht die Nummer an vier Stellen und
   eine davon bleibt beim naechsten Wechsel stehen.

   whatsapp: internationale Nummer OHNE Plus und ohne Leerzeichen,
             oesterreichische Handynummer 0664 1234567 wird zu 436641234567.
   Solange whatsapp leer ist, zeigt die Seite keinen WhatsApp-Weg an und das
   Formular meldet ehrlich, dass der Versand nicht eingerichtet ist. Das ist
   Absicht: ein Knopf, der ins Leere fuehrt, ist schlimmer als kein Knopf. */
window.RDVC_KONTAKT = {
  whatsapp: '',
  telefon:  '',
  tiktok:   'https://www.tiktok.com/@rdvc.garage',

  /* ── Google-Unternehmensprofil ──────────────────────────────────────
     google       Profilseite in Google Maps, fuer "alle Bewertungen lesen"
     googleReview Der DIREKTE Bewertungslink aus dem Profil
                  (Bewertungen erhalten -> Link kopieren), Form g.page/r/…/review.
                  Die Profil-URL tut es NICHT — sie fuehrt auf die Uebersicht,
                  der Kunde muss dann selbst suchen und springt ab.
     sterne       Schnitt als Zahl, z. B. 4.9. null solange keine da sind.
     anzahl       Anzahl Bewertungen als Zahl.
     stimmen      Ausgewaehlte Bewertungen IM WORTLAUT. Nichts umschreiben,
                  nichts erfinden — der Abschnitt ist ein Beleg, keine Werbung.
                  { text, name, auto } — Nachname weglassen.

     Solange stimmen leer ist, wird der ganze Bewertungs-Abschnitt entfernt,
     samt Navigationspunkt. Kein Platzhalter, keine erfundenen Zitate:
     erfundener Social Proof verstoesst gegen das UWG und Googles Richtlinien
     und faellt genau dann auf, wenn ein Kunde nachzaehlt. */
  google:       '',
  googleReview: '',
  sterne:       null,
  anzahl:       0,
  stimmen:      []
};

/* wa.me-Link mit vorformuliertem Text, oder null wenn keine Nummer steht. */
window.RDVC_KONTAKT.waLink = function (text) {
  var n = (window.RDVC_KONTAKT.whatsapp || '').replace(/[^0-9]/g, '');
  if (!n) return null;
  return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
};

/* Jedes [data-wa] bekommt den Link. Ohne Nummer wird der ganze Satz bzw. die
   Zeile entfernt, statt einen Knopf stehen zu lassen, der nichts tut.
   [data-wa-zeile] markiert das Element, das in dem Fall verschwinden soll. */
document.addEventListener('DOMContentLoaded', function () {
  var wa = window.RDVC_KONTAKT.waLink('Hallo RDVC, ');
  /* [data-ohne-wa] ist die Fassung ohne WhatsApp. Sie verschwindet, sobald
     eine Nummer steht — sonst stuende der Satz zweimal da. */
  document.querySelectorAll('[data-ohne-wa]').forEach(function (e) { if (wa) e.remove(); });
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    if (wa) {
      a.href = wa; a.target = '_blank'; a.rel = 'noopener';
      var zeile = a.closest('[data-wa-zeile]');
      if (zeile) zeile.hidden = false;
    } else {
      var weg = a.closest('[data-wa-zeile]');
      if (weg) weg.remove();
      else a.replaceWith(document.createTextNode(a.textContent));
    }
  });

  zeichneBewertungen();
});

/* Baut den Bewertungs-Abschnitt aus RDVC_KONTAKT.stimmen. Gibt es keine
   Stimmen, verschwindet der Abschnitt komplett — inklusive der beiden
   Navigationspunkte. Deshalb steht im HTML nur das leere Geruest. */
function zeichneBewertungen() {
  var k = window.RDVC_KONTAKT;
  var abschnitt = document.getElementById('bewertungen');
  if (!abschnitt) return;

  var stimmen = Array.isArray(k.stimmen) ? k.stimmen : [];
  if (!stimmen.length) {
    abschnitt.remove();
    document.querySelectorAll('[data-bw-nav]').forEach(function (e) { e.remove(); });
    return;
  }

  abschnitt.hidden = false;

  /* Kopfzeile: Schnitt und Anzahl nur zeigen, wenn beide wirklich gesetzt
     sind. Eine Zahl schaetzen waere hier eine Falschangabe. */
  var kopf = abschnitt.querySelector('[data-bw-schnitt]');
  if (kopf) {
    if (k.sterne && k.anzahl) {
      /* Selbst geschrieben, also selbst uebersetzt — data-nt haelt den
         Umschalter fern, dafuer zeichnet rdvc:lang die Zeile neu. */
      kopf.setAttribute('data-nt', '');
      var schreibeSchnitt = function () {
        var en = document.documentElement.lang === 'en';
        kopf.textContent = en
          ? String(k.sterne) + ' out of 5 · ' + k.anzahl + ' reviews'
          : String(k.sterne).replace('.', ',') + ' von 5 · ' + k.anzahl + ' Bewertungen';
      };
      schreibeSchnitt();
      document.addEventListener('rdvc:lang', schreibeSchnitt);
      kopf.hidden = false;
    } else {
      kopf.remove();
    }
  }

  var liste = abschnitt.querySelector('[data-bw-liste]');
  if (liste) {
    liste.textContent = '';
    stimmen.slice(0, 3).forEach(function (s, i) {
      var karte = document.createElement('figure');
      karte.className = 'card p-6 rv';
      karte.style.setProperty('--rvd', (0.05 + i * 0.07).toFixed(2) + 's');
      /* data-nt: der Sprachumschalter laesst diesen Teilbaum in Ruhe.
         Eine Kundenbewertung wird nicht uebersetzt — uebersetzt waere sie
         nicht mehr das, was der Kunde geschrieben hat. */
      karte.setAttribute('data-nt', '');

      var zitat = document.createElement('blockquote');
      zitat.className = 'text-sm text-slate leading-relaxed';
      /* textContent, nicht innerHTML: der Text kommt von Kunden. */
      zitat.textContent = '„' + s.text + '“';

      var wer = document.createElement('figcaption');
      wer.className = 'mt-4 text-xs font-bold tracking-wide uppercase';
      wer.textContent = [s.name, s.auto].filter(Boolean).join(' · ');

      karte.appendChild(zitat);
      karte.appendChild(wer);
      liste.appendChild(karte);
      /* Die .rv-Karten sind bis zum Einblenden durchsichtig. Der Beobachter in
         index.html laeuft seine Schleife nur einmal, vor diesen Karten —
         deshalb hier nachmelden, sonst bleibt der Abschnitt leer. */
      if (window.RDVC_REVEAL) window.RDVC_REVEAL(karte);
      else karte.classList.add('on');
    });
  }

  /* Weiterfuehrende Links: Profil zum Lesen, Review-Link zum Schreiben.
     Fehlt einer davon, faellt nur dieser Knopf weg. */
  var paare = [['[data-bw-profil]', k.google], ['[data-bw-schreiben]', k.googleReview]];
  paare.forEach(function (p) {
    abschnitt.querySelectorAll(p[0]).forEach(function (a) {
      if (p[1]) { a.href = p[1]; a.target = '_blank'; a.rel = 'noopener'; a.hidden = false; }
      else a.remove();
    });
  });
}
