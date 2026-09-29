# Arquitectura

La app sigue arquitectura feature-based con dominio separado:

- `src/domain`: reglas puras y testeables, sin React ni Firebase.
- `src/features`: paginas y flujos por vertical de producto.
- `src/components`: design system y layout compartido.
- `src/services`: adaptadores Firebase/Auth/Functions.
- `src/store`: estado global pequeno con Zustand.
- `functions`: backend seguro para IA, recalculos y snapshots.

El ranking de usuarios normales lee `leaderboardSnapshots`; no enumera documentos privados de `users`. El callable administrativo genera snapshots con métricas agregadas no sensibles.

## Gamificacion

- `domain/gamification`: trofeos, bosses, rachas, misiones diarias, niveles y recompensa post-entreno.
- `domain/distance-equivalences`: rutas simbolicas y equivalencias.
- `domain/workouts`: biblioteca de entrenamientos y drills.

Estas reglas son funciones puras y tienen tests unitarios. Las pantallas solo componen resultados y no calculan mecanicas pesadas.

## Estabilidad

- Auth/profile/session reads usan timeouts defensivos.
- Dashboard no bloquea por rutas secundarias.
- Onboarding y registro muestran errores visibles y logs utiles en desarrollo.
- La recompensa post-entreno se calcula desde dominio y no depende de OpenAI.

## Principios

- La UI no calcula XP de forma improvisada: llama a `domain/xp`.
- Firebase se concentra en `services`.
- OpenAI solo corre en Cloud Functions.
- Los roles viven en Firestore/custom claims y las rules bloquean autoelevacion.
- Los seeds son controlados y repetibles.
- Tema claro/oscuro se centraliza en tokens semanticos CSS + `themeStore`.

## Colecciones Firestore

- `users`
- `swimSessions`
- `challenges`
- `userChallenges`
- `trainingPlans`
- `aiReports`
- `leaderboardSnapshots`
- `rateLimits`
- `appConfig`
- `locations`
- `motivationalMessages`
- `logs`
