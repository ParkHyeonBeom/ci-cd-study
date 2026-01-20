#!/bin/bash
#
# 트래픽 전환 스크립트
# 지정된 환경으로 트래픽 전환
#
# 사용법: ./switch-traffic.sh <blue|green|both>
# 예시:   ./switch-traffic.sh green

set -e

TARGET="${1:-}"
NGINX_CONF_DIR="${DEPLOY_PATH:-/home/ubuntu}/nginx-conf"
ACTIVE_CONF="${NGINX_CONF_DIR}/fastcampus-cicd.conf"

# 사용법 출력
usage() {
    echo "Usage: $0 <blue|green|both>"
    echo ""
    echo "Options:"
    echo "  blue   - Route all traffic to Blue environment"
    echo "  green  - Route all traffic to Green environment"
    echo "  both   - Route traffic to both environments (load balancing)"
    exit 1
}

# 인자 검증
if [ -z "$TARGET" ]; then
    usage
fi

case $TARGET in
    "blue")
        CONF_FILE="green-shutdown.conf"
        DESC="Blue only"
        ;;
    "green")
        CONF_FILE="blue-shutdown.conf"
        DESC="Green only"
        ;;
    "both")
        CONF_FILE="all-up.conf"
        DESC="Blue + Green (load balanced)"
        ;;
    *)
        echo "Error: Unknown target '$TARGET'"
        usage
        ;;
esac

echo "============================================"
echo "  Traffic Switch"
echo "============================================"
echo "  Target:      $TARGET"
echo "  Description: $DESC"
echo "  Config:      $CONF_FILE"
echo "============================================"
echo ""

# 설정 파일 복사
echo "Copying configuration..."
cp "${NGINX_CONF_DIR}/${CONF_FILE}" "$ACTIVE_CONF"

# Nginx 리로드
echo "Reloading Nginx..."
docker exec api-gateway nginx -s reload

echo ""
echo "============================================"
echo "  Traffic Switch Completed!"
echo "============================================"
echo "  Active: $DESC"
echo "============================================"
