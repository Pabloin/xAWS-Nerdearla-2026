import "./styles.css";

const appUrl = import.meta.env.VITE_APP_URL || (import.meta.env.DEV ? "http://127.0.0.1:5190/" : "/app/");

document.querySelector("#app").innerHTML = `
  <header class="site-header">
    <a class="brand" href="#inicio" aria-label="Comunid, inicio"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>comunid<span class="brand-dot">.</span></span></a>
    <nav aria-label="Navegación principal">
      <a href="#experiencia">La experiencia</a>
      <a href="#comunidad">La comunidad</a>
      <a class="nav-cta app-link" href="/app/">Entrar <span aria-hidden="true">↗</span></a>
    </nav>
    <button class="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span></button>
  </header>

  <main>
    <section class="hero" id="inicio">
      <div class="hero-copy">
        <p class="eyebrow"><span class="live-dot"></span> UNA EXPERIENCIA PARA ENCONTRARNOS</p>
        <h1>La comunidad<br />se descubre <em>cuando<br class="desktop-break" /> nos encontramos.</em></h1>
        <p class="hero-lead">En cada evento hay personas increíbles a una conversación de distancia. Comunid te ayuda a encontrarlas, conocer sus historias y llevarte algo más que un contacto.</p>
        <div class="hero-actions">
          <a class="button button-primary app-link" href="/app/">Descubrí Comunid <span aria-hidden="true">↗</span></a>
          <a class="text-link" href="#experiencia">Así funciona <span aria-hidden="true">↓</span></a>
        </div>
        <div class="social-proof"><div class="avatar-stack" aria-hidden="true"><span>AG</span><span>ML</span><span>JP</span><span>+</span></div><p><strong>Las personas hacen la comunidad.</strong><br />Empezá por conocerlas.</p></div>
      </div>

      <div class="hero-art" aria-label="Tarjetas de personas de una comunidad conectadas entre sí">
        <div class="orbit orbit-a"></div><div class="orbit orbit-b"></div>
        <svg class="connections" viewBox="0 0 520 520" aria-hidden="true"><path d="M261 258 140 151M261 258 385 131M261 258 408 342M261 258 151 390M140 151 385 131M151 390 408 342" /></svg>
        <div class="person-card card-main"><div class="card-photo photo-main"><span>LM</span><b>✦</b></div><div><small>BUILDER · BUENOS AIRES</small><strong>Lucía Méndez</strong><p>Conecta ideas con impacto.</p></div><span class="card-star">✳</span></div>
        <div class="person-card card-top"><div class="card-photo photo-top"><span>NS</span></div><div><small>HERO</small><strong>Nico Suárez</strong></div></div>
        <div class="person-card card-right"><div class="card-photo photo-right"><span>CR</span></div><div><small>CONNECTOR</small><strong>Camila Ríos</strong></div></div>
        <div class="person-card card-left"><div class="card-photo photo-left"><span>TA</span></div><div><small>STUDENT</small><strong>Tomás Acosta</strong></div></div>
        <div class="scan-note"><span class="scan-icon" aria-hidden="true">⌗</span><span><strong>Una charla real.</strong><br />Una historia desbloqueada.</span></div>
        <div class="spark spark-one">✳</div><div class="spark spark-two">✦</div>
      </div>
      <a class="scroll-cue" href="#experiencia">SEGUÍ DESCUBRIENDO <span aria-hidden="true">↓</span></a>
    </section>

    <section class="manifesto" id="comunidad">
      <div><p class="eyebrow eyebrow-dark"><span class="live-dot"></span> MÁS QUE UN EVENTO</p><h2>Detrás de cada badge<br />hay una <em>historia.</em></h2></div>
      <p>Comunid convierte los encuentros del evento en historias que podés descubrir. Una invitación a salir de tu círculo, cruzarte con alguien nuevo y encontrar qué los conecta.</p>
    </section>

    <section class="experience" id="experiencia">
      <div class="section-heading"><div><p class="eyebrow"><span class="live-dot"></span> FÁCIL COMO DECIR HOLA</p><h2>Un encuentro abre<br />un mundo nuevo.</h2></div><p>Sin descargas. Sin presentaciones incómodas.<br />Solo curiosidad y ganas de conocer.</p></div>
      <div class="steps-grid">
        <article class="step-card step-lime"><span class="step-number">01 / ENCONTRÁ</span><div class="step-visual radar"><i></i><i></i><i></i><b>✦</b><span class="radar-label">HAY ALGUIEN<br />POR CONOCER</span></div><h3>Seguí tu curiosidad</h3><p>Explorá perfiles, misiones y pistas para descubrir a quienes construyen la comunidad.</p></article>
        <article class="step-card step-blue"><span class="step-number">02 / CONECTÁ</span><div class="step-visual qr-visual"><div class="qr-card"><span>▦</span><i></i><i></i><i></i><b>HOLA 👋</b></div><span class="qr-beam"></span></div><h3>Empezá una charla</h3><p>Conocé a la persona, compartan un momento y escaneá su badge para desbloquear su historia.</p></article>
        <article class="step-card step-peach"><span class="step-number">03 / RECORDÁ</span><div class="step-visual collection-visual"><div class="mini-profile profile-one">LM</div><div class="mini-profile profile-two">NS</div><div class="mini-profile profile-three">CR</div><div class="mini-profile profile-four">TA</div><div class="collection-bubble">4 <small>HISTORIAS</small></div></div><h3>Guardá lo que te inspira</h3><p>Coleccioná encuentros, completá misiones y llevate un recuerdo de las personas que conociste.</p></article>
      </div>
    </section>

    <section class="roles">
      <div><p class="eyebrow eyebrow-dark"><span class="live-dot"></span> CADA QUIEN SUMA ALGO ÚNICO</p><h2>Una comunidad.<br /><em>Muchas formas de brillar.</em></h2></div>
      <div class="role-list"><span><i class="role-icon role-hero">✦</i>Heroes</span><span><i class="role-icon role-builder">⌘</i>Builders</span><span><i class="role-icon role-student">✳</i>Students</span><span><i class="role-icon role-connector">↗</i>Connectors</span><span><i class="role-icon role-legend">◈</i>Legends</span></div>
    </section>

    <section class="closing-cta"><div class="closing-orbit"></div><div class="closing-copy"><p class="eyebrow"><span class="live-dot"></span> TU PRÓXIMO ENCUENTRO TE ESPERA</p><h2>Venís por el evento.<br /><em>Te vas con la comunidad.</em></h2><p>Entrá, descubrí a alguien nuevo y empezá por un hola.</p><a class="button button-light app-link" href="/app/">Abrir la experiencia <span aria-hidden="true">↗</span></a></div><div class="closing-mark" aria-hidden="true">c<span>.</span></div></section>
  </main>

  <footer class="site-footer"><a class="brand" href="#inicio"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>comunid<span class="brand-dot">.</span></span></a><p>Personas que hacen comunidad.</p><a class="footer-link app-link" href="/app/">Ir a la app <span aria-hidden="true">↗</span></a><small>© 2026 Comunid. Hecho para encontrarnos.</small></footer>
`;

document.querySelectorAll(".app-link").forEach((link) => link.setAttribute("href", appUrl));

const menuButton = document.querySelector(".menu-toggle");
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  document.querySelector(".site-header").classList.toggle("menu-open", !expanded);
});
document.querySelectorAll(".site-header nav a").forEach((link) => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  document.querySelector(".site-header").classList.remove("menu-open");
}));
