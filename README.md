# Leaderboard Platanus Hack 2026 · WOKI

Ranking independiente de los votos públicos de Platanus Hack Bogotá 2026, con seguimiento de WOKI.

## Desarrollo

La aplicación Next.js está en `site/`. Requiere Node.js 24 LTS.

```sh
cd site
npm ci
npm run dev
```

## Verificación

```sh
cd site
npm test
npx oxlint app lib tests
npm run build
```

## Votos y sincronización

- Se consultan las páginas públicas de los 24 proyectos conocidos. El lector prefiere `props.project.voteCount` del JSON de Inertia, con respaldo en el HTML visible.
- El navegador sincroniza cada 15 segundos mientras la pestaña está visible. Las solicitudes concurrentes se agrupan y Vercel comparte una caché de 10 segundos.
- Es sincronización periódica, no un stream instantáneo. El retraso también depende de la publicación del contador por Platanus y del tiempo de red.
- La primera carga se renderiza con datos consultados en el servidor, no con un ranking congelado durante el build.
- Una lectura fallida conserva el último dato del navegador y lo marca como anterior. Si nunca hubo un dato válido se muestra `—`, nunca un cero inventado.
- Los empates comparten posición. Los deltas se calculan entre lecturas; el avance de WOKI dura la sesión de la página y se reinicia al recargar.
- Todos los proyectos abren su página oficial en otra pestaña.
- No se automatizan votos ni se solicita iniciar sesión en Platanus.

## Vercel

- Equipo: `jhomars-projects`
- Proyecto: `leaderboard-platanus-woki-2026`
- Repositorio: `asther0/leaderboard-platanus-hack-2026`
- Root Directory: `site`
- Rama de producción: `main`
- Web Analytics se integra con `@vercel/analytics/next`.

La conexión automática requiere que la cuenta de Vercel tenga GitHub conectado en Authentication. Mientras se completa esa autorización, el despliegue puede realizarse con la CLI desde la raíz del repositorio.

El favicon es el logo original publicado por WOKI en Platanus. `.gstack/` contiene artefactos locales de revisión y no se publica en Git.

## Límites

No se guarda un historial permanente ni se detectan automáticamente proyectos nuevos. Si cambia el catálogo, actualizar `site/lib/projects.ts`. Si Platanus cambia su estructura de datos, las lecturas se marcarán como pendientes hasta adaptar el lector.
