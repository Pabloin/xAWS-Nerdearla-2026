const heroPhotoFiles: Record<string, string> = {
  "matias-kreder": "hero-04-matias-kreder.png",
  "rossana-suarez": "hero-02-rossana-suarez.png",
  "ricardo-ceci": "hero-03-ricardo-ceci.png",
  "damian-olguin": "hero-01-damian-olguin.png",
};

export function heroPhotoUrl(profileId: string): string | null {
  const filename = heroPhotoFiles[profileId];
  return filename ? `${import.meta.env.BASE_URL}heros/${filename}` : null;
}
