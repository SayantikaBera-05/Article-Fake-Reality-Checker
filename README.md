# Verifi* — Multimodal AI Fact-Checking Platform
> **Where you verify realities.**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Verifi*** is a sophisticated, full-stack platform designed to combat the global epidemic of misinformation. Built on a modern microservices architecture, Verifi processes multimodal inputs—text, URLs, and images—to extract underlying claims, crawl the live web for evidence, and evaluate veracity using advanced AI models like **Google Gemini 1.5 Pro**.

---

## 🏗 System Architecture

Verifi is engineered for scale and performance, divided into three core pillars:

1.  **Frontend (The Command Center)**: A cinematic, dark-themed Single Page Application (SPA) built with React. It provides a premium user experience with smooth animations (Framer Motion) and responsive layouts (Tailwind CSS).
2.  **API Gateway (The Orchestrator)**: A robust Node.js/Express service that manages the "brain" of the platform—handling user authentication (JWT & Google OAuth2), history persistence in MongoDB, transactional emails, and secure request routing.
3.  **AI Engine (The Analyst)**: A high-performance Python/FastAPI microservice dedicated to computational intelligence. It handles complex claim extraction, automated web research, and deep semantic evaluation via the Gemini 1.5 API.

---

## 🛠 Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | React 18+, Vite, TypeScript, Tailwind CSS, Framer Motion, Axios |
| **API Gateway** | Node.js, Express, MongoDB (Mongoose), Passport.js, JWT, Nodemailer |
| **AI Engine** | Python 3.10+, FastAPI, Uvicorn, Google Generative AI (Gemini), BeautifulSoup4 |

---

## 📂 Repository Structure

```text
Article-Fake-Reality-Checker/
├── frontend/               # React SPA (Vite + TS)
├── backend/
│   ├── node-gateway/        # Node.js Express Service (Auth & Data)
│   └── python-engine/          # Python FastAPI Service (ML & Research)
└── README.md               # Project Master Documentation
```

---

## 🚀 Global Setup & Installation

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+)
- **MongoDB** (Local or Atlas Instance)
- **Google Cloud API Key** (with Gemini 1.5 Pro enabled)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Joy-S-07/Article-Fake-Reality-Checker.git
cd Article-Fake-Reality-Checker
```

### Step 2: Setup AI Engine
```bash
cd backend/ai-engine
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Step 3: Setup API Gateway
```bash
cd ../api-gateway
npm install
# Create .env based on the template below
npm run dev
```

### Step 4: Setup Frontend
```bash
cd ../../frontend
npm install
# Create .env based on the template below
npm run dev
```

---

## 🔑 Environment Variables Summary

You will need to configure `.env` files in each service directory. Key variables include:

- **Frontend**: `VITE_API_BASE_URL` (pointing to the Gateway).
- **API Gateway**: `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `SMTP_USER`, `PYTHON_ENGINE_URL`.
- **AI Engine**: `MODEL_API_KEY` (Gemini), `PORT`.

---

## ✨ Features

- 🌙 **Cinematic UI**: Premium dark/light mode with fluid interactions.
- 🔐 **Secure Auth**: Multi-layered authentication via JWT and Google OAuth2.
- 📸 **Multimodal Input**: Fact-check via direct text, article links, or image uploads.
- ⚡ **Real-time Analysis**: Instantaneous claim extraction and veracity scoring.
- 💾 **Evidence Repository**: Save verified reports to your personal dashboard.
- 📊 **Analytics**: Visualize your verification history and global trends.

---

## 👥 Contributors

Verifi is built with 🧠 and ❤️ by:

- **Joy** - [Profile](https://github.com/Joy-S-07)
- **Shubhadip** - [Profile](https://github.com/Shubhadip-Codes)
- **Aranya** - [Profile](https://github.com/AKr3106)
- **Sayantika** - [Profile](https://github.com/SayantikaBera-05)

---

© 2026 Verifi Project. All rights reserved.
