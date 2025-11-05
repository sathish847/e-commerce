# Wishlist API Documentation

## Overview
The Wishlist API provides endpoints for managing user wishlists. All endpoints require authentication via JWT token in the Authorization header.

## Base URL
```
/api/wishlist
```

## Authentication
All wishlist endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get User's Wishlist
Retrieve all items in the authenticated user's wishlist.

**GET** `/api/wishlist`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5ecb74bbb4c001f8b4567",
      "productId": {
        "_id": "60d5ecb74bbb4c001f8b4568",
        "id": 1,
        "sku": "PROD001",
        "name": "Sample Product",
        "price": 99.99,
        "discount": 10,
        "image": ["data:image/jpeg;base64,..."],
        "shortDescription": "Short description",
        "stock": 50,
        "status": true,
        "discountedPrice": 89.99
      },
      "quantity": 1,
      "addedAt": "2023-11-05T10:30:00.000Z"
    }
  ]
}
```

### 2. Add Item to Wishlist
Add a product to the user's wishlist or update quantity if already exists.

**POST** `/api/wishlist`

**Request Body:**
```json
{
  "productId": "2",
  "quantity": 1
}
```

**Note:** `productId` should be the frontend product ID (number), not the MongoDB ObjectId.

**Response:**
```json
{
  "success": true,
  "message": "Item added to wishlist successfully",
  "data": {
    "_id": "60d5ecb74bbb4c001f8b4567",
    "productId": {
      "_id": "60d5ecb74bbb4c001f8b4568",
      "id": 1,
      "sku": "PROD001",
      "name": "Sample Product",
      "price": 99.99,
      "discount": 10,
      "image": ["data:image/jpeg;base64,..."],
      "shortDescription": "Short description",
      "stock": 50,
      "status": true,
      "discountedPrice": 89.99
    },
    "quantity": 1,
    "addedAt": "2023-11-05T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Product ID required, Product not found, Product not available
- `500`: Server error

### 3. Update Wishlist Item Quantity
Update the quantity of a specific item in the wishlist.

**PUT** `/api/wishlist/:productId`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wishlist item updated successfully",
  "data": {
    "_id": "60d5ecb74bbb4c001f8b4567",
    "productId": {
      "_id": "60d5ecb74bbb4c001f8b4568",
      "id": 1,
      "sku": "PROD001",
      "name": "Sample Product",
      "price": 99.99,
      "discount": 10,
      "image": ["data:image/jpeg;base64,..."],
      "shortDescription": "Short description",
      "stock": 50,
      "status": true,
      "discountedPrice": 89.99
    },
    "quantity": 3,
    "addedAt": "2023-11-05T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Valid quantity required
- `404`: Wishlist not found, Item not found in wishlist
- `500`: Server error

### 4. Remove Item from Wishlist
Remove a specific item from the user's wishlist.

**DELETE** `/api/wishlist/:productId`

**Response:**
```json
{
  "success": true,
  "message": "Item removed from wishlist successfully"
}
```

**Error Responses:**
- `404`: Wishlist not found, Item not found in wishlist
- `500`: Server error

### 5. Clear Entire Wishlist
Remove all items from the user's wishlist.

**DELETE** `/api/wishlist`

**Response:**
```json
{
  "success": true,
  "message": "Wishlist cleared successfully"
}
```

**Error Responses:**
- `404`: Wishlist not found
- `500`: Server error

### 6. Check Wishlist Status
Check if a specific product is in the user's wishlist.

**GET** `/api/wishlist/check/:productId`

**Response:**
```json
{
  "success": true,
  "inWishlist": true,
  "productId": "60d5ecb74bbb4c001f8b4568"
}
```

**Error Responses:**
- `500`: Server error

## Data Models

### Wishlist Item
```json
{
  "_id": "string",
  "productId": {
    "_id": "string",
    "id": "number",
    "sku": "string",
    "name": "string",
    "price": "number",
    "discount": "number",
    "image": ["string"],
    "shortDescription": "string",
    "stock": "number",
    "status": "boolean",
    "discountedPrice": "number"
  },
  "quantity": "number",
  "addedAt": "date"
}
```

## Features

- **User-specific**: Each wishlist is tied to a user's email address
- **Product validation**: Only active products can be added to wishlists
- **Duplicate prevention**: Same product cannot be added twice
- **Quantity management**: Items can have quantities for wishlist purposes
- **Discount calculation**: Automatically calculates discounted prices
- **Data integrity**: Filters out inactive or deleted products from responses

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Rate Limiting

Wishlist endpoints are subject to the same rate limiting as other API endpoints (100 requests per 15 minutes per IP).

## Testing with Postman

### Authentication Setup
1. Login via `/auth/login` or `/auth/google` to get JWT token
2. Set Authorization header: `Bearer <token>`

### Sample Requests
- Get wishlist: `GET /api/wishlist`
- Add item: `POST /api/wishlist` with body `{"productId": "2"}`
- Update quantity: `PUT /api/wishlist/2` with body `{"quantity": 2}`
- Remove item: `DELETE /api/wishlist/2`
- Clear wishlist: `DELETE /api/wishlist`
- Check status: `GET /api/wishlist/check/2`

**Note:** Use frontend product IDs (numbers like "2", "44", "45") in all requests, not MongoDB ObjectIds.
