# Congresly · web comercial

Web de una sola página para presentar Congresly, la plataforma de gestión de congresos académicos y científicos. Es un sitio estático, pensado para publicarse con GitHub Pages desde `main`.

## Cómo está hecha

| Fichero | Qué es |
|---|---|
| `textos/legal-es.json` | Aviso legal, privacidad y cookies (titular: Portal Intracom). Cada documento genera su página `.html`. |
| `textos/es.json` | **Todos los textos** de la web, también los de las animaciones. Es lo único que hay que tocar para cambiar una frase o traducir la web. |
| `fuente/plantilla.html` | Estructura de la página, con marcadores `{{seccion.clave}}` que apuntan a los textos. |
| `construir.mjs` | Junta plantilla y textos y genera `index.html`, `sitemap.xml` y `robots.txt`. |
| `estilos.css` | Diseño (colores, tipografías, animaciones). |
| `web.js` | Menú, mini-demostraciones animadas, móvil del congresista, filtros del programa y formulario. |
| `img/` | Pantallazo de la portada, con un congreso y personas **ficticios**. |

Después de cambiar un texto o la plantilla:

```bash
node construir.mjs
```

`index.html` se genera: no se edita a mano.

## Traducir

1. Copiar `textos/es.json` como `textos/en.json` y traducir solo los valores (no las claves).
2. Añadir `{ codigo: "en", carpeta: "en" }` a `IDIOMAS` en `construir.mjs`.
3. `node construir.mjs` genera `en/index.html` y lo añade al sitemap. En inglés, «conference», nunca «congress».

## Pendiente

- **Resumen funcional**: los botones de descarga apuntan a `descargas/congresly-resumen-funcional.pdf`, que aún no existe. Llevan `data-evento="descarga_resumen"` para medir los clics si se añade analítica.

- **Dominio**: `www.congresly.com` (`DOMINIO` en `construir.mjs` y fichero `CNAME`). En el registrador: registro CNAME `www` → `soyjesusbenabat-oss.github.io` y, para que `congresly.com` sin www también funcione, registros A del dominio raíz a 185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153. En GitHub: Settings → Pages → Custom domain `www.congresly.com` y «Enforce HTTPS».
- **Formulario**: ahora abre el programa de correo con la solicitud preparada para info@intracom.es. Falta elegir un servicio de formularios.
- **Textos legales**: hechos con los datos de Portal Intracom; pendiente de revisión por asesoría jurídica.

## Datos de ejemplo

Todos los nombres, congresos, entidades e importes que aparecen en la web son ficticios.
