# Roadmap

## Preparado para v1.x

- Invitaciones a ranking privado.
- Duelos `friend_duel` con snapshots semanales.
- Adapter Google Maps/Mapbox para equivalencias de distancia.
- Importador CSV para sesiones.
- Endurecer ChooseSwim Sync iOS con prueba real en iPhone, TestFlight privado y manejo de imports historicos grandes.
- Panel admin CRUD completo para retos y planes.
- Push notifications web para retos y rachas.
- Tests E2E con Playwright.
- Snapshot real de ranking semanal, mensual e histórico.
- Duelos 1vs1 con invitaciones, estado y ganador automático.
- Persistencia completa de trofeos desbloqueados en Firestore.
- Animaciones de desbloqueo conectadas a eventos reales de sesión.
- CRUD visual admin para bosses, medallas, rutas globales y mensajes.
- App Check y endurecimiento adicional del rate limit de IA.

## No hacer ahora

- Feed social tipo Strava.
- Garmin FIT/TCX.
- Material de natacion.
- Ligas grandes de 30+ personas.
- Monorepo.
- Playwright.
- Despliegue continuo (la CI solo valida).
- Dependabot.
- App Check enforcement completo antes de validar produccion.

## Fase futura: ChooseSwim Sync iOS

- Mini app SwiftUI privada.
- Lee HealthKit/Apple Watch.
- Sincroniza entrenos de natación con Firebase.
- Usa `GoogleService-Info.plist`.
- No sustituye a la PWA.
- La PWA sigue siendo el producto principal.
- iOS Sync solo será una tubería de datos.
- Queda pendiente para cuando el core web esté estable.

## Escalabilidad

- Agregar Cloud Scheduler para snapshots semanales reales cuando haya consumo que lo justifique.
- Mover agregados pesados de dashboard a documentos `users/{uid}/stats` dedicados si el volumen crece.
- Migrar `requireAdmin()` a Firebase Auth Custom Claims obligatorias.
- Reemplazar rebuild O(N) de stats/trofeos por stats incrementales y snapshots cuando haya muchos usuarios o miles de sesiones.
- Ampliar los tests de reglas (`tests/rules`) a rutas, retos y payloads completos de `apple_health`.
