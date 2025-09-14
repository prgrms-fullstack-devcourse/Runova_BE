#pragma once

struct BgStar {
  float x;
  float y;
  float radius;
  float alpha;

  BgStar() = default;

  BgStar(float x, float y, float radius, float alpha)
    : x(x), y(y), radius(radius), alpha(alpha) {}
};

