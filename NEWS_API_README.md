# News API Documentation

This document provides Postman-style requests for the News API endpoints. All requests assume the server is running on `http://localhost:5000`.

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Admin-only endpoints require admin privileges.

---

## 1. Get All News (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/news/public`
**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6743a1b2c3d4e5f678901234",
      "page": "home_2",
      "category": "அரசியல்",
      "slug": "dmk-alliance-talks-2025",
      "thumb": {
        "filename": "1730372562123-thumb-news-image.jpg",
        "originalName": "news-image.jpg",
        "mimetype": "image/jpeg",
        "size": 2048576,
        "uploadedAt": "2025-10-31T10:22:42.123Z"
      },
      "tag": "அரசியல்",
      "title": "திமுக-காங்கிரஸ் கூட்டணி பேச்சுவார்த்தை: 2026 தேர்தலுக்கு தயாராகும் திட்டங்கள்",
      "excerpt": "தமிழ்நாட்டில் 2026 சட்டமன்றத் தேர்தலுக்கு திமுக மற்றும் காங்கிரஸ் கட்சிகள் இடையே கூட்டணி பேச்சுவார்த்தைகள் தீவிரமடைந்துள்ளன.",
      "date": "29 october, 2025",
      "time": "03:00pm",
      "paragraphs": [
        "சென்னையில் நடைபெற்ற சமீபத்திய சந்திப்பில் திமுக தலைவர் மு.க. ஸ்டாலின் மற்றும் காங்கிரஸ் தலைவர் கே. மணி ஆகியோர் கூட்டணி உத்திகள் குறித்து விரிவாக விவாதித்தனர்.",
        "இந்த கூட்டணி மாநிலத்தில் அதிமுகவின் செல்வாக்கை சவால் செய்யும் என எதிர்க்கட்சி தலைவர்கள் எச்சரிக்கை விடுத்துள்ளனர்."
      ],
      "images": [
        {
          "filename": "1730372562124-gallery-image1.jpg",
          "originalName": "gallery-image1.jpg",
          "mimetype": "image/jpeg",
          "size": 1536000,
          "uploadedAt": "2025-10-31T10:22:42.124Z"
        },
        {
          "filename": "1730372562125-gallery-image2.jpg",
          "originalName": "gallery-image2.jpg",
          "mimetype": "image/jpeg",
          "size": 2048000,
          "uploadedAt": "2025-10-31T10:22:42.125Z"
        }
      ],
      "videoUrl": "Ml4XCF-JS0k",
      "isActive": true,
      "createdAt": "2025-10-31T10:22:42.123Z",
      "updatedAt": "2025-10-31T10:22:42.123Z"
    }
  ]
}
```

---

## 2. Get News by Category (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/news/category/{categoryId}`
**Headers:**
```
Content-Type: application/json
```

**Example URL:** `http://localhost:5000/api/news/category/6743a1b2c3d4e5f678901235`

---

## 3. Get News by Slug (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/news/slug/{slug}`
**Headers:**
```
Content-Type: application/json
```

**Example URL:** `http://localhost:5000/api/news/slug/dmk-alliance-talks-2025`

---

## 3.5. Get News Image (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/news/{id}/image/{imageIndex}`
**Headers:** None required

**Example URL:** `http://localhost:5000/api/news/6743a1b2c3d4e5f678901234/image/0`

**Response:** Binary image data with appropriate Content-Type headers

---

## 3.6. Get News Thumbnail (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/news/{id}/thumb`
**Headers:** None required

**Example URL:** `http://localhost:5000/api/news/6743a1b2c3d4e5f678901234/thumb`

**Response:** Binary thumbnail image data with appropriate Content-Type headers

---

## 4. Get All News (Authenticated)

**Method:** GET
**URL:** `http://localhost:5000/api/news/`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 5. Get Single News Article

**Method:** GET
**URL:** `http://localhost:5000/api/news/{id}`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example URL:** `http://localhost:5000/api/news/6743a1b2c3d4e5f678901234`

---

## 6. Get Deleted News (Admin Only)

**Method:** GET
**URL:** `http://localhost:5000/api/news/deleted`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

---

## 7. Create News Article (Admin Only)

**Method:** POST
**URL:** `http://localhost:5000/api/news/`
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```
**Content-Type:** `multipart/form-data` (for file uploads)

**Form Data (All fields as form-data):**
- **page:** `home_2`
- **category:** `கல்வி`
- **slug:** `dmk-alliance-talks-2025`
- **thumb:** (Select single thumbnail image file - max 5MB)
- **tag:** `அரசியல்`
- **title:** `திமுக-காங்கிரஸ் கூட்டணி பேச்சுவார்த்தை: 2026 தேர்தலுக்கு தயாராகும் திட்டங்கள்`
- **excerpt:** `தமிழ்நாட்டில் 2026 சட்டமன்றத் தேர்தலுக்கு திமுக மற்றும் காங்கிரஸ் கட்சிகள் இடையே கூட்டணி பேச்சுவார்த்தைகள் தீவிரமடைந்துள்ளன. முக்கிய தலைவர்கள் சந்திப்பு நடைபெற்றது.`
- **date:** `29 october, 2025`
- **time:** `03:00pm`
- **paragraphs:** `["சென்னையில் நடைபெற்ற சமீபத்திய சந்திப்பில் திமுக தலைவர் மு.க. ஸ்டாலின் மற்றும் காங்கிரஸ் தலைவர் கே. மணி ஆகியோர் கூட்டணி உத்திகள் குறித்து விரிவாக விவாதித்தனர்.", "இந்த கூட்டணி மாநிலத்தில் அதிமுகவின் செல்வாக்கை சவால் செய்யும் என எதிர்க்கட்சி தலைவர்கள் எச்சரிக்கை விடுத்துள்ளனர்."]`
- **videoUrl:** `Ml4XCF-JS0k`
- **images:** (Select multiple image files - up to 10 images, max 5MB each)

**Response:**
```json
{
  "success": true,
  "message": "News article created successfully",
  "data": {
    "_id": "6743a1b2c3d4e5f678901234",
    "page": "home_2",
    "category": "அரசியல்",
    "slug": "dmk-alliance-talks-2025",
    "thumb": {
      "filename": "1730372562123-thumb-news-image.jpg",
      "originalName": "news-image.jpg",
      "mimetype": "image/jpeg",
      "size": 2048576,
      "uploadedAt": "2025-10-31T10:22:42.123Z"
    },
    "tag": "அரசியல்",
    "title": "திமுக-காங்கிரஸ் கூட்டணி பேச்சுவார்த்தை: 2026 தேர்தலுக்கு தயாராகும் திட்டங்கள்",
    "excerpt": "தமிழ்நாட்டில் 2026 சட்டமன்றத் தேர்தலுக்கு திமுக மற்றும் காங்கிரஸ் கட்சிகள் இடையே கூட்டணி பேச்சுவார்த்தைகள் தீவிரமடைந்துள்ளன. முக்கிய தலைவர்கள் சந்திப்பு நடைபெற்றது.",
    "date": "29 october, 2025",
    "time": "03:00pm",
    "paragraphs": [
      "சென்னையில் நடைபெற்ற சமீபத்திய சந்திப்பில் திமுக தலைவர் மு.க. ஸ்டாலின் மற்றும் காங்கிரஸ் தலைவர் கே. மணி ஆகியோர் கூட்டணி உத்திகள் குறித்து விரிவாக விவாதித்தனர்.",
      "இந்த கூட்டணி மாநிலத்தில் அதிமுகவின் செல்வாக்கை சவால் செய்யும் என எதிர்க்கட்சி தலைவர்கள் எச்சரிக்கை விடுத்துள்ளனர்."
    ],
    "images": [
      {
        "filename": "1730372562124-gallery-image1.jpg",
        "originalName": "gallery-image1.jpg",
        "mimetype": "image/jpeg",
        "size": 1536000,
        "uploadedAt": "2025-10-31T10:22:42.124Z"
      }
    ],
    "videoUrl": "Ml4XCF-JS0k",
    "isActive": true,
    "createdAt": "2025-10-31T10:22:42.123Z",
    "updatedAt": "2025-10-31T10:22:42.123Z"
  }
}
```

---

## 8. Update News Article (Admin Only)

**Method:** PUT
**URL:** `http://localhost:5000/api/news/{id}`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Example URL:** `http://localhost:5000/api/news/6743a1b2c3d4e5f678901234`

**Body:** (same structure as create, include only fields to update)
```json
{
  "title": "Updated Title",
  "excerpt": "Updated excerpt"
}
```

**Response:**
```json
{
  "success": true,
  "message": "News article updated successfully",
  "data": { ... }
}
```

---

## 9. Delete News Article (Soft Delete - Admin Only)

**Method:** DELETE
**URL:** `http://localhost:5000/api/news/{id}`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Example URL:** `http://localhost:5000/api/news/6743a1b2c3d4e5f678901234`

**Response:**
```json
{
  "success": true,
  "message": "News article deleted successfully"
}
```

---

## 10. Hard Delete News Article (Permanent - Admin Only)

**Method:** DELETE
**URL:** `http://localhost:5000/api/news/{id}/hard`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Example URL:** `http://localhost:5000/api/news/6743a1b2c3d4e5f678901234/hard`

**Response:**
```json
{
  "success": true,
  "message": "News article permanently deleted successfully"
}
```

---

## Error Responses

**Authentication Error:**
```json
{
  "message": "Access token is required"
}
```

**Authorization Error:**
```json
{
  "message": "Admin access required"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "News article with this slug already exists"
}
```

**Not Found Error:**
```json
{
  "success": false,
  "message": "News article not found"
}
```

---

## Notes

1. **Category**: Enter category as a string (e.g., "அரசியல்", "கல்வி", "விளையாட்டு"). No need to get category IDs from separate collection.
2. **Slug Uniqueness**: Each news article must have a unique slug
3. **Soft Delete**: Deleted articles (isActive: false) can be viewed via `/deleted` endpoint but won't appear in regular queries
4. **Public Access**: Endpoints like `/public`, `/category/{categoryName}`, `/slug/{slug}`, and image serving don't require authentication
5. **Admin Operations**: Create, Update, Delete operations require admin JWT token
6. **Image Upload**: Images are stored directly in MongoDB Atlas as binary data. Use multipart/form-data for uploads. Maximum 1 thumbnail + 10 images per article, 5MB each
7. **Image Access**: Access uploaded images via `GET /api/news/{id}/image/{imageIndex}` and thumbnails via `GET /api/news/{id}/thumb`
8. **Upload Timestamps**: Both article creation time (`createdAt`) and individual image upload times (`uploadedAt`) are automatically recorded
9. **File Types**: Only image files (image/*) are accepted for upload

## Postman Collection

You can import these requests into Postman by creating a new collection and adding each request with the specified method, URL, headers, and body.
