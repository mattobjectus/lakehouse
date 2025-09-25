# Lakehouse

A comprehensive full-stack web application for managing lakehouse reservations, duty assignments, and user administration. Built with Spring Boot backend and React TypeScript frontend.
This has been developed with guided AI interactions. Overall this is going well with limited involvement in debugging and coding when things get non-obvious or have complex rules.

## 🏗️ Architecture Overview

### Backend (Spring Boot)

- **Framework**: Spring Boot 3.2.0 with Java 17+
- **Database**: PostgreSQL with Hibernate/JPA
- **Security**: JWT-based authentication with Spring Security
- **API**: RESTful API with comprehensive DTO pattern implementation
- **Port**: 8082 with `/api` context path

### Frontend (React TypeScript)

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) components
- **State Management**: React Context API for authentication
- **Routing**: React Router for navigation
- **Port**: 3000

## 🚀 Features

### 🔐 Authentication & Authorization

- **JWT Token-based Authentication**: Secure login/logout system
- **Role-based Access Control**: USER and ADMIN roles with different permissions
- **Protected Routes**: Frontend route protection based on authentication status
- **Password Security**: Encrypted password storage with BCrypt

### 👥 User Management

- **User Registration**: New user account creation
- **User Profiles**: First name, last name, email, username management
- **Role Assignment**: Admin can assign USER or ADMIN roles
- **User Listing**: Admin can view all users and filter by role

### 🏠 Reservation System

- **Lakehouse Booking**: Users can reserve the lakehouse for specific date ranges
- **Conflict Prevention**: System prevents overlapping reservations
- **Reservation Management**: View, create, and delete reservations
- **Personal Reservations**: Users can view their own reservation history
- **Date Validation**: Ensures logical start/end date relationships

### 📋 Duty Management

- **Duty Creation**: Admins can create maintenance and cleaning duties
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT priority classification
- **Time Estimation**: Estimated hours for completion tracking
- **Duty Assignment**: Assign duties to specific users with dates and notes
- **Status Tracking**: ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED statuses
- **Assignment History**: Complete audit trail of duty assignments

### 🛡️ Security Features

- **Data Transfer Objects (DTOs)**: Secure API responses excluding sensitive data
- **Password Exclusion**: User passwords never exposed in API responses
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Comprehensive validation on all API endpoints
- **Authorization Checks**: Method-level security annotations

## 📊 Database Schema

### Users Table

```sql
- id (Primary Key)
- username (Unique)
- email (Unique)
- first_name
- last_name
- password (Encrypted)
- role (USER/ADMIN)
- created_at
- updated_at
```

### Duties Table

```sql
- id (Primary Key)
- name
- description
- estimated_hours
- priority (LOW/MEDIUM/HIGH/URGENT)
- is_active
- created_at
- updated_at
```

### Reservations Table

```sql
- id (Primary Key)
- start_date
- end_date
- notes
- status (PENDING/CONFIRMED/CANCELLED)
- user_id (Foreign Key)
- created_at
- updated_at
```

### Duty Assignments Table

```sql
- id (Primary Key)
- assigned_date
- completed_date
- status (ASSIGNED/IN_PROGRESS/COMPLETED/CANCELLED)
- notes
- user_id (Foreign Key)
- duty_id (Foreign Key)
- created_at
- updated_at
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/by-role/{role}` - Get users by role (Admin only)

### Duties

- `GET /api/duties` - Get all active duties
- `POST /api/duties` - Create new duty (Admin only)
- `GET /api/duties/assignments` - Get all duty assignments
- `GET /api/duties/assignments/my` - Get current user's assignments
- `POST /api/duties/{id}/assign` - Assign duty to user
- `PUT /api/duties/assignments/{id}/complete` - Mark assignment as complete

### Reservations

- `GET /api/reservations` - Get current and future reservations
- `GET /api/reservations/my` - Get current user's reservations
- `POST /api/reservations` - Create new reservation
- `DELETE /api/reservations/{id}` - Delete reservation

## 🛠️ Technology Stack

### Backend Dependencies

- **Spring Boot Starter Web**: RESTful web services
- **Spring Boot Starter Data JPA**: Database operations
- **Spring Boot Starter Security**: Authentication and authorization
- **Spring Boot Starter Validation**: Input validation
- **PostgreSQL Driver**: Database connectivity
- **JJWT**: JWT token handling
- **BCrypt**: Password encryption

### Frontend Dependencies

- **React**: UI framework
- **TypeScript**: Type safety
- **Material-UI**: Component library
- **React Router**: Navigation
- **Axios**: HTTP client for API calls

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL database
- Maven 3.6+

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lakehouse-scheduler
   ```

2. **Configure Database**

   - Create a PostgreSQL database
   - Update `backend/src/main/resources/application.properties`:

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/your_database
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Run Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Backend will start on `http://localhost:8082/api`

### Frontend Setup

1. **Install Dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   Frontend will start on `http://localhost:3000`

## 📱 Application Pages

### Public Pages

- **Home**: Landing page with application overview
- **Login**: User authentication
- **Register**: New user account creation

### Protected Pages (Authenticated Users)

- **Dashboard**: Personal overview of reservations and assignments
- **Reservations**: View and manage lakehouse bookings
- **Duties**: View available duties and personal assignments
- **Administration**: User and duty management (Admin only)

## 🔒 Security Implementation

### JWT Authentication Flow

1. User submits credentials to `/api/auth/signin`
2. Server validates credentials and generates JWT token
3. Token stored in frontend and included in subsequent API requests
4. Server validates token on each protected endpoint access

### Role-Based Access Control

- **USER Role**: Can view duties, create reservations, manage own assignments
- **ADMIN Role**: Full access including user management and duty creation

### Data Protection

- Passwords encrypted with BCrypt before database storage
- Sensitive data excluded from API responses via DTO pattern
- CORS properly configured for secure cross-origin requests

## 🏃‍♂️ Current Status

### ✅ Completed Features

- Complete authentication system with JWT
- User registration and management
- Duty creation and assignment system
- Reservation booking with conflict prevention
- Role-based access control
- Comprehensive DTO implementation for secure API responses
- Full-stack integration with React frontend
- Database schema with proper relationships
- Input validation and error handling

### 🔄 Active Services

- **Backend**: Spring Boot application running on port 8082
- **Frontend**: React development server running on port 3000
- **Database**: PostgreSQL with active connection pool
- **API Integration**: Frontend successfully communicating with backend

### 📈 Recent Improvements

- **DTO Pattern Implementation**: All API endpoints now return DTOs instead of raw entities
- **Security Enhancement**: Passwords and sensitive data excluded from responses
- **Performance Optimization**: Lazy loading prevention and circular reference elimination
- **Code Quality**: Clean separation between data models and API contracts

## 🤝 Contributing

This application follows best practices for:

- **Clean Architecture**: Separation of concerns between layers
- **Security**: Comprehensive authentication and authorization
- **Data Integrity**: Proper validation and constraint handling
- **API Design**: RESTful endpoints with consistent response patterns
- **Code Quality**: TypeScript for frontend, comprehensive Java annotations

## 📄 License

This project is part of a personal lakehouse management system.

---

**Application URLs:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8082/api
- Database: PostgreSQL (configured in application.properties)
