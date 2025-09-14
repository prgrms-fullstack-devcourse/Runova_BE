#include "BgStarFactory.h"

BgStarFactory::BgStarFactory(
  float min_x, float max_x,
  float min_y, float max_y,
  float min_radius, float max_radius,
  float min_alpha, float max_alpha
): random_x_{ min_x, max_x },
random_y_{ min_y, max_y },
random_radius_( min_radius, max_radius ),
random_alpha_( min_alpha, max_alpha ) {}

BgStar BgStarFactory::CreateBgStar() {
  std::random_device rd;
  std::mt19937 mt(rd());

  return BgStar{
    random_x_(mt),
    random_y_(mt),
    random_radius_(mt),
    random_alpha_(mt)
  };
}
