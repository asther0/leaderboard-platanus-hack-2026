// Public logo assignments from the Platanus Hack 26 Bogotá project directory.
const teams: Record<string, number> = {
  aegis: 1,
  auxio: 4,
  'bus-factor-hq': 24,
  cumplia: 23,
  deleycom: 19,
  dipia: 25,
  helius: 26,
  hippocamp: 27,
  'simulador-de-cumplimiento-de-poltica-pblica': 16,
  moirai: 37,
  neuroecho: 29,
  palante: 35,
  parallax: 5,
  peaje: 33,
  plumb: 15,
  'memory-firewall-for-ai-agents': 13,
  pulse: 31,
  pulso: 6,
  replica: 7,
  roxy: 3,
  stegora: 12,
  temis: 14,
  vity: 32,
  woki: 28,
};

export function projectLogoUrl(slug: string): string | null {
  return teams[slug]
    ? `https://hack-user-assets.s3.amazonaws.com/project-logos/26-co/team-${teams[slug]}.png`
    : null;
}
