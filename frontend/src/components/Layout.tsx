/** Layout com topo de navegação e aviso de modo demonstração. */
import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { demoMode, getToken, logout } from "../api/client";

export function TopBar() {
  const navigate = useNavigate();
  const logged = Boolean(getToken());
  return (
    <header className="topbar">
      <Link to="/" className="brand">◆ appbuilder</Link>
      <nav>
        {logged ? (
          <>
            <Link to="/dashboard">Projetos</Link>
            <Link to="/settings">Configurações</Link>
            <Link to="/account">Conta</Link>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register">Criar conta</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export function DemoBanner() {
  if (!demoMode) return null;
  return (
    <div className="banner" role="note">
      Modo demonstração: backend não configurado. Ações de dados estão
      desativadas. Implante o backend e defina VITE_API_BASE para o modo real.
    </div>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="page">
      <TopBar />
      <DemoBanner />
      <main>{children}</main>
    </div>
  );
}
