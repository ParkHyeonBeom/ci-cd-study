# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FastCampus CI/CD educational project demonstrating multiple deployment strategies using a Spring Boot application. It showcases on-premise, containerized, and zero-downtime blue-green deployments with both GitHub Actions and Jenkins pipelines.

**Tech Stack:** Java 21, Spring Boot 3.3.2, Gradle (Kotlin DSL), Docker, Nginx, Jenkins, SonarQube

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

### Blue-Green Deployment

Nginx acts as API gateway with three routing configurations (`nginx-conf/`):
- `all-up.conf` - Both instances receive traffic
- `blue-shutdown.conf` - Only green receives traffic (during blue update)
- `green-shutdown.conf` - Only blue receives traffic (during green update)

### Docker Compose Files

- `docker-compose.yml` - Jenkins controller, agent, and SonarQube
- `docker-compose-app.yml` - Application stack with Nginx, app-blue, and app-green containers