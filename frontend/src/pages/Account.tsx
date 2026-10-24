import { useEffect, useState } from "react";
import { api, getToken, logout } from "../api/client";
import { Page } from "../components/Layout";

type Me = { id: number; email: string; name: string };

export default function Account() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getToken()) {
      api<Me>("/auth/me")
        .then(setMe)
        .catch((requestError) => setError(String(requestError)));
    }
  }, []);

  return (
    <Page>
      <h2>Minha conta</h2>
      {me ? (
        <div className="card">
          <p><strong>{me.name || "(sem nome)"}</strong></p>
          <p className="muted">{me.email}</p>
          <button type="button" className="btn danger" onClick={logout}>Sair</button>
        </div>
      ) : (
        <p className="muted">{error || "Não autenticado."}</p>
      )}
    </Page>
  );
}
