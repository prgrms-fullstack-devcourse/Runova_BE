#include "BgStarTintFactory.h"

BgStarTintFactory::BgStarTintFactory(float r, float g, float b, float mix) {
  red_ = MakeColorComponent(r, mix);
  green_ = MakeColorComponent(g, mix);
  blue_ = MakeColorComponent(b, mix);
}

SkColor4f BgStarTintFactory::CreateTint(float alpha) const {
  return SkColor4f{ red_, green_, blue_, alpha };
}
