# StarConquest

[English](#english) · [Deutsch](#deutsch)

<a id="english"></a>

## English

StarConquest is a touch-first browser strategy game about drawing energy
corridors between star systems, building fleet pressure and cutting routes at
the right moment to launch a decisive surge.

[Play the campaign](https://starconquest-game.netlify.app/) · [GitHub Pages mirror](https://emfau88.github.io/StarConquest/)

![Blue and Helion convoys opening parallel fronts in sector six / Blaue und Helion-Konvois eröffnen mehrere Fronten in Sektor sechs](docs/screenshots/helion-front.webp)

### Current status

StarConquest is fully playable on desktop and mobile browsers. The same Canvas
game scales cleanly from wide desktop screens to compact landscape phones,
while the HUD changes layout instead of truncating mission text or controls.

| Desktop | Mobile |
| --- | --- |
| Mouse input, wide mission HUD, accessible HUD buttons and fullscreen support. | Touch input, compact sector display, wrapped mission text, 48 px touch targets and secondary actions grouped behind **More**. |

Artwork, responsive effects, bilingual UI, streamed background music and
event-specific sound effects form one consistent presentation. Critical visual
and sound assets are decoded before gameplay starts; the next sector is prepared
during browser idle time before the remaining optional assets follow.

A real loading indicator appears only when startup takes long enough to notice.
The opening briefing freezes the board until **Start mission** is pressed, while
the campaign atlas shows all eight sectors, completion progress, ratings,
objectives and a compact preview of each starting layout.

### The game

- Draw routes from your systems to reinforce allies or attack hostile worlds.
- Watch a marked pioneer ship establish each new corridor while an evenly
  spaced convoy follows without changing speed or formation at activation.
- Cut a charged corridor to send its forward fleet surging toward the target
  while the rear formation retreats.
- Contest reciprocal attacks at a shared battle front whose position reflects
  the strength of both source systems.
- Read free and occupied route slots directly on every system, then grow
  sufficiently charged systems into a larger class with more capacity and
  another outgoing route.
- Capture Pulsars, Giants, Quasars and fortified Nexus systems across eight
  progressively denser sectors.
- Face two visually and tactically distinct hostile factions, including the
  long-range orange Helion Compact.
- Play with mouse or touch in a responsive landscape layout with persistent
  campaign unlocks and best star ratings.
- Switch between English and German at any time; the preference is saved.
- Hear separate low-volume music for the campaign map and a varied gameplay
  playlist, with smooth transitions and event-specific science-fiction effects.
- Toggle music and sound effects independently; both preferences are saved.

### From first convoy to sector command

| Fleet movement in play | Eight-sector campaign |
| --- | --- |
| ![Continuous blue and red fleet convoys in the first sector / Gleichmäßige blaue und rote Flottenkonvois im ersten Sektor](docs/screenshots/first-contact.webp) | ![The complete eight-sector StarConquest campaign map / Die vollständige StarConquest-Karte mit acht Sektoren](docs/screenshots/campaign-map.webp) |
| Pioneer-led formations establish new routes, then continue as evenly spaced convoys. | The campaign grows from a guided opening into Helion, three-faction and Nexus scenarios. |

### Campaign

1. **First Contact:** connect systems and expand through neutral space.
2. **Pressure Line:** react to two independently expanding enemy outposts.
3. **Cut the Current:** learn to turn stored route energy into a fleet surge.
4. **Twin Fronts:** prioritize between simultaneous attack lanes.
5. **Heavy Orbit:** manage every system class around a fortified Nexus.
6. **Helion Run:** counter the long routes of the Helion Compact.
7. **Three Powers:** survive a shifting conflict between three factions.
8. **Nexus Siege:** break two fortified hostile networks.

### Controls

- **Connect or attack:** drag from one owned system to another system.
- **Cut and surge:** swipe across an active corridor.
- **Manage the run:** use the HUD for the campaign map, restart, separate music
  and sound-effect controls, fullscreen and pause.
- **Compact screens:** open **More** for secondary actions; the primary pause
  control remains directly accessible.
- **Change language:** use the `EN`/`DE` button; the game updates immediately.

### Development

StarConquest uses TypeScript, Vite and a custom Canvas 2D renderer. Gameplay is
driven by a fixed-timestep simulation and covered by automated mechanics,
campaign, balance, responsive-HUD, audio, runtime-asset, preloading and
localization tests.

The opening sector's critical assets load first. Deferred loading then uses
browser idle time to prepare the next sector before fetching the rest of the
campaign catalogue, keeping startup fast without delaying later transitions.

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd test
npm.cmd run balance:sim
npm.cmd run build
```

The legacy source is frozen in [`reference/legacy-build/`](reference/legacy-build/).
The protected gameplay contract is documented in
[`docs/core-mechanics.md`](docs/core-mechanics.md), with the latest automated
balance report in [`docs/balance-report.md`](docs/balance-report.md).
Third-party music and sound licenses are recorded in
[`docs/third-party-assets.md`](docs/third-party-assets.md).

Every push to `main` validates and publishes the production build through
GitHub Pages.

---

<a id="deutsch"></a>

## Deutsch

StarConquest ist ein touch-optimiertes Browser-Strategiespiel. Du zeichnest
Energiekorridore zwischen Sternensystemen, baust Flottendruck auf und trennst
Routen im richtigen Moment für einen entscheidenden Vorstoß.

[Kampagne spielen](https://starconquest-game.netlify.app/) · [GitHub-Pages-Spiegel](https://emfau88.github.io/StarConquest/)

### Aktueller Stand

StarConquest ist auf Desktop- und Mobile-Browsern vollständig spielbar. Das
Canvas-Spiel skaliert sauber vom breiten Desktop bis zum kompakten Smartphone
im Querformat. Dabei ordnet sich das HUD neu an, statt Missionstexte oder
Bedienelemente abzuschneiden.

| Desktop | Mobile |
| --- | --- |
| Maussteuerung, breites Missions-HUD, zugängliche HUD-Schaltflächen und Vollbild-Unterstützung. | Touch-Steuerung, kompakte Sektoranzeige, umbrechende Missionstexte, 48-Pixel-Touchziele und gebündelte Sekundäraktionen unter **Mehr**. |

Grafik, responsive Effekte, zweisprachige Oberfläche, gestreamte
Hintergrundmusik und ereignisbezogene Soundeffekte ergeben eine einheitliche
Präsentation. Kritische Grafik- und Sound-Assets werden vor dem Spielstart
dekodiert. In Browser-Leerlaufphasen folgt zuerst der nächste Sektor und danach
der verbleibende optionale Asset-Katalog.

Ein echter Ladebalken erscheint nur, wenn der Start spürbar dauert. Das
Missionsbriefing friert das Spielfeld ein, bis **Mission starten** gedrückt wird.
Der neue Kampagnenatlas zeigt alle acht Sektoren, Fortschritt, Wertungen,
Missionsziele und eine kompakte Vorschau der jeweiligen Ausgangslage.

### Das Spiel

- Verbinde eigene Systeme, um Verbündete zu verstärken oder feindliche Welten
  anzugreifen.
- Ein markiertes Pionierschiff eröffnet jede neue Route; anschließend folgt
  ein gleichmäßig bewegter Flottenkonvoi.
- Trenne einen geladenen Korridor, um die vordere Flotte zum Ziel zu schicken,
  während sich der hintere Teil zurückzieht.
- Gegenseitige Angriffe treffen sich an einer gemeinsamen, von der Stärke
  beider Quellsysteme bestimmten Kampffront.
- Freie und belegte Routenslots sind an jedem System sichtbar. Stark geladene
  Systeme wachsen in größere Klassen mit höherer Kapazität und weiteren Routen.
- Erobere Pulsare, Giants, Quasare und befestigte Nexus-Systeme in acht
  zunehmend komplexen Sektoren.
- Kämpfe gegen zwei visuell und taktisch unterschiedliche Fraktionen,
  darunter das orange Helion-Kompakt mit seinen Langstreckenrouten.
- Spiele mit Maus oder Touch im responsiven Querformat; Freischaltungen und
  Bestwertungen werden gespeichert.
- Wechsle jederzeit live zwischen Deutsch und Englisch; die Auswahl bleibt
  gespeichert.
- Menü und Gameplay besitzen eigene leise Musik; während des Spiels wechseln
  sich mehrere Stücke mit weichen Übergängen ab.
- Musik und Soundeffekte lassen sich unabhängig schalten; beide Einstellungen
  bleiben gespeichert.

### Kampagne

1. **Erster Kontakt:** Systeme verbinden und durch neutralen Raum expandieren.
2. **Drucklinie:** auf zwei unabhängig expandierende Außenposten reagieren.
3. **Stromschnitt:** gespeicherte Routenenergie in einen Flottenstoß umwandeln.
4. **Doppelfront:** zwischen gleichzeitigen Angriffsachsen priorisieren.
5. **Schwere Umlaufbahn:** alle Systemklassen rund um einen Nexus koordinieren.
6. **Helion-Vorstoß:** die langen Versorgungsrouten des Helion-Kompakts kontern.
7. **Drei Mächte:** einen wechselnden Konflikt zwischen drei Fraktionen bestehen.
8. **Nexus-Belagerung:** zwei befestigte gegnerische Netzwerke durchbrechen.

### Steuerung

- **Verbinden oder angreifen:** von einem eigenen System zu einem anderen
  System ziehen.
- **Trennen und vorstoßen:** über einen aktiven Energiekorridor wischen.
- **Partie verwalten:** Kampagnenkarte, Neustart, getrennte Regler für Musik und
  Soundeffekte, Vollbild und Pause befinden sich im HUD.
- **Kompakte Bildschirme:** Unter **Mehr** befinden sich Sekundäraktionen; die
  zentrale Pausensteuerung bleibt direkt erreichbar.
- **Sprache wechseln:** die Schaltfläche `DE`/`EN` verwenden; die Oberfläche
  wird sofort umgestellt.

### Entwicklung

StarConquest verwendet TypeScript, Vite und einen eigenen Canvas-2D-Renderer.
Eine Fixed-Timestep-Simulation bildet die Spielgrundlage; Mechanik, Kampagne,
Balancing, responsives HUD, Audio, Laufzeit-Assets, Preloading und Lokalisierung
werden automatisiert getestet.

Beim Start laden nur die kritischen Assets des ersten Sektors. Danach bereitet
das Spiel in Browser-Leerlaufphasen zuerst den nächsten Sektor und anschließend
den restlichen Kampagnen-Katalog vor. So bleibt der Start schnell und spätere
Sektorwechsel laufen dennoch ohne unnötige Wartezeit.

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd test
npm.cmd run balance:sim
npm.cmd run build
```

Der Legacy-Quellstand ist unter
[`reference/legacy-build/`](reference/legacy-build/) eingefroren. Der geschützte
Spielmechanik-Vertrag steht in [`docs/core-mechanics.md`](docs/core-mechanics.md),
der aktuelle automatisierte Balancebericht in
[`docs/balance-report.md`](docs/balance-report.md).
Lizenzen und Originalquellen externer Musik- und Sound-Assets stehen unter
[`docs/third-party-assets.md`](docs/third-party-assets.md).

Jeder Push auf `main` validiert und veröffentlicht den Produktionsbuild über
GitHub Pages.
