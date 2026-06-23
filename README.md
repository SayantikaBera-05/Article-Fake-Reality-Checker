# Verifi* — Multimodal AI Fact-Checking Platform
> **Where you verify realities.**

🎥 **[Watch Live Demo Video](https://drive.google.com/file/d/16nz3pzpogpMFHW1nkNN_XPQNLfgfAbxa/view?usp=drive_link)**

<img width="1904" height="980" alt="Recording 2026-05-12 195525" src="https://github.com/user-attachments/assets/f38752f9-1b7c-409d-8969-6dfc4e7947f5" />


![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-1F1F1F?style=for-the-badge&logo=openrouter&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Serper.dev](https://img.shields.io/badge/Serper.dev-000000?style=for-the-badge&logo=google&logoColor=white)
![Jina AI](https://img.shields.io/badge/Jina_AI-008585?style=for-the-badge&logoColor=white)
=======
<br>


**Verifi*** is a sophisticated, full-stack platform designed to combat the global epidemic of misinformation. Built on a modern microservices architecture, Verifi processes multimodal inputs—text, URLs, and images—using an **Agentic AI Pipeline** powered by **OpenRouter (Llama models)**, **Serper.dev**, **Jina AI**, and **Sightengine** to extract underlying claims, crawl the live web for evidence, and evaluate veracity.

---

## 🏗 System Architecture

Verifi is engineered for scale and performance, divided into three core pillars:

1.  **Frontend (The Command Center)**: A cinematic, premium Single Page Application (SPA) built with React. It provides an exceptional user experience with smooth animations (Framer Motion) and responsive, glassmorphic layouts (Tailwind CSS).
2.  **API Gateway (The Orchestrator)**: A robust Node.js/Express service that manages the "brain" of the platform—handling user authentication (JWT & Google OAuth2), history persistence in MongoDB Atlas, and secure request routing to the Python microservice.
3.  **Agentic Python Engine (The Analyst)**: A high-performance Python/FastAPI microservice dedicated to computational intelligence. It employs an agentic pipeline:
    *   **The Scout**: Uses Serper.dev to search the live web for context.
    *   **The Reader**: Uses Jina AI Reader to scrape exact content from web pages.
    *   **The Image Analyzer**: Uses Sightengine API and Vision models to authenticate images.
    *   **The Analyst**: Uses OpenRouter (Llama models) to process evidence and verify the claim in real-time.

---

## 🛠 Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | React 18+, Vite, TypeScript, Tailwind CSS, Framer Motion, Axios |
| **API Gateway** | Node.js, Express, MongoDB (Mongoose), Passport.js, JWT, Nodemailer |
| **Agentic Engine** | Python 3.10+, FastAPI, Uvicorn, OpenRouter API (Llama models), Serper API, Jina AI, Sightengine API |

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
- `OPENROUTER_API_KEY` (Required for Llama Inference)
- `SERPER_API_KEY` (Required for live web search)
- `SIGHTENGINE_API_USER` & `SIGHTENGINE_API_SECRET` (Required for AI image detection)
- `ALLOWED_ORIGINS` (e.g., `http://localhost:5000`)

---

## ✨ Features

- 🌙 **Cinematic UI**: Premium dark/light mode with fluid interactions.
- 🔐 **Secure Auth**: Multi-layered authentication via JWT and Google OAuth2.
- 🤖 **Agentic Fact-Checking**: A multi-agent AI pipeline using OpenRouter, Serper, Sightengine, and Jina AI for high-accuracy verification.
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
