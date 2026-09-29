# ChooseSwim Sync iOS

Mini app privada SwiftUI para sincronizar natacion de Apple Health/Apple Watch con Firebase. No sustituye a la PWA ChooseSwim: solo sube datos a `swimSessions` para que la web calcule XP, narrativa, rutas y progreso.

## Abrir en Xcode

1. Abre:

```text
ios-sync/ChooseSwimSync/ChooseSwimSync.xcodeproj
```

2. Espera a que Xcode resuelva Swift Package Manager.
3. Selecciona tu Team en Signing.
4. Cambia el Bundle Identifier (`com.erchosky.chooseswimsync`) por uno tuyo si lo vas a firmar con tu equipo.

Requisitos: Xcode 16 o superior (Swift 6), iOS 17+. El proyecto declara Firebase iOS SDK 12 por SPM:

- `FirebaseAuth`
- `FirebaseFirestore`
- `FirebaseCore`

## GoogleService-Info.plist

Pon tu archivo real en:

```text
ios-sync/ChooseSwimSync/ChooseSwimSync/Resources/GoogleService-Info.plist
```

Despues arrastralo en Xcode al target `ChooseSwimSync` con `Copy items if needed` activado. No subas el plist real si el repo no es privado.

## HealthKit

En Xcode:

1. Target `ChooseSwimSync`.
2. Signing & Capabilities.
3. `+ Capability`.
4. Activa `HealthKit`.
5. Usa un iPhone fisico. HealthKit no es fiable en simulador para entrenos reales.

## Probar en iPhone

1. Ejecuta la PWA/Firestore/Functions con el mismo proyecto Firebase.
2. Instala la app en iPhone.
3. Login con el mismo email/password que usas en ChooseSwim.
4. Pulsa `Sincronizar ahora`.
5. Permite entrenos, distancia de natacion, energia y frecuencia cardiaca.
6. Espera el resumen: nuevos, ya existentes, omitidos y errores.
7. Abre la PWA y revisa `/sessions`, `/dashboard` e `/imports`.

Las sesiones suben con:

- `source: "apple_health"`
- `healthKitWorkoutUUID`
- `processingStatus: "pending"`

Las Cloud Functions de ChooseSwim calculan XP/stats/rangos despues.

## Validacion de datos

La app no sube entrenos corruptos:

- Distancia minima: 25m.
- `poolLengthMeters` normalizado a 20/25/50.
- `laps` minimo 1.
- `activeTimeMinutes` minimo 1.
- Duplicados detectados por documento `apple_health_{uid}_{healthKitWorkoutUUID}`.

## Datos importados

- `userId`
- `source`
- `healthKitWorkoutUUID`
- `date`
- `startDate`
- `endDate`
- `totalTimeMinutes`
- `activeTimeMinutes`
- `totalDistanceMeters`
- `activeEnergyKcal`
- `totalEnergyKcal`
- `avgHeartRate`
- `maxHeartRate`
- `poolLengthMeters`
- `swimmingLocationType`
- `notes`
- campos default compatibles con ChooseSwim: estilo, objetivo, intensidad, descanso, vueltas
- `createdAt`, `updatedAt`, `processingStatus`

## Limitaciones cuenta gratis

- La firma de desarrollo gratuita puede caducar a los pocos dias.
- Necesitas reinstalar desde Xcode si caduca.
- Para uso estable, usa Apple Developer Program.
- HealthKit requiere iPhone fisico y permisos del usuario.

## Si caduca la firma

1. Conecta iPhone.
2. Abre Xcode.
3. Selecciona tu Team.
4. Product > Clean Build Folder.
5. Run de nuevo.

## Seguridad

- No hay OpenAI ni secretos backend en iOS.
- Firebase iOS usa `GoogleService-Info.plist`.
- Firestore rules exigen `userId == auth.uid`.
- La app evita duplicados usando un documento determinista basado en `healthKitWorkoutUUID`.
