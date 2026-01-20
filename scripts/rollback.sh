#!/bin/bash
#
# 즉시 롤백 스크립트
# 현재 활성 환경의 반대 환경으로 트래픽 전환
#
# 사용법: ./rollback.sh

set -e

NGINX_CONF_DIR="${DEPLOY_PATH:-/home/ubuntu}/nginx-conf"
ACTIVE_CONF="${NGINX_CONF_DIR}/fastcampus-cicd.conf"

# 현재 활성 환경 확인
if grep -q "app-green" "$ACTIVE_CONF" 2>/dev/null; then
    ACTIVE="green"
    ROLLBACK="blue"
    CONF_FILE="green-shutdown.conf"
else
    ACTIVE="blue"
    ROLLBACK="green"
    CONF_FILE="blue-shutdown.conf"
fi

echo "============================================"
echo "  Rollback"
echo "============================================"
echo "  Current Active: $ACTIVE"
echo "  Rollback to:    $ROLLBACK"
echo ""

# 확인 프롬프트 (자동화 시에는 -y 옵션 추가 가능)
if [ "$1" != "-y" ]; then
    read -p "Proceed with rollback? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Rollback cancelled."
        exit 0
    fi
fi

# 트래픽 전환
echo "Switching traffic..."
cp "${NGINX_CONF_DIR}/${CONF_FILE}" "$ACTIVE_CONF"
docker exec api-gateway nginx -s reload

echo ""
echo "============================================"
echo "  Rollback Completed!"
echo "============================================"
echo "  Active:  $ROLLBACK"
echo "  Standby: $ACTIVE"
echo "============================================"
