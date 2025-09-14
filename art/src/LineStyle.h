#pragma once

struct LineStyle {
  float width;
  float color_r;
  float color_g;
  float color_b;
  float color_a;

  LineStyle() = default;

  LineStyle(float width, float r, float g, float b, float a)
    : width(width), color_r(r), color_g(g), color_b(b), color_a(a) {}
};