FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# POM first so dependency resolution caches independently of source changes.
COPY food-waste-backend/pom.xml .
RUN mvn -B -q dependency:go-offline
COPY food-waste-backend/src ./src
RUN mvn -B -q clean package -DskipTests

# No arm64 alpine build for temurin 17 — use the standard JRE image.
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/food-waste-backend-1.0.0.jar app.jar
# Render's free instance is 512MB — cap the heap so the JVM isn't OOM-killed.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC"
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
