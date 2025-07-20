# Spotologist Backend

Spring Boot backend with PostgreSQL.

## Run

```bash

cd spotologist/backend (the location of the yml file)
docker compose up -d
./mvnw spring-boot:run
```

- DB runs in Docker (`spotdb`, user: `spotuser`, pass: `spotpass`)
- Endpoints available at `http://localhost:8080/...` as defined in controllers
- No DB setup needed beyond `docker compose up`
