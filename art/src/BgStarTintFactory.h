#pragma once

#include <include/core/SkColor.h>

class BgStarTintFactory {

public:
  BgStarTintFactory(float, float, float, float);
  [[nodiscard]] SkColor4f CreateTint(float) const;

private:
  float red_;
  float green_;
  float blue_;

  static constexpr float MakeColorComponent(float color, float mix) {
    return 1.0f * (1.0f - mix) + color * mix;
  }

};
