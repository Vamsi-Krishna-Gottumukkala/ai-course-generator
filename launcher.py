import os
import sys
import subprocess
import time
import webview
import atexit

# Global list to keep track of processes
processes = []

def cleanup():
    print("Shutting down servers...")
    for p in processes:
        try:
            # On Windows, we need to kill the process tree since npm and uvicorn spawn child processes
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(p.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            print(f"Error killing process {p.pid}: {e}")

# Register cleanup on exit
atexit.register(cleanup)

def get_base_path():
    """Get absolute path to executable or script"""
    if getattr(sys, 'frozen', False):
        # We are running as compiled PyInstaller executable
        return os.path.dirname(sys.executable)
    # We are running as a normal python script
    return os.path.dirname(os.path.abspath(__file__))

def start_servers():
    base_path = get_base_path()
    
    # Paths
    backend_dir = os.path.join(base_path, 'backend')
    frontend_dir = os.path.join(base_path, 'frontend')
    ml_backend_dir = os.path.join(base_path, 'ml-backend')
    
    # Log the paths for debugging
    with open(os.path.join(base_path, 'launcher_debug.log'), 'w') as f:
        f.write(f"Base Path: {base_path}\n")
        f.write(f"Backend Dir: {backend_dir} (Exists: {os.path.isdir(backend_dir)})\n")
        f.write(f"Frontend Dir: {frontend_dir} (Exists: {os.path.isdir(frontend_dir)})\n")
        f.write(f"ML Backend Dir: {ml_backend_dir} (Exists: {os.path.isdir(ml_backend_dir)})\n")

    if not os.path.isdir(backend_dir):
        raise NotADirectoryError(f"Backend directory not found at: {backend_dir}. Please make sure the .exe is in the same folder as the backend, frontend, and ml-backend folders.")
        
    # 1. Start Node.js Backend
    print("Starting Node.js Backend...")
    p1 = subprocess.Popen('npm start', cwd=backend_dir, shell=True)
    processes.append(p1)
    
    # 2. Start ML Backend
    print("Starting Python ML Backend...")
    # Use the virtual environment's python directly
    venv_python = os.path.join(ml_backend_dir, 'venv', 'Scripts', 'python.exe')
    if not os.path.exists(venv_python):
        # Fallback to system python if venv not found (unlikely but safe)
        venv_python = 'python'
        
    p2 = subprocess.Popen(f'"{venv_python}" -m uvicorn main:app --port 8000', cwd=ml_backend_dir, shell=True)
    processes.append(p2)
    
    # 3. Start Frontend
    print("Starting React Frontend...")
    p3 = subprocess.Popen('npm run dev -- --port 5174', cwd=frontend_dir, shell=True)
    processes.append(p3)
    
    # Wait a few seconds for servers to initialize
    print("Waiting for servers to initialize...")
    time.sleep(5)

if __name__ == '__main__':
    try:
        # Start the servers
        start_servers()
        
        # Create and start the webview application
        print("Launching application window...")
        window = webview.create_window(
            'AI Course Generator', 
            'http://localhost:5174',
            width=1280,
            height=800,
            min_size=(800, 600)
        )
        
        # Start the webview block
        webview.start()
    except Exception as e:
        import traceback
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        error_msg = f"Failed to start servers:\n{str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        messagebox.showerror("Launcher Error", error_msg)
        
        base_path = get_base_path()
        with open(os.path.join(base_path, 'launcher_error.log'), 'w') as f:
            f.write(error_msg)

    
    # Clean up will be called automatically by atexit when webview closes
