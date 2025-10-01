#!/usr/bin/env python3
"""
Simple HTTP server for serving static files with proper cache control headers.
This prevents aggressive caching that can hide updates in the Replit iframe.
"""
import http.server
import socketserver
from functools import partial

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with no-cache headers"""
    
    def end_headers(self):
        # Add cache control headers to prevent caching
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Log requests in a clean format"""
        print(f"{self.address_string()} - {format % args}")

def run_server(port=5000, host='0.0.0.0'):
    """Run the HTTP server"""
    handler = NoCacheHTTPRequestHandler
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((host, port), handler) as httpd:
        print(f"🚀 Server running at http://{host}:{port}")
        print(f"📂 Serving files from current directory")
        print(f"🔄 Cache-Control headers enabled")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == '__main__':
    run_server()
