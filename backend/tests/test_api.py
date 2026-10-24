"""Testes de integração: auth, CRUD de projetos, isolamento e fluxo do agente (demo)."""
import os

os.environ.setdefault("SECRET_KEY", "test-secret")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def register(email: str, password: str = "senhamuito123"):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "Teste", "password": password},
    )
    assert response.status_code == 201, response.text
    return response.json()["token"]


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_register_login_me():
    token = register("a@test.com")
    login = client.post(
        "/api/v1/auth/login", json={"email": "a@test.com", "password": "senhamuito123"}
    )
    assert login.status_code == 200
    me = client.get("/api/v1/auth/me", headers=auth_headers(login.json()["token"]))
    assert me.json()["email"] == "a@test.com"


def test_wrong_password_rejected():
    register("b@test.com")
    login = client.post(
        "/api/v1/auth/login", json={"email": "b@test.com", "password": "errada12345"}
    )
    assert login.status_code == 401


def test_short_password_rejected():
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "c@test.com", "name": "", "password": "curta"},
    )
    assert response.status_code == 422


def test_requires_auth():
    assert client.get("/api/v1/projects").status_code == 401


def test_project_crud_and_isolation():
    token1 = register("d1@test.com")
    token2 = register("d2@test.com")
    created = client.post(
        "/api/v1/projects",
        json={"title": "App de tarefas", "description": "Lista de tarefas"},
        headers=auth_headers(token1),
    )
    assert created.status_code == 201
    project_id = created.json()["id"]
    assert client.get("/api/v1/projects", headers=auth_headers(token1)).json()[0]["title"] == "App de tarefas"
    # isolamento: dono 2 nao ve o projeto do dono 1
    assert client.get(f"/api/v1/projects/{project_id}", headers=auth_headers(token2)).status_code == 404
    assert client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers(token2)).status_code == 404
    assert client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers(token1)).status_code == 204


def test_agent_demo_flow_generates_file_and_versions():
    token = register("e@test.com")
    headers = auth_headers(token)
    project_id = client.post(
        "/api/v1/projects", json={"title": "Todo", "description": "todo app"}, headers=headers
    ).json()["id"]
    conversation_id = client.post(
        f"/api/v1/projects/{project_id}/conversations", headers=headers
    ).json()["id"]
    response = client.post(
        f"/api/v1/conversations/{conversation_id}/messages",
        json={"content": "crie um README"},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["role"] == "assistant"
    assert data["demo"] is True  # sem provedor configurado: modo demo identificado
    assert "README.md" in data["files_changed"]
    files = client.get(f"/api/v1/projects/{project_id}/files", headers=headers).json()
    assert any(f["path"] == "README.md" for f in files)
    versions = client.get(f"/api/v1/projects/{project_id}/versions", headers=headers).json()
    assert len(versions) == 1
    activity = client.get(f"/api/v1/projects/{project_id}/activity", headers=headers).json()
    assert activity[0]["kind"] == "plan_applied"
