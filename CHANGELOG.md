# Changelog

## 1.1.0 - 2026-09-29

### Actualizado

- Node.js 20 → **24** (web, CI y runtime `nodejs24` de Cloud Functions; Node 20 ya está deprecado en Functions).
- React 18 → **19**, React Router 6 → **8** (`react-router`), Vite 7 → **8**, Tailwind CSS 3 → **4**, Zod 3 → **4**, Recharts 3, date-fns 4, Vitest 5, TypeScript 6.
- Functions: firebase-functions 5 → **7**, firebase-admin 12 → **14**, openai 4 → **7**.
- iOS: Firebase iOS SDK 11 → **12.19**, Swift 5 → **Swift 6** con concurrencia estricta.
- `npm audit`: de 28 + 12 vulnerabilidades a **0** en web y Functions.

### Corregido

- **Importación desde Apple Watch rota:** la app iOS comprueba si un entreno ya existe leyendo un documento que aún no existe, y las reglas lo denegaban (`resource` es null). Todas las importaciones nuevas fallaban.
- **Registro con mayúsculas en el email:** se guardaba el email tal cual y las reglas lo comparaban con el del token (en minúsculas); el registro fallaba y borraba la cuenta.
- **Perfil sin año de nacimiento:** el campo vacío se enviaba como `undefined` y Firestore rechazaba la escritura.
- **Sesión sin "Fatiga":** el campo vacío se convertía en 0 y no pasaba la validación; no se podía guardar.
- **Trampas en el ranking:** al crear el perfil se podían incluir `weeklyXP`, `bestPace` y otras estadísticas inventadas. Ahora solo se aceptan campos de perfil.
- **Filtro "Desde" del historial:** comparaba un `Timestamp` de Firestore como fecha y ocultaba todas las sesiones. Los filtros de objetivo y estilo solo mostraban parte de las opciones.
- **Trofeo "Madrugador" regalado:** las sesiones manuales se guardaban a medianoche UTC (01:00-02:00 en España). Ahora se guardan a mediodía local y los trofeos por hora solo usan horas reales (Apple Watch).
- **Bonus de racha inflado:** usaba la racha guardada en el perfil aunque el usuario llevara semanas sin nadar; ahora se calcula con las sesiones reales.
- **Ranking con datos antiguos:** los metros y XP semanales de quien no entrena esta semana eran los de la semana anterior.
- Días y semanas calculados en UTC en el servidor; ahora en hora de España.
- Rango "Poseidon" (cliente) vs "Poseidón" (servidor).
- La pantalla de recompensa esperaba ~4 s al servidor; con un arranque en frío de Functions mostraba la sesión con 0 XP. Ahora espera hasta 30 s.
- "Tiempo total" del panel sumaba solo las últimas 20 sesiones; ahora usa el agregado del servidor.
- Sin IA configurada se gastaba el cupo diario y se guardaban informes vacíos.

### Cambiado

- **Privacidad:** eliminadas las coordenadas de una ubicación personal y rutas a lugares cercanos; sustituidas por rutas de ejemplo entre lugares públicos de Madrid.
- Cloud Functions divididas en módulos (`stats`, `ai`, `admin`) con cálculos puros testeados; una sola lectura de sesiones por escritura (antes tres) y sin escribir trofeos que nadie leía.
- Carga de datos de la web con TanStack Query (caché compartida entre pantallas e invalidación al guardar) en lugar de `useEffect` repetidos en 8 páginas.
- Soporte de emuladores (`npm run emulators`, `VITE_USE_FIREBASE_EMULATORS`) para probar sin proyecto de Firebase.
- Modelo de OpenAI configurable (`OPENAI_MODEL`).
- Eliminado Firebase Storage (no se usaba) y variables de entorno sin uso.
- Tests: de 28 a 46 en la web, 7 de cálculos del servidor, 10 de reglas de Firestore y un test de paridad del XP cliente/servidor.
- Documentación en `docs/`, README reescrito y CI con GitHub Actions.

## 1.0.0 - 2026-07-22

Versión archivada original. Ver [docs/ARCHIVE_REPORT.md](docs/ARCHIVE_REPORT.md).
