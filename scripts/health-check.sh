#!/bin/bash
#
# 헬스체크 스크립트
#
# 사용법: ./health-check.sh <blue|green> [max_retries] [retry_interval]
# 예시:   ./health-check.sh green 10 5

set -e

TARGET_ENV="${1:-blue}"
MAX_RETRIES="${2:-10}"
RETRY_INTERVAL="${3:-5}"

HEALTH_URL="http://app-${TARGET_ENV}:8080/health"

echo "============================================"
echo "  Health Check"
echo "============================================"
echo "  Target:   $TARGET_ENV"
echo "  URL:      $HEALTH_URL"
echo "  Retries:  $MAX_RETRIES"
echo "  Interval: ${RETRY_INTERVAL}s"
echo "============================================"
echo ""

for i in $(seq 1 $MAX_RETRIES); do
    response=$(docker exec api-gateway curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")

    if [ "$response" = "200" ]; then
        echo ""
        echo "============================================"
        echo "  SUCCESS: Health check passed!"
        echo "  Response: HTTP $response"
        echo "============================================"
        exit 0
    fi

    echo "Attempt $i/$MAX_RETRIES: HTTP $response - Waiting ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

echo ""
echo "============================================"
echo "  FAILED: Health check failed!"
echo "  Target $TARGET_ENV did not respond 200"
echo "============================================"
exit 1
