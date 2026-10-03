# ChooseSwim

Para apuntar los entrenos de piscina y darle algo de juego al asunto. ChooseSwim convierte los metros en XP, rangos, rachas y retos, porque llegar a Poseidón tiene más gracia que dejar otro número perdido en una libreta.

Se instala en el móvil como una app y trae:

- Sesiones con distancia, tiempos, estilo, intensidad y sensaciones.
- XP, rangos de Bronce a Poseidón, rachas, trofeos, jefes semanales y retos.
- Clasificación privada entre amigos.
- Rutas simbólicas: tus metros se convierten en recorridos reales, como «hoy has nadado lo que hay de Sol al Palacio Real».
- Entrenador con IA de OpenAI para analizar sesiones y proponer planes semanales.
- Una app auxiliar para iPhone que importa los entrenos de natación del Apple Watch mediante HealthKit.

Los puntos y las estadísticas oficiales los calcula el servidor con Cloud Functions. El navegador no puede sacarse XP de la manga.

## Tecnologías

| Parte | Tecnología |
| --- | --- |
| Web | React 19, TypeScript, Vite 8, React Router 8, Tailwind CSS 4 |
| Datos en el cliente | TanStack Query, Zustand, React Hook Form, Zod 4 |
| Backend | Firebase Auth, Firestore, Cloud Functions (Node.js 24), Hosting |
| IA | OpenAI, llamado solo desde Cloud Functions |
| PWA | vite-plugin-pwa (Workbox) |
| iOS | SwiftUI, Swift 6, HealthKit, Firebase iOS SDK 12 |
| Tests | Vitest, Testing Library, test runner de Node y emulador de Firestore |

## Cómo ponerlo en marcha

### 1. Requisitos

- **Node.js 24** y npm 10 o superior. Con [nvm](https://github.com/nvm-sh/nvm): `nvm use` lee `.nvmrc`.
- **Java 21** solo si vas a usar los emuladores de Firebase (paso 3). Por ejemplo [Eclipse Temurin](https://adoptium.net/).
- Para la app iOS: un Mac con Xcode 16 o superior y un iPhone físico (HealthKit no funciona en el simulador).

### 2. Descargar e instalar dependencias

```bash
git clone https://github.com/erchosky/choswim.git choswim
cd choswim
nvm use            # opcional
npm ci
npm --prefix functions ci
```

npm puede avisar de *install scripts* de dependencias sin aprobar; no hace falta aprobarlos.

### 3. Probarlo en local sin cuenta de Firebase (emuladores)

La forma más rápida de verlo funcionando: todo corre en tu ordenador con los emuladores oficiales de Firebase.

```bash
cp .env.example .env.local
```

Edita `.env.local` y pon `VITE_USE_FIREBASE_EMULATORS=true`. Después, en dos terminales:

```bash
npm run emulators       # Auth, Firestore y Functions locales (panel en http://127.0.0.1:4000)
```

```bash
npm run seed:emulator   # opcional: retos, planes, rangos y rutas de ejemplo
npm run dev             # la web en http://localhost:5173
```

Regístrate con cualquier email (es un entorno de prueba), completa el perfil y registra un entreno: verás cómo la Cloud Function calcula el XP.

El entrenador IA responde con un mensaje de ejemplo mientras no configures una clave de OpenAI. Para usarla en local, crea `functions/.env.local` con `OPENAI_API_KEY=...`.

### 4. Usarlo con tu propio proyecto de Firebase

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com) y activa **Authentication → Email/contraseña** y **Firestore**.
2. En *Configuración del proyecto → Tus apps* crea una app web y copia sus valores a `.env.local` (con `VITE_USE_FIREBASE_EMULATORS=false`).
3. Vincula el proyecto y despliega reglas, índices y funciones:

   ```bash
   npx firebase login
   npx firebase use --add
   npx firebase deploy --only firestore
   npx firebase functions:secrets:set OPENAI_API_KEY   # opcional, para la IA
   npx firebase deploy --only functions
   ```

4. Publica la web:

   ```bash
   npm run build
   npx firebase deploy --only hosting
   ```

5. Datos base (retos, planes, rangos): con una cuenta de servicio guardada **fuera del proyecto**:

   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/ruta/service-account.json npm run seed
   ```

6. Para tener un administrador, registra el usuario y cambia `users/{uid}.role` a `admin` desde la consola de Firebase. La web nunca permite auto-asignarse ese rol.

Más detalle en [docs/firebase-setup.md](docs/firebase-setup.md).

### 5. App iOS (opcional)

1. Abre `ios-sync/ChooseSwimSync/ChooseSwimSync.xcodeproj` en Xcode y espera a que resuelva los paquetes.
2. En *Signing & Capabilities* elige tu equipo y cambia el Bundle Identifier si lo necesitas.
3. Descarga `GoogleService-Info.plist` de tu proyecto Firebase (app iOS) y añádelo al target. Está en `.gitignore`: no lo subas.
4. Ejecuta en un iPhone físico, inicia sesión con tu cuenta de ChooseSwim y pulsa *Sincronizar*.

Guía completa en [ios-sync/ChooseSwimSync/README.md](ios-sync/ChooseSwimSync/README.md).

## Variables de entorno

| Variable | Dónde | Uso |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` | `.env.local` | Configuración web de Firebase (identificadores públicos, no secretos). |
| `VITE_USE_FIREBASE_EMULATORS` | `.env.local` | `true` para usar los emuladores locales. |
| `OPENAI_API_KEY` | Secret Manager de Firebase (o `functions/.env.local` en local) | Clave de OpenAI; solo la ve el servidor. |
| `OPENAI_MODEL` | Parámetro de Functions | Modelo de OpenAI (por defecto `gpt-4o-mini`). |

Nunca pongas secretos en variables `VITE_`: acaban dentro del JavaScript público.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Web en modo desarrollo. |
| `npm run build` | Comprueba tipos y genera la PWA de producción. |
| `npm run preview` | Sirve el build local. |
| `npm run lint` | ESLint (sin avisos permitidos). |
| `npm run typecheck` | Comprobación de tipos. |
| `npm test` | Tests de la web (dominio, formularios y paridad con el servidor). |
| `npm run test:rules` | Tests de las reglas de Firestore contra el emulador. |
| `npm --prefix functions test` | Tests de los cálculos de las Cloud Functions. |
| `npm run emulators` | Emuladores de Auth, Firestore y Functions. |
| `npm run seed:emulator` / `npm run seed` | Datos base en el emulador / en tu proyecto. |
| `npm run deploy:indexes` | Despliega los índices de Firestore. |

## Estructura

```text
src/
  app/            Router, páginas lazy, guardas y error boundary
  components/     UI compartida (botones, tarjetas, estados…) y layout
  domain/         Reglas puras: XP, rangos, métricas, gamificación, rutas (con tests)
  features/       Pantallas por funcionalidad (sesiones, retos, ranking, IA…)
  services/       Acceso a Firebase y hooks de TanStack Query (queries.ts)
  store/          Sesión y preferencias (Zustand)
  test/           Tests de la web
functions/
  src/stats/      Cálculo de XP y estadísticas (puro) y triggers de sesiones
  src/ai/         Entrenador IA con límite diario
  src/admin/      Recalcular estadísticas y snapshot del ranking
  test/           Tests de los cálculos (zona horaria, rachas, semanas)
tests/rules/      Tests de firestore.rules
ios-sync/         App SwiftUI que importa natación desde HealthKit
docs/             Arquitectura, seguridad, PWA, App Check, roadmap
```

La seguridad real está en `firestore.rules` y en las Cloud Functions. Las guardas de React solo controlan la navegación.

## Lo que queda pendiente

- El ranking se actualiza cuando un administrador ejecuta `updateLeaderboardSnapshot` (no hay tarea programada).
- App Check está documentado ([docs/app-check.md](docs/app-check.md)) pero no activado.
- Duelos, notificaciones y el panel de administración completo están en el [roadmap](docs/roadmap.md).
- La importación de HealthKit necesita probarse en un iPhone real con tu propio proyecto de Firebase.

## Historial

Cambios en [CHANGELOG.md](CHANGELOG.md). El informe del archivado original está en [docs/ARCHIVE_REPORT.md](docs/ARCHIVE_REPORT.md).
