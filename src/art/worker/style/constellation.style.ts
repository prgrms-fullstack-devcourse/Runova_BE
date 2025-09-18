import { Layout } from "./layout";
import { BgStarStyle } from "./bg.star.style";
import { LineStyle } from "./line.style";

export interface ConstellationStyle {
  layout: Layout;
  bgColor: string;
  bgStarStyle: BgStarStyle;
  lineStyle: LineStyle;
}