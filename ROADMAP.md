# StarConquest – Produktions-Roadmap für CrazyGames

Stand: 29. Juli 2026

## Kurzstatus

Letzte Aktualisierung: 29. Juli 2026, nach der vollständigen
Planetensystem-Familie, den finalen Fraktions-Transportschiffen und den ersten
fünf Kampagnenmissionen.

| Bereich | Status | Aktueller Stand |
|---|---|---|
| Vision und Art Direction | Weitgehend abgeschlossen | Polished Casual, helle Farbwelt und Styleframe 03 sind festgelegt; finaler Name und Logo fehlen |
| Gameplay Art Pass | In Arbeit | Hintergrund, Routen, finale Fraktions-Transportschiffe und vollständige System-Größenfamilie sind integriert |
| HUD und Mobile-Grundlage | In Arbeit | Modulares HUD, 48-Pixel-Touchziele, Safe Areas, Querformat und Fullscreen-Grundlage vorhanden |
| Onboarding und Progression | Begonnen | Dynamisches Missions-HUD, Ingame-Hinweise, Ergebnisdialog und Next Sector vorhanden; Levelauswahl und gespeicherter Kampagnenfortschritt fehlen |
| Kampagne und Balance | In Arbeit | Fünf spielbare Missionen mit Simulationsprüfung; drei weitere Missionen und menschliche Balance-Testläufe fehlen |
| Audio | Grundlage vorhanden | Kern-SFX und Audio-Schalter vorhanden; Musik, Mischung und vollständiger Event-Satz fehlen |
| Release-Technik | Begonnen | Tests, Build, GitHub Pages und PlatformAdapter vorhanden; Preloader, E2E und Performanceprofil fehlen |
| CrazyGames und Submission | Offen | SDK-Integration, Portal-QA, Cover, Videos und Metadaten fehlen |

Fortschrittsschätzung:

- Hochwertiger spielbarer Vertical Slice: ungefähr **55 %**.
- Vollständiger CrazyGames-Release gemäß dieser Roadmap: ungefähr **35 %**.

Die zweite Zahl ist bewusst niedriger, weil Kampagne, Progression, SDK,
Marketing und Geräte-QA einen großen Teil der Releasearbeit ausmachen.

## 1. Ziel

StarConquest wird ein hochwertiges, schnelles 2D-Strategiespiel für Browser und
Mobile:

> Verbinde Sternensysteme, transportiere Energie mit kleinen Flotten und drehe
> Kämpfe durch präzise Schnitte und Boosts.

Primäres Release-Ziel ist CrazyGames. GitHub Pages bleibt während der
Entwicklung die frei zugängliche Testversion.

## 2. Verbindliche Produktentscheidung

### Stil

- Polished Casual Strategy statt sichtbarer Pixel-Art.
- Heller, freundlicher Weltraum mit Cyan-, Blau-, Violett- und Koralltönen.
- Glatte, klar erkennbare 2D-Formen und sparsame plastische Beleuchtung.
- Kleine stilisierte Raumschiffe fliegen entlang dünner Energierouten.
- Die Schiffs-Assets aus `galalaxy` dienen als technische und gestalterische
  Referenz, werden aber nicht unverändert zum finalen Stil.
- Styleframe 03 aus `assets/art-direction` bleibt die strukturelle Referenz.

### Spielgefühl

- Eine Aktion muss sofort sichtbar und hörbar beantwortet werden.
- Spielzustände müssen auch auf 800 × 450 Pixeln ohne Erklärung lesbar sein.
- Kurze Missionen, schneller Neustart und direkter Übergang zum nächsten Level.
- Das Boost-Cut-Manöver bleibt der wichtigste eigene Gameplay-Hook.

### Zielgruppe

- Gelegenheitsspieler mit Interesse an Strategie und Puzzle.
- Jugendliche und Erwachsene; Inhalt bleibt PEGI-12-kompatibel.
- Desktop, Tablet und Smartphone im Querformat.

### Bewusste Nicht-Ziele

- Kein 4X-Spiel, kein Flotten-Mikromanagement und keine lange Kampagne.
- Kein Multiplayer für Version 1.0.
- Keine komplexen Skilltrees, Währungen oder In-App-Käufe für den Erstlaunch.
- Keine sichtbare Mischung aus Pixel-Art und glattem Casual-Stil.
- Keine Werbung außerhalb des CrazyGames-SDK.

## 3. Aktueller Stand

Die technische Basis ist vorhanden:

- modularer Vite-/TypeScript-Aufbau;
- Canvas-2D-Rendering mit skalierbarer 800×450-Welt;
- modular getrenntes HUD für Topbar, Steuerung, Status und Ergebnisfenster;
- Energieproduktion, Links, Transfer, Eroberung und einfache Gegner-KI;
- Boost, Cut, Sieg und Niederlage;
- heller Runtime-Hintergrund im festgelegten Polished-Casual-Stil;
- dünne Energierouten mit je einem finalen Transportschiff für Spieler und Gegner;
- neun freigestellte Planetensystem-Assets in drei Größen für Spieler, Gegner
  und neutrale Systeme;
- hybrides System-Rendering mit dynamischen Zustandsringen und Canvas-Fallback;
- Maus-, Pointer- und Touch-Eingabe;
- Querformat-Hinweis, Safe-Area-Grundlage und Fullscreen-Schalter;
- mindestens 48 CSS-Pixel große HUD-Touchziele im Mobile-Layout;
- englische und deutsche Texte;
- lokale Fortschrittsspeicherung;
- fünf spielbare, aufeinander aufbauende Level;
- automatisierte Simulations- und Legacy-Tests;
- funktionierender GitHub-Pages-Build.

Noch nicht releasefähig sind vor allem:

- endgültige Unterscheidung von Quasar und Nexus über ein viertes Artwork-Tier;
- vollständiges Kampf-/Capture-Game-Feel;
- Kampagne, Levelauswahl und Progression;
- Onboarding und UX-Feinschliff;
- Musik und vollständiges Audio;
- CrazyGames-SDK und Cloud-Fortschritt;
- Marketingmaterial, Portal-Metadaten und umfassende Geräte-QA.

Der sichtbare Vertical Slice liegt inzwischen ungefähr bei 45 %. Bezogen auf
den vollständigen CrazyGames-Release sind ungefähr 25–30 % erreicht. Das
Fundament und die visuelle Richtung sind belastbar, der größte offene Block
bleibt die eigentliche Produktbreite aus Kampagne, Progression und Release-QA.

## 3.1 Asset-Produktion

### Planetensysteme

Kontroll-Batch abgeschlossen:

- [x] Spieler-System, mittlere Größe;
- [x] Gegner-System, mittlere Größe;
- [x] neutrales System, mittlere Größe;
- [x] Alpha-Freistellung und reproduzierbare Prompts dokumentiert;
- [x] hybride Canvas-Integration mit dynamischer Energieanzeige;
- [x] Desktop- und Mobile-Browserprüfung.

Nächster Planetensystem-Batch:

- [x] Spieler-System, klein und groß;
- [x] Gegner-System, klein und groß;
- [x] neutrales System, klein und groß;
- [x] Größenhierarchie bei 800×450 prüfen;
- [ ] Capture-Wechsel zwischen allen Fraktionen prüfen.

Danach:

- [x] ein finales blaues und ein finales rotes Transportschiff;
- [ ] weitere Schiffsklassen nur nach Einführung echter Rollenmechaniken;
- [ ] Orbit- und Stationsmodule nur nach Bestätigung ihrer Gameplay-Funktionen;
- [ ] besondere Kartenobjekte;
- [ ] zwei weitere Sektor-Hintergründe;
- [ ] Marketing-Key-Art erst nach finaler Namensentscheidung.

## 4. Release-Maßstäbe

StarConquest wird erst eingereicht, wenn alle folgenden Punkte erfüllt sind:

### Spielerlebnis

- Der erste spielerische Zug ist nach höchstens einem Klick erreichbar.
- Das erste Level erklärt Verbinden, Angreifen und Schneiden im laufenden Spiel.
- Die Grundregel ist ohne längeren Text verständlich.
- Jede Mission hat ein klares Ziel und einen klaren Abschluss.
- Acht polierte Missionen ergeben mindestens 10–20 Minuten Erstspielzeit.
- Neustart und nächstes Level benötigen jeweils nur eine eindeutige Aktion.

### Darstellung und Mobile

- Lesbar bei 800×450, 821×462, 907×510, 1080×607 und üblichen
  Fullscreen-Größen.
- Mindestens 48 CSS-Pixel große Touch-Ziele.
- Sichere Darstellung bei Notch, abgerundeten Ecken und Browserleisten.
- Stabiler Querformatbetrieb; der Portal-Orientierungsdialog wird berücksichtigt.
- Keine versehentliche Textauswahl, Zoomgeste oder Kontextmenüs im Spielfeld.
- Teamzugehörigkeit ist nicht ausschließlich von Farbe abhängig.

### Technik

- Ziel: unter 20 MB Initialdownload; harte CrazyGames-Grenze: 50 MB.
- Ziel: weniger als 150 Dateien im Produktions-Build; harte Grenze: 1500.
- 60 FPS auf einem durchschnittlichen Smartphone, keine dauerhaften
  Frame-Spitzen über 25 ms.
- Simulation bleibt bei 60, 120, 144 und 165 Hz konsistent.
- Kein ungefangener Fehler und kein blockierter Spielfortschritt.
- Alle Fonts, Sounds und Runtime-Grafiken sind lokal gebündelt.
- Sichere Fallbacks, wenn Storage oder Portal-SDK nicht verfügbar sind.

### CrazyGames-Kennzahlen für den Basic Launch

- Initiales Laden möglichst unter 10 Sekunden.
- Conversion zu mindestens einer Minute Spielzeit: Ziel 80 % oder höher.
- Durchschnittliche Sitzungsdauer: Ziel 10 Minuten oder höher.
- Day-1-Retention: Zielbereich 10–15 %.

Diese Werte sind Zielgrößen aus dem offiziellen Basic-Launch-Leitfaden und
keine garantierten Aufnahmegrenzen.

## 5. Produktionsphasen

### Phase 0 – Vision und Art Direction festschreiben

Status: weitgehend abgeschlossen

Aufgaben:

- Polished-Casual-Stil verbindlich festlegen.
- Farbpalette, Kontrastregeln und Größenhierarchie dokumentieren.
- Styleframe 03 als Hauptreferenz festlegen.
- Route-plus-Schiffe als endgültige Transportsprache bestätigen.
- Einen finalen Ein-Satz-Pitch und ein klares Alleinstellungsmerkmal verwenden.

Abnahmekriterium:

- Neue Features und Grafiken lassen sich eindeutig gegen eine gemeinsame
  Stilreferenz prüfen.

Aufwand: 1–2 Arbeitstage inklusive letzter Detailentscheidungen.

### Phase 1 – Gameplay Art Pass und Game Feel

Priorität: höchste

Status: in Arbeit, ungefähr 75 % des Phasenumfangs

Bereits umgesetzt:

- heller, freundlicher Runtime-Hintergrund;
- vereinfachte Routen und finale Fraktions-Transportschiffe;
- überarbeitete Boost-, Cut- und Capture-Darstellung;
- modulares Polished-Casual-HUD;
- mittlerer System-Kontroll-Batch für Spieler, Gegner und Neutral;
- kleine und große Systemvarianten für alle drei Fraktionen;
- ein finales blaues und ein finales rotes Transportschiff;
- Browserprüfung auf Desktop und Mobile-Landscape.

Noch offen:

- optionales viertes System-Artwork-Tier zur getrennten Quasar-/Nexus-Silhouette;
- vollständiger Treffer-, Gefahr-, Sieg- und Niederlage-Pass;
- Effektbudget und Performanceprüfung auf echten Mobilgeräten.

Aufgaben:

- Hintergrund deutlich heller und freundlicher gestalten.
- Pulsar, Giant, Quasar und Nexus mit eigener Silhouette neu zeichnen.
- Besitzerfarben, neutrale Zustände, Fokus und Energie klar trennen.
- Energielinks zu dünnen, gut lesbaren Routen umbauen.
- Kleine Transportschiffe mit Richtung, Abstand und Triebwerkseffekt ergänzen.
- Maximal 3–5 sichtbare Schiffe pro Link; große Mengen werden visuell
  zusammengefasst.
- Boost durch Geschwindigkeit, Goldimpuls und dichte Formation zeigen.
- Cut, Capture, Treffer, Gefahr, Sieg und Niederlage neu inszenieren.
- Effektbudget für Mobile festlegen und unnötiges Bloom reduzieren.

Abnahmekriterien:

- Ein Standbild zeigt eindeutig Quelle, Ziel, Besitzer und Flussrichtung.
- Alle vier Systemtypen sind ohne Text unterscheidbar.
- Boost-Cut ist im Standbild und in Bewegung der stärkste Moment.
- Bei mehreren gleichzeitigen Links bleibt die Ansicht auf Mobile ruhig.

Aufwand: 6–9 Arbeitstage.

### Phase 2 – Mobile-, Eingabe- und Accessibility-Pass

Status: Grundlage vorhanden, echte Geräte-QA noch offen

Aufgaben:

- Touch-Hitboxen, Drag-Toleranz und Cut-Gesten auf echten Geräten abstimmen.
- Pointer-Abbruch, Fokusverlust und App-Wechsel sauber behandeln.
- Safe Areas oben, unten und seitlich vollständig berücksichtigen.
- Fullscreen-Schalter auf unterstützten Browsern testen und sauber verstecken,
  wenn Fullscreen nicht verfügbar ist.
- Browser-Zoom, Doppeltipp, Textauswahl und Long-Press-Kontextmenüs verhindern.
- Portrait-Hinweis für GitHub Pages erhalten; auf CrazyGames die konfigurierte
  Querformatunterstützung respektieren.
- Farbsehschwächen durch Formen, Ränder und Bewegungsrichtung abfangen.
- Option für reduzierte Bewegung und getrennte Musik-/SFX-Schalter vorsehen.

Abnahmekriterien:

- Eine komplette Mission ist auf Smartphone ausschließlich mit einem Finger
  fehlerfrei spielbar.
- Kein notwendiger Button liegt in einer Safe Area oder unter Browser-UI.
- Maus und Touch verhalten sich nach denselben Spielregeln.

Aufwand: 3–5 Arbeitstage.

### Phase 3 – Onboarding, Menüs und Progression

Aufgaben:

- Neue Spieler direkt in eine spielbare Tutorial-Mission führen.
- Drei visuelle Lernschritte im Spielfeld:
  1. eigenes System zum neutralen System ziehen;
  2. Energiefluss und Eroberung beobachten;
  3. eigenen Link nahe der Quelle schneiden und Boost auslösen.
- Tutorial kurz, überspringbar und nach dem ersten Erfolg dauerhaft reduziert.
- Levelauswahl mit klarer Freischaltung und Sternwertung bauen.
- Ergebnisdialog mit Zeit, Sternen, „Retry“ und „Next Sector“.
- Pause-Menü mit Fortsetzen, Neustart, Levelauswahl und Audio.
- Progression sicher speichern und bei beschädigten Daten zurücksetzen können.
- Englisch als Fallback; Deutsch über Browser- beziehungsweise SDK-Locale.
- Alle Texte kurz, natürlich und konsistent halten.

Abnahmekriterien:

- Erster Zug in weniger als 10 Sekunden erreichbar.
- Kein notwendiger Tutorialtext umfasst mehr als zwei kurze Zeilen.
- Spieler können nach Sieg oder Niederlage innerhalb von zwei Sekunden
  weiterspielen.
- Fortschritt überlebt Neuladen und private Storage-Fehler ohne Spielabbruch.

Aufwand: 5–7 Arbeitstage.

### Phase 4 – Kampagne, KI und Balancing

Launchumfang: acht hochwertige Missionen

Geplante Lernkurve:

1. **First Contact** – Verbinden und neutrales System erobern.
2. **Pressure Line** – erster Gegner und Verstärkung.
3. **Cut the Current** – Boost-Cut als Hauptlektion.
4. **Twin Fronts** – zwei Angriffsrichtungen priorisieren.
5. **Heavy Orbit** – Giant und Kapazitätsunterschiede.
6. **Quasar Run** – lange Routen und Timing.
7. **Three Powers** – zweite Gegnerfarbe und wechselnde Fronten.
8. **Nexus Siege** – Abschlussmission mit allen Kernregeln.

Aufgaben:

- Jede Mission erhält einen eigenen taktischen Gedanken.
- Gegner-KI bekommt nachvollziehbare Aggressions- und Verteidigungsregeln,
  aber keine versteckten Vorteile.
- Schwierigkeit über Layout, Startenergie, Produktion und KI-Timing steigern.
- Sternziele anhand realistischer Testläufe festlegen.
- Sackgassen, unfaire Starts und endlose Patt-Situationen ausschließen.
- Simulationsläufe für Balance und Regression ergänzen.
- Nach Abschluss aller Missionen einen einfachen Challenge-Modus freischalten.
  Ein täglicher Modus ist ein Update-Kandidat, kein Launch-Blocker.

Abnahmekriterien:

- Neue Spieler gewinnen Level 1 meist im ersten Versuch.
- Kein Level benötigt Glück oder Kenntnis unsichtbarer Regeln.
- Normale Missionen dauern ungefähr 1–4 Minuten.
- Die acht Missionen ergeben bei Erstspielern mindestens 10 Minuten
  zusammenhängende Spielzeit.

Aufwand: 8–12 Arbeitstage.

### Phase 5 – Audio und emotionale Dramaturgie

Aufgaben:

- Eigenständige SFX für Link, Schiffstart, Treffer, Capture, Cut, Boost,
  Warnung, UI, Sieg und Niederlage.
- Ruhiger Weltraum-Ambientloop oder leichte Musik, die Strategie nicht
  überdeckt.
- Musik und SFX getrennt regelbar.
- Audio erst nach Nutzerinteraktion starten.
- Bei Pause, Werbung, Fokusverlust und App-Wechsel korrekt absenken oder stoppen.
- Lautstärken auf Smartphone-Lautsprechern und Kopfhörern angleichen.

Abnahmekriterien:

- Kernaktionen sind auch ohne Blick auf das HUD akustisch unterscheidbar.
- Keine übersteuerten Sounds und keine störenden Lautstärkesprünge.
- Das Spiel bleibt mit komplett deaktiviertem Audio voll verständlich.

Aufwand: 3–5 Arbeitstage.

### Phase 6 – Technische Release-Qualität

Diese Arbeit läuft teilweise parallel zu den übrigen Phasen.

Aufgaben:

- `PlatformAdapter` in Local/GitHub-Pages und CrazyGames trennen.
- Speichersystem hinter eine gemeinsame Schnittstelle legen:
  lokaler SafeStorage und später CrazyGames Data Module.
- Asset-Preloading und klaren Ladefortschritt einführen.
- Produktions-Build auf Dateigröße und Dateizahl prüfen.
- Canvas-Skalierung, Device Pixel Ratio und Speicherverbrauch profilieren.
- Objekt-Pooling oder begrenzte Effektlisten für Schiffe und Partikel nutzen.
- Fehlergrenzen für SDK, Audio, Storage und Fullscreen ergänzen.
- Keine unnötigen externen Requests oder Laufzeitabhängigkeiten.
- Unit- und Simulationstests erweitern.
- Browser-E2E-Tests für Start, Drag, Cut, Pause, Restart, Fullscreen,
  Sieg und Progression einführen.

Abnahmekriterien:

- `npm test`, TypeScript-Check und Produktions-Build laufen reproduzierbar.
- Keine Konsolenfehler in Chrome, Edge, Firefox und mobilem Safari.
- Mehrfaches Pausieren, Neustarten und Drehen erzeugt keine doppelten Listener
  oder laufenden Simulationen.
- Build bleibt klar unter dem 20-MB-Ziel.

Aufwand: 5–8 Arbeitstage, verteilt über die Produktion.

### Phase 7 – CrazyGames-SDK und Portalverhalten

Für neue HTML5-Integrationen wird das CrazyGames-v3-SDK verwendet.

Aufgaben:

- SDK nur auf `localhost`, `127.0.0.1` oder CrazyGames aktivieren.
- SDK asynchron initialisieren und bei Fehlern lokal weiterspielen.
- `loadingStart()` und `loadingStop()` um den echten Initialdownload legen.
- `gameplayStart()` bei Levelstart und Wiederaufnahme melden.
- `gameplayStop()` bei Pause, Menüs, Levelende und Werbung melden.
- Levelkontext über `setGameContext()` für hilfreiches Nutzerfeedback setzen.
- Kampagnenfortschritt über `reportGameCompletedPercentage()` melden.
- `happytime()` nur für einen besonderen Erfolg verwenden, nicht für jeden Sieg.
- Locale und Gerätedaten über System Info berücksichtigen.
- Für Full Launch das Data Module für Fortschritt verwenden.
- Für Basic Launch keine sichtbaren Ad-Schaltflächen einbauen.
- Für Full Launch Midgame-Ads ausschließlich zwischen Missionen platzieren.
- Werbung muss Audio und Gameplay pausieren und auch bei ungefüllten Calls
  zuverlässig fortfahren.
- Rewarded Ads bleiben für Version 1.0 optional und dürfen keine Kernprogression
  blockieren.

Abnahmekriterien:

- Das Spiel funktioniert mit SDK, ohne SDK und bei blockiertem SDK.
- Gameplay-Events werden genau einmal pro Zustandswechsel gemeldet.
- Keine Werbung unterbricht eine laufende Mission.
- Fortschritt funktioniert für Gäste und angemeldete Nutzer entsprechend der
  CrazyGames-Data-Module-Logik.

Aufwand: 3–5 Arbeitstage für Basic- und Full-Launch-Vorbereitung.

### Phase 8 – Marketing- und Submission-Paket

Benötigte Cover:

- Landscape: 1920×1080;
- Portrait: 800×1200;
- Square: 800×800.

Benötigte Previewvideos:

- 15–20 Sekunden;
- Landscape 16:9 in 1080p;
- Portrait 2:3;
- ohne Ton, Mauszeiger, schwarze Balken oder „Play Now“-Text;
- statisches Cover als erstes Bild.

Aufgaben:

- Eigenständiges StarConquest-Logo und finale Wortmarke erstellen.
- Drei konsistente Coverkompositionen aus einem gemeinsamen Key Art ableiten.
- Einen dramatischen Boost-Cut als visuellen Hauptmoment verwenden.
- Previewvideos aus echtem finalem Gameplay aufnehmen.
- Englischen Titel, Kurztext, Beschreibung, Steuerung und Genre-Metadaten
  verfassen.
- Screenshots für Desktop und Mobile aufnehmen.
- Rechte und Herkunft aller Assets dokumentieren.
- Build-ZIP erstellen, dessen Einstiegspunkt `index.html` ist.

Abnahmekriterien:

- Cover bleiben auch als kleine Kachel klar erkennbar.
- Cover sind keine bloßen Screenshots und enthalten außer dem Spieltitel keinen
  Werbetext.
- Previewvideo zeigt innerhalb der ersten Sekunden echtes Gameplay.
- Portalbeschreibung verspricht nur Funktionen, die im Build existieren.

Aufwand: 4–6 Arbeitstage.

### Phase 9 – QA, Submission und Basic Launch

Gerätematrix:

- Chrome, Edge und Firefox auf Windows;
- Safari und Chrome auf iPhone;
- Chrome auf mehreren Android-Größen;
- mindestens ein Tablet;
- Desktop mit Maus;
- Touchscreen beziehungsweise emulierte Touch-Eingabe;
- 60-, 120-, 144- und 165-Hz-Darstellung.

Testfälle:

- erster Start und wiederkehrender Start;
- privater Browsermodus und blockierter Storage;
- langsame Verbindung und unterbrochenes Asset-Laden;
- Querformatwechsel, Fullscreen und Safe Areas;
- Audio-Autoplay-Sperre;
- Pause/Fokusverlust während Drag, Cut und Capture;
- Sieg, Niederlage, Neustart, Levelwechsel und Speichern;
- SDK aktiv, deaktiviert, blockiert und lokale Demo-Umgebung;
- Adblock und ungefüllte Anzeigen;
- zehn vollständige Kampagnenläufe ohne Neustart der Seite.

Veröffentlichungsablauf:

1. Release Candidate auf GitHub Pages bereitstellen.
2. Internen Abnahmelauf und Mobile-Tests durchführen.
3. Build im CrazyGames Developer Portal anlegen.
4. CrazyGames Preview Tool testen.
5. Metadaten, Cover und Videos hochladen.
6. Basic Launch einreichen.
7. Während des ungefähr zweiwöchigen Tests täglich Kennzahlen und Feedback
   prüfen.
8. Nur datenbegründete Updates veröffentlichen; keine großen Genreänderungen.

Abnahmekriterium:

- Keine bekannten P0- oder P1-Fehler und erfüllte Release-Maßstäbe aus
  Abschnitt 4.

Aufwand: 5–7 Arbeitstage plus externe Review- und Basic-Launch-Zeit.

### Phase 10 – Full Launch und Weiterentwicklung

Wenn die Basic-Launch-Kennzahlen ausreichend sind:

- CrazyGames-v3-SDK vollständig aktivieren;
- Data Module und Cloud-Fortschritt final verifizieren;
- Midgame-Ads zwischen Missionen aktivieren;
- Accountintegration nur so weit ausbauen, wie sie für das Spiel sinnvoll ist;
- Kennzahlen und Nutzerfeedback pro Level auswerten;
- Schwierigkeit, Onboarding und Cover datenbasiert verbessern.

Geeignete Updates nach Version 1.0:

- tägliche Herausforderung;
- vier weitere Missionen;
- neuer Systemtyp oder Umwelteffekt;
- zusätzliche Musik;
- Accessibility-Optionen;
- saisonale Cover und kleine visuelle Events.

Nicht unmittelbar nach Release:

- Multiplayer;
- komplexe Meta-Wirtschaft;
- In-App-Käufe;
- große Storykampagne;
- Plattformwechsel oder Engine-Neubau.

## 6. Empfohlene Reihenfolge und Aufwand

| Reihenfolge | Meilenstein | Aufwand |
|---:|---|---:|
| 1 | Art Pass: heller Hintergrund, Systeme, Route plus Schiffe | 6–9 Tage |
| 2 | Mobile-, Eingabe- und Accessibility-Pass | 3–5 Tage |
| 3 | Onboarding, Menüs, Levelauswahl und Progression | 5–7 Tage |
| 4 | Acht Missionen, KI und Balance | 8–12 Tage |
| 5 | Audio und zusätzliche Game-Feel-Politur | 3–5 Tage |
| 6 | Release-Technik, Tests und Performance | 5–8 Tage |
| 7 | CrazyGames-SDK und Portalverhalten | 3–5 Tage |
| 8 | Cover, Videos und Submission-Metadaten | 4–6 Tage |
| 9 | Geräte-QA und Release Candidate | 5–7 Tage |

Realistische Gesamtgröße ab jetzigem Stand: ungefähr 42–64 fokussierte
Arbeitstage. Bei Vollzeitarbeit entspricht das etwa 9–13 Wochen; bei
Teilzeitarbeit entsprechend länger. Einzelne Bereiche können parallel entstehen,
aber Art Direction, UX und Balance sollten nicht übersprungen werden.

## 7. Konkrete nächste drei Sprints

### Sprint A – Visuelles Spielfeld

- [x] Hintergrund aufhellen.
- [x] Routen vereinfachen.
- [x] Code-native Transportschiffe ergänzen.
- [x] Boost, Capture und Cut überarbeiten.
- [x] Modulares Polished-Casual-HUD umsetzen.
- [x] Mittleren System-Kontroll-Batch integrieren.
- [x] Mobile Screenshot und Bedienbarkeit prüfen.
- [x] Kleine und große Systemvarianten erstellen.
- [x] Finale Transportschiffe für beide Fraktionen integrieren.
- [ ] Pulsar, Giant, Quasar und Nexus final differenzieren.
- [ ] Finalen Effekt- und Performance-Pass durchführen.

Zwischenstand: Das laufende Spiel zeigt erstmals klar die gewünschte
Zielrichtung. Sprint A ist noch nicht abgeschlossen, bis Systemfamilie und
Effekt-Pass vollständig sind.

### Sprint B – Spielbare Mini-Kampagne

- Ingame-Tutorial fertigstellen.
- Ergebnisdialog und Levelauswahl bauen.
- Fortschritt und Sterne speichern.
- Level 1–4 erstellen und balancieren.

Ergebnis: Ein neuer Spieler kann ohne Erklärung eine zusammenhängende
Spielsession absolvieren.

### Sprint C – Release-Vertikalschnitt

- Level 5–8 und finale KI-Kurve.
- Audio-Pass.
- automatisierte Browser-Smoke-Tests.
- CrazyGames-v3-Adapter und Preview-Build.
- erster Cover- und Previewvideo-Entwurf.

Ergebnis: Ein vollständiger Release Candidate für externe QA.

## 8. Entscheidungsregeln während der Entwicklung

Eine neue Idee wird nur umgesetzt, wenn sie mindestens einen dieser Punkte
messbar verbessert:

- Verständlichkeit in den ersten 60 Sekunden;
- Qualität des Boost-Cut-Moments;
- mobile Bedienbarkeit;
- durchschnittliche Spielzeit oder Wiederspielwert;
- technische Zuverlässigkeit;
- Attraktivität von Cover und Gameplayvorschau.

Wenn eine Idee mehr UI, Text oder Ressourcen erzeugt, ohne einen dieser Punkte
zu verbessern, kommt sie nicht in Version 1.0.

## 9. Offizielle CrazyGames-Referenzen

- Anforderungen und Launchmodell:
  <https://docs.crazygames.com/requirements/intro/>
- Technische Anforderungen:
  <https://docs.crazygames.com/requirements/technical/>
- Gameplay-Anforderungen und Testauflösungen:
  <https://docs.crazygames.com/requirements/gameplay/>
- Qualitätsrichtlinien:
  <https://docs.crazygames.com/requirements/quality/>
- Basic-Launch-Kennzahlen:
  <https://docs.crazygames.com/resources/basic-launch-metrics/>
- CrazyGames HTML5 SDK v3:
  <https://docs.crazygames.com/sdk/intro/>
- Gameplay- und Ladeereignisse:
  <https://docs.crazygames.com/sdk/game/>
- Fortschritt über das Data Module:
  <https://docs.crazygames.com/sdk/data/>
- Werberichtlinien:
  <https://docs.crazygames.com/requirements/ads/>
- Cover- und Previewvideo-Vorgaben:
  <https://docs.crazygames.com/requirements/game-covers/>
