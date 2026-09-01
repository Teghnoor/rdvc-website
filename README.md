# RDVC Garage — Buchungsseite

Statische Seite für die Fahrzeugaufbereitung mit Hol- und Bringservice in Wien.
Kein Build, kein Framework: HTML öffnen, fertig. Tailwind und die Schriften liegen
lokal im Repo — es geht **kein einziger Request an einen fremden Server**, das hält
die Datenschutzerklärung kurz und die Seite schnell.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die ganze Seite inklusive Buchungsformular |
| `impressum.html` · `datenschutz.html` | Pflichtseiten nach ECG, UGB, Mediengesetz |
| `site.css` | Farbwelt hell/dunkel als Variablen, plus die beiden Umschalter |
| `site.js` | Hell/Dunkel und Deutsch/Englisch, mit dem englischen Wörterbuch |
| `fonts.css` + `fonts/` | Saira und Inter, selbst gehostet |
| `tailwind.js` | Tailwind, lokal statt CDN |
| `scripts/` | Prüfskripte, siehe unten |

## Vor dem Live-Gang — ohne diese drei Dinge geht keine Anfrage ein

**1. Versandweg eintragen.** In `index.html`, im Skriptblock am Ende:

```js
var ENDPUNKT = '';    // z. B. https://formspree.io/f/xxxxxxx
var MAILTO   = '';    // z. B. termin@rdvc.at
```

Solange beide leer sind, meldet das Formular ehrlich „Versand noch nicht
eingerichtet" statt einen Erfolg vorzutäuschen. Das ist Absicht: eine Anfrage,
die ins Leere läuft, ist schlimmer als gar kein Formular.

**2. Alle `tbd`-Markierungen abarbeiten.** Gelb gestrichelt auf der Seite:

```bash
grep -n 'class="tbd"' index.html
grep -n 'PLATZHALTER' impressum.html datenschutz.html
```

**3. Fotos einsetzen.** Die Bildplätze sind bewusst leer gelassen — das beste
Material liegt bereits im TikTok-Account. Hero, vier Youngtimer-Kacheln,
drei Fahrzeugkarten.

## Prüfen

Erst einen lokalen Server starten:

```bash
cd ~/rdvc-website && python3 -m http.server 8899
```

Dann in einem zweiten Fenster:

```bash
node scripts/pruefe-seite.mjs                              # Höhe, Overflow, Konsolenfehler
node scripts/pruefe-seite.mjs http://localhost:8899/index.html#buchen   # Sprung aus der Bio
node scripts/pruefe-handy.mjs                              # echte Handy-Metriken, 390×844
node scripts/pruefe-formular.mjs                           # 13 Prüfungen durchs Formular
node scripts/pruefe-umschalter.mjs                        # Hell/Dunkel + DE/EN, alle drei Seiten
node scripts/pruefe-umschalter.mjs http://localhost:8899/impressum.html
```

Die Skripte sprechen das DevTools-Protokoll direkt an, ohne Puppeteer.
Für die Handy-Ansicht ist das nötig: `--window-size` allein setzt die
Layout-Breite auf macOS **nicht** zuverlässig, macOS erzwingt eine
Mindestfensterbreite. Nur `Emulation.setDeviceMetricsOverride` liefert
echte 390 px.

## Hell/Dunkel und Deutsch/Englisch

Beides sitzt oben rechts in der Kopfleiste und gilt auf allen drei Seiten.
Die Wahl liegt in `localStorage` (`rdvc-theme`, `rdvc-lang`) und überlebt das
Neuladen. Beim allerersten Besuch entscheidet die Systemeinstellung des
Besuchers über hell/dunkel und seine Browsersprache über die Textsprache.

**Farben.** Jede Farbe, die sich zwischen den Modi ändert, steht als Variable
auf `:root` in `site.css`. `html.dark` setzt nur diese Variablen neu. Wer eine
Farbe ändern will, ändert sie an genau einer Stelle. Das `!important` in der
Datei ist Absicht — Tailwind hängt sein Stylesheet zur Laufzeit dahinter und
gewänne sonst bei gleicher Spezifität.

**Sprache.** Deutsch steht im HTML, nicht im Wörterbuch. `site.js` merkt sich
beim ersten Lauf den deutschen Text jedes Textknotens und schlägt für Englisch
in `EN` nach, mit dem deutschen Text als Schlüssel. Daraus folgt:

* Wer die deutsche Seite ändert, ändert **nur das HTML**.
* Eine Zeile ohne Eintrag in `EN` bleibt deutsch stehen, statt zu verschwinden.
* `node scripts/pruefe-umschalter.mjs` listet am Ende jede sichtbare Zeile auf,
  die auf Englisch deutsch geblieben ist — die Liste muss leer sein.

Was das Formular-Skript selbst schreibt (Schrittzähler, Knopf-Beschriftung,
Fehlermeldungen), erreicht der Text-Umschalter nicht. Diese Stellen tragen
`data-nt` und laufen über `RDVC.t()`; beim Sprachwechsel feuert das Ereignis
`rdvc:lang`, worauf das Formular seine Beschriftungen neu zeichnet.

Impressum und Datenschutz sind mit übersetzt, blenden auf Englisch aber einen
Hinweis ein, dass nur die deutsche Fassung rechtlich verbindlich ist.

## Zwei Fallen, die hier schon gelöst sind

**Ohne JavaScript wäre die Seite leer.** Die Abschnitte blenden sich per
`IntersectionObserver` ein und starten auf `opacity: 0`. Ein `<noscript>`-Block
setzt sie hart auf sichtbar. Zusätzlich blendet ein Zeitgeber nach 1,2 s alles
ein, was im Sichtbereich liegt, aber vom Observer nicht erfasst wurde — genau
der Fall beim Sprung aus der TikTok-Bio direkt auf `#buchen`.

**Der Deko-Kreis im Hero ragt über den Rand.** Das ist gewollt und unschädlich,
weil der Abschnitt `overflow-hidden` trägt. Falls `pruefe-handy.mjs` je einen
horizontalen Overflow meldet, ist es *nicht* dieser Kreis, sondern etwas Neues.

## Preise

Stand der Marktrecherche Wien (August 2026): Basis 69 €, Innen ab 149 €,
Politur ab 249 €, Komplett ab 349 €, Keramik 690 bis 890 €. Gestaffelt nach
Kleinwagen, Limousine und Kombi, SUV und Van. Bewusst über den Billiganbietern
und klar unter den Premium-Studios. Der Unterschied zum Wettbewerb ist nicht
der Preis, sondern dass Hol- und Bringservice bis 15 km **inklusive** ist.
