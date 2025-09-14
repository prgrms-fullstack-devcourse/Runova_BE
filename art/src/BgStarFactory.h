#pragma once

#include <random>

#include "BgStar.h"

class BgStarFactory {

public:
  BgStarFactory(float, float, float, float, float, float, float, float);
  BgStar CreateBgStar();

private:
  std::uniform_real_distribution<float> random_x_;
  std::uniform_real_distribution<float> random_y_;
  std::uniform_real_distribution<float> random_radius_;
  std::uniform_real_distribution<float> random_alpha_;
};
