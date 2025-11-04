# Product API Documentation

This document provides detailed information about the Product API endpoints for the E-commerce backend.

## Overview

The Product API allows you to manage products with detailed information including pricing, inventory, categories, tags, and multiple images. Products can be filtered by category or tag. There are two types of endpoints:

1. **Public API** (`/api/products`) - No authentication required for read operations
2. **Authenticated API** (`/api/products`) - Requires authentication for admin operations (create, update, delete)

## Authentication

### Authenticated Endpoints
Create, Update, and Delete operations require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Admin Required
Create, Update, and Delete operations require admin privileges.

## API Endpoints

### 1. Get All Products (Public)

**Endpoint:** `GET /api/products`

**Authentication:** Not required

**Description:** Retrieve all active products sorted by creation date (newest first).

### 1.1. Get All Products (Admin)

**Endpoint:** `GET /api/products/admin/all`

**Authentication:** Required (any authenticated user)

**Description:** Retrieve all products including inactive ones, sorted by creation date (newest first). Useful for admin panels to manage all products.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
      "sku": "giftbouquet001",
      "name": "Rose & Chocolate Gift Bouquet",
      "price": 49.99,
      "discount": 15,
      "new": true,
      "rating": 4.8,
      "saleCount": 28,
      "category": ["flower", "couple-gifts", "husband", "wife", "parents"],
      "tag": ["flower"],
      "stock": 10,
      "image": [
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=="
      ],
      "shortDescription": "A stunning bouquet combining fresh red roses with gourmet chocolates, perfect for romantic or celebratory gifts.",
      "fullDescription": "This elegant gift bouquet pairs vibrant red roses with a selection of premium gourmet chocolates, beautifully arranged to resemble a traditional floral bouquet. Each rose is hand-picked for freshness, and the chocolates are nestled among the blooms in a luxurious gift box. Ideal for anniversaries, Valentine's Day, or to express heartfelt sentiments, this bouquet is a perfect blend of beauty and sweetness, sure to delight any recipient.",
      "status": true,
      "createdAt": "2023-09-01T12:00:00.000Z",
      "updatedAt": "2023-09-01T12:00:00.000Z"
    }
  ]
}
```

### 2. Get Single Product (Public)

**Endpoint:** `GET /api/products/:id`

**Authentication:** Not required

**Parameters:**
- `id` (path): Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
    "sku": "giftbouquet001",
    "name": "Rose & Chocolate Gift Bouquet",
    "price": 49.99,
    "discount": 15,
    "new": true,
    "rating": 4.8,
    "saleCount": 28,
    "category": ["flower", "couple-gifts", "husband", "wife", "parents"],
    "tag": ["flower"],
    "stock": 10,
    "image": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==",
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=="
    ],
    "shortDescription": "A stunning bouquet combining fresh red roses with gourmet chocolates, perfect for romantic or celebratory gifts.",
    "fullDescription": "This elegant gift bouquet pairs vibrant red roses with a selection of premium gourmet chocolates, beautifully arranged to resemble a traditional floral bouquet. Each rose is hand-picked for freshness, and the chocolates are nestled among the blooms in a luxurious gift box. Ideal for anniversaries, Valentine's Day, or to express heartfelt sentiments, this bouquet is a perfect blend of beauty and sweetness, sure to delight any recipient.",
    "status": true,
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-01T12:00:00.000Z"
  }
}
```

### 3. Get Products by Category (Public)

**Endpoint:** `GET /api/products/category/:categoryName`

**Authentication:** Not required

**Description:** Retrieve all active products that belong to a specific category.

**Parameters:**
- `categoryName` (path): Category name (case-insensitive)

**Response:** Same format as Get All Products, filtered by category

### 4. Get Products by Tag (Public)

**Endpoint:** `GET /api/products/tag/:tagName`

**Authentication:** Not required

**Description:** Retrieve all active products that have a specific tag.

**Parameters:**
- `tagName` (path): Tag name (case-insensitive)

**Response:** Same format as Get All Products, filtered by tag

### 5. Create Product (Admin Only)

**Endpoint:** `POST /api/products`

**Authentication:** Required (Admin only)

**Content-Type:** `multipart/form-data`

**Form Data Fields:**
- `sku` (text): Product SKU (required)
- `name` (text): Product name (required)
- `price` (text): Product price (required)
- `discount` (text): Discount percentage (optional)
- `new` (text): New product flag - "true" or "false" (optional)
- `rating` (text): Product rating 0-5 (optional)
- `saleCount` (text): Number of sales (optional)
- `category` (text): Comma-separated categories (optional)
- `tag` (text): Comma-separated tags (optional)
- `stock` (text): Stock quantity (required)
- `shortDescription` (text): Short description (optional)
- `fullDescription` (text): Full description (optional)
- `status` (text): Active status - "true" or "false" (optional)
- `images` (file): Multiple image files (optional, max 10 files, 5MB each)

**Example Form Data:**
```
sku: giftbouquet002
name: Premium Chocolate Box
price: 29.99
discount: 10
new: false
rating: 4.9
saleCount: 45
category: couple-gifts,chocolates
tag: chocolate,premium
stock: 25
shortDescription: Luxurious assortment of premium chocolates
fullDescription: Indulge in our carefully curated selection of the finest chocolates from around the world. Each piece is handcrafted with the highest quality ingredients.
status: true
images: [Select multiple image files to upload]
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
    "sku": "giftbouquet002",
    "name": "Premium Chocolate Box",
    "price": 29.99,
    "discount": 10,
    "new": false,
    "rating": 4.9,
    "saleCount": 45,
    "category": ["couple-gifts", "chocolates"],
    "tag": ["chocolate", "premium"],
    "stock": 25,
    "image": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==",
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=="
    ],
    "shortDescription": "Luxurious assortment of premium chocolates",
    "fullDescription": "Indulge in our carefully curated selection of the finest chocolates from around the world. Each piece is handcrafted with the highest quality ingredients.",
    "status": true,
    "createdAt": "2023-09-01T12:15:00.000Z",
    "updatedAt": "2023-09-01T12:15:00.000Z"
  }
}
```

### 6. Update Product (Admin Only)

**Endpoint:** `PUT /api/products/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): Product ID

**Request Body:** (all fields optional, only provided fields will be updated)
```json
{
  "name": "Deluxe Premium Chocolate Box",
  "price": 34.99,
  "discount": 15,
  "stock": 30,
  "image": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
    "sku": "giftbouquet002",
    "name": "Deluxe Premium Chocolate Box",
    "price": 34.99,
    "discount": 15,
    "new": false,
    "rating": 4.9,
    "saleCount": 45,
    "category": ["couple-gifts", "chocolates"],
    "tag": ["chocolate", "premium"],
    "stock": 30,
    "image": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==",
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==",
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=="
    ],
    "shortDescription": "Luxurious assortment of premium chocolates",
    "fullDescription": "Indulge in our carefully curated selection of the finest chocolates from around the world. Each piece is handcrafted with the highest quality ingredients.",
    "status": true,
    "createdAt": "2023-09-01T12:15:00.000Z",
    "updatedAt": "2023-09-01T12:20:00.000Z"
  }
}
```

### 7. Delete Product (Admin Only)

**Endpoint:** `DELETE /api/products/:id`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (path): Product ID

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## Request/Response Format

### Product Object Structure

```json
{
  "_id": "string",              // MongoDB ObjectId
  "sku": "string",              // Required, unique, trimmed
  "name": "string",             // Required, trimmed
  "price": "number",            // Required, minimum 0
  "discount": "number",         // Optional, default 0, 0-100%
  "new": "boolean",             // Optional, default false
  "rating": "number",           // Optional, 0-5, default 0
  "saleCount": "number",        // Optional, minimum 0, default 0
  "category": ["string"],       // Optional array of category names
  "tag": ["string"],            // Optional array of tag names
  "stock": "number",            // Required, minimum 0, default 0
  "image": ["string"],          // Optional array of image URLs
  "shortDescription": "string", // Optional, trimmed
  "fullDescription": "string",  // Optional, trimmed
  "status": "boolean",          // Default true (active/inactive)
  "createdAt": "date",          // Auto-generated timestamp
  "updatedAt": "date"           // Auto-updated timestamp
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

### Create/Update Product Validation

- **sku**: Required, string, trimmed, unique (case-insensitive)
- **name**: Required, string, trimmed
- **price**: Required, number, minimum 0
- **discount**: Optional, number, 0-100
- **new**: Optional, boolean, default false
- **rating**: Optional, number, 0-5, default 0
- **saleCount**: Optional, number, minimum 0, default 0
- **category**: Optional, array of strings
- **tag**: Optional, array of strings
- **stock**: Required, number, minimum 0, default 0
- **image**: Optional, array of strings (URLs)
- **shortDescription**: Optional, string, trimmed
- **fullDescription**: Optional, string, trimmed
- **status**: Optional, boolean, default true

### Common Validation Errors

- **400 Bad Request**: SKU already exists, invalid data format
- **404 Not Found**: Product not found
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Admin privileges required
- **500 Internal Server Error**: Server error

## Postman Collection

### Environment Variables

Set up these environment variables in Postman:

- `base_url`: `http://localhost:5000` (or your server URL)
- `token`: Your JWT authentication token (for authenticated requests)

### Sample Requests

#### 1. Get All Products (Public)
```
GET {{base_url}}/api/products
```

#### 1.1. Get All Products (Admin)
```
GET {{base_url}}/api/products/admin/all
Authorization: Bearer {{token}}
```

#### 2. Get Single Product (Public)
```
GET {{base_url}}/api/products/64f1a2b3c4d5e6f7g8h9i0j6
```

#### 3. Get Products by Category (Public)
```
GET {{base_url}}/api/products/category/flower
```

#### 4. Get Products by Tag (Public)
```
GET {{base_url}}/api/products/tag/chocolate
```

#### 5. Create Product (Admin)
```
POST {{base_url}}/api/products
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

Form Data:
sku: giftbouquet003
name: Luxury Perfume Set
price: 89.99
discount: 20
new: true
rating: 4.7
saleCount: 15
category: couple-gifts,perfumes
tag: perfume,luxury
stock: 8
shortDescription: Elegant perfume set for special occasions
fullDescription: This luxurious perfume set includes two signature fragrances carefully crafted with the finest essential oils. Perfect for anniversaries, birthdays, or as a thoughtful gift for your loved one.
status: true
images: [Select image files to upload]
```

#### 6. Update Product (Admin)
```
PUT {{base_url}}/api/products/64f1a2b3c4d5e6f7g8h9i0j7
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "price": 79.99,
  "discount": 25,
  "stock": 12,
  "image": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=="
  ]
}
```

#### 7. Delete Product (Admin)
```
DELETE {{base_url}}/api/products/64f1a2b3c4d5e6f7g8h9i0j7
Authorization: Bearer {{token}}
```

## Notes

- Products are automatically sorted by creation date (newest first)
- Product SKUs must be unique across all products (case-insensitive)
- The `status` field can be used to show/hide products in the frontend (true = active, false = inactive)
- The `image` field stores an array of base64 encoded images directly in the database (format: `data:image/jpeg;base64,...`)
- Images are converted from uploaded files to base64 strings and stored in MongoDB
- Public endpoints are useful for displaying products to non-authenticated users
- All endpoints include proper error handling and validation
- CORS is configured to allow all origins (*)
- Categories and tags are stored as arrays for flexible product classification

## Product Features

- **Multi-image Support**: Store multiple product images as an array of URLs
- **Flexible Categorization**: Products can belong to multiple categories and have multiple tags
- **Inventory Management**: Track stock levels for each product
- **Pricing**: Support for base price and discount percentage
- **Rating System**: Store average customer ratings (0-5 scale)
- **Sales Tracking**: Monitor sales count for popularity metrics
- **New Product Flag**: Mark products as new for promotional purposes

## Relationships

- **Product → Categories**: Array of category names (flexible relationship)
- **Product → Tags**: Array of tag names (flexible relationship)
- Products are not strictly bound to the category hierarchy (unlike MiniCategories)
- One product can belong to multiple categories and have multiple tags

## Testing

1. Start the server: `npm start`
2. Use Postman or any HTTP client to test the endpoints
3. For authenticated endpoints, first login to get a JWT token
4. Test both public and authenticated endpoints
5. Verify error responses for invalid requests
6. Test filtering endpoints with valid category and tag names

## Example Workflow

1. Create products with detailed information including images, pricing, and categorization
2. Retrieve products for display on the frontend (public endpoints)
3. Filter products by category or tag for specific sections
4. Update product information as needed (admin operations)
5. Manage inventory by updating stock levels
6. Mark products as inactive when discontinued

This Product API provides comprehensive product management capabilities for your e-commerce application, supporting complex product data with multiple images, flexible categorization, and detailed inventory tracking.
