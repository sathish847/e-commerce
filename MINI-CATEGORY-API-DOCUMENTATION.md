# MiniCategory API Documentation

This document provides detailed information about the MiniCategory API endpoints for the E-commerce backend.

## Overview

The MiniCategory API allows you to manage product mini categories with sort ordering, status, and image storage. Each mini category belongs to a specific category and subcategory combination. There are two types of endpoints:

1. **Authenticated API** (`/api/minicategories`) - Requires authentication and provides full CRUD operations
2. **Public API** (`/api/public/minicategories`) - No authentication required, read-only access

## Authentication

### Authenticated Endpoints
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Admin Required
Create, Update, and Delete operations require admin privileges.

## API Endpoints

### 1. Get All MiniCategories (Authenticated)

**Endpoint:** `GET /api/minicategories`

**Authentication:** Required (any authenticated user)

**Description:** Retrieve all mini categories sorted by sortOrder.

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
      "name": "iPhone 15 Pro",
      "category": "Electronics",
      "subCategory": "Smartphones",
      "sortOrder": 1,
      "status": true,
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "createdAt": "2023-09-01T12:00:00.000Z",
      "updatedAt": "2023-09-01T12:00:00.000Z"
    }
  ]
}
```

### 2. Get MiniCategories by Category and SubCategory (Authenticated)

**Endpoint:** `GET /api/minicategories/category/:categoryName/subcategory/:subCategoryName`

**Authentication:** Required (any authenticated user)

**Description:** Retrieve all active mini categories for a specific category and subcategory combination.

**Parameters:**
- `categoryName` (path): Parent Category Name (case-insensitive)
- `subCategoryName` (path): Parent SubCategory Name (case-insensitive)

**Response:** Same format as above, filtered by category and subcategory

### 3. Get Single MiniCategory (Authenticated)

**Endpoint:** `GET /api/minicategories/:id`

**Authentication:** Required (any authenticated user)

**Parameters:**
- `id` (path): MiniCategory ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
    "name": "iPhone 15 Pro",
    "category": "Electronics",
    "subCategory": "Smartphones",
    "sortOrder": 1,
    "status": true,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-01T12:00:00.000Z"
  }
}
```

### 4. Create MiniCategory (Admin Only)

**Endpoint:** `POST /api/minicategories`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Samsung Galaxy S24",
  "category": "Electronics",
  "subCategory": "Smartphones",
  "sortOrder": 2,
  "status": true,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "MiniCategory created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
    "name": "Samsung Galaxy S24",
    "category": "Electronics",
    "subCategory": "Smartphones",
    "sortOrder": 2,
    "status": true,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "createdAt": "2023-09-01T12:15:00.000Z",
    "updatedAt": "2023-09-01T12:15:00.000Z"
  }
}
```

### 5. Update MiniCategory (Admin Only)

**Endpoint:** `PUT /api/minicategories/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): MiniCategory ID

**Request Body:**
```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "category": "Electronics",
  "subCategory": "Smartphones",
  "sortOrder": 3,
  "status": true,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "MiniCategory updated successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
    "name": "Samsung Galaxy S24 Ultra",
    "category": "Electronics",
    "subCategory": "Smartphones",
    "sortOrder": 3,
    "status": true,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "createdAt": "2023-09-01T12:15:00.000Z",
    "updatedAt": "2023-09-01T12:20:00.000Z"
  }
}
```

### 6. Delete MiniCategory (Admin Only)

**Endpoint:** `DELETE /api/minicategories/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): MiniCategory ID

**Response:**
```json
{
  "success": true,
  "message": "MiniCategory deleted successfully"
}
```

### 7. Get All MiniCategories (Public)

**Endpoint:** `GET /api/public/minicategories`

**Authentication:** Not required

**Description:** Public endpoint to retrieve all mini categories without authentication.

**Response:** Same as authenticated GET /api/minicategories

### 8. Get MiniCategories by Category and SubCategory (Public)

**Endpoint:** `GET /api/public/minicategories/category/:categoryName/subcategory/:subCategoryName`

**Authentication:** Not required

**Description:** Public endpoint to retrieve mini categories for a specific category and subcategory combination.

**Response:** Same as authenticated GET /api/minicategories/category/:categoryName/subcategory/:subCategoryName

### 9. Get Single MiniCategory (Public)

**Endpoint:** `GET /api/public/minicategories/:id`

**Authentication:** Not required

**Description:** Public endpoint to retrieve a single mini category without authentication.

**Response:** Same as authenticated GET /api/minicategories/:id

## Request/Response Format

### MiniCategory Object Structure

```json
{
  "_id": "string",           // MongoDB ObjectId
  "name": "string",          // Required, trimmed
  "category": "string",      // Required, category name
  "subCategory": "string",   // Required, subcategory name
  "sortOrder": "number",     // Required, default 0, minimum 0
  "status": "boolean",       // Default true (active/inactive)
  "image": "string",         // Optional, image URL/path
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

### Create/Update MiniCategory Validation

- **name**: Required, string, trimmed, unique within the same category and subcategory (case-insensitive)
- **category**: Required, string, must match an existing category name (case-insensitive)
- **subCategory**: Required, string, must match an existing subcategory name within the specified category (case-insensitive)
- **sortOrder**: Required, number, minimum 0
- **status**: Optional boolean, defaults to true
- **image**: Optional string, trimmed

### Common Validation Errors

- **400 Bad Request**: Category does not exist, SubCategory does not exist in category, MiniCategory name already exists
- **404 Not Found**: MiniCategory not found
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Admin privileges required
- **500 Internal Server Error**: Server error

## Postman Collection

### Environment Variables

Set up these environment variables in Postman:

- `base_url`: `http://localhost:5000` (or your server URL)
- `token`: Your JWT authentication token (for authenticated requests)

### Sample Requests

#### 1. Get All MiniCategories (Public)
```
GET {{base_url}}/api/public/minicategories
```

#### 2. Get MiniCategories by Category and SubCategory (Public)
```
GET {{base_url}}/api/public/minicategories/category/Electronics/subcategory/Smartphones
```

#### 3. Get All MiniCategories (Authenticated)
```
GET {{base_url}}/api/minicategories
Authorization: Bearer {{token}}
```

#### 4. Create MiniCategory (Admin)
```
POST {{base_url}}/api/minicategories
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Google Pixel 8",
  "category": "Electronics",
  "subCategory": "Smartphones",
  "sortOrder": 4,
  "status": true,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

#### 5. Update MiniCategory (Admin)
```
PUT {{base_url}}/api/minicategories/64f1a2b3c4d5e6f7g8h9i0j7
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Google Pixel 8 Pro",
  "category": "Electronics",
  "subCategory": "Smartphones",
  "sortOrder": 5,
  "status": true,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

#### 6. Delete MiniCategory (Admin)
```
DELETE {{base_url}}/api/minicategories/64f1a2b3c4d5e6f7g8h9i0j7
Authorization: Bearer {{token}}
```

## Notes

- MiniCategories are automatically sorted by `sortOrder` in ascending order
- MiniCategory names must be unique within the same category and subcategory combination (case-insensitive)
- Both `category` and `subCategory` must exist and be properly related before creating a mini category
- The `status` field can be used to show/hide mini categories in the frontend (true = active, false = inactive)
- The `image` field is optional and can store image URLs or file paths
- Public endpoints are useful for displaying mini categories to non-authenticated users
- All endpoints include proper error handling and validation
- CORS is configured to allow all origins (*)

## Hierarchical Structure

The categorization system follows this hierarchy:
```
Category (e.g., "Electronics")
  └── SubCategory (e.g., "Smartphones")
      └── MiniCategory (e.g., "iPhone 15 Pro", "Samsung Galaxy S24")
```

## Relationships

- **MiniCategory → Category**: String reference by name
- **MiniCategory → SubCategory**: String reference by name (scoped to category)
- Each MiniCategory belongs to exactly one Category and one SubCategory combination
- One Category+SubCategory combination can have multiple MiniCategories

## Testing

1. Start the server: `npm start`
2. Use Postman or any HTTP client to test the endpoints
3. For authenticated endpoints, first login to get a JWT token
4. Test both public and authenticated endpoints
5. Verify error responses for invalid requests
6. Test the hierarchical filtering endpoints with valid category and subcategory names

## Example Workflow

1. Create a Category first (via `/api/categories`)
2. Create a SubCategory under that Category (via `/api/subcategories`)
3. Create MiniCategories under that Category+SubCategory combination (via `/api/minicategories`)
4. Retrieve MiniCategories by Category and SubCategory (via `/api/minicategories/category/:categoryName/subcategory/:subCategoryName`)
5. Update or delete MiniCategories as needed

This 3-level hierarchical structure provides granular categorization for products in your e-commerce application, allowing for detailed product organization and filtering.
