# Finance Manager API

A comprehensive personal finance management API built with Node.js, TypeScript, and Clean Architecture principles. This API allows users to create accounts, manage bank accounts, and track financial transactions with detailed metrics and reporting capabilities.

## 🚀 Features

- **User Authentication**: Secure user registration, login, and JWT-based authentication
- **Password Management**: Forgot password functionality with email notifications
- **Bank Account Management**: Create, update, and manage multiple bank accounts
- **Wallet System**: Personal wallet integration with balance tracking
- **Transaction Tracking**: Record and monitor financial transactions
- **Financial Metrics**: Monthly spending analysis and detailed reporting
- **Clean Architecture**: Domain-driven design with proper separation of concerns
- **Type Safety**: Full TypeScript implementation
- **Comprehensive Testing**: Unit and integration tests with high coverage

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js with routing-controllers
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Testing**: Mocha, Chai
- **Architecture**: Clean Architecture, DDD (Domain-Driven Design)
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/maayconslv/finance-manager-api.git
   cd finance-manager-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/finance_manager"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key"

   # Server
   PORT=3000
   NODE_ENV=development

   # Email (for password reset)
   EMAIL_SERVICE_API_KEY="your-email-service-key"
   EMAIL_FROM="noreply@financemanager.com"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate:deploy
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## 💰 Money Format

The API uses Brazilian Real (BRL) format for all monetary values:
- Input format: `"1.234.567,89"` (periods for thousands, comma for decimals)
- Output format: `"R$ 1.234.567,89"`

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are returned upon successful login and should be included in all protected endpoints.

## 📊 Response Format

### Success Response
```json
{
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "errors": {
    "message": "Error description",
    "errorType": "ERROR_TYPE",
    "statusCode": 400,
    "details": ["Additional error details"]
  }
}
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm run test
```

## 🏗️ Project Structure

```
src/
├── api/                    # API layer (controllers, middleware, types)
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   └── types/             # API type definitions
├── core/                  # Core domain objects
│   ├── entities/          # Base entities
│   ├── object-values/     # Value objects (Email, Money, etc.)
│   └── types/             # Core type utilities
├── domain/                # Business logic layer
│   ├── Accounts/          # Account management domain
│   ├── Auth/              # Authentication domain
│   ├── errors/            # Custom error classes
│   └── services/          # Domain services
├── infrastructure/        # External concerns
│   ├── database/          # Database repositories and config
│   └── logger/            # Logging implementation
└── test/                  # Test utilities and fixtures
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Cross-Origin Resource Sharing enabled
- **Helmet**: Security headers middleware
- **Input Validation**: Comprehensive request validation
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Salted password hashing
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 🚦 Error Handling

The API implements comprehensive error handling with different error types:

- `BAD_REQUEST` (400): Invalid request data
- `UNAUTHORIZED` (401): Authentication required or failed
- `FORBIDDEN` (403): Access denied
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource conflict (e.g., email already exists)
- `VALIDATION_ERROR` (422): Input validation failed
- `INTERNAL_SERVER` (500): Server error

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and architecture patterns
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR

## 📝 License
  
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for better financial management**