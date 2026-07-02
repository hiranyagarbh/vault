# Todo List API

Build a secure, RESTful API to manage user to-do lists, complete with token-based authentication, database persistence, and proper input/access validation.

---

## Overview

In this project, you will build a backend API that allows users to register, log in, and manage their personal to-do lists. Unlike simpler CRUD APIs, this project emphasizes **user authentication and authorization**, ensuring users can only interact with tasks they created.

![Architecture Diagram](todolist-er.png)

### Key Objectives & Skills
- **User Authentication:** Hash passwords using `bcrypt` and issue secure JSON Web Tokens (JWT) or session keys.
- **Relational Schema Design:** Implement a database schema establishing a one-to-many relationship between users and tasks.
- **RESTful Route Design:** Design clean endpoints with logical HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- **Authorization & Security:** Restrict task access, modification, and deletion to authorized owners.
- **Centralized Error Handling:** Return clean, predictable error payloads with correct HTTP status codes.
- **Pagination:** Efficiently fetch subset data using query parameters.

---

## Database Design

You are free to use any SQL (e.g., PostgreSQL, SQLite, MySQL) or NoSQL (e.g., MongoDB) database. Below is a suggested relational schema.

### Schema Blueprint (SQL Example)

```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL, -- Hashed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE todos (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
```

---

## API Specifications

All request and response bodies must be formatted as **JSON**. If an endpoint is protected, it requires the token to be passed in the `Authorization` header.

### 1. Authentication Endpoints

#### `POST /register` — Register a New User
Validates incoming registration data, ensures the email address is unique, hashes the password, and stores the user details.

- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@doe.com",
    "password": "password123"
  }
  ```
- **Success Response (`201 Created` or `200 OK`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

#### `POST /login` — User Login
Validates credentials against stored records. If authentication succeeds, returns a new token.

- **Request Body:**
  ```json
  {
    "email": "john@doe.com",
    "password": "password123"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 2. To-Do Management Endpoints (Authenticated)

> [!IMPORTANT]
> The following endpoints require the token to be sent in the `Authorization` header:
> `Authorization: Bearer <token>`
> If the token is missing, invalid, or expired, return `401 Unauthorized` with:
> ```json
> {
>   "message": "Unauthorized"
> }
> ```

#### `POST /todos` — Create a To-Do Item
Creates a new task associated with the logged-in user.

- **Request Body:**
  ```json
  {
    "title": "Buy groceries",
    "description": "Buy milk, eggs, and bread"
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Buy milk, eggs, and bread"
  }
  ```

---

#### `GET /todos` — Retrieve To-Do List
Retrieves a paginated list of tasks created by the logged-in user.

- **Query Parameters:**
  | Parameter | Type | Required | Description | Default |
  | :--- | :--- | :--- | :--- | :--- |
  | `page` | integer | No | Page number to retrieve | `1` |
  | `limit` | integer | No | Number of records per page | `10` |

- **Success Response (`200 OK`):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "title": "Buy groceries",
        "description": "Buy milk, eggs, and bread"
      },
      {
        "id": 2,
        "title": "Pay utility bills",
        "description": "Pay electricity and water bills before Friday"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 2
  }
  ```

---

#### `PUT /todos/:id` — Update a To-Do Item
Updates an existing task. The API must verify that the requesting user is the creator of the item.

- **Request Body:**
  ```json
  {
    "title": "Buy groceries",
    "description": "Buy milk, eggs, bread, and cheese"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Buy milk, eggs, bread, and cheese"
  }
  ```
- **Error Responses:**
  - `403 Forbidden` (if the item belongs to another user):
    ```json
    {
      "message": "Forbidden"
    }
    ```
  - `404 Not Found` (if the item does not exist in the database)

---

#### `DELETE /todos/:id` — Delete a To-Do Item
Deletes a task. The API must verify that the requesting user is the creator of the item.

- **Success Response (`204 No Content`)**
- **Error Responses:**
  - `403 Forbidden` (if the item belongs to another user)
  - `404 Not Found` (if the item does not exist in the database)

---

## Environment Variables

Create a `.env` file in the root of your project:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
JWT_SECRET=your_super_secure_jwt_secret_key_here
```

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | The port the application server will listen on | `3000` |
| `DATABASE_URL` | Connection string for your database | `postgresql://...` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | `my_jwt_secret` |

---

## Suggested Project Structure

```text
todo_list_api/
├── src/
│   ├── config/
│   │   └── database.js      # DB connection pool setup
│   ├── controllers/
│   │   ├── authController.js# Registration and login logic
│   │   └── todoController.js# CRUD handler logic
│   ├── middleware/
│   │   ├── auth.js          # Authentication & Authorization verification
│   │   └── errorHandler.js  # Global error handling
│   ├── models/
│   │   ├── user.js          # Database queries/methods for Users
│   │   └── todo.js          # Database queries/methods for Todos
│   ├── routes/
│   │   ├── authRoutes.js    # Auth routing definitions
│   │   └── todoRoutes.js    # Todo routing definitions
│   ├── utils/
│   │   └── validation.js    # Request body schemas & validations
│   └── app.js               # Express application initialization
├── tests/
│   ├── auth.test.js         # Integration tests for auth flow
│   └── todo.test.js         # Integration tests for todos CRUD
├── .env.example
├── package.json
└── README.md
```

---

## Bonus Challenges

For an extra challenge and deeper learning, consider implementing:
1. **Refresh Token Mechanism:** Implement short-lived access tokens and long-lived refresh tokens stored securely in HTTP-only cookies.
2. **Rate Limiting & Throttling:** Prevent brute force attacks on `/login` and API abuse using rate limiters.
3. **Unit & Integration Tests:** Write comprehensive test suites mocking database actions to verify route logic.

---

*Last reviewed: 2 July 2026*