# SRM Hierarchy Processor

This is a production-ready full-stack application that processes a list of directed edges to generate hierarchical trees. It also detects cycles, invalid entries, duplicate edges, and ignores multi-parent nodes.

## Architecture

- **Backend**: FastAPI (Python) - Modular layout with routes, services, and utils. Uses Motor (async MongoDB driver) for history.
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui.
- **Database**: MongoDB

## Folder Structure

```
├── backend/
│   ├── routers/
│   │   ├── __init__.py
│   │   └── bfhl.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── hierarchy.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── validators.py
│   ├── tests/
│   │   ├── test_api.py
│   ├── .env
│   ├── requirements.txt
│   └── server.py
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── HierarchyApp.jsx
│   │   │   ├── JsonView.jsx
│   │   │   └── TreeView.jsx
│   │   ├── lib/
│   │   │   └── dot.js
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## API Contract

### `POST /api/bfhl`
Processes the edges.
**Request**:
```json
{
  "data": ["A->B", "A->C", "B->D"],
  "save": true
}
```

**Response**:
```json
{
  "user_id": "john_doe_17091999",
  "email_id": "john@xyz.com",
  "college_roll_number": "ROLL123",
  "hierarchies": [{ "root": "A", "tree": { "B": { "D": {} }, "C": {} }, "depth": 3 }],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": { "total_trees": 1, "total_cycles": 0, "largest_tree_root": "A" },
  "submission_id": "<uuid>"
}
```

### `GET /api/bfhl`
Returns the identity payload.

### `GET /api/bfhl/history`
Retrieves history. Query parameter `limit` sets the number of items.

### `GET /api/bfhl/history/{id}`
Retrieves a specific history item by ID.

## Run Locally

### Backend
1. Go to the `backend` folder.
2. Ensure you have Python installed.
3. Install dependencies: `pip install -r requirements.txt`
4. Make sure MongoDB is running or update `.env` to point to a valid Mongo instance.
5. Run the server: `python server.py` (or `uvicorn server:app --host 0.0.0.0 --port 8001`)

### Frontend
1. Go to the `frontend` folder.
2. Install dependencies: `yarn install` or `npm install`
3. Run the development server: `yarn start` or `npm start`

## Deployment Notes
- **Backend**: Can be deployed on Render, Railway, or Fly.io. Expose port `8001` or let the platform inject `$PORT`. Make sure `MONGO_URL` and `CORS_ORIGINS` are set in the environment variables.
- **Frontend**: Can be deployed on Vercel or Netlify. Set `REACT_APP_BACKEND_URL` in the build settings to point to your deployed backend URL (e.g. `https://your-api.onrender.com`).
