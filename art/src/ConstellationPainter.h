#pragma once

#include <include/core/SkColor.h>
#include "BgStarPainter.h"
#include "LinePainter.h"
#include "PathNormalizer.h"
#include "ConstellationStyle.h"

class ConstellationPainter {

public:
  explicit ConstellationPainter(ConstellationStyle&&);
  void Paint(SkCanvas*, std::vector<SkPoint>&&);

private:
  float width_;
  float height_;
  float margin_;
  SkColor4f bg_color_;
  std::unique_ptr<BgStarPainter> bg_star_painter_;
  std::unique_ptr<LinePainter> line_painter_;
  std::unique_ptr<PathNormalizer> path_normalizer_;
};
