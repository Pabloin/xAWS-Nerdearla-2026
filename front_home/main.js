import "./styles.css";
import { translations } from "./translations.js";

const appUrl = import.meta.env.VITE_APP_URL || (import.meta.env.DEV ? "http://127.0.0.1:5190/" : "/app/");
const languageStorageKey = "comunid:language";
const supportedLanguages = Object.keys(translations);
const savedLanguage = localStorage.getItem(languageStorageKey);
let currentLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : "es";

function renderPage(language) {
  const copy = translations[language];
  document.documentElement.lang = language === "pt" ? "pt-BR" : language;
  document.title = copy.documentTitle;
  document.querySelector('meta[name="description"]').content = copy.description;

  document.querySelector("#app").innerHTML = `
    <header class="site-header">
      <a class="brand" href="#inicio" aria-label="${copy.footerHome}"><img src="/brand/logo-comunid-app.png" alt="Comunid.app" /></a>
      <nav id="main-nav" aria-label="${copy.navLabel}">
        <a href="#idea">${copy.navIdea}</a><a href="#experiencia">${copy.navExperience}</a><a href="#comunidades">${copy.navCommunity}</a>
        <a class="nav-cta app-link" href="/app/">${copy.navCta} <span aria-hidden="true">↗</span></a>
        <div class="language-switch" role="group" aria-label="${copy.language}">
          ${supportedLanguages.map((option) => `<button type="button" data-language="${option}" aria-pressed="${option === language}">${option.toUpperCase()}</button>`).join("")}
        </div>
      </nav>
      <button class="menu-toggle" type="button" aria-label="${copy.menuOpen}" aria-controls="main-nav" aria-expanded="false"><span></span><span></span></button>
    </header>

    <main>
      <section class="hero" id="inicio">
        <div class="hero-inner">
          <div class="hero-copy">
            <p class="eyebrow"><span></span> ${copy.heroEyebrow}</p>
            <h1>${copy.heroTitle}<br /><em>${copy.heroTitleAccent}</em></h1>
            <p class="hero-lead">${copy.heroLead}</p>
            <div class="hero-actions"><a class="button button-primary app-link" href="/app/">${copy.navCta} <span aria-hidden="true">↗</span></a><a class="button button-outline" href="#experiencia">${copy.heroViewExperience} <span aria-hidden="true">↓</span></a></div>
            <p class="hero-signoff">${copy.heroSignoff}</p>
          </div>
          <div class="hero-stage" aria-label="${copy.passportDescription}">
            <figure class="hero-photo hero-photo-left"><img src="/experience/04-banderas-latam.jpg" alt="${copy.heroImageOne}" /></figure>
            <figure class="hero-photo hero-photo-right"><img src="/experience/hero-richard-2.jpg" alt="${copy.heroImageTwo}" /></figure>
            <figure class="hero-passport" aria-label="${copy.passportDescription}">
              <div class="passport-ui">
                <div class="passport-ui-head"><span class="passport-ui-mark">✦</span><div><small>${copy.passportBrand}</small><strong>${copy.passportHeading}</strong></div></div>
                <div class="passport-ui-page"><small>${copy.passportEvent}</small><strong>${copy.passportProgress}</strong><div class="passport-progress"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
                <div class="passport-stamps"><div class="passport-stamp earned"><span>✦</span><small>${copy.passportHero}</small></div><div class="passport-stamp earned blue"><span>⌘</span><small>${copy.passportBuilder}</small></div><div class="passport-stamp earned pink"><span>✳</span><small>${copy.passportCommunity}</small></div><div class="passport-stamp locked"><span>?</span><small>${copy.passportStudent}</small></div><div class="passport-stamp locked"><span>?</span><small>${copy.passportConnector}</small></div><div class="passport-stamp locked"><span>?</span><small>${copy.passportLegend}</small></div></div>
                <div class="passport-prize"><span>✧</span><div><small>${copy.nextPrize}</small><strong>${copy.nextPrizeCount}</strong></div><b>↗</b></div>
              </div>
              <figcaption>${copy.passportCaption}</figcaption>
            </figure>
            <div class="connection-card"><span class="connection-icon" aria-hidden="true">✦</span><div><small>${copy.encounterRecorded}</small><strong>${copy.encounterMessage}</strong></div></div>
          </div>
        </div>
        <div class="hero-bottom"><span>${copy.heroBottomOne}</span><a href="#experiencia">${copy.heroBottomLink}</a><span>${copy.heroBottomTwo}</span></div>
      </section>

      <section class="intro section-wrap" id="idea">
        <div><p class="section-kicker"><span>01 /</span> ${copy.introEyebrow}</p><h2>${copy.introTitle} <em>${copy.introTitleAccent}</em></h2></div>
        <div class="intro-copy"><p>${copy.introLead}</p><p>${copy.introBody}</p><a class="inline-link" href="#experiencia">${copy.introLink}</a></div>
      </section>

      <section class="showcase" id="comunidades"><div class="section-wrap">
        <div class="showcase-heading"><div><p class="section-kicker"><span>02 /</span> ${copy.showcaseEyebrow}</p><h2>${copy.showcaseTitle}<br />${copy.showcaseTitleSecond}<span class="violet-dot">.</span></h2></div><p>${copy.showcaseBody}</p></div>
        <div class="gallery">
          <article class="gallery-card gallery-feature"><img src="/experience/02-banderas-arg.jpg" alt="${copy.galleryOneAlt}" loading="lazy" /><div class="gallery-caption"><span>${copy.galleryOneLabel}</span><strong>${copy.galleryOneCaption}</strong></div></article>
          <article class="gallery-card"><img src="/experience/01-banderas.jpg" alt="${copy.galleryTwoAlt}" loading="lazy" /><div class="gallery-caption"><span>${copy.galleryTwoLabel}</span><strong>${copy.galleryTwoCaption}</strong></div></article>
          <article class="gallery-card"><img src="/experience/04-encuentro-jeff.jpg" alt="${copy.galleryThreeAlt}" loading="lazy" /><div class="gallery-caption"><span>${copy.galleryThreeLabel}</span><strong>${copy.galleryThreeCaption}</strong></div></article>
        </div><p class="gallery-note">${copy.galleryNote}</p>
      </div></section>

      <section class="experience section-wrap" id="experiencia">
        <div class="experience-heading"><p class="section-kicker"><span>03 /</span> ${copy.experienceEyebrow}</p><h2>${copy.experienceTitle}<br /><em>${copy.experienceTitleAccent}</em></h2><p>${copy.experienceLead}</p></div>
        <div class="steps">
          <article class="step"><div class="step-photo"><img src="/experience/03-banderas-cday-2026.jpg" alt="${copy.stepOneAlt}" loading="lazy" /><span class="step-number">01 ↗</span></div><div class="step-copy"><h3>${copy.stepOneTitle}</h3><p>${copy.stepOneBody}</p></div></article>
          <article class="step"><div class="step-photo"><img src="/experience/10-ale-guille.jpg" alt="${copy.stepTwoAlt}" loading="lazy" /><span class="step-number">02 ↗</span></div><div class="step-copy"><h3>${copy.stepTwoTitle}</h3><p>${copy.stepTwoBody}</p></div></article>
          <article class="step"><div class="step-photo"><img src="/experience/11-nelly-belu.jpg" alt="${copy.stepThreeAlt}" loading="lazy" /><span class="step-number">03 ↗</span></div><div class="step-copy"><h3>${copy.stepThreeTitle}</h3><p>${copy.stepThreeBody}</p></div></article>
        </div>
      </section>
      <section class="final-cta"><div class="section-wrap"><p class="section-kicker"><span>04 /</span> ${copy.finalEyebrow}</p><h2>${copy.finalTitle}<br /><em>${copy.finalTitleAccent}</em></h2><p>${copy.finalBody}</p><a class="button button-primary app-link" href="/app/">${copy.navCta} ↗</a></div></section>
    </main>
    <footer class="site-footer section-wrap"><a class="brand" href="#inicio" aria-label="${copy.footerHome}"><img src="/brand/logo-comunid-app.png" alt="Comunid.app" /></a><p>${copy.footerTagline}</p><a class="inline-link app-link" href="/app/">${copy.footerAppLink}</a><small>${copy.footerCopyright}</small></footer>
  `;

  document.querySelectorAll(".app-link").forEach((link) => link.setAttribute("href", appUrl));
  const menuButton = document.querySelector(".menu-toggle");
  const header = document.querySelector(".site-header");
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    menuButton.setAttribute("aria-label", expanded ? copy.menuOpen : copy.menuClose);
    header.classList.toggle("menu-open", !expanded);
  });
  document.querySelectorAll(".site-header nav a").forEach((link) => link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", copy.menuOpen);
    header.classList.remove("menu-open");
  }));
  document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => {
    currentLanguage = button.dataset.language;
    localStorage.setItem(languageStorageKey, currentLanguage);
    renderPage(currentLanguage);
  }));
}

renderPage(currentLanguage);
