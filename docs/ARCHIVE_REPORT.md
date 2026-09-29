# Archive Report — ChooseSwim

> Documento histórico del archivado de julio de 2026, anterior a la actualización de dependencias y a la reorganización. El estado actual está en el [README](../README.md) y en el [CHANGELOG](../CHANGELOG.md).

## Información general

- Fecha de archivado: 2026-07-22.
- Ruta original: carpeta local del autor (omitida).
- Producto: PWA privada de natación gamificada con backend Firebase y cliente auxiliar SwiftUI/HealthKit.
- Tecnologías: React 18, TypeScript, Vite, Tailwind, Firebase Auth/Firestore/Functions/Hosting, OpenAI backend, SwiftUI y HealthKit.
- Git inicial: rama `main`, sin commits; todos los archivos estaban sin seguimiento. No se creó commit ni se alteró historial.
- Punto de comparación: copia read-only sin artefactos en `/tmp/choswim-baseline.Rmct4m` y manifiesto SHA-256 inicial. Es temporal y no forma parte del archivo final.
- Estado inicial: 612 MB, principalmente `node_modules` (509 MB) y `functions/node_modules` (100 MB); build/tests web bloqueados por una instalación local dañada dentro de iCloud.
- Estado final: fuente reparada, documentada y reproducible desde ambos lockfiles; validaciones limpias ejecutadas fuera de iCloud.

## Auditoría y debugging

### Problemas críticos/altos corregidos

1. **Cadena de dependencias con vulnerabilidades críticas y altas.**
   - Reproducción: `npm audit --omit=dev --audit-level=moderate` notificó 20 vulnerabilidades web (1 crítica, 6 altas) y 15 en Functions (1 crítica, 3 altas).
   - Causa: lockfiles y versiones Firebase/Vite/Firebase CLI de 2024.
   - Corrección: actualización dirigida de Firebase, React Router, Vite, plugin React, Vitest y Firebase CLI; actualización segura de transitivas en Functions.
   - Validación: instalación con `npm ci`, tests y builds completos. Ya no quedan vulnerabilidades críticas ni altas de producción.

2. **Ranking inaccesible para usuarios normales.**
   - Reproducción: `LeaderboardPage` llamaba a `listUsers()`, pero `firestore.rules` solo permite leer perfiles ajenos a un administrador.
   - Causa raíz: el frontend ignoraba `leaderboardSnapshots`, colección creada expresamente para exponer métricas agregadas.
   - Corrección: nuevo `leaderboardService`, lectura del último snapshot y superposición de métricas propias en vivo. El callable admin ahora publica el esquema completo no sensible.
   - Validación: TypeScript, ESLint, build y pruebas limpias superadas.

### Problemas medios corregidos

- **Mejor ritmo siempre igual a cero:** `Math.min(...ritmos, 0)` incluía cero en todos los casos. Se centralizó `bestPace` en `aggregateStats` y se añadió regresión unitaria.
- **Rutas base desaparecían al crear una personal:** la consulta solo pedía el UID y la UI usaba defaults únicamente cuando la respuesta estaba vacía. Ahora consulta rutas del usuario y globales, mezcla defaults por ID y ordena de forma estable; prueba añadida.
- **Error transitorio de perfil tratado como onboarding:** una caída de Firestore enviaba al formulario de alta. La guarda presenta el error y permite reintentar sin confundir fallo de red con perfil inexistente.
- **Recuperación de contraseña con rechazo no controlado:** ahora captura el error y lo muestra con semántica accesible.
- **Importación iOS marcaba como importados entrenos fallidos/omitidos:** se consolidó la subida y solo se marca sincronizado un entreno creado o ya existente.
- **Borrados sin confirmación:** sesiones y rutas personales requieren confirmación explícita.
- **Formularios sin asociación label/control:** se añadieron IDs, `htmlFor`, estados `alert/status` y salida IA con `aria-live`.
- **Reglas permisivas:** sesiones y rutas validan tipos, rangos, estados de procesado, tamaños y campos admitidos.
- **Consumo IA sin límite temporal:** OpenAI usa timeout de 20 s y un reintento. El límite diario se consume después de verificar ownership de la sesión.
- **Bundle monolítico:** Vite separa React, Firebase, TanStack Query y gráficas en chunks estables.
- **Datos locales de Xcode:** se retiró el Team ID del proyecto versionable y se excluyen `xcuserdata`/`.xcuserstate`.

### Problemas menores/falsos positivos

- Los archivos que `du` mostró inicialmente con 0 bytes eran placeholders de iCloud; al hidratarlos contenían datos válidos. No se reconstruyeron ni eliminaron.
- Las variables `VITE_FIREBASE_*` son configuración pública de cliente, no secretos backend. El archivo solo conserva nombres vacíos.
- Los `console.error` restantes corresponden a fallos reales y, salvo auth crítico, los helpers de diagnóstico se limitan a desarrollo.

## Refactorización y archivos relevantes

- `src/features/leaderboard/LeaderboardPage.tsx` y `src/services/leaderboardService.ts`: separación de perfiles privados y snapshot público.
- `src/domain/stats/userStats.ts`: métrica `bestPace` reutilizable.
- `src/services/distanceRouteService.ts`: combinación determinista de rutas personales/globales/base.
- `functions/src/index.ts`: snapshot coherente, agregados semanales, timeout y orden correcto del rate limit.
- `ios-sync/.../SyncViewModel.swift`: una sola ruta de sincronización y estados veraces por entreno.
- `src/app/guards.tsx`, formularios y `src/components/ui/Field.tsx`: errores recuperables y accesibilidad.
- `firestore.rules`: validación de integridad adicional.
- `vite.config.ts`: separación de vendors.
- `.gitignore`, `.env.example`, `functions/.env.example`, `.nvmrc`, README y notas técnicas: restauración y secretos.

No se reescribió la arquitectura ni se eliminó funcionalidad pendiente.

## Dependencias

Actualizaciones directas:

- `firebase`: `^10.14.1` → `^12.16.0`.
- `react-router-dom`: `^6.28.0` → `^6.30.4`.
- `vite`: `^5.4.11` → `^7.3.6`.
- `@vitejs/plugin-react`: `^4.4.1` → `^5.2.0` y movida de producción a desarrollo.
- `vitest`: `^2.1.5` → `^3.2.7`.
- `firebase-tools`: `^13.27.0` → `^15.24.0`.

Conservadas por compatibilidad:

- Functions permanece en Firebase Functions 5/Admin 12 y runtime Node 20. El salto que elimina los avisos moderados exige Firebase Admin 14, Node 22 y Firebase Functions 7 aún publicada como RC; no se forzó una combinación prerelease en un archivo de conservación.

## Seguridad y credenciales

- No se detectaron claves privadas, tokens OpenAI/GitHub/Slack, API keys reales ni service accounts en los archivos candidatos al ZIP.
- Solo se conservan `.env.example` y `functions/.env.example` con valores vacíos.
- Se excluyen `.env`, `.env.*` reales, `GoogleService-Info.plist`, certificados, service accounts y datos de usuario Xcode.
- No se encontró ningún secreto que requiera rotación a partir del contenido actual.
- Si alguna credencial fue usada antes fuera de este directorio, esta auditoría no puede certificar su historial porque Git no tiene commits.

## Limpieza de la copia de archivo

Excluido de la copia/ZIP:

- `.git` vacío de historial útil.
- `node_modules` y `functions/node_modules`.
- `dist`, `functions/lib`, `*.tsbuildinfo`, caches Firebase/Vite/Playwright.
- `.DS_Store`, logs, temporales y swap files.
- `xcuserdata`, `*.xcuserstate` y DerivedData.
- Variables/credenciales reales, `GoogleService-Info.plist` y archivos comprimidos internos.

Conservado:

- Todo el código web, Functions e iOS.
- Ambos manifiestos y lockfiles npm.
- `Package.resolved` de Swift Package Manager.
- Reglas, índices y configuración Firebase.
- Scripts, tests, datos JSON de rutas, recursos PWA, documentación y plantillas de entorno.

No había archivos esenciales mayores de 2 MB fuera de dependencias/builds. No había bases locales, dumps, logs relevantes, enlaces simbólicos ni archivos dudosos que justificaran conservación.

## Validaciones

| Comprobación | Comando | Estado | Resultado |
| --- | --- | --- | --- |
| Instalación web limpia | `npm ci` | SUPERADA | 1263 paquetes instalados desde lockfile |
| Instalación Functions limpia | `cd functions && npm ci` | SUPERADA | 250 paquetes; warning esperado porque la máquina usa Node 22 y el runtime documentado es Node 20 |
| Tipos | `npm run typecheck` | SUPERADA | Sin errores |
| Lint | `npm run lint` | SUPERADA | Sin errores ni warnings |
| Tests | `npm test` | SUPERADA | 9 archivos, 28 tests |
| Build web | `npm run build` | SUPERADA | PWA/Workbox generados |
| Build Functions | `cd functions && npm run build` | SUPERADA | TypeScript compilado |
| Navegador desktop/móvil | Playwright CLI sobre Vite local | SUPERADA | `/` redirige a `/login`, responsive, labels accesibles, sin errores de consola |
| Build iOS Simulator | `xcodebuild ... CODE_SIGNING_ALLOWED=NO build` | SUPERADA | `BUILD SUCCEEDED` con Firebase SPM 11.15.0 |
| Auditoría prod web | `npm audit --omit=dev --audit-level=moderate` | SUPERADA | 0 moderadas/altas/críticas; 1 baja de `esbuild` |
| Auditoría prod Functions | mismo comando en `functions` | FALLIDA | 9 moderadas transitivas de `uuid`; la solución disponible obliga a major/prerelease |
| Escaneo de secretos | patrones de claves + inventario de credenciales | SUPERADA | Sin valores reales detectados |
| `.gitignore` | `git check-ignore -v ...` | SUPERADA | secretos, builds, dependencias y datos Xcode cubiertos; examples conservados |
| Firestore Rules en emulador | `firebase emulators:exec --only firestore --project demo-chooseswim true` | BLOQUEADA | Falta Java local |
| Auth/Firestore/Functions reales | flujos con proyecto remoto | BLOQUEADA | No hay credenciales/proyecto de staging en el archivo |
| HealthKit físico | iPhone + permisos | BLOQUEADA | Requiere dispositivo, firma y `GoogleService-Info.plist` |

## Pendientes priorizados

1. **Alta:** instalar Java 21 y añadir tests automatizados de Firestore Rules antes de producción.
2. **Alta:** probar registro → onboarding → sesión → trigger → snapshot en un proyecto Firebase de staging.
3. **Media:** migrar Functions a Firebase Functions 7/Admin 14 cuando exista una combinación estable y repetir `npm audit`.
4. **Media:** activar App Check gradualmente y hacer custom claims la fuente obligatoria de admin.
5. **Media:** validar importación HealthKit en iPhone físico, incluyendo reintentos y lotes grandes.
6. **Baja:** revisar periódicamente la alerta baja de `esbuild` y las dependencias dev de Firebase CLI.
7. **Baja:** el chunk Firebase sigue en ~662 kB minificado (~197 kB gzip); se separaron vendors principales, pero una división interna adicional produjo ciclos y se descartó.

## Restauración

1. Descomprime el ZIP y entra en su única carpeta raíz.
2. Ejecuta `nvm use`, `npm ci` y `cd functions && npm ci && cd ..`.
3. Copia `.env.example` a `.env.local` y completa únicamente configuración pública Firebase.
4. Asocia el proyecto con `npx firebase use --add`.
5. Despliega reglas/índices y después Functions/Hosting siguiendo README.
6. Configura `OPENAI_API_KEY` mediante Firebase Secret Manager; no en el frontend.
7. Ejecuta tipos, lint, tests y ambos builds.
8. Para iOS, selecciona un Team propio y añade tu `GoogleService-Info.plist` local al target.

El SHA-256 definitivo se entrega junto a la ruta y tamaño del ZIP: un ZIP no puede contener de forma válida su propio hash final sin cambiar ese mismo hash.
