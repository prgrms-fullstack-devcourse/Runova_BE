#include <gtest/gtest.h>
#include <vector>
#include <cmath>
#include <algorithm>
#include <include/core/SkRect.h>
#include "../src/PathNormalizer.h"

class PathNormalizerTest : public ::testing::Test {
protected:
    void SetUp() override {
    }

    void TearDown() override {
    }


};
bool AreNormalizedCorrectly(const std::vector<SkPoint>& points,
      float width, float height, float margin) {
  SkRect rect = SkRect::MakeWH(width - 2 * margin, height - 2 * margin);

  return std::all_of(points.begin(), points.end(),
    [&rect](const SkPoint& p) {
      return rect.contains(p.x(), p.y());
  });
}


TEST_F(PathNormalizerTest, NormalizeSimpleSquare) {
    PathNormalizer normalizer(100.0f, 100.0f, 10.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(0.0f, 0.0f),
        SkPoint::Make(10.0f, 0.0f),
        SkPoint::Make(10.0f, 10.0f),
        SkPoint::Make(0.0f, 10.0f)
    };
    
    normalizer.NormalizePath(path);
    EXPECT_EQ(AreNormalizedCorrectly(path, 100.0f, 100.0f, 10.0f), true);
}

TEST_F(PathNormalizerTest, NormalizeRectangle) {
    PathNormalizer normalizer(200.0f, 100.0f, 10.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(0.0f, 0.0f),
        SkPoint::Make(20.0f, 0.0f),
        SkPoint::Make(20.0f, 10.0f),
        SkPoint::Make(0.0f, 10.0f)
    };
    
    normalizer.NormalizePath(path);
    
    float minX = path[0].x(), maxX = path[0].x();
    float minY = path[0].y(), maxY = path[0].y();
    for (const auto& p : path) {
        minX = std::min(minX, p.x());
        maxX = std::max(maxX, p.x());
        minY = std::min(minY, p.y());
        maxY = std::max(maxY, p.y());
    }
    
    float width = maxX - minX;
    float height = maxY - minY;
    
    EXPECT_NEAR(width / height, 2.0f, 0.1f);
    
    EXPECT_GE(minX, 10.0f);
    EXPECT_LE(maxX, 190.0f);
    EXPECT_GE(minY, 10.0f);
    EXPECT_LE(maxY, 90.0f);
}

TEST_F(PathNormalizerTest, NormalizeWithNegativeCoordinates) {
    PathNormalizer normalizer(100.0f, 100.0f, 10.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(-5.0f, -5.0f),
        SkPoint::Make(5.0f, -5.0f),
        SkPoint::Make(5.0f, 5.0f),
        SkPoint::Make(-5.0f, 5.0f)
    };
    
    normalizer.NormalizePath(path);
    
    float minX = path[0].x(), maxX = path[0].x();
    float minY = path[0].y(), maxY = path[0].y();
    for (const auto& p : path) {
        minX = std::min(minX, p.x());
        maxX = std::max(maxX, p.x());
        minY = std::min(minY, p.y());
        maxY = std::max(maxY, p.y());
    }
    
    EXPECT_NEAR(minX, 10.0f, 1e-4f);
    EXPECT_NEAR(maxX, 90.0f, 1e-4f);
    EXPECT_NEAR(minY, 10.0f, 1e-4f);
    EXPECT_NEAR(maxY, 90.0f, 1e-4f);
}

TEST_F(PathNormalizerTest, NormalizeSinglePoint) {
    PathNormalizer normalizer(100.0f, 100.0f, 10.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(5.0f, 5.0f)
    };
    
    normalizer.NormalizePath(path);
    
    EXPECT_EQ(path.size(), 1);
    EXPECT_NEAR(path[0].x(), 50.0f, 1e-4f);
    EXPECT_NEAR(path[0].y(), 50.0f, 1e-4f);
}

TEST_F(PathNormalizerTest, NormalizeWithDifferentMargins) {
    PathNormalizer normalizer1(100.0f, 100.0f, 0.0f);
    PathNormalizer normalizer2(100.0f, 100.0f, 20.0f);
    
    std::vector<SkPoint> path1 = {
        SkPoint::Make(0.0f, 0.0f),
        SkPoint::Make(10.0f, 0.0f),
        SkPoint::Make(10.0f, 10.0f),
        SkPoint::Make(0.0f, 10.0f)
    };
    
    std::vector<SkPoint> path2 = path1;
    
    normalizer1.NormalizePath(path1);
    normalizer2.NormalizePath(path2);
    
    float minX1 = path1[0].x(), maxX1 = path1[0].x();
    float minX2 = path2[0].x(), maxX2 = path2[0].x();
    for (size_t i = 0; i < path1.size(); ++i) {
        minX1 = std::min(minX1, path1[i].x());
        maxX1 = std::max(maxX1, path1[i].x());
        minX2 = std::min(minX2, path2[i].x());
        maxX2 = std::max(maxX2, path2[i].x());
    }
    
    EXPECT_NEAR(minX1, 0.0f, 1e-4f);
    EXPECT_NEAR(maxX1, 100.0f, 1e-4f);
    
    EXPECT_NEAR(minX2, 20.0f, 1e-4f);
    EXPECT_NEAR(maxX2, 80.0f, 1e-4f);
}

TEST_F(PathNormalizerTest, NormalizeVerticalLine) {
    PathNormalizer normalizer(100.0f, 100.0f, 10.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(5.0f, 0.0f),
        SkPoint::Make(5.0f, 10.0f)
    };
    
    normalizer.NormalizePath(path);
    
    EXPECT_NEAR(path[0].x(), 50.0f, 1e-4f);
    EXPECT_NEAR(path[1].x(), 50.0f, 1e-4f);
    
    float minY = std::min(path[0].y(), path[1].y());
    float maxY = std::max(path[0].y(), path[1].y());
    
    EXPECT_NEAR(minY, 10.0f, 1e-4f);
    EXPECT_NEAR(maxY, 90.0f, 1e-4f);
}

TEST_F(PathNormalizerTest, NormalizeHorizontalLine) {
    PathNormalizer normalizer(100.0f, 100.0f, 10.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(0.0f, 5.0f),
        SkPoint::Make(10.0f, 5.0f)
    };
    
    normalizer.NormalizePath(path);
    
    EXPECT_NEAR(path[0].y(), 50.0f, 1e-4f);
    EXPECT_NEAR(path[1].y(), 50.0f, 1e-4f);
    
    float minX = std::min(path[0].x(), path[1].x());
    float maxX = std::max(path[0].x(), path[1].x());
    
    EXPECT_NEAR(minX, 10.0f, 1e-4f);
    EXPECT_NEAR(maxX, 90.0f, 1e-4f);
}

TEST_F(PathNormalizerTest, NormalizeComplexPath) {
    PathNormalizer normalizer(200.0f, 200.0f, 20.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(0.0f, 0.0f),
        SkPoint::Make(10.0f, 5.0f),
        SkPoint::Make(15.0f, 15.0f),
        SkPoint::Make(5.0f, 20.0f),
        SkPoint::Make(-5.0f, 10.0f)
    };
    
    normalizer.NormalizePath(path);
    
    float minX = path[0].x(), maxX = path[0].x();
    float minY = path[0].y(), maxY = path[0].y();
    for (const auto& p : path) {
        minX = std::min(minX, p.x());
        maxX = std::max(maxX, p.x());
        minY = std::min(minY, p.y());
        maxY = std::max(maxY, p.y());
    }
    
    EXPECT_GE(minX, 20.0f);
    EXPECT_LE(maxX, 180.0f);
    EXPECT_GE(minY, 20.0f);
    EXPECT_LE(maxY, 180.0f);
}

TEST_F(PathNormalizerTest, PreservesAspectRatio) {
    PathNormalizer normalizer(200.0f, 100.0f, 10.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(0.0f, 0.0f),
        SkPoint::Make(30.0f, 0.0f),
        SkPoint::Make(30.0f, 10.0f),
        SkPoint::Make(0.0f, 10.0f)
    };
    
    normalizer.NormalizePath(path);
    
    float width = std::abs(path[1].x() - path[0].x());
    float height = std::abs(path[2].y() - path[1].y());
    
    float originalRatio = 30.0f / 10.0f;
    float normalizedRatio = width / height;
    
    EXPECT_NEAR(originalRatio, normalizedRatio, 0.1f);
}

TEST_F(PathNormalizerTest, HandlesLargeCoordinates) {
    PathNormalizer normalizer(100.0f, 100.0f, 10.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(1000.0f, 1000.0f),
        SkPoint::Make(2000.0f, 1000.0f),
        SkPoint::Make(2000.0f, 2000.0f),
        SkPoint::Make(1000.0f, 2000.0f)
    };
    
    normalizer.NormalizePath(path);
    
    float minX = path[0].x(), maxX = path[0].x();
    float minY = path[0].y(), maxY = path[0].y();
    for (const auto& p : path) {
        minX = std::min(minX, p.x());
        maxX = std::max(maxX, p.x());
        minY = std::min(minY, p.y());
        maxY = std::max(maxY, p.y());
    }
    
    EXPECT_NEAR(minX, 10.0f, 1e-4f);
    EXPECT_NEAR(maxX, 90.0f, 1e-4f);
    EXPECT_NEAR(minY, 10.0f, 1e-4f);
    EXPECT_NEAR(maxY, 90.0f, 1e-4f);
}

TEST_F(PathNormalizerTest, HandlesVerySmallCoordinates) {
    PathNormalizer normalizer(100.0f, 100.0f, 10.0f);
    
    std::vector<SkPoint> path = {
        SkPoint::Make(0.0001f, 0.0001f),
        SkPoint::Make(0.0002f, 0.0001f),
        SkPoint::Make(0.0002f, 0.0002f),
        SkPoint::Make(0.0001f, 0.0002f)
    };
    
    normalizer.NormalizePath(path);
    
    float minX = path[0].x(), maxX = path[0].x();
    float minY = path[0].y(), maxY = path[0].y();
    for (const auto& p : path) {
        minX = std::min(minX, p.x());
        maxX = std::max(maxX, p.x());
        minY = std::min(minY, p.y());
        maxY = std::max(maxY, p.y());
    }
    
    EXPECT_NEAR(minX, 10.0f, 1e-2f);
    EXPECT_NEAR(maxX, 90.0f, 1e-2f);
    EXPECT_NEAR(minY, 10.0f, 1e-2f);
    EXPECT_NEAR(maxY, 90.0f, 1e-2f);
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}