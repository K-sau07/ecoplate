# Food Waste Management System - Backend

A Spring Boot backend application for managing food waste by connecting grocery stores with NGOs and customers. Features user authentication with JWT and food item listing with expiry tracking.

## 📋 Project Overview

This system helps reduce food waste by:
- Allowing store managers to list food items nearing expiry
- Providing real-time expiry tracking
- Implementing role-based access control (Store Manager, NGO, Customer, Admin)

## 🏗️ Architecture & Design Patterns

### Design Pattern: **Factory Pattern (GoF)**
- **Location**: `service/factory/UserFactory.java`
- **Purpose**: Creates different types of users based on their role
- **Benefits**: 
  - Encapsulates user creation logic
  - Allows role-specific initialization
  - Easy to extend for new user types
  - Follows Single Responsibility Principle

### Tech Stack
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **ORM**: Hibernate/JPA

## 📁 Project Structure

```
food-waste-backend/
├── src/main/java/com/foodwaste/backend/
│   ├── config/              # Security & application configuration
│   │   └── SecurityConfig.java
│   ├── controller/          # REST API endpoints
│   │   ├── AuthController.java
│   │   └── FoodItemController.java
│   ├── dto/                 # Data Transfer Objects
│   │   ├── SignupRequest.java
│   │   ├── LoginRequest.java
│   │   ├── AuthResponse.java
│   │   ├── FoodItemRequest.java
│   │   └── FoodItemResponse.java
│   ├── exception/          # Custom exceptions & global error handling
│   │   ├── ResourceNotFoundException.java
│   │   ├── UserAlreadyExistsException.java
│   │   ├── ErrorResponse.java
│   │   └── GlobalExceptionHandler.java
│   ├── model/              # JPA entities
│   │   ├── User.java
│   │   ├── UserRole.java
│   │   ├── FoodItem.java
│   │   └── FoodItemStatus.java
│   ├── repository/         # Data access layer
│   │   ├── UserRepository.java
│   │   └── FoodItemRepository.java
│   ├── security/           # JWT & authentication
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   ├── service/            # Business logic
│   │   ├── AuthService.java
│   │   ├── FoodItemService.java
│   │   └── factory/
│   │       └── UserFactory.java  # Factory Pattern (GoF)
│   └── FoodWasteBackendApplication.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

## 🚀 Setup & Installation

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Postman (for API testing)

### Database Setup

1. **Start MySQL Server**

2. **Create Database** (Optional - auto-created by Spring Boot)
```sql
CREATE DATABASE food_waste_db;
```

3. **Update Database Credentials**
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Running the Application

1. **Clone/Navigate to project directory**
```bash
cd /Users/saurabhkashyap/Desktop/food-waste-backend
```

2. **Build the project**
```bash
mvn clean install
```

3. **Run the application**
```bash
mvn spring-boot:run
```

The server will start at `http://localhost:8080`

## 📡 API Endpoints

### Authentication APIs

#### 1. User Signup
```http
POST /api/auth/signup
Content-Type: application/json

Request Body:
{
  "email": "store@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "role": "STORE_MANAGER"
}

Response (201 Created):
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "store@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STORE_MANAGER"
}
```

**Available Roles**: `STORE_MANAGER`, `NGO`, `CUSTOMER`, `ADMIN`

#### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "store@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "store@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STORE_MANAGER"
}
```

### Food Item APIs

**Note**: All food item endpoints require authentication. Include JWT token in headers:
```
Authorization: Bearer <your_jwt_token>
```

#### 1. Create Food Item (Store Manager Only)
```http
POST /api/food-items
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Fresh Apples",
  "description": "Red delicious apples",
  "category": "Fruits",
  "quantity": 50,
  "unit": "kg",
  "originalPrice": 299.99,
  "expiryDate": "2024-12-31",
  "manufactureDate": "2024-12-01"
}

Response (201 Created):
{
  "id": 1,
  "name": "Fresh Apples",
  "description": "Red delicious apples",
  "category": "Fruits",
  "quantity": 50,
  "unit": "kg",
  "originalPrice": 299.99,
  "discountedPrice": 299.99,
  "expiryDate": "2024-12-31",
