# Multi-Tenant Issue & Activity Management API (NestJS)

Running on Replit.

## Setup Instructions

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Application:**
    ```bash
    npm run dev
    ```
    The application will run on port 5000.

3.  **Database:**
    This project uses Replit's built-in PostgreSQL database with Drizzle ORM.
    Schema is defined in `shared/schema.ts`.

## Architecture Answers

### 1. How did you implement multi-tenancy in NestJS?
I implemented multi-tenancy using a custom middleware `TenantMiddleware`. This middleware extracts the `x-organization-id` from the request headers and injects it into the request object (`req.user.organizationId`). This context is then used in the `IssuesService` to filter all database queries by `organizationId`, ensuring strictly isolated data access. Every read and write operation includes a `where(eq(issues.organizationId, orgId))` clause.

### 2. Where does authorization logic live (Guard vs Service) and why?
The authorization logic lives in the `RolesGuard`. This is because authorization (checking if a user has permission to perform an action) is a cross-cutting concern that determines *access* to a route handler. By placing it in a Guard, we decouple the access control logic from the business logic in the Service. This keeps the Service focused on data manipulation and business rules, while the Guard enforces security policies declaratively at the Controller level.

### 3. How would you prevent cross-organization data leaks in production?
To prevent leaks in production:
*   **Row-Level Security (RLS):** Implement PostgreSQL RLS policies where the database itself enforces that a user can only access rows matching their `organization_id`.
*   **Global Scope/Filter:** Use a global Drizzle or TypeORM scope/plugin that automatically adds the `organizationId` where clause to every query, preventing accidental omission by developers.
*   **Integration Tests:** Write comprehensive integration tests that specifically attempt to access one tenant's data with another tenant's credentials to verify isolation.

### 4. What parts of this system would break or need redesign at scale (100,000 organizations)?
*   **Database Scalability:** A single PostgreSQL instance sharing one table for 100k organizations would become a bottleneck. We would need to partition tables by `organizationId` (Sharding) or move to a separate database-per-tenant model if data volume is massive.
*   **Connection Limits:** 100k orgs might imply high concurrent connections. We'd need a robust connection pooler (like PgBouncer).
*   **Migration Management:** Running migrations on a huge table is slow and risky.
*   **Activity Logs:** The activity log table would grow extremely fast. It should be moved to a separate high-write storage (e.g., ClickHouse, Cassandra) or partitioned by time.

### 5. What features did you intentionally skip due to time constraints and why?
*   **Authentication:** Explicitly out of scope, but in a real app, I would integrate a proper Auth provider (Auth0, Cognito, or Replit Auth) instead of mocking headers.
*   **Users Module:** I mocked user existence. A real system needs a Users table and endpoints to manage organization members.
*   **Pagination:** `findAll` returns all issues. At scale, this needs cursor-based pagination.
*   **Input Validation refinement:** While I used basic DTOs, stricter validation (e.g., checking if `assigneeId` exists) was skipped to focus on core requirements.
