# Product Manager — React + Spring Boot CRUD

A beginner-friendly full-stack demo for explaining how a React frontend talks to a Java Spring Boot REST API and stores data in PostgreSQL.

## Architecture

Browser (React/Vite) → HTTP/JSON → Spring Boot REST API → Spring Data JPA/Hibernate → PostgreSQL

- **Frontend:** React + Vite
- **Backend:** Java 21 + Spring Boot 3.5 + Spring Web + Spring Data JPA
- **Database:** PostgreSQL
- **Hosting:** Render Static Site (frontend) + Render Docker Web Service (backend) + Render PostgreSQL or Neon

## CRUD endpoints

| Method | Endpoint | Action |
|---|---|---|
| GET | `/api/products` | Get all products |
| GET | `/api/products/{id}` | Get one product |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

Example JSON:
```json
{
  "name": "Wireless Mouse",
  "description": "Bluetooth mouse",
  "price": 799.00
}
```

## Run locally

Requirements: Java 21, Maven 3.9+ (or use your IDE's Maven support), Node.js 20+, npm, and Docker Desktop.

### 1. Start PostgreSQL

From the project root:
```bash
docker compose up -d
```
This creates `productdb` on `localhost:5432` with local demo credentials. You can inspect it using DBeaver.

### 2. Start the backend

Open a terminal:
```bash
cd backend
mvn spring-boot:run
```
API runs at `http://localhost:8080`. Test `http://localhost:8080/api/products`.

If you do not use Docker, create a PostgreSQL database named `productdb` and set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` before starting Spring Boot.

### 3. Start the frontend

Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## Deploy to Render

Push the **whole project folder** to one GitHub repository. Render will create two app services from the same repository. The database is a separate resource.

### Step 1 — Create the database

In Render Dashboard:
1. Choose **New → PostgreSQL**.
2. Create a database (choose a region close to your app services).
3. Copy its **Internal Database URL**, username, and password from the database's connection details. Use the internal URL when the backend is hosted in the same Render region.
4. Keep credentials private. Never commit them to GitHub.

You can also use a PostgreSQL database from Neon. In that case use its JDBC connection URL and database credentials.

### Step 2 — Deploy Spring Boot backend

1. Choose **New → Web Service** and connect the GitHub repository.
2. Set **Root Directory** to `backend`.
3. Set **Runtime/Language** to `Docker` (Render uses Docker for Java apps).
4. Leave the Dockerfile path as `./Dockerfile`.
5. Add these environment variables:

| Key | Value |
|---|---|
| `DB_URL` | Your PostgreSQL JDBC URL, e.g. `jdbc:postgresql://HOST:5432/DB_NAME?sslmode=require` |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` for initial testing; replace/add your deployed frontend URL after Step 3 |

For a Render PostgreSQL database, use its connection details and make sure the URL starts with `jdbc:postgresql://`. If the dashboard gives a `postgres://` or `postgresql://` URL, convert the scheme to `jdbc:postgresql://` for JDBC. Preserve the host, port, database name, and query parameters.

Deploy. When successful, test:
`https://YOUR-BACKEND.onrender.com/api/products`

### Step 3 — Deploy React frontend

1. Choose **New → Static Site** and connect the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add environment variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com` |

Deploy the site. Open its `onrender.com` URL.

### Step 4 — Update backend CORS

Copy your deployed frontend URL, then open the backend service's Environment settings. Update:
`CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND.onrender.com`

Save and redeploy the backend. CORS must match the frontend origin exactly (no trailing slash).

### Step 5 — Verify the complete flow

- Create a product in the React UI.
- Refresh the page — the product should remain because it is stored in PostgreSQL.
- Edit the product.
- Delete the product.
- Open `https://YOUR-BACKEND.onrender.com/api/products` to see the JSON API response.

## Explain it to your friends

1. React is the **client**. It collects form data and sends HTTP requests using `fetch()`.
2. Spring Boot is the **backend/API**. `@RestController` exposes endpoints; `@GetMapping`, `@PostMapping`, `@PutMapping`, and `@DeleteMapping` map HTTP methods to Java methods.
3. `Product` is a JPA **Entity**, representing a database table/row structure.
4. `ProductRepository extends JpaRepository` gives common database operations without writing SQL for basic CRUD.
5. Hibernate (the JPA implementation used here) translates repository operations into SQL.
6. PostgreSQL stores the product records permanently.
7. CORS allows the browser-based frontend domain to call the backend domain.
8. Render hosts the backend as a Docker web service and the built React files as a static site. Both receive separate public URLs.

### MERN comparison

| MERN | This project |
|---|---|
| Express route/controller | Spring Boot `@RestController` |
| Mongoose model/schema | JPA `@Entity` |
| Mongoose model methods | Spring Data `JpaRepository` |
| MongoDB | PostgreSQL |
| `npm run build` frontend | `npm run build` frontend |
| Render web service for Express | Render Docker web service for Java |
| Render static site for React | Render static site for React |

## Common deployment problems

- **CORS error:** Check `CORS_ALLOWED_ORIGINS`; it must equal the exact deployed frontend URL.
- **Database connection error:** Check the JDBC URL, username, password, database status, and whether the URL is reachable from the backend.
- **Frontend shows network error:** Check `VITE_API_URL` and confirm the backend URL is live.
- **Backend returns 500:** Open Render → backend service → Logs and inspect the exception.
- **First request is slow:** Free Render web services spin down after inactivity and need time to wake up.
- **Frontend environment variable changes:** Vite embeds `VITE_API_URL` at build time, so trigger a new frontend deploy after changing it.

## Important demo notes

- This is a learning/demo CRUD app, not a production-ready system.
- It intentionally has no authentication or authorization.
- `spring.jpa.hibernate.ddl-auto=update` is convenient for this demo. For production, use managed database migrations such as Flyway or Liquibase.
- Do not commit real database credentials or `.env` files.
