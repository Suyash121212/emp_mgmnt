# Employee & Task Management System

A production-grade, full-stack MERN application for managing organizational employees, delegating tasks with strict capacity control, and tracking operational workload in real time. Built as a technical assignment for **Roots Media Marketing**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Data Models & Schema](#data-models--schema)
  - [Employee Schema](#employee-schema)
  - [Task Schema](#task-schema)
  - [Model Relationships & Snapshots](#model-relationships--snapshots)
- [API Overview & Documentation](#api-overview--documentation)
  - [Dashboard](#dashboard)
  - [Employees Endpoints](#employees-endpoints)
  - [Tasks Endpoints](#tasks-endpoints)
- [Business Rules Enforced on Backend](#business-rules-enforced-on-backend)
- [How Employee Deletion is Handled](#how-employee-deletion-is-handled)
- [System Assumptions](#system-assumptions)
- [Core Engineering Questions & Answers](#core-engineering-questions--answers)
  - [1. Status Transition Validation](#1-where-do-you-validate-status-transitions-and-why)
  - [2. Completed Date Sourcing](#2-why-does-completed-date-come-from-the-backend)
  - [3. Inactive & On-Leave Assignment Safeguards](#3-how-do-you-block-inactive--on-leave-assignment)
  - [4. Backend Pagination and Filtering](#4-why-are-filtering-and-pagination-done-on-the-backend)
  - [5. URL-Persisted Filter State](#5-why-do-filters-live-in-the-url)
  - [6. Race Condition Prevention for Task Capacity](#6-what-can-go-wrong-if-two-requests-assign-a-4th-active-task-at-the-same-time)
- [Deployment Guidance](#deployment-guidance)
  - [Frontend (Vercel / Netlify)](#frontend-deployment-vercel--netlify)
  - [Backend (Render)](#backend-deployment-render)
  - [Database (MongoDB Atlas)](#database-setup-mongodb-atlas)
- [Project Structure](#project-structure)
- [License](#license)

---

## Overview

The **Employee & Task Management System** solves workforce delegation challenges by maintaining strict operational boundaries:
1. Preventing employee burnout by enforcing a hard capacity limit of **max 3 active tasks** per employee with atomic, race-condition-safe transactions.
2. Protecting historical business metrics by capturing an immutable snapshot of employee details when tasks are created, ensuring audit logs and completion histories remain coherent even after employee offboarding.
3. Guaranteeing deterministic workflow states via an explicit finite state machine for task lifecycles on the backend.
4. Providing real-time dashboard analytics, CSV report generation, and deep-linkable filtered views.

---

## Tech Stack

### Frontend
- **Framework / Runtime:** [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Notifications:** [react-hot-toast](https://react-hot-toast.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend
- **Platform:** [Node.js](https://nodejs.org/) (v18+)
- **Web Framework:** [Express.js 4](https://expressjs.com/)
- **Object Data Modeling (ODM):** [Mongoose 8](https://mongoosejs.com/)
- **Schema & Payload Validation:** [Joi](https://joi.dev/)
- **Data Export:** [json2csv](https://www.npmjs.com/package/json2csv)
- **Middleware:** CORS, Morgan (logging), Express JSON parser

### Database
- **Primary Datastore:** [MongoDB](https://www.mongodb.com/) (Local 6+ or MongoDB Atlas)

---

## Key Features

- **Full CRUD for Employees & Tasks:** Create, view, update, and manage employees and tasks with exhaustive server-side validation.
- **Real-Time Operational Dashboard:**
  - High-level KPI cards: Total Employees, Active Employees, On Leave, Total Tasks, Overdue Tasks.
  - Interactive workload meter visualizing individual employee task utilization (0/3 to 3/3 capacity).
  - Status and Priority distributions.
- **Server-Side Pagination, Filtering, Sorting & Search:**
  - Full text search across task titles, descriptions, employee names, and IDs.
  - Multi-attribute filtering (department, status, priority, overdue status, date windows).
  - Dynamic sorting by creation date, due date, priority, or name.
- **URL-Persisted Filter State:**
  - Search terms, filter selections, sort criteria, and pagination indices are synced to URL query parameters via `useSearchParams`.
  - Enables instant bookmarking, sharing exact views between team members, and seamless browser history navigation (Back/Forward).
- **Filtered CSV Export:**
  - One-click CSV export that respects all applied filter criteria while intelligently bypassing pagination to export the entire matching dataset.
- **Hard Business Rule Enforcement on Backend:**
  - Max 3 active tasks (`Todo` or `In Progress`) per employee.
  - Atomic conditional updates eliminating concurrency race conditions.
  - Inactive employees cannot receive tasks.
  - On-leave employees cannot be assigned tasks starting during their leave period.
  - `dueDate` must always be equal to or later than `startDate`.
  - Strict status progression: `Todo` &rarr; `In Progress` &rarr; `Completed` or `Cancelled`.
  - Terminal statuses (`Completed`, `Cancelled`) cannot be reopened or mutated.
  - Automated server-side stamping of `completedDate`.
  - Blocked deletion for employees with active tasks.
- **Employee Snapshotting:**
  - Preserves `{ employeeId, fullName, email }` on each task document to retain historical context if an employee record is ever pruned.
- **Responsive & Accessible UI:**
  - Designed mobile-first with Tailwind CSS, clean modals, toast feedback, and loading skeletons.

---

## Architecture & Design Decisions

```
+-------------------------------------------------------------+
|                 Browser (React 18 + Vite)                   |
|  - URL-Persisted State (?search=...&page=2&status=Todo)     |
|  - Axios Interceptors & React-Hot-Toast Feedback            |
|  - Workload Visualizer & CSV Download Handler               |
+------------------------------+------------------------------+
                               |
                        HTTP / REST API
                               |
+------------------------------v------------------------------+
|                   Backend (Express + Node)                  |
|  - Joi Validation Middleware (Input Sanitization)           |
|  - Route Dispatchers & Controller Handlers                  |
|  - Service Layer (Business Logic & FSM Enforcement)         |
|  - Centralized Async Error Middleware                       |
+------------------------------+------------------------------+
                               |
                        Mongoose ODM
                               |
+------------------------------v------------------------------+
|                     MongoDB Datastore                       |
|  - Employee Collection (with atomic activeTaskCount)        |
|  - Task Collection (with embedded employeeSnapshot)         |
|  - Compound Indexes for fast filter & sort operations       |
+-------------------------------------------------------------+
```

---

## Prerequisites

Before setting up the project locally, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or Yarn / pnpm)
- **MongoDB**: MongoDB 6.0+ running locally on `localhost:27017` OR an active [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string
- **Git**

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/employee-task-mgmt.git
cd employee-task-mgmt
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create environment configuration file from template
cp .env.example .env

# Install backend dependencies
npm install

# Start backend server in development mode (with nodemon)
npm run dev
```

The backend server will start on `http://localhost:5000` and automatically connect to MongoDB.

### 3. Frontend Setup

Open a new terminal window in the project root:

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend application will boot on `http://localhost:5173`. Open your browser and navigate to that address.

---

## Environment Variables

### Root & Backend Configuration (`backend/.env`)

| Variable | Description | Default Value | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | Port number on which the Express server listens | `5000` | No |
| `MONGODB_URI` | MongoDB connection URI (local instance or MongoDB Atlas connection string) | `mongodb://localhost:27017/employee_task_mgmt` | **Yes** |
| `CORS_ORIGIN` | Allowed client origin(s) for Cross-Origin Resource Sharing | `http://localhost:5173` | **Yes** |

### Frontend Configuration (`frontend/.env` - Optional)

| Variable | Description | Default Value | Required |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL for backend REST API endpoints | `http://localhost:5000/api` | No (falls back to local proxy) |

---

## Data Models & Schema

### Employee Schema

The `Employee` document represents organizational staff members and maintains an atomic counter for active task tracking.

```javascript
{
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
    // e.g. "EMP-1001"
  },
  fullName: {
    type: String,
    required: true,
    trim: true
    // e.g. "Jane Doe"
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
    // e.g. "jane.doe@example.com"
  },
  department: {
    type: String,
    required: true,
    enum: ["Engineering", "Design", "Marketing", "HR", "Sales", "Finance", "Product", "Operations"]
  },
  designation: {
    type: String,
    required: true,
    trim: true
    // e.g. "Lead Frontend Architect"
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Inactive", "On Leave"],
    default: "Active"
  },
  leaveStart: {
    type: Date,
    default: null
    // Required when status is "On Leave"
  },
  leaveEnd: {
    type: Date,
    default: null
    // Required when status is "On Leave", must be >= leaveStart
  },
  skills: [
    {
      type: String,
      trim: true
    }
  ],
  activeTaskCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
    // Maintained atomically via findOneAndUpdate conditional queries
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Task Schema

The `Task` document tracks operational units of work, referencing the assigned employee while maintaining an embedded snapshot for historical persistence.

```javascript
{
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
    // e.g. "Optimize MongoDB aggregation pipelines"
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  employeeSnapshot: {
    employeeId: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true }
  },
  priority: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium"
  },
  status: {
    type: String,
    required: true,
    enum: ["Todo", "In Progress", "Completed", "Cancelled"],
    default: "Todo"
  },
  startDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
    // Validated: dueDate >= startDate
  },
  completedDate: {
    type: Date,
    default: null
    // Populated strictly by backend when transitioning to "Completed"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Model Relationships & Snapshots

```
+--------------------+               1:N Ref               +--------------------+
|      Employee      | <---------------------------------- |        Task        |
|--------------------|                                     |--------------------|
| _id                |                                     | _id                |
| employeeId         |                                     | title              |
| fullName           |                                     | assignedEmployee   |
| email              |                                     | employeeSnapshot   |
| activeTaskCount    |                                     | status             |
+--------------------+                                     | completedDate      |
                                                           +--------------------+
```

- **Referential Link (`assignedEmployee`):** References `Employee._id`. Used for live joins, active employee views, and capacity synchronization.
- **Embedded Snapshot (`employeeSnapshot`):** Copied at task creation time. Contains `{ employeeId, fullName, email }`. If an employee is deleted (after finishing all tasks), the task's `employeeSnapshot` ensures historical reports and completion analytics remain completely accurate.

---

## API Overview & Documentation

Base URL: `http://localhost:5000/api`

Standard API response format:
- Success: `{ "success": true, "data": { ... } }` or `{ "success": true, "data": [ ... ], "pagination": { ... } }`
- Error: `{ "success": false, "message": "Detailed error description" }`

---

### Dashboard

#### `GET /api/dashboard`
Returns aggregated analytics including employee counts, task distributions, overdue metrics, and individual employee workloads.

- **Query Parameters:** None
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEmployees": 12,
      "activeEmployees": 10,
      "onLeaveEmployees": 2,
      "inactiveEmployees": 0,
      "totalTasks": 28,
      "completedTasks": 14,
      "activeTasks": 12,
      "cancelledTasks": 2,
      "overdueTasks": 3
    },
    "tasksByStatus": {
      "Todo": 5,
      "In Progress": 7,
      "Completed": 14,
      "Cancelled": 2
    },
    "tasksByPriority": {
      "Low": 4,
      "Medium": 11,
      "High": 9,
      "Critical": 4
    },
    "workload": [
      {
        "_id": "651f8a9e1b2c3d4e5f6a7b8c",
        "employeeId": "EMP-1001",
        "fullName": "Jane Doe",
        "department": "Engineering",
        "status": "Active",
        "activeTaskCount": 3,
        "maxCapacity": 3,
        "capacityPercentage": 100
      },
      {
        "_id": "651f8a9e1b2c3d4e5f6a7b8d",
        "employeeId": "EMP-1002",
        "fullName": "John Smith",
        "department": "Design",
        "status": "Active",
        "activeTaskCount": 1,
        "maxCapacity": 3,
        "capacityPercentage": 33.3
      }
    ],
    "upcomingDeadlines": [
      {
        "_id": "6520bf9e1b2c3d4e5f6a7c10",
        "title": "Release v1.2.0 API gateway patch",
        "priority": "Critical",
        "dueDate": "2026-10-18T18:00:00.000Z",
        "assignedEmployee": {
          "_id": "651f8a9e1b2c3d4e5f6a7b8c",
          "fullName": "Jane Doe"
        }
      }
    ]
  }
}
```

---

### Employees Endpoints

#### `GET /api/employees`
Retrieve paginated, searchable, and filtered employees.

- **Query Parameters:**
  - `page` *(number, optional)*: Page number (default: `1`)
  - `limit` *(number, optional)*: Results per page (default: `10`)
  - `search` *(string, optional)*: Matches `fullName`, `email`, or `employeeId`
  - `department` *(string, optional)*: Filter by department (`Engineering`, `Design`, etc.)
  - `status` *(string, optional)*: Filter by status (`Active`, `Inactive`, `On Leave`)
  - `sortBy` *(string, optional)*: Sort field (`fullName`, `employeeId`, `department`, `activeTaskCount`, `createdAt`)
  - `sortOrder` *(string, optional)*: Sort direction (`asc` or `desc`, default: `asc`)

- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "651f8a9e1b2c3d4e5f6a7b8c",
      "employeeId": "EMP-1001",
      "fullName": "Jane Doe",
      "email": "jane.doe@rootsmedia.com",
      "department": "Engineering",
      "designation": "Staff Software Engineer",
      "status": "Active",
      "leaveStart": null,
      "leaveEnd": null,
      "skills": ["Node.js", "React", "MongoDB", "Docker"],
      "activeTaskCount": 2,
      "createdAt": "2026-10-10T08:30:00.000Z",
      "updatedAt": "2026-10-14T11:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### `POST /api/employees`
Create a new employee.

- **Request Body:**
```json
{
  "employeeId": "EMP-1003",
  "fullName": "Alice Johnson",
  "email": "alice.johnson@rootsmedia.com",
  "department": "Marketing",
  "designation": "Content Strategist",
  "status": "Active",
  "skills": ["SEO", "Copywriting", "Campaign Analytics"]
}
```

- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "_id": "6521a09e1b2c3d4e5f6a7c15",
    "employeeId": "EMP-1003",
    "fullName": "Alice Johnson",
    "email": "alice.johnson@rootsmedia.com",
    "department": "Marketing",
    "designation": "Content Strategist",
    "status": "Active",
    "leaveStart": null,
    "leaveEnd": null,
    "skills": ["SEO", "Copywriting", "Campaign Analytics"],
    "activeTaskCount": 0,
    "createdAt": "2026-10-15T09:00:00.000Z",
    "updatedAt": "2026-10-15T09:00:00.000Z"
  }
}
```

- **Error Response `400 Bad Request`:**
```json
{
  "success": false,
  "message": "Employee with employeeId 'EMP-1003' or email 'alice.johnson@rootsmedia.com' already exists."
}
```

#### `GET /api/employees/:id`
Fetch single employee details by ID.

- **Path Parameters:** `id` (MongoDB ObjectId)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "_id": "651f8a9e1b2c3d4e5f6a7b8c",
    "employeeId": "EMP-1001",
    "fullName": "Jane Doe",
    "email": "jane.doe@rootsmedia.com",
    "department": "Engineering",
    "designation": "Staff Software Engineer",
    "status": "Active",
    "leaveStart": null,
    "leaveEnd": null,
    "skills": ["Node.js", "React", "MongoDB", "Docker"],
    "activeTaskCount": 2,
    "createdAt": "2026-10-10T08:30:00.000Z",
    "updatedAt": "2026-10-14T11:20:00.000Z"
  }
}
```

- **Error Response `404 Not Found`:**
```json
{
  "success": false,
  "message": "Employee not found with id: 651f8a9e1b2c3d4e5f6a7b99"
}
```

#### `PUT /api/employees/:id`
Update an employee's profile, role, status, or leave dates.

- **Request Body (Updating to On Leave):**
```json
{
  "fullName": "Jane Doe",
  "department": "Engineering",
  "designation": "Staff Software Engineer",
  "status": "On Leave",
  "leaveStart": "2026-11-01T00:00:00.000Z",
  "leaveEnd": "2026-11-14T23:59:59.000Z",
  "skills": ["Node.js", "React", "MongoDB", "Docker", "Kubernetes"]
}
```

- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "_id": "651f8a9e1b2c3d4e5f6a7b8c",
    "employeeId": "EMP-1001",
    "fullName": "Jane Doe",
    "email": "jane.doe@rootsmedia.com",
    "department": "Engineering",
    "designation": "Staff Software Engineer",
    "status": "On Leave",
    "leaveStart": "2026-11-01T00:00:00.000Z",
    "leaveEnd": "2026-11-14T23:59:59.000Z",
    "skills": ["Node.js", "React", "MongoDB", "Docker", "Kubernetes"],
    "activeTaskCount": 2,
    "updatedAt": "2026-10-15T09:15:00.000Z"
  }
}
```

- **Error Response `400 Bad Request`:**
```json
{
  "success": false,
  "message": "leaveEnd date must be greater than or equal to leaveStart date."
}
```

#### `DELETE /api/employees/:id`
Delete an employee if and only if they have zero active tasks (`Todo` or `In Progress`).

- **Path Parameters:** `id` (MongoDB ObjectId)
- **Response `200 OK` (Deletion Allowed):**
```json
{
  "success": true,
  "message": "Employee EMP-1003 deleted successfully. Historical tasks retain employee snapshot data."
}
```

- **Error Response `400 Bad Request` (Active Tasks Present):**
```json
{
  "success": false,
  "message": "Cannot delete employee: Jane Doe currently has 2 active task(s). Reassign or complete all active tasks before deleting this employee."
}
```

---

### Tasks Endpoints

#### `GET /api/tasks`
Retrieve paginated, searchable, and filtered task lists.

- **Query Parameters:**
  - `page` *(number, optional)*: Page number (default: `1`)
  - `limit` *(number, optional)*: Results per page (default: `10`)
  - `search` *(string, optional)*: Matches task `title` or `description`
  - `status` *(string, optional)*: `Todo`, `In Progress`, `Completed`, `Cancelled`
  - `priority` *(string, optional)*: `Low`, `Medium`, `High`, `Critical`
  - `assignedEmployee` *(string, optional)*: Filter by Employee ObjectId
  - `department` *(string, optional)*: Filter by assigned employee's department
  - `isOverdue` *(boolean, optional)*: `true` to filter tasks where `dueDate < now` and status not `Completed` or `Cancelled`
  - `sortBy` *(string, optional)*: `dueDate`, `startDate`, `priority`, `createdAt`
  - `sortOrder` *(string, optional)*: `asc` or `desc` (default: `asc`)

- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6520bf9e1b2c3d4e5f6a7c10",
      "title": "Migrate Database Clusters to Mongo 7.0",
      "description": "Perform rolling upgrade of replica sets and verify index rebuilds.",
      "assignedEmployee": {
        "_id": "651f8a9e1b2c3d4e5f6a7b8c",
        "employeeId": "EMP-1001",
        "fullName": "Jane Doe",
        "email": "jane.doe@rootsmedia.com",
        "department": "Engineering"
      },
      "employeeSnapshot": {
        "employeeId": "EMP-1001",
        "fullName": "Jane Doe",
        "email": "jane.doe@rootsmedia.com"
      },
      "priority": "High",
      "status": "Todo",
      "startDate": "2026-10-20T09:00:00.000Z",
      "dueDate": "2026-10-28T18:00:00.000Z",
      "completedDate": null,
      "isOverdue": false,
      "createdAt": "2026-10-15T08:00:00.000Z",
      "updatedAt": "2026-10-15T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### `GET /api/tasks/export/csv`
Download all tasks matching current filters as a CSV spreadsheet.

- **Query Parameters:** Supports all filter query parameters from `GET /api/tasks` (`status`, `priority`, `assignedEmployee`, `search`, `isOverdue`, etc.), while omitting pagination.
- **Response Headers:**
  - `Content-Type: text/csv`
  - `Content-Disposition: attachment; filename="tasks-export-2026-10-15.csv"`
- **Response Body (`200 OK`):**
```csv
"Task ID","Title","Priority","Status","Assigned Employee ID","Assigned Employee Name","Assigned Employee Email","Start Date","Due Date","Completed Date"
"6520bf9e1b2c3d4e5f6a7c10","Migrate Database Clusters to Mongo 7.0","High","Todo","EMP-1001","Jane Doe","jane.doe@rootsmedia.com","2026-10-20T09:00:00.000Z","2026-10-28T18:00:00.000Z","N/A"
```

#### `POST /api/tasks`
Create a new task. The assigned employee's task capacity is atomically validated and incremented.

- **Request Body:**
```json
{
  "title": "Build Webhook Notification Service",
  "description": "Construct resilient HTTP webhook delivery engine with exponential retry mechanism.",
  "assignedEmployee": "651f8a9e1b2c3d4e5f6a7b8c",
  "priority": "Critical",
  "startDate": "2026-10-22T09:00:00.000Z",
  "dueDate": "2026-10-29T18:00:00.000Z"
}
```

- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "_id": "6522bb9e1b2c3d4e5f6a7c30",
    "title": "Build Webhook Notification Service",
    "description": "Construct resilient HTTP webhook delivery engine with exponential retry mechanism.",
    "assignedEmployee": "651f8a9e1b2c3d4e5f6a7b8c",
    "employeeSnapshot": {
      "employeeId": "EMP-1001",
      "fullName": "Jane Doe",
      "email": "jane.doe@rootsmedia.com"
    },
    "priority": "Critical",
    "status": "Todo",
    "startDate": "2026-10-22T09:00:00.000Z",
    "dueDate": "2026-10-29T18:00:00.000Z",
    "completedDate": null,
    "createdAt": "2026-10-15T09:30:00.000Z",
    "updatedAt": "2026-10-15T09:30:00.000Z"
  }
}
```

- **Error Responses `400 Bad Request`:**
  - **Date ordering violation:**
    ```json
    {
      "success": false,
      "message": "dueDate (2026-10-20) must be greater than or equal to startDate (2026-10-22)."
    }
    ```
  - **Inactive employee:**
    ```json
    {
      "success": false,
      "message": "Cannot assign task to an Inactive employee."
    }
    ```
  - **On-leave assignment conflict:**
    ```json
    {
      "success": false,
      "message": "Cannot assign task: employee is On Leave between 2026-11-01 and 2026-11-14. Task startDate (2026-11-05) falls within the leave window."
    }
    ```
  - **Max capacity reached:**
    ```json
    {
      "success": false,
      "message": "Employee Jane Doe has reached the maximum capacity of 3 active tasks."
    }
    ```

#### `GET /api/tasks/:id`
Fetch detailed view of a specific task.

- **Path Parameters:** `id` (MongoDB ObjectId)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "_id": "6522bb9e1b2c3d4e5f6a7c30",
    "title": "Build Webhook Notification Service",
    "description": "Construct resilient HTTP webhook delivery engine with exponential retry mechanism.",
    "assignedEmployee": {
      "_id": "651f8a9e1b2c3d4e5f6a7b8c",
      "employeeId": "EMP-1001",
      "fullName": "Jane Doe",
      "email": "jane.doe@rootsmedia.com",
      "department": "Engineering"
    },
    "employeeSnapshot": {
      "employeeId": "EMP-1001",
      "fullName": "Jane Doe",
      "email": "jane.doe@rootsmedia.com"
    },
    "priority": "Critical",
    "status": "Todo",
    "startDate": "2026-10-22T09:00:00.000Z",
    "dueDate": "2026-10-29T18:00:00.000Z",
    "completedDate": null,
    "createdAt": "2026-10-15T09:30:00.000Z",
    "updatedAt": "2026-10-15T09:30:00.000Z"
  }
}
```

#### `PUT /api/tasks/:id`
Update task attributes (title, description, priority, dates, assigned employee). **Status changes are strictly forbidden through this endpoint.**

- **Request Body:**
```json
{
  "title": "Build Resilient Webhook Notification Service",
  "description": "Updated scope: add Redis dead-letter queue and Slack notification hooks.",
  "assignedEmployee": "651f8a9e1b2c3d4e5f6a7b8c",
  "priority": "Critical",
  "startDate": "2026-10-22T09:00:00.000Z",
  "dueDate": "2026-10-31T18:00:00.000Z"
}
```

- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "_id": "6522bb9e1b2c3d4e5f6a7c30",
    "title": "Build Resilient Webhook Notification Service",
    "description": "Updated scope: add Redis dead-letter queue and Slack notification hooks.",
    "assignedEmployee": "651f8a9e1b2c3d4e5f6a7b8c",
    "employeeSnapshot": {
      "employeeId": "EMP-1001",
      "fullName": "Jane Doe",
      "email": "jane.doe@rootsmedia.com"
    },
    "priority": "Critical",
    "status": "Todo",
    "startDate": "2026-10-22T09:00:00.000Z",
    "dueDate": "2026-10-31T18:00:00.000Z",
    "completedDate": null,
    "updatedAt": "2026-10-15T10:00:00.000Z"
  }
}
```

- **Error Response `400 Bad Request` (Attempting status change):**
```json
{
  "success": false,
  "message": "Task status cannot be modified via this endpoint. Please use the dedicated PUT /api/tasks/:id/status endpoint."
}
```

#### `PUT /api/tasks/:id/status`
Dedicated state transition endpoint enforcing finite state machine transitions and server-side completion timestamping.

- **Request Body:**
```json
{
  "status": "In Progress"
}
```

- **Response `200 OK` (Transition from Todo to In Progress):**
```json
{
  "success": true,
  "data": {
    "_id": "6522bb9e1b2c3d4e5f6a7c30",
    "title": "Build Resilient Webhook Notification Service",
    "status": "In Progress",
    "completedDate": null,
    "updatedAt": "2026-10-15T10:15:00.000Z"
  }
}
```

- **Request Body (Transitioning to Completed):**
```json
{
  "status": "Completed"
}
```

- **Response `200 OK` (Completed Date stamped, capacity released):**
```json
{
  "success": true,
  "data": {
    "_id": "6522bb9e1b2c3d4e5f6a7c30",
    "title": "Build Resilient Webhook Notification Service",
    "status": "Completed",
    "completedDate": "2026-10-15T10:20:00.000Z",
    "updatedAt": "2026-10-15T10:20:00.000Z"
  }
}
```

- **Error Response `400 Bad Request` (Illegal transition):**
```json
{
  "success": false,
  "message": "Invalid status transition from 'Todo' to 'Completed'. Allowed transitions: 'In Progress', 'Cancelled'."
}
```

- **Error Response `400 Bad Request` (Terminal state):**
```json
{
  "success": false,
  "message": "Task is already in terminal state 'Completed' and cannot be modified."
}
```

#### `DELETE /api/tasks/:id`
Delete a task. If the task was active (`Todo` or `In Progress`), the assigned employee's `activeTaskCount` is automatically decremented.

- **Path Parameters:** `id` (MongoDB ObjectId)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Task deleted successfully and employee workload counter adjusted."
}
```

---

## Business Rules Enforced on Backend

All business constraints are strictly enforced in the backend service layer (`employee.service.js` and `task.service.js`), guaranteeing consistency regardless of client origin:

1. **Task Assignment Rules (Employee Availability):**
   - **Inactive Employees:** Cannot be assigned any tasks under any circumstance. Requests return `400 Bad Request`.
   - **On Leave Employees:** Cannot be assigned tasks whose `startDate` falls inside their leave duration (`leaveStart <= task.startDate <= leaveEnd`). Assignments with `startDate` before or after the leave interval are permitted.
2. **Date Ordering Validation:**
   - For all tasks, `dueDate` must be greater than or equal to `startDate`.
   - For employees on leave, `leaveEnd` must be greater than or equal to `leaveStart`.
3. **Finite State Machine Status Transitions:**
   - `Todo` &rarr; `In Progress` or `Cancelled`
   - `In Progress` &rarr; `Completed` or `Cancelled`
   - `Completed` &rarr; *No transitions allowed (terminal state)*
   - `Cancelled` &rarr; *No transitions allowed (terminal state)*
   - Direct jumping from `Todo` &rarr; `Completed` is explicitly rejected.
4. **Backend-Controlled Completion Timestamp:**
   - `completedDate` is populated exclusively by the backend timestamp (`new Date()`) upon transitioning into `Completed`.
   - Request payloads cannot inject or override `completedDate`.
5. **Race-Condition-Safe Task Capacity (Max 3 Active Tasks):**
   - An employee may hold a maximum of 3 concurrent active tasks (`Todo` or `In Progress`).
   - Assignment increments `activeTaskCount` using atomic MongoDB conditional filters (`$lt: 3`).
   - Transitioning to `Completed` or `Cancelled`, or deleting an active task, atomically decrements `activeTaskCount`.
6. **Blocked Deletion for Active Employees:**
   - An employee with `activeTaskCount > 0` cannot be deleted. Any attempt returns `400 Bad Request`.
7. **Employee Snapshot Preservation:**
   - Every task captures a snapshot `{ employeeId, fullName, email }` at time of creation.
   - Deleting an employee with only historical (`Completed` or `Cancelled`) tasks will not corrupt or blank out task views.
8. **Dynamic Overdue Detection:**
   - Tasks are identified as overdue if `new Date() > task.dueDate` and `status NOT IN ['Completed', 'Cancelled']`.

---

## How Employee Deletion is Handled

Maintaining data integrity when employees leave an organization is critical for enterprise auditing:

1. **Active Task Guard:**
   Before an employee document is deleted, the backend checks whether `activeTaskCount > 0` or if any tasks with status `Todo` or `In Progress` exist in the database. If any active tasks are found, the deletion is rejected with a descriptive `400 Bad Request` error informing the administrator that active tasks must first be reassigned or resolved.
2. **Snapshot Persistence:**
   When an employee has no active tasks and is deleted:
   - Their completed and cancelled tasks remain in the `tasks` collection.
   - The task document retains the `employeeSnapshot` sub-document containing the exact `{ employeeId, fullName, email }` captured during task creation.
3. **Frontend Graceful Fallback:**
   The frontend UI prioritizes the populated `assignedEmployee` object. If `assignedEmployee` is `null` (because the referenced employee was deleted), the UI transparently falls back to `employeeSnapshot` and displays a neutral badge (`Former Employee: Jane Doe (EMP-1001)`).
4. **Historical Continuity:**
   This design preserves audit trails, historical performance data, and CSV export completeness without relying on fragile soft-deletes or orphaned records.

---

## System Assumptions

- **Authentication & Authorization:** As per assignment requirements, no authentication or role-based access control (RBAC) is implemented; all routes are publicly accessible within the local network or CORS origin.
- **Single-User Workspace:** Designed as a single-tenant managerial tool without concurrent user session conflicts outside atomic capacity controls.
- **Employee ID Format:** Employee IDs (e.g., `EMP-1001`) are supplied manually by the administrator and enforced as unique and uppercase.
- **Skills Representation:** Employee skills are stored as an array of sanitized, unique strings.
- **Contiguous Leave Period:** Each employee can specify at most one contiguous leave window (`leaveStart` to `leaveEnd`).
- **Priority Hierarchy:** Priority ordering for sorting and alerts follows `Critical` > `High` > `Medium` > `Low`.
- **Default Pagination:** Default pagination limit is 10 records per page.
- **CSV Scope:** CSV exports respect all active search and filter constraints while omitting pagination boundaries to export the full filtered collection.
- **Overdue Definition:** A task is overdue if `Date.now() > task.dueDate` and `status` is neither `Completed` nor `Cancelled`.

---

## Core Engineering Questions & Answers

### (1) Where do you validate status transitions and why?

Status transitions are validated in the backend service layer (`task.service.js`), specifically in the `updateTaskStatus` method. This operation is isolated exclusively to the `PUT /api/tasks/:id/status` endpoint — the general task update endpoint (`PUT /api/tasks/:id`) explicitly strips and rejects any `status` property in the incoming payload.

The permitted transitions are governed by an explicit state map:
- `Todo` &rarr; `In Progress`, `Cancelled`
- `In Progress` &rarr; `Completed`, `Cancelled`
- `Completed` / `Cancelled` &rarr; None (terminal states)

**Why validate on the backend?**
Client-side validation is solely an ergonomics convenience for user experience. Any user or external tool (such as curl or Postman) can bypass frontend checks. Validating in the backend service ensures the integrity of the state machine, guarantees that tasks cannot jump directly from `Todo` to `Completed` without work occurring, prevents reactivation of closed tasks, and reliably triggers side effects like decrementing employee workload and recording `completedDate`.

---

### (2) Why does Completed Date come from the backend?

The `completedDate` timestamp is generated strictly on the server (`new Date()`) at the moment the status transition to `Completed` is committed. The field is completely excluded from client update schemas and ignored if present in request payloads.

**Why?**
1. **Clock Discrepancies:** Client system clocks are notoriously unreliable, subject to inaccurate time zones, misconfigurations, or deliberate manual tampering.
2. **Audit Integrity:** Sourcing timestamps from the backend server provides a single, trusted source of truth across all tasks.
3. **Fraud & SLA Prevention:** Allowing clients to supply completion dates would enable retroactive backdating or artificial manipulation of operational SLAs and team turnaround metrics.

---

### (3) How do you block inactive / on-leave assignment?

Assignment guardrails are enforced inside `task.service.js` during both `createTask` and `updateTask` (when reassignment occurs):

1. **Inactive Check:** The target employee's `status` is retrieved. If `status === 'Inactive'`, the transaction immediately terminates with a `400 Bad Request` ("Cannot assign tasks to an Inactive employee").
2. **On Leave Check:** If `status === 'On Leave'`, the service compares the task's `startDate` against the employee's `leaveStart` and `leaveEnd` dates:
   ```javascript
   const taskStart = new Date(taskData.startDate);
   const leaveStart = new Date(employee.leaveStart);
   const leaveEnd = new Date(employee.leaveEnd);

   if (taskStart >= leaveStart && taskStart <= leaveEnd) {
     throw new BadRequestError(
       `Cannot assign task: employee is On Leave from ${leaveStart.toISOString().split('T')[0]} to ${leaveEnd.toISOString().split('T')[0]}`
     );
   }
   ```
If the task starts before `leaveStart` or after `leaveEnd`, assignment is permitted because the employee will be active when execution commences.

---

### (4) Why are filtering and pagination done on the backend?

Backend pagination and query filtering are essential for performance, network efficiency, and long-term scalability:

1. **Bandwidth Optimization:** Transferring thousands of task and employee documents over HTTP consumes unnecessary bandwidth, introduces latency, and degrades mobile device performance.
2. **Client Memory Footprint:** Storing entire datasets in browser memory leads to garbage collection pauses, sluggish rendering, and high memory utilization.
3. **Database Index Utilization:** MongoDB evaluates `$match`, `$text`, `$sort`, and `$skip`/`$limit` queries directly in memory using B-tree indexes, filtering millions of records in milliseconds before returning only the requested slice (e.g., 10 records).
4. **Accurate Pagination Metadata:** The database computes exact total counts and page counts alongside the filtered records, enabling the frontend to render accurate pagination controls.

---

### (5) Why do filters live in the URL?

In this application, all search terms, status filters, priority selections, sorting parameters, and page numbers are synchronized with the browser's URL query string via React Router's `useSearchParams` hook (e.g., `/tasks?status=In+Progress&priority=Critical&page=1`).

**Benefits:**
- **Shareability:** Team members can copy and paste the browser URL into Slack, email, or tickets, allowing colleagues to see the exact filtered dataset.
- **Bookmarkability:** Administrators can bookmark frequently used views (such as "Critical Overdue Tasks" or "Engineering Workload").
- **Browser History Support:** Users can navigate forward and back through previous filter states using native browser buttons.
- **Refresh Persistence:** Reloading or closing and reopening the browser tab preserves the user's filtered state.
- **Deep Linking:** Direct links from dashboard analytics widgets navigate directly to corresponding pre-filtered task lists.

---

### (6) What can go wrong if two requests assign a 4th active task at the same time?

#### The Problem: Concurrency Race Condition
Suppose Employee Jane currently has **2 active tasks** (capacity: 3). Two project managers simultaneously submit a task assignment request for Jane:
1. **Request A** reads Jane's `activeTaskCount` &rarr; returns `2`.
2. **Request B** reads Jane's `activeTaskCount` &rarr; returns `2`.
3. **Request A** checks `2 < 3` (True) &rarr; writes task & increments count to `3`.
4. **Request B** checks `2 < 3` (True) &rarr; writes task & increments count to `4`.

Jane is now overloaded with 4 active tasks, violating the hard capacity limit.

#### The Solution: Atomic Conditional Updates
We eliminate this race condition using MongoDB's atomic document-level locking via `findOneAndUpdate`:

```javascript
const updatedEmployee = await Employee.findOneAndUpdate(
  {
    _id: employeeId,
    status: { $ne: 'Inactive' },
    activeTaskCount: { $lt: 3 } // Atomic guard
  },
  {
    $inc: { activeTaskCount: 1 }
  },
  {
    new: true
  }
);

if (!updatedEmployee) {
  throw new BadRequestError('Employee is at maximum capacity (3 active tasks) or inactive.');
}
```

**Why this works:**
MongoDB executes the conditional match and increment as a single atomic operation. When Request A and Request B arrive concurrently, MongoDB locks the employee document:
- The first request satisfies `{ activeTaskCount: { $lt: 3 } }`, increments the counter to 3, and succeeds.
- The second request evaluates `{ activeTaskCount: { $lt: 3 } }`, finds `activeTaskCount === 3`, fails the query match, and returns `null`.
- The application catches the `null` result and returns an immediate `400 Bad Request` to the second caller. The race condition is eliminated without requiring complex distributed locks.

---

## Deployment Guidance

### Frontend Deployment (Vercel / Netlify)

1. **Build Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
2. **SPA Routing Configuration:**
   For Vercel, ensure a `vercel.json` file is present in the `frontend` directory to redirect all routes to `index.html`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
3. **Environment Variables:**
   Add `VITE_API_BASE_URL` pointing to your deployed backend (e.g., `https://employee-task-api.onrender.com/api`).

---

### Backend Deployment (Render)

1. **Create Web Service:**
   - Connect your GitHub repository to [Render](https://render.com/).
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
2. **Configure Environment Variables:**
   - `PORT`: `5000` (or leave default, Render sets this dynamically)
   - `MONGODB_URI`: Your production MongoDB Atlas connection string
   - `CORS_ORIGIN`: Your deployed frontend URL (e.g., `https://employee-task-app.vercel.app`)

---

### Database Setup (MongoDB Atlas)

1. Create a free **M0 Sandbox** cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user with `readWriteAnyDatabase` permissions.
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from serverless hosting providers like Render.
4. Click **Connect** &rarr; **Drivers (Node.js)** and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/employee_task_mgmt?retryWrites=true&w=majority
   ```
5. Supply this string in Render's environment variables as `MONGODB_URI`.

---

## Project Structure

```
employee-task-mgmt/
├── .env.example                          # Root environment template
├── README.md                             # System documentation
├── backend/
│   ├── .env.example                      # Backend environment template
│   ├── package.json                      # Backend dependencies & scripts
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # MongoDB connection via Mongoose
│   │   ├── controllers/
│   │   │   ├── dashboard.controller.js   # Dashboard aggregation endpoints
│   │   │   ├── employee.controller.js    # Employee CRUD controllers
│   │   │   └── task.controller.js        # Task CRUD & CSV export controllers
│   │   ├── middlewares/
│   │   │   ├── error.middleware.js       # Centralized error handler
│   │   │   └── validate.middleware.js    # Joi schema validation runner
│   │   ├── models/
│   │   │   ├── employee.model.js         # Employee Mongoose model
│   │   │   └── task.model.js             # Task Mongoose model
│   │   ├── routes/
│   │   │   ├── dashboard.routes.js       # /api/dashboard router
│   │   │   ├── employee.routes.js        # /api/employees router
│   │   │   ├── index.js                  # Combined API router
│   │   │   └── task.routes.js            # /api/tasks router
│   │   ├── services/
│   │   │   ├── dashboard.service.js      # Aggregation & metrics business logic
│   │   │   ├── employee.service.js       # Employee operations & capacity logic
│   │   │   └── task.service.js           # Task state machine & assignment logic
│   │   ├── utils/
│   │   │   ├── apiResponse.js            # Standardized API response wrappers
│   │   │   └── errors.js                 # Custom HTTP exception classes
│   │   ├── validators/
│   │   │   ├── employee.validator.js     # Joi validation rules for employees
│   │   │   └── task.validator.js         # Joi validation rules for tasks
│   │   ├── app.js                        # Express application configuration
│   │   └── server.js                     # Entry point & HTTP listener
└── frontend/
    ├── index.html                        # HTML entry point
    ├── package.json                      # Frontend dependencies & scripts
    ├── postcss.config.js                 # PostCSS setup for Tailwind CSS
    ├── tailwind.config.js                # Tailwind theme customization
    ├── vite.config.js                    # Vite bundler configuration
    └── src/
        ├── App.jsx                       # Root React component & providers
        ├── main.jsx                      # Vite bootstrap script
        ├── index.css                     # Tailwind imports & global styles
        ├── api/
        │   ├── client.js                 # Axios instance with base configuration
        │   ├── dashboardApi.js           # Dashboard service caller
        │   ├── employeeApi.js            # Employee REST client functions
        │   └── taskApi.js                # Task REST client functions & CSV download
        ├── components/
        │   ├── common/
        │   │   ├── Badge.jsx             # Status and priority badge UI
        │   │   ├── Button.jsx            # Reusable button component
        │   │   ├── ConfirmModal.jsx      # Deletion & action confirmation dialog
        │   │   ├── Input.jsx             # Styled form text input
        │   │   ├── LoadingSpinner.jsx    # Loading indicators & skeletons
        │   │   ├── Modal.jsx             # Accessible modal overlay container
        │   │   ├── Pagination.jsx        # Server-side pagination controls
        │   │   ├── Select.jsx            # Custom select dropdown
        │   │   └── Table.jsx             # Sortable data table layout
        │   └── layout/
        │       ├── Header.jsx            # Top navigation bar
        │       ├── Layout.jsx            # Main app shell container
        │       └── Sidebar.jsx           # Side navigation drawer
        ├── hooks/
        │   ├── useDebounce.js            # Debounce hook for real-time search
        │   ├── useEmployeeFilters.js     # URL query string sync for employees
        │   └── useTaskFilters.js         # URL query string sync for tasks
        ├── pages/
        │   ├── DashboardPage.jsx         # Executive dashboard with charts & workloads
        │   ├── NotFoundPage.jsx          # 404 error page
        │   ├── employees/
        │   │   ├── EmployeeDetailPage.jsx # Single employee view & task list
        │   │   ├── EmployeeFormModal.jsx  # Employee creation & edit modal
        │   │   └── EmployeeListPage.jsx   # Searchable, paginated employee table
        │   └── tasks/
        │       ├── TaskDetailPage.jsx    # Task detail inspection
        │       ├── TaskFormModal.jsx     # Task creation & edit modal
        │       ├── TaskListPage.jsx      # Filterable task table with CSV export
        │       └── TaskStatusModal.jsx   # Dedicated status transition modal
        ├── routes/
        │   └── AppRoutes.jsx             # Application route declarations
        └── utils/
            ├── constants.js              # Enums, statuses, and options
            ├── dateUtils.js              # Date formatting & overdue utilities
            └── formatters.js             # String & capacity percentage formatters
```

---

## License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute as needed.
