Multi-Tenant Issue & Activity Management API
A NestJS backend API for managing issues across multiple organizations with role-based access control and activity logging.

Setup
Prerequisites
Node.js (v18+)
PostgreSQL (v12+)
npm
Steps
Install dependencies:

npm install
Create PostgreSQL database:

psql
CREATE DATABASE issue_management;
\q
Create .env file:

cp .env.example .env
Edit .env:

DATABASE_URL=postgresql://username:password@localhost:5432/issue_management
NODE_ENV=development
PORT=5000
Initialize database:

npm run db:push
Start the application:

npm run dev
API runs on http://localhost:5000

Using the API
All requests require headers:

-H "x-organization-id: org-123"
-H "x-user-id: user-456"
-H "x-user-role: ADMIN"  # or MEMBER
Endpoints
Create Issue

curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: ADMIN" \
  -d '{
    "title": "Fix login bug",
    "description": "Users cannot log in",
    "priority": "HIGH"
  }'
Get All Issues

curl http://localhost:5000/api/issues \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: MEMBER"
Get Single Issue

curl http://localhost:5000/api/issues/1 \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: MEMBER"
Update Issue (ADMIN only)

curl -X PATCH http://localhost:5000/api/issues/1 \
  -H "Content-Type: application/json" \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: ADMIN" \
  -d '{"status": "IN_PROGRESS"}'
Delete Issue (ADMIN only)

curl -X DELETE http://localhost:5000/api/issues/1 \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: ADMIN"
Issue Fields
id - Auto-generated
title - Required
description - Required
status - OPEN | IN_PROGRESS | DONE (default: OPEN)
priority - LOW | MEDIUM | HIGH (default: MEDIUM)
assigneeId - Optional
organizationId - Auto-set from header
createdAt, updatedAt - Auto-generated
Architecture
1. How did you implement multi-tenancy in NestJS?
Multi-tenancy is implemented via custom middleware that extracts x-organization-id from request headers and injects it into the request context. All database queries automatically filter by organizationId using Drizzle ORM's where clause. This ensures complete data isolation between organizations at the database level.

Location: server/common/middleware/tenant.middleware.ts

2. Where does authorization logic live (Guard vs Service) and why?
Authorization logic lives in NestJS Guards (server/common/guards/roles.guard.ts). Guards are used instead of Services because:

They execute BEFORE controller methods run, preventing unauthorized code execution
They are declarative with decorators, making intent clear
They separate security concerns from business logic
Routes that modify data use @UseGuards(new RolesGuard('ADMIN')) to restrict access to ADMIN users only.

3. How would you prevent cross-organization data leaks in production?
Row-Level Security (RLS) - Implement PostgreSQL RLS policies to enforce database-level access control
Global Query Filters - Use ORM middleware to automatically append organizationId filters to all queries
Integration Tests - Write tests that verify cross-organization access fails
Audit Logging - Log all access attempts for security monitoring
Database Roles - Create separate database roles per organization if using database-per-tenant architecture
4. What parts of this system would break at scale (10,000+ organizations)?
Breaks:

Single database becomes bottleneck with millions of rows
Activity logs grow infinitely, requiring partitioning or archival
PostgreSQL connection limits exceeded with thousands of concurrent organizations
In-memory caches would require complex invalidation logic
Needs redesign:

Move to database-per-tenant or sharded architecture
Implement microservices (separate issues, activity, users services)
Add API gateway for rate limiting and authentication
Use time-series database (TimescaleDB, ClickHouse) for activity logs
Implement real authentication (OAuth2, JWT)
5. What features did you intentionally skip?
Real Authentication - Assignment says "Authentication is NOT required", using header-based mocking instead
Pagination - Not specified in requirements, all issues returned in one response
Filtering/Search - Nice-to-have but not part of core requirements
Input Validation - Basic validation only, no strict length/format checks
Soft Deletes - Issues permanently deleted instead of marked as deleted
Bulk Operations - Single-resource operations only
Testing - Assignment explicitly says testing is out of scope
Rate Limiting - No protection against abuse