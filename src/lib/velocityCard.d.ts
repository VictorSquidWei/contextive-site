export interface CardTheme {
  id: string;
  label: string;
  bg: string;
  fg: string;
  mute: string;
  faint: string;
  hair: string;
}

export interface VelocityCardData {
  term: string;
  domainTag?: string;
  velocityIndex?: number | null;
  adoptionStage?: string | null;
  d30?: number | null;
  d90?: number | null;
  yoy?: number | null;
  sentiment?: number | null;
  inflection?: string | null;
  coOccurrence?: string[];
  campaignNumber?: string;
  campaignShort?: string;
  firewall?: string;
  asOf?: string;
}

export interface CardSVGOpts {
  width?: number | string;
  height?: number | string;
  style?: string;
}

export const THEMES: CardTheme[];
export const DEFAULT_THEME: CardTheme;
export function themeFromBackground(bg: string): CardTheme;
export function velocityCardSVG(data: VelocityCardData, theme?: CardTheme, opts?: CardSVGOpts): string;
