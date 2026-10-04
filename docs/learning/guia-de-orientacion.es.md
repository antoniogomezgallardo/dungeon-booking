# Guía de orientación para el QAE (Dungeon Booking)

- Lector: Antonio, Quality Assurance Engineer del squad
- Fecha: 2026-10-04 (final del Sprint 0)
- Estado del repositorio al escribir esta guía: `main` en el commit `6277dc4`

## 1. Para quién es esta guía y cómo leerla

Esta guía es para ti, Antonio, y para nadie más. Hoy se ha creado el repositorio entero en una sola sesión y tu reacción ha sido razonable: "veo muchos archivos y no los entiendo ni lo que hacen". Este documento existe para que, cuando termines de leerlo, sepas qué es cada carpeta, por qué está ahí, qué partes son tuyas como QAE y qué partes solo necesitas entender para poder probarlas y discutirlas con el equipo. Está escrito para alguien con experiencia en Playwright y Cypress que no ha trabajado con monorepos TypeScript, Fastify, Prisma, Docker Compose, GitHub Actions ni GitLab Flow, así que cada término técnico se define la primera vez que aparece y hay un glosario al final. No hace falta leerla de un tirón: las secciones 2 y 3 dan contexto, la 4 y la 5 explican la técnica, la 6 a la 8 explican cómo se prueba y despliega, y las secciones 9 a 11 son el "dónde estamos y qué hago mañana".

Es la **única excepción en español** de todo el proyecto. Tú decidiste que todo lo que hay en el repositorio y en GitHub (código, commits, issues, PRs, documentación, conversaciones con los agentes) esté en inglés para practicarlo; esa decisión se mantiene y está escrita en [CLAUDE.md](../../CLAUDE.md). Esta guía se salta la regla porque es tu documento personal de orientación, no un artefacto del equipo: su objetivo es que entiendas el terreno rápido, y para eso el idioma no debe ser un obstáculo añadido. Todo lo que enlaza (ficheros, ADRs, runbooks) sigue en inglés, y ahí es donde practicarás.

## 2. Qué es Dungeon Booking: visión funcional y de negocio

Resumen con mis palabras de [docs/product/vision.md](../product/vision.md) y [docs/product/roadmap.md](../product/roadmap.md), ambos escritos hoy por la PM (Maya Chen).

**A quién sirve.** A dueños y personal de escape rooms y cafés de juegos de mesa: negocios pequeños con una o pocas salas, algunas mesas, y una agenda que se llena por las tardes y los fines de semana. No son técnicos; hoy gestionan las reservas con llamadas, WhatsApp, una hoja de cálculo compartida y una agenda de papel en el mostrador. Y a sus clientes: grupos de amigos, familias y equipos de empresa que quieren saber ahora mismo si hay hueco para seis personas el sábado a las 19:00 y reservarlo sin esperar a que alguien conteste el teléfono.

**Qué problema resuelve.** Cuatro dolores concretos:

| Dolor                        | Qué pasa hoy                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| Reservas duplicadas          | Dos empleados confirman el mismo hueco por canales distintos; el grupo que llega segundo se va enfadado |
| Caos de teléfono y WhatsApp  | Confirmar una reserva son varios mensajes de ida y vuelta, muchas veces fuera del horario de trabajo    |
| Clientes que no aparecen     | Reservas informales sin recordatorio; una sala que podía venderse se queda vacía                        |
| Sin visibilidad de ocupación | El dueño no puede responder "¿qué sala está infrautilizada entre semana?" sin reconstruirlo a mano      |

**La apuesta.** Si un local publica sus salas y sus horarios una vez y los clientes reservan contra disponibilidad real, las reservas duplicadas desaparecen por construcción y la mayor parte de la conversación de ida y vuelta sobra. Una vez las reservas viven en un solo sitio, los recordatorios, la lista de espera, las promociones y los informes de ocupación son añadidos baratos. La estrategia es ser **simple y fiable** para locales pequeños, no tener muchas funcionalidades.

**Qué incluye cada sprint.** Los sprints duran una semana real y cada uno tiene un tema elegido a propósito para que el riesgo del producto coincida con lo que tú practicas (ver [curriculum.md](curriculum.md)):

| Sprint | Tema de producto                                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 1      | Cimientos: cuentas, roles (OWNER, STAFF, CUSTOMER), locales (venues) y salas (rooms) por API, más una primera UI mínima       |
| 2      | Disponibilidad y reservas: franjas horarias por sala, reserva y cancelación, capacidad, zonas horarias y cambios de hora      |
| 3      | Gestión de la demanda: lista de espera, códigos promocionales, reglas de precio, políticas de cancelación                     |
| 4      | Comunicación, pagos e información: notificaciones (buzón simulado), pagos simulados con webhook, panel de ocupación           |
| 5      | Endurecimiento y preparación de release: observabilidad, rendimiento básico, puertas de smoke y regresión, ensayo de rollback |

**Qué queda fuera en los sprints 1-5** (para que no lo eches de menos ni lo pruebes): pasarelas de pago reales (se simulan en el Sprint 4), envío real de email o SMS (van a un buzón simulado que podemos inspeccionar), apps móviles (la web debe funcionar en el navegador del móvil, nada más), organizaciones multi-local y franquicias, marketplace o buscador de locales (el cliente llega por el enlace del local), integraciones con Google Calendar o TPV, traducción de la interfaz (solo inglés), y reservas recurrentes o recursos compartidos entre salas. Las zonas horarias, en cambio, son de primera clase desde el primer día porque los locales están en países distintos.

**Métricas de éxito al final del Sprint 5.** Cero reservas duplicadas (garantizado por el sistema y demostrado con tests), reserva completa en menos de 2 minutos, alta de un local con 3 salas y una semana de horarios en menos de 15 minutos sin leer documentación, el 100 % de las reservas confirmadas reciben recordatorio (buzón simulado), y la ocupación por sala y semana disponible en una sola vista. Si una historia no mueve una de estas métricas, es candidata a recortarse. Fíjate en que la primera métrica es literalmente una afirmación de calidad: "probado con tests" es trabajo tuyo.

## 3. Qué es este proyecto además del producto: la simulación

El repositorio es dos cosas a la vez: un SaaS real y un campo de entrenamiento de Quality Engineering. La definición completa está en [CLAUDE.md](../../CLAUDE.md), que es el fichero que lee Claude al arrancar cada sesión.

**Roles.**

| Rol                           | Quién                        | Dónde está definido                                                            |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| QAE, dueño de la calidad      | **Tú** (humano)              | —                                                                              |
| Mentor de QA y orquestador    | Claude, hilo principal       | [CLAUDE.md](../../CLAUDE.md)                                                   |
| Product Manager "Maya Chen"   | agente (subagente de Claude) | [.claude/agents/product-manager.md](../../.claude/agents/product-manager.md)   |
| Tech Lead "Jordan Okafor"     | agente                       | [.claude/agents/tech-lead.md](../../.claude/agents/tech-lead.md)               |
| Senior Developer "Sam Rivera" | agente                       | [.claude/agents/senior-developer.md](../../.claude/agents/senior-developer.md) |
| Technical writer              | agente a nivel de usuario    | `~/.claude/agents/documentation-agent.md` (fuera del repo)                     |
| Especialista en git           | agente a nivel de usuario    | `~/.claude/agents/git-agent.md` (fuera del repo)                               |

Un **agente** es un fichero Markdown con una cabecera (nombre, descripción) y un prompt que define cómo se comporta un personaje cuando el mentor lo invoca. Los tres agentes del squad firman sus commits con su propia identidad (`Jordan Okafor (Tech Lead) <tl@dungeonbooking.dev>`, `Maya Chen (PM) <pm@dungeonbooking.dev>`, `Sam Rivera (Senior Dev) <dev@dungeonbooking.dev>`) para que el `git log` parezca el de un equipo real. Un consejo honesto: los ficheros de los agentes contienen, además de su rol y su forma de hablar, instrucciones sobre la mecánica oculta de la simulación. Leer esa parte te estropearía el ejercicio igual que leer el ledger; si quieres saber cómo piensan, lee las secciones de rol y límites y para ahí.

**Idioma.** El mentor te habla en español. Todo lo demás (lo que escribes en issues, PRs, tests, documentación, y lo que escriben los agentes) va en inglés. Cuando escribas en inglés, el mentor puede ofrecerte al final una corrección breve y opcional, nunca en medio del contenido.

**El ledger privado.** El desarrollador (Sam) introduce en cada historia defectos realistas, del tipo que un senior con prisa podría dejar pasar, y los anota en `~/.dev-team-sim/bug-ledger.md`, un fichero fuera del repositorio. Tú te has comprometido a no leerlo. El mentor sí lo lee, solo para evaluar tu trabajo en `/qa-review` y para revelar en `/retro` los defectos que se te hayan escapado en el sprint ya cerrado. Nunca te dirá dónde están los que quedan por encontrar. Es lo que hace que el entrenamiento sea honesto: los bugs que encuentres los habrás encontrado tú.

**Ceremonias disponibles como skills.** Un _skill_ es un fichero `SKILL.md` en `.claude/skills/<nombre>/` que describe un procedimiento; lo invocas escribiendo `/nombre` al mentor. Son el ciclo del sprint:

| Skill         | Qué hace                                                                                                                                   | Cuándo usarlo                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `/refinement` | La PM presenta las historias del sprint una a una; tú preguntas, detectas ambigüedades y huecos, y escribes "QA notes" en cada issue       | Antes de empezar un sprint. Es tu primera acción                   |
| `/planning`   | Se fija el alcance, tú escribes un plan de pruebas basado en riesgo por historia, etiquetas el riesgo y el dev empieza a entregar          | Justo después del refinement                                       |
| `/standup`    | Estado del sprint en tres bloques (ayer, hoy, bloqueos) y tu foco del día                                                                  | Cualquier día: "¿qué hago hoy?"                                    |
| `/qa-review`  | El mentor evalúa tu trabajo sobre un PR o historia con una rúbrica y lo compara con el ledger (solo te da cuentas y pistas, no el defecto) | Cuando terminas de probar un PR                                    |
| `/release`    | Te guía para promocionar `main` a `staging`, pasar smoke y regresión, escribir el informe de validación, aprobar `production` y etiquetar  | Cuando las historias del sprint están validadas                    |
| `/retro`      | Métricas del sprint, revelación de los defectos escapados, reflexión, acciones y actualización de la documentación viva                    | Al cerrar el sprint, después del release                           |
| `/journal`    | Captura un momento de aprendizaje en la documentación viva sin esperar a la retro                                                          | Tras una depuración interesante, una técnica nueva, una frase útil |

Los ficheros: [refinement](../../.claude/skills/refinement/SKILL.md), [planning](../../.claude/skills/planning/SKILL.md), [standup](../../.claude/skills/standup/SKILL.md), [qa-review](../../.claude/skills/qa-review/SKILL.md), [release](../../.claude/skills/release/SKILL.md), [retro](../../.claude/skills/retro/SKILL.md), [journal](../../.claude/skills/journal/SKILL.md). Léelos: son cortos y no tienen secretos; saber qué va a pasar en cada ceremonia te ayuda a prepararla.

**Ritmo y currículo.** Un sprint es una semana real. El [currículo](curriculum.md) asigna a cada sprint un foco de QA: en el Sprint 1 escribes la estrategia de pruebas, participas en el refinement de verdad, escribes tus primeros tests de API de caja negra con Playwright y una suite de smoke, y lees los diffs de los PRs. Los sprints siguientes añaden pruebas basadas en riesgo, investigación de fallos complejos, fiabilidad y validación de releases. Hay objetivos transversales a todos los sprints: participar desde el refinement, leer código, TypeScript, inglés y asumir la propiedad de la calidad (bloquear un merge cuando esté justificado).

## 4. Arquitectura técnica explicada desde cero

Antes de los ficheros, el mecanismo. Esto es lo que pasa cuando abres la web en el navegador:

```
            navegador
                |
                |  GET /            (HTML, JS de React)
                |  GET /api/health  (la app pide el estado de la API)
                v
        +------------------+
        |  web             |   dev:  Vite en :5173
        |  (React + Vite)  |   contenedor: nginx en :80 (8100 staging, 8200 production)
        +------------------+
                |  /api/* se reenvía a la API quitando el prefijo /api
                |  (Vite en dev, nginx en los contenedores)
                v
        +------------------+
        |  api             |   dev y contenedor: Fastify en :3000
        |  (Fastify)       |   (3100 staging, 3200 production vistos desde fuera)
        |  GET /health     |
        |  GET /docs       |   interfaz de OpenAPI
        |  GET /docs/json  |   documento OpenAPI en JSON
        +------------------+
                |  consulta "SELECT 1" al comprobar salud; queries via Prisma
                v
        +------------------+
        |  PostgreSQL 16   |   dev: Docker en :5432 (dungeon_dev)
        +------------------+
```

El navegador habla solo con `web`, nunca directamente con `api`. La web llama a `/api/...` en su mismo origen y alguien (Vite en desarrollo, nginx en los contenedores) reenvía la petición a Fastify quitando el prefijo. La ventaja: no hay que configurar CORS (el mecanismo del navegador que bloquea llamadas entre orígenes distintos) y los tests de navegador no dependen de la URL de la API. Está decidido en [ADR 0001](../adr/0001-monorepo-fastify-react-prisma.md) y verificable en [apps/web/vite.config.ts](../../apps/web/vite.config.ts) (sección `server.proxy`) y [apps/web/nginx.conf](../../apps/web/nginx.conf) (`location /api/`).

**Vocabulario de la pila**, definido una vez:

- **Monorepo**: un único repositorio git que contiene varios paquetes (aquí la API, la web, un paquete compartido y los tests E2E) en lugar de un repositorio por paquete. Se eligió para que un cambio de contrato (por ejemplo, un campo nuevo en una respuesta) se haga en un solo PR que toque API, web y tests a la vez, y para que todo esté en el mismo lenguaje.
- **pnpm workspaces**: pnpm es un gestor de paquetes (como npm) y "workspaces" es su forma de gestionar varios paquetes dentro del monorepo. [pnpm-workspace.yaml](../../pnpm-workspace.yaml) declara qué carpetas son paquetes (`apps/*`, `packages/*`, `tests/*`). `pnpm --filter api <script>` ejecuta un script solo en el paquete `api`; `pnpm -r <script>` lo ejecuta en todos.
- **Fastify**: el framework HTTP de la API (el equivalente a Express, más rápido y con validación integrada). Una "ruta" es una función que responde a `GET /health`. Versión 5.
- **zod**: una librería para declarar esquemas de datos en TypeScript (`z.object({ status: z.enum(['ok','degraded']) })`) que sirven a la vez para validar en tiempo de ejecución y para derivar el tipo estático. Es la pieza que hace que el contrato esté en un solo sitio.
- **OpenAPI**: el formato estándar (antes "Swagger") para describir una API HTTP: rutas, parámetros, respuestas. Aquí se genera automáticamente desde los esquemas zod (`fastify-type-provider-zod` + `@fastify/swagger`), así que no puede desincronizarse del código. Se sirve en `/docs` (interfaz navegable) y `/docs/json` (el documento).
- **Prisma**: el ORM (Object-Relational Mapper: la capa que traduce entre objetos TypeScript y tablas SQL). Tiene tres partes: el esquema ([schema.prisma](../../apps/api/prisma/schema.prisma)), las migraciones (ficheros SQL versionados que transforman la base de datos paso a paso, en [prisma/migrations/](../../apps/api/prisma/migrations/20261004000000_init/migration.sql)) y el cliente generado (`@prisma/client`, código TypeScript tipado para hacer consultas). Está fijado a la versión 6 a propósito (ADR 0001).
- **Vite**: la herramienta que sirve la web en desarrollo (recarga instantánea) y la empaqueta para producción (`vite build` genera `dist/` con HTML, JS y CSS estáticos).
- **Vitest**: el runner de tests unitarios, con la misma API que Jest, integrado con Vite. Lo usan API, web y shared.
- **Playwright**: el runner de tests de caja negra. Aquí tiene dos "projects": `api` (peticiones HTTP sin navegador, con `request`) y `web` (Chrome de escritorio). Es tuyo.

**Cómo viajan los contratos.** El paquete [packages/shared](../../packages/shared/src/index.ts) exporta esquemas zod. `HealthResponseSchema` ([health.ts](../../packages/shared/src/health.ts)) describe la respuesta de `GET /health`. Lo usan cuatro consumidores:

1. La API lo pone como esquema de respuesta de la ruta ([routes/health.ts](../../apps/api/src/routes/health.ts)): Fastify serializa con él y OpenAPI lo documenta.
2. La web lo usa para parsear la respuesta ([api/client.ts](../../apps/web/src/api/client.ts)): si la API devolviese algo con otra forma, el `parse` lanzaría.
3. El test unitario de la API lo usa para validar lo que responde `app.inject` ([health.test.ts](../../apps/api/src/routes/health.test.ts)).
4. Tu test de smoke de API lo usa igual ([health.api.spec.ts](../../tests/e2e/tests/smoke/health.api.spec.ts)): `HealthResponseSchema.parse(await response.json())` es, en una línea, un test de contrato.

Un solo origen de verdad, cuatro consumidores. Cuando en el Sprint 1 el dev añada `POST /auth/register`, lo esperable es que el esquema de la petición y la respuesta aparezcan en `packages/shared` y tú los importes en tus tests.

**`buildApp(deps)`: tests unitarios sin base de datos.** Mira [apps/api/src/app.ts](../../apps/api/src/app.ts). La función `buildApp` no crea la conexión a la base de datos: la recibe como parámetro, en forma de un objeto diminuto llamado `Database` con un solo método, `ping()`. Esto se llama inyección de dependencias "en el borde": la app depende de un puerto (una interfaz), no de Prisma. Consecuencia:

- [server.ts](../../apps/api/src/server.ts) (el proceso real) construye la app con `prismaDatabase(prisma)` de [db.ts](../../apps/api/src/db.ts), cuyo `ping` ejecuta `SELECT 1` en PostgreSQL.
- El test unitario [routes/health.test.ts](../../apps/api/src/routes/health.test.ts) construye la app con un `ping` falso que o resuelve o lanza `connection refused`. Sin PostgreSQL, en milisegundos, y puede probar el camino de fallo (503), que con una base de datos real sería incómodo de provocar.
- El test de integración [test/integration/health.test.ts](../../apps/api/test/integration/health.test.ts) construye la misma app con el Prisma real. Mismo código, dos niveles.

Los dos usan `app.inject(...)`, una utilidad de Fastify que simula una petición HTTP sin abrir un puerto. Por eso ninguno de los dos necesita que el servidor esté arrancado.

**Qué hace `/health` y por qué devuelve 503.** La ruta hace `ping()`; si responde, devuelve `200` con `status: "ok"` y `checks.database: "up"`; si lanza, devuelve **503** con `status: "degraded"` y `checks.database: "down"`, y escribe en el log un `warn` con el error. La decisión de usar 503 en vez de 200 con un campo "degraded" es deliberada: un balanceador, un `healthcheck` de Docker o un test de smoke deben distinguir "vivo" de "sano" mirando solo el código de estado. Y la decisión de registrar el error en el log viene del incidente de hoy (sección 9): un 503 sin motivo en el log es indiagnosticable desde fuera del contenedor.

**Cómo se resuelve `@dungeon/shared`.** Hay un detalle del monorepo que conviene entender porque lo verás en varios ficheros de configuración. `@dungeon/shared` es el nombre del paquete `packages/shared`, y en [packages/shared/package.json](../../packages/shared/package.json) declara que su código "oficial" está en `dist/index.js` (JavaScript compilado). Pero en desarrollo nadie quiere compilar `shared` cada vez que cambia una línea, así que:

| Contexto                        | Cómo encuentra `@dungeon/shared`                                                                                                                                                                                                                         | Dónde está configurado                                                                                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comprobación de tipos (`tsc`)   | `paths` del tsconfig apunta al fuente `packages/shared/src/index.ts`                                                                                                                                                                                     | [apps/api/tsconfig.json](../../apps/api/tsconfig.json), [apps/web/tsconfig.json](../../apps/web/tsconfig.json), [tests/e2e/tsconfig.json](../../tests/e2e/tsconfig.json)                            |
| Vite y Vitest                   | un `alias` con la misma ruta                                                                                                                                                                                                                             | [apps/web/vite.config.ts](../../apps/web/vite.config.ts), [apps/api/vitest.config.ts](../../apps/api/vitest.config.ts), [vitest.integration.config.ts](../../apps/api/vitest.integration.config.ts) |
| API en desarrollo (`tsx watch`) | `tsx` ejecuta TypeScript directamente y respeta `paths`                                                                                                                                                                                                  | [apps/api/package.json](../../apps/api/package.json), script `dev`                                                                                                                                  |
| Playwright                      | su cargador de TypeScript respeta `paths`                                                                                                                                                                                                                | [tests/e2e/tsconfig.json](../../tests/e2e/tsconfig.json)                                                                                                                                            |
| Producción (contenedor)         | el build de la API usa [tsconfig.build.json](../../apps/api/tsconfig.build.json), que vacía `paths`; el JavaScript resultante importa `@dungeon/shared` como un paquete normal, que resuelve a `packages/shared/dist`, construido antes en el Dockerfile | [apps/api/Dockerfile](../../apps/api/Dockerfile): `pnpm --filter @dungeon/shared build` antes de `pnpm --filter api build`                                                                          |

Lo que no he podido verificar leyendo un fichero de configuración, sino solo por evidencia indirecta: que `tsx` y Playwright resuelven `paths` sin que exista `dist`. La evidencia es que el job E2E de CI arranca la API con `pnpm --filter api dev` sin construir `shared` y los tests pasan. Si algún día `pnpm dev` falla con "Cannot find module '@dungeon/shared'", esta tabla es el primer sitio donde mirar.

Las decisiones de arquitectura están en los ADRs ([índice](../adr/README.md)): [0001](../adr/0001-monorepo-fastify-react-prisma.md) pila y monorepo, [0002](../adr/0002-gitlab-flow-with-environment-branches.md) ramas, [0003](../adr/0003-test-levels-and-ownership.md) niveles de test. Y hay un resumen en [docs/architecture/overview.md](../architecture/overview.md). Un **ADR** (Architecture Decision Record) es un documento corto con Contexto, Decisión, Consecuencias y Alternativas descartadas; no se edita después de aceptado, se escribe otro que lo sustituye. Léelos cuando quieras entender un "por qué".

## 5. Mapa del repositorio: qué es cada fichero y por qué existe

Leyenda de la columna "Cuándo lo tocas": **tuyo** = eres el dueño; **lees** = lo lees para probar o entender, normalmente no lo editas; **raro** = solo con el TL.

### Raíz

| Fichero                                                                     | Qué es                                                                                                                                                                                                                                                                                          | Cuándo lo tocas |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| [CLAUDE.md](../../CLAUDE.md)                                                | Reglas de la simulación y del mentor, convenciones de ingeniería, tabla de la documentación viva. Lo lee Claude al arrancar                                                                                                                                                                     | lees            |
| [README.md](../../README.md)                                                | Índice del proyecto: qué es, arranque en 5 minutos, mapa de carpetas, enlaces                                                                                                                                                                                                                   | lees            |
| [CONTRIBUTING.md](../../CONTRIBUTING.md)                                    | Ramas, commits, PRs, Definition of Done y labels                                                                                                                                                                                                                                                | lees            |
| [package.json](../../package.json)                                          | Paquete raíz: scripts que delegan en los paquetes (ver tabla siguiente), herramientas comunes (ESLint, Prettier, TypeScript) y `packageManager: pnpm@12.9.1`, que fija la versión de pnpm                                                                                                       | lees            |
| [pnpm-workspace.yaml](../../pnpm-workspace.yaml)                            | Declara los paquetes del monorepo y la sección `allowBuilds`: pnpm bloquea por defecto los scripts de instalación de las dependencias (defensa contra ataques a la cadena de suministro) y aquí se permiten solo a `prisma`, `@prisma/client`, `@prisma/engines` y `esbuild`, que los necesitan | raro            |
| `pnpm-lock.yaml`                                                            | Versiones exactas instaladas. CI instala con `--frozen-lockfile`: si no coincide con `package.json`, falla                                                                                                                                                                                      | nunca a mano    |
| [eslint.config.js](../../eslint.config.js)                                  | Reglas de ESLint (analizador estático): recomendadas de JS y TypeScript, `consistent-type-imports` (los tipos se importan con `import type`), variables sin usar prohibidas salvo que empiecen por `_`, y la configuración de Prettier al final para que no choquen                             | raro            |
| [.prettierrc](../../.prettierrc) y [.prettierignore](../../.prettierignore) | Formato automático: punto y coma, comillas simples, 100 columnas, 2 espacios. CI ejecuta `prettier --check`; si tu Markdown no está formateado, CI falla (le pasó hoy a la PM, ver sección 9)                                                                                                   | lees            |
| [tsconfig.base.json](../../tsconfig.base.json)                              | Opciones de TypeScript que heredan todos los paquetes: `strict`, `noUncheckedIndexedAccess` (acceder a `array[i]` devuelve `T \| undefined`), target ES2022                                                                                                                                     | raro            |
| [.nvmrc](../../.nvmrc)                                                      | Contiene `22`: la versión de Node que `nvm use` activa y que CI instala                                                                                                                                                                                                                         | nunca           |
| [.editorconfig](../../.editorconfig)                                        | Le dice a cualquier editor: UTF-8, saltos de línea LF, 2 espacios, línea final                                                                                                                                                                                                                  | nunca           |
| [.gitignore](../../.gitignore)                                              | Lo que git no debe versionar: `node_modules`, `dist`, `.env` (secretos), `playwright-report/`, `test-results/`, `coverage/`                                                                                                                                                                     | raro            |
| [docker-compose.yml](../../docker-compose.yml)                              | Entorno dev: solo PostgreSQL                                                                                                                                                                                                                                                                    | lees            |
| [docker-compose.staging.yml](../../docker-compose.staging.yml)              | Entorno staging completo en contenedores                                                                                                                                                                                                                                                        | lees            |
| [docker-compose.production.yml](../../docker-compose.production.yml)        | Entorno production completo en contenedores                                                                                                                                                                                                                                                     | lees            |

**Scripts del `package.json` raíz, uno a uno:**

| Script                  | Comando real                                                   | Qué hace                                                                                                  |
| ----------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm dev`              | `pnpm --parallel --filter api --filter web dev`                | Arranca la API (`tsx watch`, :3000) y la web (Vite, :5173) a la vez, con recarga automática               |
| `pnpm build`            | `pnpm -r build`                                                | Compila todos los paquetes (shared a `dist`, api a `dist`, web a `dist`)                                  |
| `pnpm lint`             | `eslint .`                                                     | Análisis estático de todo el repo                                                                         |
| `pnpm format`           | `prettier --write .`                                           | Formatea todo. Úsalo antes de cada commit de Markdown o TypeScript                                        |
| `pnpm format:check`     | `prettier --check .`                                           | Lo que ejecuta CI: falla si algo no está formateado                                                       |
| `pnpm typecheck`        | `pnpm -r typecheck`                                            | Comprueba tipos en todos los paquetes sin generar ficheros                                                |
| `pnpm test`             | `pnpm --filter api --filter web --filter @dungeon/shared test` | Tests unitarios (Vitest) de api, web y shared. No necesita base de datos                                  |
| `pnpm test:integration` | `pnpm --filter api test:integration`                           | Tests de integración de la API contra PostgreSQL real (necesita `pnpm db:up` y `pnpm db:deploy`)          |
| `pnpm test:e2e`         | `pnpm --filter e2e test`                                       | Toda la suite de Playwright; arranca api y web por ti salvo `E2E_NO_SERVER=1`                             |
| `pnpm test:smoke`       | `pnpm --filter e2e test:smoke`                                 | Solo los tests etiquetados `@smoke`                                                                       |
| `pnpm db:up`            | `docker compose up -d db`                                      | Arranca PostgreSQL de desarrollo en segundo plano                                                         |
| `pnpm db:down`          | `docker compose down`                                          | Para los contenedores de desarrollo (los datos persisten en el volumen `db-dev-data`)                     |
| `pnpm db:migrate`       | `pnpm --filter api db:migrate:dev` (`prisma migrate dev`)      | Para el dev: tras editar `schema.prisma`, genera una migración nueva y la aplica. Tú no lo necesitas      |
| `pnpm db:deploy`        | `pnpm --filter api db:migrate` (`prisma migrate deploy`)       | Aplica las migraciones pendientes sin generar nada. Es lo que usas tú y lo que usan CI y los contenedores |

### `apps/api` (la API; dueño: el dev, con el TL)

| Fichero                                                                                                                          | Qué es                                                                                                                                                                               | Cuándo lo tocas |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| [package.json](../../apps/api/package.json)                                                                                      | Scripts de la API (`dev`, `build`, `start`, `test`, `test:integration`, `db:*`) y dependencias: fastify, @fastify/swagger(-ui), fastify-type-provider-zod, @prisma/client, zod       | lees            |
| [.env.example](../../apps/api/.env.example)                                                                                      | Plantilla de variables de entorno: `DATABASE_URL`, `PORT`, `HOST`, `APP_ENV`, `LOG_LEVEL`. Se copia a `.env` (ignorado por git)                                                      | lees            |
| [Dockerfile](../../apps/api/Dockerfile)                                                                                          | Imagen de la API en tres etapas: base (Node 22 Alpine + openssl + corepack), build (instala, compila shared y api, genera el cliente Prisma), runtime (aplica migraciones y arranca) | lees            |
| [prisma/schema.prisma](../../apps/api/prisma/schema.prisma)                                                                      | Modelo de datos: `User` (email único, rol OWNER/STAFF/CUSTOMER, hash de contraseña), `Venue` (slug único, zona horaria, dueño), `Room` (nombre único por venue, capacidad, duración) | lees            |
| [prisma/migrations/20261004000000_init/migration.sql](../../apps/api/prisma/migrations/20261004000000_init/migration.sql)        | El SQL de la primera migración. Cada historia que cambie el modelo añadirá una carpeta aquí                                                                                          | lees            |
| [src/server.ts](../../apps/api/src/server.ts)                                                                                    | Punto de entrada del proceso: carga config, crea Prisma, llama a `buildApp`, escucha en el puerto, apaga limpio con SIGINT/SIGTERM                                                   | lees            |
| [src/app.ts](../../apps/api/src/app.ts)                                                                                          | `buildApp(deps)`: crea Fastify, registra zod como validador, swagger en `/docs`, y las rutas. Define el puerto `Database`                                                            | lees            |
| [src/config.ts](../../apps/api/src/config.ts)                                                                                    | Valida `process.env` con zod al arrancar; si falta `DATABASE_URL`, el proceso muere con un mensaje claro                                                                             | lees            |
| [src/db.ts](../../apps/api/src/db.ts)                                                                                            | Adapta `PrismaClient` al puerto `Database` (`ping` = `SELECT 1`)                                                                                                                     | lees            |
| [src/routes/health.ts](../../apps/api/src/routes/health.ts)                                                                      | La ruta `GET /health`. Patrón que seguirán todas las rutas: esquema zod de respuesta + handler                                                                                       | lees            |
| [src/routes/health.test.ts](../../apps/api/src/routes/health.test.ts)                                                            | Test unitario de la ruta (3 casos: 200, 503, OpenAPI expone `/health`)                                                                                                               | lees            |
| [test/integration/health.test.ts](../../apps/api/test/integration/health.test.ts)                                                | Test de integración con PostgreSQL real (1 caso)                                                                                                                                     | compartido      |
| [tsconfig.json](../../apps/api/tsconfig.json), [tsconfig.build.json](../../apps/api/tsconfig.build.json)                         | Tipos para desarrollo (con `paths`) y para build (sin `paths`, excluye tests)                                                                                                        | raro            |
| [vitest.config.ts](../../apps/api/vitest.config.ts), [vitest.integration.config.ts](../../apps/api/vitest.integration.config.ts) | Dos configuraciones de Vitest: unitarios (`src/**/*.test.ts`) e integración (`test/integration/**`, sin paralelismo entre ficheros, timeout 20 s)                                    | compartido      |

La carpeta `apps/api/test/integration` es compartida contigo (ADR 0003): escribirás tests ahí cuando una validación necesite la base de datos real.

### `apps/web` (la web; dueño: el dev)

| Fichero                                               | Qué es                                                                                                                                                         | Cuándo lo tocas |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| [package.json](../../apps/web/package.json)           | Scripts (`dev` = `vite --port 5173 --strictPort`, `build`, `test`) y dependencias: react 19, vite, vitest, Testing Library, jsdom                              | lees            |
| [index.html](../../apps/web/index.html)               | La única página HTML; carga `src/main.tsx`                                                                                                                     | lees            |
| [vite.config.ts](../../apps/web/vite.config.ts)       | Plugin React, alias de `@dungeon/shared`, proxy de `/api` a `http://localhost:3000` (configurable con `API_PROXY_TARGET`), y configuración de Vitest con jsdom | lees            |
| [nginx.conf](../../apps/web/nginx.conf)               | Para los contenedores: sirve `dist/`, cualquier ruta desconocida devuelve `index.html` (SPA), y `/api/` se reenvía a `http://api:3000/`                        | lees            |
| [Dockerfile](../../apps/web/Dockerfile)               | Etapa build (pnpm + `vite build`) y etapa runtime (nginx 1.27 Alpine con el `dist`)                                                                            | lees            |
| [src/main.tsx](../../apps/web/src/main.tsx)           | Monta `<App />` en `#root`                                                                                                                                     | lees            |
| [src/App.tsx](../../apps/web/src/App.tsx)             | La página de inicio: título y una "píldora" con el estado de la API (`checking`, `ok`, `degraded`, `unreachable`). Fíjate en los `data-testid`                 | lees            |
| [src/App.test.tsx](../../apps/web/src/App.test.tsx)   | Test unitario del componente con `fetch` simulado (3 casos)                                                                                                    | lees            |
| [src/api/client.ts](../../apps/web/src/api/client.ts) | `fetchHealth()`: llama a `${API_BASE_URL}/health` (por defecto `/api`), acepta 200 y 503, parsea con el esquema compartido                                     | lees            |
| [src/styles.css](../../apps/web/src/styles.css)       | Estilos                                                                                                                                                        | nunca           |
| [src/test/setup.ts](../../apps/web/src/test/setup.ts) | Carga los matchers de jest-dom (`toBeInTheDocument`) en Vitest                                                                                                 | nunca           |
| [src/vite-env.d.ts](../../apps/web/src/vite-env.d.ts) | Declara el tipo de `import.meta.env.VITE_API_URL`                                                                                                              | nunca           |
| [tsconfig.json](../../apps/web/tsconfig.json)         | Tipos para navegador (`DOM`), JSX, `paths` a shared                                                                                                            | raro            |

### `packages/shared` (contratos; dueño: dev y TL, tú los consumes)

| Fichero                                                                                                          | Qué es                                                                                | Cuándo lo tocas |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------- |
| [package.json](../../packages/shared/package.json)                                                               | Nombre `@dungeon/shared`, entrada en `dist/`, scripts `build`, `typecheck`, `test`    | raro            |
| [src/index.ts](../../packages/shared/src/index.ts)                                                               | Reexporta todo                                                                        | lees            |
| [src/health.ts](../../packages/shared/src/health.ts)                                                             | `HealthResponseSchema` y el tipo `HealthResponse`                                     | lees            |
| [src/domain.ts](../../packages/shared/src/domain.ts)                                                             | `UserRoleSchema`, `VenueSchema` (slug en kebab-case, zona horaria IANA), `RoomSchema` | lees            |
| [src/domain.test.ts](../../packages/shared/src/domain.test.ts)                                                   | Test unitario de `VenueSchema` (2 casos)                                              | lees            |
| [tsconfig.json](../../packages/shared/tsconfig.json), [vitest.config.ts](../../packages/shared/vitest.config.ts) | Compila a `dist` con declaraciones de tipos; tests unitarios                          | raro            |

### `tests/e2e` (tests de caja negra; **tuyo**)

| Fichero                                                                          | Qué es                                                                                                                                                                                                                                          | Cuándo lo tocas |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| [package.json](../../tests/e2e/package.json)                                     | Paquete `e2e`: `test`, `test:smoke` (`--grep @smoke`), `test:api`, `test:web` (por project), `test:ui`, `report`                                                                                                                                | **tuyo**        |
| [playwright.config.ts](../../tests/e2e/playwright.config.ts)                     | Dos projects (`api`: `*.api.spec.ts`; `web`: `*.web.spec.ts` en Desktop Chrome), `API_URL` y `WEB_URL` por variables de entorno, arranque automático de api y web salvo `E2E_NO_SERVER=1`, trace/vídeo/captura solo en fallo, 1 reintento en CI | **tuyo**        |
| [tests/smoke/health.api.spec.ts](../../tests/e2e/tests/smoke/health.api.spec.ts) | Smoke de API: `/health` es 200 y cumple el contrato; `/docs/json` es OpenAPI 3 y documenta `/health` (2 casos)                                                                                                                                  | **tuyo**        |
| [tests/smoke/home.web.spec.ts](../../tests/e2e/tests/smoke/home.web.spec.ts)     | Smoke de navegador: la home muestra el título y la píldora de la API en `ok` (1 caso)                                                                                                                                                           | **tuyo**        |
| [tsconfig.json](../../tests/e2e/tsconfig.json)                                   | Tipos para los tests; incluye una carpeta `fixtures` que aún no existe, pensada para tus fixtures                                                                                                                                               | **tuyo**        |

El dev tiene prohibido tocar `tests/e2e` salvo que tú se lo pidas; a cambio, se compromete a poner `data-testid` en todos los elementos interactivos de la web.

### `.github` (CI/CD y plantillas; dueño: TL contigo)

| Fichero                                                                          | Qué es                                                                                                             | Cuándo lo tocas    |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------ |
| [workflows/ci.yml](../../.github/workflows/ci.yml)                               | Pipeline de integración continua (sección 7)                                                                       | propondrás cambios |
| [workflows/deploy-staging.yml](../../.github/workflows/deploy-staging.yml)       | Despliegue simulado de staging al hacer push a `staging`                                                           | lees               |
| [workflows/deploy-production.yml](../../.github/workflows/deploy-production.yml) | Despliegue simulado de production, con aprobación manual tuya                                                      | lees               |
| [actions/setup/action.yml](../../.github/actions/setup/action.yml)               | Acción compuesta reutilizada por todos los jobs: instala pnpm, Node 22 (de `.nvmrc`) con caché, y las dependencias | raro               |
| [PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md)               | Plantilla de PR: `Closes #`, What, How, How to test, Notes, checklist                                              | la rellenas        |
| [ISSUE_TEMPLATE/bug_report.md](../../.github/ISSUE_TEMPLATE/bug_report.md)       | Plantilla de bug: Environment, Steps, Expected, Actual, Evidence, Severity/Priority, Suspected cause               | **tuya**           |
| [ISSUE_TEMPLATE/user_story.md](../../.github/ISSUE_TEMPLATE/user_story.md)       | Plantilla de historia (la usa la PM)                                                                               | lees               |
| [ISSUE_TEMPLATE/task.md](../../.github/ISSUE_TEMPLATE/task.md)                   | Plantilla de tarea técnica o de proceso (la usarás para acciones de retro)                                         | la rellenas        |

### `.claude` (la simulación)

| Fichero                                                            | Qué es                                    | Cuándo lo tocas  |
| ------------------------------------------------------------------ | ----------------------------------------- | ---------------- |
| `agents/product-manager.md`, `tech-lead.md`, `senior-developer.md` | Los tres personajes del squad (sección 3) | lees solo el rol |
| `skills/<ceremonia>/SKILL.md`                                      | Las siete ceremonias (sección 3)          | lees             |

### `docs` (documentación viva)

| Carpeta o fichero                                                                           | Qué es                                                                                                                              | Cuándo lo tocas |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| [README.md](../README.md)                                                                   | Índice de la documentación, organizada según Diátaxis (tutorial, guía práctica, referencia, explicación)                            | lees            |
| [product/vision.md](../product/vision.md), [product/roadmap.md](../product/roadmap.md)      | Visión y roadmap (PM)                                                                                                               | lees            |
| [adr/](../adr/README.md)                                                                    | Las tres decisiones de arquitectura (TL)                                                                                            | lees            |
| [architecture/overview.md](../architecture/overview.md)                                     | Cómo funciona el sistema de punta a punta                                                                                           | lees            |
| [testing/strategy.md](../testing/strategy.md)                                               | **La estrategia de pruebas. Es un esqueleto con nueve secciones vacías; rellenarlo es tu primer entregable del Sprint 1**           | **tuyo**        |
| [testing/templates/test-plan.md](../testing/templates/test-plan.md)                         | Plantilla del plan de pruebas por historia (matriz de riesgo, qué se prueba a qué nivel, qué no, datos, smoke, criterios de salida) | **tuyo**        |
| `testing/test-plans/sprint-NN/`, `testing/exploratory/`                                     | Carpetas que crearás tú en `/planning` y `/release`; todavía no existen                                                             | **tuyo**        |
| [runbooks/local-development.md](../runbooks/local-development.md)                           | Guía práctica: arrancar en local, comandos diarios, levantar staging y production en tu máquina                                     | lees, mejoras   |
| [runbooks/release.md](../runbooks/release.md)                                               | Guía práctica del release: readiness, promoción a staging, validación, promoción a production, rollback                             | lees, mejoras   |
| [learning/README.md](README.md), [curriculum.md](curriculum.md), [glossary.md](glossary.md) | La capa pedagógica: índice, currículo por sprint, glosario inglés/español                                                           | compartido      |
| [learning/sprint-00.md](sprint-00.md)                                                       | Diario del Sprint 0; habrá un `sprint-NN.md` por sprint, con tus notas de refinement, planning, reviews, release y retro            | compartido      |
| [learning/concepts/](concepts/README.md)                                                    | Fichas de concepto (problema, concepto, cómo lo aplicamos aquí, trampas, lecturas). Vacío todavía                                   | compartido      |
| [postmortems/](../postmortems/README.md)                                                    | Un análisis por fallo complejo investigado. Hoy hay uno, escrito por el TL como ejemplo; a partir del Sprint 1 los escribes tú      | **tuyo**        |
| [releases/README.md](../releases/README.md)                                                 | Notas de release por versión; las escribirás en `/release`                                                                          | **tuyo**        |

`CLAUDE.md` menciona también `docs/api/` (referencia generada desde OpenAPI); esa carpeta aún no existe.

## 6. Niveles de test y quién es dueño de cada uno

Esto viene de [ADR 0003](../adr/0003-test-levels-and-ownership.md). La idea central: cada nivel responde a una pregunta distinta, cuesta distinto y tiene un dueño. Cuando dudes "¿dónde va este test?", la tabla decide.

| Nivel            | Pregunta que responde                                                    | Ejemplo real hoy                                                                                                                                                                                                             | Cómo se ejecuta                                       | Dueño    |
| ---------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| Unitario         | ¿Esta función o componente se comporta bien con estas entradas?          | [apps/api/src/routes/health.test.ts](../../apps/api/src/routes/health.test.ts), [apps/web/src/App.test.tsx](../../apps/web/src/App.test.tsx), [packages/shared/src/domain.test.ts](../../packages/shared/src/domain.test.ts) | `pnpm test` (sin base de datos)                       | Dev      |
| Integración      | ¿La API se comporta bien con una base de datos real?                     | [apps/api/test/integration/health.test.ts](../../apps/api/test/integration/health.test.ts)                                                                                                                                   | `pnpm test:integration` (necesita PostgreSQL migrado) | Dev + tú |
| API (caja negra) | ¿El servicio en ejecución cumple su contrato por HTTP?                   | [tests/e2e/tests/smoke/health.api.spec.ts](../../tests/e2e/tests/smoke/health.api.spec.ts)                                                                                                                                   | `pnpm --filter e2e test:api`                          | **Tú**   |
| E2E (navegador)  | ¿Los recorridos críticos de usuario funcionan con la UI y la API reales? | [tests/e2e/tests/smoke/home.web.spec.ts](../../tests/e2e/tests/smoke/home.web.spec.ts)                                                                                                                                       | `pnpm --filter e2e test:web`                          | **Tú**   |
| Smoke            | ¿Está vivo el despliegue?                                                | Los tres tests anteriores de `tests/e2e`, por su etiqueta                                                                                                                                                                    | `pnpm test:smoke`                                     | **Tú**   |

Observa qué distingue a los niveles leyendo los ficheros:

- El **unitario** de la API falsea la base de datos (`ping` que lanza o no) y usa `app.inject`; prueba el 503 sin apagar nada. El de la web falsea `fetch` con `vi.stubGlobal` y renderiza el componente en jsdom (un DOM simulado, sin navegador).
- El de **integración** es el mismo `buildApp` con Prisma real; sigue sin abrir puerto. Solo tiene un caso porque solo hay una ruta. Cuando lleguen `register` y `login`, aquí es donde se prueba "la restricción de email único existe de verdad en la base de datos".
- Los de **API caja negra** y **E2E** son los únicos que atacan un servidor en ejecución por la red, como lo haría un cliente. No importan nada de `apps/`; solo el esquema compartido. Por eso valen para dev, staging y production por igual.
- **Smoke** no es un nivel ni una carpeta: es una **etiqueta**. En Playwright, `test.describe('API health', { tag: '@smoke' }, ...)` añade `@smoke` al título, y `playwright test --grep @smoke` selecciona solo esos. La decisión (en [sprint-00.md](sprint-00.md)) es que cualquier test se puede promocionar a smoke sin moverlo de sitio. La disciplina es tuya: smoke debe ser el mínimo que demuestra que el despliegue está vivo, pequeño y rápido, porque corre en cada despliegue y bloquea el release si falla.

En CI cada nivel es un job separado (sección 7) para que un fallo se atribuya rápido: si falla `Unit tests` es el código; si falla `Integration` suele ser una migración o una restricción; si falla `E2E` puede ser cualquier cosa, incluido el entorno.

Los tests de navegador usan `data-testid` o roles accesibles como localizadores, nunca selectores CSS frágiles. Lo verás en [App.tsx](../../apps/web/src/App.tsx): `data-testid="app-title"`, `data-testid="api-status"` con un atributo `data-status` que el test comprueba.

## 7. Git y GitHub: qué usamos y cómo

**GitLab Flow con ramas de entorno** ([ADR 0002](../adr/0002-gitlab-flow-with-environment-branches.md)). Hay tres ramas de larga vida, cada una representa un entorno, y el código se promociona de una a otra con PRs:

```
 feature/12-register ---PR---> main ---PR "release"---> staging ---PR "release"---> production
 fix/40-dup-email    ---PR--/    ^                                                      |
 docs/..., chore/..., ci/...     |                                                      |
                                 +------------ hotfix/<slug> (sale de production) ------+
                                               se fusiona en production y vuelve a main
```

- `main`: integración; siempre verde. Todo entra por PR con CI en verde, revisión del TL y tu validación.
- `staging`: candidato a release. El PR `main → staging` dispara el despliegue de staging y el smoke. Ahí haces regresión y exploratorio, y escribes el informe de validación como comentario del PR.
- `production`: lo que usan los clientes. El PR `staging → production` dispara el despliegue de production, que espera tu aprobación manual. Cada release se etiqueta `vX.Y.Z`.
- Las promociones son **fast-forward** (ver glosario): `staging` y `production` nunca contienen commits que no estén en `main`. La excepción son los hotfixes, que salen de `production` y vuelven a `main`.

**Qué está protegido** (verificado hoy con la API de GitHub). Las tres ramas `main`, `staging` y `production` tienen la misma protección: se exige PR, los cinco jobs de CI deben estar en verde (`Lint, format, typecheck`, `Unit tests`, `Integration tests (API + PostgreSQL)`, `E2E (Playwright, API + web)`, `Docs links`), la rama debe estar al día con la base antes de fusionar (`strict`), y están prohibidos el force-push y el borrado. No se exige un número mínimo de aprobaciones (la revisión del TL y tu validación son disciplina de equipo, no una regla de GitHub), y la protección no se aplica a administradores, es decir, tú podrías saltártela; no lo hagas.

**Conventional Commits.** Cada mensaje de commit sigue `tipo(ámbito): resumen`: `feat(api): reject bookings beyond room capacity`, `fix(web): ...`, `test(e2e): ...`, `docs: ...`, `ci: ...`, `chore: ...`. Ámbitos: `api`, `web`, `shared`, `e2e`, `ci`, `docs`, `infra`. El cuerpo explica el porqué. Todos los commits terminan con `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

**Identidades de autor.** Este es el `git log` real de `main` ahora mismo (`git log --format='%h %an %s'`):

```
6277dc4 Jordan Okafor (Tech Lead)  docs: add Sprint 0 postmortem and fix command references in simulation files
9186a07 Maya Chen (PM)             style(docs): format product docs with Prettier
67a8227 Maya Chen (PM)             docs(product): add vision and Sprint 1-5 roadmap
dccf284 antoniogomez               Merge pull request #1 from antoniogomezgallardo/fix/staging-api-healthcheck
8db7524 Jordan Okafor (Tech Lead)  fix(infra): make the API container healthy in staging and production
43c3059 Antonio Gomez Gallardo     chore: add squad agents and ceremony skills for the QE simulation
523c132 Jordan Okafor (Tech Lead)  docs: add ADRs, runbooks, test strategy skeleton and learning layer
777e20a Jordan Okafor (Tech Lead)  ci: add CI pipeline and environment deployment workflows
bd110c6 Jordan Okafor (Tech Lead)  chore: bootstrap pnpm monorepo with api, web, shared and e2e
```

Sam Rivera aún no ha hecho ningún commit: empezará en el Sprint 1. Fíjate en que PR #1 entró con un merge commit (`dccf284`) y los PRs #7 y #8 entraron sin merge commit (sus commits aparecen tal cual en la historia). Las dos cosas son válidas para `main`; para las promociones a `staging` y `production` el runbook pide fast-forward.

**Plantillas.** Los PRs usan [PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md): `Closes #n`, What, How, How to test, Notes y un checklist que incluye "Label `status:needs-qa` set". Las issues tienen tres plantillas: [user story](../../.github/ISSUE_TEMPLATE/user_story.md), [bug report](../../.github/ISSUE_TEMPLATE/bug_report.md) y [task](../../.github/ISSUE_TEMPLATE/task.md). El bug report es tu plantilla principal: título `<area>: <symptom>`, y cuerpo con entorno, pasos, esperado, actual, evidencia, severidad (S1-S4) y prioridad (P0-P3), y causa sospechada opcional.

**Labels** (lista real del repositorio hoy):

| Label                 | Significado                                      |
| --------------------- | ------------------------------------------------ |
| `type:story`          | Historia de usuario                              |
| `type:bug`            | Defecto                                          |
| `type:task`           | Tarea técnica o de proceso                       |
| `type:tech-debt`      | Atajo conocido que hay que pagar                 |
| `priority:P0`         | Déjalo todo                                      |
| `priority:P1`         | Este sprint, antes que nada                      |
| `priority:P2`         | Este sprint                                      |
| `priority:P3`         | Cuando haya tiempo                               |
| `risk:high`           | Probabilidad por impacto alta: pruebas profundas |
| `risk:medium`         | Riesgo moderado                                  |
| `risk:low`            | Riesgo bajo: comprobaciones baratas              |
| `area:api`            | API Fastify                                      |
| `area:web`            | Web React                                        |
| `area:infra`          | Docker, CI/CD, entornos                          |
| `area:tests`          | Suites y herramientas de test                    |
| `area:docs`           | Documentación                                    |
| `status:needs-triage` | Nuevo, sin evaluar (lo pone la plantilla de bug) |
| `status:needs-qa`     | Esperando tu validación                          |
| `status:blocked`      | No puede avanzar                                 |
| `accessibility`       | Barrera para personas con discapacidad           |

Las de `risk:*` las pones tú en `/planning`. `status:needs-qa` la pone el dev al abrir el PR y la quitas tú al validar.

**Milestones.** Existen `Sprint 1` a `Sprint 5`, todos abiertos, sin fecha, con la descripción "See docs/learning/curriculum.md". Las historias del Sprint 1 ya están en su milestone (sección 10).

**Environments de GitHub.** Un _environment_ es un nombre (`staging`, `production`) al que un job de workflow se asocia; GitHub registra cada despliegue y permite poner reglas. Hoy: `staging` no tiene reglas; `production` exige un **revisor obligatorio: tú** (`antoniogomezgallardo`). Cuando el workflow de production llegue a su job, se quedará en espera hasta que lo apruebes en la pestaña Actions. Es tu firma de release.

**GitHub Actions.** Es el sistema de CI/CD de GitHub: un _workflow_ es un fichero YAML en `.github/workflows/` que se dispara por eventos y ejecuta _jobs_ (cada uno en una máquina virtual limpia, aquí `ubuntu-latest`) compuestos de _steps_.

[ci.yml](../../.github/workflows/ci.yml) se dispara en cada PR hacia `main`, `staging` o `production` y en cada push a `main`. Tiene `concurrency` con `cancel-in-progress`: si llega otro push a la misma rama mientras corre, cancela el anterior (hoy pasó: la ejecución de `main` tras el PR #7 se canceló porque el PR #8 entró 40 segundos después). Cinco jobs independientes, todos empiezan con `checkout` y la acción compuesta `setup`:

| Job                                    | Qué hace                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Lint, format, typecheck`              | `prisma generate` (el cliente Prisma se genera, no se versiona), `pnpm lint`, `pnpm format:check`, `pnpm typecheck`                                                                                  |
| `Unit tests`                           | `pnpm test`                                                                                                                                                                                          |
| `Integration tests (API + PostgreSQL)` | Levanta un contenedor PostgreSQL como _service_ del job, aplica migraciones (`db:migrate`), `pnpm test:integration`                                                                                  |
| `E2E (Playwright, API + web)`          | PostgreSQL como service, migraciones, instala Chromium, `pnpm test:e2e` (Playwright arranca api y web como procesos), y sube `tests/e2e/playwright-report` como artefacto (14 días) incluso si falla |
| `Docs links`                           | `lychee` en modo offline comprueba que todos los enlaces relativos de todos los `.md` apuntan a ficheros que existen, incluidos los `#anchors`. Un enlace roto rompe CI                              |

[.github/actions/setup/action.yml](../../.github/actions/setup/action.yml) es una **acción compuesta**: un trozo de workflow reutilizable. Instala pnpm, Node 22 leyendo `.nvmrc` con caché de dependencias, y `pnpm install --frozen-lockfile`. Está en un sitio para no repetir tres pasos en ocho jobs.

[deploy-staging.yml](../../.github/workflows/deploy-staging.yml) se dispara con push a `staging` (es decir, al fusionar el PR de release) y también manualmente. Un solo job asociado al environment `staging`, con `concurrency` sin cancelación (dos despliegues nunca se solapan):

| Step                              | Qué hace                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Build and start the staging stack | `docker compose -f docker-compose.staging.yml up -d --build --wait`: construye las imágenes y espera a que todos los contenedores estén sanos |
| Diagnose unhealthy containers     | Solo si el anterior falla: `docker compose ps -a` y el log de healthcheck de cada contenedor (añadido tras el incidente de hoy)               |
| Install Playwright browsers       | Chromium                                                                                                                                      |
| Smoke tests against staging       | `pnpm test:smoke` con `E2E_NO_SERVER=1`, `API_URL=http://localhost:3100`, `WEB_URL=http://localhost:8100`                                     |
| Collect container logs            | Siempre (salvo cancelación): `docker compose logs` a `staging-logs.txt`                                                                       |
| Upload smoke report and logs      | Artefacto `staging-smoke` con el informe de Playwright y los logs (14 días)                                                                   |
| Tear down                         | Siempre: `docker compose down -v`                                                                                                             |

[deploy-production.yml](../../.github/workflows/deploy-production.yml) es idéntico con `docker-compose.production.yml`, puertos 3200/8200, artefacto `production-smoke` (30 días) y el environment `production`, que es el que espera tu aprobación.

**`workflow_dispatch`** es el evento "lanzar a mano": permite ejecutar un workflow desde la pestaña Actions o con `gh workflow run deploy-staging.yml --ref <rama>` eligiendo la rama. Se añadió en el PR #1 para poder **ensayar un despliegue desde una rama antes de fusionar**, en lugar de "fusionar y rezar". Hoy se usó exactamente así: el fix se ensayó desde `fix/staging-api-healthcheck` y pasó antes de entrar en `main`.

**Dónde ver los artefactos.** En la página de cada ejecución (pestaña Actions, o `gh run view <id>`), abajo, sección "Artifacts": `playwright-report` en CI, `staging-smoke` o `production-smoke` en los despliegues. Se descargan con `gh run download <id>` y el informe se abre con `pnpm --filter e2e report` apuntando a la carpeta descargada, o abriendo `index.html`. En el informe de Playwright, cada test fallido lleva su trace (`trace: 'retain-on-failure'`), que se abre en el Trace Viewer con capturas, red y consola. Los logs de contenedores son el fichero `.txt` dentro del mismo artefacto.

**CI frente a despliegue: no es lo mismo.** Es la lección más importante de hoy. En CI, la API corre como un **proceso Node sobre Ubuntu** (la máquina virtual del runner, con glibc) y PostgreSQL es un contenedor auxiliar. En los despliegues, la API se **construye como imagen Docker sobre `node:22-alpine`** (Alpine usa musl, una librería C distinta, y no trae OpenSSL) y corre dentro de un contenedor con nginx y PostgreSQL al lado. El código es el mismo; el runtime, no. CI estaba verde y el despliegue falló. Por eso el smoke sobre el artefacto real (la imagen) no es opcional, y por eso el runbook te hace reproducir staging en tu máquina.

## 8. Entornos: dev, staging y production

| Entorno    | Fichero                                                              | Qué levanta                                                                                                            | Puertos en tu máquina              | Base de datos        |
| ---------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------- |
| dev        | [docker-compose.yml](../../docker-compose.yml)                       | Solo PostgreSQL 16 (contenedor `dungeon-db-dev`, volumen `db-dev-data`). API y web corren con `pnpm dev` como procesos | api 3000, web 5173, db 5432        | `dungeon_dev`        |
| staging    | [docker-compose.staging.yml](../../docker-compose.staging.yml)       | Proyecto `dungeon-staging`: db + api (imagen de `apps/api/Dockerfile`) + web (nginx)                                   | web 8100, api 3100; db no expuesta | `dungeon_staging`    |
| production | [docker-compose.production.yml](../../docker-compose.production.yml) | Proyecto `dungeon-production`: lo mismo                                                                                | web 8200, api 3200; db no expuesta | `dungeon_production` |

Detalles de staging y production que te importan como QAE:

- **Orden de arranque con healthchecks.** `api` tiene `depends_on: db: condition: service_healthy` y `web` depende de `api` sana. El healthcheck de `api` es un `node -e "fetch('http://localhost:3000/health')..."` que solo cuenta como sano con 2xx; tiene `start_period: 40s` porque el contenedor aplica las migraciones antes de escuchar. `--wait` en el `up` hace que el comando no termine hasta que todo esté sano (o falle).
- **Migraciones al arrancar.** El `CMD` del Dockerfile de la API es `prisma migrate deploy && node dist/server.js`. En una plataforma real sería un paso de release separado; aquí está en el contenedor por simplicidad y así lo documenta el propio Dockerfile.
- **Dentro de la red de Compose** los servicios se llaman por nombre: nginx reenvía `/api/` a `http://api:3000/` y la API conecta a `postgresql://dungeon:dungeon@db:5432/...`. Las credenciales son de juguete; no hay secretos reales en el proyecto.
- **Sin puerto de base de datos en staging y production.** Si necesitas mirar datos ahí, es `docker compose -f docker-compose.staging.yml exec db psql -U dungeon dungeon_staging`.

Levantar y probar un entorno en tu máquina (los mismos comandos que ejecutan los workflows):

```bash
docker compose -f docker-compose.staging.yml up -d --build --wait
E2E_NO_SERVER=1 API_URL=http://localhost:3100 WEB_URL=http://localhost:8100 pnpm test:smoke
docker compose -f docker-compose.staging.yml down -v
```

`E2E_NO_SERVER=1` le dice a [playwright.config.ts](../../tests/e2e/playwright.config.ts) que no arranque api ni web (la sección `webServer` queda `undefined`); `API_URL` y `WEB_URL` cambian el `baseURL` de cada project. Sin esas variables, `pnpm test:smoke` arranca api y web en dev (3000 y 5173) por ti, reutilizando los que ya estén corriendo si no estás en CI. Para production cambia el fichero y los puertos a 3200 y 8200. El `-v` del `down` borra el volumen de datos; sin él, los datos persisten entre arranques.

Dos cosas que no he podido verificar en esta sesión y que debes comprobar tú la primera vez: que `docker compose ... --build` funciona en tu máquina (requiere que tu usuario pueda hablar con Docker, ver sección 11) y cuánto tarda la primera construcción de las imágenes (en CI, el ensayo de hoy desde la rama del fix tardó unos dos minutos de principio a fin, construcción de imágenes y smoke incluidos; en tu máquina la primera vez será más, por la descarga de las imágenes base).

## 9. Cronología de lo que ha pasado hoy (Sprint 0)

Horas en hora local (CEST, UTC+2); el postmortem las da en UTC. Fuentes: `git log`, `gh pr list --state all`, `gh run list`.

| Hora  | Qué pasó                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| antes | Decisiones de partida: tú como QAE con el resto del squad simulado; todo en inglés salvo esta guía; pila TypeScript con monorepo pnpm, Fastify, React, Prisma, Playwright ([ADR 0001](../adr/0001-monorepo-fastify-react-prisma.md)); GitLab Flow ([ADR 0002](../adr/0002-gitlab-flow-with-environment-branches.md)); niveles de test y dueños ([ADR 0003](../adr/0003-test-levels-and-ownership.md)) |
| 23:15 | Repositorio creado en GitHub (público). Cuatro commits iniciales: scaffold del monorepo (`bd110c6`), CI y workflows de despliegue (`777e20a`), ADRs, runbooks, esqueleto de estrategia y capa de aprendizaje (`523c132`), agentes y skills (`43c3059`)                                                                                                                                                |
| 23:16 | Push a `main`: CI verde en los cinco jobs. Se crean las ramas `staging` y `production` apuntando al mismo commit y los environments de GitHub; ambos workflows de despliegue arrancan y **fallan** en `docker compose up --wait`: "container dungeon-staging-api-1 is unhealthy"                                                                                                                      |
| 23:22 | Se descargan los logs de los contenedores del artefacto del run fallido. La API había aplicado migraciones y escuchaba, pero `/health` respondía 503 sin decir por qué                                                                                                                                                                                                                                |
| 23:27 | Rama `fix/staging-api-healthcheck`, [PR #1](https://github.com/antoniogomezgallardo/dungeon-booking/pull/1). Se ensaya el despliegue de staging desde la rama con `workflow_dispatch`: verde, 3 tests de smoke pasan                                                                                                                                                                                  |
| 23:30 | PR #1 fusionado en `main` (merge commit `dccf284`). CI verde                                                                                                                                                                                                                                                                                                                                          |
| 23:31 | La PM escribe visión y roadmap en la rama `docs/product-vision-and-roadmap` y crea las issues [#2 a #6](https://github.com/antoniogomezgallardo/dungeon-booking/milestone/1) del Sprint 1                                                                                                                                                                                                             |
| 23:32 | CI del [PR #7](https://github.com/antoniogomezgallardo/dungeon-booking/pull/7) **falla** en `Lint, format, typecheck`: `prettier --check` encuentra `docs/product/vision.md` sin formatear. La PM añade `style(docs): format product docs with Prettier` y CI pasa                                                                                                                                    |
| 23:35 | El TL escribe el postmortem y corrige referencias a comandos en CLAUDE.md, el agente del dev y el skill de release: [PR #8](https://github.com/antoniogomezgallardo/dungeon-booking/pull/8)                                                                                                                                                                                                           |
| 23:37 | PR #7 fusionado; 40 segundos después, PR #8. La CI de `main` del primero se cancela por `concurrency` y la del segundo termina verde. `main` queda en `6277dc4`                                                                                                                                                                                                                                       |

**El fallo del despliegue y su postmortem.** Léelo entero: [2026-10-04-staging-api-container-unhealthy.md](../postmortems/2026-10-04-staging-api-container-unhealthy.md). Es el ejemplo del formato que usarás tú a partir del Sprint 1, y lo valioso no es la solución sino el camino: cinco hipótesis, tres descartadas con un solo paso (descargar los logs del contenedor). Dos causas que se sumaron:

1. **Faltaba OpenSSL en la imagen Alpine.** El cliente de Prisma (el que usa la API en Node) carga un motor de consultas que necesita OpenSSL; `node:22-alpine` no lo trae. Pero `prisma migrate deploy` es un binario distinto que sí funcionaba, así que las migraciones se aplicaban y el síntoma quedaba escondido detrás de un arranque aparentemente normal. Fix: `apk add --no-cache openssl` en el Dockerfile.
2. **`/health` devolvía 503 sin registrar el motivo.** El error del `ping` se capturaba y se descartaba, así que desde fuera solo se veía "unhealthy". Encima, el healthcheck original con `wget` de busybox falla con cualquier código que no sea 2xx, así que un 503 era indistinguible de "nadie escucha". Fix: el puerto `Database` rechaza con el error real, la ruta lo registra a nivel `warn`, y el healthcheck pasa a `fetch` de Node con `start_period`.

Lecciones que el postmortem deja escritas y que son tuyas: un check que falla debe decir por qué; CI verde no es despliegue verde; ensaya despliegues desde una rama; guarda los artefactos aunque falle. Y una candidata explícita para tu estrategia: un test de smoke que, cuando `/health` esté degradado, falle imprimiendo el cuerpo de la respuesta.

**Estado al cierre.** `main` tiene nueve commits; `staging` y `production` siguen en `43c3059`, es decir, **cinco commits por detrás de `main` (`git rev-list --count origin/staging..main`) y sin el fix del PR #1**. Un despliegue de cualquiera de las dos ramas tal como están volvería a fallar. La primera promoción `main → staging` con `/release` es la que llevará el fix a los entornos; por eso la sección 11 la pone como primera validación de release.

## 10. Backlog del Sprint 1

Issues reales en el milestone `Sprint 1` (`gh issue list --milestone "Sprint 1"`), todas `type:story` y abiertas:

| Issue                                                                  | Título                                                | Prioridad | Área       |
| ---------------------------------------------------------------------- | ----------------------------------------------------- | --------- | ---------- |
| [#2](https://github.com/antoniogomezgallardo/dungeon-booking/issues/2) | Register as owner or customer with email and password | P1        | `area:api` |
| [#3](https://github.com/antoniogomezgallardo/dungeon-booking/issues/3) | Log in with JWT and GET /me                           | P1        | `area:api` |
| [#4](https://github.com/antoniogomezgallardo/dungeon-booking/issues/4) | Owner creates and manages venues                      | P1        | `area:api` |
| [#5](https://github.com/antoniogomezgallardo/dungeon-booking/issues/5) | Owner creates and manages rooms inside a venue        | P2        | `area:api` |
| [#6](https://github.com/antoniogomezgallardo/dungeon-booking/issues/6) | Web: registration, login and My venues pages          | P2        | `area:web` |

Hay una dependencia natural: #3 necesita #2, #4 necesita #3, #5 necesita #4 y #6 necesita #2, #3 y #4. Ninguna tiene aún label de riesgo: se la pones tú en `/planning`.

**Qué se espera de ti en el refinement.** No que valides nada todavía, sino que preguntes como quien va a tener que probarlo. Para cada historia, con la issue abierta delante:

1. **Lee los criterios de aceptación con lupa.** Cada "Given / when / then" debería ser observable por un test. Pregunta por cualquier adjetivo sin número, cualquier error cuya respuesta no esté definida, cualquier regla de negocio implícita.
2. **Busca los casos límite que no están.** Tienes experiencia: valores vacíos, mínimos y máximos, mayúsculas y minúsculas, duplicados, lo que pasa cuando el actor no es quien debería, lo que pasa cuando dos cosas ocurren a la vez, lo que pasa con el tiempo y las zonas horarias. Compara también lo que pide la historia con lo que ya existe en [schema.prisma](../../apps/api/prisma/schema.prisma) y [domain.ts](../../packages/shared/src/domain.ts).
3. **Localiza el riesgo.** Datos, permisos, concurrencia, tiempo, integraciones. Di dónde crees que está y pregunta al TL si coincide.
4. **Propón validaciones por nivel.** Para cada riesgo, qué probarías y si eso es unitario (del dev), integración, API o E2E. No hace falta que aciertes: hace falta que lo razones en voz alta.
5. **Escribe el bloque "QA notes"** en inglés como comentario de cada issue (`gh issue comment <n>`): riesgos, validaciones que harás, preguntas abiertas. Lo escribes tú; el mentor puede corregir después.

Las preguntas de producto van a la PM y las técnicas al TL; el mentor las enruta. Cuando encuentres un hueco de verdad, la PM lo reconocerá y actualizará la issue con un comentario `**Refinement update:**`. Cuando no encuentres uno importante, el mentor te dará una pista progresiva (pregunta, luego pista, luego respuesta). Las "Notes for QA" que la PM ha dejado en cada issue son un punto de partida, no la lista completa.

## 11. Cómo arrancar la próxima sesión (checklist)

**Prerrequisitos de la máquina** (comprobados hoy en esta máquina: Node v22.23.3, pnpm 12.9.1, Docker 29.8.2 con Compose v5.6.0):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
node --version        # debe decir v22.x
pnpm --version        # debe decir 12.9.1 (la fija packageManager en package.json)
docker ps             # debe listar contenedores (o una lista vacía), no "permission denied"
```

Node se instala con nvm y **cada terminal nueva tiene que activarlo** con la primera línea; si `node` no se encuentra, es eso. Sobre Docker: tu usuario `gallardo` ya está en el grupo `docker` (lo he comprobado con `getent group docker`), pero una sesión abierta antes de añadirlo no lo sabe. En la sesión desde la que escribo esto, `docker ps` responde "permission denied while trying to connect to the docker API". La solución es cerrar sesión y volver a entrar, o en esa terminal `newgrp docker`. Si `docker ps` funciona, estás listo.

**Arranque:**

```bash
cd /home/gallardo/Documents/workspaces/dev-team
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
git switch main && git pull
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:up
pnpm db:deploy
pnpm dev
```

Qué debe pasar en cada paso: `pnpm install` termina sin errores (si avisa de "ignored build scripts", revisa `allowBuilds` en `pnpm-workspace.yaml`; los cuatro necesarios ya están); `cp` solo hace falta la primera vez; `pnpm db:up` muestra el contenedor `dungeon-db-dev` arrancado; `pnpm db:deploy` dice que la migración `20261004000000_init` está aplicada (o "No pending migrations"); `pnpm dev` deja dos procesos corriendo con la salida de ambos mezclada, y la API escribe una línea de Fastify del tipo "Server listening at http://0.0.0.0:3000" (el texto exacto no lo he visto en esta sesión; lo relevante es que mencione el puerto 3000).

**Verificar que funciona** (en otra terminal):

```bash
curl -s localhost:3000/health
```

Esperado: un JSON con `"status":"ok"` y `"checks":{"database":"up"}`. Si ves `"status":"degraded"` y código 503, PostgreSQL no está accesible: `docker compose ps` y revisa `DATABASE_URL` en `apps/api/.env`. Luego en el navegador: <http://localhost:3000/docs> (la interfaz OpenAPI, con `/health` listado) y <http://localhost:5173> (la home con la píldora "API ok" y la versión `v0.1.0`).

**Ejecutar cada nivel de test**, para ver cómo se siente cada uno:

```bash
pnpm lint && pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm test:smoke
pnpm --filter e2e test:ui
pnpm --filter e2e report
```

Esperado hoy: 8 tests unitarios (3 api, 3 web, 2 shared), 1 de integración, 3 en Playwright (2 del project `api`, 1 del `web`), y los mismos 3 en smoke porque todos están etiquetados. `test:ui` abre el modo interactivo de Playwright; `report` abre el último informe HTML. Si `pnpm dev` sigue corriendo en la otra terminal, Playwright reutiliza esos servidores.

**Qué leer antes del refinement**, en este orden:

1. [docs/learning/sprint-00.md](sprint-00.md): diez minutos, es el resumen de hoy desde dentro del equipo.
2. [ADR 0003](../adr/0003-test-levels-and-ownership.md): los niveles y tus responsabilidades.
3. Los tests de ejemplo, abriéndolos uno al lado del otro: [health.test.ts](../../apps/api/src/routes/health.test.ts), [App.test.tsx](../../apps/web/src/App.test.tsx), [test/integration/health.test.ts](../../apps/api/test/integration/health.test.ts), [health.api.spec.ts](../../tests/e2e/tests/smoke/health.api.spec.ts) y [home.web.spec.ts](../../tests/e2e/tests/smoke/home.web.spec.ts).
4. El [postmortem](../postmortems/2026-10-04-staging-api-container-unhealthy.md).
5. Las cinco issues del Sprint 1 en GitHub, con la [plantilla de bug](../../.github/ISSUE_TEMPLATE/bug_report.md) y la [plantilla de plan de pruebas](../testing/templates/test-plan.md) a mano para pensar en qué formato vas a volcar lo que encuentres.

**Primera acción.** Dile al mentor `/refinement`. Te presentará las historias una a una y se parará a esperar tus preguntas (sección 10).

**Primera validación de release.** Antes de que entre ninguna funcionalidad, promociona el esqueleto con `/release`: abrirás el PR `main → staging`, verás correr `deploy-staging.yml` con sus smoke, reproducirás staging en tu máquina y, al promocionar `staging → production`, aprobarás manualmente el environment `production` en la pestaña Actions. Es un release sin producto, y por eso es el momento perfecto para aprender el mecanismo sin riesgo. Además lleva el fix del PR #1 a las ramas de entorno, que hoy siguen sin él (sección 9).

## 12. Glosario rápido

| Término               | Qué significa aquí                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo              | Un solo repositorio git con varios paquetes (api, web, shared, e2e) que se versionan y prueban juntos                                              |
| Workspace             | Cada paquete del monorepo según pnpm; `--filter <nombre>` ejecuta algo en uno solo, `-r` en todos                                                  |
| ADR                   | Architecture Decision Record: documento corto con contexto, decisión, consecuencias y alternativas; no se edita, se sustituye                      |
| OpenAPI               | Descripción estándar de una API HTTP (rutas, esquemas, respuestas); aquí se genera desde zod y se sirve en `/docs` y `/docs/json`                  |
| zod                   | Librería de esquemas TypeScript que valida datos en ejecución y deriva tipos; es donde viven los contratos                                         |
| Contrato              | La forma exacta de una petición o respuesta; compartido en `packages/shared` y comprobado por API, web y tests                                     |
| ORM                   | Object-Relational Mapper: capa que traduce objetos a tablas SQL. Aquí Prisma                                                                       |
| Migración             | Fichero SQL versionado que lleva la base de datos de un estado al siguiente; `prisma migrate deploy` aplica las pendientes                         |
| Healthcheck           | Comprobación periódica de que un servicio está sano; `/health` en la API y `healthcheck` en Compose, sano solo con 2xx                             |
| Puerto (`Database`)   | Una interfaz mínima que la app necesita del exterior; permite inyectar una implementación falsa en tests y la real en producción                   |
| Proxy `/api`          | Reenvío de las peticiones `/api/*` del navegador a Fastify quitando el prefijo; lo hace Vite en dev y nginx en contenedores                        |
| Fast-forward          | Fusión en la que la rama destino simplemente avanza hasta el commit de la origen, sin merge commit; exige que no haya divergido                    |
| Branch protection     | Reglas de GitHub sobre una rama: PR obligatorio, checks que deben estar en verde, prohibido force-push                                             |
| Environment (GitHub)  | Nombre de destino de un despliegue con historial y reglas; `production` exige tu aprobación manual                                                 |
| Workflow / job / step | Fichero YAML de GitHub Actions / máquina virtual que ejecuta una parte / comando individual                                                        |
| `workflow_dispatch`   | Evento que permite lanzar un workflow a mano desde cualquier rama; sirve para ensayar despliegues                                                  |
| Artefacto             | Fichero que un job guarda al terminar (informe de Playwright, logs de contenedores); se descarga desde la ejecución                                |
| Smoke                 | Conjunto mínimo y rápido de tests que demuestra que un despliegue está vivo; aquí es la etiqueta `@smoke`                                          |
| Regresión             | Comprobar que lo que ya funcionaba sigue funcionando tras un cambio; en release, la suite completa contra staging                                  |
| Flaky                 | Test que a veces pasa y a veces falla sin cambiar el código; CI reintenta una vez, pero la política para tratarlos la escribes tú en la estrategia |
| Trace (Playwright)    | Grabación de un test (capturas, red, consola, DOM) que se guarda al fallar y se abre en el Trace Viewer                                            |
| Caja negra            | Probar un sistema solo por sus interfaces externas (HTTP, navegador), sin importar su código                                                       |
| Ledger                | `~/.dev-team-sim/bug-ledger.md`: registro privado de los defectos que el dev introduce; lo lee el mentor, no tú                                    |
| Diátaxis              | Esquema para organizar documentación en cuatro tipos (tutorial, guía práctica, referencia, explicación) sin mezclarlos                             |

Si algo de esta guía no coincide con lo que ves en tu máquina o en GitHub, lo que ves gana: avísale al mentor para corregirla, y considera usar `/journal` para dejar constancia de lo que has descubierto.
