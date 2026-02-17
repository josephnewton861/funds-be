# Funds Management API

This project is a **NestJS**-based backend API for managing fund data, preloading financial information from external sources into a hosted **PostgreSQL** database. It demonstrates clean architecture, TypeORM integration, and service-based design.

## Technologies Used

- **NestJS** – Modern Node.js framework for building scalable server-side applications. (Not used before this tech test)
- **TypeORM** – Object Relational Mapping with PostgreSQL support.
- **PostgreSQL** – Hosted relational database storing funds, documents, holdings, and portfolio assets.
- **Axios** – HTTP client for fetching external fund data.
- **Jest** – Unit testing framework for services and controllers.

## API Endpoints

| Method | Route             | Description                                                                 |
|--------|-----------------|-----------------------------------------------------------------------------|
| GET    | `http://localhost:3000/preload`       | Preloads fund data from external APIs into the database. Logs any errors. |
| GET    | `http://localhost:3000/funds`         | Returns all funds stored in the database.                                  |
| GET    | `http://localhost:3000/funds/:id`     | Returns a single fund by ID, including associated documents, holdings, and portfolio assets. |

---

## Database

The API is connected to a **hosted PostgreSQL database** using TypeORM. The database contains the following entities:

- **Funds** – Main fund data including name, market code, price, sector, and ratings.  
- **Documents** – Associated fund documents with type and URL.  
- **Holdings** – Top holdings for each fund.  
- **PortfolioAssets** – Asset allocations for each fund.

All entities are relationally linked and support cascading updates.

---

## Future Improvements

- **Automated Preloading** – Schedule the `/preload` process using a **cron job** to run daily, keeping the database up-to-date.  
- **Secure Fund Insertion** – Add a **PUT `/funds`** endpoint to allow adding new funds manually.  
  - **Authentication required** – To prevent unauthorized data insertion, only authorized users should be able to use this endpoint.  
- **API Documentation** – Integrate **Swagger** for clearer endpoint documentation.  

---

## Testing

- Unit tests cover **services** and **controllers** using Jest.  
- Axios calls are mocked to ensure tests do not hit external APIs.  
- Repository operations are mocked to isolate service logic.

---

## Getting Started

1. **Clone the repository**
   
  `git clone <repo-url>`
  `cd <repo-folder>`

2. **Create the .env file and insert the following**
## Environment Variables

The following `.env` variables are required to run the application:
- `DB_HOST=ep-noisy-rice-abyfjgw2-pooler.eu-west-2.aws.neon.tech`
- `DB_PORT=5432`
- `DB_USERNAME=neondb_owner`
- `DB_PASSWORD=npg_Jxkp9jSXILe8`
- `DB_NAME=funds_dashboard`
- `BASE_URL=https://cdn.core3-dev.ajbbuild.uk/interview`

3. **Install dependencies**
  `npm install`
  `npm install axios`

4. **Run tests**
  `npm run test`

5. **Start backend api**
  `nest start`

