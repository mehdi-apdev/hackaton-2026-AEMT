# 1. Build de l'application (Compilation Java)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# On compile en sautant les tests pour aller plus vite
RUN mvn clean package -DskipTests

# 2. Image finale (Exécution légère)
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]