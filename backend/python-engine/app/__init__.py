"""
App package — Fraud Detection Engine.

Exposes the FastAPI application factory and core configuration.
"""

import os
import sys
import builtins
import logging

# ─── Fix Windows console output in uvicorn worker ──────────
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
os.environ.setdefault("PYTHONUNBUFFERED", "1")

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace", write_through=True)
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace", write_through=True)

# ─── Force flush=True + stderr on ALL print() calls ────────
# On Windows with uvicorn --reload, the worker subprocess stdout is
# not connected to the terminal — only stderr reliably appears.
# The sentinel prevents re-wrapping on every uvicorn reload.
if not getattr(builtins.print, "_is_flushed_print", False):
    _original_print = builtins.print

    def _flushed_print(*args, **kwargs):
        kwargs.setdefault("flush", True)
        # Only redirect if the caller hasn't explicitly passed file=
        if "file" not in kwargs:
            kwargs["file"] = sys.stderr
        _original_print(*args, **kwargs)

    _flushed_print._is_flushed_print = True  # sentinel
    builtins.print = _flushed_print

# ─── Pipeline Logger ───────────────────────────────────────
pipeline_logger = logging.getLogger("pipeline")
pipeline_logger.setLevel(logging.INFO)
pipeline_logger.propagate = False  # prevent uvicorn root logger from intercepting

if not pipeline_logger.handlers:
    _handler = logging.StreamHandler(sys.stderr)
    _handler.setLevel(logging.INFO)
    _handler.setFormatter(logging.Formatter("%(message)s"))
    pipeline_logger.addHandler(_handler)