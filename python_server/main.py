"""Convenience entry point so `python main.py` / `uvicorn main:app` work.

The application itself lives in the `app` package (`app.main:app`).
"""

from app.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
