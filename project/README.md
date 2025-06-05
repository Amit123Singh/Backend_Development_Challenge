# Collaborative Task Management API

## Project Overview

This is a RESTful API backend for a collaborative task management application. It enables managers to create, assign, and oversee tasks, while employees can view and update the status of tasks assigned to them. The application features role-based access control and real-time notifications using Socket.io.

### Key Features

- User authentication with JWT
- Role-based access control (Manager/Employee roles)
- Task management with CRUD operations
- Real-time notifications for task assignments and updates
- RESTful API endpoints for frontend integration

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd task-management-backend
```

2. Install dependencies
```bash
npm install
```

3. Environment Variables
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

### Authentication Endpoints

#### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Manager" // or "Employee"
}
```
- **Response**:
```json
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Manager"
  }
}
```

#### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Manager"
  }
}
```

#### Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Manager",
    "createdAt": "2023-06-01T12:00:00.000Z"
  }
}
```

### User Endpoints

#### Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Authorization**: Managers only
- **Response**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Manager",
      "createdAt": "2023-06-01T12:00:00.000Z"
    },
    {
      "_id": "user_id_2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "Employee",
      "createdAt": "2023-06-01T12:30:00.000Z"
    }
  ]
}
```

#### Get All Employees
- **URL**: `/api/users/employees`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Authorization**: Managers only
- **Response**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "user_id_2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "Employee",
      "createdAt": "2023-06-01T12:30:00.000Z"
    }
  ]
}
```

#### Get User by ID
- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Authorization**: Managers or own profile only
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "user_id_2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "Employee",
    "createdAt": "2023-06-01T12:30:00.000Z"
  }
}
```

### Task Endpoints

#### Get All Tasks
- **URL**: `/api/tasks`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Authorization**: Managers see all tasks, Employees see only assigned tasks
- **Response**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "task_id_1",
      "title": "Complete Project Proposal",
      "description": "Write a detailed project proposal for the new client",
      "status": "pending",
      "dueDate": "2023-06-15T00:00:00.000Z",
      "assignedTo": {
        "_id": "user_id_2",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdBy": {
        "_id": "user_id_1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2023-06-01T13:00:00.000Z",
      "updatedAt": "2023-06-01T13:00:00.000Z"
    }
  ]
}
```

#### Get Task by ID
- **URL**: `/api/tasks/:id`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Authorization**: Managers or assigned employee only
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "task_id_1",
    "title": "Complete Project Proposal",
    "description": "Write a detailed project proposal for the new client",
    "status": "pending",
    "dueDate": "2023-06-15T00:00:00.000Z",
    "assignedTo": {
      "_id": "user_id_2",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "createdBy": {
      "_id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2023-06-01T13:00:00.000Z",
    "updatedAt": "2023-06-01T13:00:00.000Z"
  }
}
```

#### Create Task
- **URL**: `/api/tasks`
- **Method**: `POST`
- **Authentication**: Required (Bearer Token)
- **Authorization**: Managers only
- **Request Body**:
```json
{
  "title": "Complete Project Proposal",
  "description": "Write a detailed project proposal for the new client",
  "dueDate": "2023-06-15T00:00:00.000Z",
  "assignedTo": "user_id_2"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "task_id_1",
    "title": "Complete Project Proposal",
    "description": "Write a detailed project proposal for the new client",
    "status": "pending",
    "dueDate": "2023-06-15T00:00:00.000Z",
    "assignedTo": {
      "_id": "user_id_2",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "createdBy": {
      "_id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2023-06-01T13:00:00.000Z",
    "updatedAt": "2023-06-01T13:00:00.000Z"
  }
}
```

#### Update Task
- **URL**: `/api/tasks/:id`
- **Method**: `PUT`
- **Authentication**: Required (Bearer Token)
- **Authorization**: Managers can update all fields, Employees can only update status
- **Request Body (Manager)**:
```json
{
  "title": "Updated Project Proposal",
  "description": "Updated description",
  "status": "in-progress",
  "dueDate": "2023-06-20T00:00:00.000Z",
  "assignedTo": "user_id_3"
}
```
- **Request Body (Employee)**:
```json
{
  "status": "in-progress"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "task_id_1",
    "title": "Updated Project Proposal",
    "description": "Updated description",
    "status": "in-progress",
    "dueDate": "2023-06-20T00:00:00.000Z",
    "assignedTo": {
      "_id": "user_id_3",
      "name": "Sam Johnson",
      "email": "sam@example.com"
    },
    "createdBy": {
      "_id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2023-06-01T13:00:00.000Z",
    "updatedAt": "2023-06-02T09:00:00.000Z"
  }
}
```

#### Delete Task
- **URL**: `/api/tasks/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Bearer Token)
- **Authorization**: Managers only
- **Response**:
```json
{
  "success": true,
  "data": {}
}
```

## Socket.IO Events

### Client Events (to listen for)
1. **newTask**
   - Triggered when a new task is assigned to a user
   - Data structure:
   ```json
   {
     "task": {/* Task object */},
     "message": "You have been assigned a new task"
   }
   ```

2. **taskUpdated**
   - Triggered when a task is updated
   - Data structure:
   ```json
   {
     "task": {/* Updated task object */},
     "message": "Task \"Task Title\" has been updated"
   }
   ```

3. **taskDeleted**
   - Triggered when a task is deleted
   - Data structure:
   ```json
   {
     "taskId": "task_id",
     "message": "Task \"Task Title\" has been deleted"
   }
   ```

### Client Connection
To connect to Socket.IO with authentication:

```javascript
const socket = io('http://localhost:5000', {
  query: { token: 'your_jwt_token' }
});

socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('newTask', (data) => {
  console.log('New task assigned:', data);
});

socket.on('taskUpdated', (data) => {
  console.log('Task updated:', data);
});

socket.on('taskDeleted', (data) => {
  console.log('Task deleted:', data);
});
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## Security Features

- Password hashing with bcrypt
- JWT authentication with expiry
- Role-based access control
- Input validation and sanitization
- Protected routes middleware