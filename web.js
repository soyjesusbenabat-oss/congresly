/**
 * Congresly · comportamiento de la web.
 * Menú, mini-demostraciones por pasos, móvil del congresista, filtros del programa y formulario.
 * Los textos están en textos/<idioma>.json y llegan ya puestos en el HTML; aquí no hay frases.
 */
(function () {
  "use strict";

  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Cabecera y menú móvil ----------
  var cabecera = document.getElementById("cabecera");
  var menu = document.getElementById("menu");
  var hamburguesa = document.getElementById("hamburguesa");
  function sombra() { cabecera.classList.toggle("con-sombra", window.scrollY > 8); }
  window.addEventListener("scroll", sombra, { passive: true });
  sombra();
  function cerrarMenu() {
    menu.classList.remove("abierto");
    hamburguesa.setAttribute("aria-expanded", "false");
    hamburguesa.setAttribute("aria-label", hamburguesa.dataset.abrir);
  }
  hamburguesa.addEventListener("click", function () {
    var abrir = !menu.classList.contains("abierto");
    menu.classList.toggle("abierto", abrir);
    hamburguesa.setAttribute("aria-expanded", String(abrir));
    hamburguesa.setAttribute("aria-label", abrir ? hamburguesa.dataset.cerrar : hamburguesa.dataset.abrir);
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) cerrarMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrarMenu(); });

  // ---------- Código QR decorativo (no codifica nada) ----------
  function qr(semilla, n) {
    var x = semilla, celdas = [];
    function azar() { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }
    function enBuscador(f, c) {
      var zonas = [[0, 0], [0, n - 7], [n - 7, 0]];
      for (var i = 0; i < 3; i++) {
        var df = f - zonas[i][0], dc = c - zonas[i][1];
        if (df >= -1 && df <= 7 && dc >= -1 && dc <= 7) return true;
      }
      return false;
    }
    for (var f = 0; f < n; f++) for (var c = 0; c < n; c++) if (!enBuscador(f, c) && azar() > 0.52) celdas.push("M" + c + " " + f + "h1v1h-1z");
    var buscadores = [[0, 0], [0, n - 7], [n - 7, 0]].map(function (z) {
      var y = z[0], x0 = z[1];
      return "M" + x0 + " " + y + "h7v7h-7zM" + (x0 + 1) + " " + (y + 1) + "v5h5v-5zM" + (x0 + 2) + " " + (y + 2) + "h3v3h-3z";
    }).join("");
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ' + (n + 2) + " " + (n + 2) + '" shape-rendering="crispEdges"><path fill-rule="evenodd" fill="#0E1A2B" d="' + buscadores + celdas.join("") + '"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }
  document.querySelectorAll(".qr").forEach(function (el) { el.style.setProperty("--qr", qr(20261104, 25)); });

  // ---------- Mini-demostraciones ----------
  function escribir(el, alTerminar) {
    var texto = el.dataset.texto || "", i = 0;
    var retraso = Number(el.dataset.retraso || 300);
    el.textContent = "";
    el.classList.remove("listo");
    if (reducido) { el.textContent = texto; el.classList.add("listo"); return function () {}; }
    var t2, t1 = setTimeout(function paso() {
      el.textContent = texto.slice(0, ++i);
      if (i < texto.length) t2 = setTimeout(paso, 28 + Math.random() * 40);
      else { el.classList.add("listo"); if (alTerminar) alTerminar(); }
    }, retraso);
    // Al cortar (cambio de paso) el texto queda completo
    return function () { clearTimeout(t1); clearTimeout(t2); el.textContent = texto; el.classList.add("listo"); };
  }

  function Demo(raiz) {
    this.raiz = raiz;
    this.pasos = Number(raiz.dataset.pasos);
    this.tiempos = raiz.dataset.tiempos.split(",").map(Number);
    this.paso = 0;
    this.enPausa = reducido;
    this.visible = false;
    this.temporizador = null;
    this.paradas = [];
    this.items = raiz.querySelectorAll(".demo__pasos li");
    this.botonPausa = raiz.querySelector('[data-accion="pausa"]');
    var self = this;
    raiz.querySelector(".demo__mandos").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var accion = b.dataset.accion;
      if (accion === "pausa") self.alternar();
      else if (accion === "siguiente") self.ir(self.paso % self.pasos + 1, true);
      else if (accion === "anterior") self.ir((self.paso + self.pasos - 2) % self.pasos + 1, true);
    });
    this.actualizarBoton();
  }
  Demo.prototype.ir = function (n, manual) {
    var self = this;
    clearTimeout(this.temporizador);
    this.paradas.forEach(function (p) { p(); });
    this.paradas = [];
    this.paso = n;
    // Reiniciar las animaciones CSS del paso
    this.raiz.removeAttribute("data-paso");
    void this.raiz.offsetWidth;
    this.raiz.setAttribute("data-paso", String(n));
    this.items.forEach(function (li, i) {
      li.classList.toggle("hecho", i + 1 < n);
      li.classList.toggle("activo", i + 1 === n);
    });
    // Se escribe lo del paso; en el chat (sin capas) solo en el primero
    var capa = this.raiz.querySelector(".capa--p" + n) || (n === 1 ? this.raiz : null);
    if (capa) capa.querySelectorAll(".escribe").forEach(function (el) { self.paradas.push(escribir(el)); });
    if (manual && !this.enPausa) this.programar();
    else if (!manual) this.programar();
  };
  Demo.prototype.programar = function () {
    var self = this;
    clearTimeout(this.temporizador);
    if (this.enPausa || !this.visible) return;
    this.temporizador = setTimeout(function () { self.ir(self.paso % self.pasos + 1); }, this.tiempos[this.paso - 1] || 4000);
  };
  Demo.prototype.alternar = function () {
    this.enPausa = !this.enPausa;
    this.actualizarBoton();
    if (this.enPausa) clearTimeout(this.temporizador); else this.programar();
  };
  Demo.prototype.actualizarBoton = function () {
    this.botonPausa.textContent = this.enPausa ? this.botonPausa.dataset.seguir : this.botonPausa.dataset.pausa;
    this.botonPausa.setAttribute("aria-pressed", String(this.enPausa));
  };
  Demo.prototype.mostrar = function (si) {
    this.visible = si;
    if (si) { if (!this.paso) this.ir(1); else this.programar(); }
    else clearTimeout(this.temporizador);
  };

  // Cada demostración avanza sola mientras se ve en pantalla
  var demos = [];
  document.querySelectorAll(".demo").forEach(function (el) { demos.push(new Demo(el)); });
  if ("IntersectionObserver" in window) {
    var verDemo = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var d = demos.filter(function (x) { return x.raiz === en.target; })[0];
        d.mostrar(en.isIntersecting && !document.hidden);
      });
    }, { threshold: 0.45 });
    demos.forEach(function (d) { verDemo.observe(d.raiz); });
  } else demos.forEach(function (d) { d.mostrar(true); });
  document.addEventListener("visibilitychange", function () {
    demos.forEach(function (d) { if (document.hidden) d.mostrar(false); else if (d.paso) d.programar(); });
  });

  // ---------- Así lo vive cada congresista: el móvil pasa por cuatro pantallas ----------
  var telefono = document.getElementById("telefono");
  if (telefono) {
    var botones = Array.prototype.slice.call(document.querySelectorAll("#persona-lista button"));
    var puntos = Array.prototype.slice.call(document.querySelectorAll(".persona__puntos i"));
    var pantalla = 1, relojTel = null, telVisible = false, parado = reducido;
    var ponerPantalla = function (n) {
      pantalla = n;
      telefono.setAttribute("data-pantalla", String(n));
      botones.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.pantalla) === n)); });
      puntos.forEach(function (p, i) { p.classList.toggle("activo", i + 1 === n); });
    };
    var seguirTel = function () {
      clearInterval(relojTel);
      if (!telVisible || parado) return;
      relojTel = setInterval(function () { ponerPantalla(pantalla % 4 + 1); }, 4200);
    };
    botones.forEach(function (b) {
      b.addEventListener("click", function () { parado = true; clearInterval(relojTel); ponerPantalla(Number(b.dataset.pantalla)); });
    });
    puntos.forEach(function (p, i) {
      p.addEventListener("click", function () { parado = true; clearInterval(relojTel); ponerPantalla(i + 1); });
    });
    ponerPantalla(1);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { telVisible = en[0].isIntersecting; seguirTel(); }, { threshold: 0.4 }).observe(telefono);
    }
  }

  // ---------- Programa: filtrar por tipo de sesión ----------
  var parrilla = document.getElementById("parrilla");
  var filtros = document.querySelectorAll("#filtros button");
  filtros.forEach(function (b) {
    b.addEventListener("click", function () {
      filtros.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      if (b.dataset.filtro) parrilla.setAttribute("data-filtro", b.dataset.filtro);
      else parrilla.removeAttribute("data-filtro");
    });
  });

  // ---------- Aparición al desplazarse ----------
  if (!reducido && "IntersectionObserver" in window) {
    var aparecer = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visto"); aparecer.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".seccion__cabeza, .demo, .modulo, .detalles li, .salud__bloque, .seguro, .perfil, .formulario, .parrilla-marco").forEach(function (el) {
      el.classList.add("revela");
      aparecer.observe(el);
    });
  }

  // ---------- Formulario «Solicitar demo» ----------
  // Provisional: prepara un correo con los datos. Se sustituirá por un servicio de formularios.
  var form = document.getElementById("formulario");
  var estado = form.querySelector(".f-estado");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.web.value) return;
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (campo) {
      var valido = campo.type === "checkbox" ? campo.checked : campo.checkValidity() && campo.value.trim() !== "";
      campo.closest("label").classList.toggle("error", !valido);
      if (!valido) ok = false;
    });
    if (!ok) { estado.className = "f-estado error"; estado.textContent = estado.dataset.error; return; }
    var etiquetas = {};
    form.querySelectorAll("label.f-campo").forEach(function (l) {
      var campo = l.querySelector("input, select, textarea");
      etiquetas[campo.name] = l.querySelector("span").textContent;
    });
    var cuerpo = ["nombre", "entidad", "tipo", "correo", "telefono", "mensaje"]
      .filter(function (k) { return form[k].value.trim(); })
      .map(function (k) { return etiquetas[k] + ": " + form[k].value.trim(); })
      .join("\n");
    var destino = form.dataset.destino;
    if (typeof gtag === "function") gtag("event", "generate_lead", { send_to: "G-75845ZEX34" });
    window.location.href = "mailto:" + destino + "?subject=" + encodeURIComponent(form.dataset.asunto + " · " + form.entidad.value.trim()) + "&body=" + encodeURIComponent(cuerpo);
    estado.className = "f-estado ok";
    estado.textContent = estado.dataset.gracias + " " + destino + ".";
  });
  form.addEventListener("input", function (e) {
    var l = e.target.closest("label");
    if (l) l.classList.remove("error");
  });
})();
