
export interface GlowLayer {
  blur: number;
  alpha: number;
  scale?: number;
}

export interface GlowStyle {
  baseColor: string;
  width: number;
  layers: GlowLayer[];
}