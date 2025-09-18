export interface SpikesStyle {
    count: number;
    length: number;
    width: number;
    alpha: number;
    color: string;
}

export interface StarStyle {
    glowRadius: number;
    glowAlpha: number;
    spikesStyle: SpikesStyle;
    scale: number;
    radius: number;
    color: string;
}