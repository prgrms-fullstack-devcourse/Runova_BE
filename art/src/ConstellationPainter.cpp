#include "ConstellationPainter.h"
#include <future>

ConstellationPainter::ConstellationPainter(ConstellationStyle&& style)
  : width_(style.width), height_(style.height), margin_(style.margin),
  bg_color_{ style.bg_color_r, style.bg_color_g, style.bg_color_b, style.bg_color_a } {

  bg_star_painter_
  = std::make_unique<BgStarPainter>(width_, height_,
    std::forward<BgStarStyle>(style.bg_star_style));

  line_painter_ = std::make_unique<LinePainter>(std::forward<LineStyle>(style.line_style));
  path_normalizer_ = std::make_unique<PathNormalizer>(width_, height_, margin_);
}

void ConstellationPainter::Paint(SkCanvas* canvas, std::vector<SkPoint>&& points) {
  canvas->clear(bg_color_);

  // draw background stars
  auto future1 = std::async(std::launch::async, [this, canvas]() {
    this->bg_star_painter_->Paint(canvas);
  });

  // normalize path
  auto future2 = std::async(std::launch::async, [this, &points]() {
    this->path_normalizer_->NormalizePath(points);
  });

  future1.get();
  future2.get();

  line_painter_->Paint(canvas, points);
}
