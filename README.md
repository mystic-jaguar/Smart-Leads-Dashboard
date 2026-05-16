# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack + TypeScript.

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS v4, Zustand, React Query, React Hook Form, Zod
- **Backend**: Node.js, Express, TypeScript, MongoDB + Mongoose, JWT, bcryptjs
- **DevOps**: Docker, Docker Compose

## Features

- JWT Authentication (Register / Login)
- Role-Based Access Control (Admin / Sales)
- Full Lead CRUD with status & source tracking
- Advanced filtering: status, source, search (debounced), sort
- Backend pagination (10 per page)
- CSV Export
- Dark Mode
- Responsive UI

## Local Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5000`.

## Docker Setup

```bash
cp .env.example .env   # set JWT_SECRET
docker-compose up --build
```

App available at `http://localhost`.

## Deployment

- **Frontend** → Vercel: connect repo, set `VITE_API_URL` to your Render backend URL
- **Backend** → Render: connect repo, set all env vars from `.env.example`

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.

## API Documentation

See [API_DOCS.md](./API_DOCS.md).
