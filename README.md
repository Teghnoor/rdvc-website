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
| `bilder/` | Alle Fotos und Videos, gebaut aus dem TikTok-Material |
| `scripts/baue-assets.sh` | Baut `bilder/` reproduzierbar neu |
| `site.css` | Farbwelt hell/dunkel als Variablen, plus die beiden Umschalter |
| `site.js` | Hell/Dunkel und Deutsch/Englisch, mit dem englischen Wörterbuch |
| `fonts.css` + `fonts/` | Saira und Inter, selbst gehostet |
| `tailwind.js` | Tailwind, lokal statt CDN |
| `scripts/` | Prüfskripte, siehe unten |

## Domain

Die Seite läuft auf **rdvcgarage.at**. Die Datei `CNAME` im Wurzelverzeichnis sagt
GitHub Pages, unter welcher Domain ausgeliefert wird — sie darf nur diese eine
Zeile enthalten und muss bei jedem Deploy mitkommen.

Beim Registrar müssen dafür stehen:

| Typ | Name | Wert |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `teghnoor.github.io.` |

Danach in GitHub unter *Settings → Pages* die Domain eintragen und
**Enforce HTTPS** anhaken, sobald das Zertifikat ausgestellt ist (dauert nach
dem DNS-Eintrag bis zu einer Stunde).

Die Paketnamen sind Eigennamen (`RDVC Basic Care` … `RDVC Ceramic Care`) und
stehen in beiden Sprachen gleich. Übersetzt wird die Gattung im Kicker darüber.
Wer einen Paketnamen ändert, muss ihn an **drei** Stellen ändern: Karte (`<h3>`
plus `data-paket`), Formular-Knopf (`data-value` plus Beschriftung) und
Fußzeile — sonst findet das Skript die Auswahl nicht mehr. `scripts/pruefe-formular.mjs`
fällt in dem Fall durch.

## Vor dem Live-Gang — ohne diese drei Dinge geht keine Anfrage ein

**1. Versandweg eintragen.** In `index.html`, im Skriptblock am Ende:

```js
var ENDPUNKT = '';    // z. B. https://formspree.io/f/xxxxxxx
var MAILTO   = '';    // z. B. termin@rdvcgarage.at
```

Solange beide leer sind, meldet das Formular ehrlich „Versand noch nicht
eingerichtet" statt einen Erfolg vorzutäuschen. Das ist Absicht: eine Anfrage,
die ins Leere läuft, ist schlimmer als gar kein Formular.

**2. Alle `tbd`-Markierungen abarbeiten.** Gelb gestrichelt auf der Seite:

```bash
grep -n 'class="tbd"' index.html
grep -n 'PLATZHALTER' impressum.html datenschutz.html
```

**3. Fahrzeugdaten eintragen.** Die drei Karten unter „Fahrzeuge" zeigen echte
Autos, aber Baujahr, Kilometer und Preis stehen als Platzhalter drin.

## Bildmaterial

Alle Fotos und Videos stammen aus dem eigenen TikTok-Kanal
[@rdvc.garage](https://www.tiktok.com/@rdvc.garage) — kein Stock, kein KI-Material
bei allem, was ein erkennbares Fahrzeug zeigt. Bei einem Youngtimer-Spezialisten
fallen falsche Embleme und Proportionen genau der Zielgruppe auf, die er gewinnen
will.

So wird `bilder/` neu gebaut:

```bash
mkdir -p _material/roh && cd _material/roh
yt-dlp -f "bv[height<=1920][vcodec^=avc]/bv[height<=1920]/b" \
       -o "%(upload_date)s_%(id)s.%(ext)s" \
       "https://www.tiktok.com/@rdvc.garage"
cd ../.. && ./scripts/baue-assets.sh
```

`_material/` steht in `.gitignore` (316 MB Rohmaterial), nur die fertigen Assets
liegen im Repo (5,7 MB).

**Drei Dinge, die dabei im Weg stehen — alle im Skript gelöst:**

1. **Oben links sitzt ein CapCut-Wasserzeichen.** Jeder Zuschnitt beginnt deshalb
   frühestens bei 10 % der Bildhöhe.
2. **Das Rohmaterial ist unterschiedlich groß** (1080×1920 bis 464×832). Die
   Zuschnitte rechnen mit `in_w`/`in_h` statt mit festen Zahlen; für Standbilder
   werden nur 1080er Quellen benutzt, alles andere müsste hochskaliert werden.
3. **Ein Zeitpunkt hinter dem Clip-Ende** liefert kein Bild, und ffmpeg meldet das
   nur als kryptischen Encoder-Fehler. `pruefe_zeit` bricht vorher ab und nennt den
   Namen des Assets.

**Warum der Hero geteilt ist und nicht vollflächig:** Das Material ist durchgehend
9:16. Für einen vollflächigen 16:9-Hero müsste ein 1080×608-Streifen auf
Desktopbreite gezogen werden — sichtbar weich. Stattdessen behält das Video sein
Format: am Handy füllt es den Bildschirm, ab 1024 px die rechte Hälfte. Ein
vollflächiges Breitband gibt es trotzdem, aber mit einer Nachtaufnahme, wo der
Anschnitt nicht auffällt.

**Kein Vorher/Nachher-Schieber.** Der braucht zwei Bilder aus derselben, unbewegten
Kameraposition. Im TikTok-Material gibt es das nicht — die Kamera fährt bei jeder
Wasch-Sequenz mit. Für den nächsten Drehtag: Stativ hinstellen, schmutziges Auto
filmen, Kamera **nicht** bewegen, fertiges Auto filmen. Dann sind es zwei Zeilen
in `baue-assets.sh`.

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
node scripts/pruefe-medien.mjs                            # Bilder geladen, Videos stumm, Gewicht
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
