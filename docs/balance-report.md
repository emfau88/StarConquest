# StarConquest balance report

Stand: 30. Juli 2026

## Reproduzierbare Simulationsbasis

`npm.cmd run balance:sim` spielt jede Mission deterministisch mit drei
Profilen:

- **Learner:** eine sinnvolle Aktion alle 2,8 Sekunden, vorsichtige Cuts;
- **Regular:** eine Aktion alle 1,8 Sekunden, solide Cuts und Verstärkung;
- **Expert:** eine Aktion pro Sekunde, aggressive aber regelkonforme Cuts.

Alle Profile verwenden ausschließlich die öffentlich verfügbaren Spielerregeln.
Sie erhalten keine zusätzliche Energie und kennen keine versteckten Zustände.

## Aktueller Lauf

| Sektor | Learner | Regular | Expert | 3 / 2 Sterne |
|---:|---:|---:|---:|---:|
| 1 | Sieg 14,9 s / 0 Cuts | Sieg 11,3 s / 0 Cuts | Sieg 11,7 s / 0 Cuts | 75 / 130 s |
| 2 | Sieg 62,1 s / 7 Cuts | Sieg 49,1 s / 6 Cuts | Sieg 41,5 s / 8 Cuts | 100 / 170 s |
| 3 | Sieg 36,9 s / 1 Cut | Sieg 31,1 s / 4 Cuts | Sieg 25,5 s / 5 Cuts | 115 / 190 s |
| 4 | Sieg 62,1 s / 7 Cuts | Sieg 45,5 s / 8 Cuts | Sieg 36,5 s / 9 Cuts | 140 / 230 s |
| 5 | Sieg 94,9 s / 11 Cuts | Sieg 47,3 s / 12 Cuts | Sieg 39,5 s / 14 Cuts | 165 / 270 s |
| 6 | Niederlage 110,9 s / 15 Cuts | Sieg 51,4 s / 8 Cuts | Sieg 54,5 s / 21 Cuts | 195 / 320 s |
| 7 | Sieg 92,8 s / 10 Cuts | Sieg 61,3 s / 14 Cuts | Sieg 41,5 s / 12 Cuts | 225 / 360 s |
| 8 | Sieg 179,2 s / 24 Cuts | Sieg 65,3 s / 12 Cuts | Sieg 46,5 s / 15 Cuts | 255 / 400 s |

## Bewertung

- Level 1 bleibt deutlich zugänglich.
- Level 2 und 3 liegen zeitlich nah beieinander; Level 3 belohnt den neu
  gelernten Cut bewusst mit einem kürzeren Durchbruch.
- Ab Level 4 steigen Dauer und Frontwechsel klar. Gegengerichtete Angriffe
  bilden nun echte Begegnungsfronten; Cuts müssen diese zuerst brechen.
- Level 6 bestraft das langsame Learner-Profil, bleibt für Regular und Expert
  stabil lösbar.
- Level 7 führt beide Gegner gleichzeitig ein. Der zusätzliche eigene
  Flanken-Pulsar verhindert einen unfairen Start und lässt trotzdem wechselnde
  Fronten entstehen.
- Level 8 ist im Learner-Profil mit Abstand die längste Mission. Die zwei
  befestigten Nexus-Netze bilden damit einen klaren Kampagnenabschluss, ohne
  einem der drei Profile einen deterministischen Sieg zu verwehren.
- Die Sternzeiten wurden moderat gestrafft und steigen nun sauber von Sektor zu
  Sektor. Sie bleiben bewusst großzügiger als Botzeiten, weil Wahrnehmung,
  Gesten und Entscheidungszeit nur Menschen realistisch abbilden.

## Browser-Smoke-Test

Level 1, 3, 6, 7 und 8 wurden im lokalen Browser gestartet und auf
vollständige Systemdarstellung, Tutorial-/Missionshinweise,
Fraktionslesbarkeit und bedienbare HUD-Elemente geprüft. Zusätzlich wurde
Level 5 bis zur Angriffswarnung und Niederlage laufen gelassen. Die erweiterte
Kampagnenkarte zeigt alle acht Sektoren, ihre lineare Freischaltung und die
zusammenlaufenden roten und orangefarbenen Routen ohne Überlappungen.

## Noch notwendige menschliche Validierung

Simulation ersetzt keine echten Spieler. Vor dem Release sind mindestens fünf
Erstspieler-Läufe sinnvoll. Pro Level sollten Abschlussquote, Zeit, Neustarts,
erste Aktion und Anzahl sinnvoller Cuts erfasst werden. Die Sternzeiten werden
erst danach als final markiert.
