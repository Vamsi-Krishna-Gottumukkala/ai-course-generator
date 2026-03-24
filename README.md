# AI Course Generator

This project is an AI-powered course generator featuring a modern frontend (React + Vite) and a robust backend (Node.js + Express).

## Requirements

- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm (comes with Node.js)

## Setup & Installation

Follow these steps to get the application running locally. You will need to start both the backend server and the frontend development server in separate terminal windows.

---

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install the backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # YouTube Data API Key
   YOUTUBE_API_KEY=your_youtube_api_key_here
   
   # Application Port
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   *The backend should default to running on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal from the root directory and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend` directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend should typically be accessible in your browser at `http://localhost:5173`.*

## Architecture

- **Frontend:** Built with React, Vite, React Router, Supabase Client, and styled with Tailwind/Vanilla CSS.
- **Backend:** Powered by Express, utilizing Google's Gemini AI, and protected with basic JWT authentication mechanisms.
