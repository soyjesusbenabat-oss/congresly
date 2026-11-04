// Monta index.html a partir de fuente/plantilla.html y textos/es.json.
// Uso: node construir.mjs        (no necesita dependencias)
// Para otro idioma: copiar textos/es.json a textos/en.json, traducir los valores y añadirlo a IDIOMAS.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

// Dominio de la web (canónica, Open Graph, sitemap y robots). Debe coincidir con el fichero CNAME.
const DOMINIO = "https://www.congresly.com/";
const IDIOMAS = [{ codigo: "es", carpeta: "" }];
const VERSION = new Date().toISOString().slice(0, 10).replaceAll("-", "");

const plantilla = readFileSync("fuente/plantilla.html", "utf8");
const comillas = (s) => String(s).replaceAll('"', "&quot;");

for (const { codigo, carpeta } of IDIOMAS) {
  const t = JSON.parse(readFileSync(`textos/${codigo}.json`, "utf8"));
  const url = DOMINIO + (carpeta ? carpeta + "/" : "");
  const valor = (clave) => {
    const v = clave.split(".").reduce((o, k) => (o == null ? o : o[k]), t);
    if (v == null) throw new Error(`Falta el texto «${clave}» en textos/${codigo}.json`);
    return comillas(v);
  };
  const html = plantilla
    .replaceAll("[[URL]]", url)
    .replaceAll("[[VERSION]]", VERSION)
    .replace(/\{\{([\w.]+)\}\}/g, (_, clave) => valor(clave));
  if (carpeta) mkdirSync(carpeta, { recursive: true });
  writeFileSync(`${carpeta ? carpeta + "/" : ""}index.html`, html);
  console.log(`index.html (${codigo}) · ${html.length.toLocaleString("es")} caracteres`);
}

const hoy = new Date().toISOString().slice(0, 10);
writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${IDIOMAS.map(({ carpeta }) => `  <url>
    <loc>${DOMINIO}${carpeta ? carpeta + "/" : ""}</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>`).join("\n")}
</urlset>
`,
);
writeFileSync("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${DOMINIO}sitemap.xml\n`);
console.log(`Dominio: ${DOMINIO}`);
