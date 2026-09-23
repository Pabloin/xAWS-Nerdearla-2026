import type { BuilderProfile, Quest } from "./domain";

export const demoProfiles: BuilderProfile[] = [
  {
    id: "ana-cloud",
    name: "Ana Silva",
    role: "builder",
    title: "Cloud Community Organizer",
    city: "Buenos Aires",
    community: "AWS User Group Argentina",
    superpower: "Turning curious people into confident learners",
    askMeAbout: "Running your first study group",
    story: "Ana creates welcoming spaces where people can learn cloud technology together.",
    color: "#C8FF3D"
  },
  {
    id: "mati-open",
    name: "Mati Rojas",
    role: "hero",
    title: "Open-source maintainer",
    city: "Córdoba",
    community: "Open Source LATAM",
    superpower: "Making hard technical ideas feel approachable",
    askMeAbout: "Contributing your first pull request",
    story: "Mati mentors new contributors and maintains tools used across the region.",
    color: "#56D8FF"
  },
  {
    id: "luz-student",
    name: "Luz Benítez",
    role: "student",
    title: "Computer science student",
    city: "Rosario",
    community: "Nerdearla Student Crew",
    superpower: "Asking the question everyone else was thinking",
    askMeAbout: "Learning in public",
    story: "Luz shares her path into technology and helps other students find their first community.",
    color: "#FF6D8D"
  },
  {
    id: "nico-connects",
    name: "Nico Paz",
    role: "connector",
    title: "Volunteer coordinator",
    city: "Mendoza",
    community: "Nerdearla",
    superpower: "Remembering exactly who should meet whom",
    askMeAbout: "Volunteering at a tech event",
    story: "Nico helps volunteers find meaningful roles and introduces people across communities.",
    color: "#FFB547"
  },
  {
    id: "vero-legend",
    name: "Vero Díaz",
    role: "legend",
    title: "Community founder",
    city: "Buenos Aires",
    community: "Women in Tech Argentina",
    superpower: "Building bridges that last for years",
    askMeAbout: "Growing a community without losing its soul",
    story: "Vero has spent a decade helping underrepresented technologists become visible leaders.",
    color: "#A98BFF"
  }
];

export const demoQuests: Quest[] = [
  { id: "first-hello", title: "First hello", description: "Meet your first community builder.", target: 1 },
  { id: "builder-circle", title: "Builder circle", description: "Meet two people who build communities or projects.", target: 2, role: "builder" },
  { id: "constellation", title: "Community constellation", description: "Discover four different people at Nerdearla.", target: 4 }
];
