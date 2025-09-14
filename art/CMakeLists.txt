enable_testing()
find_package(GTest REQUIRED)
include_directories(${GTEST_INCLUDE_DIRS})
cmake_minimum_required(VERSION 3.30)
project(art)

set(CMAKE_CXX_STANDARD 17)

set(SKIA_DIR /Users/hoseok/repos/skia)
set(SKIA_INCLUDE_DIR ${SKIA_DIR})
set(SKIA_LIB ${SKIA_DIR}/out/Static/libskia.a)

include_directories(${SKIA_INCLUDE_DIR})

include(FetchContent)
FetchContent_Declare(
        googletest
        URL https://github.com/google/googletest/archive/release-1.12.1.zip
)
FetchContent_MakeAvailable(googletest)
find_package(GTest CONFIG REQUIRED)

add_executable(${PROJECT_NAME}
        src/main.cpp
        src/PathNormalizer.cpp
        src/PathNormalizer.h
        src/BgStar.h
        src/BgStarFactory.cpp
        src/BgStarFactory.h
        src/BgStarPainter.cpp
        src/BgStarPainter.h
        src/BgStarStyle.h
        src/BgStarTintFactory.cpp
        src/BgStarTintFactory.h
        src/LineStyle.h
        src/LinePainter.cpp
        src/LinePainter.h
        src/ConstellationPainter.cpp
        src/ConstellationPainter.h
        src/ConstellationStyle.h

)
target_link_libraries(${PROJECT_NAME} PRIVATE ${SKIA_LIB})

# Test executable
add_executable(PathNormalizerTest
        test/PathNormalizerTest.cpp
        src/PathNormalizer.cpp
        src/PathNormalizer.h
)

target_link_libraries(PathNormalizerTest
        PRIVATE
        GTest::gtest
        GTest::gtest_main
        ${SKIA_LIB}
        "-framework CoreFoundation"
        "-framework CoreGraphics"
        "-framework CoreText"
        "-framework CoreServices"
)

include(GoogleTest)
gtest_discover_tests(PathNormalizerTest)