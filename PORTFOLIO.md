# Jenkins CI/CD 파이프라인 구축 포트폴리오

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
| **CI/CD** | Jenkins (Master-Worker 구조) |
| **컨테이너** | Docker (Multi-stage Build), Docker Compose |
| **클라우드** | AWS EC2 (Ubuntu 24.04) |
| **레지스트리** | Docker Hub |
| **Backend** | Spring Boot 3.3.2, Java 21, Gradle 8.8 |
| **Frontend** | React 19, Vite, Tailwind CSS 4 |
| **버전관리** | Git, GitHub |
| **코드품질** | SonarQube |
| **기타** | ngrok (Webhook 터널링) |

---

## 시스템 아키텍처

### CI/CD 파이프라인

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
  └──────────┘                                │  │  (Spring Boot + React)│  │
                                              │  │  Port: 8080          │  │
                                              │  └──────────────────────┘  │
                                              └────────────────────────────┘
```

### Frontend + Backend 통합 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot JAR                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  /static/                    ← React 빌드 결과물       │  │
│  │    ├── index.html                                     │  │
│  │    └── assets/                                        │  │
│  │          ├── index-xxx.css   (Tailwind CSS)           │  │
│  │          └── index-xxx.js    (React Bundle)           │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  Spring Boot Application                              │  │
│  │    ├── REST API (필요시)                              │  │
│  │    └── Static Resource Serving (React SPA)            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Port 8080 (HTTP)
```

**핵심**: React 앱이 Spring Boot의 정적 리소스로 포함되어 **단일 JAR**로 배포됩니다.

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

### Stage 3: Docker Build & Push (Multi-stage)
- **Stage 1 (Node.js)**: React 앱 빌드 (`npm ci && npm run build`)
- **Stage 2 (JDK)**: Spring Boot 빌드 (React 결과물 포함)
- **Stage 3 (JRE)**: 경량 실행 이미지 생성
- `--platform linux/amd64` 옵션으로 EC2 호환 이미지 생성
- Docker Hub에 버전 태그 + latest 태그로 Push

### Stage 4: Deploy to EC2
- Jenkins Worker (deploy 라벨)에서 실행
- SSH로 EC2 접속
- 기존 컨테이너 정리 후 새 이미지로 배포

---

## 핵심 구현 내용

### 1. Multi-stage Docker 빌드 (Frontend + Backend 통합)

```dockerfile
# Stage 1: React 빌드
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY portfolio-park/package*.json ./
RUN npm ci
COPY portfolio-park/ ./
RUN npm run build

# Stage 2: Spring Boot 빌드
FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
COPY src src

# React 빌드 결과물 복사
COPY --from=frontend-build /app/frontend/dist src/main/resources/static

# Gradle 빌드
RUN chmod +x ./gradlew && ./gradlew build -x test -x npmInstall -x npmBuild -x copyFrontend

# Stage 3: 실행 이미지
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**구현 포인트:**
- Node.js와 JDK가 분리된 빌드 스테이지
- React 빌드 결과물을 Spring Boot의 static 폴더로 자동 복사
- 최종 이미지는 JRE만 포함하여 경량화 (~200MB)

### 2. Jenkins Master-Worker 분산 구조

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

### 3. Gradle 빌드 자동화 (React 포함)

```kotlin
// build.gradle.kts
val frontendDir = file("portfolio-park")

tasks.register<Exec>("npmInstall") {
    workingDir = frontendDir
    commandLine("npm", "install")
}

tasks.register<Exec>("npmBuild") {
    dependsOn("npmInstall")
    workingDir = frontendDir
    commandLine("npm", "run", "build")
}

tasks.register<Copy>("copyFrontend") {
    dependsOn("npmBuild")
    from("portfolio-park/dist")
    into("src/main/resources/static")
}

tasks.named("processResources") {
    dependsOn("copyFrontend")
}
```

### 4. GitHub Webhook 자동화

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

### 5. Cross-Platform 빌드

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

## React 포트폴리오 구현

### 디자인 스펙

| 항목 | 내용 |
|------|------|
| **Style** | Dark Premium (어두운 배경 + 포인트 컬러) |
| **Primary Color** | Tech Indigo (#6366F1) |
| **Font** | Pretendard Variable |
| **Animation** | Subtle (fade-up, 호버 효과) |
| **Framework** | React 19 + Vite + Tailwind CSS 4 |

### 구현된 섹션

| 섹션 | 내용 |
|------|------|
| **Header** | 스크롤 반응 blur 효과, 반응형 모바일 메뉴 |
| **Hero** | 그라디언트 텍스트, 진입 애니메이션 |
| **About** | 프로필 정보, Salesforce 자격증 4종 카드 |
| **Projects** | 4개 프로젝트 상세 (기간, 업무, 기술스택) |
| **Skills** | 5개 카테고리 기술 태그 |
| **Contact/Footer** | 연락처 정보 |

### React 프로젝트 구조

```
portfolio-park/
├── src/
│   ├── main.jsx           ← 엔트리포인트
│   ├── App.jsx            ← 루트 컴포넌트
│   ├── index.css          ← Tailwind CSS + 커스텀 스타일
│   └── components/
│       ├── Header.jsx
│       ├── Hero.jsx
│       ├── About.jsx
│       ├── Projects.jsx
│       ├── Skills.jsx
│       └── Footer.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
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
```

### 4. Tailwind CSS 4 설정

| 항목 | 내용 |
|------|------|
| **증상** | `tailwindcss` 플러그인이 PostCSS에서 인식 안됨 |
| **원인** | Tailwind CSS 4에서 PostCSS 플러그인 분리 |
| **해결** | `@tailwindcss/postcss` 패키지 사용 |

```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### 5. EC2 SSH 키 분실

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

**Q: Multi-stage 빌드를 사용한 이유는?**
> Frontend(React)와 Backend(Spring Boot)를 단일 이미지로 빌드하면서도 최종 이미지 크기를 최소화하기 위해서입니다. Node.js는 빌드 시에만 필요하고, 실행 시에는 JRE만 있으면 되므로 최종 이미지에서 제외됩니다.

**Q: Docker를 사용하는 이유는?**
> 환경 일관성과 배포 편의성 때문입니다. "내 로컬에서는 되는데..."라는 문제를 해결할 수 있고, 이미지만 있으면 어디서든 동일하게 실행됩니다.

**Q: Docker-in-Docker vs Docker Socket 마운트 차이점은?**
> Docker-in-Docker는 컨테이너 안에 별도의 Docker 데몬을 실행하는 것이고, Socket 마운트는 호스트의 Docker 데몬을 공유하는 것입니다. 이 프로젝트에서는 Socket 마운트를 사용했는데, 더 가볍고 이미지 캐시도 공유되어 효율적입니다.

### Frontend 통합 관련

**Q: React를 Spring Boot에 통합한 이유는?**
> 배포 단순화를 위해서입니다. 별도의 Nginx 서버 없이 단일 JAR로 프론트엔드와 백엔드를 함께 서빙할 수 있어 인프라 관리가 간소화됩니다.

**Q: Tailwind CSS를 선택한 이유는?**
> Utility-first 방식으로 빠른 스타일링이 가능하고, 사용하지 않는 CSS는 자동으로 제거되어 번들 크기가 작습니다. 또한 디자인 토큰 기반 작업에 적합합니다.

### AWS 관련

**Q: EC2에 배포하는 과정을 설명해주세요.**
> Jenkins Worker에서 SSH로 EC2에 접속하여, Docker Hub에서 최신 이미지를 pull하고, 기존 컨테이너를 정리한 후 새 컨테이너를 실행합니다. SSH 키는 Jenkins Credentials에 안전하게 저장됩니다.

---

## 학습 내용 정리 (개념 이해)

이 프로젝트를 진행하면서 학습한 핵심 개념들을 정리했습니다.

### 1. 빌드(Build)란?

```
우리가 작성한 코드          컴퓨터가 실행할 수 있는 것
┌─────────────────┐         ┌─────────────────┐
│  사람이 읽는     │  변환   │  컴퓨터가 실행   │
│  소스코드        │ ─────▶ │  가능한 파일     │
│  (.java, .jsx)  │         │  (.jar, .js)    │
└─────────────────┘         └─────────────────┘

이 "변환" 과정 = 빌드(Build)
```

**예시:**
- Java 코드(.java) → JAR 파일 (JVM이 실행)
- React 코드(.jsx) → HTML/JS/CSS 파일 (브라우저가 실행)

---

### 2. 빌드 도구의 역할

파일 하나하나 직접 변환하기 힘드니까 **자동화 도구**를 사용합니다.

| 언어 | 빌드 도구 | 역할 |
|------|----------|------|
| Java | **Gradle**, Maven | 컴파일, 의존성 관리, JAR 생성 |
| JavaScript | **npm**, Vite, Webpack | 패키지 설치, 번들링, 최적화 |

**우리 프로젝트:**
- Spring Boot (Java) → **Gradle** 사용
- React (JavaScript) → **npm + Vite** 사용

---

### 3. Gradle 동작 원리

#### Gradle이란?
```
Gradle = Java 프로젝트의 "집사"

┌─────────────────────────────────────────────────┐
│  "Gradle아, 빌드해줘" (./gradlew build)          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Gradle이 하는 일:                               │
│  1. 필요한 라이브러리 다운로드                    │
│  2. Java 코드 컴파일 (.java → .class)           │
│  3. 테스트 실행                                  │
│  4. JAR 파일 생성                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### build.gradle.kts 파일
```
build.gradle.kts = Gradle에게 주는 "작업 지시서"

┌─────────────────────────────────────────────────┐
│  build.gradle.kts 내용                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  "이 프로젝트는 Spring Boot야"                   │
│  "Java 21 버전 써"                              │
│  "이런 라이브러리들이 필요해"                     │
│  "이런 태스크들을 실행해"                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 태스크(Task)와 의존성(dependsOn)

태스크 = "해야 할 일" 하나하나

```
라면 끓이기에 비유:
┌──────────────────────────────────────────────────┐
│  태스크1: 물 끓이기                               │
│  태스크2: 면 넣기      (물 끓인 후에만 가능)      │
│  태스크3: 스프 넣기    (면 넣은 후에만 가능)      │
│                                                  │
│  의존성(dependsOn):                              │
│  - "면 넣기"는 "물 끓이기"에 의존                 │
│  - "스프 넣기"는 "면 넣기"에 의존                 │
└──────────────────────────────────────────────────┘
```

#### Gradle 기본 태스크 vs 우리가 추가한 태스크

| 태스크 | 누가 만듦 | 역할 |
|--------|----------|------|
| compileJava | Gradle 기본 | Java 코드 컴파일 |
| processResources | Gradle 기본 | 설정 파일 복사 |
| test | Gradle 기본 | 테스트 실행 |
| jar / bootJar | Spring Boot 플러그인 | JAR 파일 생성 |
| build | Gradle 기본 | 최종 목표 |
| **npmInstall** | **우리가 추가** | npm install 실행 |
| **npmBuild** | **우리가 추가** | npm run build 실행 |
| **copyFrontend** | **우리가 추가** | React 결과물 복사 |

#### 태스크 의존성 트리

```
./gradlew build 실행 시:

build (최종 목표)
  │
  ├─── assemble
  │       └─── jar
  │              └─── classes
  │                     ├─── compileJava
  │                     └─── processResources
  │                              └─── copyFrontend (우리가 연결)
  │                                       └─── npmBuild (우리가 추가)
  │                                               └─── npmInstall (우리가 추가)
  └─── check
          └─── test
```

**핵심**: `build`를 요청하면 Gradle이 **필요한 모든 사전 작업을 자동으로 파악하고 순서대로 실행**합니다.

---

### 4. npm 동작 원리

#### npm이란?
```
npm = JavaScript 프로젝트의 "집사"

┌─────────────────────────────────────────────────┐
│  npm install                                    │
│  → 필요한 라이브러리 다운로드 (node_modules/)   │
│                                                 │
│  npm run build                                  │
│  → Vite가 React 코드 변환 및 번들링             │
│  → dist/ 폴더에 결과물 생성                     │
└─────────────────────────────────────────────────┘
```

#### npm ci vs npm install
| 명령어 | 용도 | 특징 |
|--------|------|------|
| npm install | 개발 환경 | package.json 기준, 유연함 |
| npm ci | CI/CD 환경 | package-lock.json 기준, 엄격하고 빠름 |

---

### 5. Docker Multi-stage 빌드 원리

#### 왜 Multi-stage인가?

**문제**: 빌드 도구와 실행 환경이 다름

```
React 빌드에 필요한 것:              실제 실행에 필요한 것:
┌─────────────────────────┐         ┌─────────────────────────┐
│  Node.js (500MB)        │         │  index.html             │
│  npm 패키지들 (300MB)    │  ───▶  │  bundle.js              │
│  소스코드 (.jsx)        │         │  style.css              │
│  빌드 도구 (Vite)       │         │                         │
│                         │         │  총: ~2MB               │
│  총: ~800MB+            │         │                         │
└─────────────────────────┘         └─────────────────────────┘

2MB 결과물을 위해 800MB 도구를 배송할 필요 없음!
```

#### Multi-stage 빌드 비유

```
자동차 공장에 비유:
┌─────────────────────────────────────────────────┐
│  공장 1: 엔진 제작 → 엔진만 다음 공장으로 전달   │
│  공장 2: 차체 조립 → 완성차만 다음 공장으로 전달 │
│  공장 3: 포장/배송 → 차만 배송 (장비는 공장에 남김)│
│                                                 │
│  → 배송 트럭이 작아도 됨!                       │
└─────────────────────────────────────────────────┘
```

#### 우리 프로젝트의 Multi-stage 흐름

```
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: React 빌드 (Node.js 환경)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FROM node:20-alpine                                │   │
│  │  npm ci            ← 패키지 설치                    │   │
│  │  npm run build     ← React 빌드                     │   │
│  │                                                     │   │
│  │  결과물: dist/ 폴더 (HTML, JS, CSS)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ⚠️ 이 컨테이너는 빌드 후 버려짐! (800MB 도구들 제거)       │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ dist/ 폴더만 전달
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: Spring Boot 빌드 (JDK 환경)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FROM eclipse-temurin:21-jdk                        │   │
│  │  COPY --from=frontend-build dist → static/          │   │
│  │  ./gradlew build   ← Java 컴파일                    │   │
│  │                                                     │   │
│  │  결과물: app.jar (React 포함)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ⚠️ 이 컨테이너도 빌드 후 버려짐! (JDK 도구들 제거)         │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ app.jar만 전달
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: 최종 실행 이미지 (JRE만)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FROM eclipse-temurin:21-jre   ← 실행만 가능한 환경 │   │
│  │  COPY --from=backend-build app.jar                  │   │
│  │  java -jar app.jar             ← 실행!              │   │
│  │                                                     │   │
│  │  최종 이미지 크기: ~200MB (원래 1.5GB였음)          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ✅ 이 이미지만 Docker Hub에 업로드됨                       │
└─────────────────────────────────────────────────────────────┘
```

#### 핵심 Docker 명령어 설명

| 명령어 | 의미 |
|--------|------|
| `FROM ... AS 이름` | 새로운 Stage 시작, 이름 지정 |
| `COPY --from=이름` | 다른 Stage에서 파일만 가져옴 |
| `WORKDIR` | 작업 디렉토리 설정 |
| `RUN` | 명령어 실행 (빌드 시) |
| `ENTRYPOINT` | 컨테이너 시작 시 실행할 명령 |

---

### 6. Jenkins 파이프라인 동작 원리

#### Jenkinsfile이란?
```
Jenkinsfile = CI/CD 파이프라인의 "작업 지시서"

Jenkins가 이 파일을 읽고 순서대로 실행
```

#### Stage별 동작

```
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: Checkout                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  checkout scm                                       │   │
│  │  → GitHub에서 소스코드 다운로드                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: Build & Test                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ./gradlew clean build -x npm관련태스크              │   │
│  │  → Java 코드 컴파일 및 테스트                        │   │
│  │  → npm 태스크는 스킵 (Docker가 대신 처리)           │   │
│  │                                                     │   │
│  │  목적: 빠른 실패 (코드 오류 시 여기서 중단)          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: Docker Build & Push                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  docker.build(...)                                  │   │
│  │  → Dockerfile 읽고 Multi-stage 빌드 실행            │   │
│  │  → React 빌드 + Spring Boot 빌드 + 최종 이미지      │   │
│  │                                                     │   │
│  │  image.push()                                       │   │
│  │  → Docker Hub에 이미지 업로드                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 4: Deploy to EC2                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ssh ubuntu@ec2... '                                │   │
│  │    docker pull beomiya/cicd-study:latest            │   │
│  │    docker stop app                                  │   │
│  │    docker rm app                                    │   │
│  │    docker run -d --name app -p 8080:8080 ...        │   │
│  │  '                                                  │   │
│  │  → EC2에서 기존 컨테이너 정리 후 새 이미지 실행     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 왜 Jenkins에서 npm 태스크를 스킵하나?

```
문제 상황:
┌─────────────────────────────────────────────────┐
│  Jenkins 서버 환경:                              │
│  ✅ Java 설치됨                                  │
│  ✅ Gradle 사용 가능                             │
│  ❌ Node.js 없음                                │
│  ❌ npm 없음                                    │
└─────────────────────────────────────────────────┘

./gradlew build 실행 시:
  → npmInstall 태스크에서 "npm not found" 에러!
```

```
해결:
┌─────────────────────────────────────────────────┐
│  ./gradlew build -x npmInstall -x npmBuild ...  │
│                   │                              │
│                   └─ 이 태스크들 제외하고 실행   │
│                                                 │
│  React 빌드는 어디서?                           │
│  → Docker Stage 1에서! (Node.js 환경 있음)      │
└─────────────────────────────────────────────────┘
```

---

### 7. 전체 배포 흐름 요약

```
1. 개발자: git push
       │
       ▼
2. GitHub → Jenkins Webhook 호출
       │
       ▼
3. Jenkins: Jenkinsfile 읽고 실행
       │
       ├── Stage 1: Checkout (코드 다운로드)
       │
       ├── Stage 2: Build & Test (Java만 빌드, npm 스킵)
       │      └── 목적: 코드 검증 (빨리 실패하면 시간 절약)
       │
       ├── Stage 3: Docker Build (Dockerfile 실행)
       │      │
       │      ├── Docker Stage 1: npm ci + npm run build
       │      ├── Docker Stage 2: gradlew build (React 포함)
       │      └── Docker Stage 3: 최종 이미지 생성
       │      │
       │      └── Docker Push (Docker Hub 업로드)
       │
       └── Stage 4: Deploy to EC2
              │
              ├── docker pull (이미지 다운로드)
              ├── docker stop/rm (기존 컨테이너 정리)
              └── docker run (새 컨테이너 실행)
       │
       ▼
4. 완료! http://ec2-xxx:8080 에서 서비스 실행 중
```

---

### 8. 핵심 용어 정리

| 용어 | 설명 |
|------|------|
| **빌드(Build)** | 소스코드를 실행 가능한 형태로 변환하는 과정 |
| **태스크(Task)** | Gradle에서 수행하는 하나의 작업 단위 |
| **의존성(Dependency)** | "A를 하려면 B를 먼저 해야 함" 관계 |
| **Stage** | Docker 빌드 또는 Jenkins 파이프라인의 단계 |
| **Multi-stage** | 여러 단계로 나눠 빌드하고 최종 결과물만 사용 |
| **CI/CD** | 지속적 통합(CI) + 지속적 배포(CD) |
| **파이프라인** | 빌드부터 배포까지의 자동화된 흐름 |

---

## 프로젝트 성과

- GitHub Push 시 **평균 2분 내 자동 배포** 완료
- Jenkins Master-Worker 분리로 **보안 및 확장성** 확보
- Docker Multi-stage 빌드로 **이미지 크기 최적화** (~200MB)
- **Frontend + Backend 단일 JAR** 배포 구현
- **5가지 주요 트러블슈팅** 경험 및 해결

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
├── src/                          # Spring Boot 소스코드
│   └── main/
│       ├── java/
│       │   └── com/fastcampus/cicdstudy/
│       │       ├── CicdStudyApplication.java
│       │       └── controller/
│       └── resources/
│           └── static/           # React 빌드 결과물 (자동 생성)
├── portfolio-park/               # React 프론트엔드
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── components/
│   ├── package.json
│   └── vite.config.js
├── Dockerfile                    # Multi-stage 빌드
├── Jenkinsfile                   # CI/CD 파이프라인
├── docker-compose.yml            # 로컬 개발 환경
├── build.gradle.kts              # Gradle 빌드 (React 빌드 포함)
├── PORTFOLIO.md                  # 이 문서
└── README.md
```

---

## 연락처

- **GitHub**: https://github.com/ParkHyeonBeom
- **Email**: (이메일 주소)
