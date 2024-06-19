# Task Scheduler

Task Scheduler is a full-stack application designed to create, view, edit, and delete scheduled tasks. It supports both one-time and recurring tasks and ensures tasks are executed at their scheduled times. The application includes a React-based frontend, an Express backend, and a PostgreSQL database, all orchestrated using Docker.

## Features

- **Task Types**: Supports both one-time and recurring tasks.
- **Task Management**: Create, view, edit, and delete tasks.
- **Scheduling**: Tasks are executed based on their schedule, including support for cron expressions for recurring tasks.
- **Frontend**: Built with React and Material-UI for a sleek and responsive design.
- **Backend**: Built with Node.js, Express, and Sequelize for ORM.
- **Database**: Uses PostgreSQL for task storage.
- **Queue**: Uses Redis and BullMQ for task scheduling and execution.

## Prerequisites

- Docker
- Docker Compose

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/ranjithbantu/task-scheduler.git
    cd task-scheduler
    ```

2. **Set environment variables**:

    Create a `.env` file in the root directory with the following content:

    ```env
    REACT_APP_TIMEZONE=America/Los_Angeles
    TIMEZONE=America/Los_Angeles
    ```

3. **Build and start the containers**:

    ```bash
    docker-compose up --build
    ```

    This command will build the Docker images for the frontend and backend, set up the PostgreSQL and Redis services, and start all the containers.

## Usage

Once the containers are running, you can access the application at `http://localhost:3000`.

### Endpoints

- **Backend API**: `http://localhost:5000/api/tasks`
  - `GET /api/tasks`: Retrieve all tasks.
  - `POST /api/tasks`: Create a new task.
  - `PUT /api/tasks/:id`: Update an existing task.
  - `DELETE /api/tasks/:id`: Delete a task.

## Architecture

### High-Level Architecture

- **Task Scheduler Service**:
  - Responsible for scheduling and executing tasks.
  - Handles both one-time and recurring tasks.
  - Ensures tasks are picked up within 10 seconds of their scheduled time.

- **Task Storage**:
  - Durable storage for tasks using PostgreSQL.
  - Stores task details, status, and execution logs.

- **Client Interface (Frontend)**:
  - A React-based GUI.
  - Allows users to create, view, edit, and delete tasks.
  - Displays execution logs.

- **Worker Nodes**:
  - Distributed workers that pick up and execute tasks.
  - Communicate with the scheduler service to get tasks.

- **API Gateway**:
  - Exposes endpoints for the frontend to interact with the backend services.

### Core Requirements

- **Task Types**:
  - One-time Task: Executes once at a specified time.
  - Recurring Task: Executes repeatedly based on a cron schedule.

- **Task Registration**:
  - Clients can register tasks via API endpoints or the frontend interface.

- **Execution Timing**:
  - Tasks should be picked up within 10 seconds of their scheduled execution time.

### High Availability and Scalability

- **High Availability**:
  - Use a clustered database for task storage to ensure data durability.
  - Implement load balancing for the scheduler service and worker nodes.

- **Scalability**:
  - Horizontal scaling for worker nodes to handle an increasing number of tasks.
  - Efficient task queue management to distribute tasks evenly among workers.

### Cost-Effectiveness

- **Cost Justification**:
  - Use cloud services with autoscaling features to optimize resource usage.
  - Minimize infrastructure costs by using serverless functions where appropriate.

## Development

### Running Locally

To run the application locally without Docker:

1. **Backend**:

    ```bash
    cd backend
    npm install
    npm run dev
    ```

2. **Frontend**:

    ```bash
    cd frontend
    npm install
    npm start
    ```

### Testing

To run tests for the backend:

```bash
cd backend
npm test
```

To run tests for the frontend:

```bash
cd frontend
npm test
