import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError, demoMode, setToken } from "../api/client";
import { Button, Field } from "../components/ui";
import { Page } from "../components/Layout";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api<{ token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, name, password }),
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
        <h2>Criar conta</h2>
        <form onSubmit={submit}>
          <Field label="Nome" value={name} onChange={setName} />
          <Field label="E-mail" value={email} onChange={setEmail} type="email" />
          <Field label="Senha (mínimo 8)" value={password} onChange={setPassword} type="password" />
          {error && <p className="error" role="alert">{error}</p>}
          <Button type="submit" disabled={busy || demoMode}>{busy ? "criando…" : "Criar conta"}</Button>
        </form>
        <p className="muted">Já tem conta? <Link to="/login">Entrar</Link></p>
      </div>
    </Page>
  );
}
