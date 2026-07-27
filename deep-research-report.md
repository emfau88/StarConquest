# StarConquest: Optimale visuelle und emotionale Neuausrichtung für CrazyGames und Poki

## Untersuchungsbasis und Kurzurteil

Diese Untersuchung basiert auf vier Säulen: dem öffentlich spielbaren Build, der vollständigen Rohdatei des aktuellen `index.html`, den zusätzlichen Iterationsdateien `index1.html` bis `index4.html`, sowie aktuellen Plattform- und Marktquellen von CrazyGames, Poki und relevanten Vergleichstiteln. Das Repository ist derzeit extrem kompakt: Es enthält im Wesentlichen nur `README.md` und fünf HTML-Dateien; die README selbst besteht nur aus einer Zeile. Der aktuelle Build ist ein einzelnes HTML-Dokument mit eingebettetem CSS und JavaScript, 1.099 Zeilen Code und rund 55 KB Dateigröße. Das ist technisch leichtgewichtig, spricht aber zugleich für einen prototypischen Entwicklungsstand ohne echte Asset-, UI- oder Content-Pipeline. citeturn1view0turn5view5turn4view0

Wichtig vorweg: Ich konnte in dieser Umgebung nicht wie ein menschlicher Tester frei und vollständig „hands-on“ spielen. Meine Aussagen zur Spielwirkung stützen sich deshalb auf die live zugängliche Oberfläche, die offengelegte Quelllogik, das HUD-/Flow-Verhalten und die Rendering-/Input-/UI-Implementierung. Für die Beurteilung von Rhythmus, Lesbarkeit, Verständlichkeit und Portal-Tauglichkeit ist diese Quellenlage trotzdem belastbar, weil das komplette Spiel in der Rohdatei lesbar ist. citeturn1view1turn5view0

Das Kurzurteil ist klar: **StarConquest hat bereits einen guten mechanischen Kern, aber die aktuelle audiovisuelle Verpackung ist nicht marktreif für eine starke CrazyGames- oder Poki-Performance.** Die Mechanik ist brauchbar, die Boost/Cut-Idee ist sogar ein echter Differenzator, die Buildgröße ist hervorragend und das Procedural-Rendering ist für einen Solo-Entwickler sehr dankbar. Was dem Spiel fehlt, ist keine neue Genre-Identität, sondern eine **viel konsequentere Inszenierung**: bessere Silhouetten, wärmere und freundlichere Markenwirkung, sichtbarere Energieflüsse, klarere Hierarchie, deutlich reduziertere Onboarding-Reibung und eine visuelle Sprache, die auf Screenshot und im Fünfsekunden-Clip sofort „Spielspaß“ statt „Programmierer-RTS-Prototyp“ vermittelt. citeturn10view0turn12view0turn17view3turn17view6turn17view7

Meine Empfehlung lautet deshalb nicht „nur Polishing“. **StarConquest braucht ein echtes Präsentations-Redesign bei konstantem Core-Gameplay.** Der Kern soll bleiben, aber die Verpackung muss neu aufgesetzt werden: von „dunkles Hobbyprojekt mit Techno-HUD“ zu „sofort verständliches, visuell sauberes, schnelles Space-Conquest-Puzzle mit starkem Thumbnail-Hook“. citeturn26view1turn26view2turn17view2turn17view8

## Schonungslose Bestandsanalyse

Was bereits trägt, ist die Systemmechanik. Der Code zeigt einen klaren Core-Loop aus Produktion, Verbindung, Transport, Verstärkung, Angriff und Übernahme. Es gibt vier Systemklassen mit unterschiedlichen Kapazitäten, Produktionsraten und Verbindungsgrenzen, acht handgebaute Levels, Sternwertungen über Zeitziele, lokale Progression via `localStorage`, prozeduralen Hintergrund, animierte Energy-Beams, Partikel, Capture-Impulse und einfache WebAudio-SFX. Das ist mehr als ein grauer Greybox-Prototyp; es ist ein spielbarer, strukturell vollständiger Vertical Slice. citeturn7view3turn6view0turn9view0turn10view0turn12view0

Was dennoch deutlich nach frühem Produktstadium aussieht, ist fast alles um diesen Kern herum. Das Spiel steckt in einer einzigen HTML-Datei; Menü, HUD, Renderlogik, Audio, Input, Effekte, KI und UI sind nicht getrennt. Das Repository enthält zudem mehrere ältere Varianten, deren Titel noch ausdrücklich „Tentacle Wars“ lauten. Diese historische Spur ist nicht nur technisch, sondern auch markenstrategisch problematisch: Sie bestätigt den Eindruck einer späten Umbenennung statt einer klaren eigenen Identität. citeturn4view0turn13view0turn13view1turn13view2turn13view3

Visuell funktioniert der aktuelle Build teilweise überraschend ordentlich: Der Sternenhintergrund mit radialen Nebeln und entfernten Galaxien ist stimmungsvoll, die Nodes haben Glow, Ringe und Capture-Flashes, und die Beams zeigen durch Perlen, Wachstumsspitze und Farbverläufe bereits brauchbare Bewegung. Das Problem ist nicht völlige Hässlichkeit, sondern **fehlende Produktreife in der Bildsprache**. Alles ist rund, dunkel, technisch und ähnlich. Die Systemtypen unterscheiden sich primär über Größe und Ringzahl; die Besitzzustände primär über Blau/Rot/Orange/Grau. Für ein Strategiespiel im Browser reicht das funktional, aber nicht verkaufspsychologisch. Auf einem Thumbnail bleibt davon fast nur „ein dunkles Sci-Fi-Brett mit Kreisen“ übrig. citeturn8view1turn9view0turn10view0

Die größte UX-Schwäche liegt im Moment **nicht** im Input-Kern, sondern in der Informationsarchitektur. Der Build beginnt mit einem Main Menu, dann Level Select, dann Intro-Overlay und erst dann Mission. CrazyGames empfiehlt für Full Launch, direkt in Gameplay zu landen; Poki misst Conversion-to-Play an der ersten Gameplay-Interaktion und betont kurze Lade- und Onboarding-Wege. Der aktuelle Flow bremst genau dort, wo Plattformen Geschwindigkeit erwarten. citeturn5view0turn7view0turn17view0turn17view3turn17view7turn15search0

Ein weiterer UX-Fehler ist besonders gravierend: Die HUD-Beschriftung **„ENERGIE“** zeigt laut Code nicht die aktuelle Energie an, sondern den Levelwert `powerLimit`. Derselbe Wert taucht im Intro bereits als „Max Energie“ auf. Dazu kommt: In der Gameplay-Logik scheint `powerLimit` gar nicht als Spielregel erzwungen zu werden, sondern wird nur in Intro und HUD geschrieben. Das erzeugt doppelte und missverständliche Information. Ein Spieler liest „Energie“, sieht aber keinen tatsächlich verbrauchten oder erzeugten globalen Energiewert. citeturn29view1turn30view0turn30view1

Ebenso irreführend ist der Schalter **25% / 50% / 100%**. Die UI suggeriert Transferanteile, aber technisch ändert der Button nicht die pro Verbindung gesendete Quote, sondern den globalen `FLOW_RATE` des Systems. Das ist ein klassischer Semantikbruch: Die Beschriftung verspricht eine Sache, die Regel dahinter tut etwas anderes. Solche Widersprüche sind für Casual-Portalspieler toxisch, weil sie das Gefühl von „Das Spiel erklärt sich nicht sauber“ erzeugen. citeturn5view0turn29view3

Auch der Range-Kreis beim Draggen ist problematisch. Der Code zeichnet beim Ziehen einen Kreis mit fixem Radius 200, während die tatsächliche Erreichbarkeit von Distanzkosten und Energie abhängt, nicht von einem harten Range-Limit. Visuell kommuniziert das UI also eine mechanische Grenze, die es so nicht gibt. Gerade auf Mobile, wo Spieler stark auf visuelle Heuristiken reagieren, ist das irreführend. citeturn29view2turn31view0

Mobile-tauglich ist der Build teilweise, aber nicht überzeugend. Positiv: `viewport-fit=cover`, Safe-Area-Bezug, Touch-Events, Canvas-Fullscreen und verhinderte Standardgesten zeigen, dass mobile Nutzung mitgedacht wurde. Negativ: Sehr viele Schriftgrößen liegen in einem Bereich von 7 bis 13 Pixeln, darunter HUD-Elemente, Klassennamen in den Systemscheiben, Tooltip-Texte und Hilfsanzeigen. CrazyGames fordert Lesbarkeit auf kleinen und nicht-retinaartigen Flächen; Poki verlangt Mobile- und Tablet-Spielbarkeit und saubere Skalierung auf 16:9. In der aktuellen Ausprägung ist StarConquest auf kleineren Displays funktional, aber nicht entspannt lesbar. citeturn5view0turn17view2turn17view6

Die stärksten Stellen des aktuellen Builds sind dort, wo der Code direktes Feedback erzeugt: Capture-Burst, Ringpuls, Boost-Label, Swipe-Cut, ratio-basierte Vorschau beim Zielen, Bead-Flow in den Beams und einfache SFX. Diese Dinge zeigen, dass das Spielgefühl nicht tot ist. Das Problem ist eher, dass viele dieser Signale klein, zu dunkel, zu technisch oder semantisch nicht sauber priorisiert sind. Das Spiel „fühlt“ sich besser an, als es „verkauft“ aussieht. citeturn8view3turn8view8turn10view0turn11view0turn7view2turn7view3

| Bereich | Aktueller Zustand | Problem | Auswirkung auf Spieler | Priorität |
|---|---|---|---|---|
| Kernmechanik | Produktion, Verbindungen, Eroberung, Boost/Cut funktionieren | Kein Problem im Kern, sondern in der Verpackung | Gute Basis wird unterschätzt | P0 |
| Markenidentität | Titel wurde auf `index.html` zu Star Conquest umgestellt, ältere Repo-Versionen heißen noch „Tentacle Wars“ | Klon-Assoziation und unfertige Rebrand-Spur | Schwächeres Vertrauen, geringere Eigenständigkeit | P0 |
| Startflow | Main Menu → Level Select → Intro → Mission | Zu viele Schritte vor erstem Spielkontakt | Schlechtere Conversion-to-Play | P0 |
| HUD-Semantik | „Energie“ zeigt `powerLimit` statt klaren Live-Wert | Falsche oder doppelte Information | Verwirrung über Regeln und Ziele | P0 |
| Transfer-Buttons | 25/50/100 ändern globalen Flow statt Transferanteil | UI lügt über Funktion | Lernwiderstand, Frust | P0 |
| Lesbarkeit | Kleine, technisch wirkende Schriftgrößen | Mobile und Screenshot-Lesbarkeit schwach | Weniger Klarheit und schlechtere QA-Werte | P0 |
| Systemtypen | Unterschied über Größe/Ringe/Textlabel | Zu ähnliche Silhouetten | Langsameres Erkennen im Spiel und im Thumbnail | P1 |
| Feedback | Gute Effekte vorhanden, aber klein und dunkel | Wirkung nicht priorisiert genug | Weniger „saftiges“ Gefühl, weniger Wow im Clip | P1 |
| Screenshot-Wirkung | Dunkler Screen, kleine Nodes, wenig Hook | Kein starker Blickmagnet | Schwächere Klickrate auf Portalen | P1 |
| Audio | Nur kleine synthetische SFX, keine Musik, keine Klangwelt | Atmosphärisch dünn | Weniger Bindung, schwächeres Sieg-/Boost-Gefühl | P1 |
| UI-Flächennutzung | Unten permanenter Selector, oben kleine HUD-Zeile, mehrere Overlay-Screens | Zu viel Meta-Fläche für zu wenig spielrelevanten Nutzen | Spielfeld wirkt kleiner, Onboarding träge | P1 |
| Internationalisierung | Live-Build komplett deutsch | CrazyGames verlangt Englisch, Poki ist international | Geringere Reichweite, Review-Hürde | P0 |
| Technische Struktur | Monolithische Ein-Datei-Architektur | Änderungen sind fehleranfällig | Langsameres Iterieren | P2 |
| Levelpräsentation | Acht Levels, Sternzeiten, kurze Missionen | Gute Struktur wird visuell nicht ausgeschlachtet | Weniger Perfektionierungsdrang | P1 |
| Portalintegration | Kein CrazyGames-/Poki-SDK, keine Gameplay-Events, kein Account-/Cloud-Save-Pfad | Noch nicht portalfertig | Reibung bei Submission und Soft-Launch | P1 |

Quellbasiert ist die härteste, aber fairste Zusammenfassung deshalb: **StarConquest wirkt wie ein bereits erstaunlich kompletter Mechanik-Prototyp, der noch nie einen professionellen Art-, Brand- und Portal-Readiness-Pass bekommen hat.** citeturn4view0turn5view0turn17view0turn17view2turn17view4turn15search0

## Markt, Konkurrenz und Plattformmaßstäbe

Der Plattformkontext 2026 ist günstig, aber anspruchsvoll. Poki spricht offiziell von mehr als 100 Millionen monatlich aktiven Spielern; CrazyGames nennt offiziell mehr als 50 Millionen monatlich aktive Nutzer. Gleichzeitig betonen beide Plattformen Geschwindigkeit, Lesbarkeit, Mobile-Tauglichkeit und niedrige Reibung. Poki misst Conversion-to-Play explizit am ersten `gameplayStart()`, CrazyGames trackt First-Load und -Size bis zum Moment, in dem echtes Gameplay beginnt. Das bedeutet: Für ein Spiel wie StarConquest ist nicht nur die Mechanik wichtig, sondern **wie schnell ein neuer Spieler das Gefühl bekommt, schon „im Spiel“ zu sein**. citeturn27search15turn27search4turn17view3turn17view7turn15search0

Die Web-Spielerschaft ist dabei weniger „hypercasual und flüchtig“, als viele Entwickler noch annehmen. Pokis 2026-Studie beschreibt, dass 37 % der befragten Web-Gamer mehrmals täglich spielen, Sessions oft in den Bereich 11–20 Minuten fallen, und der Web-Kontext stark von kurzen Pausen, Zuhause-Relaxen und Multi-Tasking geprägt ist. Genau daraus folgt für StarConquest eine klare Positionierung: nicht als schweres RTS, sondern als **kurzzyklischer, visuell befriedigender Taktik-Puzzler für wiederholte Sessions**. citeturn28view0turn28view1

iturn24image4turn24image1turn25image0turn25image2

Die relevantesten Vergleichstitel zeigen sechs unterschiedliche Erfolgshebel. **Galcon 2** verkauft die Kernformel über Tempo, klare Planeten und schnelle Schwarmbewegung. **Auralux: Constellations** verkauft fast dieselbe abstrakte Ground-Truth über Ruhe, Ambient-Musik und minimalistische Eleganz. **Eufloria** macht Conquest organisch, weich und poetisch. **Tentacle Wars** emotionalisiert abstrakte Verbindungen über biologische Dramatik und audiovisuelle Dichte. **City Takeover** beweist auf CrazyGames, dass dieselbe Verbindungslogik in einer bunten, sehr verständlichen Casual-Hülle massenfähig wird. **MicroWars** beweist auf Poki, dass Node-Conquest mit freundlicher, runder Ikonografie und sauberem Drag-Input hohe Reichweite erzielen kann. citeturn22search2turn22search10turn22search21turn22search15turn26view1turn26view2

Für StarConquest ist daraus besonders wichtig, **was nicht kopiert werden sollte**. Weder das biologische Tentakel-Motiv von Tentacle Wars noch die meditative Komplett-Abstraktion von Auralux sind als Eins-zu-eins-Richtung ideal. Das erste ist zu naheliegend und markenriskant; das zweite ist für große Portal-Klickflächen oft zu kühl und zu wenig „friendly“. Besser ist die Schnittmenge: die formale Klarheit von Auralux, die organische Bewegungsbefriedigung von Tentacle Wars, die Casual-Lesbarkeit von City Takeover und die mobile Direktheit von MicroWars. citeturn22search10turn22search15turn26view1turn26view2turn17view5

Die offiziellen Plattformmaßstäbe sprechen ebenfalls eine deutliche Sprache. CrazyGames verlangt lesbare Inhalte auf definierten Desktop- und Mobile-Größen, englische Lokalisierung, intuitive Controls, saubere Performance und Originalität. Die mobile Homepage verlangt initiale Downloadgröße von höchstens 20 MB; der aktuelle StarConquest-Build liegt technisch weit darunter. Poki verlangt Mobile- und Tablet-Support, saubere 16:9-Skalierung und ist bei Thumbnails inzwischen sehr klar: quadratisch, full bleed, keine Ränder, **kein Text im Thumbnail**, statische und animierte Varianten für den globalen Release. StarConquest verfehlt aktuell vor allem die Punkte Onboarding, Lesbarkeit, Internationalisierung, Thumbnail-Klarheit und Markenoriginalität – nicht aber die Dateigröße. citeturn17view1turn17view2turn17view6turn17view8turn16search4

Die Konkurrenzanalyse spricht daher gegen zwei extreme Fehlentscheidungen. Erstens: Ein reines „sci-fi-dark-neon polish“ ohne größere Lesbarkeitsreform wäre zu wenig. Zweitens: Ein voll cartooniger Charakter-Overhaul mit zig Assets wäre für den Scope falsch. Erfolgreiche Webspiele im Segment gewinnen nicht durch Asset-Masse, sondern durch **klare Formen, starke Farbcodierung, sofortiges Feedback und eine visuelle Erzählung, die im ersten Blick verständlich ist**. citeturn26view0turn26view1turn26view2turn17view3turn15search7

| Spiel | Was daran funktioniert | Was StarConquest übernehmen sollte | Was StarConquest nicht kopieren sollte | Umsetzungsaufwand |
|---|---|---|---|---|
| Galcon 2 | Hohe Geschwindigkeit, klare Planeten, sofortige Schwarmlesbarkeit | aggressive Lesbarkeit der Besitzverhältnisse und direkter Match-Read | Multiplayer-/Arcade-Fokus, der den Puzzle-Teil verdrängt | niedrig bis mittel citeturn22search2turn22search7 |
| Auralux: Constellations | Ruhige Premium-Minimalistik, ambienter Flow, elegante Farbräume | elegante Linien- und Orbitalästhetik, weniger HUD-Lärm | zu kühle, zu distante Emotionalität für Portal-Klicks | mittel citeturn22search10turn22search6 |
| Eufloria | Freundliches organisches Space-Feeling, sanfte Atmosphäre | warmes, lebendiges Space-Theme statt kalter Tech-Look | zu poetisch-langsam für kurze Browser-Sessions | mittel bis hoch citeturn22search21turn22search1 |
| Tentacle Wars | starke audiovisuelle Identität, klare Verbindungsdramatik | Übernahme, Cut und Spannung deutlich dramatischer inszenieren | biologische Bildwelt und direkte Klon-Anmutung | niedrig bis mittel, wenn nur Feedback übernommen wird citeturn22search15turn22search3 |
| City Takeover | extreme Erstverständlichkeit, kräftige Farben, sichtbare Bewegung | größere Silhouetten, hellere Maps, klarere Progressionslesbarkeit | zu generische Mobile-City-Skin | niedrig bis mittel citeturn26view1turn21search0 |
| MicroWars | weiche Formen, mobile Drag-Lesbarkeit, starke Casual-Zugänglichkeit | freundlichere Nodes, simplerer ersten Eindruck, mobile Signaletik | zu „mikroskopisch niedlich“ als Hauptidentität | niedrig bis mittel citeturn26view2turn26view3 |
| Tower Battle | verbindet Casual-Zugriff mit „mehr Spieltiefe“ und hunderten Levels | breitere Marktverpackung mit klar vibrierenden Maps und Systemrollen | zu viele RPG-/Upgrade-Systeme | hoch, wenn mechanisch kopiert; niedrig, wenn nur Präsentationslogik genommen wird citeturn26view0 |

Mein Schluss aus Markt und Plattformen ist damit gesichert: **StarConquest sollte sich als fertig designtes, kurzes, internationales, visuell sauberes Space-Conquest-Puzzle präsentieren – nicht als abstraktes Indie-Experiment und nicht als ernstes Hardcore-RTS.** citeturn17view2turn17view7turn28view0turn28view1

## Zielgruppen und emotionale Positionierung

Die realistisch beste Zielgruppe für StarConquest auf CrazyGames und Poki sind **Teenager und erwachsene Casual-Spieler mit einer Affinität zu klaren Strategieschleifen**, plus Mobile-Spieler, die in kurzen Pausen Level perfektionieren möchten. Das ergibt sich aus drei Dingen: der niedrigen Interaktionsbasis von Drag-and-Cut, der levelbasierten Struktur mit Sternzielen und dem Portalnutzungsverhalten, das stark von kurzen, wiederholten Sessions geprägt ist. Sehr junge Kinder sind nicht die ideale Hauptzielgruppe, weil Boost-Cut und Timing bereits eine kleine taktische Abstraktion verlangen. Hardcore-RTS-Spieler wiederum sind nicht die primäre Zielgruppe, weil das Spiel keine Wirtschaftstiefe, Einheitenvielfalt oder langfristige Meta anbietet. citeturn28view0turn26view2turn26view1

Die falsche Positionierung wäre deshalb „ernstes Weltraum-Strategiespiel“. Die richtige Positionierung ist **Hybrid aus Strategie, Puzzle und sehr leichter Arcade-Befriedigung**. Der Spieler soll nicht denken: „Ich starte einen komplexen Kriegssimulator.“ Er soll denken: „Ich ziehe Linien, baue Momentum auf, mache clevere Schnitte und kippe in 90 Sekunden eine ganze Karte zu meinen Gunsten.“ Genau dieses „easy to read, satisfying to master“-Gefühl funktioniert auf den Plattformen deutlich besser als schwerfällige Midcore-Rhetorik. citeturn17view3turn17view7turn21search0turn26view1

Atmosphärisch sollte StarConquest **nicht kalt, düster und steril** werden. Freundlich heißt hier nicht kindisch; es heißt: farblich offen, emotional belohnend, sofort lesbar und nicht aggressiv kompliziert. Die Stimmung sollte intelligent, leicht majestätisch, aber zugänglich sein. Humor darf fein vorhanden sein, aber eher in Mikrotexten und rhythmischem Feedback als in Slapstick. Das Spiel soll sich **clever und mächtig** anfühlen, mit kurzen Schüben von Triumph, nicht mit pathetischer Space-Opera-Schwere. citeturn22search10turn26view2turn17view8

Die gewünschte Emotionskurve ist recht klar. Der Startbildschirm soll **„Ich verstehe sofort, worum es geht, und das sieht hochwertig aus“** auslösen. Ein erfolgreicher Angriff soll **„Jetzt kippt das Feld“** fühlen lassen. Ein Levelsieg soll **„sauber gelöst, komm noch eins“** vermitteln. Und der Re-Engagement-Impuls muss nicht aus Story kommen, sondern aus **Sternejagd, Knappheit und sichtbarer Beherrschung des Raums**. Pokis Bericht, dass Webspieler oft mehrere Spiele pro Session anspielen, spricht dafür, dass StarConquest nicht um epische Bindung, sondern um **schnelle Wiederanwahl** kämpfen muss. citeturn28view0turn28view1

Die emotionale Produktformel lautet deshalb:

**„Ein sofort verständliches Weltraum-Strategie-Puzzle, das sich klar, lebendig und belohnend anfühlt, hochwertig aussieht und dem Spieler das Gefühl gibt, mit wenigen Gesten ganze Sternennetze elegant zu dominieren.“**

Der Positionierungssatz lautet:

**„StarConquest ist ein kurzes, stilisiertes Space-Conquest-Spiel für Web und Mobile, das strategische Klarheit mit befriedigendem Linien- und Übernahme-Feedback verbindet.“**

Das zentrale Spielversprechen lautet:

**„Ziehe kluge Verbindungen, nutze Boost-Schnitte im richtigen Moment und kippe in unter drei Minuten ganze Sternensektoren zu deinen Gunsten.“**

Drei mögliche Taglines sind:

**„Link. Boost. Conquer.“**  
**„Win the map with one smart cut.“**  
**„Fast tactics across a living star network.“**

Das gewünschte Spielgefühl lässt sich am besten so beschreiben: **kurz, lesbar, spannungsreich, visuell befriedigend, nicht hektisch-chaotisch, sondern elegant eskalierend.** citeturn26view1turn26view2turn22search10

## Drei massenkompatible Richtungen

**Richtung eins – Bright Orbital Command**

**Arbeitstitel.** Bright Orbital Command.  
**Kernidee.** Diese Richtung übersetzt den aktuellen Mechanikkern in eine klare, farbenfrohe Space-Infrastruktur-Ästhetik. Systeme sind keine „Planeten“ im astronomischen Sinn, sondern freundliche Orbital-Hubs, Relay-Stationen und Energiekerne. Das Bild ist heller, sauberer und sportlicher als im aktuellen Build. Die Hauptstärke liegt in extremer Lesbarkeit auf Mobile und im Thumbnail. Das Spiel wirkt wie ein hochwertiges, modernes Portalspiel und nicht wie ein Flash-Relikt.  
**Zielgruppe.** Teenager, erwachsene Casual-Spieler, Mobile-Spieler, Perfektionierer.  
**Emotion und Stimmung.** Grundstimmung optimistisch und taktisch; Spielgefühl flink und sauber; Spannungsniveau mittel; Humorgrad niedrig bis leicht; Ernsthaftigkeit moderat; Geschwindigkeit zügig; Belohnungseffekt „sauberer Kontrollgewinn“.  
**Visueller Stil.** Hintergrund mit hellem, tiefen Raumverlauf und weichen Nebelwolken; Systeme als klar umrissene Stations-Orbs mit sichtbarem Kern; Verbindungen als leuchtende Energiebänder mit Pfeilrichtung; neutrale Systeme als graublaue Relay-Nodes; Gegner rot-magenta; Spieler cyan-blau; Spezialsysteme als jeweils eigenständige Stationssilhouetten; Levelauswahl als kompakte Sektorkarte; Missionsscreen auf eine Karte + Zieltext reduziert; Menü mit einem Hero-Map-Screenshot; Buttons groß, pillenförmig, ohne Tech-Zierleisten; Panels als halbtransparente Glaspaneele; Sterne groß und goldwarm; Sieg/Niederlage mit kurzer Kartenüberblendung; Tutorials als einblendende Kurzlabels nahe der Interaktion.  
**Formen und Silhouetten.** Pulsar als kleine runde Funkboje, Giant als Orbitalplattform mit zwei Flügeln, Quasar als Ringstation, Nexus als sechslappiger Kernreaktor. So sind Rollen auch ohne Text erkennbar.  
**Farbpalette.** Hintergrund `#08111F`, Nebel `#132445`, Spieler `#39B8FF`, Gegner `#FF5A78`, Neutral `#B8C5D9`, Energie `#8EEBFF`, Warnung `#FFB347`, Erfolg `#FFD95A`, UI-Flächen `#102136`, Text `#EAF4FF`, Akzent `#7AF1C8`.  
**Typografie.** Freie Sans mit technischer Sauberkeit statt Sci-Fi-Klischee, etwa Inter oder Exo 2; Überschriften semibold in Versalien sparsam; Zahlen groß und geometrisch; Buttontexte kurz und aktiv: „Play“, „Next Sector“, „Retry“.  
**Animation und Game Feel.** Produktion als langsames Anschwellen des Kerns alle 0,6–0,8 s; Energie fließt in 80–110 ms dichten Partikelpulsen; Angriff färbt das letzte Drittel der Verbindung aggressiver ein; Übernahme zeigt 140-ms-Kernkollaps, dann 220-ms-Farbwechsel und 300-ms-Ringexpand; Überlastung pulst am Außenrand in 0,5-s-Intervallen; Boost-Cut erzeugt einen hellen Schnittblitz von 70 ms und einen beschleunigten Frontstoß für 250 ms; knappe Rettung zeigt kurzes Defensivschild-Flicker; Sieg blendet die ganze Karte 180 ms in die Spielerfarbe; Sterne schnappen nacheinander in 120-ms-Abständen ein; neues Level wird mit einem kurzen Sektor-Pan freigelegt.  
**Audio und Musik.** Leichte elektronische Orchstrierung; 95–110 BPM; weiche Synth-Arps, Plucks, subtile Pads; Energiefluss als helle Ticks; Angriff als schmale Whooshes; Übernahme als positiver Tonabstieg mit anschließendem Chime; Boost als scharfer Slice + kurzer aufsteigender Gliss; Sieg als dreistufiger arpeggierter Akkord; Niederlage dumpfer Drop; UI-Klicks trocken und knackig.  
**Ausdrucksweise und Sprachstil.** Knapp, freundlich, souverän. Beispiele: „Start Level“ → „Deploy“; „Mission geschafft“ → „Sector secured“; „Mission verloren“ → „Sector lost“; „Neues System“ → „Relay online“; „Boost bereit“ → „Boost cut ready“; „Zu wenig Energie“ → „Need more charge“; Tutorial Verbinden → „Drag from your hub to link a target“; Tutorial Durchtrennen → „Swipe across your own beam to burst it forward“; Sternziel → „3 Stars under 90s“; Sektor freigeschaltet → „New sector unlocked“.  
**Marketingwirkung.** Thumbnail-Stärke hoch; Screenshot-Stärke hoch; Fünfsekunden-Clip-Stärke hoch; Verständlichkeit sehr hoch; mobile Attraktivität hoch; CrazyGames-Fit sehr hoch; Poki-Fit hoch; internationale Verständlichkeit sehr hoch.  
**Umsetzungsaufwand.** UI niedrig; Assets niedrig bis mittel; Animation mittel; Codeänderungen mittel; Audio mittel; Gesamt mittel.  
**Risiken.** Könnte für Spieler, die düstere Hardcore-Sci-Fi erwarten, etwas „zu sauber“ wirken.  
**Beispielszene.** Ein großer cyanfarbener Ring-Hub lädt sichtbar auf, zwei dünne Energieadern laufen zu neutralen Relays, ein roter Gegner drückt von rechts. Der Spieler wischt einen eigenen Beam nahe am Ursprung durch; der vordere Teil flammt weiß auf, trifft das neutrale Relay sofort, färbt es cyan, und das neue Relay schickt unmittelbar zwei Gegenstrahlen weiter. Auf einen Blick sieht man Kontrolle, Momentum und Cleverness.

**Richtung zwei – Friendly Star Relay**

**Arbeitstitel.** Friendly Star Relay.  
**Kernidee.** Diese Richtung nimmt die Casual-Lesbarkeit von City Takeover und MicroWars ernst, ohne ins Billige zu kippen. Hubs wirken wie kleine lebendige Sternenposten oder Mini-Welten mit Gesichtslosigkeit, aber mit sympathischen, organischen Kernanimationen. Der Raum ist freundlich, die Farben sind satter, das Spiel wirkt einladend statt kühl. Die Mechanik bleibt abstrakt, aber emotional wärmer. Das ist die stärkste Poki-Richtung.  
**Zielgruppe.** Breites Casual-Publikum, Mobile-Spieler, jüngere Teenager, Spieler mit Belohnungsfokus.  
**Emotion und Stimmung.** Warm, clever, motivierend; niedrigere Ernsthaftigkeit; mittlere Geschwindigkeit; hoher visuell-emotionaler Belohnungseffekt.  
**Visueller Stil.** Hintergrund mit größeren Nebelflächen und vereinzelten Sterninseln; Systeme als kleine farbige Hubs mit pulsierendem Innenleben; Verbindungen dicker und „saftiger“; neutrale Systeme hellgrau mit pastelligen Kernen; Gegner klar magenta oder orange; Levelauswahl als Sternkarte mit lockenden Belohnungssternen; Menü fast ohne Text, stärker mit Karte und einem aktiven Spielmoment; Buttons groß und rund; Panels sehr reduziert; Icons weich und klar; Siegesbildschirm mit zentralem Sternregen.  
**Formen und Silhouetten.** Mehr Rundung und weiche Lappenformen; Spezialtypen über klare Außenelemente wie Antennen, Ringe, Flügel oder Doppelkern.  
**Farbpalette.** Hintergrund `#122041`, Spieler `#4FC3FF`, Gegner `#FF668A`, Neutral `#E1E8F0`, Energie `#9BF7FF`, Warnung `#FFB86B`, Erfolg `#FFE269`, UI `#1C2C4A`, Text `#F6FBFF`, Akzent `#83FFC7`.  
**Typografie.** Rundere, freundliche Sans wie Nunito Sans oder Rubik; Überschriften semibold, nicht ultrabold; Zahlen groß, offen und rund.  
**Animation und Game Feel.** Produktion als „Herzschlag“ im Kern; Energiefluss als Ketten kleiner Kugeln; Angriff zeigt leichte Rückstoß-Kippbewegung der Quelle; Übernahme verursacht kurze elastische Vergrößerung des Ziels; Überlastung vibriert weicher; Boost-Cut erscheint als goldener „snap“ mit hellem Streak; knappe Rettung zeigt Mini-Schildblase; Sieg mit drei springenden Sternen und kurzer Map-Glanzwelle; Freischaltung mit Wegpunkt-Licht.  
**Audio und Musik.** Freundliche Synthpop-/toy-elektronik; 105–118 BPM; weiche Mallets, kurze Synth-Stabs, sanfte Pads; UI-Klicks eher weich; Boost mit glänzendem Slice; Sieg hell und aufwärts.  
**Ausdrucksweise und Sprachstil.** Motivierend, freundlich, knapp. Beispiele: „Play“ → „Launch“; „Mission geschafft“ → „Nice work!“; „Mission verloren“ → „Try a smarter route“; „Neues System“ → „Relay captured“; „Boost bereit“ → „Burst ready“; „Zu wenig Energie“ → „Charge up first“.  
**Marketingwirkung.** Thumbnail-Stärke sehr hoch; Screenshot-Stärke sehr hoch; Clip-Stärke hoch; Verständlichkeit sehr hoch; mobile Attraktivität sehr hoch; CrazyGames-Fit hoch; Poki-Fit sehr hoch; internationale Verständlichkeit sehr hoch.  
**Umsetzungsaufwand.** UI niedrig; Assets mittel; Animation mittel; Codeänderungen mittel; Audio mittel; Gesamt mittel.  
**Risiken.** Könnte für einen Teil der Strategiespieler zu casual wirken.  
**Beispielszene.** Ein großer hellblauer Knoten pulsiert wie eine Mini-Sonne, drei neutrale Knoten glimmen blass. Der Spieler zieht zwei Verbindungen, dann schneidet einen Beam. Ein goldener Snap jagt durch den Strahl, der Zielhub ploppt auf und färbt sich sofort freundlich blau. Der Bildschirm fühlt sich sofort „gewonnen“ an, ohne laut zu schreien.

**Richtung drei – Clean Galactic Tactics**

**Arbeitstitel.** Clean Galactic Tactics.  
**Kernidee.** Diese Richtung ist die erwachsenste der drei Massenversionen. Sie setzt auf hohe Klarheit, weniger Sättigung, präzise Linien und eine fast UI-designartige Eleganz. Das Spiel soll wie ein sehr gutes Indie-Strategiespiel aussehen, das zufällig im Browser läuft – nicht wie ein Mobile-F2P-Port. Sie hat die größte Chance, hochwertig zu wirken, ohne viele Assets zu benötigen.  
**Zielgruppe.** Erwachsene Casual-Spieler, Strategieinteressierte, Desktopspieler, „ich mag cleane Interfaces“-Publikum.  
**Emotion und Stimmung.** Kontrolliert, fokussiert, intelligent; Humor niedrig; Geschwindigkeit mittel; Belohnungseffekt eher „präzise gelöst“ als „süß belohnt“.  
**Visueller Stil.** Tiefer Navy-Hintergrund, reduzierte Nebel, dünnere, glattere Beams, klar definierte Stationen mit technischen Ornamenten, minimalistische Panel-Optik, fast keine Deko-Texte; Levelwahl wie ein Operationsscreen.  
**Formen und Silhouetten.** Mehr sechseckige und ringbasierte Geometrie; Nexus als dominanter Mehrfachkern; Giant als Doppelmodul; Pulsar als kompakter Beacon; Quasar als schwerer Ringträger.  
**Farbpalette.** Hintergrund `#060A14`, Spieler `#52A7FF`, Gegner `#FF5D73`, Neutral `#94A4BC`, Energie `#A9E7FF`, Warnung `#FFC36E`, Erfolg `#F0D85C`, UI `#0F1726`, Text `#E6F0FF`, Akzent `#7CCEFF`.  
**Typografie.** Inter, Space Grotesk oder Rajdhani; Überschriften knapp; viel gemischte Groß-/Kleinschreibung statt Dauer-Versalien.  
**Animation und Game Feel.** Weniger Bounce, mehr Präzision: Produktion als rotierende Kernsegmente, Beam-Flow als regelmäßige Impulse, Übernahme als kontrollierter Wechsel mit scharfem Edge-Flash, Boost-Cut als extrem lesbarer diagonaler Lichtstrich und 180-ms-Beschleunigungspuls, Sieg als ruhiger Karten-Resolve.  
**Audio und Musik.** Minimal Tech/Ambient, 90–105 BPM, subtiles Percussion-Ticking, klare UI-Chimes, wenig Melodik.  
**Ausdrucksweise und Sprachstil.** Souverän, sachlich, knapp. „Start level“ → „Begin operation“; „Mission geschafft“ → „Objective complete“; „Mission verloren“ → „Operation failed“; „Boost bereit“ → „Cut burst ready“.  
**Marketingwirkung.** Thumbnail-Stärke mittel bis hoch; Screenshot-Stärke hoch; Clip-Stärke mittel bis hoch; Verständlichkeit hoch; mobile Attraktivität mittel bis hoch; CrazyGames-Fit hoch; Poki-Fit mittel bis hoch; internationale Verständlichkeit hoch.  
**Umsetzungsaufwand.** UI niedrig; Assets niedrig; Animation mittel; Codeänderungen mittel; Audio mittel; Gesamt niedrig bis mittel.  
**Risiken.** Könnte auf Poki etwas zu seriös und zu kühl performen; braucht sehr gute Motion, sonst wirkt es steril.  
**Beispielszene.** Ein blauer Ringträger schiebt präzise Lichtimpulse Richtung rotem Mehrfachkern. Der Spieler setzt einen perfekten Boost-Cut, der Strahl verdichtet sich und kippt den gegnerischen Kern in einer scharfen, sauberen Resolve-Animation. Es fühlt sich eher nach „präziser Schachzug“ als nach „Party-Moment“ an.

## Drei spezielle Richtungen und Vergleich

**Richtung vier – Astroflora Circuit**

**Arbeitstitel.** Astroflora Circuit.  
**Kernidee.** Eine mutigere Richtung, die Eufloria-artige organische Ruhe mit dem vorhandenen Space-Thema verschmilzt, ohne in Tentakel-Biologie zu kippen. Systeme sind semi-organische Sternsamen, Relays wachsen wie kosmische Blüten und Energielinien wirken wie Lichtfasern. Das Spiel bekommt damit eine sofort wiedererkennbare Persönlichkeit. Es spricht eher eine kleinere, aber engagiertere Zielgruppe an, die Atmosphäre und Schönheit schätzt.  
**Zielgruppe.** Ästhetik-affine Indie-Spieler, entspannte Strategen, Desktop-first-Publikum.  
**Emotion und Stimmung.** Geheimnisvoll, weich, organisch, meditativ mit punktuellen Spannungswellen.  
**Visueller Stil.** Dunkler Samtraum, halbtransparente Blütenringe, pollenartige Partikel, organische Kernhäute, Siege als „Aufblühen“, Niederlagen als Verwelken.  
**Formen und Silhouetten.** Samen-, Blüten- und Fraktalformen; sehr eigenständig.  
**Farbpalette.** Hintergrund `#0A0814`, Spieler `#71D7FF`, Gegner `#FF6DA3`, Neutral `#BAC4D8`, Energie `#B8FFF4`, Warnung `#FFCB7A`, Erfolg `#F7E77A`, UI `#151225`, Text `#EFF7FF`, Akzent `#B4FF9A`.  
**Typografie.** Humanistische Sans mit poetischem Touch, etwa Manrope oder Sora.  
**Animation und Game Feel.** Produktion als Ausatmen/Inhalieren; Beams als faserige Lichtstränge; Übernahme mit Blütenöffnung; Boost als scharfer Pollensturm; Sieg als Wellenblüte.  
**Audio und Musik.** Ambient, gläserne Texturen, zurückhaltende Percussion, weiche Chimes.  
**Sprachstil.** Ruhig, elegant, knapp. „Mission geschafft“ → „Sector blooming“.  
**Marketingwirkung.** Thumbnail-Stärke hoch durch Eigenständigkeit; Screenshot-Stärke sehr hoch; Clip-Stärke hoch; mobile Attraktivität mittel; CrazyGames-Fit mittel; Poki-Fit mittel; Video-/Thumbnail-Auffälligkeit potenziell höher als die Massenversionen.  
**Umsetzungsaufwand.** UI mittel; Assets mittel; Animation hoch; Codeänderungen mittel; Audio hoch; Gesamt hoch.  
**Risiken.** Zu kunstvoll für reine Portal-Casuals; Gefahr, dass die organische Anmutung doch wieder an Tentacle Wars erinnert.  
**Wirtschaftliches Risiko.** Höhere Produktionszeit bei potenziell kleinerem Mainstream-Fit.

**Richtung fünf – Retro Vector Armada**

**Arbeitstitel.** Retro Vector Armada.  
**Kernidee.** Eine stilisierte, 70er/80er-Radar- und Vektorraumfahrt-Ästhetik. Systeme sind leuchtende Signaturpunkte, Beams wirken wie Vektorbahnen, UI wie eine farbige, aber elegante taktische Konsole. Diese Richtung ist sofort wiedererkennbar und sehr scopefreundlich. Sie ist stärker CrazyGames-tauglich als Poki-tauglich, weil sie weniger „cute“ und stärker arcade-strategisch wirkt.  
**Zielgruppe.** Ältere Casual-Spieler, Desktop-Nutzer, Retro-Designfans.  
**Emotion und Stimmung.** Präzise, arcadig, cool, leicht nostalgisch.  
**Visueller Stil.** Schwarzer oder tiefblauer Raum, scanline-freier Vektorlook, kräftige Leuchtkonturen, minimalistische Geometrie, starke Kontrastfarben.  
**Formen und Silhouetten.** Dreiecke, Kreise, Hexagone, Radar-Ringe; Fraktionen durch Vektorform statt Text.  
**Farbpalette.** Hintergrund `#04060A`, Spieler `#2FE1FF`, Gegner `#FF5B7E`, Neutral `#8DA5B7`, Energie `#75FFF0`, Warnung `#FFB454`, Erfolg `#FFF064`, UI `#0E1320`, Text `#DFF7FF`, Akzent `#A36BFF`.  
**Typografie.** Rajdhani oder Chakra Petch; stark, kompakt, technisch.  
**Animation und Game Feel.** Scan-Pulse, Vektor-Flare, harte Übergänge, Boost als schneidende Neonlinie, Sieg als kurzer Sensor-Sweep über die Karte.  
**Audio und Musik.** Synthwave-light, kurze Arps, klickige Retro-SFX, kurze Laser-Foleys.  
**Sprachstil.** Futuristisch und knapp. „Begin vector assault.“  
**Marketingwirkung.** Thumbnail-Stärke hoch; Screenshot-Stärke hoch; Clip-Stärke sehr hoch; mobile Attraktivität mittel; CrazyGames-Fit hoch; Poki-Fit mittel.  
**Umsetzungsaufwand.** UI mittel; Assets niedrig; Animation mittel; Codeänderungen mittel; Audio mittel; Gesamt mittel.  
**Risiken.** Zu stylisch-kühl für Broad Casual; Nostalgiecode funktioniert international nicht immer gleich stark.  
**Wirtschaftliches Risiko.** Gute Differenzierung, aber etwas engeres Publikum.

**Richtung sechs – Luxe Neon Command**

**Arbeitstitel.** Luxe Neon Command.  
**Kernidee.** Eine edle Dark-Neon-Richtung, die fast wie ein Premium-Mobile-Taktikspiel aussieht. Sie versucht, aus Minimalmitteln maximale Wertigkeit zu holen: viel kontrolliertes Glow, luxuriöse Kontraste, matte Panels und sehr präzise Motion. Das fällt in Videos stark auf, verlangt aber strenge Disziplin, sonst kippt es ins generische Cyber-UI. Für Poki nur bedingt ideal, für CrazyGames und Trailer-Material potenziell stark.  
**Zielgruppe.** Designaffine Spieler, ältere Teenager, Desktop-first.  
**Emotion und Stimmung.** Edel, fokussiert, mächtig, etwas kühler.  
**Visueller Stil.** Sehr dunkler Hintergrund, intensive Accent-Lights, matte schwarze UI-Panels, goldene Boost-Akzente, klare Edge-Highlights.  
**Formen und Silhouetten.** Reduzierte Premium-Geometrie, scharfe Ringe, hochwertige Eckformen, kaum Deko.  
**Farbpalette.** Hintergrund `#050712`, Spieler `#4AB6FF`, Gegner `#FF5877`, Neutral `#9BA7B8`, Energie `#91F7FF`, Warnung `#FFBF66`, Erfolg `#FFDB59`, UI `#111625`, Text `#F3F7FF`, Akzent `#C18BFF`.  
**Typografie.** Space Grotesk oder Satoshi; fein abgestufte Gewichte; viel whitespace.  
**Animation und Game Feel.** Luxuriöse Ease-outs, scharfe Übernahme-Flashes, Boost als Goldschlitz, Sieg als dunkle Karte mit aufleuchtendem Spielerkorridor.  
**Audio und Musik.** Tiefer elektronischer Puls, kurze hochwertige Chimes, wenig Verspieltheit.  
**Sprachstil.** Elegant-sachlich. „Sector under control.“  
**Marketingwirkung.** Thumbnail-Stärke hoch; Screenshot-Stärke sehr hoch; Clip-Stärke sehr hoch; mobile Attraktivität mittel; CrazyGames-Fit hoch; Poki-Fit mittel.  
**Umsetzungsaufwand.** UI mittel; Assets niedrig; Animation mittel bis hoch; Codeänderungen mittel; Audio mittel; Gesamt mittel.  
**Risiken.** Kann schnell beliebig nach „generic neon mobile strategy“ aussehen, wenn nicht absolut sauber geführt.  
**Wirtschaftliches Risiko.** Gute Wertigkeit, aber schwächerer Friendly-Faktor.

Die Vergleichsbewertung fällt so aus:

| Richtung | Breitenwirkung | Eigenständigkeit | Thumbnail-Wirkung | Mobile-Lesbarkeit | CrazyGames-Fit | Poki-Fit | Solo-Umsetzbarkeit | Langfristiges Potenzial | Risiko |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Bright Orbital Command | 9 | 7 | 8 | 9 | 9 | 8 | 8 | 8 | 4 |
| Friendly Star Relay | 9 | 6 | 9 | 9 | 8 | 9 | 8 | 7 | 5 |
| Clean Galactic Tactics | 7 | 7 | 7 | 8 | 8 | 6 | 9 | 8 | 5 |
| Astroflora Circuit | 5 | 9 | 8 | 6 | 6 | 5 | 5 | 8 | 7 |
| Retro Vector Armada | 6 | 8 | 8 | 7 | 8 | 5 | 8 | 7 | 6 |
| Luxe Neon Command | 6 | 7 | 9 | 6 | 8 | 5 | 7 | 7 | 6 |

Die Rangliste für **breite Marktchancen** lautet:

1. **Bright Orbital Command**  
2. **Friendly Star Relay**  
3. **Clean Galactic Tactics**

Die Rangliste für **Eigenständigkeit und Auffälligkeit** lautet:

1. **Astroflora Circuit**  
2. **Retro Vector Armada**  
3. **Luxe Neon Command**

Meine klare Gesamtempfehlung ist ein **kontrollierter Hybrid** aus **Bright Orbital Command** und **Friendly Star Relay**. Übernommen werden sollten aus Bright Orbital Command die klare Space-Infrastruktur-Lesbarkeit, die technische Silhouettenlogik, der saubere UI-Aufbau und die starke taktische Lesbarkeit. Aus Friendly Star Relay sollten die wärmere Farbstimmung, die weicheren Kerne, die emotionaleren Sieg-/Boost-Momente und die größere Casual-Einladung übernommen werden. Nicht kombiniert werden sollten ein zu weiches „cute“-Verhalten der Formen mit einem zu ernsten Taktik-HUD, und auch kein dunkler Premium-Neon-Look mit verspielter Texttonalität. Der Hybrid bleibt konsistent, wenn die **Formen klar-technisch** bleiben, aber **Farbwelt, Motion und Sprache freundlicher** werden. citeturn26view1turn26view2turn17view8turn17view5

## Konkretes visuelles Optimalrezept

Die empfohlene fertige Richtung nenne ich **Star Relay Command**: ein heller, klarer, freundlicher Space-Tactics-Look mit hochwertigen Energieflüssen und reduzierter Portal-UI.

**Visuelle Designprinzipien.** Erstens: Jede Systemart muss an Silhouette und Idle-Motion erkennbar sein, nicht erst an Text. Zweitens: Besitzverhältnisse müssen auf einen Blick über Farbe **und** Kernstil lesbar sein. Drittens: Beams sind der Star des Spiels; Effekte dürfen sie unterstützen, nicht verdecken. Viertens: Im Gameplay nie mehr als zwei dominante Akzentfarbfamilien gleichzeitig. Fünftens: Jede wichtige Aktion braucht innerhalb von 200 Millisekunden ein sichtbares Feedback. Sechstens: Tutorial-Hinweise nur kontextnah und wegwischbar, nie als Wandtext vor Spielbeginn. Siebtens: Alle UI-Entscheidungen müssen auf `800x450` und `devicePixelRatio:1` lesbar sein. Achtens: Ein Screenshot muss ohne Text erklären können: Blau kontrolliert, Rot bedroht, Gold ist Boost oder Sieg. citeturn17view2turn17view3turn17view8

**Verbindliche Farbpalette.** Hintergrund `#08111F`; sekundärer Raumnebel `#132445`; Spieler primär `#39B8FF`; Spieler-Glow `rgba(57,184,255,0.24)`; Gegner primär `#FF5A78`; Gegner-Glow `rgba(255,90,120,0.24)`; Neutral `#B8C5D9`; Neutral-Glow `rgba(184,197,217,0.10)`; Energiefluss `#9BF7FF`; Boost-Schnitt `#FFD95A`; Warnung `#FFB347`; Erfolg `#FFE269`; UI-Panels `rgba(16,33,54,0.82)`; Haupttext `#EAF4FF`; Sekundärtext `#9FB3C9`. Verwendung: nur Spieler, Gegner und Boost dürfen voll gesättigt sein; Neutral darf niemals stärker leuchten als Spieler oder Gegner.

**Systemkatalog.** Pulsar: klein, runde Funkboje mit zwei winzigen Orbitpunkten; blauer oder roter Kern; dünner Rand; Energieanzeige als innerer Halbmond; Idle leichte Drehung; Angriff lässt Orbitpunkte beschleunigen; Übernahme mit kurzem Aufblitzen; Gefahr blinkt Rand in 2 Hz; maximale Energie zeigt engen Koronaring. Giant: mittlerer Hub mit Zweiflügel-Silhouette; dickerer Rand; Energie als umlaufender Ring. Quasar: großer Ringträger mit starkem Orbit; Kern wirkt schwer und langsam; bei Angriff leuchtet der Ring im vorderen Quadranten auf. Nexus: größter Mehrfachkern mit sechs Segmenten; Energieanzeige in Segmentfüllung; Gefahr mit pulsierendem Schildhex; Maximalzustand mit kontrolliertem Mehrfachglow statt Explosion. Alle Systemnamen verschwinden aus der Scheibenmitte und werden nur noch im Tooltip oder bei erstem Encounter erklärt. Die Mitte gehört der Zahl. citeturn9view0turn31view2

**Verbindungsdarstellung.** Grunddicke 4 px auf Desktop, 5 px auf Mobile. Farbe immer besitzgebunden, mit hellerem Innenkern für Flussrichtung. Partikelabstand 14–18 px; Flussgeschwindigkeit 90 px/s Basis plus Produktionsdruck. Angriffszustand färbt das letzte Drittel zum Ziel um 20 % aggressiver und fügt kleine Impact-Funken am Endpunkt hinzu. Verteidigungszustand nutzt ruhigere, gleichmäßigere Impulse. Unterbrochene Verbindung zeigt keinen bloßen Abbruch, sondern 70-ms-Schnittblitz plus 180-ms-Auslaufen des hinteren Reststroms. Boost-Cut verdichtet den vorderen Teil auf 140 % Helligkeit und 125 % Geschwindigkeit für 250 ms. Mehrere parallele Verbindungen werden leicht seitlich versetzt gebogen, damit keine unlesbaren Überlagerungen entstehen. citeturn10view0

**UI-System.** Oben nur eine schmale Leiste mit Sektor, Sternziel, Zeit und zwei Buttons: Pause und Restart. Die missverständliche globale „Energie“-Anzeige entfällt. Das aktuelle Missionsziel wird als kurzer Banner für drei Sekunden bei Levelstart eingeblendet und danach hinter einem kleinen Info-Button verfügbar gehalten. Der Transfer-Selector wird ersetzt: statt 25/50/100 gibt es einen eindeutigen Schalter „Flow: Low / Mid / High“ oder er entfällt ganz, wenn er mechanisch nicht essenziell ist. Levelauswahl als horizontale Sternroute mit großem Karten-Hook pro Sektor. Buttons mindestens 44 px hoch, Touchzonen 48 px. In Landscape sitzt die Primär-UI oben; in Portrait werden Buttons rechts angedockt und das Spielfeld vertikal stärker gepolstert. Safe Areas auf allen vier Seiten beachten. citeturn5view0turn29view1turn29view3turn17view2turn17view6

**Effektbudget.** Unverzichtbar sind: Capture-Ring, Boost-Schnitt, Endpunkt-Impact, Gefahrencorona, Siegsglanz, Drag-Preview, klare Target-Markierung. Vermeiden sollte man: permanente Vollbild-Partikel, große Kameraschüttler, Bloom-Overkill, überlagerte Screen-FX bei jeder kleinen Verstärkung. Das Spiel lebt von Klarheit. Premium entsteht hier durch Priorität, nicht durch Effektmenge. citeturn8view3turn8view8turn10view0

**Animations-Timings.** Drag-Target-Highlight 80 ms Fade-in. Beam-Growth 180–400 ms je nach Distanz. Produktionspuls 650 ms Zyklus. Capture-Wechsel 140 ms Collapse + 220 ms Recolor + 300 ms Expand. Boost-Slice 70 ms Flash + 250 ms Burst. Gefahrencorona 500 ms Puls. Sieg 180 ms Karten-Glow + 3 Sterne in 120-ms-Abständen. Level-Freischaltung 350 ms Kartenweg-Aufleuchten.

**Mikrotexte auf Englisch.** Start: “Play”. Retry: “Retry”. Next: “Next Sector”. Sector secured: “Sector secured”. Sector lost: “Sector lost”. New relay: “Relay captured”. Need more charge: “Need more charge”. Drag from your hub to connect: “Drag from your hub to connect.” Cut your own beam to burst energy forward: “Swipe across your own beam to burst it forward.” Three stars under 90s: “3 Stars under 90s.” New sector unlocked: “New sector unlocked.” Optional deutsche Entsprechungen können gepflegt werden, aber Englisch muss Primärsprache sein. citeturn17view2turn17view6

**Soundliste nach Priorität.** Erstens Boost-Cut. Zweitens Capture. Drittens Beam start. Viertens UI click. Fünftens invalid action / not enough charge. Sechstens win sting. Siebtens lose sting. Achtens level start whoosh. Neuntens star award tick. Zehntens ambiences / music loop. Die aktuelle WebAudio-SFX-Basis ist brauchbar, sollte aber tonal zusammengeführt und um Musik ergänzt werden. citeturn7view2turn7view3

**Screenshot- und Thumbnail-Rezept.** Für den Screenshot sollte eine Mid-Battle-Szene mit fünf bis sieben sichtbaren Systemen gezeigt werden: ein großer Spieler-Nexus links unten, ein roter Quasar rechts, zwei neutrale Knoten in der Mitte, ein gerade ausgelöster goldener Boost-Cut entlang eines cyanfarbenen Beams. Dominant sind Spielerblau, Gegnermagenta und Boost-Gold. Der Blick muss zuerst auf den goldenen Schnittblitz fallen, dann auf das gerade kippende Zielsystem. UI nur minimal sichtbar: Zeit und ein Sternziel, sonst nichts. Das Portal-Thumbnail sollte **kein Wort und keinen Logo-Text** enthalten, sondern drei große Hubs, einen klaren Beam und genau einen hochlesbaren Konfliktmoment – also „vorhersehbare Übernahme in Aktion“. Pokis Thumbnail-Guide empfiehlt textfreie, simple, gameplaynahe Thumbnails; genau daran sollte sich der Aufbau orientieren. citeturn17view8turn16search2

## Umsetzungsroadmap und Abschlussentscheidung

Der größte Vorteil des aktuellen Projekts ist, dass es technisch klein geblieben ist. Die Kehrseite ist, dass praktisch jede sichtbare Änderung im Moment dieselbe Datei trifft. Für die aktuelle Repository-Struktur betreffen fast alle Maßnahmen `index.html`: der CSS-Block im Head, die Overlay-HTML-Struktur, die SFX-Funktionen, `StarSystem.draw()`, `EnergyBeam.draw()`, `Input.draw()`, `Game.loadLevel()` und die UI-Methoden. citeturn5view0turn9view0turn10view0turn11view0turn12view0

**Sofortmaßnahmen**

| Aufgabe | Art | Wirkung | Aufwand | Technisches Risiko | Priorität | Betroffene Bereiche |
|---|---|---:|---:|---:|---|---|
| Sprachumstellung auf Englisch als Standard, Deutsch optional | neue Texte | sehr hoch | niedrig | niedrig | P0 | Overlay-Texte, HUD-Strings, Tooltips, Sieg/Niederlage citeturn1view1turn17view2 |
| Startflow kürzen: Main Menu + Intro zusammenlegen oder direkt ins erste Level | neue UX | sehr hoch | mittel | niedrig | P0 | HTML-Overlays, `UI.showMainMenu`, `UI.showIntro`, `UI.startLevel` citeturn5view0turn17view3turn17view7 |
| HUD korrigieren: „Energy“ entfernen oder als echtes System-/Globalziel neu definieren | neue UX / neue Texte | sehr hoch | niedrig | niedrig | P0 | `#topHud`, `Game.loadLevel`, Intro-Stats citeturn29view1turn30view0 |
| 25/50/100-Buttons umbenennen oder entfernen | reine CSS + neue Texte + UX | hoch | niedrig | niedrig | P0 | `#transferSelector`, `UI.init`, `G.FLOW_RATE` citeturn29view3 |
| Klassennamen aus den Node-Zentren entfernen | Canvas-Rendering | hoch | niedrig | niedrig | P1 | `StarSystem.draw()` citeturn9view0 |
| Drag-Range-Kreis entfernen oder als echte Kosten-/Reach-Vorschau ersetzen | Canvas-Rendering / UX | hoch | niedrig | niedrig | P1 | `Input.draw()`, `beamCost()`-Visualisierung citeturn29view2turn31view0 |
| Tooltip- und HUD-Fonts vergrößern | reine CSS + Canvas-Textgrößen | hoch | niedrig | niedrig | P0 | CSS, `Input.draw`, `StarSystem.draw` citeturn5view0turn17view2 |
| Stärkeren Boost-Flash und Ziel-Impact hinzufügen | neue Animationen | hoch | niedrig bis mittel | niedrig | P1 | `EnergyBeam.sever`, `Particles`, `EnergyBeam.draw` citeturn8view8turn10view0 |

**Kleines Redesign**

| Aufgabe | Art | Wirkung | Aufwand | Technisches Risiko | Priorität | Betroffene Bereiche |
|---|---|---:|---:|---:|---|---|
| Systemsilhouetten pro Klasse neu definieren | Canvas-Rendering | sehr hoch | mittel | mittel | P0 | `StarSystem.draw`, `CLASSES`-Präsentation citeturn7view3turn9view0 |
| Helleres, wärmeres Space-Color-Script | Canvas-Rendering / CSS | hoch | mittel | niedrig | P0 | `buildBG`, Farbkonstanten `G` citeturn8view1turn29view3 |
| UI komplett auf Portal-Lesbarkeit trimmen | reine CSS + UX | sehr hoch | mittel | niedrig | P0 | CSS, Overlay-HTML, Buttonkomponenten citeturn17view2turn17view6 |
| Level-Select als visuelle Sternroute statt Raster | neue UX | mittel bis hoch | mittel | mittel | P1 | `#levelGrid`, `UI.showLevelSelect` citeturn5view0turn12view0 |
| Sternziele im Gameplay sichtbar machen | neue UX | hoch | niedrig | niedrig | P1 | HUD, `Game.update` citeturn7view0turn12view0 |
| Audio-Loop und thematische Soundbank ergänzen | Audio | mittel bis hoch | mittel | niedrig | P1 | SFX-System, optional WebAudio-Music oder kleine Loops citeturn7view2turn7view3 |
| Plattform-SDK vorbereiten | Plattformintegration | hoch | mittel | mittel | P1 | Head-Scripts, Init, gameplayStart/Stop, loading finished citeturn17view4turn15search0 |

**Vollständiger visueller Release-Pass**

| Aufgabe | Art | Wirkung | Aufwand | Technisches Risiko | Priorität | Betroffene Bereiche |
|---|---|---:|---:|---:|---|---|
| Monolith in kleine Module aufteilen | neue Logik / Tech | mittel | mittel bis hoch | mittel | P2 | `index.html` in UI/Render/Input/SFX splitten |
| Konsistente Soundwelt mit Musik, SFX-Mix, Mute-Option | Audio | hoch | mittel | niedrig | P1 | Audio-System, Settings |
| Vollständige Thumbnail-/Screenshot-/Trailer-Asset-Pipeline | neue Assets | sehr hoch | mittel | niedrig | P0 | Marketing-Material, Capturing-Setup citeturn17view8turn16search2 |
| Lokalisierungsstruktur Englisch zuerst, Deutsch optional | neue Logik | mittel | mittel | niedrig | P1 | String-Tabellen, locale-Fallbacks citeturn17view2 |
| CrazyGames-/Poki-spezifischer Review-Pass | Plattformintegration | sehr hoch | mittel | mittel | P0 | SDK, loading, gameplayStart, sizes, mobile QA citeturn17view0turn17view3turn17view7 |
| Finaler Art-Pass für Systemeffekte, Win/Lose, Freischaltung | neue Animationen | hoch | mittel | niedrig | P1 | Render- und UI-Layer |

Was **nicht kaputtoptimiert** werden sollte, lässt sich ebenfalls klar sagen:

| Beibehalten | Warum |
|---|---|
| Kernmechanik aus Produktion, Verbindung, Übernahme | Das ist der funktionierende Herzschlag des Spiels. citeturn10view0turn12view0 |
| Boost-Cut | Das ist der interessanteste, marktfähigste Differenzator. citeturn6view6turn8view8 |
| Kurze Levelstruktur mit Sternzielen | Ideal für Portal-Sessions und Replays. citeturn7view0turn6view7turn28view0 |
| Geringe technische Buildgröße | Ein echter Vorteil gegenüber schwereren Webgames. citeturn4view0turn17view1 |
| Prozeduraler Renderansatz | Scopefreundlich und gut iterierbar. citeturn8view1turn9view0turn10view0 |
| Einfache Eingabe per Drag und Swipe | Portal- und mobilefreundlich. citeturn11view0turn26view2turn26view1 |
| Systemtypen | Gute Basis für visuelle Aufladung ohne Mechanikwechsel. citeturn7view3turn9view0 |
| Drei-Fraktionen-Chaos in späten Levels | Schafft Varianz, ohne Scope zu sprengen. citeturn29view0 |

Die abschließenden Entscheidungen sind eindeutig:

1. **Wie stark muss StarConquest optisch verändert werden?** Deutlich. Nicht mechanisch, aber stark in UI, Formensprache, Farbdramaturgie, Feedback und Markenwirkung. citeturn5view0turn17view2  
2. **Reicht ein Polishing-Pass oder braucht es ein echtes Redesign?** Ein echtes Präsentations-Redesign mit konstantem Core.  
3. **Welche der drei massenkompatiblen Richtungen ist die beste?** Bright Orbital Command.  
4. **Welche spezielle Richtung ist die stärkste Alternative?** Astroflora Circuit.  
5. **Welche Richtung besitzt die höchste Chance auf CrazyGames?** Bright Orbital Command, dicht gefolgt von Clean Galactic Tactics. citeturn17view0turn17view2  
6. **Welche Richtung besitzt die höchste Chance auf Poki?** Friendly Star Relay, oder der empfohlene Hybrid mit Bright Orbital Command. citeturn17view6turn17view7turn17view8  
7. **Welche Richtung ist für einen Solo-Entwickler wirtschaftlich am sinnvollsten?** Der Hybrid aus Bright Orbital Command und Friendly Star Relay.  
8. **Welche Richtung sieht am hochwertigsten aus, ohne den Scope stark zu erhöhen?** Clean Galactic Tactics oder der empfohlene Hybrid.  
9. **Welche drei visuellen Änderungen würden den größten Unterschied machen?** Neue Systemsilhouetten pro Klasse; deutlich klarere/hellere Beam- und Boost-Inszenierung; radikal vereinfachter und lesbarer Startflow mit internationaler UI.  
10. **Welche drei Änderungen wären Zeitverschwendung?** Lore-Ausbau; 3D-Planeten oder aufwendige Illustrationen; Meta-Features wie Upgrades, Flotten oder Storymap.  
11. **Sollte der Name „StarConquest“ behalten werden?** Nur wenn der Scope klein bleibt. Für einen echten Relaunch würde ich umbenennen.  
12. **Fünf bessere Namen.** Nova Relay; Orbit Command; Starline Tactics; Relay Dominion; Constellation Rush.  
13. **Ein-Satz-Beschreibung.** “A fast, readable space tactics puzzle where you link star hubs, trigger burst cuts, and flip entire sectors in minutes.”  
14. **Wie sollte ein 20-sekündiger Trailer aufgebaut sein?** Sekunde 0–3: sofort Gameplay, kein Logo zuerst, ein klarer blau-vs-rot Konflikt. Sekunde 3–7: zwei schnelle Verbindungen, sichtbare Zahlen kippen. Sekunde 7–11: Boost-Cut in Nahaufnahme mit goldenem Burst und sofortiger Übernahme. Sekunde 11–15: knapper Gegenangriff, Rettung im letzten Moment. Sekunde 15–18: Sieg, drei Sterne, nächster Sektor springt auf. Sekunde 18–20: Titel + Tagline + ein starker Clip-Loop-Endframe. Poki empfiehlt für animierte Thumbnails zwei bis drei kurze Gameplay-Szenen mit minimalem Text; dieses Prinzip passt auch hier. citeturn16search2  
15. **Ist das Projekt nach der empfohlenen Überarbeitung realistisch stark genug für eine Einreichung bei CrazyGames oder Poki?** Ja, **für CrazyGames realistisch eindeutig**; für Poki **realistisch möglich**, wenn Onboarding, mobile Lesbarkeit, Friendly-Faktor und Thumbnail-Qualität konsequent umgesetzt werden. citeturn17view0turn17view2turn17view7turn16search8  

Das klare Urteil lautet:

**Designrichtung:** Bright-Orbital/Friendly-Star-Hybrid  
**Zielplattform:** CrazyGames zuerst, Poki-ready im zweiten Schritt  
**Zielgruppe:** Teenager und erwachsene Casual-Strategie-Spieler mit Hang zu kurzen, klugen Sessions  
**Stimmung:** freundlich, klar, elegant, belohnend  
**Visueller Hook:** leuchtende Star-Relays und ein goldener Boost-Cut, der die Karte sichtbar kippt  
**Wichtigste Änderung:** radikale Neuordnung von UI, Formen und Feedback bei unverändertem Core  
**Maximal sinnvoller Aufwand:** ein konzentrierter zwei- bis vierwöchiger visueller Release-Pass für einen Solo-Entwickler  
**Größtes Risiko:** zu wenig Eigenständigkeit nach außen trotz guter Mechanik  
**Konkreter nächster Arbeitsschritt:** zuerst das HUD entwirren, den Startflow verkürzen und drei neue System-Silhouetten direkt im Canvas-Prototypen testen, bevor irgendein Marketing-Material gebaut wird.