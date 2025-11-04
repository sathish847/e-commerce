# SubCategory API Documentation

This document provides detailed information about the SubCategory API endpoints for the E-commerce backend.

## Overview

The SubCategory API allows you to manage product subcategories with sort ordering and active/inactive status. Each subcategory belongs to a parent category. There are two types of endpoints:

1. **Authenticated API** (`/api/subcategories`) - Requires authentication and provides full CRUD operations
2. **Public API** (`/api/public/subcategories`) - No authentication required, read-only access

## Authentication

### Authenticated Endpoints
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Admin Required
Create, Update, and Delete operations require admin privileges.

## API Endpoints

### 1. Get All SubCategories (Authenticated)

**Endpoint:** `GET /api/subcategories`

**Authentication:** Required (any authenticated user)

**Description:** Retrieve all subcategories sorted by sortOrder with populated category information.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
      "name": "Smartphones",
      "category": "Electronics",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2023-09-01T11:00:00.000Z",
      "updatedAt": "2023-09-01T11:00:00.000Z"
    }
  ]
}
```

### 2. Get SubCategories by Category (Authenticated)

**Endpoint:** `GET /api/subcategories/category/:categoryName`

**Authentication:** Required (any authenticated user)

**Description:** Retrieve all active subcategories for a specific category.

**Parameters:**
- `categoryName` (path): Parent Category Name (case-insensitive)

**Response:** Same format as above, filtered by category

### 3. Get Single SubCategory (Authenticated)

**Endpoint:** `GET /api/subcategories/:id`

**Authentication:** Required (any authenticated user)

**Parameters:**
- `id` (path): SubCategory ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
    "name": "Smartphones",
    "category": "Electronics",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2023-09-01T11:00:00.000Z",
    "updatedAt": "2023-09-01T11:00:00.000Z"
  }
}
```

### 4. Create SubCategory (Admin Only)

**Endpoint:** `POST /api/subcategories`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Laptops",
  "category": "Electronics",
  "sortOrder": 2,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "SubCategory created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "name": "Laptops",
    "category": "Electronics",
    "sortOrder": 2,
    "isActive": true,
    "createdAt": "2023-09-01T11:15:00.000Z",
    "updatedAt": "2023-09-01T11:15:00.000Z"
  }
}
```

### 5. Update SubCategory (Admin Only)

**Endpoint:** `PUT /api/subcategories/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): SubCategory ID

**Request Body:**
```json
{
  "name": "Gaming Laptops",
  "category": "Electronics",
  "sortOrder": 3,
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "SubCategory updated successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "name": "Gaming Laptops",
    "category": "Electronics",
    "sortOrder": 3,
    "isActive": false,
    "createdAt": "2023-09-01T11:15:00.000Z",
    "updatedAt": "2023-09-01T11:20:00.000Z"
  }
}
```

### 6. Delete SubCategory (Admin Only)

**Endpoint:** `DELETE /api/subcategories/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): SubCategory ID

**Response:**
```json
{
  "success": true,
  "message": "SubCategory deleted successfully"
}
```

### 7. Get All SubCategories (Public)

**Endpoint:** `GET /api/public/subcategories`

**Authentication:** Not required

**Description:** Public endpoint to retrieve all subcategories without authentication.

**Response:** Same as authenticated GET /api/subcategories

### 8. Get SubCategories by Category (Public)

**Endpoint:** `GET /api/public/subcategories/category/:categoryName`

**Authentication:** Not required

**Description:** Public endpoint to retrieve subcategories for a specific category.

**Response:** Same as authenticated GET /api/subcategories/category/:categoryName

### 9. Get Single SubCategory (Public)

**Endpoint:** `GET /api/public/subcategories/:id`

**Authentication:** Not required

**Description:** Public endpoint to retrieve a single subcategory without authentication.

**Response:** Same as authenticated GET /api/subcategories/:id

## Request/Response Format

### SubCategory Object Structure

```json
{
  "_id": "string",           // MongoDB ObjectId
  "name": "string",          // Required, trimmed
  "category": "string",      // Required, category name (string)
  "sortOrder": "number",     // Required, default 0, minimum 0
  "isActive": "boolean",     // Default true
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

### Create/Update SubCategory Validation

- **name**: Required, string, trimmed, unique within the same category (case-insensitive)
- **category**: Required, string, must match an existing category name (case-insensitive)
- **sortOrder**: Required, number, minimum 0
- **isActive**: Optional boolean, defaults to true

### Common Validation Errors

- **400 Bad Request**: Category does not exist, SubCategory name already exists in category
- **404 Not Found**: SubCategory not found, Category not found
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Admin privileges required
- **500 Internal Server Error**: Server error

## Postman Collection

### Environment Variables

Set up these environment variables in Postman:

- `base_url`: `http://localhost:5000` (or your server URL)
- `token`: Your JWT authentication token (for authenticated requests)

### Sample Requests

#### 1. Get All SubCategories (Public)
```
GET {{base_url}}/api/public/subcategories
```

#### 2. Get SubCategories by Category (Public)
```
GET {{base_url}}/api/public/subcategories/category/Electronics
```

#### 3. Get All SubCategories (Authenticated)
```
GET {{base_url}}/api/subcategories
Authorization: Bearer {{token}}
```

#### 4. Create SubCategory (Admin)
```
POST {{base_url}}/api/subcategories
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Tablets",
  "category": "Electronics",
  "sortOrder": 4,
  "isActive": true
}
```

#### 5. Update SubCategory (Admin)
```
PUT {{base_url}}/api/subcategories/64f1a2b3c4d5e6f7g8h9i0j5
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Android Tablets",
  "category": "Electronics",
  "sortOrder": 5,
  "isActive": true
}
```

#### 6. Delete SubCategory (Admin)
```
DELETE {{base_url}}/api/subcategories/64f1a2b3c4d5e6f7g8h9i0j5
Authorization: Bearer {{token}}
```

## Notes

- SubCategories are automatically sorted by `sortOrder` in ascending order
- SubCategory names must be unique within the same parent category (case-insensitive)
- The `category` field is required and must reference an existing category
- The `isActive` field can be used to show/hide subcategories in the frontend
- Public endpoints are useful for displaying subcategories to non-authenticated users
- All endpoints include proper error handling and validation
- Category information is populated in responses for better data access
- CORS is configured to allow all origins (*)

## Relationships

- **SubCategory → Category**: Many-to-One relationship
- Each SubCategory belongs to exactly one Category
- One Category can have multiple SubCategories
- Deleting a Category does not automatically delete its SubCategories (you may want to handle this in your application logic)

## Testing

1. Start the server: `npm start`
2. Use Postman or any HTTP client to test the endpoints
3. For authenticated endpoints, first login to get a JWT token
4. Test both public and authenticated endpoints
5. Verify error responses for invalid requests
6. Test the category-specific endpoints with valid category IDs

## Example Workflow

1. Create a Category first (via `/api/categories`)
2. Create SubCategories under that Category (via `/api/subcategories`)
3. Retrieve SubCategories by Category (via `/api/subcategories/category/:categoryId`)
4. Update or delete SubCategories as needed

This hierarchical structure allows for better organization of products in your e-commerce application.
