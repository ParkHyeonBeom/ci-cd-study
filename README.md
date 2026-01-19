# Github Actions & Jenkins를 활용한 CI/CD 구축
## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | Jenkins 기반 CI/CD 파이프라인 구축 |
| 기간 | 2026.01 |
| 역할 | DevOps 엔지니어 (1인) |
| GitHub | https://github.com/ParkHyeonBeom/ci-cd-study |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| CI/CD | Jenkins (Master-Worker 구조) |
| 컨테이너 | Docker, Docker Compose |
| 클라우드 | AWS EC2 (Ubuntu 24.04) |
| 레지스트리 | Docker Hub |
| 빌드 | Gradle 8.8, Spring Boot 3.3.2, Java 21 |
| 버전관리 | Git, GitHub |
| 코드품질 | SonarQube |
| 기타 | ngrok (Webhook 터널링) |

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CI/CD Pipeline                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐         Webhook (ngrok)         ┌────────────────────────────┐
  │  GitHub  │ ───────────────────────────────▶│     Jenkins Master         │
  │   Repo   │                                 │  (ci-cd-study-jenkins-1)   │
  └──────────┘                                 │                            │
       │                                       │  [Stage 1] Checkout        │
       │                                       │  [Stage 2] Build & Test    │
       │                                       │  [Stage 3] Docker Build    │
       │                                       └─────────────┬──────────────┘
       │                                                     │
       │                                                     │ SSH (Port 22)
       │                                                     ▼
       │                                       ┌────────────────────────────┐
       │                                       │     Jenkins Worker         │
       │                                       │  (ci-cd-study-worker-1)    │
       │                                       │  Label: deploy             │
       │                                       │                            │
       │                                       │  [Stage 4] Deploy to EC2   │
       │                                       └─────────────┬──────────────┘
       │                                                     │
       │                                                     │ SSH (Port 22)
       │                                                     ▼
  ┌────┴─────┐       docker pull              ┌────────────────────────────┐
  │  Docker  │◀───────────────────────────────│        AWS EC2             │
  │   Hub    │                                │   (ap-northeast-2)         │
  │          │                                │                            │
  │ beomiya/ │                                │  ┌──────────────────────┐  │
  │cicd-study│                                │  │  Docker Container    │  │
  └──────────┘                                │  │  (Spring Boot App)   │  │
                                              │  │  Port: 8080          │  │
                                              │  └──────────────────────┘  │
                                              └────────────────────────────┘
```

---

## 파이프라인 상세

```
┌─────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ GitHub  │───▶│  Checkout   │───▶│  Build & Test   │───▶│Docker Build │
│  Push   │    │   (SCM)     │    │   (Gradle)      │    │   & Push    │
└─────────┘    └─────────────┘    └─────────────────┘    └──────┬──────┘
                                                                │
                                                                ▼
                                                         ┌─────────────┐
                                                         │  Deploy to  │
                                                         │    EC2      │
                                                         └─────────────┘
```

### Stage 1: Checkout
- GitHub 레포지토리에서 소스 코드 체크아웃
- Jenkins built-in 노드에서 실행

### Stage 2: Build & Test
- `./gradlew clean build` 실행
- 컴파일, 단위 테스트, JAR 패키징
- 빌드 실패 시 파이프라인 중단

### Stage 3: Docker Build & Push
- Dockerfile 기반 이미지 빌드
- `--platform linux/amd64` 옵션으로 EC2 호환 이미지 생성
- Docker Hub에 버전 태그 + latest 태그로 Push

### Stage 4: Deploy to EC2
- Jenkins Worker (deploy 라벨)에서 실행
- SSH로 EC2 접속
- 기존 컨테이너 정리 후 새 이미지로 배포

---

## 핵심 구현 내용

### 1. Jenkins Master-Worker 분산 구조

```yaml
# docker-compose.yml
services:
  jenkins:
    image: jenkins/jenkins:latest
    user: root
    ports:
      - "8081:8080"
      - "50000:50000"
    volumes:
      - ${HOST_JENKINS_HOME}:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock

  worker-1:
    image: jenkins/ssh-agent:latest-jdk21
    environment:
      - JENKINS_SLAVE_SSH_PUBKEY=<공개키>
```

**구현 포인트:**
- Master: 빌드, 테스트, Docker 이미지 생성
- Worker: EC2 배포 전담 (보안 분리)
- SSH 키 기반 인증으로 안전한 통신

### 2. Docker-in-Docker 구성

```bash
# Jenkins 컨테이너에 Docker CLI 설치
docker exec jenkins apt-get update && apt-get install -y docker.io

# docker.sock 마운트로 호스트 Docker 사용
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

### 3. GitHub Webhook 자동화

```
GitHub Repository
    │
    │ Push Event
    ▼
ngrok (https://xxx.ngrok-free.app)
    │
    │ Tunnel
    ▼
Jenkins (localhost:8081/github-webhook/)
    │
    │ Trigger
    ▼
Pipeline 실행
```

### 4. Cross-Platform 빌드

```groovy
// Mac(ARM64)에서 빌드하여 EC2(AMD64)에 배포
docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}", "--platform linux/amd64 .")
```

---

## Jenkinsfile

```groovy
pipeline {
    agent none

    environment {
        DOCKER_IMAGE = 'beomiya/cicd-study'
        DOCKER_TAG = "${BUILD_NUMBER}"
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
                sh './gradlew clean build'
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

        stage('Deploy to EC2') {
            agent { label 'deploy' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@ec2-43-200-4-51.ap-northeast-2.compute.amazonaws.com '
                            docker pull beomiya/cicd-study:latest
                            docker stop \$(docker ps -q --filter publish=8080) || true
                            docker rm \$(docker ps -aq --filter publish=8080) || true
                            docker stop app || true
                            docker rm app || true
                            docker run -d --name app -p 8080:8080 --platform linux/amd64 beomiya/cicd-study:latest
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

---

## 트러블슈팅

### 1. SSH 키 인증 실패

| 항목 | 내용 |
|------|------|
| **증상** | `Server rejected the private key` 에러 |
| **원인** | Jenkins SSH 플러그인이 OpenSSH 형식 키를 인식 못함 |
| **해결** | PEM 형식으로 변환 |

```bash
# OpenSSH → PEM 변환
ssh-keygen -p -m PEM -f /var/jenkins_home/.ssh/id_rsa -N "" -P ""

# 변환 전: -----BEGIN OPENSSH PRIVATE KEY-----
# 변환 후: -----BEGIN RSA PRIVATE KEY-----
```

### 2. Docker 플랫폼 불일치

| 항목 | 내용 |
|------|------|
| **증상** | `platform (linux/arm64) does not match host (linux/amd64)` |
| **원인** | Mac(M1/M2)에서 빌드한 ARM64 이미지를 x86 EC2에서 실행 |
| **해결** | 빌드 시 플랫폼 명시 |

```groovy
// 빌드 시
docker.build("image:tag", "--platform linux/amd64 .")

// 실행 시
docker run --platform linux/amd64 image:tag
```

### 3. 포트 충돌

| 항목 | 내용 |
|------|------|
| **증상** | `failed to bind host port 8080: address already in use` |
| **원인** | 이전 컨테이너 또는 다른 프로세스가 포트 점유 |
| **해결** | 배포 전 포트 사용 프로세스 정리 |

```bash
# 8080 포트 사용 컨테이너 찾아서 정리
docker stop $(docker ps -q --filter publish=8080) || true
docker rm $(docker ps -aq --filter publish=8080) || true

# 일반 프로세스인 경우
sudo lsof -i :8080
sudo kill <PID>
```

### 4. EC2 SSH 키 분실

| 항목 | 내용 |
|------|------|
| **증상** | EC2 접속 불가 |
| **원인** | 기존 pem 키 파일 분실 |
| **해결** | EC2 Instance Connect로 새 키 등록 |

```bash
# 1. 새 키 생성 (로컬)
ssh-keygen -t rsa -b 4096 -f ec2-new-key

# 2. EC2 Instance Connect로 접속 (AWS 콘솔)
# 3. 공개키 등록
echo '<공개키 내용>' >> ~/.ssh/authorized_keys

# 4. 새 키로 접속 테스트
ssh -i ec2-new-key ubuntu@<EC2_IP>
```

### 5. known_hosts 검증 실패

| 항목 | 내용 |
|------|------|
| **증상** | Jenkins에서 Worker 연결 실패 |
| **원인** | known_hosts에 Worker 호스트 키 미등록 |
| **해결** | ssh-keyscan으로 호스트 키 등록 |

```bash
# Worker 호스트 키를 known_hosts에 등록
ssh-keyscan -H worker-1 >> ~/.ssh/known_hosts
```

---

## 기술 면접 대비 Q&A

### CI/CD 관련

**Q: CI/CD가 무엇인가요?**
> CI(Continuous Integration)는 개발자들이 코드를 자주 통합하고 자동으로 빌드/테스트하는 것이고, CD(Continuous Deployment/Delivery)는 통합된 코드를 자동으로 배포하는 것입니다. 이 프로젝트에서는 GitHub Push → Jenkins 빌드 → Docker Hub → EC2 배포까지 자동화했습니다.

**Q: Jenkins Master-Worker 구조를 사용한 이유는?**
> 역할 분리와 확장성 때문입니다. Master는 빌드와 테스트를 담당하고, Worker는 배포만 담당합니다. 이렇게 하면 EC2 접속 키를 Worker에만 두어 보안을 강화할 수 있고, 필요 시 Worker를 추가해서 병렬 배포도 가능합니다.

**Q: Jenkinsfile을 사용하는 이유는?**
> Pipeline as Code 개념입니다. 파이프라인 설정을 코드로 관리하면 버전 관리가 되고, 코드 리뷰도 가능하며, 다른 프로젝트에 재사용하기도 쉽습니다.

### Docker 관련

**Q: Docker를 사용하는 이유는?**
> 환경 일관성과 배포 편의성 때문입니다. "내 로컬에서는 되는데..."라는 문제를 해결할 수 있고, 이미지만 있으면 어디서든 동일하게 실행됩니다.

**Q: Docker-in-Docker vs Docker Socket 마운트 차이점은?**
> Docker-in-Docker는 컨테이너 안에 별도의 Docker 데몬을 실행하는 것이고, Socket 마운트는 호스트의 Docker 데몬을 공유하는 것입니다. 이 프로젝트에서는 Socket 마운트를 사용했는데, 더 가볍고 이미지 캐시도 공유되어 효율적입니다.

**Q: 멀티 플랫폼 이미지 빌드 경험은?**
> Mac(ARM64)에서 개발하고 EC2(AMD64)에 배포할 때 플랫폼 불일치 문제를 겪었습니다. `--platform linux/amd64` 옵션으로 타겟 플랫폼을 명시해서 해결했습니다.

### AWS 관련

**Q: EC2에 배포하는 과정을 설명해주세요.**
> Jenkins Worker에서 SSH로 EC2에 접속하여, Docker Hub에서 최신 이미지를 pull하고, 기존 컨테이너를 정리한 후 새 컨테이너를 실행합니다. SSH 키는 Jenkins Credentials에 안전하게 저장됩니다.

**Q: EC2 SSH 키를 분실했을 때 어떻게 복구했나요?**
> AWS 콘솔의 EC2 Instance Connect 기능을 사용했습니다. 브라우저에서 바로 EC2에 접속할 수 있어서, 새로 생성한 공개키를 authorized_keys에 추가하여 복구했습니다.

### 트러블슈팅 관련

**Q: 가장 어려웠던 트러블슈팅은?**
> SSH 키 인증 문제였습니다. Jenkins SSH 플러그인이 OpenSSH 형식을 제대로 인식하지 못해서, PEM 형식으로 변환해야 한다는 것을 알아내는 데 시간이 걸렸습니다. `ssh-keygen -p -m PEM` 명령어로 해결했습니다.

**Q: 포트 충돌은 어떻게 해결했나요?**
> 배포 스크립트에 기존 컨테이너 정리 로직을 추가했습니다. `docker ps --filter publish=8080`으로 해당 포트를 사용하는 컨테이너를 찾아서 정리합니다. 만약 Docker 컨테이너가 아닌 프로세스가 사용 중이면 `lsof -i :8080`으로 확인 후 kill합니다.

---

## 프로젝트 성과

- GitHub Push 시 **평균 2분 내 자동 배포** 완료
- Jenkins Master-Worker 분리로 **보안 및 확장성** 확보
- Docker 컨테이너화로 **환경 일관성** 보장
- **4가지 주요 트러블슈팅** 경험 및 해결

---

## 향후 개선 계획

- [ ] **Blue-Green 무중단 배포** - Nginx 리버스 프록시 활용
- [ ] **SonarQube 연동** - 코드 품질 게이트 적용
- [ ] **Slack 알림** - 빌드 성공/실패 알림
- [ ] **Kubernetes 전환** - EKS 또는 자체 클러스터 구축
- [ ] **ArgoCD 도입** - GitOps 기반 배포 자동화

---

## 프로젝트 구조

```
ci-cd-study/
├── src/
│   └── main/
│       └── java/
│           └── com/fastcampus/cicdstudy/
│               ├── CicdStudyApplication.java
│               └── controller/
│                   └── HealthController.java
├── Dockerfile
├── Jenkinsfile
├── docker-compose.yml
├── build.gradle.kts
├── PORTFOLIO.md          # 이 문서
└── README.md
```

---

## 연락처

- **GitHub**: https://github.com/ParkHyeonBeom
- **Email**: (이메일 주소)