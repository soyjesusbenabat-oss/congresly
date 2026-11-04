// Monta index.html a partir de fuente/plantilla.html y textos/es.json.
// Uso: node construir.mjs        (no necesita dependencias)
// Para otro idioma: copiar textos/es.json a textos/en.json, traducir los valores y añadirlo a IDIOMAS.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

// Dominio de la web (canónica, Open Graph, sitemap y robots). Debe coincidir con el fichero CNAME.
const DOMINIO = "https://www.congresly.com/";
const IDIOMAS = [{ codigo: "es", carpeta: "" }];
const VERSION = new Date().toISOString().slice(0, 10).replaceAll("-", "");

const plantilla = readFileSync("fuente/plantilla.html", "utf8");
const plantillaLegal = readFileSync("fuente/legal.html", "utf8");
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

  // Textos legales: una página por documento de textos/legal-<idioma>.json (admiten enlaces en HTML)
  const legal = JSON.parse(readFileSync(`textos/legal-${codigo}.json`, "utf8"));
  const comun = legal._comun;
  const docs = Object.keys(legal).filter((k) => !k.startsWith("_"));
  const bloque = (b) => (Array.isArray(b) ? `      <ul>${b.map((li) => `<li>${li}</li>`).join("")}</ul>` : `      <p>${b}</p>`);
  for (const clave of docs) {
    const doc = legal[clave];
    const pagina = `${clave}.html`;
    const secciones = doc.secciones
      .map((s) => `    <section>\n      <h2>${s.h}</h2>\n${s.b.map(bloque).join("\n")}\n    </section>`)
      .join("\n");
    const otros = docs.filter((k) => k !== clave).map((k) => `<a href="${k}.html">${legal[k].titulo}</a>`).join("");
    const salida = plantillaLegal
      .replaceAll("[[TITULO]]", doc.titulo)
      .replaceAll("[[DESCRIPCION]]", comillas(doc.descripcion))
      .replaceAll("[[PAGINA]]", pagina)
      .replaceAll("[[VOLVER]]", comun.volver)
      .replaceAll("[[ACTUALIZADO]]", comun.actualizado)
      .replaceAll("[[OTROS]]", comillas(comun.otros))
      .replaceAll("[[OTROS_ENLACES]]", otros)
      .replaceAll("[[INTRO]]", doc.intro)
      .replaceAll("[[SECCIONES]]", secciones)
      .replaceAll("[[URL]]", url)
      .replaceAll("[[VERSION]]", VERSION)
      .replace(/\{\{([\w.]+)\}\}/g, (_, c) => valor(c));
    writeFileSync(`${carpeta ? carpeta + "/" : ""}${pagina}`, salida);
    console.log(`${pagina} (${codigo})`);
  }
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
