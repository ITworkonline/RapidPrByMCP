#!/usr/bin/env python3
"""
Frontend Edit Agent Launcher

This script provides a convenient way to start the Frontend Edit Agent server.
"""

import os
import sys
import subprocess
import webbrowser
from time import sleep

def main():
    """Main entry point for the launcher."""
    print("Starting Frontend Edit Agent...")
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        if os.path.exists('.env.example.python'):
            print("\nEnvironment file not found. Creating from example...")
            with open('.env.example.python', 'r') as src:
                with open('.env', 'w') as dest:
                    dest.write(src.read())
            print("Created .env file. Please edit it to add your GitHub token and OpenAI API key.")
            print("Then restart this launcher.")
            sys.exit(0)
        else:
            print("\nWarning: No .env or .env.example.python file found.")
            print("The server will use default settings.")
    
    # Check if dependencies are installed
    try:
        import flask
        import dotenv
        import openai
        import github
    except ImportError:
        print("\nSome dependencies are missing. Installing required packages...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
    
    # Start the server in a separate process
    port = os.getenv('PORT', '3000')
    print(f"\nStarting server on port {port}...")
    server_process = subprocess.Popen([sys.executable, 'server.py'])
    
    # Wait a bit for the server to start
    sleep(2)
    
    # Open browser
    url = f"http://localhost:{port}"
    print(f"\nOpening {url} in your browser...")
    webbrowser.open(url)
    
    print("\nServer is running. Press Ctrl+C to stop.")
    
    try:
        # Keep running until interrupted
        server_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server_process.terminate()
        print("Server stopped.")

if __name__ == '__main__':
    main()