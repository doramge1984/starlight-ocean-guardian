#!/usr/bin/env bash
# 별빛 바다 지킴이 - GitHub Personal Access Token 기반 자동 저장소 생성 및 푸시 스크립트

set -e

TOKEN="$1"
REPO_NAME="${2:-starlight-ocean-guardian}"

if [ -z "$TOKEN" ]; then
  echo "사용법: $0 <GitHub_Personal_Access_Token> [저장소이름]"
  echo "예시: $0 ghp_xxxxxxxxxxxxxxxxxxxx starlight-ocean-guardian"
  exit 1
fi

echo ">> 1. GitHub 토큰 유효성 검증 중..."
USER_INFO=$(curl -s -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" https://api.github.com/user)
USERNAME=$(echo "$USER_INFO" | grep -o '"login": *"[^"]*"' | head -1 | cut -d '"' -f 4)

if [ -z "$USERNAME" ]; then
  echo "❌ 토큰 인증에 실패했습니다. 올바른 토큰인지 확인해 주세요."
  echo "응답: $USER_INFO"
  exit 1
fi

echo "✅ 인증 성공! 깃허브 계정: $USERNAME"

echo ">> 2. 저장소 '$REPO_NAME' 확인 및 자동 생성..."
CHECK_REPO=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "https://api.github.com/repos/$USERNAME/$REPO_NAME")

if [ "$CHECK_REPO" = "404" ]; then
  echo "저장소가 존재하지 않아 새로 생성합니다..."
  CREATE_RESP=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO_NAME\",\"description\":\"별빛 바다 지킴이: 과학으로 되살리는 바다 (3D 메타버스 환경 과학 게임)\",\"private\":false}")
  echo "✅ 새 깃허브 저장소 생성 완료: https://github.com/$USERNAME/$REPO_NAME"
else
  echo "기존 저장소 '$REPO_NAME' 발견!"
fi

echo ">> 3. Git 원격 저장소(origin) 연결..."
REMOTE_URL="https://$TOKEN@github.com/$USERNAME/$REPO_NAME.git"

if git remote | grep -q 'origin'; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

echo ">> 4. main 브랜치로 최신 코드 자동 푸시..."
git branch -M main
git push -u origin main

echo ">> 5. 원격 URL에서 토큰 노출 방지를 위해 정리..."
git remote set-url origin "https://github.com/$USERNAME/$REPO_NAME.git"

echo ""
echo "🎉 [완료] GitHub에 모든 코드가 성공적으로 업로드되었습니다!"
echo "📍 저장소 주소: https://github.com/$USERNAME/$REPO_NAME"
echo "🌐 GitHub Pages는 저장소 Settings > Pages > Source를 'GitHub Actions'로 지정하시면 자동으로 배포됩니다."
