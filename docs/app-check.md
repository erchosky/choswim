# App Check

ChooseSwim queda preparado para activar Firebase App Check sin romper desarrollo local.

## Objetivo

- Reducir abuso contra Firestore, Auth y Cloud Functions.
- Proteger callables sensibles como IA Coach y recalculos admin.
- Mantener emuladores y entorno local funcionando sin tokens reales.

## Plan de activacion

1. En Firebase Console, abrir App Check.
2. Registrar la app web de ChooseSwim.
3. Usar reCAPTCHA Enterprise para produccion.
4. Mantener modo debug en desarrollo local.
5. Activar enforcement primero en Cloud Functions.
6. Revisar errores de produccion.
7. Activar enforcement en Firestore cuando el trafico este verificado.

## Variables previstas

```bash
VITE_FIREBASE_APPCHECK_SITE_KEY=
VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=
```

## Estado actual

No se activa enforcement todavia para no bloquear desarrollo ni emuladores. La prioridad actual queda en reglas Firestore, ownership, admin-only en Functions y rate limit de IA.

## Pendiente tecnico

- Inicializar `initializeAppCheck` solo si existe `VITE_FIREBASE_APPCHECK_SITE_KEY`.
- Usar token debug solo en local.
- Documentar rotacion de claves y monitorizacion.
- Activar enforcement gradualmente por entorno.
