#!/usr/bin/env python3
"""Tiny static server for the Vocence voice-agent demo.

No dependencies — just `python3 serve.py [port]`. Serves index.html and the
demo assets so you can open the page in a browser and test the agent.

    python3 serve.py 8090   ->  http://localhost:8090

For a real deployment you'd serve these static files from any web host /
CDN; this script is only for local testing.
"""
import http.server
import socketserver
import sys
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
ROOT = Path(__file__).resolve().parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def end_headers(self):
        # Don't cache during development so edits show up immediately.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Vocence voice demo → http://localhost:{PORT}  (Ctrl-C to stop)")
        httpd.serve_forever()
