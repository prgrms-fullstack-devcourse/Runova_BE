#pragma once

#include "BgStarStyle.h"
#include "LineStyle.h"

struct ConstellationStyle {
  float width;
  float height;
  float margin;
  float bg_color_r;
  float bg_color_g;
  float bg_color_b;
  float bg_color_a;
  BgStarStyle bg_star_style;
  LineStyle line_style;

  ConstellationStyle(
    float width, float height, float margin,
    float bg_color_r, float bg_color_g, float bg_color_b, float bg_color_a,
    BgStarStyle&& bg_star_style,
    LineStyle&& line_style
  ): width(width), height(height), margin(margin),
  bg_color_r(bg_color_r), bg_color_g(bg_color_g), bg_color_b(bg_color_b), bg_color_a(bg_color_a),
  bg_star_style{ bg_star_style },
  line_style{ line_style } {}
};