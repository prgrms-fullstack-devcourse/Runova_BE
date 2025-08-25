# Runova_BE

## 배포 (GitHub Actions)

- 브랜치: `main` 푸시 시 자동으로 실행됩니다. 수동 실행은 Actions 탭에서 Run workflow.
- 준비할 시크릿
  - `EC2_HOST`, `EC2_USERNAME`, `EC2_SSH_KEY`, `EC2_PORT`
  - `REMOTE_DIR` (EC2에서 이 저장소가 체크아웃된 경로)
- 컨테이너 이미지는 GHCR `ghcr.io/<owner>/<repo>`에 `latest`, 브랜치/sha 태그로 푸시됩니다.

### 서버 준비
```bash
sudo mkdir -p /srv/runova
cd /srv/runova
git clone <repo> .
cp .env.production.example .env.production  # 값 채우기
```

### 수동 점검
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --wait
curl -f http://localhost:3000/health
```