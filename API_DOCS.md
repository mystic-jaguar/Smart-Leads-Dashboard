# API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Auth

### POST /auth/register
Register a new user.

**Body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123", "role": "sales" }
```

**Response 201:**
```json
{ "success": true, "data": { "token": "...", "user": { "id": "...", "name": "...", "email": "...", "role": "sales" } } }
```

---

### POST /auth/login
Login with credentials.

**Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Response 200:** Same as register.

---

### GET /auth/me *(protected)*
Get current user info.

---

## Leads *(all protected)*

### GET /leads
Get paginated leads with filters.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Per page (default: 10, max: 50) |
| status | string | New \| Contacted \| Qualified \| Lost |
| source | string | Website \| Instagram \| Referral |
| search | string | Search by name or email |
| sort | string | latest \| oldest |

**Response 200:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 50, "page": 1, "limit": 10, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
}
```

---

### GET /leads/export
Export filtered leads as CSV. Same query params as GET /leads.

---

### GET /leads/:id
Get single lead by ID.

---

### POST /leads
Create a new lead.

**Body:**
```json
{ "name": "Jane Smith", "email": "jane@example.com", "status": "New", "source": "Website" }
```

---

### PUT /leads/:id
Update a lead. Same body as POST.

---

### DELETE /leads/:id
Delete a lead. Admin can delete any; Sales can only delete their own.

---

## Users *(Admin only)*

### GET /users
Get all users.

### DELETE /users/:id
Delete a user (cannot delete yourself).

### PATCH /users/:id/role
Update user role.

**Body:** `{ "role": "admin" | "sales" }`

---

## Error Format

```json
{ "success": false, "message": "Error description" }
```

Status codes: 200, 201, 400, 401, 403, 404, 500
