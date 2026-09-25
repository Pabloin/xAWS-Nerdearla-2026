import type { BuilderProfile, Quest } from "./domain";

export const demoProfiles: BuilderProfile[] = [
  {
    id: "ana-cloud",
    name: "Ana Silva",
    role: "builder",
    title: "Organizadora de comunidades cloud",
    city: "Buenos Aires",
    community: "AWS User Group Argentina",
    superpower: "Convertir curiosidad en ganas de aprender",
    askMeAbout: "organizar tu primer grupo de estudio",
    story: "Ana crea espacios donde las personas pueden aprender tecnología cloud juntas.",
    color: "#A35CFF"
  },
  {
    id: "mati-open",
    name: "Mati Rojas",
    role: "hero",
    title: "Maintainer de código abierto",
    city: "Córdoba",
    community: "Open Source LATAM",
    superpower: "Hacer accesibles las ideas técnicas difíciles",
    askMeAbout: "hacer tu primer pull request",
    story: "Mati acompaña a nuevas personas colaboradoras y mantiene herramientas usadas en la región.",
    color: "#75A8FF"
  },
  {
    id: "luz-student",
    name: "Luz Benítez",
    role: "student",
    title: "Estudiante de informática",
    city: "Rosario",
    community: "Nerdearla Student Crew",
    superpower: "Hacer la pregunta que todos tenían en mente",
    askMeAbout: "aprender en público",
    story: "Luz comparte su camino en tecnología y ayuda a otros estudiantes a encontrar su primera comunidad.",
    color: "#D783EE"
  },
  {
    id: "nico-connects",
    name: "Nico Paz",
    role: "connector",
    title: "Coordinador de voluntariado",
    city: "Mendoza",
    community: "Nerdearla",
    superpower: "Saber quién debería conocer a quién",
    askMeAbout: "ser voluntario en un evento de tecnología",
    story: "Nico ayuda a voluntarios a encontrar su lugar y conecta personas de distintas comunidades.",
    color: "#B681FF"
  },
  {
    id: "vero-legend",
    name: "Vero Díaz",
    role: "legend",
    title: "Fundadora de una comunidad",
    city: "Buenos Aires",
    community: "Women in Tech Argentina",
    superpower: "Construir puentes que duran años",
    askMeAbout: "hacer crecer una comunidad sin perder su esencia",
    story: "Vero lleva una década ayudando a que más personas encuentren un lugar visible en tecnología.",
    color: "#679CFF"
  }
];

export const demoQuests: Quest[] = [
  { id: "first-hello", title: "Primer hola", description: "Conocé a tu primera persona de la comunidad.", target: 1 },
  { id: "builder-circle", title: "Círculo builder", description: "Conocé a dos personas que construyen comunidades o proyectos.", target: 2, role: "builder" },
  { id: "constellation", title: "Constelación de comunidad", description: "Descubrí a cuatro personas diferentes en Nerdearla.", target: 4 }
];
