#!/usr/bin/env python3
"""
SHADOW CAT Hardened Web Server
Serves static website files with production-grade HTTP security headers:
- Strict Content-Security-Policy (CSP)
- Anti-Clickjacking (X-Frame-Options: DENY)
- Anti-MIME Sniffing (X-Content-Type-Options: nosniff)
- Strict Referrer Policy
- Strict Permissions Policy
"""

import sys
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3333
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SecurityHeadersHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            f404 = os.path.join(DIRECTORY, "404.html")
            if os.path.isfile(f404):
                try:
                    with open(f404, "rb") as f:
                        content = f.read()
                    self.send_response(404, "Not Found")
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Length", str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                    return
                except Exception:
                    pass
        super().send_error(code, message=message, explain=explain)

    def end_headers(self):
        # 1. Content Security Policy
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com https://fonts.gstatic.com https://js.stripe.com; "
            "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com https://fonts.gstatic.com https://js.stripe.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' http://localhost:8000 ws://localhost:8000 https://api.stripe.com; "
            "frame-src 'self' https://js.stripe.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        # 2. Anti-Clickjacking
        self.send_header("X-Frame-Options", "DENY")
        # 3. Anti-MIME Sniffing
        self.send_header("X-Content-Type-Options", "nosniff")
        # 4. Cross-Site Scripting Filter
        self.send_header("X-XSS-Protection", "1; mode=block")
        # 5. Referrer Policy
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        # 6. Permissions Policy
        self.send_header("Permissions-Policy", "geolocation=(), camera=(), microphone=(), payment=(), usb=()")
        # 7. Cross-Origin Protection
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        # 8. Cache Control
        if self.path.endswith((".html", "/")):
            self.send_header("Cache-Control", "no-cache, must-revalidate")
        else:
            self.send_header("Cache-Control", "public, max-age=86400")
        
        super().end_headers()

if __name__ == '__main__':
    HOST = '0.0.0.0' if ('--lan' in sys.argv or '--public' in sys.argv) else '127.0.0.1'
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, SecurityHeadersHandler)
    print(f"[*] SHADOW CAT Hardened Web Server running at http://{HOST}:{PORT}")
    print("[*] Security Headers active: CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Shutting down server gracefully.")
        httpd.server_close()
