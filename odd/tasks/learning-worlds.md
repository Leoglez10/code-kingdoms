# Code Kingdoms — feature document
Objective: unify Java Quest and Cloud Quest into one React + Vite 2D game with an overworld, worlds split into parts, achievements and a customizable character.
Branch: `feat/learning-worlds` · Delivery: ask-on-risk · Test runner: `bun run test` (Vitest)

## Specs
- S1: React + Vite SPA, no Next. "sí, arranca con React + Vite y localStorage"
- S2: Main overworld with castles: "Que primero te mande a un mundo Principal Que es como el de los castillos Este es el de Java Este es el de Clau". Future languages must be addable with their own minigames ("en el futuro podremos integrar mucho mas lenguajes con sus propios minijuegos").
- S3: Each world split into parts: "Parte 1, parte 2, parte 3 Por ejemplo Si ya completé parte que ya va, parte 1 Que luego me salga y luego sea parte 2 Y parte 3 como Mario Bros". Parts unlock sequentially. Assumption: the existing 10 levels per world are split 4/3/3.
- S4: Migrate the existing Java Quest and Cloud Quest levels and engines ("agarres estos archivos que hay aquí los pases al nuevo").
- S5: Progress saved in localStorage.
- S6: Achievements: "La parte de los logros me gusta, por ejemplo yo que ya terminé este..."
- S7: Character customization: "hay un personaje que se llama Leo, poder cambiarle como tres estilos de ropa, ¿no? Tres de ropa, tres de pelo, tres de pantalón, tres de zapatos".
- S9: "quiero que copies el estilo de los otros html, ese movimiento y diseño y todo quiero que lo coipies,el que esta no me gusta" → canvas 320x192 maps with free WASD movement, original tiles, stations, sign and HUD.
- S8: Original art and names only (genre inspired by world-map platformers; no Nintendo assets/names).

## Tasks
| ID | Specs | Route | Status | Commit |
|----|-------|-------|--------|--------|
| T1 | S1, S4 | inline | done (RED: missing modules → GREEN 25/25) | 29dc522 + worker fix |
| T2 | S5, S6 | inline | done | ca95609 |
| T4 | S9 | inline | done (layout test RED→GREEN, browser check Java/Cloud maps) | see git log |
| T3 | S2, S3, S7, S8 | inline | done (avatar test RED→GREEN, browser smoke) | see git log |

T1 scaffold + engines ported as world modules with tests. T2 save model + achievements with tests. T3 UI: overworld, world/part maps, level panel, wardrobe, achievements screen.
Routes inline: no Writer trigger reason (units depend on each other).

## Log
- L1 (2026-10-29): "/Users/leoglez/Documents/Aprendizaje/Lenguajes/practica-java/ /Users/leoglez/Development/Cloud/cloud-quest/, Oye chat, a ver, tengo en estos dos archivos mundos 2D que hice como para practicar mis aprendizajes de lenguajes de programación o la cloud y ambos son muy parecidos en un mundo 2D pero yo pensaba hacer un nuevo proyecto en el que junte ambos proyectos y sea como un mundo en 2D en donde tú seleccionas el tipo de lenguaje y te meta como al minijuego que es, ¿no? como un juego interactivo pero de lenguajes entonces mi idea es que agarres estos archivos que hay aquí los pases al nuevo y hagas un nuevo html o el lenguaje que tú quieras un react algo bueno pero que juntes ambos mundos y lo pongas como como si fuera un juego de Mario Bros al mundo de java, al mundo de cloud en el futuro podremos integrar mucho mas lenguajes con sus propios minijuegos Pero que sea como interactivo Que primero te mande a un mundo Principal Que es como el de los castillos Este es el de Java Este es el de Clau Y luego cada uno se divida por mundos De cada parte Parte 1, parte 2, parte 3 Por ejemplo Si ya completé parte que ya va, parte 1 Que luego me salga y luego sea parte 2 Y parte 3 como Mario Bros En 12 Que opinas de todo eso"
- L2: React, not Next; must be deployable; save progress, later maybe share with friends.
- L3: "sí, arranca con React + Vite y localStorage" + achievements + Leo customization (3 shirt, 3 hair, 3 pants, 3 shoes) + "armándolo para que sea un poquito más serio".
- L4: "que corra con bun, se me olvido decirte" → bun install / bun run; package-lock replaced by bun.lock.
- L5: Browser smoke found Java runner always timing out in the production build: Vite minifies `execute`, the worker called the old name. Fixed by binding it as `var execute = (...)` in `workerSource`, pinned by a test. Verified in browser: level 1 passes, save persists, achievement toast shows, infinite loop times out, wardrobe works. 29/29 tests.
- Next: deploy to static host; optional Supabase saves.
- L6 (2026-10-29): "a ver pero quiero que copies el estilo de los otros html, ese movimiento y diseño y todo quiero que lo coipies,el que esta no me gusta" → replaced node PathMap with canvas WalkMap reusing the original drawing code; page CSS copied from the originals.
