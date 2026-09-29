# Security Notes

- Firestore rules limitan lectura/escritura por ownership.
- `users.role` no puede autoelevarse desde usuario normal.
- Admin puede gestionar colecciones globales.
- `aiReports` solo se escriben desde backend.
- OpenAI API key solo vive en Functions.
- Functions v2 queda preparada con `defineSecret('OPENAI_API_KEY')`; en local puede caer a `process.env.OPENAI_API_KEY`.
- Leaderboard debe publicar snapshots con campos no sensibles.
- Las validaciones Zod protegen UX; las rules y Functions protegen backend.
- Al crear el perfil solo se aceptan campos de perfil: XP, estadísticas y ranking los escriben únicamente las Functions.
- La app iOS solo puede consultar ids `apple_health_<su uid>_*` inexistentes (para saber si un entreno ya se importó).
- Las reglas tienen tests contra el emulador: `npm run test:rules`.
- Las escrituras criticas no usan `withTimeout`: un `Promise.race` no cancela escrituras Firebase y podria dejar estado ambiguo.
- Si Auth crea usuario pero falla el documento `users/{uid}`, el registro intenta borrar inmediatamente el usuario recien creado para evitar cuentas huerfanas. Si el borrado falla, el onboarding repara perfiles faltantes creando el documento al completar perfil.
- Las sesiones `apple_health` solo pueden editar notas desde cliente normal; los datos crudos quedan bloqueados.
- La llamada a OpenAI tiene timeout de 20 segundos y un único reintento.
- El límite diario de IA se contabiliza después de validar ownership de la sesión.
- Las rules validan tipos, rangos, estados de procesado y campos permitidos de sesiones/rutas.

## Pendientes recomendados antes de produccion

- App Check obligatorio.
- Custom claims `admin` como fuente principal de autorizacion.
- Endurecer el rate limit distribuido de IA si aumenta el tráfico.
- Auditoria de logs para cambios admin.
