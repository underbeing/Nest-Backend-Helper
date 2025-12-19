# Multi-Tenant Issue & Activity Management API

A NestJS backend API for managing issues across multiple organizations with role-based access control and activity logging.

## Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+) installed locally
- npm

### Setup Instructions

1. **Clone/Extract the Project**
   ```bash
   cd your-project-directory
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up PostgreSQL Database**
   
   Create a new PostgreSQL database:
   ```bash
   psql
   CREATE DATABASE issue_management;
   \q
   ```

4. **Configure Environment Variables**
   
   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your database connection:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/issue_management
   NODE_ENV=development
   PORT=5000
   ```
   
   Replace `username` and `password` with your PostgreSQL credentials.

5. **Initialize Database Schema**
   ```bash
   npm run db:push
   ```

6. **Start the Application**
   ```bash
   npm run dev
   ```
   
   The API will run on `http://localhost:5000`

---

## Using the API

### Authentication Mock (Headers)

Since this is a backend-only API without authentication, user context is provided via HTTP headers:

```bash
-H "x-organization-id: org-123"
-H "x-user-id: user-456"
-H "x-user-role: ADMIN"  # or MEMBER
```

### API Endpoints

All endpoints require the headers above.

#### 1. Create Issue
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: ADMIN" \
  -d '{
    "title": "Fix login bug",
    "description": "Users cannot log in with email",
    "priority": "HIGH",
    "assigneeId": "user-789"
  }'
```

#### 2. Get All Issues (for organization)
```bash
curl http://localhost:5000/api/issues \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: MEMBER"
```

#### 3. Get Single Issue
```bash
curl http://localhost:5000/api/issues/1 \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: MEMBER"
```

#### 4. Update Issue (ADMIN only)
```bash
curl -X PATCH http://localhost:5000/api/issues/1 \
  -H "Content-Type: application/json" \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: ADMIN" \
  -d '{
    "status": "IN_PROGRESS",
    "assigneeId": "user-789"
  }'
```

#### 5. Delete Issue (ADMIN only)
```bash
curl -X DELETE http://localhost:5000/api/issues/1 \
  -H "x-organization-id: org-123" \
  -H "x-user-id: user-456" \
  -H "x-user-role: ADMIN"
```

### Status Codes

- `200` - OK (GET, PATCH successful)
- `201` - Created (POST successful)
- `204` - No Content (DELETE successful)
- `400` - Bad Request (validation error)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (issue doesn't exist)
- `500` - Internal Server Error

### Available Fields

**Issue Model:**
- `id` - Auto-generated ID
- `title` - Issue title (required)
- `description` - Issue description (required)
- `status` - OPEN | IN_PROGRESS | DONE (default: OPEN)
- `priority` - LOW | MEDIUM | HIGH (default: MEDIUM)
- `assigneeId` - User ID of assignee (optional)
- `organizationId` - Auto-set from header
- `createdAt` - Auto-generated timestamp
- `updatedAt` - Auto-updated timestamp

---

## Testing with Postman/Insomnia

1. Import the headers into your API client
2. Set up variables:
   - `org_id` = org-123
   - `user_id` = user-456
   - `user_role` = ADMIN (or MEMBER)
3. Use the endpoint examples above

---

## Production Deployment

Build for production:
```bash
npm run build
```

Run production build:
```bash
npm start
```

---

## Project Structure

```
.
├── server/
│   ├── db.ts                 # Database connection (Drizzle ORM)
│   ├── app.module.ts         # NestJS app module
│   ├── index.ts              # Application entry point
│   ├── common/
│   │   ├── middleware/       # Tenant middleware
│   │   └── guards/           # Authorization guards
│   └── issues/
│       ├── issues.controller.ts   # Route handlers
│       ├── issues.service.ts      # Business logic
│       ├── issues.module.ts       # Module definition
│       └── dto/              # Data validation (CreateIssueDto, UpdateIssueDto)
├── shared/
│   └── schema.ts             # Database schema (Drizzle) & Zod types
└── .env.example              # Environment template
```

---

## Architecture

### Multi-Tenancy
- Each request must include `x-organization-id` header
- All database queries are filtered by `organizationId`
- Data from different organizations is completely isolated

### Authorization
- **MEMBER** - Can create issues and read all issues in their organization
- **ADMIN** - Can also update status, assign issues, and delete issues

### Activity Logging
- Every status change is logged to `activity_logs` table
- Every assignee change is logged with old and new values
- Logs include the actor (who made the change) and timestamp

---

## Troubleshooting

**Error: "DATABASE_URL must be set"**
- Make sure `.env` file exists and `DATABASE_URL` is set correctly

**Error: "Cannot connect to database"**
- Verify PostgreSQL is running: `pg_isready`
- Check database name matches in `.env`
- Verify username/password credentials

**Error: "x-organization-id header is missing"**
- All API requests must include the required headers
- See "Using the API" section above

---

## Notes

- This is a backend API only (no UI)
- Authentication is mocked via headers for development
- For production, implement proper authentication (OAuth, JWT, etc.)
- Activity logs are append-only and cannot be modified
