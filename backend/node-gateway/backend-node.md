# ⚙️ Node.js API Gateway — Verifi

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

The **Node.js Express API Gateway** serves as the central nervous system for Verifi. It handles all stateful operations, database management, user security, and coordinates requests between the Frontend and the Python Agentic Engine.

---

## 🏛 Core Architecture

### 1. Authentication & Security
- **JWT Implementation**: Stateless authentication using robust JSON Web Tokens.
- **Middleware**: Custom `authMiddleware` intercepts requests, validates the JWT, and attaches the `userId` to the request object.
- **CORS & Rate Limiting**: Ensures that only the Verifi frontend can communicate with the backend, protecting against brute-force attacks.

### 2. Database Management (MongoDB Atlas)
The gateway communicates with a cloud-hosted MongoDB Atlas instance (via Mongoose) using forced IPv4 resolution to guarantee stability.
- **User Model**: Stores credentials, profile data, and authentication state.
- **History Model**: Stores the results of every verification check (Claim, Veracity, Confidence Score, Date) linked to specific `userId`s for retrieval on the frontend Dashboard.

### 3. Routing & Orchestration
The Node server acts as a reverse proxy for specific high-intensity operations:
- When a user requests verification, the Node Gateway can either forward the request to the Python Engine or allow the Frontend to communicate with the Python Engine directly for streaming, while Node handles saving the *result* to the database.

---

## 📂 Directory Structure (`backend/node-gateway/`)

- `controllers/` - Logic for auth, history, and users.
- `models/` - Mongoose schemas (`User.js`, `History.js`).
- `routes/` - Express route definitions.
- `middleware/` - JWT verification and error handling.
- `config/` - Database connection and environment setup.

---

## 🚀 Running the Service

1. Navigate to the node-gateway directory:
   ```bash
   cd backend/node-gateway
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with MongoDB credentials, JWT secret, and API routing URLs.
4. Start the server:
   ```bash
   npm run dev
   ```
The gateway will start on `http://localhost:5000` (or your configured `PORT`).
