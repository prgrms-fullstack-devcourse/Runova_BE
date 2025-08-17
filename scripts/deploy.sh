#!/bin/bash

# 배포 스크립트
set -e

echo "🚀 Runova Backend 배포 시작..."

# 환경 변수 설정
export REGISTRY=${REGISTRY:-ghcr.io}
export IMAGE_NAME=${IMAGE_NAME:-runova-backend}
export TAG=${TAG:-latest}

# 기존 컨테이너 중지 및 제거
echo "📦 기존 컨테이너 정리 중..."
docker stop runova-backend runova-postgres runova-redis 2>/dev/null || true
docker rm runova-backend runova-postgres runova-redis 2>/dev/null || true

# 최신 이미지 pull
echo "📥 Docker 이미지 다운로드 중..."
docker pull $REGISTRY/$IMAGE_NAME:$TAG

# 환경 변수 파일 확인
if [ ! -f .env.production ]; then
    echo "❌ .env.production 파일이 없습니다!"
    exit 1
fi

# Docker Compose로 서비스 시작
echo "🚀 서비스 시작 중..."
docker-compose -f docker-compose.prod.yml up -d

# 헬스체크
echo "🏥 헬스체크 중..."
sleep 10

# API 서비스 상태 확인
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 배포 성공! API 서비스가 정상적으로 실행 중입니다."
else
    echo "❌ 배포 실패! API 서비스가 응답하지 않습니다."
    docker-compose -f docker-compose.prod.yml logs api
    exit 1
fi

echo "🎉 배포 완료!"
