# Online Learning Platform

Welcome to the **Online Learning Platform**! This platform allows users to log in, join classes, complete tasks, and track their progress. The system is composed of several services, including:

- **Client**: The front-end interface for users to interact with the platform.
- **Authentication Service**: Handles user authentication, sign-up, and login processes logOut and many more.
- **Class Service**: Manages creation and management of classes and user participation.

## Features

- **Landing Page**: Users can view the platform's offerings, including the courses and features available.
- **Login System**: Secure authentication via email and password. Users can log in to access personalized content.
- **Dashboard**: After logging in, users can access their personalized dashboard, displaying their enrolled classes, progress, and upcoming tasks.
- **Create Classes**: Users (instructors) can create new classes and manage them.
- **Join Classes**: Students can join available classes.
- **Tasks**: Students can complete tasks.
- **Progress Tracking**: Users can track their progress in each class and see which tasks are completed.

## Technologies Used

- **Frontend**: React.js,Nextjs, Monaco Editor (for task code input)
- **Backend**: Node.js (TypeScript)
- **Authentication**: JWT (JSON Web Tokens) for secure login
- **Database**:  PostgreSQL for storing user, class, and task data

## Getting Started

To run this platform locally, follow the steps below:

### 1. Clone the repository

```bash
git clone https://github.com/SebaHel/OnlineLearningPlatform.git
cd online-learning-platform
```
## 2. Install Dependencies

### Frontend:
Go to the `frontend` directory and install the dependencies.

```bash
cd client
npm install
```
### Backend:
Go to the `Backend` directory and install the dependencies.

```bash
cd AuthenticationService
npm install
```
```bash
cd ClassService
npm install
```
### 3. Test Authentication Service

```bash
cd AuthenticationService
npm test
```
