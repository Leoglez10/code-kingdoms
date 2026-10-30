# Code Kingdoms

Un juego 2D en pixel art para aprender lenguajes de programación y la nube. Empiezas en un mapa de castillos, eliges un reino (Java, Cloud…) y avanzas parte por parte (1-1, 1-2, 1-3) resolviendo retos cortos de código.

> 🇬🇧 [Read in English](README.md)

> **Estado:** en desarrollo. Nace de unir dos juegos anteriores e independientes: Java Quest y Cloud Quest.

## Qué vas a poder hacer

| Función | Descripción |
|---------|-------------|
| Mapa principal | Un mapa de castillos, uno por reino. Los castillos bloqueados muestran lo que viene. |
| Reinos por partes | Cada reino se divide en Parte 1, 2 y 3. Completa una parte para desbloquear la siguiente. |
| Reino de Java | Escribe Java de verdad (variables, bucles, arrays, métodos) y ve la salida en una consola. |
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

Cada reino es un módulo que trae sus niveles, cómo se dividen en partes y un motor que revisa la respuesta del jugador. Se registra y aparece como un castillo nuevo en el mapa principal, sin tocar nada más.

## Hoja de ruta

- [x] Mapa principal, reinos y partes
- [x] Reinos de Java y Cloud migrados
- [x] Logros
- [x] Personalización del personaje
- [ ] Publicar en un hosting estático
- [ ] Cuentas opcionales y guardado en la nube para jugar con amigos
