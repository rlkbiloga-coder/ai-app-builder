# Arquitetura — ai-app-builder

## Visão
Plataforma própria de criação de apps com IA. O usuário descreve o app em linguagem natural; um agente no backend planeja, gera arquivos e registra versões. Frontend React+TS+Vite; backend FastAPI modular; SQLite no dev (PostgreSQL em produção via `DATABASE_URL`).

```
frontend/  React + TypeScript + Vite (HashRouter p/ hospedagem estática)
backend/   FastAPI (app/main, auth, routers, agent/{providers,tools})
docs/      mapeamento, rotas, matriz, arquitetura
tests/     testes de integração (pytest) e componentes (vitest no frontend)
deploy/    Dockerfiles
```

## Backend
- `app/main.py` — create_app, CORS (origens por env), handler global de erro, /api/v1
- `app/database.py` — SQLAlchemy engine (SQLite default; `DATABASE_URL` para PostgreSQL)
- `app/models.py` — User, Project, ProjectFile, FileVersion, Conversation, Message, Activity
- `app/auth.py` — PBKDF2-SHA256 (salt por usuário), token JWT (HS256, expiração), `get_current_user`
- `app/routers/` — auth, projects (CRUD + arquivos), agent (conversa + execução)
- `app/agent/providers.py` — `ProviderAdapter` (interface comum), `OpenAICompatibleAdapter` (env `AI_*`), `DemoAdapter` (modo demonstração IDENTIFICADO; nunca finge resposta de modelo)
- `app/agent/tools.py` — ferramenta `write_file` aplicada aos arquivos do projeto, com versionamento (FileVersion) e Activity; limite de iterações por execução

## Frontend
- Páginas: Home, Login, Registro, Dashboard, Workspace (chat + árvore de arquivos + visualizador), Configurações (integrações/provedores), Conta
- `api/client.ts` — fetch com token JWT; `VITE_API_BASE` define o backend; sem backend configurado a UI entra em modo demonstração com aviso claro (ações desabilitadas, sem respostas simuladas de modelo)

## Segurança
- Chaves de IA somente no backend (env). JWT assinado com `SECRET_KEY` (nunca default em produção — o boot valida). Hash de senha com PBKDF2 + salt. Isolamento por dono do projeto (testado). CORS restrito por env. Entradas validadas por Pydantic. Sem execução de código arbitrário no processo (geração de arquivos apenas; execução em sandbox é pendência documentada).

## Decisões documentadas
- SQLite como default de desenvolvimento (simplicidade); PostgreSQL via DATABASE_URL em produção.
- Hash PBKDF2 em vez de bcrypt: menos dependências nativas, custo computacional configurado (600k iterações).
- Migrações: create_all no boot para dev; Alembic listado como pendência para produção.
