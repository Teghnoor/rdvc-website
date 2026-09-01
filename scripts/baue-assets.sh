#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Baut alle Bilder und Videos der Seite aus dem TikTok-Rohmaterial.
#
# Quelle: die 37 Videos von @rdvc.garage, geholt mit
#     yt-dlp -f "bv[height<=1920][vcodec^=avc]/bv[height<=1920]/b" \
#            -o "%(upload_date)s_%(id)s.%(ext)s" \
#            "https://www.tiktok.com/@rdvc.garage"
# nach _material/roh/ (nicht im Repo, 316 MB).
#
# Zwei Dinge, die jeder Zuschnitt beachten muss:
#
# 1. Oben links sitzt ein CapCut-Wasserzeichen. Der Zuschnitt beginnt deshalb
#    nie ueber 10 % der Bildhoehe — das entfernt es und rueckt zugleich das
#    Auto ins Bild.
# 2. Das Rohmaterial ist unterschiedlich gross (1080x1920 bis 464x832).
#    Deshalb rechnet ffmpeg den Ausschnitt aus in_w/in_h statt fester Zahlen.
#    Fuer Standbilder werden trotzdem nur 1080er Quellen benutzt, alles
#    andere muesste hochskaliert werden und wird weich.
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail
cd "$(dirname "$0")/.."
R=_material/roh
B=bilder
mkdir -p "$B"
[ -d "$R" ] || { echo "FEHLER: $R fehlt. Erst das Rohmaterial holen."; exit 1; }

WASCH=$R/20250422_7496038278622186774.mp4   # 190E 2.5-16, Handwaesche      1080x1920
NACHT=$R/20250504_7500537729185320214.mp4   # E30 bei Nacht                 1080x1920
CABRIO=$R/20250419_7495091079281265942.mp4  # E30 Cabrio, Leder             1080x1920
M5=$R/20250511_7503299966299933974.mp4      # E39 M5 schwarz                1080x1920
EVO=$R/20250420_7495489878658944279.mp4     # 190E Emblem, AMG-Felge        1080x1920
PERLEN=$R/20250512_7503465367205907734.mp4  # Wasserperlen, BMW-Felge       1080x1920
M5BLAU=$R/20260706_7659413828639264002.mp4 # E39 M5 blau, Halle            1080x1920
E190=$R/20260816_7674683647634590998.mp4   # 190E schwarz, Scheune         1080x1920

# Ein Zeitpunkt hinter dem Clipende liefert kein Bild — ffmpeg meldet das nur
# als kryptischen Encoder-Fehler. Deshalb vorher pruefen und den Namen nennen.
pruefe_zeit () {
  local dauer
  dauer=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
  awk -v t="$2" -v d="$dauer" -v n="$3" -v q="$1" 'BEGIN{
    if (t+0 >= d+0) {
      printf "FEHLER bei %s: Sekunde %s liegt hinter dem Ende von %s (%.1f s)\n", n, t, q, d
      exit 1
    }
  }'
}

# ── Standbild ────────────────────────────────────────────────────────────
# $1 Quelle · $2 Sekunde · $3 Zielverhaeltnis b/h · $4 Fokus 0..1 (senkrecht)
# $5 Zielbreite · $6 Zielhoehe · $7 Name
bild () {
  local ar="$3" fokus="$4"
  pruefe_zeit "$1" "$2" "$7"
  # Ausschnitt so hoch wie noetig, Startpunkt nie im Wasserzeichen-Bereich.
  local ch="floor(in_w/${ar}/2)*2"
  local cy="max(in_h*0.10\,(in_h-${ch})*${fokus})"
  ffmpeg -v error -ss "$2" -i "$1" -frames:v 1 \
    -vf "crop=in_w:${ch}:0:${cy},scale=$5:$6:flags=lanczos,unsharp=5:5:0.4" \
    -q:v 2 -y "$B/$7.jpg"
  # ffmpeg dieser Installation kann kein WebP — cwebp uebernimmt das.
  cwebp -quiet -q 82 -m 6 "$B/$7.jpg" -o "$B/$7.webp"
}

# ── Video ────────────────────────────────────────────────────────────────
# $1 Quelle · $2 Start · $3 Dauer · $4 Verhaeltnis · $5 Fokus · $6 b · $7 h · $8 Name
video () {
  pruefe_zeit "$1" "$2" "$8"
  local ch="floor(in_w/${4}/2)*2"
  local cy="max(in_h*0.10\,(in_h-${ch})*${5})"
  local vf="crop=in_w:${ch}:0:${cy},scale=$6:$7:flags=lanczos,fps=24"
  ffmpeg -v error -ss "$2" -t "$3" -i "$1" -vf "$vf" \
    -an -c:v libx264 -profile:v main -crf 30 -preset slow -pix_fmt yuv420p \
    -movflags +faststart -y "$B/$8.mp4"
}
# Kein WebM: H.264 versteht jeder Browser, und VP9 war hier sogar groesser.

echo "── Hero: 190E Handwaesche, 40-52 s, statische Einstellung ──"
video "$WASCH" 40 12 0.625 0.12 864 1382 hero
bild  "$WASCH" 44 0.625 0.12 864 1382 hero-poster

echo "── Vollbild-Band: E30 bei Nacht ──"
# Der 21:9-Anschnitt faellt hier nicht auf, weil das Bild dunkel und koernig
# ist. Bei Tageslicht waere die Weichheit sichtbar.
video "$NACHT" 5 6 2.333 0.55 1360 584 band
bild  "$NACHT" 6 2.333 0.55 1512 648 band-poster

echo "── Youngtimer, vier Detailaufnahmen ──"
bild "$EVO"    2.5 1 0.50 800 800 yt-1   # 190E-Emblem „2.3-16"
bild "$CABRIO" 6   1 0.45 800 800 yt-2   # E30-Cabrio, Innenraum
bild "$EVO"    13  1 0.50 800 800 yt-3   # AMG-Felge am 190E
bild "$PERLEN" 60  1 0.45 800 800 yt-4   # Wasserperlen auf Lack

echo "── Fahrzeugkarten, drei im 4:3 ──"
bild "$M5BLAU" 9   1.3333 0.50 1000 750 auto-1   # E39 M5 blau in der Halle
bild "$CABRIO" 12  1.3333 0.50 1000 750 auto-2   # E30 Cabrio
bild "$E190"   90  1.3333 0.50 1000 750 auto-3   # 190E schwarz

# KEIN Vorher/Nachher-Schieber.
# Der braucht zwei Bilder aus derselben, unbewegten Kameraposition — einmal
# schmutzig, einmal fertig. Im TikTok-Material gibt es das nicht: die Kamera
# faehrt bei jeder Wasch-Sequenz mit, und die Weiten unterscheiden sich stark.
# Zwei nicht deckungsgleiche Bilder als „vorher/nachher" auszugeben waere eine
# Behauptung, die das Material nicht traegt. Gehoert auf den naechsten Drehtag:
# Stativ hinstellen, dreckiges Auto filmen, nicht bewegen, fertiges Auto filmen.

echo "── Bild neben den Leistungen ──"
bild "$PERLEN" 42 0.8 0.62 1000 1250 pakete   # Hochdruckreiniger, Wasserfaecher

echo "── Ablauf, vier Schritte ──"
bild "$WASCH"  13.5 1.3333 0.46 800 600 ablauf-1  # staubig, vor der Anfrage
bild "$CABRIO" 4   1.3333 0.5 800 600 ablauf-2   # unterwegs, wird geholt
bild "$PERLEN" 54  1.3333 0.5 800 600 ablauf-3   # Mikrofasertuch auf nasser Flanke
bild "$PERLEN" 90  1.3333 0.5 800 600 ablauf-4   # fertig, zurueck vor der Tuer

echo
du -h "$B"/* | sort -k2
echo "Gesamt: $(du -sh "$B" | cut -f1)"
