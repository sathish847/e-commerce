# MainNews API Documentation

This document provides comprehensive information about the MainNews API endpoints, including authentication requirements and Postman request examples.

## Base URL
```
{{base_url}}/api/main_news
```

## Authentication
- **Bearer Token**: Include `Authorization: Bearer {{token}}` header for authenticated requests
- **Admin Only**: Some endpoints require admin privileges

---

## Endpoints

### 1. Get All MainNews (Public)
**GET** `{{base_url}}/api/main_news/public`

**Authentication**: None required

**Response**:
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### 2. Get MainNews by Slug (Public)
**GET** `{{base_url}}/api/main_news/slug/{{slug}}`

**Authentication**: None required

**Response**:
```json
{
  "success": true,
  "data": {...}
}
```

### 4. Get MainNews Thumbnail (Public)
**GET** `{{base_url}}/api/main_news/{{id}}/thumb`

**Authentication**: None required

**Response**: Image binary data

### 5. Get All MainNews (Authenticated)
**GET** `{{base_url}}/api/main_news/`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### 6. Get Single MainNews (Authenticated)
**GET** `{{base_url}}/api/main_news/{{id}}`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "data": {...}
}
```

### 7. Get Deleted MainNews (Admin Only)
**GET** `{{base_url}}/api/main_news/deleted`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### 8. Create MainNews (Admin Only)
**POST** `{{base_url}}/api/main_news/`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: multipart/form-data
```

**Form Data**:
- **slug**: string (required, unique)
- **title**: string (required)
- **excerpt**: string (required)
- **date**: string (required)
- **time**: string (required)
- **paragraphs**: array of strings
- **videoUrl**: string
- **thumb**: file (image)

**Response**:
```json
{
  "success": true,
  "message": "MainNews article created successfully",
  "data": {...}
}
```

### 9. Update MainNews (Admin Only)
**PUT** `{{base_url}}/api/main_news/{{id}}`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body** (JSON - only include fields to update):
```json
{
  "title": "Updated Title",
  "excerpt": "Updated excerpt",
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "MainNews article updated successfully",
  "data": {...}
}
```

### 10. Delete MainNews (Soft Delete - Admin Only)
**DELETE** `{{base_url}}/api/main_news/{{id}}`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "message": "MainNews article deleted successfully"
}
```

### 11. Hard Delete MainNews (Permanent - Admin Only)
**DELETE** `{{base_url}}/api/main_news/{{id}}/hard`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "message": "MainNews article permanently deleted successfully"
}
```

---

## Data Model

The MainNews model has the following fields:

```javascript
{
  slug: String,           // required, unique
  thumb: {                // thumbnail image
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    data: Buffer,
    uploadedAt: Date
  },
  title: String,          // required
  excerpt: String,        // required
  date: String,           // required
  time: String,           // required
  paragraphs: [String],   // array of strings
  videoUrl: String,
  isActive: Boolean,      // default: true
  createdAt: Date,        // auto-generated
  updatedAt: Date         // auto-generated
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors, duplicate slugs)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (admin access required)
- **404**: Not Found
- **500**: Internal Server Error

---

## Postman Collection

Import this collection into Postman and set the following variables:
- **base_url**: Your API base URL (e.g., `http://localhost:5000`)
- **token**: Your authentication token

## Notes

- File uploads are limited to 5MB per file
- Maximum 1 file per upload (thumbnail only)
- Only image files are accepted for uploads
- Soft delete sets `isActive` to `false` instead of removing the record
- Public endpoints don't require authentication but may have limited data access
- Admin endpoints require both authentication and admin privileges
