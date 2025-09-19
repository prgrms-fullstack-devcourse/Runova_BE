import { Layout } from "./layout";
import { LineStyle } from "./line.style";
import { StarStyle } from "./star.style";
import { SimplificationOptions } from "./simplification.options";

export interface ArtStyle {
  layout: Layout;
  lineStyle: LineStyle;
  starStyle: StarStyle;
  simplificationOptions: SimplificationOptions;
  format: "png" | "svg";
}