# Laiba Chatbot

Laiba Chatbot is a full-stack conversational assistant built with a FastAPI backend and a React + Vite frontend. The project delivers a lightweight web interface for chat interactions while using Python services for AI-driven message processing.

## Key Features

- FastAPI backend with CORS support
- React frontend using Vite for fast development and production builds
- Axios-based frontend API integration
- Modular backend architecture with routers and graph-based workflows

## Tech Stack

- Backend: Python, FastAPI, Uvicorn
- Frontend: React, Vite, TypeScript
- Data and AI tools: LangChain, vector stores, Supabase client support

## Project Structure

- `backend/`
  - `app/` — FastAPI application code, routers, models, schemas, and workflow logic
  - `requirements.txt` — Python dependencies
- `frontend/`
  - `src/` — React application source files and UI components
  - `package.json` — frontend dependencies and scripts

## Setup

### Backend

1. Create and activate a Python virtual environment
2. Install dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Start the backend server from the `backend` folder:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Install frontend dependencies from the `frontend` folder:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open the local Vite URL shown in the terminal, typically `http://localhost:5173`

## Notes

- Ensure the backend is running before using the frontend chat interface.
- Update API endpoints or CORS configuration if the frontend or backend are served from a different host or port.

