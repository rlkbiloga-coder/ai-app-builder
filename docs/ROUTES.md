# Rotas

## Frontend (HashRouter — compatível com GitHub Pages)
| Rota | Finalidade | Estado |
|---|---|---|
| #/ | Apresentação do produto | implementada |
| #/login | Entrar | implementada |
| #/register | Criar conta | implementada |
| #/dashboard | Lista/criação de projetos por descrição | implementada |
| #/workspace/:id | Chat com agente + arquivos do projeto | implementada |
| #/settings | Integrações/provedores de IA | implementada (status) |
| #/account | Conta e gerenciamento | implementada |
| #/recover | Recuperar acesso | parcial (fluxo de e-mail pendente) |

## Backend (prefixo /api/v1)
| Método | Endpoint | Finalidade |
|---|---|---|
| POST | /auth/register | Criar conta |
| POST | /auth/login | Login (retorna JWT) |
| GET | /auth/me | Usuário atual |
| GET | /projects | Listar projetos |
| POST | /projects | Criar projeto (título + descrição) |
| GET | /projects/{id} | Detalhe |
| DELETE | /projects/{id} | Excluir |
| GET | /projects/{id}/files | Arquivos |
| GET | /projects/{id}/activity | Histórico |
| POST | /projects/{id}/conversations | Criar conversa |
| POST | /conversations/{id}/messages | Enviar mensagem ao agente (gera arquivos + versões) |
| GET | /projects/{id}/versions | Versões de arquivos |
| GET | /health | Healthcheck |
