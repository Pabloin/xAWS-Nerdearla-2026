import "./styles.css";

const appUrl = import.meta.env.VITE_APP_URL || (import.meta.env.DEV ? "http://127.0.0.1:5190/" : "/app/");

document.querySelector("#app").innerHTML = `
  <header class="site-header">
    <a class="brand" href="#inicio" aria-label="Comunid, inicio"><img src="/brand/logo-comunid-app.png" alt="Comunid.app" /></a>
    <nav id="main-nav" aria-label="Navegación principal">
      <a href="#idea">La idea</a><a href="#experiencia">Cómo funciona</a><a href="#comunidades">Comunidades</a>
      <a class="nav-cta app-link" href="/app/">Entrar a la app <span aria-hidden="true">↗</span></a>
    </nav>
    <button class="menu-toggle" type="button" aria-label="Abrir menú" aria-controls="main-nav" aria-expanded="false"><span></span><span></span></button>
  </header>

  <main>
    <section class="hero" id="inicio">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> LA COMUNIDAD EMPIEZA CON UN HOLA</p>
          <h1>Vení por el evento.<br /><em>Quedate por las personas.</em></h1>
          <p class="hero-lead">En cada meetup hay alguien que puede cambiar tu próxima idea. Comunid convierte esos encuentros en historias para descubrir, compartir y recordar.</p>
          <div class="hero-actions"><a class="button button-primary app-link" href="/app/">Explorar Comunid <span aria-hidden="true">↗</span></a><a class="button button-outline" href="#experiencia">Conocé la experiencia <span aria-hidden="true">↓</span></a></div>
        </div>
        <div class="hero-stage" aria-label="Personas de la comunidad en Community Day Argentina 2026">
          <figure class="hero-photo hero-photo-main"><img src="/community/community-day-argentina-2026.jpg" alt="Foto grupal de la comunidad en Community Day Argentina 2026" /></figure>
          <figure class="hero-photo hero-photo-left"><img src="/community/speaker-roxx.jpg" alt="Una speaker comparte su historia en el escenario" /></figure>
          <figure class="hero-photo hero-photo-right"><img src="/community/community-conversation.jpg" alt="Dos participantes conversan en el evento" /></figure>
          <div class="connection-card"><span class="connection-icon" aria-hidden="true">✳</span><div><small>COMUNID / EN VIVO</small><strong>Una comunidad.<br />Infinitas conexiones.</strong></div><span aria-hidden="true">↗</span></div>
        </div>
      </div>
      <div class="hero-bottom"><span>PERSONAS &gt; PERFILES</span><a href="#idea">DESCUBRÍ MÁS ↓</a><span>HECHO PARA ENCONTRARNOS</span></div>
    </section>

    <section class="intro section-wrap" id="idea">
      <div><p class="section-kicker"><span>01 /</span> LA IDEA</p><h2>La mejor parte de una comunidad <em>son las personas.</em></h2></div>
      <div class="intro-copy"><p>Un evento puede terminar. Una conversación puede ser el comienzo de algo enorme.</p><p>Comunid te invita a mirar más allá del badge: conocer qué hace cada persona, encontrar puntos en común y llevarte una historia que vale la pena recordar.</p><a class="inline-link" href="#experiencia">Así se vive la experiencia ↗</a></div>
    </section>

    <section class="showcase" id="comunidades"><div class="section-wrap">
      <div class="showcase-heading"><div><p class="section-kicker"><span>02 /</span> LO QUE NOS MUEVE</p><h2>La energía está<br />en todas partes<span class="violet-dot">.</span></h2></div><p>Cada comunidad crece cuando alguien comparte lo que sabe y abre espacio para una nueva persona.</p></div>
      <div class="gallery">
        <article class="gallery-card gallery-feature"><img src="/community/latam-community.jpg" alt="Participantes de la comunidad con banderas de Argentina y México" loading="lazy" /><div class="gallery-caption"><span>COMUNIDAD LATAM</span><strong>Ideas que cruzan fronteras.</strong></div></article>
        <article class="gallery-card"><img src="/community/speaker-damian.jpg" alt="Un speaker habla en el escenario ante la comunidad" loading="lazy" /><div class="gallery-caption"><span>COMPARTIR</span><strong>Cada historia inspira otra.</strong></div></article>
        <article class="gallery-card"><img src="/community/community-celebration.jpg" alt="Participantes celebran juntos en el escenario" loading="lazy" /><div class="gallery-caption"><span>ENCONTRARNOS</span><strong>Crecer juntos nos mueve.</strong></div></article>
      </div><p class="gallery-note">Momentos de Community Day Argentina 2026.</p>
    </div></section>

    <section class="experience section-wrap" id="experiencia">
      <div class="experience-heading"><p class="section-kicker"><span>03 /</span> LA EXPERIENCIA</p><h2>Conectar es más fácil<br />cuando empezás <em>por un hola.</em></h2><p>Una forma simple de descubrir personas en un evento y guardar los encuentros que importan.</p></div>
      <div class="steps">
        <article class="step"><span class="step-number">01 ↗</span><div class="step-art radar" aria-hidden="true"><i></i><i></i><b>✦</b></div><h3>Descubrí</h3><p>Explorá a quienes están cerca y encontrá una buena excusa para iniciar una charla.</p></article>
        <article class="step"><span class="step-number">02 ↗</span><div class="step-art scan" aria-hidden="true"><span>⌗</span><b>HOLA!</b></div><h3>Conectá</h3><p>Conocé a la persona. Escaneá su badge y desbloqueá su historia.</p></article>
        <article class="step"><span class="step-number">03 ↗</span><div class="step-art collection" aria-hidden="true"><span>✳</span><span>✦</span><span>◈</span></div><h3>Recordá</h3><p>Guardá los encuentros, completá misiones y seguí el vínculo después del evento.</p></article>
      </div>
    </section>
    <section class="final-cta"><div class="section-wrap"><p class="section-kicker"><span>04 /</span> TU PRÓXIMA CONEXIÓN</p><h2>La próxima gran historia<br />puede empezar <em>hoy.</em></h2><p>Entrá a Comunid y descubrí quién está del otro lado del badge.</p><a class="button button-primary app-link" href="/app/">Abrir la experiencia ↗</a></div></section>
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
