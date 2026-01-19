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

# Gradle 빌드 (frontend 태스크 스킵)
RUN chmod +x ./gradlew && ./gradlew build -x test -x npmInstall -x npmBuild -x copyFrontend

# Stage 3: 실행 이미지
FROM eclipse-temurin:21-jre
LABEL maintainer="phb"

WORKDIR /app
COPY --from=backend-build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
