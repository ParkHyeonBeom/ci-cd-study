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
            agent { label 'worker-1' }
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            agent { label 'worker-1' }
            steps {
                // npm 태스크 스킵 - Docker Multi-stage 빌드에서 React 빌드 처리
                sh './gradlew clean build -x npmInstall -x npmBuild -x copyFrontend'
            }
        }

        stage('Docker Build & Push') {
            agent { label 'worker-1' }
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
            agent { label 'worker-1' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    script {
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

        stage('Sync Config Files') {
            agent { label 'worker-1' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        echo "[Step 0] Syncing config files to EC2..."
                        scp -o StrictHostKeyChecking=no docker-compose-app.yml nginx.conf ubuntu@${EC2_HOST}:${DEPLOY_PATH}/
                        scp -o StrictHostKeyChecking=no -r nginx-conf ubuntu@${EC2_HOST}:${DEPLOY_PATH}/
                        scp -o StrictHostKeyChecking=no src/main/resources/application-blue.yml src/main/resources/application-green.yml ubuntu@${EC2_HOST}:${DEPLOY_PATH}/

                        # fastcampus-cicd.conf가 없으면 초기 생성 (Blue 활성화)
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            if [ ! -f ${DEPLOY_PATH}/nginx-conf/fastcampus-cicd.conf ]; then
                                echo "Creating initial fastcampus-cicd.conf..."
                                cp ${DEPLOY_PATH}/nginx-conf/green-shutdown.conf ${DEPLOY_PATH}/nginx-conf/fastcampus-cicd.conf
                            fi
                        '
                        echo "Config files synced successfully."
                    """
                }
            }
        }

        stage('Deploy to Standby Environment') {
            agent { label 'worker-1' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            echo "[Step 1] Pulling new image..."
                            sudo docker pull ${DOCKER_IMAGE}:${DOCKER_TAG}

                            cd ${DEPLOY_PATH}

                            echo "[Step 2] Ensuring api-gateway is running (no recreate)..."
                            sudo docker-compose -f docker-compose-app.yml up -d --no-recreate api-gateway

                            echo "[Step 3] Deploying ${env.DEPLOY_ENV} with new image..."
                            export IMAGE=${DOCKER_IMAGE}:${DOCKER_TAG}
                            sudo -E docker-compose -f docker-compose-app.yml up -d --no-deps --force-recreate app-${env.DEPLOY_ENV}

                            echo "Deployment to ${env.DEPLOY_ENV} initiated."
                        '
                    """
                }
            }
        }

        stage('Health Check') {
            agent { label 'worker-1' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            echo "[Step 3] Running health check for ${env.DEPLOY_ENV}..."

                            MAX_RETRIES=30
                            RETRY_INTERVAL=5
                            HEALTH_URL="http://app-${env.DEPLOY_ENV}:8080/health"

                            for i in \$(seq 1 \$MAX_RETRIES); do
                                if sudo docker exec api-gateway curl -sf "\$HEALTH_URL" > /dev/null 2>&1; then
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
            agent { label 'worker-1' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            echo "[Step 4] Switching traffic to ${env.DEPLOY_ENV}..."

                            NGINX_CONF_DIR="${DEPLOY_PATH}/nginx-conf"

                            if [ "${env.DEPLOY_ENV}" = "green" ]; then
                                CONF_FILE="blue-shutdown.conf"
                            else
                                CONF_FILE="green-shutdown.conf"
                            fi

                            cp "\${NGINX_CONF_DIR}/\${CONF_FILE}" "\${NGINX_CONF_DIR}/fastcampus-cicd.conf"
                            sudo docker exec api-gateway nginx -s reload

                            echo "============================================"
                            echo "  Traffic switched to ${env.DEPLOY_ENV}!"
                            echo "============================================"
                        '
                    """
                }
            }
        }

        // ===== 정리 작업 =====

        stage('Stop Old Environment') {
            agent { label 'worker-1' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            echo "[Step 5] Stopping old environment (${env.ACTIVE_ENV})..."

                            cd ${DEPLOY_PATH}
                            sudo docker-compose -f docker-compose-app.yml stop app-${env.ACTIVE_ENV}

                            echo "Old environment (${env.ACTIVE_ENV}) stopped."
                        '
                    """
                }
            }
        }

        stage('Cleanup Old Images') {
            agent { label 'worker-1' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            echo "[Step 6] Cleaning up unused Docker images..."

                            sudo docker image prune -f

                            sudo docker images ${DOCKER_IMAGE} --format "{{.Tag}}" | \\
                                grep -E "^[0-9]+\$" | \\
                                sort -rn | \\
                                tail -n +4 | \\
                                xargs -I {} sudo docker rmi ${DOCKER_IMAGE}:{} 2>/dev/null || true

                            echo "[Cleanup] Done!"
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
            echo "  Standby: ${env.ACTIVE_ENV} (stopped, rollback ready)"
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
