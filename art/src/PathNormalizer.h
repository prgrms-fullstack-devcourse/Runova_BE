#pragma once

#include <vector>
#include <tuple>
#include <include/core/SkPoint.h>

class PathNormalizer {

public:
  PathNormalizer(float width, float height, float margin)
    : width_(width), height_(height), margin_(margin) {}

  void NormalizePath(std::vector<SkPoint>&) const;

private:
  float width_;
  float height_;
  float margin_;

  static std::tuple<float, float, float, float> FindBoundary(const std::vector<SkPoint>&);
};
