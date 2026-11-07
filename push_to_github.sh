#!/usr/bin/env bash
# 별빛 바다 지킴이 - GitHub 저장소 연결 및 원클릭 푸시 스크립트
# 사용법:
# ./push_to_github.sh <깃허브_저장소_URL>
# 예시: ./push_to_github.sh https://github.com/doramge1984/starlight-ocean-guardian.git

set -e

REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
  echo "사용법: $0 <GitHub 저장소 URL>"
  echo "예시: $0 https://github.com/doramge1984/starlight-ocean-guardian.git"
  exit 1
fi

echo ">> 깃허브 원격 저장소(origin) 설정: $REPO_URL"
if git remote | grep -q 'origin'; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

echo ">> 브랜치 확인 (main)..."
git branch -M main

echo ">> 깃허브로 푸시 중..."
git push -u origin main

echo "✅ 성공적으로 깃허브에 업로드되었습니다!"
echo ">> GitHub 저장소 설정 > Pages 에서 'GitHub Actions'를 활성화하면 자동으로 배포됩니다."
