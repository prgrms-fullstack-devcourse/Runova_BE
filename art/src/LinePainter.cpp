#include "LinePainter.h"
#include <include/core/SkPath.h>

LinePainter::LinePainter(LineStyle&& style) {
  stroke_.setAntiAlias(true);
  stroke_.setStrokeWidth(style.width);
  stroke_.setColor4f(SkColor4f{ style.color_r, style.color_g, style.color_b, style.color_a });
  stroke_.setStyle(SkPaint::kStroke_Style);
  stroke_.setStrokeCap(SkPaint::kRound_Cap);
  stroke_.setStrokeJoin(SkPaint::kRound_Join);
}

void LinePainter::Paint(SkCanvas* canvas, const std::vector<SkPoint>& points) const {
  if (points.size() < 2) return;

  SkPath path;
  path.moveTo(points[0]);

  for (std::size_t i = 1; i != points.size(); ++i)
    path.lineTo(points[i]);

  canvas->drawPath(path, stroke_);
}
