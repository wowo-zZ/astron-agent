FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /backend

COPY console/backend/pom.xml ./
COPY console/backend/commons/pom.xml commons/pom.xml
COPY console/backend/hub/pom.xml hub/pom.xml
COPY console/backend/toolkit/pom.xml toolkit/pom.xml

RUN mvn -pl hub -am dependency:go-offline

COPY console/backend/ .
RUN mvn -DskipTests package -pl hub -am

FROM eclipse-temurin:21-jre
WORKDIR /app

RUN apt-get update && \
    apt-get install -y locales tzdata && \
    locale-gen zh_CN.UTF-8 && \
    ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Shanghai
ENV LANG=zh_CN.UTF-8
ENV LANGUAGE=zh_CN:zh
ENV LC_ALL=zh_CN.UTF-8

COPY --from=build /backend/hub/target/hub-server.jar /app/app.jar
EXPOSE 8080

# Optimized JVM parameters for reduced memory usage:
# - MaxRAMPercentage: reduced from 75% to 70% for lower heap memory usage
# - InitialRAMPercentage: set to 50% to avoid frequent heap expansion
# - UseG1GC: use G1 garbage collector (default in Java 21, but explicit for clarity)
# - UseStringDeduplication: eliminate duplicate strings to save memory
# - Xss512k: reduce thread stack size from default 1MB to 512KB (safe for production)
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=70.0", \
    "-XX:InitialRAMPercentage=50.0", \
    "-XX:+UseG1GC", \
    "-XX:+UseStringDeduplication", \
    "-Xss512k", \
    "-jar", "/app/app.jar"]
