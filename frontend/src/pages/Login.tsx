import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError, demoMode, setToken } from "../api/client";
import { Button, Field } from "../components/ui";
import { Page } from "../components/Layout";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "erro inesperado");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <div className="auth">
        <h2>Entrar</h2>
        {demoMode && <p className="muted">Login indisponível em modo demonstração.</p>}
        <form onSubmit={submit}>
          <Field label="E-mail" value={email} onChange={setEmail} type="email" />
          <Field label="Senha" value={password} onChange={setPassword} type="password" />
          {error && <p className="error" role="alert">{error}</p>}
          <Button type="submit" disabled={busy || demoMode}>{busy ? "entrando…" : "Entrar"}</Button>
        </form>
        <p className="muted">Sem conta? <Link to="/register">Criar</Link> · <Link to="/recover">Esqueci a senha</Link></p>
      </div>
    </Page>
  );
}
