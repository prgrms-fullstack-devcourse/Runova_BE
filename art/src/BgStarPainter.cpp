#include "BgStarPainter.h"
#include <include/core/SkBlurTypes.h>
#include <cmath>

BgStarPainter::BgStarPainter(float canvas_width, float canvas_height, BgStarStyle&& style) {
  n_stars_ = static_cast<std::size_t>(std::round((canvas_width * canvas_height) / style.density));
  blur_ = SkMaskFilter::MakeBlur(kNormal_SkBlurStyle, style.blur_sigma, true);

  star_factory_ = std::make_unique<BgStarFactory>(
    0, canvas_width,
    -canvas_height, 0,
    style.min_radius, style.max_radius,
    style.min_alpha, style.max_alpha
  );

  tint_factory_ = std::make_unique<BgStarTintFactory>(
    style.tint_r, style.tint_g, style.tint_b, style.tint_mix
  );
}

void BgStarPainter::Paint(SkCanvas* canvas) const {
  SkPaint p;
  p.setAntiAlias(true);
  p.setMaskFilter(blur_);

  for (std::size_t i = 0; i != n_stars_; ++i) {
    auto [x, y, r, alpha] = star_factory_->CreateBgStar();
    p.setColor4f(tint_factory_->CreateTint(alpha));
    canvas->drawCircle(x, y, r, p);
  }
}


