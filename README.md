# E-Commerce Platform

A full-stack E-Commerce Platform built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). The application provides a complete shopping experience with user authentication, product management, shopping cart functionality, order processing, and simulated payment handling.

The project follows a structured client-server architecture with a RESTful API backend and a responsive React frontend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Payment Simulation](#payment-simulation)
- [Contributing](#contributing)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

This project is a full-stack e-commerce application designed to demonstrate the development of a modern online shopping platform.

Customers can browse products, view product details, manage their shopping carts, provide shipping information, and place orders.

Administrators have access to product management functionality, allowing them to create, update, and manage products through a dedicated admin interface.

The backend provides RESTful APIs for authentication, product management, cart operations, order creation, and payment processing.

The application also incorporates server-side validation, role-based authorization, image uploads, centralized error handling, and automated backend testing.

## Features

### Authentication and Authorization

- User registration and login.
- Secure password handling.
- Authentication using protected routes.
- Cookie-based authentication.
- User profile management.
- Password update functionality.
- Role-based access control.
- Separate administrative functionality.

### Product Management

- Browse available products.
- View individual product details.
- Product filtering and sorting.
- Pagination.
- Discounted pricing.
- Product image uploads.
- Multiple product images.
- Product image removal.
- Admin-only product creation, updating, and deletion.
- Soft deletion of products.

### Shopping Cart

- Add products to the cart.
- Update product quantities.
- Remove individual products.
- Clear the entire cart.
- Automatically calculate item subtotals.
- Calculate the overall cart total.
- Display cart item count.
- Validate available product stock.

### Checkout and Order Management

- Shipping address collection.
- Shipping information validation.
- Order creation from cart contents.
- Server-side price calculation.
- Order item snapshots.
- Order total calculation.
- Order status tracking.
- Payment status tracking.
- Product stock deduction after successful simulated payment.
- Cart clearing after successful payment.

### Payment Processing

- Simulated payment processing.
- Successful and failed payment scenarios.
- Payment status updates.
- Failed payment retry support.
- MongoDB transaction-based updates for payment, inventory, and cart operations.

**Note:** The current implementation uses simulated payments for demonstration purposes. It does not process actual financial transactions through a payment gateway.

### Security and Validation

- Protected API endpoints.
- Role-based authorization.
- Request validation using Joi.
- Password protection.
- HTTP security headers using Helmet.
- Cross-Origin Resource Sharing (CORS) configuration.
- Centralized error handling.
- File upload restrictions.
- Environment-based configuration.

---

## Technology Stack

The project uses the following technologies and libraries.

### Frontend

| Technology / Package | Purpose |
|---|---|
| React.js | Component-based user interface |
| Vite | Frontend development server and build tool |
| Material UI (MUI) | UI components and styling |
| React Router DOM | Client-side routing |
| Axios | HTTP requests to backend APIs |
| React Hook Form | Form management |
| JavaScript (ES6+) | Application logic |
| CSS | Additional styling |

### Backend

| Technology / Package | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend web framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| Joi | Request data validation |
| dotenv | Environment variable management |
| bcrypt / bcryptjs | Password hashing, depending on the configured package |
| JSON Web Token (JWT) | Authentication token handling |
| cookie-parser | Cookie parsing middleware |
| cors | Cross-origin resource sharing |
| Helmet | HTTP security headers |
| Multer | File upload handling |
| Cloudinary | Cloud-based image storage |
| Nodemon | Automatic server restarting during development |

### Testing

| Technology / Package | Purpose |
|---|---|
| Jest | Backend automated testing |
| Supertest | HTTP endpoint testing |

The exact dependency versions are maintained in the respective `package.json` files.

---

## Application Architecture

The application follows a client-server architecture.

```text
                  CLIENT
             React + Vite
                  |
                  |
             Axios Requests
                  |
                  v
             BACKEND API
          Node.js + Express
                  |
        -----------------------
        |          |          |
        v          v          v
    Routes    Middleware  Controllers
        |          |          |
        -----------------------
                  |
                  v
              Services
                  |
        -----------------------
        |          |          |
        v          v          v
     MongoDB   Cloudinary   Validation
     Atlas                 (Joi)
```

### Architectural Responsibilities

**Frontend**

- Renders the user interface.
- Manages application state.
- Handles client-side routing.
- Communicates with backend APIs.
- Displays loading, success, and error states.

**Backend**

- Handles incoming HTTP requests.
- Performs authentication and authorization.
- Validates incoming data.
- Executes business logic through service modules.
- Interacts with MongoDB.
- Manages image uploads through Cloudinary.
- Returns structured API responses.

**Database**

- Stores user information.
- Stores product information.
- Maintains shopping cart data.
- Stores orders and payment statuses.

---

## Project Structure

The project is organized into separate frontend and backend applications.

```text
ecommerce-platform/
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── main.jsx
│   │
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

*Note: This structure represents the main application directories. Additional files may exist in individual folders.*

---

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas account
- [Cloudinary](https://cloudinary.com/) account for product image storage

### 1. Clone the Repository

```bash
git clone https://github.com/Abhinav-Kosta/ecommerce_platform.git
```

Navigate to the project directory:

```bash
cd ecommerce_platform
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory using `.env.example` as a reference.

Configure the required environment variables according to your local setup.

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using the frontend `.env.example` file as a reference.

Configure the backend API URL.

---

## Environment Variables

The application uses environment variables to store configuration and sensitive information.

### Backend

The backend environment configuration includes:

- MongoDB connection string.
- Server port.
- Authentication secrets.
- Cloudinary cloud name.
- Cloudinary API key.
- Cloudinary API secret.
- CORS origin configuration.
- Other application-specific settings.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

**Important:** These are illustrative variable names. Refer to the actual `.env.example` files in the repository for the exact environment variable names expected by the application.

Never commit actual credentials, API keys, database passwords, or authentication secrets to GitHub.

---

## Running the Application

### Start the Backend

From the `backend` directory:

```bash
npm run dev
```

The backend should start on the configured port, typically:

```text
http://localhost:5000
```

### Start the Frontend

From the `frontend` directory:

```bash
npm run dev
```

Vite will provide a local development URL, typically:

```text
http://localhost:5173
```

Open the frontend URL in your browser to access the application.

---

## API Documentation

The backend exposes RESTful API endpoints under the following base URL:

```text
/api/v1
```

### Authentication Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Authenticate a user |
| POST | `/api/v1/auth/logout` | Log out |
| GET | `/api/v1/auth/me` | Get authenticated user |
| PATCH | `/api/v1/auth/update-password` | Update password |

### Product Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/products` | Get products with filtering and pagination |
| GET | `/api/v1/products/:id` | Get product details |
| POST | `/api/v1/products` | Create a product (Admin) |
| PATCH | `/api/v1/products/:id` | Update a product (Admin) |
| DELETE | `/api/v1/products/:id` | Soft-delete a product (Admin) |

### Cart Routes

All cart routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/cart` | Get current user's cart |
| POST | `/api/v1/cart` | Add a product to cart |
| PATCH | `/api/v1/cart/:productId` | Update cart item quantity |
| DELETE | `/api/v1/cart/:productId` | Remove an item from cart |
| DELETE | `/api/v1/cart` | Clear the cart |

### Order Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/orders` | Create a new order |

### Payment Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/payments` | Process a simulated payment |

Protected routes require valid authentication. Administrative product operations additionally require administrator privileges.

---

## Testing

The backend includes automated tests using Jest and Supertest.

Navigate to the backend directory:

```bash
cd backend
```

Run the test suite using the configured test script:

```bash
npm test
```

Automated tests help verify application functionality, business logic, and API behavior.

---

## Payment Simulation

The application currently supports simulated payment processing.

Customers can select either:

- Simulate Successful Payment
- Simulate Failed Payment

On successful simulated payment:

1. Product stock is validated.
2. Purchased quantities are deducted.
3. The shopping cart is cleared.
4. Payment status is updated.
5. Order status is moved to processing.

The payment workflow is designed to use MongoDB transactions to maintain database consistency.

**This is a demonstration payment system and is not connected to a real payment gateway.**

---

## Contributing

Contributions, suggestions, and improvements are welcome!

If you would like to contribute:

### 1. Fork the Repository

Fork this repository to your GitHub account.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce_platform.git
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes

Implement your feature, fix bugs, or improve existing functionality.

Please follow the existing project structure and coding conventions.

### 5. Commit Your Changes

```bash
git add .
git commit -m "Add: describe your changes"
```

### 6. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

Open a Pull Request against the original repository's `main` branch.

Please include a clear description of your changes and relevant testing information.

---

## Future Improvements

Potential enhancements for future versions include:

- Integration with a real payment gateway such as Razorpay or Stripe.
- Customer order history.
- Detailed order tracking.
- Administrative order management.
- Product reviews and ratings.
- Wishlist functionality.
- Email notifications.
- Advanced product search.
- Analytics dashboard.
- Improved automated test coverage.

---

## License

This project is available for educational and portfolio purposes.

If you intend to permit reuse, modification, and redistribution, consider adding an [MIT License](https://choosealicense.com/licenses/mit/) to the repository.

---

## Author

**Abhinav Kosta**

GitHub: [@Abhinav-Kosta](https://github.com/Abhinav-Kosta)

---

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub!