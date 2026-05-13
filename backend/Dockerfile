# Etapa 1: Build con Maven Wrapper + Java 25
FROM eclipse-temurin:25-jdk-noble AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw ./
COPY pom.xml .
COPY src ./src
RUN chmod +x mvnw && ./mvnw -DskipTests clean package

# Etapa 2: Imagen final liviana solo con JRE
FROM eclipse-temurin:25-jre-noble
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dserver.port=${PORT:-8080}", "-jar", "app.jar"]
