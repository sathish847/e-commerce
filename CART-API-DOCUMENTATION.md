# Cart API Documentation

## Overview
The Cart API provides endpoints for managing user shopping carts. All endpoints require authentication via JWT token in the Authorization header.

## Base URL
```
/api/cart
```

## Authentication
All cart endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get User's Cart
Retrieve all items in the authenticated user's cart with calculated totals.

**GET** `/api/cart`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "items": [
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
      "quantity": 2,
      "addedAt": "2023-11-05T10:30:00.000Z",
      "updatedAt": "2023-11-05T10:35:00.000Z"
    }
  ],
  "totals": {
    "subtotal": 179.98,
    "tax": 17.998,
    "shipping": 0,
    "total": 197.978,
    "totalItems": 2
  }
}
```

### 2. Add Item to Cart
Add a product to the user's cart or increase quantity if already exists.

**POST** `/api/cart`

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
  "message": "Item added to cart successfully",
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
    "quantity": 2,
    "addedAt": "2023-11-05T10:30:00.000Z",
    "updatedAt": "2023-11-05T10:35:00.000Z"
  },
  "cartCount": 3
}
```

**Error Responses:**
- `400`: Product ID required, Quantity out of range (1-99), Insufficient stock, Product not available
- `404`: Product not found
- `500`: Server error

### 3. Update Cart Item Quantity
Update the quantity of a specific item in the cart.

**PUT** `/api/cart/:productId`

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
  "message": "Cart item updated successfully",
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
    "addedAt": "2023-11-05T10:30:00.000Z",
    "updatedAt": "2023-11-05T10:35:00.000Z"
  },
  "cartCount": 4
}
```

**Error Responses:**
- `400`: Quantity out of range (1-99), Insufficient stock
- `404`: Cart not found, Item not found in cart, Product not found
- `500`: Server error

### 4. Remove Item from Cart
Remove a specific item from the user's cart.

**DELETE** `/api/cart/:productId`

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "cartCount": 2
}
```

**Error Responses:**
- `404`: Cart not found, Item not found in cart, Product not found
- `500`: Server error

### 5. Clear Entire Cart
Remove all items from the user's cart.

**DELETE** `/api/cart`

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "cartCount": 0
}
```

**Error Responses:**
- `404`: Cart not found
- `500`: Server error

### 6. Get Cart Item Count
Get the total number of items in the user's cart (for header badge).

**GET** `/api/cart/count`

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

**Error Responses:**
- `500`: Server error

## Data Models

### Cart Item
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
  "addedAt": "date",
  "updatedAt": "date"
}
```

### Cart Totals
```json
{
  "subtotal": "number",    // Sum of (discountedPrice * quantity) for all items
  "tax": "number",         // 10% of subtotal
  "shipping": "number",    // $10 if subtotal < $100, $0 otherwise
  "total": "number",       // subtotal + tax + shipping
  "totalItems": "number"   // Sum of all item quantities
}
```

## Features

- **User-specific**: Each cart is tied to a user's email address
- **Stock validation**: Prevents adding items beyond available stock
- **Quantity limits**: Maximum 99 items per product
- **Automatic totals**: Real-time calculation of subtotal, tax, shipping, and total
- **Discount application**: Automatically applies product discounts
- **Data integrity**: Filters out inactive or deleted products
- **Real-time updates**: Cart count updates for header badges

## Business Rules

- **Stock Checking**: Items cannot be added if stock is insufficient
- **Quantity Limits**: 1-99 items per product allowed
- **Tax Rate**: 10% on subtotal
- **Free Shipping**: Orders over $100 get free shipping ($10 otherwise)
- **Product Validation**: Only active products can be added to cart
- **Duplicate Handling**: Adding existing product increases quantity instead of creating duplicate

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

Cart endpoints are subject to the same rate limiting as other API endpoints (100 requests per 15 minutes per IP).

## Testing with Postman

### Authentication Setup
1. Login via `/auth/login` or `/auth/google` to get JWT token
2. Set Authorization header: `Bearer <token>`

### Sample Requests
- Get cart: `GET /api/cart`
- Add item: `POST /api/cart` with body `{"productId": "2", "quantity": 1}`
- Update quantity: `PUT /api/cart/2` with body `{"quantity": 3}`
- Remove item: `DELETE /api/cart/2`
- Clear cart: `DELETE /api/cart`
- Get count: `GET /api/cart/count`

**Note:** Use frontend product IDs (numbers like "2", "44", "45") in all requests, not MongoDB ObjectIds.

## Frontend Integration

```javascript
// Add to cart
const addToCart = async (productId, quantity = 1) => {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity })
  });
  const result = await response.json();
  if (result.success) {
    updateCartBadge(result.cartCount); // Update header badge
  }
  return result;
};

// Get cart count for header badge
const getCartCount = async () => {
  const response = await fetch('/api/cart/count', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  return result.success ? result.count : 0;
};
