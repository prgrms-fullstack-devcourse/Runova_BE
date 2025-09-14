#pragma once

#include "BgStarStyle.h"
#include "BgStarFactory.h"
#include "BgStarTintFactory.h"
#include <include/core/SkCanvas.h>
#include <include/core/SkMaskFilter.h>

class BgStarPainter {

public:
  BgStarPainter(float, float, BgStarStyle&&);
  ~BgStarPainter() = default;
  void Paint(SkCanvas*) const;

private:
  std::size_t n_stars_;
  sk_sp<SkMaskFilter> blur_;
  std::unique_ptr<BgStarFactory> star_factory_;
  std::unique_ptr<BgStarTintFactory> tint_factory_;

};
