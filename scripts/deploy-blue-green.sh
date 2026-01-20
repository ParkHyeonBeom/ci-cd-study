#!/bin/bash
#
# Blue-Green 무중단 배포 스크립트
#
# 사용법: ./deploy-blue-green.sh <docker_image>
# 예시:   ./deploy-blue-green.sh beomiya/cicd-study:42

set -e

# ===== 설정 =====
IMAGE_TAG="${1:-beomiya/cicd-study:latest}"
COMPOSE_FILE="${DEPLOY_PATH:-/home/ubuntu}/docker-compose-app.yml"
NGINX_CONF_DIR="${DEPLOY_PATH:-/home/ubuntu}/nginx-conf"
ACTIVE_CONF="${NGINX_CONF_DIR}/fastcampus-cicd.conf"

MAX_HEALTH_RETRIES=10
HEALTH_RETRY_INTERVAL=5

# ===== 함수 정의 =====

# 현재 활성 환경 감지
get_active_env() {
    if grep -q "app-green" "$ACTIVE_CONF" 2>/dev/null; then
        echo "green"
    else
        echo "blue"
    fi
}

# 헬스체크
health_check() {
    local target_env=$1
    local health_url="http://app-${target_env}:8080/health"

    echo "Starting health check for $target_env..."

    for i in $(seq 1 $MAX_HEALTH_RETRIES); do
        if docker exec api-gateway curl -sf "$health_url" > /dev/null 2>&1; then
            echo "Health check passed! ($target_env)"
            return 0
        fi
        echo "Attempt $i/$MAX_HEALTH_RETRIES failed. Waiting ${HEALTH_RETRY_INTERVAL}s..."
        sleep $HEALTH_RETRY_INTERVAL
    done

    echo "Health check FAILED for $target_env"
    return 1
}

# 트래픽 전환
switch_traffic() {
    local target_env=$1
    local conf_file=""

    case $target_env in
        "blue")
            conf_file="green-shutdown.conf"
            ;;
        "green")
            conf_file="blue-shutdown.conf"
            ;;
        "both")
            conf_file="all-up.conf"
            ;;
        *)
            echo "Unknown target: $target_env"
            return 1
            ;;
    esac

    echo "Switching traffic to: $target_env"
    cp "${NGINX_CONF_DIR}/${conf_file}" "$ACTIVE_CONF"
    docker exec api-gateway nginx -s reload
    echo "Traffic switched successfully!"
}

# ===== 메인 로직 =====

main() {
    echo "============================================"
    echo "  Blue-Green Deployment"
    echo "  Image: $IMAGE_TAG"
    echo "============================================"

    # 1. 현재 상태 확인
    local active_env=$(get_active_env)
    local deploy_env=""

    if [ "$active_env" = "blue" ]; then
        deploy_env="green"
    else
        deploy_env="blue"
    fi

    echo ""
    echo "[Step 1] Current Status"
    echo "  Active:  $active_env"
    echo "  Deploy:  $deploy_env"

    # 2. 새 이미지 Pull
    echo ""
    echo "[Step 2] Pulling new image..."
    docker pull "$IMAGE_TAG"

    # 3. 대기 환경에 배포
    echo ""
    echo "[Step 3] Deploying to $deploy_env..."
    export IMAGE="$IMAGE_TAG"
    docker-compose -f "$COMPOSE_FILE" up -d "app-${deploy_env}"

    # 4. 헬스체크
    echo ""
    echo "[Step 4] Running health check..."
    if ! health_check "$deploy_env"; then
        echo ""
        echo "ERROR: Health check failed!"
        echo "Rolling back deployment..."
        docker-compose -f "$COMPOSE_FILE" stop "app-${deploy_env}"
        exit 1
    fi

    # 5. 트래픽 전환
    echo ""
    echo "[Step 5] Switching traffic..."
    switch_traffic "$deploy_env"

    # 6. 완료
    echo ""
    echo "============================================"
    echo "  Deployment Completed Successfully!"
    echo ""
    echo "  Active:  $deploy_env (new)"
    echo "  Standby: $active_env (rollback ready)"
    echo "============================================"
}

main
