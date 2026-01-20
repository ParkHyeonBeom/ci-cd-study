# 07. Jenkins CI/CD 환경 구축 가이드

이 문서는 Jenkins Master-Worker 구조를 구축하고 Blue-Green 무중단 배포 파이프라인을 설정하는 전체 과정을 설명합니다.

---

## 목차

1. [아키텍처 개요](#1-아키텍처-개요)
2. [로컬 환경 구성](#2-로컬-환경-구성)
3. [Jenkins 초기 설정](#3-jenkins-초기-설정)
4. [Jenkins Credentials 설정](#4-jenkins-credentials-설정)
5. [Jenkins Worker 노드 설정](#5-jenkins-worker-노드-설정)
6. [파이프라인 생성](#6-파이프라인-생성)
7. [GitHub Webhook 설정](#7-github-webhook-설정)
8. [EC2 환경 준비](#8-ec2-환경-준비)
9. [전체 파이프라인 테스트](#9-전체-파이프라인-테스트)

---

## 1. 아키텍처 개요

```mermaid
flowchart TB
    subgraph Local["로컬 환경 (Docker)"]
        JM[Jenkins Master<br>:8081]
        JW[Jenkins Worker<br>worker-1]
        SQ[SonarQube<br>:9000]
    end

    subgraph GitHub
        GH[GitHub Repository]
        WH[Webhook]
    end

    subgraph DockerHub["Docker Hub"]
        DH[beomiya/cicd-study]
    end

    subgraph AWS["AWS EC2"]
        NG[Nginx Gateway<br>:80]
        AB[app-blue<br>:8081]
        AG[app-green<br>:8082]
    end

    GH -->|Push| WH
    WH -->|Trigger| JM
    JM -->|SSH| JW
    JW -->|Build & Push| DH
    JW -->|SSH + Deploy| AWS
    DH -->|Pull| AWS
    NG --> AB
    NG --> AG
```

### 컴포넌트 역할

| 컴포넌트 | 역할 |
|---------|------|
| Jenkins Master | 파이프라인 관리, UI 제공 |
| Jenkins Worker | 빌드, 테스트, Docker 이미지 생성, EC2 배포 |
| SonarQube | 코드 품질 분석 (선택) |
| Docker Hub | 컨테이너 이미지 저장소 |
| EC2 | 애플리케이션 운영 환경 |

---

## 2. 로컬 환경 구성

### 2.1 디렉토리 구조

```
ci-cd-study/
├── docker-compose.yml          # Jenkins 로컬 환경
├── Dockerfile.jenkins-agent    # Worker 이미지
├── Jenkinsfile                 # 파이프라인 정의
├── docker-compose-app.yml      # EC2 Blue-Green 배포
├── nginx.conf                  # Nginx 설정
└── nginx-conf/                 # 트래픽 전환 설정
    ├── fastcampus-cicd.conf
    ├── blue-shutdown.conf
    ├── green-shutdown.conf
    └── all-up.conf
```

### 2.2 docker-compose.yml

```yaml
services:
  jenkins:
    image: jenkins/jenkins:latest
    user: root
    ports:
      - "8081:8080"      # Jenkins UI
      - "50000:50000"    # Agent 통신
    volumes:
      - ${HOST_JENKINS_HOME}:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    links:
      - worker-1

  worker-1:
    build:
      context: .
      dockerfile: Dockerfile.jenkins-agent
    user: root
    volumes:
      - ${HOST_JENKINS_WORKER_1}:/home/jenkins
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - JENKINS_SLAVE_SSH_PUBKEY=<Jenkins Master 공개키>

  sonarqube:
    image: sonarqube:9-community
    ports:
      - "9000:9000"
```

### 2.3 Dockerfile.jenkins-agent

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

### 2.4 환경 변수 설정 및 실행

```bash
# 환경 변수 설정
export HOST_JENKINS_HOME=/path/to/jenkins_home
export HOST_JENKINS_WORKER_1=/path/to/worker_home

# 디렉토리 생성
mkdir -p $HOST_JENKINS_HOME $HOST_JENKINS_WORKER_1

# Jenkins 실행
docker-compose up -d

# 상태 확인
docker-compose ps
```

---

## 3. Jenkins 초기 설정

### 3.1 초기 비밀번호 확인

```bash
docker exec ci-cd-study-jenkins-1 cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3.2 Jenkins 접속 및 설정

1. 브라우저에서 `http://localhost:8081` 접속
2. 초기 비밀번호 입력
3. **Install suggested plugins** 선택
4. Admin 계정 생성

### 3.3 필수 플러그인 설치

Jenkins → Manage Jenkins → Plugins → Available plugins에서 설치:

- **SSH Agent** - SSH 키 기반 인증
- **Docker Pipeline** - Docker 명령 지원
- **Pipeline: Stage View** - 파이프라인 시각화
- **GitHub Integration** - Webhook 지원

### 3.4 SSH 키 생성 (Jenkins Master)

```bash
# Jenkins 컨테이너 진입
docker exec -it ci-cd-study-jenkins-1 bash

# SSH 키 생성
ssh-keygen -t rsa -b 4096 -f /var/jenkins_home/.ssh/id_rsa -N ""

# 공개키 확인 (Worker의 JENKINS_SLAVE_SSH_PUBKEY에 설정)
cat /var/jenkins_home/.ssh/id_rsa.pub
```

### 3.5 Worker SSH 호스트 키 등록

```bash
docker exec ci-cd-study-jenkins-1 bash -c \
  "ssh-keyscan -H worker-1 >> /var/jenkins_home/.ssh/known_hosts"
```

---

## 4. Jenkins Credentials 설정

Jenkins → Manage Jenkins → Credentials → System → Global credentials

### 4.1 Docker Hub 자격 증명

| 항목 | 값 |
|-----|-----|
| Kind | Username with password |
| ID | `dockerhub-credentials` |
| Username | Docker Hub 사용자명 |
| Password | Docker Hub 비밀번호 또는 Access Token |

### 4.2 EC2 SSH 키

| 항목 | 값 |
|-----|-----|
| Kind | SSH Username with private key |
| ID | `ec2-ssh-key` |
| Username | `ubuntu` |
| Private Key | EC2 PEM 키 내용 (Enter directly) |

> **주의**: PEM 형식이어야 함 (`-----BEGIN RSA PRIVATE KEY-----`)

### 4.3 GitHub 토큰

| 항목 | 값 |
|-----|-----|
| Kind | Username with password |
| ID | `github-token` |
| Username | GitHub 사용자명 |
| Password | Personal Access Token (repo 권한) |

---

## 5. Jenkins Worker 노드 설정

### 5.1 노드 추가

Jenkins → Manage Jenkins → Nodes → New Node

| 항목 | 값 |
|-----|-----|
| Node name | `worker-1` |
| Type | Permanent Agent |
| Remote root directory | `/home/jenkins` |
| Labels | `worker-1` |
| Launch method | Launch agents via SSH |

### 5.2 SSH 연결 설정

| 항목 | 값 |
|-----|-----|
| Host | `worker-1` |
| Credentials | Jenkins Master SSH 키 |
| Host Key Verification Strategy | Known hosts file |

### 5.3 연결 테스트

노드 저장 후 Jenkins → Nodes → worker-1 → Log에서 연결 상태 확인

**성공 시:**
```
Agent successfully connected and online
```

**실패 시 확인 사항:**
1. `JENKINS_SLAVE_SSH_PUBKEY` 값이 올바른지 확인
2. `known_hosts`에 worker-1 등록 여부 확인
3. Worker 컨테이너 실행 상태 확인

---

## 6. 파이프라인 생성

### 6.1 새 Job 생성

Jenkins → New Item → Pipeline

| 항목 | 값 |
|-----|-----|
| Name | `cicd-study` |
| Type | Pipeline |

### 6.2 파이프라인 설정

**Pipeline 섹션:**

| 항목 | 값 |
|-----|-----|
| Definition | Pipeline script from SCM |
| SCM | Git |
| Repository URL | `https://github.com/ParkHyeonBeom/ci-cd-study` |
| Credentials | github-token |
| Branch | `*/master` |
| Script Path | `Jenkinsfile` |

### 6.3 Jenkinsfile 구조

```groovy
pipeline {
    agent none

    environment {
        DOCKER_IMAGE = 'beomiya/cicd-study'
        DOCKER_TAG = "${BUILD_NUMBER}"
        EC2_HOST = "ec2-xxx.compute.amazonaws.com"
        DEPLOY_PATH = "/home/ubuntu"
    }

    stages {
        stage('Checkout') { ... }
        stage('Build & Test') { ... }
        stage('Docker Build & Push') { ... }
        stage('Detect Active Environment') { ... }
        stage('Sync Config Files') { ... }
        stage('Deploy to Standby Environment') { ... }
        stage('Health Check') { ... }
        stage('Switch Traffic') { ... }
        stage('Stop Old Environment') { ... }
        stage('Cleanup Old Images') { ... }
    }

    post {
        success { ... }
        failure { ... }
    }
}
```

---

## 7. GitHub Webhook 설정

### 7.1 ngrok 설정 (로컬 환경용)

```bash
# ngrok 설치
brew install ngrok

# ngrok 실행
ngrok http 8081

# 출력된 URL 복사
# https://xxxx.ngrok-free.app
```

### 7.2 GitHub Repository 설정

GitHub Repository → Settings → Webhooks → Add webhook

| 항목 | 값 |
|-----|-----|
| Payload URL | `https://xxxx.ngrok-free.app/github-webhook/` |
| Content type | `application/json` |
| Trigger | Just the push event |

### 7.3 Jenkins Job 설정

Job → Configure → Build Triggers

- [x] **GitHub hook trigger for GITScm polling** 체크

---

## 8. EC2 환경 준비

### 8.1 EC2 인스턴스 생성

| 항목 | 권장 값 |
|-----|--------|
| AMI | Ubuntu 24.04 LTS |
| Instance Type | t3.small 이상 |
| Storage | 20GB 이상 |
| Security Group | 22(SSH), 80(HTTP), 8081-8082(App) |

### 8.2 Docker 설치

```bash
# EC2에 SSH 접속 후
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin

# ubuntu 유저 docker 그룹 추가
sudo usermod -aG docker ubuntu

# 재접속 후 확인
docker ps
```

### 8.3 필요 파일 확인

Jenkins 파이프라인의 `Sync Config Files` 스테이지가 다음 파일들을 자동으로 복사:

- `docker-compose-app.yml`
- `nginx.conf`
- `nginx-conf/` 디렉토리
- `application-blue.yml`, `application-green.yml`

### 8.4 초기 배포 (선택)

수동으로 초기 환경을 구성하려면:

```bash
cd /home/ubuntu

# Blue 환경 + API Gateway 시작
export IMAGE=beomiya/cicd-study:latest
sudo docker-compose -f docker-compose-app.yml up -d app-blue api-gateway

# 초기 트래픽 설정 (Blue 활성)
cp nginx-conf/green-shutdown.conf nginx-conf/fastcampus-cicd.conf
sudo docker exec api-gateway nginx -s reload
```

---

## 9. 전체 파이프라인 테스트

### 9.1 수동 빌드 테스트

Jenkins → cicd-study → Build Now

### 9.2 파이프라인 단계 확인

```
✓ Checkout
✓ Build & Test
✓ Docker Build & Push
✓ Detect Active Environment
✓ Sync Config Files
✓ Deploy to Standby Environment
✓ Health Check
✓ Switch Traffic
✓ Stop Old Environment
✓ Cleanup Old Images
```

### 9.3 무중단 배포 확인

**터미널 1: 지속적 요청**
```bash
while true; do
    curl -s -w "%{http_code}\n" -o /dev/null http://EC2_PUBLIC_IP/health
    sleep 0.5
done
```

**터미널 2: GitHub Push**
```bash
git commit --allow-empty -m "Test deployment"
git push origin master
```

**기대 결과:**
- 모든 응답이 200 유지
- 배포 중에도 서비스 중단 없음

### 9.4 롤백 테스트

```bash
# 현재 상태 확인
ssh ubuntu@EC2_HOST 'cat /home/ubuntu/nginx-conf/fastcampus-cicd.conf'

# 롤백 (Green → Blue)
ssh ubuntu@EC2_HOST 'cp /home/ubuntu/nginx-conf/green-shutdown.conf /home/ubuntu/nginx-conf/fastcampus-cicd.conf && sudo docker exec api-gateway nginx -s reload'
```

---

## 체크리스트

### 로컬 환경 구축

- [ ] docker-compose.yml 작성
- [ ] Dockerfile.jenkins-agent 작성
- [ ] 환경 변수 설정 및 컨테이너 실행
- [ ] Jenkins 초기 설정 완료

### Jenkins 설정

- [ ] 필수 플러그인 설치
- [ ] SSH 키 생성 및 Worker에 등록
- [ ] known_hosts에 Worker 등록
- [ ] Credentials 설정 (Docker Hub, EC2, GitHub)
- [ ] Worker 노드 연결 확인

### 파이프라인 설정

- [ ] Pipeline Job 생성
- [ ] SCM으로 Jenkinsfile 연결
- [ ] GitHub Webhook 설정

### EC2 환경

- [ ] Docker/Docker Compose 설치
- [ ] ubuntu 유저 docker 권한 확인
- [ ] Security Group 포트 오픈

### 테스트

- [ ] 수동 빌드 성공
- [ ] Webhook 트리거 성공
- [ ] 무중단 배포 확인
- [ ] 롤백 테스트 성공

---

## 다음 단계

- [트러블슈팅 가이드](./06-troubleshooting.md) - 문제 해결
- [Blue-Green 심화](./03-blue-green-deep-dive.md) - 배포 전략 이해
- [구현 가이드](./04-implementation-guide.md) - 상세 구현 내용
