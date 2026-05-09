# 🎨 Frontend Architecture — Verifi

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

The Verifi frontend is a premium, cinematic Single Page Application (SPA) designed to provide a seamless and visually stunning user experience. Built with **React** and **Vite**, it heavily utilizes **Tailwind CSS** for responsive, glassmorphic styling and **Framer Motion** for fluid micro-interactions.

---

## 🏛 Core Architecture

### 1. Component Design
The UI is built using a functional, modular component approach. 
- **Glassmorphism**: Core components utilize custom `.liquid-glass` classes defined in `index.css` to create a translucent, premium feel that adapts to both Dark and Light modes.
- **Animations**: Page transitions and loading states (like the `FraudDetectionLoading` component) use sophisticated Framer Motion variants to keep the user engaged during complex AI tasks.

### 2. State Management & Authentication
- **AuthContext**: A global React Context (`AuthContext.tsx`) manages the user's session state. It automatically validates JWT tokens stored in `localStorage` against the Node.js API Gateway on initial load, dictating whether "Login" or "My Account" is shown in the navigation.

### 3. Real-Time Streaming Integration
To handle the asynchronous, long-running nature of the Agentic AI Pipeline:
- The frontend utilizes **Server-Sent Events (SSE)** via the Fetch API (`API.verifyContentStream`).
- As the Python engine processes data (Scouting, Reading, Analyzing), it streams JSON chunks back to the client.
- The UI dynamically updates the loading narrative (e.g., "Agents are scouring the web...") and displays the final Veracity Score immediately upon completion.

---

## 🗺 Application Routing

Handled by `react-router-dom`:
- `/` - Landing Page (Hero, Features)
- `/verify` - The core application where users input text, URLs, or images.
- `/dashboard` - Private route displaying user verification history fetched from the Node Gateway.
- `/docs` - Comprehensive technical developer documentation.
- `/how-it-works` - Narrative-driven, blog-style explanation of the AI pipeline.

---

## 🚀 Running the Service

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with `VITE_API_URL` pointing to your node gateway.
4. Start the development server:
   ```bash
   npm run dev
   ```
The application will be available at `http://localhost:5173`.
