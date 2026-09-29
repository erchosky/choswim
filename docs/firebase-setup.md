# Configurar Firebase

1. Crea un proyecto Firebase.
2. Activa Authentication con Email/Password.
3. Crea Firestore en modo production.
4. Copia la config web a `.env.local`.
5. Autentica la CLI de Firebase (incluida como dependencia de desarrollo):

```bash
firebase login
firebase use --add
```

6. Despliega reglas e índices:

```bash
firebase deploy --only firestore
```

7. Functions (runtime Node.js 24):

```bash
npm --prefix functions ci
firebase deploy --only functions
```

## OpenAI

Define `OPENAI_API_KEY` solo en el entorno de Functions o Secret Manager. El frontend no importa ni lee esa clave.

## Seeds

Con un service account:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/ruta/service-account.json
npm run seed
```

Esto carga rangos en `appConfig/ranks`, retos base, planes y frases motivacionales.

## Emuladores locales

Sin proyecto real: pon `VITE_USE_FIREBASE_EMULATORS=true` en `.env.local` y ejecuta `npm run emulators` (necesita Java 21). Usa el proyecto de demostración `demo-chooseswim`, que solo existe en local.
