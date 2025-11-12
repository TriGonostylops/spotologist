# Spotologist Backend

Spring Boot backend with PostgreSQL.

## Run DB only (backend)

```powershell
# from project root
docker compose up -d postgres-db
cd backend
.\mvnw.cmd spring-boot:run
```
- Access **Swagger** UI at: http://localhost:8080/swagger-ui/index.html
- DB runs in Docker (`spotdb`, user: `spotuser`, pass: `spotpass`)
- Endpoints available at `http://localhost:8080/...` as defined in controllers

## Run frontend (dev) with Dockerized DB/back-end

```powershell
# from project root: start Postgres and backend containers
docker compose up -d

# in a new terminal: start the Angular dev server locally
cd frontend
npm install
npm start
```
- Frontend dev server: http://localhost:4200/
