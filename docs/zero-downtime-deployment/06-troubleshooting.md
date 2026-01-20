# 06. 트러블슈팅 가이드

이 문서는 Jenkins CI/CD 파이프라인과 Blue-Green 배포를 구축하면서 발생한 문제들과 해결 방법을 정리합니다.

---

## 목차

1. [SSH 호스트 키 불일치](#1-ssh-호스트-키-불일치)
2. [Docker 권한 오류 (Jenkins Worker)](#2-docker-권한-오류-jenkins-worker)
3. [Docker 권한 오류 (EC2)](#3-docker-권한-오류-ec2)
4. [EC2 설정 파일 없음](#4-ec2-설정-파일-없음)
5. [api-gateway 컨테이너 없음](#5-api-gateway-컨테이너-없음)
6. [SSH 키 인증 실패](#6-ssh-키-인증-실패)
7. [Docker 플랫폼 불일치](#7-docker-플랫폼-불일치)
8. [포트 충돌](#8-포트-충돌)
9. [Nginx reload 실패](#9-nginx-reload-실패)
10. [헬스체크 타임아웃](#10-헬스체크-타임아웃)

---

## 1. SSH 호스트 키 불일치

### 증상

```
[SSH] The SSH key presented by the remote host does not match the key saved in the Known Hosts file against this host.
Key exchange was not finished, connection is closed.
SSH Connection failed with IOException
```

Jenkins에서 Worker 노드로 연결 시도 시 발생

### 원인

- Worker 컨테이너(`worker-1`)가 재생성되면서 새로운 SSH 호스트 키가 생성됨
- Jenkins Master의 `known_hosts`에는 이전 컨테이너의 호스트 키가 저장되어 있어 불일치 발생

### 해결 방법

```bash
# 1. Jenkins 컨테이너에서 기존 known_hosts 항목 삭제
docker exec ci-cd-study-jenkins-1 ssh-keygen -R worker-1

# 2. 새 호스트 키 등록
docker exec ci-cd-study-jenkins-1 bash -c \
  "ssh-keyscan -H worker-1 >> /var/jenkins_home/.ssh/known_hosts"
```

### 한 줄로 처리

```bash
docker exec ci-cd-study-jenkins-1 bash -c \
  "ssh-keygen -R worker-1 2>/dev/null; ssh-keyscan -H worker-1 >> /var/jenkins_home/.ssh/known_hosts 2>/dev/null"
```

### 예방 방법

Worker 컨테이너 재빌드 후에는 항상 known_hosts를 갱신해야 합니다.

```bash
# docker-compose로 worker 재시작 후
docker-compose up -d --build worker-1

# 반드시 known_hosts 갱신
docker exec ci-cd-study-jenkins-1 bash -c \
  "ssh-keygen -R worker-1 2>/dev/null; ssh-keyscan -H worker-1 >> /var/jenkins_home/.ssh/known_hosts 2>/dev/null"
```

---

## 2. Docker 권한 오류 (Jenkins Worker)

### 증상

```
ERROR: permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock
```

Jenkins Worker에서 `docker build` 또는 `docker push` 실행 시 발생

### 원인

- Worker 컨테이너 내의 `jenkins` 유저가 Docker 소켓에 접근할 권한이 없음
- `/var/run/docker.sock`은 호스트에서 마운트되었지만, 컨테이너 내 jenkins 유저는 권한이 없음

### 해결 방법

**Dockerfile.jenkins-agent 수정:**

```dockerfile
FROM jenkins/ssh-agent:latest-jdk21

USER root

# Docker CLI 설치
RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian bookworm stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

# jenkins 유저에게 docker 소켓 접근 권한 부여
RUN usermod -aG root jenkins
```

**컨테이너 재빌드:**

```bash
docker-compose up -d --build worker-1
```

### 참고

- Docker Desktop on Mac에서는 docker.sock이 `root:root` 소유
- `usermod -aG root jenkins`로 jenkins 유저를 root 그룹에 추가하여 해결
- Linux 서버에서는 `usermod -aG docker jenkins`가 더 적절할 수 있음

---

## 3. Docker 권한 오류 (EC2)

### 증상

```
permission denied while trying to connect to the docker API at unix:///var/run/docker.sock
unable to get image 'beomiya/cicd-study:21': permission denied
```

EC2에서 `docker pull` 또는 `docker-compose up` 실행 시 발생

### 원인

- EC2의 `ubuntu` 유저가 docker 그룹에 속하지 않음
- Jenkins에서 SSH로 접속하여 docker 명령 실행 시 권한 없음

### 해결 방법

**방법 1: sudo 사용 (즉시 적용)**

Jenkinsfile에서 모든 docker 명령에 `sudo` 추가:

```groovy
sh """
    ssh -o StrictHostKeyChecking=no ubuntu@\${EC2_HOST} '
        sudo docker pull \${DOCKER_IMAGE}:\${DOCKER_TAG}
        sudo -E docker-compose -f docker-compose-app.yml up -d
    '
"""
```

> `-E` 옵션: 환경변수(IMAGE 등)를 sudo 실행 시에도 유지

**방법 2: ubuntu 유저를 docker 그룹에 추가 (영구 적용)**

EC2에 접속하여:

```bash
sudo usermod -aG docker ubuntu
# 새 세션에서 적용됨 (재로그인 필요)
```

---

## 4. EC2 설정 파일 없음

### 증상

```
open /home/ubuntu/docker-compose-app.yml: no such file or directory
```

EC2에서 `docker-compose up` 실행 시 발생

### 원인

- Jenkins 파이프라인이 EC2에 SSH로 접속하여 `docker-compose`를 실행하지만
- 필요한 설정 파일들(`docker-compose-app.yml`, `nginx.conf`, `nginx-conf/` 등)이 EC2에 없음

### 해결 방법

**Jenkinsfile에 파일 동기화 스테이지 추가:**

```groovy
stage('Sync Config Files') {
    agent { label 'worker-1' }
    steps {
        sshagent(['ec2-ssh-key']) {
            sh """
                echo "[Step 0] Syncing config files to EC2..."
                scp -o StrictHostKeyChecking=no docker-compose-app.yml nginx.conf ubuntu@\${EC2_HOST}:\${DEPLOY_PATH}/
                scp -o StrictHostKeyChecking=no -r nginx-conf ubuntu@\${EC2_HOST}:\${DEPLOY_PATH}/
                scp -o StrictHostKeyChecking=no src/main/resources/application-blue.yml src/main/resources/application-green.yml ubuntu@\${EC2_HOST}:\${DEPLOY_PATH}/
                echo "Config files synced successfully."
            """
        }
    }
}
```

### EC2 볼륨 경로 수정

`docker-compose-app.yml`의 볼륨 경로도 EC2 환경에 맞게 수정:

```yaml
# 변경 전 (로컬 개발 환경)
volumes:
  - ./src/main/resources/application-blue.yml:/application.yml

# 변경 후 (EC2 환경)
volumes:
  - ./application-blue.yml:/application.yml
```

---

## 5. api-gateway 컨테이너 없음

### 증상

```
Health check FAILED for green!
```

헬스체크가 계속 실패하며, `docker exec api-gateway` 명령이 실패

### 원인

- Deploy 단계에서 `app-green`만 시작하고 `api-gateway`를 시작하지 않음
- 헬스체크는 `api-gateway`를 통해 `app-green`에 접근하려고 함

### 해결 방법

**Deploy 단계에서 api-gateway도 함께 시작:**

```groovy
// 변경 전
docker-compose -f docker-compose-app.yml up -d app-${env.DEPLOY_ENV}

// 변경 후
docker-compose -f docker-compose-app.yml up -d app-${env.DEPLOY_ENV} api-gateway
```

---

## 6. SSH 키 인증 실패

### 증상

```
Server rejected the private key
```

또는

```
Permission denied (publickey)
```

### 원인

- Jenkins SSH 플러그인이 OpenSSH 형식 키를 인식하지 못함
- 또는 EC2의 `authorized_keys`에 공개키가 없음

### 해결 방법

**OpenSSH → PEM 형식 변환:**

```bash
# OpenSSH 형식 확인
head -1 ~/.ssh/id_rsa
# -----BEGIN OPENSSH PRIVATE KEY-----

# PEM 형식으로 변환
ssh-keygen -p -m PEM -f ~/.ssh/id_rsa -N "" -P ""

# 변환 후 확인
head -1 ~/.ssh/id_rsa
# -----BEGIN RSA PRIVATE KEY-----
```

**Jenkins Credentials 재등록:**

1. Jenkins → Manage Jenkins → Credentials
2. 기존 SSH 키 삭제
3. 새로운 PEM 형식 키로 다시 등록

---

## 7. Docker 플랫폼 불일치

### 증상

```
WARNING: The requested image's platform (linux/arm64) does not match the detected host platform (linux/amd64)
```

Mac(M1/M2)에서 빌드한 이미지를 EC2(x86)에서 실행 시 발생

### 해결 방법

**빌드 시 플랫폼 명시:**

```groovy
docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}", "--platform linux/amd64 .")
```

**실행 시 플랫폼 명시 (필요한 경우):**

```bash
docker run --platform linux/amd64 beomiya/cicd-study:latest
```

---

## 8. 포트 충돌

### 증상

```
failed to bind host port 8080: address already in use
```

### 해결 방법

```bash
# 해당 포트 사용 컨테이너 확인 및 정리
docker stop $(docker ps -q --filter publish=8080) || true
docker rm $(docker ps -aq --filter publish=8080) || true

# 일반 프로세스인 경우
sudo lsof -i :8080
sudo kill <PID>
```

---

## 9. Nginx reload 실패

### 증상

```
nginx: [error] open() "/run/nginx.pid" failed
```

### 해결 방법

```bash
# Nginx 컨테이너 재시작
docker restart api-gateway
```

---

## 10. 헬스체크 타임아웃

### 증상

```
Attempt 10/10: Waiting 5s...
Health check FAILED for green!
```

Spring Boot 앱이 시작되기 전에 헬스체크가 모두 실패

### 해결 방법

**Jenkinsfile에서 재시도 횟수/간격 조정:**

```groovy
MAX_RETRIES=20      # 10 → 20
RETRY_INTERVAL=10   # 5 → 10
```

**또는 Spring Boot 시작 시간 최적화:**

```yaml
# application.yml
spring:
  main:
    lazy-initialization: true  # 지연 초기화
```

---

## 빠른 참조 명령어

### Jenkins Worker SSH 키 갱신

```bash
docker exec ci-cd-study-jenkins-1 bash -c \
  "ssh-keygen -R worker-1 2>/dev/null; ssh-keyscan -H worker-1 >> /var/jenkins_home/.ssh/known_hosts 2>/dev/null"
```

### Worker 컨테이너 재빌드

```bash
docker-compose up -d --build worker-1
```

### EC2 Docker 권한 확인

```bash
ssh ubuntu@EC2_HOST 'docker ps'
# 권한 오류 시
ssh ubuntu@EC2_HOST 'sudo docker ps'
```

### 현재 활성 환경 확인 (EC2)

```bash
ssh ubuntu@EC2_HOST 'cat /home/ubuntu/nginx-conf/fastcampus-cicd.conf'
```

### 수동 트래픽 전환 (EC2)

```bash
# Green으로 전환
ssh ubuntu@EC2_HOST 'cp /home/ubuntu/nginx-conf/blue-shutdown.conf /home/ubuntu/nginx-conf/fastcampus-cicd.conf && sudo docker exec api-gateway nginx -s reload'

# Blue로 전환 (롤백)
ssh ubuntu@EC2_HOST 'cp /home/ubuntu/nginx-conf/green-shutdown.conf /home/ubuntu/nginx-conf/fastcampus-cicd.conf && sudo docker exec api-gateway nginx -s reload'
```

---

## 트러블슈팅 체크리스트

파이프라인 실패 시 다음 순서로 확인:

1. **Checkout 실패** → GitHub 토큰/권한 확인
2. **Build 실패** → Gradle 빌드 로그 확인
3. **Docker Build 실패** → Dockerfile 문법, Docker 권한 확인
4. **Docker Push 실패** → Docker Hub 로그인 credentials 확인
5. **EC2 SSH 실패** → SSH 키, known_hosts 확인
6. **Deploy 실패** → EC2 설정 파일 존재 여부, Docker 권한 확인
7. **Health Check 실패** → 앱 시작 로그, api-gateway 상태 확인
8. **Traffic Switch 실패** → Nginx 설정 파일 확인
