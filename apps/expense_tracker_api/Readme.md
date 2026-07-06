# Expense Tracker API

Build a secure, RESTful API to manage personal expenses, complete with token-based authentication, category-based filtering, and detailed spending summaries.

---

## Overview

In this project, you will build a backend API that allows users to register, log in, and track their personal expenses. Beyond basic CRUD, this project emphasizes **user authentication and authorization**, **expense categorization**, and **date-range filtering**, ensuring users can only interact with expenses they created while gaining insights into their spending habits.

![Architecture Diagram](expense-tracker-api.png)

### Key Objectives & Skills
- **User Authentication:** Hash passwords using `bcrypt` and issue secure JSON Web Tokens (JWT) or session keys.
- **Relational Schema Design:** Implement a database schema establishing a one-to-many relationship between users and expenses, with support for categories.
- **RESTful Route Design:** Design clean endpoints with logical HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- **Authorization & Security:** Restrict expense access, modification, and deletion to authorized owners.
- **Filtering & Aggregation:** Support filtering expenses by date range and category, and compute spending summaries.
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

CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL  -- e.g., 'Groceries', 'Rent', 'Entertainment'
);

CREATE TABLE expenses (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  amount      DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(date);
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
- **Success Response (`201 Created`):**
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

### 2. Expense Management Endpoints (Authenticated)

> [!IMPORTANT]
> The following endpoints require the token to be sent in the `Authorization` header:
> `Authorization: Bearer <token>`
> If the token is missing, invalid, or expired, return `401 Unauthorized` with:
> ```json
> {
>   "message": "Unauthorized"
> }
> ```

#### `POST /expenses` — Create an Expense
Creates a new expense associated with the logged-in user.

- **Request Body:**
  ```json
  {
    "amount": 45.50,
    "category": "Groceries",
    "description": "Weekly grocery shopping at the supermarket",
    "date": "2026-07-05"
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "id": 1,
    "amount": 45.50,
    "category": "Groceries",
    "description": "Weekly grocery shopping at the supermarket",
    "date": "2026-07-05"
  }
  ```

---

#### `GET /expenses` — Retrieve Expenses
Retrieves a paginated and optionally filtered list of expenses created by the logged-in user.

- **Query Parameters:**
  | Parameter | Type | Required | Description | Default |
  | :--- | :--- | :--- | :--- | :--- |
  | `page` | integer | No | Page number to retrieve | `1` |
  | `limit` | integer | No | Number of records per page | `10` |
  | `category` | string | No | Filter by category name | — |
  | `start_date` | date | No | Filter expenses on or after this date (ISO 8601) | — |
  | `end_date` | date | No | Filter expenses on or before this date (ISO 8601) | — |

- **Example Request:**
  ```
  GET /expenses?page=1&limit=10&category=Groceries&start_date=2026-07-01&end_date=2026-07-31
  ```

- **Success Response (`200 OK`):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "amount": 45.50,
        "category": "Groceries",
        "description": "Weekly grocery shopping at the supermarket",
        "date": "2026-07-05"
      },
      {
        "id": 3,
        "amount": 22.00,
        "category": "Groceries",
        "description": "Fruits and vegetables",
        "date": "2026-07-12"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 2
  }
  ```

---

#### `GET /expenses/:id` — Retrieve a Single Expense
Retrieves a specific expense by its ID. The API must verify the requesting user is the owner.

- **Success Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "amount": 45.50,
    "category": "Groceries",
    "description": "Weekly grocery shopping at the supermarket",
    "date": "2026-07-05"
  }
  ```
- **Error Responses:**
  - `403 Forbidden` (if the expense belongs to another user):
    ```json
    {
      "message": "Forbidden"
    }
    ```
  - `404 Not Found` (if the expense does not exist in the database)

---

#### `PUT /expenses/:id` — Update an Expense
Updates an existing expense. The API must verify that the requesting user is the creator of the expense.

- **Request Body:**
  ```json
  {
    "amount": 50.00,
    "category": "Groceries",
    "description": "Weekly grocery shopping — added snacks",
    "date": "2026-07-05"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "amount": 50.00,
    "category": "Groceries",
    "description": "Weekly grocery shopping — added snacks",
    "date": "2026-07-05"
  }
  ```
- **Error Responses:**
  - `403 Forbidden` (if the expense belongs to another user):
    ```json
    {
      "message": "Forbidden"
    }
    ```
  - `404 Not Found` (if the expense does not exist in the database)

---

#### `DELETE /expenses/:id` — Delete an Expense
Deletes an expense. The API must verify that the requesting user is the creator of the expense.

- **Success Response (`204 No Content`)**
- **Error Responses:**
  - `403 Forbidden` (if the expense belongs to another user)
  - `404 Not Found` (if the expense does not exist in the database)

---

### 3. Category Endpoints (Authenticated)

#### `GET /categories` — List All Categories
Returns all available expense categories.

- **Success Response (`200 OK`):**
  ```json
  [
    { "id": 1, "name": "Groceries" },
    { "id": 2, "name": "Rent" },
    { "id": 3, "name": "Entertainment" },
    { "id": 4, "name": "Transportation" },
    { "id": 5, "name": "Utilities" }
  ]
  ```

---

## Environment Variables

Create a `.env` file in the root of your project:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/expense_db
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
expense_tracker_api/
├── src/
│   ├── config/
│   │   └── database.js         # DB connection pool setup
│   ├── controllers/
│   │   ├── authController.js   # Registration and login logic
│   │   ├── expenseController.js# CRUD handler logic for expenses
│   │   └── categoryController.js# Category listing logic
│   ├── middleware/
│   │   ├── auth.js             # Authentication & Authorization verification
│   │   └── errorHandler.js     # Global error handling
│   ├── models/
│   │   ├── user.js             # Database queries/methods for Users
│   │   ├── expense.js          # Database queries/methods for Expenses
│   │   └── category.js         # Database queries/methods for Categories
│   ├── routes/
│   │   ├── authRoutes.js       # Auth routing definitions
│   │   ├── expenseRoutes.js    # Expense routing definitions
│   │   └── categoryRoutes.js   # Category routing definitions
│   ├── utils/
│   │   └── validation.js       # Request body schemas & validations
│   └── app.js                  # Express application initialization
├── tests/
│   ├── auth.test.js            # Integration tests for auth flow
│   ├── expense.test.js         # Integration tests for expenses CRUD
│   └── category.test.js        # Integration tests for categories
├── .env.example
├── package.json
└── README.md
```

---

## Bonus Challenges

For an extra challenge and deeper learning, consider implementing:
1. **Spending Summary Endpoint:** Build a `GET /expenses/summary` endpoint that returns total and average spending grouped by category, with support for date-range filtering.
2. **Refresh Token Mechanism:** Implement short-lived access tokens and long-lived refresh tokens stored securely in HTTP-only cookies.
3. **Rate Limiting & Throttling:** Prevent brute force attacks on `/login` and API abuse using rate limiters.
4. **CSV/PDF Export:** Allow users to download their expense data as a CSV or PDF report for a given time period.
5. **Unit & Integration Tests:** Write comprehensive test suites mocking database actions to verify route logic.

---

*Last reviewed: 6 July 2026*
