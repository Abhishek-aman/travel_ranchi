# Build with a Gradle image so we do not download the Gradle distribution inside the container
# (avoids SSL "Tag mismatch" / AEAD errors some networks cause during ./gradlew bootstrap).
FROM gradle:9.4.1-jdk17 AS build
# WORKDIR must be writable by the user running Gradle; use root for the build step.
USER root
WORKDIR /workspace
COPY build.gradle settings.gradle ./
COPY src ./src
RUN gradle bootJar --no-daemon -x test

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN groupadd --system spring && useradd --system --gid spring spring
USER spring:spring
COPY --from=build /workspace/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
