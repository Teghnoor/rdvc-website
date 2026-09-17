#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Erzeugt die vier Leistungsseiten aus einer Vorlage.

Warum generiert und nicht vier Mal von Hand: Kopf, Fusszeile, Strukturdaten
und die Querverlinkung sind auf allen vier Seiten identisch. Von Hand laufen
sie beim ersten Nachtrag auseinander — genau der Fehler, den kontakt.js fuer
die Telefonnummer schon verhindert.

Aufruf:  python3 scripts/baue-leistungsseiten.py
Das Skript schreibt die vier .html in das Wurzelverzeichnis und gibt am Ende
die noch fehlenden EN-Woerterbuch-Eintraege aus, damit pruefe-umschalter.mjs
nicht durchfaellt.

⚠️ Inhalt kommt ausschliesslich aus Darios Preisliste und aus index.html.
Nichts hier erfindet Leistungen, Fristen oder Ergebnisse.

⚠️ Kein `rv` auf diesen Seiten: der IntersectionObserver, der `.rv` sichtbar
macht, steht unten in index.html und laeuft auf Unterseiten nicht. Elemente
mit `rv` blieben dauerhaft unsichtbar.
"""

import pathlib
import re

WURZEL = pathlib.Path(__file__).resolve().parent.parent

# ── Die vier Seiten ────────────────────────────────────────────────────────
# paket / preis / punkte stammen wortgleich aus den Paketkarten in index.html,
# die ihrerseits Darios handschriftliche Liste abbilden.
SEITEN = [
    {
        "datei": "innenreinigung-auto-wien.html",
        "titel": "Innenreinigung Auto Wien mit Hol- und Bringservice | RDVC Garage",
        "beschreibung": (
            "Innenreinigung für Ihr Auto in Wien: Polster, Teppiche und Leder "
            "intensiv gereinigt. Wir holen das Fahrzeug ab und bringen es zurück. "
            "Ab 120 €."
        ),
        "kicker": "Innen intensiv",
        "h1": "Innenreinigung für Ihr Auto in Wien",
        "intro": (
            "Wenn der Innenraum wirklich sauber werden soll, reicht Saugen nicht. "
            "Polster, Teppiche und Leder werden intensiv gereinigt, nicht nur "
            "abgewischt. Was das kostet, steht vor der Abholung fest."
        ),
        "paket": "RDVC Interior Care",
        "preis": "ab 120 €",
        "preishinweis": "je nach Zustand des Innenraums",
        "punkte": [
            "Alles aus Basic Care",
            "Intensivreinigung innen",
            "Polster, Teppiche, Leder",
            "Preis nach Zustandscheck",
        ],
        "abschnitte": [
            (
                "Was bei der Innenreinigung passiert",
                "Zuerst kommt alles raus, was locker liegt, dann wird gesaugt und "
                "abgestaubt. Danach folgt die Intensivreinigung: Polster und Teppiche "
                "werden nass gereinigt, Leder wird gereinigt und gepflegt. Innenspiegel "
                "und Scheiben innen gehören dazu, weil sie sonst der einzige Teil "
                "bleiben, den man beim Einsteigen sieht.",
            ),
            (
                "Warum der Preis erst nach dem Zustandscheck steht",
                "Ein Innenraum mit Tierhaaren oder Nikotin ist andere Arbeit als ein "
                "Innenraum, der zwei Jahre nur gefahren wurde. Deshalb nennen wir "
                "einen Startpreis und legen den Fixpreis fest, sobald wir das "
                "Fahrzeug gesehen haben. Kommt etwas dazu, fragen wir vorher, statt "
                "es nachher auf die Rechnung zu setzen.",
            ),
        ],
        "service_typ": "Innenreinigung Auto",
    },
    {
        "datei": "autopolitur-wien.html",
        "titel": "Autopolitur Wien — Lackaufbereitung in zwei Durchgängen | RDVC Garage",
        "beschreibung": (
            "Autopolitur in Wien: Politur in zwei Durchgängen gegen Swirls und matte "
            "Stellen, Innenreinigung inklusive. Wir holen das Fahrzeug ab und bringen "
            "es zurück. Ab 250 €."
        ),
        "kicker": "Lack und Innen",
        "h1": "Autopolitur in Wien",
        "intro": (
            "Politur ist der Schritt mit dem sichtbarsten Unterschied. Zwei "
            "Durchgänge holen Swirls und matte Stellen aus dem Lack, die "
            "Intensivreinigung innen ist dabei."
        ),
        "paket": "RDVC Paint Care",
        "preis": "ab 250 €",
        "preishinweis": "Fixpreis nach dem Zustandscheck",
        "punkte": [
            "Handwäsche, Fenster, Felgen",
            "Politur in zwei Durchgängen",
            "Intensivreinigung innen",
            "Der sichtbarste Unterschied",
        ],
        "abschnitte": [
            (
                "Zwei Durchgänge, nicht einer",
                "Ein Durchgang nimmt die gröbsten Spuren, der zweite arbeitet die "
                "Fläche gleichmäßig aus. Deshalb sind es bei uns zwei und nicht einer. "
                "Vorher steht immer die Handwäsche, weil Politur auf ungewaschenem "
                "Lack Schmutz in die Fläche einarbeitet.",
            ),
            (
                "Was Politur nicht kann",
                "Politur arbeitet im Klarlack. Kratzer, die durch den Klarlack "
                "durchgehen, bleiben sichtbar, und tiefe Steinschläge sind Lackarbeit, "
                "keine Politur. Was in Ihrem Fall geht, sagen wir beim Zustandscheck "
                "und nicht vorher am Telefon.",
            ),
        ],
        "service_typ": "Autopolitur",
    },
    {
        "datei": "keramikversiegelung-wien.html",
        "titel": "Keramikversiegelung Auto Wien — Schutz über Jahre | RDVC Garage",
        "beschreibung": (
            "Keramikversiegelung für Ihr Auto in Wien, zusammen mit der Politur. "
            "Zwei bis fünf Jahre Schutz statt sechs Monaten. Wir holen das Fahrzeug "
            "ab und bringen es zurück. Ab 699 €."
        ),
        "kicker": "Mit Keramik",
        "h1": "Keramikversiegelung für Ihr Auto in Wien",
        "intro": (
            "Eine normale Versiegelung hält ein halbes Jahr, eine "
            "Keramikversiegelung Jahre. Sinnvoll ist sie nur auf korrigiertem Lack, "
            "deshalb gibt es sie bei uns zusammen mit der Politur."
        ),
        "paket": "RDVC Premium Care",
        "preis": "ab 699 €",
        "preishinweis": "Politur und Keramik zusammen",
        "punkte": [
            "Alles aus Paint Care",
            "Keramikversiegelung",
            "Intensivreinigung innen",
            "ein bis zwei Tage",
        ],
        "abschnitte": [
            (
                "Zwei bis fünf Jahre statt sechs Monaten",
                "Das ist der einzige Grund, Keramik zu nehmen: die Haltbarkeit. "
                "Eine normale Versiegelung ist nach einem halben Jahr weg, eine "
                "Keramikversiegelung hält Jahre.",
            ),
            (
                "Warum es Keramik bei uns nicht einzeln gibt",
                "Eine Versiegelung konserviert den Zustand, in dem der Lack gerade "
                "ist. Auf ungeputztem Lack konserviert sie die Swirls mit. Deshalb "
                "steckt die Keramik bei uns in RDVC Premium Care, zusammen mit der "
                "Politur, und hat keinen eigenen Preis.",
            ),
            (
                "Das Fahrzeug bleibt ein bis zwei Tage",
                "Politur und Versiegelung brauchen Zeit, die Versiegelung zusätzlich "
                "Zeit zum Aushärten. Deshalb ist das kein Termin über Mittag. "
                "Abholung und Rückgabe stimmen wir vorher ab.",
            ),
        ],
        "service_typ": "Keramikversiegelung Auto",
    },
    {
        "datei": "youngtimer-aufbereitung-wien.html",
        "titel": "Youngtimer Aufbereitung Wien — Aufbereitung für Klassiker | RDVC Garage",
        "beschreibung": (
            "Youngtimer- und Oldtimer-Aufbereitung in Wien. Ältere Lacke und "
            "gealterte Innenräume brauchen eine andere Hand als ein Neuwagen. Wir "
            "holen das Fahrzeug ab und bringen es zurück."
        ),
        "kicker": "Youngtimer",
        "h1": "Youngtimer-Aufbereitung in Wien",
        "intro": (
            "Ältere Fahrzeuge sind keine kleineren Neuwagen. Der Lack ist dünner, "
            "der Innenraum ist gealtert, und manches lässt sich nicht mehr "
            "zurückholen, sondern nur erhalten. Das ist die Arbeit, die wir am "
            "liebsten machen."
        ),
        "paket": None,
        "preis": None,
        "preishinweis": None,
        "punkte": [],
        "abschnitte": [
            (
                "Was bei älteren Fahrzeugen anders ist",
                "Auf einem dünnen oder nachlackierten Lack ist jeder Durchgang "
                "Politur ein Durchgang, den man nicht wiederholen kann. Deshalb wird "
                "hier vorsichtiger gearbeitet und vorher gemessen, statt einfach "
                "durchzupolieren. Im Innenraum gilt dasselbe: gealtertes Leder und "
                "alte Stoffe werden gereinigt und gepflegt, nicht geschrubbt.",
            ),
            (
                "Erst der Zustandscheck, dann das Paket",
                "Welches Paket sinnvoll ist, entscheidet der Zustand, nicht das "
                "Baujahr. Manchmal ist RDVC Interior Care das Richtige, weil außen "
                "alles in Ordnung ist. Manchmal ist es RDVC Premium Care, weil der "
                "Lack nach der Politur geschützt bleiben soll. Wir sagen es nach "
                "dem Zustandscheck.",
            ),
            (
                "Das Fahrzeug muss nicht zu uns fahren",
                "Wir holen es ab und bringen es zurück. Bei Fahrzeugen, die selten "
                "bewegt werden, ist das oft der eigentliche Grund, überhaupt einen "
                "Termin zu machen.",
            ),
        ],
        "service_typ": "Youngtimer Aufbereitung",
    },
]

# ── Vorlage ────────────────────────────────────────────────────────────────

KOPF = """<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Erzeugt von scripts/baue-leistungsseiten.py — nicht von Hand aendern.
       Inhalt aendern heisst: SEITEN im Skript aendern und neu laufen lassen. -->
  <title>{titel}</title>
  <meta name="description" content="{beschreibung}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="theme-color" content="#0A0A0C">
  <link rel="canonical" href="https://rdvcgarage.at/{datei}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://rdvcgarage.at/{datei}">
  <meta property="og:site_name" content="RDVC Garage">
  <meta property="og:locale" content="de_AT">
  <meta property="og:title" content="{titel}">
  <meta property="og:description" content="{beschreibung}">
  <meta property="og:image" content="https://rdvcgarage.at/bilder/band-poster.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1512">
  <meta property="og:image:height" content="648">
  <meta property="og:image:alt" content="Aufbereitetes Fahrzeug bei Nacht vor der Halle von RDVC Garage in Wien">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="stylesheet" href="fonts.css">
  <script src="tailwind.js"></script>
  <link rel="stylesheet" href="site.css">
  <script src="kontakt.js"></script>
  <script src="site.js"></script>
  <script>
    tailwind.config = {{ theme: {{ extend: {{
      colors: {{ paper:'#FFFFFF', carbon:'#0A0A0C', ink:'#0A0A0C', linen:'#F5F3F1',
                blood:'#7E1015', red:'#E11D22', steel:'#8C93A0', slate:'#4A5058', line:'#E4E0DA' }},
      fontFamily: {{ head:['Saira','ui-sans-serif','system-ui','sans-serif'], body:['Inter','ui-sans-serif','system-ui','sans-serif'] }}
    }} }} }}
  </script>
  <style>
    /* Die Basis-Styles stehen in index.html im <style>-Block und nicht in
       site.css. Deshalb hier die wenigen, die diese Seite braucht — gleiche
       Werte, damit Hell/Dunkel aus site.css darauf greift. */
    body {{ font-family:'Inter',ui-sans-serif,system-ui,sans-serif; }}
    .kicker {{ font-size:.74rem; letter-spacing:.16em; text-transform:uppercase; font-weight:700; }}
    .rule {{ height:2px; width:44px; background:#E11D22; }}
    .card {{ background:#fff; border:1px solid #E4E0DA; border-radius:.5rem; }}
    .btn-red {{ background:#E11D22; color:#fff; transition:background .2s ease, transform .2s ease; }}
    .btn-red:hover {{ background:#FF3B41; transform:translateY(-1px); }}
    .btn-outline {{ border:1.5px solid #E4E0DA; }}
    .price-num {{ font-family:'Saira',sans-serif; font-variant-numeric:tabular-nums; }}
    .li-mark {{ flex:none; width:14px; height:2px; margin-top:.6rem; background:#E11D22; }}
    .svc h2 {{ font-family:'Saira',sans-serif; font-weight:800; font-size:1.45rem; margin:2.5rem 0 .75rem; }}
    .svc p {{ line-height:1.75; color:var(--tx-mid); margin-bottom:.75rem; }}
    .svc a {{ color:var(--acc-deep); text-decoration:underline; }}
    /* Die Verweis-Liste ohne Unterstreichung: vier rot unterstrichene Zeilen
       untereinander lesen sich wie ein Rohgeruest. Stattdessen der feine
       Strich, der auf der Startseite schon die Leistungspunkte markiert. */
    .svc-quer {{ list-style:none; padding:0; }}
    .svc-quer li {{ display:flex; gap:.75rem; align-items:baseline; }}
    .svc-quer li::before {{ content:""; flex:none; width:14px; height:2px; background:#E11D22; transform:translateY(-.35em); }}
    .svc-quer a {{ color:var(--tx); text-decoration:none; }}
    .svc-quer a:hover {{ color:var(--acc); text-decoration:underline; }}
  </style>
</head>
<body class="bg-paper antialiased">

<header class="fixed top-0 inset-x-0 z-50 bg-carbon/95 backdrop-blur border-b border-white/10">
  <div class="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
    <a href="index.html" class="flex items-center gap-2.5" aria-label="RDVC Garage Startseite">
      <span class="grid place-items-center h-9 w-9 rounded-md" style="background:#7E1015;color:#E11D22;font-family:Saira,sans-serif;font-weight:800">R</span>
      <span class="font-head font-extrabold tracking-tight text-lg text-white">RDVC.GARAGE</span>
    </a>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2" data-nt>
        <button id="themeBtn" type="button" class="hdr-btn"><svg class="ico-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg><svg class="ico-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
        <button id="langBtn" type="button" class="hdr-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/></svg><span class="lang-code">DE</span></button>
      </div>
      <a href="index.html#buchen" class="btn-red hidden sm:block rounded-full px-5 py-2 text-sm font-bold">Termin anfragen</a>
    </div>
  </div>
</header>

<main class="pt-28 md:pt-32 pb-20">
  <div class="max-w-3xl mx-auto px-5">

    <nav aria-label="Breadcrumb" class="text-xs text-steel">
      <a href="index.html" class="hover:text-ink">Startseite</a>
      <span aria-hidden="true"> › </span>
      <span>{h1}</span>
    </nav>

    <p class="kicker text-blood mt-8">{kicker}</p>
    <h1 class="mt-3 font-head font-extrabold text-3xl md:text-[2.6rem] leading-tight">{h1}</h1>
    <div class="rule mt-5"></div>
    <p class="mt-5 text-lg text-slate leading-relaxed">{intro}</p>
"""

PAKET_BLOCK = """
    <div class="card p-6 mt-10 flex flex-col sm:flex-row sm:items-center gap-6">
      <div class="flex-1">
        <p class="kicker text-steel">{kicker}</p>
        <h2 class="mt-2 text-xl font-extrabold" style="margin:.5rem 0 0">{paket}</h2>
        <ul class="mt-4 space-y-2 text-sm text-slate">
{punkte}
        </ul>
      </div>
      <div class="sm:text-right shrink-0">
        <p class="price-num text-3xl font-extrabold text-blood">{preis}</p>
        <p class="mt-1 text-xs text-steel">{preishinweis}</p>
        <a href="index.html#buchen" class="btn-red mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-bold">Termin anfragen</a>
      </div>
    </div>
"""

ABLAUF = """
    <div class="svc">
{abschnitte}

      <h2>So läuft der Termin</h2>
      <p>
        Wir holen das Fahrzeug bei Ihnen ab, bereiten es in unserer Halle auf und
        bringen es zurück. Sie müssen nicht warten und nicht zweimal fahren.
        Den Zustandscheck machen wir bei der Abholung, den Fixpreis nennen wir
        davor.
      </p>

      <h2>Auch gesucht</h2>
      <!-- Als Liste und nicht als Satz: bei Links mitten im Satz zerfaellt der
           Text in Bruchstuecke wie ". Den Ueberblick ueber alle vier Pakete
           gibt die", und jedes Bruchstueck braeuchte einen eigenen Eintrag im
           EN-Woerterbuch. pruefe-umschalter.mjs hat genau das gemeldet. In der
           Liste ist jeder Textknoten ein vollstaendiger Linktext. -->
      <ul class="svc-quer mt-3 space-y-2 text-sm">
{querlinks}
        <li><a href="index.html#pakete">Alle vier Pakete auf der Startseite</a></li>
      </ul>
    </div>

    <div class="card p-6 md:p-8 mt-12 text-center">
      <p class="kicker text-blood">Termin</p>
      <h2 class="mt-2 font-head font-extrabold text-2xl">Fixpreis vor der Abholung</h2>
      <p class="mt-3 text-sm text-slate max-w-lg mx-auto leading-relaxed">
        Vier Fragen im Formular, danach melden wir uns mit einem Fixpreis und
        einem Abholtermin zurück.
      </p>
      <a href="index.html#buchen" class="btn-red mt-6 inline-block rounded-full px-7 py-3 text-sm font-bold">Termin anfragen</a>
    </div>
"""

FUSS = """
  </div>
</main>

<footer class="bg-ink text-white py-10">
  <div class="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/45">
    <p>© 2026 RDVC Garage Autoaufbereitung · Wien</p>
    <div class="flex gap-6">
      <a href="index.html" class="hover:text-white">Startseite</a>
      <a href="impressum.html" class="hover:text-white">Impressum</a>
      <a href="datenschutz.html" class="hover:text-white">Datenschutz</a>
    </div>
  </div>
</footer>
<script src="bot.js"></script>

</body>
</html>
"""

LD = """
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@graph": [
      {{
        "@type": "Service",
        "@id": "https://rdvcgarage.at/{datei}#leistung",
        "name": "{h1}",
        "serviceType": "{service_typ}",
        "description": "{beschreibung}",
        "provider": {{ "@id": "https://rdvcgarage.at/#betrieb" }},
        "areaServed": {{ "@type": "City", "name": "Wien", "sameAs": "https://www.wikidata.org/wiki/Q1741" }},
        "url": "https://rdvcgarage.at/{datei}"{angebot}
      }},
      {{
        "@type": "BreadcrumbList",
        "itemListElement": [
          {{ "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://rdvcgarage.at/" }},
          {{ "@type": "ListItem", "position": 2, "name": "{h1}", "item": "https://rdvcgarage.at/{datei}" }}
        ]
      }}
    ]
  }}
  </script>
"""

ANGEBOT = """,
        "offers": {{
          "@type": "Offer",
          "name": "{paket}",
          "url": "https://rdvcgarage.at/{datei}",
          "priceSpecification": {{
            "@type": "PriceSpecification",
            "minPrice": {minpreis},
            "priceCurrency": "EUR",
            "valueAddedTaxIncluded": true
          }}
        }}"""


def quer(aktuell):
    """Die drei anderen Leistungsseiten, je eine Zeile, je ein ganzer Linktext."""
    andere = [s for s in SEITEN if s["datei"] != aktuell]
    return "\n".join(
        '        <li><a href="{d}">{h}</a></li>'.format(d=s["datei"], h=s["h1"])
        for s in andere
    )


gesammelt = []


def sammle(text):
    """Deutsche Textzeilen fuer die EN-Ergaenzung mitschreiben."""
    t = re.sub(r"\s+", " ", text).strip()
    if t and t not in gesammelt:
        gesammelt.append(t)
    return text


for s in SEITEN:
    punkte_html = "\n".join(
        '          <li class="flex gap-3"><span class="li-mark"></span>{p}</li>'.format(p=p)
        for p in s["punkte"]
    )

    if s["paket"]:
        minpreis = re.search(r"(\d+)", s["preis"]).group(1)
        angebot = ANGEBOT.format(paket=s["paket"], datei=s["datei"], minpreis=minpreis)
        paket_html = PAKET_BLOCK.format(
            kicker=s["kicker"],
            paket=s["paket"],
            punkte=punkte_html,
            preis=s["preis"],
            preishinweis=s["preishinweis"],
        )
        sammle(s["preis"])
        sammle(s["preishinweis"])
        for p in s["punkte"]:
            sammle(p)
    else:
        angebot = ""
        paket_html = ""

    abschnitte_html = "\n".join(
        "      <h2>{h}</h2>\n      <p>{t}</p>".format(h=h, t=t)
        for h, t in s["abschnitte"]
    )
    for h, t in s["abschnitte"]:
        sammle(h)
        sammle(t)
    sammle(s["titel"])
    sammle(s["beschreibung"])
    sammle(s["kicker"])
    sammle(s["h1"])
    sammle(s["intro"])

    html = (
        KOPF.format(**s).replace("</head>", LD.format(
            datei=s["datei"], h1=s["h1"], service_typ=s["service_typ"],
            beschreibung=s["beschreibung"], angebot=angebot) + "</head>")
        + paket_html
        + ABLAUF.format(abschnitte=abschnitte_html, querlinks=quer(s["datei"]))
        + FUSS
    )

    (WURZEL / s["datei"]).write_text(html, encoding="utf-8")
    print("geschrieben:", s["datei"])

# ── Fehlende EN-Eintraege melden ───────────────────────────────────────────
sitejs = (WURZEL / "site.js").read_text(encoding="utf-8")
fehlt = [t for t in gesammelt if "'" + t + "'" not in sitejs and '"' + t + '"' not in sitejs]

# Feste Bausteine der Vorlage kommen noch dazu.
for t in [
    "Startseite", "Termin anfragen", "So läuft der Termin", "Auch gesucht",
    "Termin", "Fixpreis vor der Abholung",
    "Wir holen das Fahrzeug bei Ihnen ab, bereiten es in unserer Halle auf und bringen es zurück. Sie müssen nicht warten und nicht zweimal fahren. Den Zustandscheck machen wir bei der Abholung, den Fixpreis nennen wir davor.",
    "Vier Fragen im Formular, danach melden wir uns mit einem Fixpreis und einem Abholtermin zurück.",
    "Alle vier Pakete auf der Startseite",
]:
    if "'" + t + "'" not in sitejs and t not in fehlt:
        fehlt.append(t)

if fehlt:
    print("\n⚠️ {n} Eintraege fehlen im EN-Woerterbuch in site.js:\n".format(n=len(fehlt)))
    for t in fehlt:
        print("    '{t}':\n      '',".format(t=t.replace("'", "\\'")))
else:
    print("\nEN-Woerterbuch ist vollstaendig.")
