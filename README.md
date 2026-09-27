# Ecoplate

**Food waste management platform** — connects grocery stores with customers and NGOs so
surplus stock gets sold at a dynamic discount before it expires, and whatever doesn't sell
routes to NGOs for free distribution instead of landfill.

![Java](https://img.shields.io/badge/Java_17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

## How it works

Grocery stores list surplus inventory with an expiry date. A scheduler walks the catalogue and
discounts items as they approach expiry — the closer to the date, the steeper the cut. Customers
buy discounted stock; anything still unsold at the threshold is offered to registered NGOs for
free collection.

Three roles, three different views of the same inventory:

| Role | Can |
|:--|:--|
| **Store** | list surplus, set expiry, watch stock move |
| **Customer** | browse and buy discounted items nearby |
| **NGO** | claim unsold stock at no cost before it's discarded |

## Stack

- **Backend** — Java 17, Spring Boot, Spring Data JPA, Spring Security with JWT
- **Frontend** — React + Vite
- **Database** — PostgreSQL in production, MySQL supported for local development
- **Deploy** — Dockerfile for the backend, static build for the frontend

## Running locally

```bash
# backend  (defaults to MySQL on localhost:3306)
cd food-waste-backend && ./mvnw spring-boot:run

# frontend
cd ecoplate-frontend && npm install && npm run dev
```

## Production configuration

The `prod` profile reads everything from the environment — nothing secret is committed:

| Variable | Purpose |
|:--|:--|
| `DATABASE_URL` | PostgreSQL JDBC URL |
| `JWT_SECRET` | signing key — **required**, startup fails without it |
| `PORT` | server port (defaults to 8080) |
| `CORS_ALLOWED_ORIGINS` | the deployed frontend origin |

```bash
docker build -t ecoplate .
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DATABASE_URL="jdbc:postgresql://…" \
  -e JWT_SECRET="…" \
  ecoplate
```

## Tests

```bash
cd food-waste-backend && ./mvnw test      # 17 tests
```

## Attribution

Ecoplate began as a team project for **CSYE 7230 (Software Engineering)** at Northeastern
University — original repository
[`CanNortheastern/CSYE7230Group1`](https://github.com/CanNortheastern/CSYE7230Group1).
This repository is a deployment-focused copy maintained by
[@K-sau07](https://github.com/K-sau07); credit for the original work is shared with the
project team.
