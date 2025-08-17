# EC2 배포 가이드

## 사전 요구사항

### 1. EC2 인스턴스 설정
- Ubuntu 20.04 LTS 이상
- Docker 및 Docker Compose 설치
- 보안 그룹에서 포트 3000, 5432, 6379 열기

### 2. GitHub Secrets 설정
Repository Settings > Secrets and variables > Actions에서 다음을 설정:

```
EC2_HOST: EC2 인스턴스의 퍼블릭 IP
EC2_USERNAME: SSH 사용자명 (보통 ubuntu)
EC2_SSH_KEY: EC2 접속용 SSH 프라이빗 키
EC2_PORT: SSH 포트 (기본값: 22)
```

## 🔧 EC2 서버 설정

### 1. Docker 설치
```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 재로그인 또는 재부팅
```

### 2. 환경 변수 파일 생성
```bash
# 프로덕션 환경 변수 파일 생성
sudo nano .env.production
```

`.env.production` 내용:
```env
# Database Configuration
DB_HOST=14.50.160.43
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=runova
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Application Configuration
NODE_ENV=production
PORT=3000

# Docker Registry
REGISTRY=ghcr.io
IMAGE_NAME=runova-backend
TAG=latest
```

## 배포 프로세스

### 1. 자동 배포 (GitHub Actions)
- `main` 또는 `develop` 브랜치에 push하면 자동으로 배포됩니다.
- GitHub Actions가 Docker 이미지를 빌드하고 EC2에 배포합니다.

### 2. 수동 배포
```bash
# 배포 스크립트 실행
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 또는 Docker Compose 직접 실행
docker-compose -f docker-compose.prod.yml up -d
```

## 모니터링

### 1. 서비스 상태 확인
```bash
# 컨테이너 상태 확인
docker ps

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f api

# 헬스체크
curl http://localhost:3000/health
```

### 2. 리소스 모니터링
```bash
# 시스템 리소스 확인
docker stats

# 디스크 사용량 확인
df -h
```

## 롤백

### 1. 이전 버전으로 롤백
```bash
# 특정 태그로 롤백
export TAG=previous-tag
./scripts/deploy.sh
```

### 2. 긴급 롤백
```bash
# 이전 이미지로 즉시 롤백
docker tag $REGISTRY/$IMAGE_NAME:previous-tag $REGISTRY/$IMAGE_NAME:latest
docker-compose -f docker-compose.prod.yml up -d
```

## 문제 해결

### 1. 일반적인 문제들
- **포트 충돌**: `netstat -tulpn | grep :3000`
- **권한 문제**: `sudo chown -R $USER:$USER .`
- **디스크 공간**: `docker system prune -a`

### 2. 로그 분석
```bash
# API 로그
docker logs runova-backend

# 데이터베이스 로그
docker logs runova-postgres

# Redis 로그
docker logs runova-redis
```

## 주의사항

1. **보안**: `.env.production` 파일은 절대 Git에 커밋하지 마세요.
2. **백업**: 정기적으로 데이터베이스 백업을 수행하세요.
3. **모니터링**: 서비스 상태를 지속적으로 모니터링하세요.
4. **롤백 계획**: 배포 전 롤백 계획을 준비하세요.
