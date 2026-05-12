# Verifi* — Multimodal AI Fact-Checking Platform
> **Where you verify realities.**

<img width="1904" height="975" alt="image" src="https://github.com/user-attachments/assets/905efc38-c9ee-40d7-885b-8c2ef162bafc" />

<br>

<p align="center">
  <img src="./assets/logos/react.svg" alt="React" width="40" height="40" /> &nbsp;
  <img src="./assets/logos/nodejs.svg" alt="Node.js" width="40" height="40" /> &nbsp;
  <img src="./assets/logos/python.svg" alt="Python" width="40" height="40" /> &nbsp;
  <img src="./assets/logos/mongodb.svg" alt="MongoDB" width="40" height="40" /> &nbsp;
  <img src="./assets/logos/tailwindcss.svg" alt="Tailwind CSS" width="40" height="40" /> &nbsp;
  <img src="./assets/logos/openrouter.svg" alt="OpenRouter" width="40" height="40" />
</p>

**Verifi*** is a sophisticated, full-stack platform designed to combat the global epidemic of misinformation. Built on a modern microservices architecture, Verifi processes multimodal inputs—text, URLs, and images—using an **Agentic AI Pipeline** powered by **OpenRouter (Llama 3)**, **Serper.dev**, and **Jina AI** to extract underlying claims, crawl the live web for evidence, and evaluate veracity.

---

## 🏗 System Architecture

Verifi is engineered for scale and performance, divided into three core pillars:

1.  **Frontend (The Command Center)**: A cinematic, premium Single Page Application (SPA) built with React. It provides an exceptional user experience with smooth animations (Framer Motion) and responsive, glassmorphic layouts (Tailwind CSS).
2.  **API Gateway (The Orchestrator)**: A robust Node.js/Express service that manages the "brain" of the platform—handling user authentication (JWT & Google OAuth2), history persistence in MongoDB Atlas, and secure request routing to the Python microservice.
3.  **Agentic Python Engine (The Analyst)**: A high-performance Python/FastAPI microservice dedicated to computational intelligence. It employs an agentic pipeline:
    *   **The Scout**: Uses Serper.dev to search the live web for context.
    *   **The Reader**: Uses Jina AI Reader to scrape exact content from web pages.
    *   **The Analyst**: Uses OpenRouter (Llama 3.1 8B Instant) to process evidence and verify the claim in real-time.

---

## 🛠 Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | React 18+, Vite, TypeScript, Tailwind CSS, Framer Motion, Axios |
| **API Gateway** | Node.js, Express, MongoDB (Mongoose), Passport.js, JWT, Nodemailer |
| **Agentic Engine** | Python 3.10+, FastAPI, Uvicorn, OpenRouter API (Llama 3), Serper API, Jina AI |

---

## 📂 Repository Structure

```text
Article-Fake-Reality-Checker/
├── frontend/                 # React SPA (Vite + TS)
├── backend/
│   ├── node-gateway/         # Node.js Express Service (Auth, History, DB)
│   └── python-engine/        # Python FastAPI Service (Agentic ML Pipeline)
└── README.md                 # Project Master Documentation
```

---

## 🚀 Global Setup & Installation

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+)
- **MongoDB** (Local or Atlas Instance)
- **OpenRouter API Key**
- **Serper.dev API Key**

### Step 1: Clone the Repository
```bash
git clone https://github.com/Joy-S-07/Article-Fake-Reality-Checker.git
cd Article-Fake-Reality-Checker
```

### Step 2: Setup Python Agentic Engine
```bash
cd backend/python-engine
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
# Create .env based on the template below
python run.py
```

### Step 3: Setup Node.js API Gateway
```bash
cd backend/node-gateway
npm install
# Create .env based on the template below
npm run dev
```

### Step 4: Setup Frontend
```bash
cd frontend
npm install
# Create .env based on the template below
npm run dev
```

---

## 🔑 Environment Variables Summary

You will need to configure `.env` files in each service directory. Key variables include:

### `frontend/.env`
- `VITE_API_URL` (pointing to the Node Gateway, e.g., `http://localhost:5000/api/v1`)

### `backend/node-gateway/.env`
- `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `SMTP_USER`
- `PYTHON_ENGINE_URL` (pointing to the FastAPI server, e.g., `http://127.0.0.1:8000`)
- `CLIENT_URL` (pointing to the Frontend, e.g., `http://localhost:5173`)

### `backend/python-engine/.env`
- `PORT` (e.g., 8000)
- `OPENROUTER_API_KEY` (Required for Llama 3 Inference)
- `SERPER_API_KEY` (Required for live web search)
-  `JINA AI` (Required for live check)
- `ALLOWED_ORIGINS` (e.g., `http://localhost:5000`)

---

## ✨ Features

- 🌙 **Cinematic UI**: Premium dark/light mode with fluid interactions.
- 🔐 **Secure Auth**: Multi-layered authentication via JWT and Google OAuth2.
- 🤖 **Agentic Fact-Checking**: A multi-agent AI pipeline using OpenRouter, Serper, and Jina AI for high-accuracy verification.
- ⚡ **Real-time Streaming**: Instantaneous claim extraction and veracity scoring streamed to the client.
- 💾 **Evidence Repository**: Save verified reports to your personal dashboard history.
- 📚 **Developer Docs**: Built-in comprehensive documentation and architectural guides.

---

## 👥 Contributors

Verifi is built with 🧠 and ❤️ by:

- **Joy** - [Profile](https://github.com/Joy-S-07)
- **Shubhadip** - [Profile](https://github.com/Shubhadip-Codes)
- **Aranya** - [Profile](https://github.com/AKr3106)
- **Sayantika** - [Profile](https://github.com/SayantikaBera-05)

---

© 2026 Verifi Project. All rights reserved.
