# Category API Documentation

This document provides detailed information about the Category API endpoints for the E-commerce backend.

## Overview

The Category API allows you to manage product categories with sort ordering and active/inactive status. There are two types of endpoints:

1. **Authenticated API** (`/api/categories`) - Requires authentication and provides full CRUD operations
2. **Public API** (`/api/public/categories`) - No authentication required, read-only access

## Authentication

### Authenticated Endpoints
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Admin Required
Create, Update, and Delete operations require admin privileges.

## API Endpoints

### 1. Get All Categories (Authenticated)

**Endpoint:** `GET /api/categories`

**Authentication:** Required (any authenticated user)

**Description:** Retrieve all categories sorted by sortOrder.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Electronics",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T10:00:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Clothing",
      "sortOrder": 2,
      "isActive": true,
      "createdAt": "2023-09-01T10:05:00.000Z",
      "updatedAt": "2023-09-01T10:05:00.000Z"
    }
  ]
}
```

### 2. Get Single Category (Authenticated)

**Endpoint:** `GET /api/categories/:id`

**Authentication:** Required (any authenticated user)

**Parameters:**
- `id` (path): Category ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Electronics",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2023-09-01T10:00:00.000Z",
    "updatedAt": "2023-09-01T10:00:00.000Z"
  }
}
```

### 3. Create Category (Admin Only)

**Endpoint:** `POST /api/categories`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Books",
  "sortOrder": 3,
  "isActive": true,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "name": "Books",
    "sortOrder": 3,
    "isActive": true,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "createdAt": "2023-09-01T10:10:00.000Z",
    "updatedAt": "2023-09-01T10:10:00.000Z"
  }
}
```

### 4. Update Category (Admin Only)

**Endpoint:** `PUT /api/categories/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): Category ID

**Request Body:**
```json
{
  "name": "Digital Books",
  "sortOrder": 4,
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "name": "Digital Books",
    "sortOrder": 4,
    "isActive": false,
    "createdAt": "2023-09-01T10:10:00.000Z",
    "updatedAt": "2023-09-01T10:15:00.000Z"
  }
}
```

### 5. Delete Category (Admin Only)

**Endpoint:** `DELETE /api/categories/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): Category ID

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

### 6. Get All Categories (Public)

**Endpoint:** `GET /api/public/categories`

**Authentication:** Not required

**Description:** Public endpoint to retrieve all categories without authentication.

**Response:** Same as authenticated GET /api/categories

### 7. Get Single Category (Public)

**Endpoint:** `GET /api/public/categories/:id`

**Authentication:** Not required

**Parameters:**
- `id` (path): Category ID

**Description:** Public endpoint to retrieve a single category without authentication.

**Response:** Same as authenticated GET /api/categories/:id

## Request/Response Format

### Category Object Structure

```json
{
  "_id": "string",           // MongoDB ObjectId
  "name": "string",          // Required, unique, trimmed
  "sortOrder": "number",     // Required, default 0, minimum 0
  "isActive": "boolean",     // Default true
  "image": "string",         // Optional, base64 encoded image
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

### Create/Update Category Validation

- **name**: Required, string, trimmed, unique (case-insensitive)
- **sortOrder**: Required, number, minimum 0
- **isActive**: Optional boolean, defaults to true
- **image**: Optional string, must be valid base64 format starting with "data:image/"

### Common Validation Errors

- **400 Bad Request**: Category name already exists
- **404 Not Found**: Category not found
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Admin privileges required
- **500 Internal Server Error**: Server error

## Postman Collection

### Environment Variables

Set up these environment variables in Postman:

- `base_url`: `http://localhost:5000` (or your server URL)
- `token`: Your JWT authentication token (for authenticated requests)

### Sample Requests

#### 1. Get All Categories (Public)
```
GET {{base_url}}/api/public/categories
```

#### 2. Get All Categories (Authenticated)
```
GET {{base_url}}/api/categories
Authorization: Bearer {{token}}
```

#### 3. Create Category (Admin)
```
POST {{base_url}}/api/categories
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Home & Garden",
  "sortOrder": 5,
  "isActive": true,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

#### 4. Update Category (Admin)
```
PUT {{base_url}}/api/categories/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Home & Kitchen",
  "sortOrder": 6,
  "isActive": false
}
```

#### 5. Delete Category (Admin)
```
DELETE {{base_url}}/api/categories/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer {{token}}
```

## Notes

- Categories are automatically sorted by `sortOrder` in ascending order
- Category names are unique (case-insensitive)
- The `isActive` field can be used to show/hide categories in the frontend
- Public endpoints are useful for displaying categories to non-authenticated users
- All endpoints include proper error handling and validation
- CORS is configured to allow all origins (*)

## Testing

1. Start the server: `npm start`
2. Use Postman or any HTTP client to test the endpoints
3. For authenticated endpoints, first login to get a JWT token
4. Test both public and authenticated endpoints
5. Verify error responses for invalid requests
