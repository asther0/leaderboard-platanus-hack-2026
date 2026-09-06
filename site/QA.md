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
- Prueba local de desconexión: última lectura conservada y estado de desconexión. La reconexión dispara la consulta sin esperar el intervalo.
- Detalle del estado de sincronización accesible al pulsar/tocar; el indicador principal tiene una sola línea. Movimiento reducido desactiva paquete y pulso.
- Logos: 24 imágenes oficiales cargadas, ninguna rota; diseño móvil sin desbordamiento. Tamaño 44 px en escritorio y 32 px en móvil, con iniciales como respaldo ante error.

## Regresión de logos en producción

- Reproducido: el HTML nuevo se publicó con CSS anterior sin `.project-logo` ni `.event-backdrop`. Las imágenes con `fill` ocuparon 1440 × 1000 px.
- Corrección: dimensiones intrínsecas y límite explícito de 44 px, sin `fill`. Caché persistente de compilación desactivada para regenerar los estilos desde el código fuente.
- `postbuild` comprueba que el CSS compilado contenga los estilos de logos, collage, radio y sincronización; falla antes de publicar si faltan.
- Build de producción local: 24 contenedores de 44 px en escritorio y 32 px en móvil (imagen interior 42/30 px), sin desbordamiento horizontal a 375 px. Collage con posición fija correctamente aplicada.

## Fondo automático del evento

- Doce JPEG distintos, 718 KB en total; test automático de formato, duplicados y presupuesto de 1 MB.
- Tres composiciones, cambio cada 5 s con fundido de 1,5 s; ciclo CSS de 15 s con desfases de 0, -10 y -5 s.
- Botón «Pausar fondo» retirado a petición del propietario. Ocultar la pestaña sigue pausando las animaciones.
- `prefers-reduced-motion: reduce` comprobado en Chromium: cero animaciones, primera composición visible, resto ocultas.
- A 320 px: documento de 320 px, logos de 32 px y las doce fotografías distribuidas entre los primeros cuatro espacios de cada composición.

## Cabecera compacta

- A 1440 px, tarjeta WOKI de 133 px (antes 276 px) y comienzo de tabla a 269 px (antes 528 px).
- A 375 px, tarjeta de 273 px y tabla a 439 px. Sin desbordamiento a 320, 375, 768 y 1440 px.
- Botones y enlaces principales conservan al menos 44 px de alto. El nombre WOKI enlaza a su página oficial; el acceso a su fila conserva nombre accesible en móvil, donde se representa con una flecha.
- Verificados los 24 enlaces oficiales y el salto a `#project-woki`. Encabezado «Ranking de votos», sin subtítulo redundante.

## Acabado de logos

- Marco superpuesto a la imagen y radio compartido de 10 px en escritorio / 8 px en móvil; recorte contenido dentro de los tamaños de 44 / 32 px.
- Pa’lante y Replica usan marco de 2 px para cubrir el borde claro incorporado en sus archivos, sin modificar los originales.
- Los 24 logos mantienen sus dimensiones en móvil; marco sin eventos de puntero para conservar los enlaces de las filas.

## Acción de voto y fondo

- Cabecera con una sola acción: «Votar por WOKI» abre la página oficial del proyecto en otra pestaña. Retirados «Actualizar» y «Sitio oficial»; se conserva la sincronización automática.
- Acción de 46 px de alto a 320 px, sin desbordamiento; texto oscuro sobre lima también en hover y visited.
- Reducida suavemente la opacidad de las sombras del collage, tanto en escritorio como en móvil. La tarjeta WOKI y la tabla mantienen fondos completamente opacos.

## Alcance de las pruebas

Las pruebas de cambios y errores usan respuestas simuladas solo dentro del navegador local. Las lecturas de votos se contrastan por separado con el origen público. La sincronización periódica no garantiza recibir un voto en el instante de su emisión.

El seguimiento de sesión no sustituye un historial persistente. El catálogo de proyectos requiere mantenimiento si se agregan participantes.
