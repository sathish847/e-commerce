# Google OAuth & Authentication API Documentation

## Overview
This document provides Postman collection examples for testing the authentication endpoints including Google OAuth, normal registration, and login functionality.

## Base URL
```
http://localhost:5000
```

## Authentication Endpoints

### 1. Normal User Registration
**Endpoint:** `POST /auth/register`

**Description:** Register a new user with email and password.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "createdAt": "2025-11-05T08:30:00.000Z"
  },
  "token": "jwt_token_here"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 2. Normal User Login
**Endpoint:** `POST /auth/login`

**Description:** Login with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "createdAt": "2025-11-05T08:30:00.000Z"
  },
  "token": "jwt_token_here"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 3. Google OAuth Authentication

**Important Note:** Google OAuth typically requires browser interaction. However, you can test the flow using Postman's built-in browser or by manually handling the OAuth flow.

#### Method 1: Using Postman's Web Browser (Recommended)

1. **Start Google OAuth Flow**
   - **Method:** GET
   - **URL:** `http://localhost:5000/auth/google`
   - **Description:** This will redirect you to Google's OAuth consent screen

2. **Handle Google OAuth Callback**
   - After user consents on Google, they'll be redirected to:
   - **URL:** `http://localhost:5000/auth/google/callback`
   - **Response:** JSON with user data and JWT token

#### Method 2: Manual OAuth Flow Testing

Since Google OAuth requires browser interaction, you can:

1. **Open in Browser:**
   ```
   GET http://localhost:5000/auth/google
   ```

2. **Complete OAuth Flow:**
   - Browser redirects to Google
   - User grants permission
   - Google redirects back to `/auth/google/callback`

3. **Capture the Response:**
   - The callback endpoint returns JSON:
   ```json
   {
     "success": true,
     "message": "Google authentication successful",
     "data": {
       "_id": "user_id_here",
       "name": "John Doe",
       "email": "john.doe@gmail.com",
       "role": "user",
       "createdAt": "2025-11-05T08:30:00.000Z"
     },
     "token": "jwt_token_here"
   }
   ```

### 4. Get User Profile (Protected)
**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "role": "user",
    "createdAt": "2025-11-05T08:30:00.000Z"
  }
}
```

### 5. Update Password (Protected)
**Endpoint:** `PUT /auth/update-password`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 6. Generate Password Reset Token
**Endpoint:** `POST /auth/generate-password-reset-token`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset token generated successfully",
  "data": {
    "email": "john.doe@example.com",
    "resetToken": "jwt_reset_token_here",
    "expiresIn": "15 minutes"
  }
}
```

### 7. Reset Password with Token
**Endpoint:** `POST /auth/reset-password-with-token`

**Headers:**
```
Authorization: Bearer <reset_token_from_step_6>
```

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 8. Create Admin User
**Endpoint:** `POST /auth/create-admin`

**Note:** This should be protected in production. Currently available for initial setup.

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "adminpassword123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "_id": "admin_id_here",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2025-11-05T08:30:00.000Z"
  }
}
```

## Postman Collection Setup

### 1. Create Environment Variables
Create a new environment in Postman with these variables:
- `base_url`: `http://localhost:5000`
- `jwt_token`: (will be set after login)
- `reset_token`: (will be set after generating reset token)

### 2. Authentication Flow Examples

#### Normal Registration & Login Flow:
1. **Register User** → POST `{{base_url}}/auth/register`
2. **Login User** → POST `{{base_url}}/auth/login`
   - Set `jwt_token` environment variable from response
3. **Get Profile** → GET `{{base_url}}/auth/profile`
   - Header: `Authorization: Bearer {{jwt_token}}`

#### Google OAuth Flow:
1. **Start OAuth** → Open `{{base_url}}/auth/google` in browser
2. **Complete Flow** → Browser handles redirect and returns token
3. **Use Token** → Set `jwt_token` and use protected endpoints

#### Password Reset Flow:
1. **Generate Reset Token** → POST `{{base_url}}/auth/generate-password-reset-token`
   - Set `reset_token` environment variable from response
2. **Reset Password** → POST `{{base_url}}/auth/reset-password-with-token`
   - Header: `Authorization: Bearer {{reset_token}}`

## Error Responses

### Common Error Codes:
- **400 Bad Request:** Invalid input data
- **401 Unauthorized:** Invalid credentials or missing token
- **404 Not Found:** User not found
- **500 Internal Server Error:** Server error

### Error Response Format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Testing Tips

1. **Use Postman Environment Variables** to store and reuse JWT tokens
2. **Test Google OAuth** by opening the URL in a browser tab
3. **Check Network Tab** in browser dev tools to see OAuth redirect flow
4. **Use JWT.io** to decode and verify JWT tokens
5. **Test Rate Limiting** - API has rate limiting enabled

## Security Notes

- JWT tokens expire after 2 days (configurable in .env)
- Passwords are hashed using bcrypt
- Google OAuth users are created with `role: 'user'` only
- Admin creation should be restricted in production
- CORS is configured to allow all origins in development

## Sample Postman Collection JSON

```json
{
  "info": {
    "name": "E-commerce Auth API",
    "description": "Authentication endpoints for e-commerce platform"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000"
    }
  ],
  "item": [
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/auth/register",
          "host": ["{{base_url}}"],
          "path": ["auth", "register"]
        }
      }
    },
    {
      "name": "Login User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/auth/login",
          "host": ["{{base_url}}"],
          "path": ["auth", "login"]
        }
      }
    },
    {
      "name": "Google OAuth Start",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/auth/google",
          "host": ["{{base_url}}"],
          "path": ["auth", "google"]
        }
      }
    }
  ]
}
```

## Quick Start

1. Import the collection JSON above into Postman
2. Set up environment with `base_url = http://localhost:5000`
3. Start with user registration and login
4. For Google OAuth, use the browser method described above
5. Use JWT tokens from login responses for protected endpoints
