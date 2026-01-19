plugins {
    java
    id("org.springframework.boot") version "3.3.2"
    id("io.spring.dependency-management") version "1.1.6"
    id("org.sonarqube") version "4.0.0.2929"
}

group = "com.fastcampus"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-web")
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// React 포트폴리오 빌드 태스크
val frontendDir = file("portfolio-park")

tasks.register<Exec>("npmInstall") {
    workingDir = frontendDir
    commandLine("npm", "install")
    onlyIf { frontendDir.exists() }
}

tasks.register<Exec>("npmBuild") {
    dependsOn("npmInstall")
    workingDir = frontendDir
    commandLine("npm", "run", "build")
    onlyIf { frontendDir.exists() }
}

tasks.register<Copy>("copyFrontend") {
    dependsOn("npmBuild")
    from("portfolio-park/dist")
    into("src/main/resources/static")
    onlyIf { file("portfolio-park/dist").exists() }
}

tasks.named("processResources") {
    dependsOn("copyFrontend")
}