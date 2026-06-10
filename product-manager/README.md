# Product Manager Monorepo Project

This is a complete, high-performance product management application structured as a monorepo. It features a secure PostgreSQL-backed FastAPI server and a polished React + Vite client dashboard.

## Project Structure

```
product-manager/
├── database_schema.sql  (PostgreSQL SQL schema)
├── backend/             (FastAPI CRUD backend)
│   ├── app/
│   │   ├── core/        (JWT settings, hash security modules)
│   │   ├── models/      (SQLAlchemy model maps)
│   │   ├── schemas/     (Pydantic validation schemas)
│   │   ├── routers/     (Auth, Users, Products endpoints)
│   │   ├── services/    (Encapsulated business logic operations)
│   │   ├── database.py  (SQLAlchemy engine setup)
│   │   └── main.py      (App startup coordinator with CORS)
│   ├── requirements.txt
│   └── .env.example
├── frontend/            (React client dashboard)
│   ├── src/
│   │   ├── api/         (Axios API instance with JWT interceptors)
│   │   ├── context/     (Global Auth Context: Login, Register, Logout)
│   │   ├── components/  (Filters, forms, cards, redirect blocks)
│   │   ├── pages/       (Authenticate and list portals)
│   │   ├── App.jsx      (V6 routing paths)
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup Instructions

### 1. Database Provisioning
Make sure you have a active PostgreSQL service running. Execute the schema script using standard PostgreSQL tools to populate tables:
```bash
psql -U postgres -d your_database -f database_schema.sql
```

### 2. Backend Boot sequence
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Create and start a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables template and configure your actual settings:
   ```bash
   cp .env.example .env
   ```
   *Edit the `.env` file to match your PostgreSQL server login values and preferred private token key.*
5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   Verify status at [http://127.0.0.1:8000/](http://127.0.0.1:8000/) or review interactive Swagger documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 3. Frontend boot sequence
1. Move to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Pull active npm packages:
   ```bash
   npm install
   ```
3. Duplicate the frontend environment config:
   ```bash
   cp .env.example .env
   ```
   *Double check that `VITE_API_URL` points to your backend URL (`http://localhost:8000`).*
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
5. View the dashboard at [http://localhost:3000](http://localhost:3000) inside your web browser.
