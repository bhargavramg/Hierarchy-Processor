# SRM Hierarchy Processor

A production-ready full-stack application that processes a list of directed edges (e.g. `A->B`) to generate hierarchical trees. It also detects **cycles**, **invalid entries**, **duplicate edges**, and handles **multi-parent nodes**.

---

## Tech Stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| Backend   | Python · FastAPI · Uvicorn · Motor (async MongoDB) |
| Frontend  | React 19 · Tailwind CSS · Lucide Icons           |
| Database  | MongoDB                                          |
| Testing   | pytest (backend) · Playwright (frontend E2E)     |

---

## Folder Structure

```
├── backend/
│   ├── routers/
│   │   ├── __init__.py
│   │   └── bfhl.py          # API route handlers
│   ├── services/
│   │   ├── __init__.py
│   │   └── hierarchy.py     # Core hierarchy-building logic
│   ├── utils/
│   │   ├── __init__.py
│   │   └── validators.py    # Edge validation helpers
│   ├── tests/
│   │   └── test_api.py      # 12 pytest test cases
│   ├── .env                  # Environment config (not committed)
│   ├── requirements.txt
│   └── server.py             # FastAPI entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── HierarchyApp.jsx   # Main application component
│   │   │   ├── JsonView.jsx       # JSON tree renderer
│   │   │   └── TreeView.jsx       # Visual tree renderer
│   │   ├── lib/
│   │   │   └── dot.js             # Graphviz DOT export utility
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   ├── tests/
│   │   └── app.spec.js            # Playwright E2E tests (7 specs)
│   ├── playwright.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json               # Root-level convenience scripts
├── vercel.json                # Vercel deployment config
├── render.yaml                # Render deployment blueprint
├── .gitignore
└── README.md
```

---

## Prerequisites

Make sure these are installed on your machine:

- **Node.js** ≥ 18 and **npm** ≥ 9 — [Download](https://nodejs.org/)
- **Python** ≥ 3.9 — [Download](https://www.python.org/downloads/)
- **MongoDB** (local or Atlas connection string) — [Download](https://www.mongodb.com/try/download/community)

---

## Getting Started — Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/bhargavramg/Hierarchy-Processor.git
cd Hierarchy-Processor
```

### 2. Backend setup

```bash
# Navigate to the backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder (if it doesn't exist):

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=bfhl_db
CORS_ORIGINS=*
```

> **Tip:** Replace `MONGO_URL` with your MongoDB Atlas connection string if you're not running MongoDB locally.

Start the backend server:

```bash
python server.py
```

The API will be available at **http://localhost:8001**. Interactive Swagger docs at **http://localhost:8001/docs**.

### 3. Frontend setup

Open a **new terminal** window:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm start
```

The app will open at **http://localhost:3000** and proxy API calls to the backend on port 8001.

### 4. Quick start (from root)

If you prefer to use the root-level convenience scripts:

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start the backend (in one terminal)
npm run start:backend

# Start the frontend (in another terminal)
npm start
```

---

## Running Tests

### Backend tests (pytest)

```bash
cd backend
pytest tests/test_api.py -v
```

This runs **12 test cases** covering:
- GET identity endpoint
- POST happy path, empty data, whitespace trimming
- Invalid entries, duplicate edges, multi-parent, cycle detection
- Lexicographic tie-breaking
- Response shape validation
- Save/no-save toggle and history endpoints

### Frontend E2E tests (Playwright)

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run tests (make sure both backend & frontend dev servers are running)
npx playwright test
```

This runs **7 E2E specs** covering:
- Page load and header assertions
- Example preset buttons
- Process flow and result layout
- Clipboard copy (curl & share URL)
- DOT file export/download
- URL query-param hydration
- History drawer and restore

---

## API Reference

### `POST /api/bfhl`

Process directed edges.

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D"],
  "save": true
}
```

**Response:**
```json
{
  "user_id": "john_doe_17091999",
  "email_id": "john@xyz.com",
  "college_roll_number": "ROLL123",
  "hierarchies": [
    { "root": "A", "tree": { "B": { "D": {} }, "C": {} }, "depth": 3 }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "has_cycle": false,
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  },
  "submission_id": "<uuid>"
}
```

### `GET /api/bfhl`

Returns identity payload.

### `GET /api/bfhl/history?limit=25`

Returns a list of past submissions (lightweight, without full response).

### `GET /api/bfhl/history/{id}`

Returns a specific past submission with full input and response.

---

## Key Features

- **Hierarchy Builder** — Parses `X->Y` edges and builds tree structures
- **Cycle Detection** — Warns when edges form circular dependencies
- **Invalid Entry Detection** — Catches malformed edges (multi-char nodes, self-loops, missing parts)
- **Duplicate Filtering** — Identifies and de-dupes repeated edges
- **Multi-Parent Handling** — Nodes with multiple parents become separate tree roots
- **DOT Export** — Download Graphviz `.dot` file for external rendering
- **Shareable URLs** — Base64url-encoded query params for sharing inputs
- **History** — MongoDB-backed submission history with restore capability
- **Dark-themed UI** — Modern, responsive design with animations

---

## Deployment

### Vercel

The `vercel.json` at the root configures both frontend and backend:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set these environment variables in the Vercel dashboard:
- `MONGO_URL` — Your MongoDB Atlas connection string
- `CORS_ORIGINS` — Your frontend domain

### Render

The `render.yaml` Blueprint can deploy the backend as a web service. Push to GitHub and connect the repo on [Render Dashboard](https://dashboard.render.com/).

---

## License

This project is for educational / demonstration purposes.
