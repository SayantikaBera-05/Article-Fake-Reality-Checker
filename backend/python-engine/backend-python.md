# 🧠 Python Agentic Engine — Verifi

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-1F1F1F?style=for-the-badge&logo=openrouter&logoColor=white)

The **Python Agentic Engine** is a high-performance, asynchronous microservice built with **FastAPI**. It contains the core intelligence of the Verifi platform, executing the complex Retrieval-Augmented Generation (RAG) and Agentic pipelines required for real-time fact-checking.

---

## 🏛 Core Architecture: The Multi-Agent Pipeline

The engine utilizes three specialized "agents" working in parallel and sequence to evaluate reality:

### 1. The Scout (`scout.py`)
- **Role**: Intelligence Gathering.
- **Technology**: Integrates with the **Serper.dev API**.
- **Action**: Takes the user's claim and executes advanced Google search queries, returning a curated list of top-ranking, highly relevant URLs and snippets to form the basis of the investigation.

### 2. The Reader (`reader.py`)
- **Role**: Deep Extraction.
- **Technology**: Utilizes the **Jina AI Reader API**.
- **Action**: Bypasses paywalls and captures the raw markdown/text content from the URLs provided by the Scout, ensuring the Analyst has the full context, not just headlines.

### 3. The Analyst (`analyst.py`)
- **Role**: The Judge.
- **Technology**: Powered by **OpenRouter API (Llama models)** for intelligent inference.
- **Action**: Receives the claim and the scraped evidence. Evaluates the context, maps contradictions, and generates a structured JSON output containing the Veracity Label (True, False, Misleading, Unverifiable), Confidence Score, and a detailed reasoning summary.

### 4. The Image Analyzer (`image_analyzer.py`)
- **Role**: Visual Forensics.
- **Technology**: Powered by **Sightengine API** and **LLaMA Vision Model**.
- **Action**: Evaluates images for AI generation signatures and extracts context using vision models, providing a detailed analysis of the image's authenticity.

---

## ⚡ Streaming Server-Sent Events (SSE)

Because agentic workflows take time (searching -> scraping -> inferencing), the FastAPI server streams its progress back to the client using **SSE (`StreamingResponse`)**.
- It yields JSON chunks containing `status` updates (e.g., "Scouting the web...") and ultimately the `result`.
- This ensures the frontend UI remains highly responsive and avoids browser timeouts during complex verifications.

---

## 📂 Directory Structure (`backend/python-engine/`)

- `app/main.py` - FastAPI application initialization and routing.
- `app/api/endpoints/` - Route definitions (e.g., `/api/verify`).
- `app/services/` - The Agent Logic (`scout.py`, `reader.py`, `analyst.py`).
- `app/models/` - Pydantic models for strict type validation of inputs and JSON outputs.
- `run.py` - Uvicorn server entry point.

---

## 🚀 Running the Service

1. Navigate to the python-engine directory:
   ```bash
   cd backend/python-engine
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file with `OPENROUTER_API_KEY`, `SERPER_API_KEY`, and Sightengine keys (if checking images).
5. Start the FastAPI server:
   ```bash
   python run.py
   ```
The engine will be available at `http://localhost:8000` with Swagger UI at `/docs`.
