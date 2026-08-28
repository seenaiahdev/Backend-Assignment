# Student Project Management API

A backend REST API where users can register, log in, and manage their own
projects. Built with **Node.js, Express, MongoDB, and JWT authentication**,
following the **MVC architecture**.

Request flow:

```
Client → API → Express Server → Middleware → Controller → Mongoose → MongoDB
```

---

## Features

- User registration with hashed passwords (bcrypt)
- Secure login with JWT authentication
- Protected project routes (JWT required)
- Full CRUD for projects
- Users can only access, update, and delete **their own** projects
- Centralized error handling with meaningful JSON responses and proper HTTP status codes
- Optional lightweight web UI (plain HTML + CSS + vanilla JS — no framework) served by Express

> **Note:** The assignment is a backend REST API and does not require a frontend.
> A simple **vanilla JavaScript** UI (no React/Vue/Angular) is included as a bonus for
> demoing the API in a browser. The API can still be tested with Postman independently.

---

## Tech Stack

| Technology      | Purpose               |
| --------------- | --------------------- |
| Node.js         | Runtime               |
| Express.js      | Web framework         |
| MongoDB Atlas   | Database              |
| Mongoose        | ODM                   |
| bcryptjs        | Password hashing      |
| jsonwebtoken    | Authentication (JWT)  |
| dotenv          | Environment variables |

---

## Project Structure

```
backend_assessment/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Register / Login logic
│   └── projectController.js  # Project CRUD logic
├── middleware/
│   ├── authMiddleware.js     # JWT verification (protect)
│   └── errorMiddleware.js    # 404 + central error handler
├── models/
│   ├── User.js               # User schema (+ password hashing)
│   └── Project.js            # Project schema
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   └── projectRoutes.js      # /api/projects routes (protected)
├── utils/
│   ├── asyncHandler.js       # Async error wrapper
│   └── generateToken.js      # JWT generator
├── public/                   # Optional vanilla-JS frontend (bonus)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── postman/
│   └── StudentProjectManagement.postman_collection.json
├── app.js                    # Express app configuration
├── server.js                 # Entry point (starts server)
├── package.json
├── .env.example              # Sample environment variables
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Then edit `.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

> ⚠️ The `.env` file is git-ignored and must **never** be pushed to GitHub.

### 4. Run the server

```bash
# development (auto-restart on changes)
npm run dev

# production
npm start
```

You should see:

```
✅ MongoDB connected: <host>
🚀 Server running on http://localhost:5000
```

### 5. (Optional) Open the web UI

Once the server is running, open **http://localhost:5000** in your browser to use
the bonus frontend — register, log in, and manage projects visually. The API health
check lives at **http://localhost:5000/health**.

---

## API Documentation

Base URL: `http://localhost:5000`

### Authentication

#### Register

`POST /api/auth/register`

Request body:

```json
{
  "name": "Ravi",
  "email": "ravi@example.com",
  "password": "password123"
}
```

Response `201 Created`:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64abc123...",
    "name": "Ravi",
    "email": "ravi@example.com",
    "createdAt": "2026-08-28T10:00:00.000Z"
  },
  "token": "JWT_TOKEN"
}
```

#### Login

`POST /api/auth/login`

Request body:

```json
{
  "email": "ravi@example.com",
  "password": "password123"
}
```

Response `200 OK`:

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN"
}
```

---

### Projects (Protected)

All project routes require a valid JWT in the header:

```
Authorization: Bearer JWT_TOKEN
```

#### Create Project

`POST /api/projects`

```json
{
  "title": "E-Commerce Backend",
  "description": "REST API for an e-commerce application",
  "technologies": ["Node.js", "Express", "MongoDB"],
  "githubUrl": "https://github.com/example/ecommerce",
  "deployedUrl": "https://example.com",
  "status": "In Progress"
}
```

Response `201 Created` — returns the created project.

#### Get All Projects

`GET /api/projects`

Returns all projects owned by the authenticated user.

#### Get Single Project

`GET /api/projects/:id`

Returns the project if it belongs to the authenticated user.

#### Update Project

`PUT /api/projects/:id`

```json
{
  "title": "Updated E-Commerce Backend",
  "status": "Completed"
}
```

Only the provided fields are updated.

#### Delete Project

`DELETE /api/projects/:id`

Deletes the project. A user cannot delete another user's project.

---

### Status Values

A project's `status` must be one of:

- `Planning`
- `In Progress`
- `Completed`

---

## Error Handling & Status Codes

| Status | Meaning       | Example                          |
| ------ | ------------- | -------------------------------- |
| 200    | OK            | Successful GET / update / delete |
| 201    | Created       | Successful registration / create |
| 400    | Bad Request   | Invalid input, invalid ID, duplicate email |
| 401    | Unauthorized  | Invalid or missing token, bad login |
| 403    | Forbidden     | Accessing another user's project |
| 404    | Not Found     | Project or route doesn't exist   |
| 500    | Server Error  | Unexpected error                 |

All errors return a JSON body, e.g.:

```json
{ "message": "Project not found" }
```

---

## Testing with Postman

1. Import `postman/StudentProjectManagement.postman_collection.json` into Postman.
2. Run **Register** or **Login** — the JWT is saved automatically to the `{{token}}` variable.
3. Run the **Projects** requests — `{{token}}` and `{{projectId}}` are filled in for you.

---

## Security Notes

- Passwords are hashed with bcrypt and never stored or returned in plain text.
- The `password` field is excluded from queries by default (`select: false`).
- JWTs are signed with a secret stored in environment variables.
- Sensitive configuration lives in `.env`, which is git-ignored.
