# AI Course Generator

This project is an AI-powered course generator featuring a modern frontend (React + Vite), a robust primary backend (Node.js + Express), and a specialized machine learning backend (Python + FastAPI).

## Requirements

- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm (comes with Node.js)
- [Python](https://www.python.org/) 3.9+

## Setup & Installation

Follow these steps to get the application running locally. You will need to start the primary Node backend, the Python ML backend, and the frontend development server in separate terminal windows.

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

---

### 3. ML Backend Setup

1. Open a new terminal from the root directory and navigate to the `ml-backend` folder:
   ```bash
   cd ml-backend
   ```

2. Create and activate a Python virtual environment:
   - **On Windows:**
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **On macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the ML backend server:
   ```bash
   uvicorn main:app --reload
   ```
   *(The ML backend should default to running on `http://127.0.0.1:8000`)*

## Architecture

- **Frontend:** Built with React, Vite, React Router, Supabase Client, and styled with Tailwind/Vanilla CSS.
- **Primary Backend (Node):** Powered by Express for primary API routes and authentication.
- **ML Backend (Python):** Built with FastAPI, handling core generation, data collection, and machine learning components.

---

## Building the Standalone Desktop Application (.exe)

For demonstrations and easy access, this project includes a custom Python script (`launcher.py`) that can bundle the entire application startup sequence into a single, clickable Windows executable (`.exe`). This executable will automatically launch the Node server, the Python ML server, and the React frontend, and then open a clean, native desktop window (WebView) pointing to the app.

### Step-by-Step Build Process

1. **Ensure Dependencies are Installed**  
   Make sure you have installed the required global packaging libraries in your environment. Open a terminal in the root directory and run:
   ```bash
   pip install pywebview pyinstaller
   ```

2. **Configure the Launcher Script**  
   Ensure the `launcher.py` file is located in the root directory (`ai-course-generator/launcher.py`). This script is pre-configured to locate the `backend`, `frontend`, and `ml-backend` folders automatically and launch their respective start commands (including forcing the frontend onto port 5174 to avoid conflicts).

3. **Compile the Executable**  
   From the root directory of the project, run the PyInstaller command:
   ```bash
   python -m PyInstaller --onefile --noconsole --name "AI Course Generator" --distpath . launcher.py
   ```
   - `--onefile`: Packages everything into a single `.exe`.
   - `--noconsole`: Hides the black terminal window from appearing in the background.
   - `--name`: Sets the name of the output application.
   - `--distpath .`: Outputs the final executable directly into the root folder instead of a nested `dist` folder.

4. **Launch the Application**  
   Once the build completes successfully, you will find an **`AI Course Generator.exe`** file in the root folder. 
   
   > **Important:** Before double-clicking the `.exe`, ensure that you do not have the frontend, backend, or ML-backend servers running manually in your VS Code terminals, otherwise you will encounter port conflicts. 
   
   Double-click the `.exe` to start the application. When you close the native application window, the launcher will automatically terminate all background server processes safely.
