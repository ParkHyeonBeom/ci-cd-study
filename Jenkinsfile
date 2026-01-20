pipeline {
    agent none

    environment {
        DOCKER_IMAGE = 'beomiya/cicd-study'
        DOCKER_TAG = "${BUILD_NUMBER}"
        EC2_HOST = "ec2-43-200-4-51.ap-northeast-2.compute.amazonaws.com"
        DEPLOY_PATH = "/home/ubuntu"
    }

    stages {
        stage('Checkout') {
            agent { label 'built-in' }
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            agent { label 'built-in' }
            steps {
                // npm 태스크 스킵 - Docker Multi-stage 빌드에서 React 빌드 처리
                sh './gradlew clean build -x npmInstall -x npmBuild -x copyFrontend'
            }
        }

        stage('Docker Build & Push') {
            agent { label 'built-in' }
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        def image = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}", "--platform linux/amd64 .")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        // ===== Blue-Green 무중단 배포 =====

        stage('Detect Active Environment') {
            agent { label 'deploy' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    script {
                        // 현재 활성 환경 감지 (Blue or Green)
                        env.ACTIVE_ENV = sh(
                            script: """
                                ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                                    CONF_FILE="${DEPLOY_PATH}/nginx-conf/fastcampus-cicd.conf"
                                    if [ -f "\$CONF_FILE" ] && grep -q "app-green" "\$CONF_FILE" 2>/dev/null; then
                                        echo "green"
                                    else
                                        echo "blue"
                                    fi
                                '
                            """,
                            returnStdout: true
                        ).trim()

                        // 배포 대상 환경 결정
                        env.DEPLOY_ENV = (env.ACTIVE_ENV == 'blue') ? 'green' : 'blue'

                        echo "============================================"
                        echo "  Blue-Green Deployment"
                        echo "============================================"
                        echo "  Current Active: ${env.ACTIVE_ENV}"
                        echo "  Deploy Target:  ${env.DEPLOY_ENV}"
                        echo "============================================"
                    }
                }
            }
        }

        stage('Deploy to Standby Environment') {
            agent { label 'deploy' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            echo "[Step 1] Pulling new image..."
                            docker pull ${DOCKER_IMAGE}:${DOCKER_TAG}

                            echo "[Step 2] Deploying to ${env.DEPLOY_ENV}..."
                            cd ${DEPLOY_PATH}
                            export IMAGE=${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker-compose -f docker-compose-app.yml up -d app-${env.DEPLOY_ENV}

                            echo "Deployment to ${env.DEPLOY_ENV} initiated."
                        '
                    """
                }
            }
        }

        stage('Health Check') {
            agent { label 'deploy' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            echo "[Step 3] Running health check for ${env.DEPLOY_ENV}..."

                            MAX_RETRIES=10
                            RETRY_INTERVAL=5
                            HEALTH_URL="http://app-${env.DEPLOY_ENV}:8080/health"

                            for i in \$(seq 1 \$MAX_RETRIES); do
                                if docker exec api-gateway curl -sf "\$HEALTH_URL" > /dev/null 2>&1; then
                                    echo "Health check PASSED! (${env.DEPLOY_ENV})"
                                    exit 0
                                fi
                                echo "Attempt \$i/\$MAX_RETRIES: Waiting \${RETRY_INTERVAL}s..."
                                sleep \$RETRY_INTERVAL
                            done

                            echo "Health check FAILED for ${env.DEPLOY_ENV}!"
                            exit 1
                        '
                    """
                }
            }
        }

        stage('Switch Traffic') {
            agent { label 'deploy' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            echo "[Step 4] Switching traffic to ${env.DEPLOY_ENV}..."

                            NGINX_CONF_DIR="${DEPLOY_PATH}/nginx-conf"

                            # 트래픽 전환 설정 파일 선택
                            if [ "${env.DEPLOY_ENV}" = "green" ]; then
                                CONF_FILE="blue-shutdown.conf"
                            else
                                CONF_FILE="green-shutdown.conf"
                            fi

                            # Nginx 설정 업데이트
                            cp "\${NGINX_CONF_DIR}/\${CONF_FILE}" "\${NGINX_CONF_DIR}/fastcampus-cicd.conf"
                            docker exec api-gateway nginx -s reload

                            echo "============================================"
                            echo "  Traffic switched to ${env.DEPLOY_ENV}!"
                            echo "============================================"
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "============================================"
            echo "  Blue-Green Deployment SUCCESSFUL!"
            echo "============================================"
            echo "  Active:  ${env.DEPLOY_ENV} (new version)"
            echo "  Standby: ${env.ACTIVE_ENV} (rollback ready)"
            echo "============================================"
        }
        failure {
            echo "============================================"
            echo "  Deployment FAILED!"
            echo "============================================"
            echo "  Current active environment (${env.ACTIVE_ENV}) is still serving traffic."
            echo "  No rollback needed - traffic was not switched."
            echo "============================================"
        }
    }
}
