# Tab API Documentation

This document provides detailed information about the Tab API endpoints for the E-commerce backend.

## Overview

The Tab API allows you to manage tabs/sections with sort ordering and active/inactive status. There are two types of endpoints:

1. **Authenticated API** (`/api/tabs`) - Requires authentication and provides full CRUD operations
2. **Public API** (`/api/public/tabs`) - No authentication required, read-only access

## Authentication

### Authenticated Endpoints
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Admin Required
Create, Update, and Delete operations require admin privileges.

## API Endpoints

### 1. Get All Tabs (Authenticated)

**Endpoint:** `GET /api/tabs`

**Authentication:** Required (any authenticated user)

**Description:** Retrieve all tabs sorted by sortOrder.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
      "name": "Home",
      "status": true,
      "sortOrder": 1,
      "createdAt": "2023-09-01T12:00:00.000Z",
      "updatedAt": "2023-09-01T12:00:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
      "name": "Products",
      "status": true,
      "sortOrder": 2,
      "createdAt": "2023-09-01T12:05:00.000Z",
      "updatedAt": "2023-09-01T12:05:00.000Z"
    }
  ]
}
```

### 2. Get Single Tab (Authenticated)

**Endpoint:** `GET /api/tabs/:id`

**Authentication:** Required (any authenticated user)

**Parameters:**
- `id` (path): Tab ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
    "name": "Home",
    "status": true,
    "sortOrder": 1,
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-01T12:00:00.000Z"
  }
}
```

### 3. Create Tab (Admin Only)

**Endpoint:** `POST /api/tabs`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "About Us",
  "status": true,
  "sortOrder": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tab created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
    "name": "About Us",
    "status": true,
    "sortOrder": 3,
    "createdAt": "2023-09-01T12:10:00.000Z",
    "updatedAt": "2023-09-01T12:10:00.000Z"
  }
}
```

### 4. Update Tab (Admin Only)

**Endpoint:** `PUT /api/tabs/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): Tab ID

**Request Body:**
```json
{
  "name": "About",
  "status": false,
  "sortOrder": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tab updated successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
    "name": "About",
    "status": false,
    "sortOrder": 4,
    "createdAt": "2023-09-01T12:10:00.000Z",
    "updatedAt": "2023-09-01T12:15:00.000Z"
  }
}
```

### 5. Delete Tab (Admin Only)

**Endpoint:** `DELETE /api/tabs/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): Tab ID

**Response:**
```json
{
  "success": true,
  "message": "Tab deleted successfully"
}
```

### 6. Get All Tabs (Public)

**Endpoint:** `GET /api/public/tabs`

**Authentication:** Not required

**Description:** Public endpoint to retrieve all tabs without authentication.

**Response:** Same as authenticated GET /api/tabs

### 7. Get Single Tab (Public)

**Endpoint:** `GET /api/public/tabs/:id`

**Authentication:** Not required

**Description:** Public endpoint to retrieve a single tab without authentication.

**Response:** Same as authenticated GET /api/tabs/:id

## Request/Response Format

### Tab Object Structure

```json
{
  "_id": "string",           // MongoDB ObjectId
  "name": "string",          // Required, unique, trimmed
  "status": "boolean",       // Default true
  "sortOrder": "number",     // Required, default 0, minimum 0
  "createdAt": "date",       // Auto-generated timestamp
  "updatedAt": "date"        // Auto-updated timestamp
}
```

### Success Response Format

```json
{
  "success": true,
  "message": "Optional success message",
  "data": { /* response data */ },
  "count": 0 // Only included in list responses
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

## Validation Rules

### Create/Update Tab Validation

- **name**: Required, string, trimmed, unique (case-insensitive)
- **status**: Optional boolean, defaults to true
- **sortOrder**: Required, number, minimum 0

### Common Validation Errors

- **400 Bad Request**: Tab name already exists
- **404 Not Found**: Tab not found
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Admin privileges required
- **500 Internal Server Error**: Server error

## Postman Collection

### Environment Variables

Set up these environment variables in Postman:

- `base_url`: `http://localhost:5000` (or your server URL)
- `token`: Your JWT authentication token (for authenticated requests)

### Sample Requests

#### 1. Get All Tabs (Public)
```
GET {{base_url}}/api/public/tabs
```

#### 2. Get All Tabs (Authenticated)
```
GET {{base_url}}/api/tabs
Authorization: Bearer {{token}}
```

#### 3. Create Tab (Admin)
```
POST {{base_url}}/api/tabs
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Contact",
  "status": true,
  "sortOrder": 5
}
```

#### 4. Update Tab (Admin)
```
PUT {{base_url}}/api/tabs/64f1a2b3c4d5e6f7g8h9i0j6
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Home Page",
  "status": true,
  "sortOrder": 1
}
```

#### 5. Delete Tab (Admin)
```
DELETE {{base_url}}/api/tabs/64f1a2b3c4d5e6f7g8h9i0j6
Authorization: Bearer {{token}}
```

## Notes

- Tabs are automatically sorted by `sortOrder` in ascending order
- Tab names are unique (case-insensitive)
- The `status` field can be used to show/hide tabs in the frontend
- Public endpoints are useful for displaying tabs to non-authenticated users
- All endpoints include proper error handling and validation
- CORS is configured to allow all origins (*)

## Testing

1. Start the server: `npm start`
2. Use Postman or any HTTP client to test the endpoints
3. For authenticated endpoints, first login to get a JWT token
4. Test both public and authenticated endpoints
5. Verify error responses for invalid requests

## Example Workflow

1. Create tabs for your website navigation (Home, Products, About, Contact)
2. Set appropriate sortOrder values to control display order
3. Use status field to enable/disable tabs as needed
4. Retrieve tabs for frontend navigation display
5. Update or delete tabs as your website structure changes

This tab system allows for flexible navigation management in your e-commerce application.
