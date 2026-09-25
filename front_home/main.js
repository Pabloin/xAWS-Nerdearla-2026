import "./styles.css";

const appUrl = import.meta.env.VITE_APP_URL || (import.meta.env.DEV ? "http://127.0.0.1:5190/" : "/app/");

document.querySelector("#app").innerHTML = `
  <header class="site-header">
    <a class="brand" href="#inicio" aria-label="Comunid, inicio"><img src="/brand/logo-comunid-app.png" alt="Comunid.app" /></a>
    <nav id="main-nav" aria-label="Navegación principal">
      <a href="#idea">La idea</a><a href="#experiencia">Cómo se juega</a><a href="#comunidades">La comunidad</a>
      <a class="nav-cta app-link" href="/app/">Empezar mi pasaporte <span aria-hidden="true">↗</span></a>
    </nav>
    <button class="menu-toggle" type="button" aria-label="Abrir menú" aria-controls="main-nav" aria-expanded="false"><span></span><span></span></button>
  </header>

  <main>
    <section class="hero" id="inicio">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> TU COMUNIDAD ES UNA AVENTURA</p>
          <h1>Conocé personas.<br /><em>Completá tu pasaporte.</em></h1>
          <p class="hero-lead">Encontrá Heroes y Builders en el evento, escaneá sus badges y sacate una selfie. Cada encuentro suma un sello y te acerca a un premio.</p>
          <div class="hero-actions"><a class="button button-primary app-link" href="/app/">Empezar mi pasaporte <span aria-hidden="true">↗</span></a><a class="button button-outline" href="#experiencia">Ver cómo se juega <span aria-hidden="true">↓</span></a></div>
          <p class="hero-signoff">Vení por el evento. Quedate por las personas.</p>
        </div>
        <div class="hero-stage" aria-label="Personas de la comunidad en Community Day Argentina 2026">
          <figure class="hero-photo hero-photo-left"><img src="/community/encuentro-belu-nelly.jpg" alt="Dos participantes conversan en Community Day Argentina" /></figure>
          <figure class="hero-photo hero-photo-right"><img src="/community/encuentro-jeff.jpg" alt="Miembros de la comunidad comparten una foto en el evento" /></figure>
          <figure class="hero-passport" aria-label="Vista conceptual del pasaporte de encuentros con sellos y premios">
            <div class="passport-ui">
              <div class="passport-ui-head"><span class="passport-ui-mark">✦</span><div><small>COMUNID / PASAPORTE</small><strong>Mi pasaporte</strong></div></div>
              <div class="passport-ui-page"><small>COMMUNITY DAY ARGENTINA</small><strong>3 de 8 encuentros</strong><div class="passport-progress"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
              <div class="passport-stamps"><div class="passport-stamp earned"><span>✦</span><small>HERO</small></div><div class="passport-stamp earned blue"><span>⌘</span><small>BUILDER</small></div><div class="passport-stamp earned pink"><span>✳</span><small>COMMUNITY</small></div><div class="passport-stamp locked"><span>?</span><small>STUDENT</small></div><div class="passport-stamp locked"><span>?</span><small>CONNECTOR</small></div><div class="passport-stamp locked"><span>?</span><small>LEGEND</small></div></div>
              <div class="passport-prize"><span>✧</span><div><small>PRÓXIMO PREMIO</small><strong>5 encuentros</strong></div><b>↗</b></div>
            </div>
            <figcaption>VISTA CONCEPTUAL DEL PASAPORTE</figcaption>
          </figure>
          <div class="connection-card"><span class="connection-icon" aria-hidden="true">✦</span><div><small>ENCUENTRO REGISTRADO</small><strong>Un hola. Un sello.<br />Una historia más.</strong></div></div>
        </div>
      </div>
      <div class="hero-bottom"><span>PERSONAS &gt; PERFILES</span><a href="#experiencia">DESCUBRÍ CÓMO SE JUEGA ↓</a><span>HECHO PARA ENCONTRARNOS</span></div>
    </section>

    <section class="intro section-wrap" id="idea">
      <div><p class="section-kicker"><span>01 /</span> LA IDEA</p><h2>La mejor parte de una comunidad <em>son las personas.</em></h2></div>
      <div class="intro-copy"><p>Un evento puede terminar. Una conversación puede ser el comienzo de algo enorme.</p><p>Comunid te invita a mirar más allá del badge: conocer qué hace cada persona, encontrar puntos en común y llevarte una historia que vale la pena recordar.</p><a class="inline-link" href="#experiencia">Así se vive la experiencia ↗</a></div>
    </section>

    <section class="showcase" id="comunidades"><div class="section-wrap">
      <div class="showcase-heading"><div><p class="section-kicker"><span>02 /</span> LO QUE NOS MUEVE</p><h2>La energía está<br />en todas partes<span class="violet-dot">.</span></h2></div><p>Cada comunidad crece cuando alguien comparte lo que sabe y abre espacio para una nueva persona.</p></div>
      <div class="gallery">
        <article class="gallery-card gallery-feature"><img src="/community/latam-community.jpg" alt="Participantes de la comunidad con banderas de Argentina y México" loading="lazy" /><div class="gallery-caption"><span>COMUNIDAD LATAM</span><strong>Ideas que cruzan fronteras.</strong></div></article>
        <article class="gallery-card"><img src="/community/encuentro-belu-nelly.jpg" alt="Dos participantes conversan durante el evento" loading="lazy" /><div class="gallery-caption"><span>UN HOLA</span><strong>Todo empieza al conocernos.</strong></div></article>
        <article class="gallery-card"><img src="/community/encuentro-jeff.jpg" alt="Participantes se fotografían juntos durante el evento" loading="lazy" /><div class="gallery-caption"><span>UN RECUERDO</span><strong>Un encuentro para guardar.</strong></div></article>
      </div><p class="gallery-note">Momentos de Community Day Argentina 2026.</p>
    </div></section>

    <section class="experience section-wrap" id="experiencia">
      <div class="experience-heading"><p class="section-kicker"><span>03 /</span> CÓMO SE JUEGA</p><h2>Cada encuentro<br />deja <em>su sello.</em></h2><p>Tres pasos para convertir una charla en parte de tu pasaporte.</p></div>
      <div class="steps">
        <article class="step"><span class="step-number">01 ↗</span><div class="step-art radar" aria-hidden="true"><i></i><i></i><b>✦</b></div><h3>Encontrá</h3><p>Descubrí Heroes, Builders y otras personas de la comunidad durante el evento.</p></article>
        <article class="step"><span class="step-number">02 ↗</span><div class="step-art scan" aria-hidden="true"><span>⌗</span><b>SELFIE!</b></div><h3>Escaneá y sacate una selfie</h3><p>Conocé a la persona, escaneá su badge y guarden una foto juntos.</p></article>
        <article class="step"><span class="step-number">03 ↗</span><div class="step-art collection" aria-hidden="true"><span>✳</span><span>✦</span><span>◈</span></div><h3>Sumá sellos</h3><p>Completá misiones en tu pasaporte y acercate a nuevos premios.</p></article>
      </div>
    </section>
    <section class="final-cta"><div class="section-wrap"><p class="section-kicker"><span>04 /</span> TU PRÓXIMA CONEXIÓN</p><h2>Tu próximo sello<br />empieza con <em>un hola.</em></h2><p>Entrá a Comunid y descubrí quién está del otro lado del badge.</p><a class="button button-primary app-link" href="/app/">Empezar mi pasaporte ↗</a></div></section>
  </main>
  <footer class="site-footer section-wrap"><a class="brand" href="#inicio" aria-label="Comunid, volver al inicio"><img src="/brand/logo-comunid-app.png" alt="Comunid.app" /></a><p>Personas que hacen comunidad.</p><a class="inline-link app-link" href="/app/">Ir a la app ↗</a><small>© 2026 Comunid</small></footer>
`;

document.querySelectorAll(".app-link").forEach((link) => link.setAttribute("href", appUrl));
const menuButton = document.querySelector(".menu-toggle");
const header = document.querySelector(".site-header");
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menuButton.setAttribute("aria-label", expanded ? "Abrir menú" : "Cerrar menú");
  header.classList.toggle("menu-open", !expanded);
});
document.querySelectorAll(".site-header nav a").forEach((link) => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
  header.classList.remove("menu-open");
}));
