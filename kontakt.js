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
  tiktok:   'https://www.tiktok.com/@rdvc.garage'
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
});
