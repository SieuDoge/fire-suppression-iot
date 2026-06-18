# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src
# Build the application, skipping tests for faster deployment
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy the built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar
# Expose the application port
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
