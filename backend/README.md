# Verifi - Backend Microservices

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

The powerful, dual-service backend infrastructure powering the **Verifi** AI fact-checking platform. This architecture leverages a high-concurrency Node.js gateway for user management and an optimized Python engine for specialized AI/ML processing.

---

## 🚀 Overview

Verifi's backend is split into two specialized microservices:
1. **API Gateway (Node.js)**: Handles user authentication (JWT & Google OAuth2), rate limiting, data persistence in MongoDB, and secure routing.
2. **AI Engine (Python)**: A dedicated FastAPI service that performs heavy lifting, including web search via Serper.dev, content extraction via Jina AI, AI-generated image detection via Sightengine, and intelligent claim analysis via OpenRouter (Llama models).

---

## 🛠 Tech Stack

### API Gateway
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Security:** JWT (JSON Web Tokens), Passport.js (Google OAuth2), Helmet, CORS
- **Communication:** Axios (to AI Engine), Nodemailer (Transactional Emails)

### AI Engine
- **Language:** Python 3.10+
- **Framework:** FastAPI
- **Server:** Uvicorn
- **AI/ML:** OpenRouter API (Llama models), Sightengine API (Image Detection)
- **Scraping & Search:** Serper.dev API, Jina AI Reader API

---

## ⚙️ Prerequisites & Setup

### Requirements
- **Node.js** v18 or higher
- **Python** v3.10 or higher
- **MongoDB** instance (Local or Atlas)
- **Google Cloud Console** credentials (for OAuth2)
- **API Keys**: OpenRouter, Serper.dev, Sightengine

### 1. Node.js Gateway Setup
```bash
# Navigate to gateway directory
cd api-gateway

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### 2. Python AI Engine Setup
```bash
# Navigate to engine directory
cd python-engine

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start the engine
uvicorn main:app --reload --port 8000
```

---

## 🔑 Environment Variables

Create a `.env` file in each service directory following these templates:

### API Gateway (`/api-gateway/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
PYTHON_ENGINE_URL=http://localhost:8000
SMTP_USER=your_email@gmail.com
GOOGLE_REFRESH_TOKEN=your_oauth2_refresh_token
```

### AI Engine (`/python-engine/.env`)
```env
PORT=8000
OPENROUTER_API_KEY=your_openrouter_api_key
SERPER_API_KEY=your_serper_api_key
SIGHTENGINE_API_USER=your_sightengine_api_user
SIGHTENGINE_API_SECRET=your_sightengine_api_secret
ALLOWED_ORIGINS=http://localhost:5000
```

---

## 📁 Project Structure

```text
backend/
├── api-gateway/            # Node.js Express Gateway
│   ├── src/
│   │   ├── controllers/    # Request handlers & logic
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express route definitions
│   │   ├── middlewares/    # Auth & Error handling
│   │   ├── config/         # Passport & DB configuration
│   │   └── server.js       # Entry point
│   └── .env
│
└── python-engine/          # Python FastAPI Engine
    ├── app/
    │   ├── api/            # API endpoints
    │   ├── services/       # Agentic ML logic (Scout, Reader, Analyst, Image Analyzer)
    │   ├── models/         # Pydantic data models
    │   └── main.py         # App initialization
    ├── requirements.txt
    └── .env
```

---

## 🔌 Core API Endpoints

### Authentication (Gateway)
- `POST /api/auth/register` - Create a new account.
- `POST /api/auth/login` - Local authentication.
- `GET /api/auth/google` - Initiate Google OAuth2 flow.

### Fact-Checking (Gateway)
- `POST /api/verify/check` - The main entry point for analysis. Validates the request and forwards data to the AI Engine.

### AI Processing (Internal)
- `POST /api/verify` - (Internal) Receives claim data, performs research, and streams an AI-generated verdict back to the client.

---

## 🛡 Security & Error Handling

- **JWT Protection:** All sensitive routes require a valid Bearer token.
- **Centralized Middleware:** Errors are caught and formatted consistently by a global error handler.
- **Rate Limiting:** Prevents abuse of the verification endpoints.
- **Helmet/CORS:** Secure headers and strict origin policies are enforced to protect against common web vulnerabilities.
