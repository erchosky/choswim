# Firestore indexes

ChooseSwim define los índices compuestos en `firestore.indexes.json` para evitar el error `The query requires an index`.

## Desplegar índices

```bash
npm run deploy:indexes
```

Alternativa directa:

```bash
firebase deploy --only firestore:indexes
```

Verifica que `firebase.json` apunte a:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

## Índices actuales

### `swimSessions`

Campos:

- `userId` ASC
- `date` DESC
- `__name__` DESC

Cubre:

- Dashboard: últimas sesiones del usuario.
- Nueva sesión: historial reciente para contexto.
- Historial de sesiones: paginación por fecha.
- Retos, trofeos y leaderboard: lectura de sesiones recientes del usuario.
- Functions `generateWeeklyPlan`: últimas sesiones del usuario.

Query base:

```ts
where('userId', '==', uid)
orderBy('date', 'desc')
limit(...)
startAfter(...)
```

### `distanceRoutes`

Campos:

- `userId` ASC
- `isFavorite` DESC
- `distanceMeters` ASC
- `__name__` ASC

Cubre:

- Dashboard: equivalencia diaria/semanal.
- Rutas: listado de rutas personales.
- Retos: objetivos por ruta.
- Detalle/recompensa de sesión: equivalencia de distancia.

Query base:

```ts
where('userId', '==', uid)
orderBy('isFavorite', 'desc')
orderBy('distanceMeters', 'asc')
```

### `challenges`

Campos:

- `status` ASC
- `visibility` ASC
- `endDate` ASC
- `__name__` ASC

Cubre:

- Retos visibles activos.

Query base:

```ts
where('status', '==', 'active')
where('visibility', 'in', ['global', 'friends'])
orderBy('endDate', 'asc')
```

## Índices no añadidos

- `users` con `where('role', 'in', ...)`: usa índice simple automático, no requiere compuesto.
- `leaderboardSnapshots`: no hay query compuesta real.
- `achievements`/trofeos: se calculan desde sesiones en cliente y triggers; no hay colección consultada con orden compuesto.
- `weeklyPlans`: no existe query compuesta real.
- `swimSessions userId + createdAt` y `userId + xp`: no hay query real actualmente, por eso no se añaden.

## Si vuelve a aparecer el error

1. Copia de la consola la colección y los campos sugeridos.
2. Busca la query con `rg "where\\(|orderBy\\(" src functions scripts`.
3. Añade el índice solo si corresponde a una query real.
4. Ejecuta `npm run deploy:indexes`.
5. Espera a que Firebase marque el índice como `Enabled`.

La UI captura este caso y muestra: `Falta configurar un índice de Firestore. Revisa la consola o despliega firestore.indexes.json.`

## Warnings no relacionados

El warning de React Router `v7_startTransition` es no crítico en la versión actual. Se probó activar el future flag, pero los tipos instalados no lo aceptan en `createBrowserRouter`; se deja pendiente para actualizar React Router sin romper `npm run typecheck`.
