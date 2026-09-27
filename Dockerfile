FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY food-waste-backend/pom.xml .
COPY food-waste-backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/food-waste-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
