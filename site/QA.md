# Validación · 6 de septiembre de 2026

## Corregido

- Hover ilegible: el botón mezclaba estilos oscuros del componente base con texto oscuro. Ahora sus colores de estado están definidos juntos, sin transición de contraste intermedia.
- Primera carga congelada: la página ahora es dinámica y las consultas de votos usan `no-store`.
- Contadores antiguos inventaban movimientos durante fallos: eliminados los valores de respaldo fijos. Se conserva solo una lectura real previa, marcada como anterior.
- Flechas decorativas parecían aumentos: ahora solo aparecen cuando la diferencia observada es distinta de cero.
- Empates se separaban por orden alfabético: ahora comparten posición numérica.
- WOKI tenía poca información de progreso: añadido resumen de votos, posición, avance de sesión y votos necesarios para superar al siguiente.
- Filas dependían de JavaScript para navegar: ahora son enlaces nativos con URL, teclado y apertura en otra pestaña.
- Móvil: diseño específico para el resumen, track visible bajo el proyecto, textos que se ajustan y botones de 46 px.
- Favicon de WOKI y Web Analytics integrados.

## Evidencia de pruebas

- 8 pruebas automatizadas: JSON público y contador cero, fallback HTML, contador inválido, empates, lectura parcial, respuesta antigua, aumentos/reordenamiento, disminuciones y validación de respuesta.
- Simulación local de +10 votos: WOKI pasó de #5 a #3, apareció `+10` y `↑ 2 puestos esta sesión`. No se emitieron votos ni escrituras hacia Platanus.
- Simulación local de HTTP 502: aviso visible y conservación del último contador.
- 24 enlaces apuntan a páginas oficiales de Platanus.
- Vista de 320 px: ancho del documento de 320 px, sin desbordamiento; botones de 46 px; acceso directo a WOKI visible y operativo.
- Diseño inspeccionado en escritorio y móvil. Movimiento reducido respetado.

## Collage y recepción WOKI

- Seis fotografías locales de concurso (404 KB en total); cuatro fondos visibles en móvil. Sin scripts ni peticiones a Google Photos desde la web.
- Vista de 320 px verificada sin desbordamiento. Las fotografías no interceptan los enlaces ni los botones.
- Prueba local de +10 votos: contador 37, posición #3, caption `+10 votos recibidos`, animación `packet-arrive` y pulso de subida presentes.
- Prueba local de desconexión: última lectura conservada, botón desactivado y estado de desconexión. La reconexión dispara la consulta sin esperar el intervalo.
- Detalle del estado de sincronización accesible al pulsar/tocar; el indicador principal tiene una sola línea. Movimiento reducido desactiva paquete y pulso.
- Logos: 24 imágenes oficiales cargadas, ninguna rota; diseño móvil sin desbordamiento. Tamaño 44 px en escritorio y 32 px en móvil, con iniciales como respaldo ante error.

## Límites de la validación

## Regresión de logos en producción

- Reproducido: el HTML nuevo se publicó con CSS anterior sin `.project-logo` ni `.event-backdrop`. Las imágenes con `fill` ocuparon 1440 × 1000 px.
- Corrección: dimensiones intrínsecas y límite explícito de 44 px, sin `fill`. Caché persistente de compilación desactivada para regenerar los estilos desde el código fuente.
- `postbuild` comprueba que el CSS compilado contenga los estilos de logos, collage, radio y sincronización; falla antes de publicar si faltan.
- Build de producción local: 24 contenedores de 44 px en escritorio y 32 px en móvil (imagen interior 42/30 px), sin desbordamiento horizontal a 375 px. Collage con posición fija correctamente aplicada.

## Alcance

Las pruebas de cambios y errores usan respuestas simuladas solo dentro del navegador local. Las lecturas de votos se contrastan por separado con el origen público. La sincronización periódica no garantiza recibir un voto en el instante de su emisión.

El seguimiento de sesión no sustituye un historial persistente. El catálogo de proyectos requiere mantenimiento si se agregan participantes.
