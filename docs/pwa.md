# PWA Notes

ChooseSwim incluye:

- `public/manifest.webmanifest`
- service worker generado por `vite-plugin-pwa`/Workbox
- `public/offline.html`
- icono maskable SVG
- `theme_color` y metadatos Apple standalone
- prompt de instalacion capturado en runtime
- tema claro/oscuro con tokens CSS y persistencia

El service worker usa cache de app shell y estrategia network-first para navegacion. En desarrollo no se registra para evitar cache obsoleta. Firestore intenta activar cache persistente local; si el navegador no la permite, la app cae a cache en memoria sin romper.

## Limitaciones

Una PWA no puede leer Apple Health/HealthKit directamente desde navegador. La ruta `/imports` deja preparado el futuro flujo de importacion CSV/manual y una posible app puente iOS.
