# ChooseSwim Meaning Layer

La capa `Narrativa Emocional + Progreso Geografico` convierte una sesion en lectura util, progreso simbolico y subrangos por categorias. No usa IA en esta version base: todo sale de reglas deterministas.

## Arquitectura

- `src/domain/swim-analysis`: clasifica fatiga, respiracion, consistencia y eficiencia.
- `src/domain/session-narrative`: transforma el analisis en textos humanos.
- `src/domain/geo-progress`: calcula avance virtual desde coordenadas y progreso de rutas.
- `src/domain/ranked`: genera rangos por categorias.
- `src/features/session-meaning`: componentes visuales integrados en detalle, reward y dashboard.
- `src/data/routes`: rutas globales/semilla en JSON.

No se crea una arquitectura paralela tipo `core/`; se respeta el patron actual `domain/`, `features/`, `shared/`.

## Inputs

La capa acepta datos presentes o futuros:

- distancia, tiempo total, tiempo activo, descanso
- frecuencia cardiaca media/maxima
- SWOLF medio/mejor/peor
- fatiga percibida, dificultad respiratoria, sensaciones
- carga previa de gimnasio
- coordenadas de casa
- rutas personales de Firestore `distanceRoutes`

Si faltan datos, devuelve `unknown` o scores conservadores. Nunca debe crashear una sesion antigua.

## Outputs

`analyzeSession` devuelve:

- `fatigueType`
- `consistency`
- `efficiencyLevel`
- `mainLimiter`
- `insights`
- `warnings`
- `score`

`generateSessionNarrative` devuelve:

- titular
- resumen emocional
- mensaje de coach
- lectura tecnica
- siguiente accion

`calculateVirtualProgress` devuelve:

- punto inicial
- punto virtual alcanzado
- mensaje geografico
- siguiente hito

`buildRankedBreakdown` devuelve rangos en:

- Respiracion
- Consistencia
- Tecnica
- Resistencia
- Flow
- Disciplina

## Como evitar frases genericas

Cada texto debe depender de un dato o clasificacion:

- FC baja/media + respiracion alta => respiratorio.
- fatiga alta + FC baja => tension/respiracion, no cardio.
- SWOLF muy variable => consistencia baja.
- mucho descanso => continuidad afectada.
- pocos datos => fallback explicito, sin inventar precision.

No se deben anadir frases aleatorias ni motivacion vacia.

## Como anadir rutas

Rutas personales:

- Se crean desde `/distance-routes`.
- Vienen de Firestore `distanceRoutes`.
- Tienen prioridad sobre las rutas de ejemplo; se usa la favorita o, si no hay, la primera.

Rutas globales:

- `src/data/routes/sample-local-routes.json` (rutas de ejemplo entre lugares públicos de Madrid)
- `src/data/routes/iconic-routes.json`
- `src/data/routes/challenge-routes.json`

Formato:

```json
{
  "id": "sol-palacio-real",
  "name": "Puerta del Sol -> Palacio Real",
  "totalDistanceMeters": 1000,
  "milestones": [
    {
      "name": "Mitad de ruta",
      "distanceMeters": 520,
      "emotionalMessage": "Ya has cruzado media ruta."
    }
  ]
}
```

## Integracion actual

Se ve en:

- detalle de sesion
- resumen post-entreno
- dashboard, cuando hay ultima sesion

La app calcula al mostrar si no hay campos guardados. Los campos opcionales `analysis`, `narrative`, `geoProgress`, `rankedBreakdown`, `badgesUnlocked` y `challengeProgress` quedan preparados en tipos, pero no se escriben todavia para no tocar reglas ni consistencia.

## Preparacion para IA futura

La IA futura debe consumir estos outputs como contexto, no sustituirlos:

- primero reglas deterministas
- luego IA redacta o amplifica
- nunca inventar diagnosticos
- si hay dolor, falta de aire fuerte o sintomas raros, recomendar parar y consultar profesional
- backend/functions, nunca API key en frontend
