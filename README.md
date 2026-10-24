# ai-app-builder — plataforma de criação de apps com IA

Produto próprio e independente, inspirado em funcionalidades publicamente documentadas de plataformas de desenvolvimento assistido por IA (ver docs/REFERENCE_MAP.md). Sem ativos, código ou identidade visual de terceiros.

- Frontend: React + TypeScript + Vite (`frontend/`)
- Backend: Python FastAPI modular (`backend/`)
- Persistência: SQLite no dev; PostgreSQL em produção (`DATABASE_URL`)
- Auth: JWT + PBKDF2; chaves de IA apenas no backend

## Rodar local
```
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```
Ver `.env.example`. Docker: `docker compose up --build`.

## Testes
```
cd backend && pytest -q
cd frontend && npm test && npm run build
```

## GitHub Pages
Frontend publicado em https://rlkbiloga-coder.github.io/ai-app-builder/ (workflow `.github/workflows/deploy-pages.yml`). O backend não roda no Pages (estático): em produção, implante o backend (deploy/) e aponte `VITE_API_BASE` no build. Sem backend configurado, a UI opera em modo demonstração claramente identificado.
