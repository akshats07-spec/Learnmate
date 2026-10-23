import sys
import uvicorn
from config import HOST, PORT

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

if __name__ == "__main__":
    print(f"Starting LearnMate Backend on http://{HOST}:{PORT}")
    print(f"Interactive Swagger Docs available at http://localhost:{PORT}/docs")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
