# TaskFlow Dashboard

A professional task management dashboard built with React 18 and Vite.

## Features

- **Dashboard** — Stats overview, progress ring, category breakdown, recent tasks
- **Task List** — Searchable, filterable task grid with inline status cycling
- **Add / Edit Tasks** — Full form with validation for title, description, priority, status, category, and due date
- **Statistics Cards** — Clickable cards that filter the task list
- **Responsive** — Works on mobile, tablet, and desktop
- **Animated UI** — Subtle transitions and hover effects throughout

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Branches

| Branch | Purpose |
|---|---|
| `main` | Production — blue theme, production title & footer |
| `dev` | Development — purple theme, dev title, footer & badge |

## Tech Stack

- React 18
- Vite 5
- CSS Modules
- Context API + useReducer for state

## Project Structure

```
src/
├── components/      # Reusable UI components
├── context/         # TaskContext (state management)
├── pages/           # Dashboard, Tasks, AddTask
├── config.js        # App-level config (title, footer, theme flag)
├── App.jsx
├── main.jsx
└── index.css        # Global CSS variables & resets
```
