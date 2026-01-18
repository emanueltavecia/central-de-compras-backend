# Central de Compras - Backend

> MVP backend for a Purchasing Center developed for academic purposes.

## 📋 About the Project

This is the backend of a Purchasing Center platform, developed for the interdisciplinary project of the 4th phase of the Computer Science course at UNESC. The application provides a complete RESTful API to manage organizations, users, products, campaigns, orders, cashback, and much more.

## 👥 Authors

- Emanuel Cardoso Tavecia
- Guilherme Conti Machado
- Gabriel Alves Teixeira
- Caio Vinícius Guimarães de Oliveira Dagostim

## 🔗 Project Links

- 🚀 [**API Deploy**](https://central-de-compras-backend.vercel.app/)
- 🚀 [**Swagger Documentation**](https://central-de-compras-backend.vercel.app/docs)
- 🚀 [**Front-end Deploy**](https://central-de-compras-frontend.vercel.app/)
- 🔙 [**Front-end Repository**](https://github.com/emanueltavecia/central-de-compras-frontend)

## 🚀 Technologies Used

- **Node.js** - JavaScript Runtime
- **TypeScript** - JavaScript superset with static typing
- **Express 5** - Minimalist and flexible web framework
- **PostgreSQL** - Relational database
- **Docker** - Application containerization
- **JWT** - Authentication and authorization
- **Swagger** - API documentation
- **routing-controllers** - Route decorators
- **class-validator** - Data validation

### Main Dependencies

- `express` - Web framework
- `pg` - PostgreSQL client
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `class-validator` & `class-transformer` - Data validation and transformation
- `helmet` - HTTP security
- `cors` - Cross-Origin Resource Sharing
- `multer` - File upload

## 📁 Project Structure

```
central-de-compras-backend/
├── src/
│   ├── server.ts                # Application entry point
│   ├── config/                  # Application configurations
│   ├── controllers/             # Route controllers
│   ├── database/                # Connection, database schemas and seed
│   ├── decorators/              # Custom decorators
│   ├── enums/                   # Enums
│   ├── middlewares/             # Middlewares (auth, validation)
│   ├── repository/              # Data access layer
│   ├── routes/                  # Route definitions
│   ├── schemas/                 # Validation schemas
│   ├── services/                # Business logic
│   ├── types/                   # TypeScript types
│   └── utils/                   # Utilities
├── uploads/                     # Uploaded files (profile images)
├── docker-compose.yml           # Database Docker configuration
├── package.json                 # Dependencies and scripts
└── tsconfig.json                # TypeScript configuration
```

## 🛠️ Features

### Main Modules

- **Authentication** - Login, registration and session management
- **Users** - User CRUD with different profiles
- **Organizations** - Organization management
- **Products** - Product catalog
- **Categories** - Product organization by category
- **Orders** - Order and quotation system
- **Campaigns** - Promotional campaigns
- **Cashback** - Cashback and wallet system
- **Addresses** - Organization address management
- **Payment Conditions** - Payment method configuration
- **Change Requests** - Change approval workflow
- **Contacts** - Contact management
- **Statistics** - Dashboards and reports

## 📦 Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (package manager)
- **Docker** and **Docker Compose** (for the database)
- **PostgreSQL 16** (if not using Docker)

## ⚙️ Installation and Configuration

### 1. Clone the Repository

```bash
git clone <repository-url>
cd central-de-compras-backend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root following the template in the `.env.example` file

### 4. Start the Database (Docker)

```bash
pnpm docker:up
```

This command will:

- Create a PostgreSQL 16 container
- Automatically run the schema and seed scripts
- Expose the database on port 5432

### 5. Run the Application

#### Development Mode (with hot reload)

```bash
pnpm dev
```

#### Production Mode

```bash
pnpm build
pnpm start
```

## 🐳 Docker Commands

```bash
# Start the database
pnpm docker:up

# Stop the database
pnpm docker:down

# View PostgreSQL logs
pnpm docker:logs

# Remove container and volumes (clear data)
pnpm docker:remove
```

## 📚 Available Scripts

| Command              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `pnpm dev`           | Starts the server in development mode with hot reload |
| `pnpm build`         | Compiles the TypeScript project to JavaScript         |
| `pnpm start`         | Starts the server in production mode                  |
| `pnpm lint`          | Formats and fixes code issues                         |
| `pnpm type-check`    | Checks for TypeScript typing errors                   |
| `pnpm db:test`       | Tests the database connection                         |
| `pnpm docker:up`     | Starts the PostgreSQL Docker container                |
| `pnpm docker:down`   | Stops the Docker container                            |
| `pnpm docker:logs`   | Displays PostgreSQL logs                              |
| `pnpm docker:remove` | Removes container and volumes                         |

## 📖 API Documentation

After starting the server, access the Swagger documentation at:

```
http://localhost:3000/docs
```

The interactive documentation allows you to:

- View all available endpoints
- Test requests directly in the interface
- See request/response schemas
- Understand HTTP status codes

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Log in through the `/auth/login` endpoint
2. Receive the JWT token in the response
3. Include the token in the `Authorization` header of requests:
   ```
   Authorization: Bearer your_jwt_token_here
   ```

## 🏗️ Architecture

The project follows a layered architecture:

```
Controllers → Services → Repositories → Database
```

- **Controllers**: Receive HTTP requests and delegate to services
- **Services**: Contain business logic
- **Repositories**: Abstract database access
- **Database**: Persistence layer (PostgreSQL)

### Patterns Used

- **Repository Pattern**: Data layer abstraction
- **Dependency Injection**: Via routing-controllers decorators
- **DTO Pattern**: Data validation with class-validator
- **Middleware Pattern**: Authentication and validation

## 🗄️ Database

### Schema

The database includes the following main tables:

- `users` - System users
- `organizations` - Organizations/companies
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Orders
- `campaigns` - Promotional campaigns
- `cashback_wallets` - Cashback wallets
- `cashback_transactions` - Cashback transactions
- `addresses` - Organization addresses
- `payment_conditions` - Payment conditions
- `change_requests` - Change requests

### Migrations

The schema and seed scripts are located in:

- `src/database/schema.sql` - Database structure
- `src/database/seed.sql` - Initial data

They are automatically executed when starting Docker.

## 🔒 Security

- **Helmet**: Protection against known HTTP vulnerabilities
- **CORS**: Allowed origins configuration
- **JWT**: Secure tokens with configurable expiration
- **Bcrypt**: Password hashing with salt
- **Validation**: Strict input data validation
- **SQL Injection**: Use of parameterized queries

## 📤 File Upload

The application supports profile image uploads. Files are stored in:

- **Development**: `./uploads/profile/`
- **Production**: `/tmp/uploads/profile/`

## 🌐 Deploy

### Vercel

The project is configured for deployment on Vercel.

The `vercel.json` file contains the necessary configurations.

### Environment Variables in Production

Make sure to configure the environment variables according to the `.env.example` file.

## 🧪 Tests

To test the database connection:

```bash
pnpm db:test
```

## 👤 Default Users (Seed)

The seed script creates the following users for testing:

| Role     | Email                            | Password  | Description                     |
| -------- | -------------------------------- | --------- | ------------------------------- |
| Admin    | admin@centralcompras.com         | Admin@123 | Purchasing Center Administrator |
| Store    | loja@lojaexemplo.com             | Admin@123 | Store User                      |
| Supplier | fornecedor@fornecedorexemplo.com | Admin@123 | Supplier User                   |

### User Permissions

- **Admin**: Full system access - manages users, organizations, products, orders, campaigns, and all settings
- **Store**: Can view suppliers, create orders, and view their orders
- **Supplier**: Can manage products, view and manage orders, manage campaigns, and configure commercial conditions

## 📝 License

See details in [LICENSE.md](LICENSE.md)

## 🤝 Contributing

This is an academic project. To contribute:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/MyFeature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/MyFeature`)
5. Open a Pull Request
