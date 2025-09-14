#pragma once

#include <include/core/SkCanvas.h>
#include <include/core/SkPoint.h>
#include <vector>
#include "LineStyle.h"

class LinePainter {

public:
  LinePainter() = default;
  explicit LinePainter(LineStyle&&);
  void Paint(SkCanvas*, const std::vector<SkPoint>&) const;

private:
  SkPaint stroke_;

};
