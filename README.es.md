# Code Kingdoms

Un juego 2D en pixel art para aprender lenguajes de programación y la nube. Empiezas en un mapa de castillos, eliges un reino (Java, Cloud…), luego un mundo, y avanzas parte por parte (1-1, 1-2, 1-3) resolviendo retos cortos de código.

> 🇬🇧 [Read in English](README.md)

> **Estado:** en desarrollo. Nace de unir dos juegos anteriores e independientes: Java Quest y Cloud Quest.

## Qué vas a poder hacer

| Función | Descripción |
|---------|-------------|
| Mapa principal | Un mapa de castillos, uno por reino. Los castillos bloqueados muestran lo que viene. |
| Mundos y partes | Cada reino tiene mundos (1, 2, 3…) y cada mundo se divide en partes (1-1, 1-2, 1-3). Completa una para desbloquear la siguiente. |
| Reino de Java | 3 mundos y 30 niveles: **Fundamentos** (variables, bucles, arrays, métodos), **Herramientas** (Strings, `switch`, `do-while`, arrays 2D) y **Objetos** (clases, constructores, encapsulación, herencia). |
| Reino de Cloud | Escribe comandos simulados de la AWS CLI (S3, IAM, EC2). Nada llega a AWS y nada cuesta dinero. |
| Logros | Se desbloquean al completar partes, terminar reinos y más. |
| Leo, tu personaje | Personaliza a Leo con 3 estilos de pelo, 3 de camisa, 3 de pantalón y 3 de zapatos. |
| Progreso guardado | Todo se guarda en tu navegador (localStorage). |

## Cómo empezar

```bash
bun install
bun run dev     # abre la URL que muestra Vite
bun run test    # corre los tests de los motores y de la lógica del juego
```

## Tecnología

| Tema | Decisión |
|------|----------|
| Interfaz | React + Vite, como app estática de una sola página (sin servidor) |
| Guardado | `localStorage` detrás de un único módulo de guardado, para moverlo a un backend después |
| Hosting | Cualquier hosting estático (Cloudflare Pages, Vercel, Netlify) |
| Runtime | Bun (instalación y scripts) |
| Tests | Vitest, con `bun run test` |

## Agregar un reino nuevo

Cada reino es un módulo en `src/worlds/` que trae sus niveles, cómo se agrupan en mundos (`chapters`) y partes (`partSizes`), y un motor que revisa la respuesta del jugador. Se registra y aparece como un castillo nuevo en el mapa principal, sin tocar nada más.

## Hoja de ruta

- [x] Mapa principal, reinos y partes
- [x] Reinos de Java y Cloud migrados
- [x] Logros
- [x] Personalización del personaje
- [x] Java con 3 mundos (30 niveles)
- [ ] Publicar en un hosting estático
- [ ] Más mundos para Cloud
- [ ] Cuentas opcionales y guardado en la nube para jugar con amigos
