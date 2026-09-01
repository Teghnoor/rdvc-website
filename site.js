/* ═══════════════════════════════════════════════════════════════════════════
   site.js — Hell/Dunkel und Deutsch/Englisch fuer alle Seiten.

   Zwei Entscheidungen, die den Rest erklaeren:

   1) Deutsch steht im HTML, nicht im Woerterbuch. Der Umschalter merkt sich
      beim ersten Lauf den deutschen Text jedes Textknotens und schlaegt fuer
      Englisch in EN nach. Wer die deutsche Seite aendert, aendert nur das HTML.
      Fehlt eine Zeile in EN, bleibt sie deutsch stehen statt zu verschwinden.

   2) Das Theme wird gesetzt, bevor der Body gezeichnet wird. Deshalb laedt
      diese Datei im <head> ohne defer. Sonst blitzt beim Laden kurz Weiss auf.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SP_THEME = 'rdvc-theme';
  var SP_LANG  = 'rdvc-lang';

  /* ── 1. Theme sofort, noch vor dem ersten Bild ─────────────────────────── */
  var theme = lies(SP_THEME);
  if (theme !== 'dark' && theme !== 'light') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  setzeTheme(theme, false);

  var lang = lies(SP_LANG);
  if (lang !== 'de' && lang !== 'en') {
    lang = /^de\b/i.test(navigator.language || '') ? 'de' : 'en';
  }
  document.documentElement.lang = lang;

  function lies(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function schreib(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function setzeTheme(wert, merken) {
    theme = wert;
    document.documentElement.classList.toggle('dark', wert === 'dark');
    if (merken) schreib(SP_THEME, wert);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', wert === 'dark' ? '#08080A' : '#0A0A0C');
  }

  /* ── 2. Woerterbuch ────────────────────────────────────────────────────── */
  var EN = {
    /* Kopf und Navigation */
    'RDVC Garage — Fahrzeugaufbereitung Wien | Hol- und Bringservice, Fixpreis':
      'RDVC Garage — Car Detailing Vienna | Pick-up and Delivery, Fixed Price',
    'Fahrzeugaufbereitung in Wien mit Hol- und Bringservice: Wir holen Ihr Auto ab, bereiten es in unserer Halle auf und bringen es zurück. Fixpreis vorab. Spezialisiert auf Youngtimer und Sammlerfahrzeuge.':
      'Car detailing in Vienna with pick-up and delivery: we collect your car, detail it in our workshop and bring it back. Fixed price up front. Specialised in youngtimers and collector cars.',
    'Leistungen': 'Services',
    'Ablauf': 'How it works',
    'Fahrzeuge': 'Cars',
    'Termin anfragen': 'Book a slot',
    'Menü öffnen': 'Open menu',
    'Weiter zu den Leistungen': 'Go to services',

    /* Hero */
    'Wien · Hol- und Bringservice': 'Vienna · Pick-up and delivery',
    'Ihr Auto wird abgeholt,': 'We pick up your car,',
    'aufbereitet und': 'detail it and',
    'zurückgebracht.': 'bring it back.',
    'Sie bleiben, wo Sie sind. Wir holen den Wagen bei Ihnen ab, arbeiten in unserer Halle in Wien und stellen ihn Ihnen fertig vor die Tür. Fixpreis vorher, kein Stundensatz, keine Überraschung.':
      'You stay where you are. We collect the car from you, work on it in our workshop in Vienna and put it back in front of your door. Fixed price up front, no hourly rate, no surprises.',
    'Fixpreis anfragen': 'Get a fixed price',
    'Leistungen ansehen': 'See services',
    'Abholung inklusive bis 15 km': 'Pick-up included up to 15 km',
    'Fixpreis nach Fahrzeugklasse': 'Fixed price by vehicle class',
    'Youngtimer willkommen': 'Youngtimers welcome',

    /* Vertrauensleiste */
    'Fixpreis': 'Fixed price',
    'vor der Abholung': 'before pick-up',
    'Abholung inklusive': 'pick-up included',
    'Eigene Halle': 'Own workshop',
    'nicht auf der Straße': 'not on the street',
    'unsere Spezialität': 'our speciality',

    /* Pakete */
    'Preise nach Fahrzeugklasse.': 'Prices by vehicle class.',
    'Vorher, nicht nachher.': 'Up front, not afterwards.',
    'Jedes Paket hat drei Preise: Kleinwagen, Limousine und Kombi, SUV und Van. Sie wissen vor der Abholung, was es kostet. Kommt beim Zustandscheck etwas dazu, fragen wir vorher, statt es nachher auf die Rechnung zu setzen.':
      'Every package has three prices: small car, saloon and estate, SUV and van. You know what it costs before we pick the car up. If something comes up during the condition check, we ask first instead of putting it on the invoice afterwards.',
    'Basis': 'Basic',
    'Handwäsche': 'Hand wash',
    'Außen von Hand, Felgen, Reifen, Scheiben, Türeinstiege abgetrocknet.':
      'Exterior by hand, wheels, tyres, glass, door sills dried off.',
    'einheitlich, alle Klassen': 'flat rate, all classes',
    'Zwei-Eimer-Handwäsche': 'Two-bucket hand wash',
    'Felgen und Reifen': 'Wheels and tyres',
    'Scheiben innen und außen': 'Glass inside and out',
    'ca. 1,5 Stunden': 'approx. 1.5 hours',
    'Auswählen': 'Choose',
    'Innenraum': 'Interior',
    'Innenaufbereitung': 'Interior detailing',
    'Alles, was Sie anfassen und riechen. Polster, Teppiche, Leder, Lüftung.':
      'Everything you touch and smell. Upholstery, carpets, leather, vents.',
    'ab 149 €': 'from 149 €',
    '149 · 189 · 229 € nach Klasse': '149 · 189 · 229 € by class',
    'Polster- oder Lederreinigung': 'Upholstery or leather cleaning',
    'Teppiche nass ausgesaugt': 'Carpets wet-extracted',
    'Lüftung und Gerüche': 'Vents and odours',
    'Kunststoffe ohne Glanzfilm': 'Plastics without a greasy shine',
    'Beliebt': 'Popular',
    'Lack': 'Paint',
    'Politur & Schutz': 'Polish & protection',
    'Swirls und matte Stellen raus, danach versiegelt. Der sichtbarste Unterschied.':
      'Swirls and dull patches out, then sealed. The most visible difference.',
    'ab 249 €': 'from 249 €',
    '249 · 299 · 379 € nach Klasse': '249 · 299 · 379 € by class',
    'Lackreinigung mit Knete': 'Clay bar decontamination',
    'Ein-Stufen-Politur': 'One-step machine polish',
    'Versiegelung, ca. 6 Monate': 'Sealant, approx. 6 months',
    'Handwäsche inklusive': 'Hand wash included',
    'Alles': 'Everything',
    'Komplett': 'Full detail',
    'Innen und außen in einem Durchgang. Für Verkauf, Rückgabe oder einmal im Jahr.':
      'Inside and out in one go. For a sale, a lease return or once a year.',
    'ab 349 €': 'from 349 €',
    '349 · 429 · 529 € nach Klasse': '349 · 429 · 529 € by class',
    'Innenaufbereitung komplett': 'Full interior detail',
    'Politur und Versiegelung': 'Polish and sealant',
    'Motorraum auf Wunsch': 'Engine bay on request',
    'ein bis zwei Tage': 'one to two days',
    'Zusatz': 'Add-on',
    'Keramikversiegelung': 'Ceramic coating',
    'Zwei bis fünf Jahre Schutz statt sechs Monaten. Nur sinnvoll auf korrigiertem Lack, deshalb immer zusammen mit einer Politur. Für Fahrzeuge, die bleiben sollen.':
      'Two to five years of protection instead of six months. Only worth doing on corrected paint, so always together with a polish. For cars that are meant to stay.',
    'je nach Fahrzeuggröße und System': 'depending on car size and system',
    'Alle Preise in Euro inklusive Umsatzsteuer, gültig für Fahrzeuge in üblichem Zustand. Starke Verschmutzung, Tierhaare oder Nikotin besprechen wir vorher und halten den Aufpreis schriftlich fest.':
      'All prices in euro including VAT, valid for cars in normal condition. Heavy soiling, pet hair or nicotine we discuss beforehand and put the surcharge in writing.',
    'Preise final freigeben': 'confirm final prices',

    /* Youngtimer */
    'Unsere Spezialität': 'Our speciality',
    'Ein 190er ist kein Neuwagen.': 'A 190 E is not a new car.',
    'Wir behandeln ihn auch nicht so.': 'We do not treat it like one.',
    'Alter Lack ist dünner. Kunststoffe aus den Neunzigern vertragen keine scharfen Reiniger. Bei Velours reicht ein Nassauszug, der bei modernem Stoff normal wäre, um Ränder zu hinterlassen. Wer das nicht weiß, macht mehr kaputt als sauber.':
      'Old paint is thinner. Plastics from the nineties do not take harsh cleaners. On velour, a wet extraction that would be routine on modern fabric is enough to leave rings. Anyone who does not know that breaks more than they clean.',
    'Wir fahren diese Autos selbst. E30, E36, E39, 190er, W124, W140, die AMG-Kombis aus den Zweitausendern. Deshalb wissen wir, wo man die Finger weglässt.':
      'We drive these cars ourselves. E30, E36, E39, 190 E, W124, W140, the AMG estates from the two-thousands. That is why we know where to keep our hands off.',
    'Dünnschicht-Lack': 'Thin-layer paint',
    'Velours & Leder': 'Velour & leather',
    'Chrom & Zierleisten': 'Chrome & trim',
    'Standzeit-Vorbereitung': 'Storage preparation',
    'Fahrzeug besprechen': 'Discuss your car',
    'Bildplatz': 'Image slot',
    'Foto': 'Photo',
    'Detail Innenraum': 'Interior detail',
    'Lack nachher': 'Paint after',
    'Halle': 'Workshop',

    /* Ablauf */
    'Sie müssen nirgendwo hinfahren.': 'You do not have to drive anywhere.',
    'Anfragen': 'Enquire',
    'Formular unten oder direkt eine Nachricht. Fahrzeug, Wunsch, Adresse. Sie bekommen den Fixpreis und einen Termin zurück.':
      'The form below or simply a message. Car, what you want, address. You get the fixed price and a date back.',
    'Wir holen ab': 'We pick up',
    'Zum vereinbarten Zeitpunkt bei Ihnen. Übergabeprotokoll mit Fotos vom Zustand, damit hinterher keine Frage offen ist.':
      'At the agreed time, at your place. Handover record with photos of the condition, so that nothing is left open afterwards.',
    'Arbeit in der Halle': 'Work in the workshop',
    'Licht, Wasser, Strom, keine Sonne, kein Wind. Nur so lässt sich Lack beurteilen und sauber arbeiten. Sie bekommen Zwischenstände.':
      'Light, water, power, no sun, no wind. That is the only way to judge paint and work cleanly. You get progress updates.',
    'Zurück vor die Tür': 'Back to your door',
    'Gemeinsame Abnahme. Erst wenn es passt, wird gezahlt. Bar, Karte oder Überweisung.':
      'We look it over together. You pay only once it is right. Cash, card or bank transfer.',

    /* Fahrzeuge */
    'Aus unserer Halle': 'From our workshop',
    'Fahrzeuge, die wir abgeben.': 'Cars we are selling.',
    'Wir sammeln und wir handeln. Jedes Auto, das hier steht, ist durch unsere eigene Aufbereitung gegangen. Wie es vorher aussah, sehen Sie auf unserem Kanal.':
      'We collect and we trade. Every car standing here has been through our own detailing. What it looked like before, you can see on our channel.',
    'Fahrzeug anfragen →': 'Ask about a car →',
    'Fahrzeugfoto': 'Car photo',
    'Foto + Daten': 'photo + data',
    'Fahrzeug, Modell': 'Make, model',
    'Baujahr · km · Zustand': 'Year · km · condition',
    'Preis €': 'Price €',
    'Anfragen →': 'Enquire →',
    'Verkauf erfolgt als Privatverkauf oder gewerblich je nach Fahrzeug — der Status steht bei jedem Inserat dabei.':
      'Depending on the car, the sale is private or commercial — the status is stated with each listing.',
    'Rechtsform mit Steuerberater klären': 'clarify legal form with the tax adviser',

    /* Buchung */
    'Termin': 'Booking',
    'Fixpreis in vier Schritten.': 'A fixed price in four steps.',
    'Keine Anmeldung, keine Vorauszahlung. Antwort meist am selben Tag.':
      'No account, no prepayment. Usually an answer the same day.',
    'Was soll gemacht werden?': 'What should we do?',
    'Weiß ich noch nicht': 'Not sure yet',
    'Wir beraten': 'We advise',
    'Welche Fahrzeugklasse?': 'Which vehicle class?',
    'Danach richtet sich der Preis.': 'The price follows from this.',
    'Kleinwagen': 'Small car',
    'Limousine, Kombi': 'Saloon, estate',
    '3er, C-Klasse, Passat': '3 Series, C-Class, Passat',
    'SUV, Van': 'SUV, van',
    'Wo und wann holen wir ab?': 'Where and when do we pick up?',
    'Postleitzahl der Abholadresse': 'Postcode of the pick-up address',
    'Bis 15 km ab unserer Halle ist die Abholung inklusive.':
      'Up to 15 km from our workshop, pick-up is included.',
    'Wunschtermin': 'Preferred date',
    'Unverbindlich — wir bestätigen oder schlagen etwas Nahes vor.':
      'Not binding — we confirm it or suggest something close to it.',
    'Wie erreichen wir Sie?': 'How do we reach you?',
    'Fahrzeug': 'Car',
    'Telefon': 'Phone',
    'E-Mail': 'Email',
    'Anmerkung': 'Note',
    'Vor- und Nachname': 'First and last name',
    'z. B. BMW E36 328i, 1995': 'e.g. BMW E36 328i, 1995',
    'name@beispiel.at': 'name@example.at',
    'Tierhaare, Flecken, empfindlicher Lack, besondere Wünsche …':
      'Pet hair, stains, delicate paint, special requests …',
    'Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden.':
      'I agree that my details may be stored in order to process this enquiry.',
    'Datenschutz': 'Privacy',
    'Anfrage ist da.': 'Your enquiry is in.',
    'Wir melden uns meist noch am selben Tag mit Fixpreis und Termin.':
      'We usually get back to you the same day with a fixed price and a date.',
    '← Zurück': '← Back',
    'Lieber direkt?': 'Prefer direct?',
    'Schreiben Sie uns auf TikTok': 'Message us on TikTok',
    'oder rufen Sie an:': 'or give us a call:',
    'Telefonnummer': 'phone number',

    /* Formular-Meldungen (aus dem Skript) */
    'Schritt {a} von {b}': 'Step {a} of {b}',
    'Weiter →': 'Next →',
    'Anfrage senden': 'Send enquiry',
    'Wird gesendet …': 'Sending …',
    'Bitte eine Leistung wählen.': 'Please choose a service.',
    'Bitte die Fahrzeugklasse wählen.': 'Please choose the vehicle class.',
    'Bitte eine gültige Postleitzahl eintragen.': 'Please enter a valid postcode.',
    'Bitte einen Wunschtermin wählen.': 'Please choose a preferred date.',
    'Bitte Ihren Namen eintragen.': 'Please enter your name.',
    'Bitte das Fahrzeug angeben.': 'Please state the car.',
    'Bitte eine Telefonnummer eintragen.': 'Please enter a phone number.',
    'Die E-Mail-Adresse sieht nicht richtig aus.': 'That email address does not look right.',
    'Bitte der Datenverarbeitung zustimmen.': 'Please agree to the data processing.',
    'Das Senden hat nicht geklappt. Bitte per TikTok-Nachricht melden.':
      'Sending did not work. Please reach us by TikTok message.',
    'Der Versand ist noch nicht eingerichtet. Bitte per TikTok-Nachricht melden.':
      'Sending is not set up yet. Please reach us by TikTok message.',

    /* FAQ */
    'Häufige Fragen': 'FAQ',
    'Was Kunden vorher wissen wollen.': 'What customers want to know first.',
    'Warum arbeitet ihr nicht direkt bei mir vor der Tür?': 'Why do you not work at my kerb?',
    'Zwei Gründe. Erstens rechtlich: In Wien darf auf öffentlichem Grund nicht gewaschen werden, weil das Waschwasser nicht in Boden oder Straßenkanal gelangen darf. Zweitens fachlich: Politur und Versiegelung brauchen gleichmäßiges Licht, Windstille und Temperatur. In der Sonne trocknet Politur an, bevor sie wirkt. Deshalb holen wir den Wagen ab — für Sie ist es derselbe Komfort, für das Ergebnis ein großer Unterschied.':
      'Two reasons. Legally: in Vienna a car may not be washed on public ground, because the wash water must not reach the soil or the street drain. Practically: polishing and sealing need even light, still air and a stable temperature. In the sun, polish dries on before it works. So we collect the car — for you it is the same convenience, for the result it is a large difference.',
    'Wie lange ist mein Auto weg?': 'How long is my car away?',
    'Handwäsche und Innenaufbereitung schaffen wir am selben Tag. Politur meist auch, bei starker Verschmutzung einen Tag. Komplettaufbereitung und Keramik brauchen ein bis zwei Tage. Den genauen Zeitraum sagen wir bei der Zusage, nicht erst bei der Abholung.':
      'A hand wash and an interior detail we manage the same day. A polish usually as well, one day if the car is heavily soiled. A full detail and ceramic take one to two days. We name the exact window when we confirm, not at pick-up.',
    'Was passiert, wenn beim Transport etwas passiert?': 'What happens if something goes wrong in transit?',
    'Wir dokumentieren den Zustand bei der Übernahme mit Fotos, Sie bekommen sie sofort. Für die Zeit, in der das Fahrzeug bei uns ist, sind wir versichert.':
      'We document the condition at handover with photos and send them to you straight away. For the time the car is with us, we are insured.',
    'Versicherungsdetails ergänzen': 'add insurance details',
    'Mein Auto ist alt und der Lack empfindlich. Geht das trotzdem?':
      'My car is old and the paint is delicate. Is that still possible?',
    'Das ist genau unser Fall. Bei Fahrzeugen ab den Achtzigern messen wir vorher die Lackstärke und entscheiden danach, ob und wie weit poliert wird. Bei nachlackierten oder dünnen Stellen lassen wir bewusst etwas stehen, statt durchzugehen. Was nicht geht, sagen wir vorher.':
      'That is exactly our case. On cars from the eighties onwards we measure the paint thickness first and decide from there whether and how far we polish. On resprayed or thin areas we deliberately leave something standing rather than going through. What is not possible, we say beforehand.',
    'Was kostet es, wenn das Auto stärker verschmutzt ist?':
      'What does it cost if the car is heavily soiled?',
    'Tierhaare, Nikotin, Schimmel oder Bausand kosten Zeit. Wir sehen das beim Zustandscheck vor Ort und nennen den Aufpreis, bevor wir losfahren. Sie können dann immer noch nein sagen. Nachträgliche Positionen auf der Rechnung gibt es bei uns nicht.':
      'Pet hair, nicotine, mould or building sand cost time. We see that during the condition check on site and name the surcharge before we drive off. You can still say no at that point. Items added to the invoice afterwards do not happen here.',
    'Verkauft ihr auch Autos?': 'Do you sell cars as well?',
    'Ja. Was gerade abzugeben ist, steht oben unter „Fahrzeuge“. Jedes davon ist durch unsere eigene Aufbereitung gegangen, den Zustand vorher sehen Sie auf unserem Kanal. Wenn Sie etwas Bestimmtes suchen, sagen Sie Bescheid — wir haben oft mehr in der Halle, als online steht.':
      'Yes. Whatever is currently available is listed above under “Cars”. Every one of them has been through our own detailing, and you can see the condition before in our videos. If you are looking for something specific, say so — we often have more in the workshop than is listed online.',

    /* Fusszeile */
    'Fahrzeugaufbereitung mit Hol- und Bringservice in Wien. Youngtimer, Sammlerfahrzeuge und alles, was gepflegt gehört.':
      'Car detailing with pick-up and delivery in Vienna. Youngtimers, collector cars and anything that deserves care.',
    '@rdvc.garage auf TikTok →': '@rdvc.garage on TikTok →',
    'Komplettaufbereitung': 'Full detailing',
    'Youngtimer-Pflege': 'Youngtimer care',
    'Kontakt': 'Contact',
    'Wien': 'Vienna',
    'Bezirk + Adresse': 'district + address',
    'Termine nach Vereinbarung': 'By appointment',
    'Impressum': 'Legal notice',

    /* ── Impressum ─────────────────────────────────────────────────────── */
    'Impressum | RDVC Garage Fahrzeugaufbereitung Wien':
      'Legal notice | RDVC Garage Car Detailing Vienna',
    'RDVC Garage Startseite': 'RDVC Garage home',
    '← Zurück zur Startseite': '← Back to the homepage',
    'Startseite': 'Home',
    'Offenlegung gemäß § 5 E-Commerce-Gesetz (ECG), § 14 UGB und § 25 Mediengesetz':
      'Disclosure under § 5 of the Austrian E-Commerce Act (ECG), § 14 UGB and § 25 of the Media Act',
    'ENTWURF — alle [PLATZHALTER] vor Live-Gang mit echten Firmendaten befüllen':
      'DRAFT — fill in every [PLACEHOLDER] with the real company data before going live',
    'Medieninhaber & Diensteanbieter': 'Media owner & service provider',
    '[PLATZHALTER: Firmenwortlaut, z. B. RDVC Garage e.U. / GmbH]':
      '[PLACEHOLDER: registered company name, e.g. RDVC Garage e.U. / GmbH]',
    '[PLATZHALTER: Straße Hausnummer]': '[PLACEHOLDER: street and number]',
    '[PLATZHALTER: PLZ] Wien, Österreich': '[PLACEHOLDER: postcode] Vienna, Austria',
    'Telefon: [PLATZHALTER: +43 …]': 'Phone: [PLACEHOLDER: +43 …]',
    'E-Mail: [PLATZHALTER: termin@…]': 'Email: [PLACEHOLDER: termin@…]',
    'Unternehmensdaten': 'Company data',
    'Rechtsform: [PLATZHALTER: GmbH / e.U. / GesbR]':
      'Legal form: [PLACEHOLDER: GmbH / e.U. / GesbR]',
    'Unternehmensgegenstand: Fahrzeugaufbereitung und -pflege, Handel mit Kraftfahrzeugen':
      'Business purpose: car detailing and care, trade in motor vehicles',
    'Freies Gewerbe „Wartung und Pflege von Kraftfahrzeugen"; Fahrzeughandel gesondert anmelden':
      'Unregulated trade „Wartung und Pflege von Kraftfahrzeugen"; the vehicle trade is registered separately',
    'Firmenbuchnummer: [PLATZHALTER: FN ……]': 'Company register number: [PLACEHOLDER: FN ……]',
    'Firmenbuchgericht: [PLATZHALTER: Handelsgericht Wien]':
      'Register court: [PLACEHOLDER: Commercial Court Vienna]',
    'UID-Nummer: [PLATZHALTER: ATU ……]': 'VAT ID: [PLACEHOLDER: ATU ……]',
    'Geschäftsführung / Inhaber: [PLATZHALTER: Name]': 'Management / owner: [PLACEHOLDER: name]',
    'Aufsicht & Mitgliedschaften': 'Supervision & memberships',
    'Gewerbebehörde: Magistrat der Stadt Wien [PLATZHALTER: zuständiges Magistratisches Bezirksamt]':
      'Trade authority: Magistrat der Stadt Wien [PLACEHOLDER: competent district office]',
    'Mitglied der Wirtschaftskammer Wien, Fachgruppe [PLATZHALTER]':
      'Member of the Vienna Chamber of Commerce, trade group [PLACEHOLDER]',
    'Anwendbare Rechtsvorschriften: Gewerbeordnung (GewO 1994), abrufbar unter':
      'Applicable legislation: Austrian Trade Act (GewO 1994), available at',
    'Blattlinie (§ 25 Mediengesetz)': 'Editorial policy (§ 25 Media Act)',
    'Diese Website dient der Information über das Unternehmen und seine Fahrzeugaufbereitungs-Dienstleistungen sowie der Anbahnung von Geschäftsbeziehungen.':
      'This website provides information about the company and its car detailing services and serves to initiate business relationships.',
    'Online-Streitbeilegung & Verbraucherschlichtung':
      'Online dispute resolution & consumer arbitration',
    'Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform der EU zu richten:':
      'Consumers may address complaints to the online dispute resolution platform of the EU:',
    '. Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen, sofern keine gesetzliche Pflicht besteht.':
      '. We are neither obliged nor willing to take part in dispute resolution proceedings before a consumer arbitration board unless required to do so by law.',
    'Haftung für Inhalte und Links': 'Liability for content and links',
    'Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität übernehmen wir dennoch keine Gewähr. Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben; für diese Inhalte ist stets der jeweilige Anbieter verantwortlich. Bei Bekanntwerden von Rechtsverletzungen werden derartige Links umgehend entfernt.':
      'The content of this website was produced with the greatest possible care. We nevertheless accept no liability for its accuracy, completeness or timeliness. This website contains links to external third-party websites over whose content we have no influence; the respective provider is always responsible for that content. Should we become aware of legal violations, such links will be removed without delay.',
    'Urheberrecht': 'Copyright',
    'Alle Inhalte dieser Website (Texte, Grafiken, Logos, Layout) unterliegen dem Urheberrecht. Jede Verwertung außerhalb der Grenzen des Urheberrechts bedarf der vorherigen schriftlichen Zustimmung des Medieninhabers.':
      'All content on this website (text, graphics, logos, layout) is protected by copyright. Any use beyond the limits of copyright law requires the prior written consent of the media owner.',
    '© 2026 RDVC Garage Autoaufbereitung · Wien': '© 2026 RDVC Garage Car Detailing · Vienna',

    /* ── Datenschutz ───────────────────────────────────────────────────── */
    'Datenschutzerklärung | RDVC Garage Fahrzeugaufbereitung Wien':
      'Privacy policy | RDVC Garage Car Detailing Vienna',
    'Datenschutzerklärung': 'Privacy policy',
    'Information gemäß Art. 13 f. Datenschutz-Grundverordnung (DSGVO)':
      'Information under Art. 13 f. of the General Data Protection Regulation (GDPR)',
    'ENTWURF — [PLATZHALTER] befüllen und Hosting-/Formular-Abschnitte beim Live-Gang final prüfen':
      'DRAFT — fill in the [PLACEHOLDER]s and give the hosting and form sections a final check before going live',
    '1. Verantwortlicher': '1. Controller',
    '[PLATZHALTER: Firmenwortlaut]': '[PLACEHOLDER: registered company name]',
    '[PLATZHALTER: Adresse], Wien, Österreich': '[PLACEHOLDER: address], Vienna, Austria',
    'E-Mail: [PLATZHALTER: termin@…] · Telefon: [PLATZHALTER: +43 …]':
      'Email: [PLACEHOLDER: termin@…] · Phone: [PLACEHOLDER: +43 …]',
    '2. Grundsätze': '2. Principles',
    'Wir verarbeiten personenbezogene Daten ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, österreichisches Datenschutzgesetz). Diese Website verwendet':
      'We process personal data solely on the basis of the statutory provisions (GDPR, Austrian Data Protection Act). This website uses',
    'keine Cookies': 'no cookies',
    'keine Tracking- oder Analyse-Dienste': 'no tracking or analytics services',
    'und': 'and',
    'keine Werbenetzwerke': 'no advertising networks',
    '. Schriftarten und alle Skripte werden lokal von unserem Server geladen — es findet kein Abruf von Drittanbieter-CDNs (z. B. Google Fonts) statt.':
      '. Fonts and all scripts are loaded locally from our own server — no third-party CDN (e.g. Google Fonts) is contacted.',
    '3. Hosting und Server-Logfiles': '3. Hosting and server log files',
    'Beim Aufruf dieser Website verarbeitet unser Hosting-Anbieter automatisch technische Zugriffsdaten (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp), die zur Auslieferung und zur Sicherheit der Website erforderlich sind. Rechtsgrundlage ist unser berechtigtes Interesse am sicheren und stabilen Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).':
      'When you open this website, our hosting provider automatically processes technical access data (IP address, date and time, page requested, browser type) that is required to deliver and secure the website. The legal basis is our legitimate interest in the secure and stable operation of the website (Art. 6(1)(f) GDPR).',
    '[PLATZHALTER Hosting: Bei GitHub Pages — „Hosting-Anbieter ist GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA. GitHub ist nach dem EU-U.S. Data Privacy Framework zertifiziert; mit der Verarbeitung in den USA kann eine Datenübermittlung in ein Drittland verbunden sein." — bei anderem Hoster entsprechend ersetzen und ggf. Auftragsverarbeitungsvertrag (Art. 28 DSGVO) abschließen.]':
      '[PLACEHOLDER hosting: for GitHub Pages — „The hosting provider is GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA. GitHub is certified under the EU-U.S. Data Privacy Framework; processing in the USA may involve a transfer to a third country." — replace this for any other host and conclude a data processing agreement (Art. 28 GDPR) where required.]',
    '4. Anfrage-Formular und Kontaktaufnahme': '4. Enquiry form and contact',
    'Wenn Sie unser Anfrage-Formular nutzen oder uns per E-Mail bzw. Telefon kontaktieren, verarbeiten wir die von Ihnen angegebenen Daten (Name, Telefonnummer, optional E-Mail-Adresse, Fahrzeugdaten wie Marke/Modell und Fahrzeugklasse, Wunschtermin und Ihre Nachricht) zur Bearbeitung Ihrer Anfrage und zur Erstellung eines Angebots. Rechtsgrundlage ist die Durchführung vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) sowie Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).':
      'If you use our enquiry form or contact us by email or phone, we process the data you provide (name, phone number, optionally email address, vehicle data such as make/model and vehicle class, preferred date and your message) in order to handle your enquiry and prepare a quote. The legal basis is the performance of pre-contractual measures (Art. 6(1)(b) GDPR) and your consent (Art. 6(1)(a) GDPR).',
    '[PLATZHALTER Formular-Dienstleister: Sobald der Formular-Versand über Formspree läuft — „Für die technische Übermittlung des Formulars nutzen wir Formspree, Inc. (USA) als Auftragsverarbeiter gemäß Art. 28 DSGVO; die Übermittlung in die USA erfolgt auf Basis der EU-Standardvertragsklauseln." — bis dahin erfolgt der Versand direkt aus Ihrem E-Mail-Programm.]':
      '[PLACEHOLDER form provider: once the form is sent via Formspree — „For the technical transmission of the form we use Formspree, Inc. (USA) as a processor under Art. 28 GDPR; the transfer to the USA is based on the EU standard contractual clauses." — until then the form is sent directly from your own email client.]',
    'Anfragedaten speichern wir für die Dauer der Angebots- und Vertragsabwicklung; darüber hinaus nur, soweit gesetzliche Aufbewahrungspflichten (z. B. § 132 BAO: 7 Jahre für Geschäftsunterlagen) bestehen.':
      'We store enquiry data for the duration of the quotation and contract process; beyond that only where statutory retention obligations apply (e.g. § 132 BAO: seven years for business records).',
    '5. Kundendaten bei Auftragsdurchführung': '5. Customer data while the job is carried out',
    'Im Rahmen der Auftragsabwicklung (Terminplanung, Fahrzeug- und Schlüsselübernahme inkl. Zustandsdokumentation, Rechnungslegung) verarbeiten wir Vertrags- und Kontaktdaten unserer Kunden auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO sowie zur Erfüllung rechtlicher Pflichten (Art. 6 Abs. 1 lit. c DSGVO). Eine Weitergabe an Dritte erfolgt nur, soweit dies zur Vertragserfüllung erforderlich ist (z. B. Steuerberatung) oder eine gesetzliche Pflicht besteht.':
      'While carrying out the job (scheduling, taking over the car and its keys including condition documentation, invoicing) we process contract and contact data of our customers on the basis of Art. 6(1)(b) GDPR and in order to fulfil legal obligations (Art. 6(1)(c) GDPR). Data is passed to third parties only where this is necessary to perform the contract (e.g. tax advice) or where a legal obligation exists.',
    '6. Ihre Rechte': '6. Your rights',
    'Ihnen stehen die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch zu. Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Wenden Sie sich dazu an die oben genannten Kontaktdaten.':
      'You have the right to information, rectification, erasure, restriction of processing, data portability and objection. You may withdraw consent at any time with effect for the future. To do so, use the contact details given above.',
    'Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen Datenschutzrecht verstößt, können Sie sich bei der österreichischen Datenschutzbehörde beschweren: Österreichische Datenschutzbehörde, Barichgasse 40–42, 1030 Wien,':
      'If you believe that the processing of your data infringes data protection law, you may lodge a complaint with the Austrian data protection authority: Österreichische Datenschutzbehörde, Barichgasse 40–42, 1030 Vienna,',
    '7. Stand': '7. Version',
    'Diese Datenschutzerklärung hat den Stand Juli 2026 und wird bei Änderungen der Website oder der Rechtslage aktualisiert.':
      'This privacy policy is dated July 2026 and is updated whenever the website or the legal situation changes.',

    /* ── Bildstrecken ──────────────────────────────────────────────────── */
    'Unsere eigenen Autos. Und die unserer Kunden.': 'Our own cars. And our customers\u2019.',
    'Aus der Halle': 'From the workshop',
    'AMG-Felge': 'AMG wheel',
    'E30 Cabrio': 'E30 Convertible',
    'BMW E30 Cabrio': 'BMW E30 Convertible',
    'Nach der Versiegelung': 'After sealing',

    /* Bildbeschreibungen. Sie stehen im alt-Attribut und werden von
       Screenreadern vorgelesen — deshalb beschreiben sie das Motiv,
       statt es nur zu benennen. */
    'Hochdruckreiniger spült Schaum von einem BMW E39':
      'Pressure washer rinsing foam off a BMW E39',
    'Typenschild 2.3-16 am Heck eines Mercedes 190E':
      'The 2.3-16 badge on the rear of a Mercedes 190E',
    'Innenraum eines BMW E30 Cabrio mit hellem Leder':
      'Interior of a BMW E30 convertible with light leather',
    'Gereinigte AMG-Felge an einem Mercedes 190E':
      'Cleaned AMG wheel on a Mercedes 190E',
    'Wasserperlen auf frisch versiegeltem Lack':
      'Water beading on freshly sealed paint',
    'BMW E39 M5 in Avusblau in der Halle':
      'BMW E39 M5 in Avus blue in the workshop',
    'BMW E30 Cabrio auf einer Landstraße':
      'BMW E30 convertible on a country road',
    'Schwarzer Mercedes 190E von vorne':
      'Black Mercedes 190E from the front',
    'Staubiges Fahrzeugheck vor der Aufbereitung':
      'A dusty car rear before detailing',
    'BMW E30 Cabrio unterwegs zur Halle':
      'BMW E30 convertible on its way to the workshop',
    'Mikrofasertuch auf einer nassen Fahrzeugflanke':
      'Microfibre cloth on a wet body panel',
    'Fertig aufbereiteter BMW E39 M5':
      'A finished BMW E39 M5'
  };

  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }

  /* Uebersetzt einen einzelnen Text. Kein Eintrag = deutsch stehen lassen. */
  function t(de) {
    if (lang === 'de') return de;
    var k = norm(de);
    return Object.prototype.hasOwnProperty.call(EN, k) ? EN[k] : de;
  }

  /* ── 3. Textknoten einsammeln und umschalten ───────────────────────────── */
  var knoten = [];   /* { n: Textknoten, de: Originaltext } */
  var attribute = []; /* { el, name, de } */
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];

  function sammle() {
    var lauf = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (p.closest('[data-nt]')) return NodeFilter.FILTER_REJECT;
        return norm(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = lauf.nextNode())) knoten.push({ n: n, de: n.nodeValue });

    document.querySelectorAll('[' + ATTRS.join('],[') + ']').forEach(function (el) {
      ATTRS.forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && norm(v)) attribute.push({ el: el, name: a, de: v });
      });
    });
  }

  function uebersetze() {
    knoten.forEach(function (e) {
      /* Rand-Leerraum erhalten, sonst kleben Text und Link aneinander. */
      var m = e.de.match(/^(\s*)([\s\S]*?)(\s*)$/);
      e.n.nodeValue = m[1] + t(m[2]) + m[3];
    });
    attribute.forEach(function (e) { e.el.setAttribute(e.name, t(e.de)); });

    document.documentElement.lang = lang;
    if (titelDe) document.title = t(titelDe);
    var md = document.querySelector('meta[name="description"]');
    if (md && beschreibungDe) md.setAttribute('content', t(beschreibungDe));

    var btn = document.getElementById('langBtn');
    if (btn) {
      var label = btn.querySelector('.lang-code');
      if (label) label.textContent = lang.toUpperCase();
      btn.setAttribute('aria-label', lang === 'de' ? 'Switch to English' : 'Auf Deutsch umschalten');
      btn.title = btn.getAttribute('aria-label');
    }
    var tb = document.getElementById('themeBtn');
    if (tb) {
      tb.setAttribute('aria-label', lang === 'de'
        ? (theme === 'dark' ? 'Auf helle Ansicht umschalten' : 'Auf dunkle Ansicht umschalten')
        : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'));
      tb.title = tb.getAttribute('aria-label');
    }
  }

  var titelDe = '', beschreibungDe = '';

  /* ── 4. Verdrahtung ────────────────────────────────────────────────────── */
  function start() {
    titelDe = document.title;
    var md = document.querySelector('meta[name="description"]');
    beschreibungDe = md ? md.getAttribute('content') : '';

    sammle();
    if (lang === 'en') uebersetze();

    var tb = document.getElementById('themeBtn');
    if (tb) tb.addEventListener('click', function () {
      setzeTheme(theme === 'dark' ? 'light' : 'dark', true);
      uebersetze();   /* nur wegen der Knopf-Beschriftung */
    });

    var lb = document.getElementById('langBtn');
    if (lb) lb.addEventListener('click', function () {
      lang = lang === 'de' ? 'en' : 'de';
      schreib(SP_LANG, lang);
      uebersetze();
      document.dispatchEvent(new CustomEvent('rdvc:lang', { detail: lang }));
    });

    uebersetze();   /* setzt auch im deutschen Fall die Knopf-Beschriftungen */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  /* Fuer das Formular-Skript am Seitenende. */
  window.RDVC = {
    t: t,
    sprache: function () { return lang; }
  };
})();
