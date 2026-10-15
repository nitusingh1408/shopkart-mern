# 🛍️ ShopKart — MERN Stack E-Commerce Application

A full-stack e-commerce web application built using the **MERN stack (MongoDB, Express.js, React.js, and Node.js)**. ShopKart provides a platform for users to browse products, manage their shopping cart and wishlist, authenticate securely, and complete checkout using Razorpay Test Mode.

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Payment Integration](#-payment-integration)
- [Security](#-security)
- [Running the Application](#-running-the-application)
- [Deployment](#-deployment)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

## 📖 About the Project

ShopKart is a full-stack online shopping application developed to practice and demonstrate web development using the MERN stack.

The project includes a React-based frontend, a REST API built with Express.js and Node.js, and MongoDB for data persistence. It is organized into separate frontend and backend applications.

The application is designed to demonstrate key e-commerce workflows, including customer authentication, product browsing, wishlist and cart management, checkout, and order management.

## ✨ Features

### User Authentication
- Customer registration and login.
- Secure password hashing.
- JWT-based authentication using cookies.
- Protected routes and authenticated API endpoints.
- Customer profile and logout functionality.

### Product Management
- Product listing and product details.
- Product search and category filtering, where implemented.
- Product information such as name, description, price, image, and stock.

### Wishlist
- Add products to a wishlist.
- View saved products.
- Manage wishlist items.

### Shopping Cart
- Add products to the cart.
- View cart items and quantities.
- Update item quantities.
- Remove products from the cart.
- Calculate the cart subtotal.

### Checkout and Orders
- Shipping address form.
- Server-side price and stock validation.
- Razorpay Test Mode payment integration.
- Payment signature verification.
- Order creation and persistence.
- Order history and individual order details.
- Cart clearing after successful payment verification.

*Note: Keep only the features that are implemented in your current code.*

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| Express.js | Backend API framework |
| React.js | Frontend user interface |
| Node.js | JavaScript runtime |
| Vite | Frontend development and build tool |
| JavaScript | Application programming |
| Axios | HTTP requests between frontend and backend |
| React Router | Frontend navigation |
| bcrypt | Password hashing |
| JSON Web Token (JWT) | Authentication |
| Razorpay | Test payment integration |

## 📂 Project Structure

```text
mern-project/
├── shopkart-backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── shopkart-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

The structure above is illustrative. The actual directories and filenames may differ depending on the implementation.

## 📋 Prerequisites

Before running the application, install or prepare:

- [Node.js and npm](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB server
- [Git](https://git-scm.com/)
- [Razorpay account](https://razorpay.com/) for test payments, if checkout integration is enabled

## ⚙️ Installation and Setup

### 1. Clone the repository

Replace `YOUR_USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR_USERNAME/shopkart-mern.git
cd shopkart-mern
```

### 2. Set up the backend

Open a terminal and run:

```bash
cd shopkart-backend
npm install
```

Create a `.env` file inside the `shopkart-backend` directory and configure the required environment variables.

### 3. Set up the frontend

Open another terminal from the project root:

```bash
cd shopkart-frontend
npm install
```

The frontend uses Vite to run the React application locally.

## 🔐 Environment Variables

### Backend configuration

Create `shopkart-backend/.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Replace the placeholder values with your own configuration. Keep secrets private and never commit your `.env` file to GitHub.

### Frontend configuration

If your Axios configuration supports environment-based API URLs, create `shopkart-frontend/.env` for local development:

```env
VITE_API_URL=http://localhost:5001
```

The frontend API configuration should use this variable if applicable.

## 🔌 API Endpoints

The following table describes the expected API structure. Verify the actual route names and HTTP methods in your backend before using this list as a definitive API reference.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers/register` | Register a customer |
| POST | `/customers/login` | Log in a customer |
| GET | `/customers/me` | Get the current customer |
| POST | `/customers/logout` | Log out a customer |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | Retrieve products |
| GET | `/products/:id` | Retrieve a product by ID |

### Wishlist

| Method | Endpoint | Description |
|---|---|---|
| GET | `/wishlist` | Retrieve wishlist items |
| POST | `/wishlist/:productId` | Add a product to the wishlist |
| DELETE | `/wishlist/:productId` | Remove a product from the wishlist |

*Confirm the actual wishlist routes in your code.*

### Shopping Cart

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Retrieve cart items |
| POST | `/cart/:productId` | Add a product to the cart |
| PATCH | `/cart/:productId` | Update a cart item's quantity |
| DELETE | `/cart/:productId` | Remove a cart item |

### Orders and Payments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/create-payment-order` | Create a payment order |
| POST | `/orders/verify-payment` | Verify payment details |
| GET | `/orders` | Retrieve the customer's orders |
| GET | `/orders/:id` | Retrieve a specific customer's order |

Protected endpoints require a valid authenticated session or cookie, according to the backend implementation.

## 💳 Payment Integration

ShopKart can integrate Razorpay for checkout and payment testing.

The payment workflow is designed to:

1. Validate the shipping address.
2. Read the authenticated customer's cart.
3. Validate current product prices and available stock on the server.
4. Create an order using the server-calculated total.
5. Open the Razorpay Checkout interface.
6. Verify the payment signature on the backend.
7. Confirm the payment and persist the order.
8. Clear the cart only after successful payment verification.

**Important:** Use Razorpay Test Mode for development. Never expose the Razorpay Key Secret in frontend code or public repositories.

## 🔒 Security

The project uses or is designed to support the following security practices:

- Environment variables for sensitive configuration.
- Password hashing instead of storing plain-text passwords.
- Authentication for protected routes.
- Server-side price and stock validation.
- Payment signature verification.
- Ownership checks when retrieving orders.
- Credential-aware CORS configuration.

Production deployments should also use HTTPS, secure cookie settings, appropriate input validation, and robust error handling.

## ▶️ Running the Application

### Start the backend

From the backend directory:

```bash
node index.js
```

The backend should start on the configured port, such as `5001`.

### Start the frontend

From the frontend directory:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal, commonly:

```text
http://localhost:5173
```

Open that URL in your browser.

Ensure MongoDB is accessible and the frontend API URL and backend CORS configuration match.

## 🚀 Deployment

The application can be deployed using services such as Render and MongoDB Atlas.

A typical deployment setup is:

- **Frontend:** Render Static Site.
- **Backend:** Render Web Service.
- **Database:** MongoDB Atlas.
- **Payment testing:** Razorpay Test Mode.

Configure the production environment variables in the hosting dashboard. Set the frontend API URL to the deployed backend URL and configure the backend to allow requests from the deployed frontend origin.

For React Router applications, configure the frontend host to redirect unknown application paths to `index.html`.

Useful documentation:

- [Render Web Services](https://render.com/docs/web-services)
- [Render Static Sites](https://render.com/docs/static-sites)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Razorpay Documentation](https://razorpay.com/docs/)

## 🔮 Future Improvements

Potential enhancements include:

- Product reviews and ratings.
- Improved mobile responsiveness.
- Pagination and more advanced filtering.
- Better loading, error, and empty states.
- Automated backend and frontend tests.
- Order tracking and administrative product management.

## 👩‍💻 Author

**Your Name**

- GitHub: [YOUR_USERNAME](https://github.com/YOUR_USERNAME)

Replace the placeholders with your details.

## 📄 License

No license has been specified for this project. Add an appropriate license if you intend to permit others to reuse or distribute the code.
