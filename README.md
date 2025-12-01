# Spotologist
### Key concept: 
 - Share your favourite spots
 - Get recommendations by your intrests.
 - Connect with friends.
 - Catalouge your favourite spots.
---
 ### Tech stack:
 
 - Monorepo structure.
 - Java Spring backend with PostgreSQL.
 - Liquibase (database migrations)
 - Mapstruct (mapping)
 - Angular 20 frontend.
 - Auth: OIDC on frontchannel, nonce for extra security mitigation.

## Run DB only (for backend)

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
docker compose up -d

cd frontend
npm install
npm start
```
- Frontend dev server: http://localhost:4200/

## Important notes: 
 - Users are authenticated via **oidc** + **gis**.
   - this uses only the _frontlayer_ with _symmetric keys_.
   - nonces were added to mitigate the risk of _replay attacks_
   - **important:** nonces are stored via Caffeine, this is a cache in the server that stores these numbers. scaling the project with multiple servers will break this and the nonce store will become inconsistent.
