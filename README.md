# Spotologist Backend

Spring Boot backend with PostgreSQL.

## Run DB only (backend)

```bash

cd spotologist (the location of the yml file)
docker compose up -d postgres-db
./mvnw spring-boot:run
```
- Access **Swagger** UI at: http://localhost:8080/swagger-ui/index.html
- DB runs in Docker (`spotdb`, user: `spotuser`, pass: `spotpass`)
- Endpoints available at `http://localhost:8080/...` as defined in controllers

## Run frontend dev container

```bash

cd spotologist
docker compose up -d
cd spotologist/frontend
ng serve
```
