const heroPhotoFiles: Record<string, string> = {
  "matias-kreder": "hero-matias-kreder.png",
  "rossana-suarez": "hero-rossana-suarez.png",
  "ricardo-ceci": "hero-ricardo-ceci.png",
  "damian-olguin": "hero-damian-olguin.png",
};

export function heroPhotoUrl(profileId: string): string | null {
  const filename = heroPhotoFiles[profileId];
  return filename ? `${import.meta.env.BASE_URL}heros/${filename}` : null;
}
