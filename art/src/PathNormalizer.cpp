#include <algorithm>

#include "PathNormalizer.h"

void PathNormalizer::NormalizePath(std::vector<SkPoint>& path) const {
  auto [x_min, y_min, x_max, y_max] = FindBoundary(path);
  const float w = std::max(x_max - x_min, 1e-9f);
  const float h = std::max(y_max - y_min, 1e-9f);

  // rescale factor
  const float sx = (width_ - 2 * margin_) / w;
  const float sy = (height_ - 2 * margin_) / h;
  const float s = std::min(sx, sy);

  for (auto& p : path) {
    const float x_prime = (p.x() - x_min) * s + (width_ - s * w) * 0.5f;
    const float y_prime = (p.y() - y_min) * s + (height_ - s * h) * 0.5f;
    p.set(x_prime, y_prime);
  }
}


std::tuple<float, float, float, float> PathNormalizer::FindBoundary(
  const std::vector<SkPoint>& path
  ) {
  float x_min = path[0].x();
  float y_min = path[0].y();
  float x_max = x_min;
  float y_max = y_min;

  for (const auto& p : path) {
    x_min = std::min(x_min, p.x());
    y_min = std::min(y_min, p.y());
    x_max = std::max(x_max, p.x());
    y_max = std::max(y_max, p.y());
  }

  return std::make_tuple(x_min, y_min, x_max, y_max);
}

