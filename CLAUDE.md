# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FastCampus CI/CD educational project demonstrating multiple deployment strategies using a Spring Boot application. It showcases on-premise, containerized, and zero-downtime blue-green deployments with both GitHub Actions and Jenkins pipelines.

**Tech Stack:** Java 21, Spring Boot 3.3.2, Gradle (Kotlin DSL), Docker, Nginx (SSL/HTTPS), Let's Encrypt, Jenkins, SonarQube, AWS EC2

## Build Commands

```bash
# Build and test
./gradlew clean test bootJar

# Run tests only
./gradlew test

# Run application locally
./gradlew bootRun

# Build Docker image
docker build -t <dockerhub-username>/cicd-study .

# Run full application stack (Nginx + Blue/Green instances)
docker-compose -f docker-compose-app.yml up

# Run Jenkins + SonarQube infrastructure
docker-compose up
```

## Architecture

### Application Structure

Simple Spring Boot app with two controllers:
- `TestController` (`GET /test`) - Basic endpoint for testing
- `HealthController` (`GET /health`, `GET /health/bad`, `GET /health/notbad`) - Health checks used in deployment verification

### Configuration Profiles

Three Spring profiles for blue-green deployment:
- `application.yml` - Default configuration
- `application-blue.yml` - Blue environment (app name: "cicd-study-blue")
- `application-green.yml` - Green environment (app name: "cicd-study-green")

### CI/CD Workflows

**GitHub Actions** (`.github/workflows/`):
- `on-premise-cicd.yml` - Direct EC2 deployment via SSH/SCP
- `on-container-cicd.yml` - Docker image build, push to Docker Hub, deploy via docker-compose

**Jenkins Pipelines** (`groovy/`):
- `Practice-Jenkins#1/` - Basic CI/CD pipeline
- `Practice-BluenGreen#1/` - Blue-green deployment with health checks and manual approval
- `Practice-AutoTesting#1/` - Deployment with Newman/Postman API testing
- `Practice-Security#1/` - SonarQube code quality analysis

### Blue-Green Deployment (Zero-Downtime)

Nginx acts as API gateway with SSL termination and three routing configurations (`nginx-conf/`):
- `all-up.conf` - Both instances receive traffic
- `blue-shutdown.conf` - Only green receives traffic (during blue update)
- `green-shutdown.conf` - Only blue receives traffic (during green update)

**무중단 배포 핵심 옵션:**
- `docker-compose up -d --no-recreate api-gateway` - Nginx 재생성 방지
- `docker-compose up -d --no-deps --force-recreate app-{blue|green}` - 앱만 재생성
- `nginx -s reload` - Graceful 설정 리로드

**HTTPS 설정:**
- SSL 인증서: Let's Encrypt (`/etc/letsencrypt/live/parkhyeonbeom.kro.kr/`)
- HTTP → HTTPS 리다이렉트 (301)
- SSL Termination at Nginx

### Docker Compose Files

- `docker-compose.yml` - Jenkins controller, agent, and SonarQube
- `docker-compose-app.yml` - Application stack with Nginx, app-blue, and app-green containers

## Documentation Maintenance

**중요:** 코드 변경 시 관련 문서도 함께 업데이트해야 합니다.

### 문서 파일 위치

| 파일 | 용도 | 업데이트 시점 |
|------|------|--------------|
| `PORTFOLIO.md` | 포트폴리오 (기술 스택, 아키텍처, 트러블슈팅, Q&A) | 주요 기능 추가/변경 시 |
| `docs/` | 상세 기술 문서 | 새로운 개념/기능 구현 시 |
| `CLAUDE.md` | Claude Code 가이드 | 프로젝트 구조 변경 시 |

### PORTFOLIO.md 업데이트 체크리스트

코드 작업 완료 후 다음 섹션들을 검토하고 필요시 업데이트:

- [ ] **기술 스택** - 새로운 기술 추가 시
- [ ] **시스템 아키텍처** - 인프라/배포 구조 변경 시
- [ ] **핵심 구현 내용** - 새로운 기능 구현 시
- [ ] **트러블슈팅** - 문제 해결 경험 추가
- [ ] **기술 면접 Q&A** - 새로운 개념 학습 시
- [ ] **프로젝트 성과** - 주요 마일스톤 달성 시
- [ ] **향후 개선 계획** - 완료된 항목 체크, 새 계획 추가

### 업데이트 예시

```markdown
# 새로운 기능 추가 시
1. 핵심 구현 내용에 구현 방법 추가
2. 관련 트러블슈팅 경험 기록
3. 면접 Q&A에 관련 질문 추가
4. 향후 개선 계획에서 완료 표시 [x]

# 버그 수정 시
1. 트러블슈팅 섹션에 증상/원인/해결 기록
2. 면접 Q&A에 관련 질문 추가
```

### 자동 리마인더

다음 작업 완료 시 문서 업데이트 여부 확인:
- Jenkinsfile 수정
- docker-compose 파일 수정
- Nginx 설정 변경
- 새로운 Spring 컨트롤러/서비스 추가
- CI/CD 워크플로우 변경
- 인프라 구성 변경 (EC2, 보안 그룹 등)