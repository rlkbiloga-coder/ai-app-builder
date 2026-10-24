import { Page } from "../components/Layout";
import { demoMode } from "../api/client";

export default function Settings() {
  return (
    <Page>
      <h2>Configurações</h2>
      <div className="card">
        <h3>Integrações e provedores de IA</h3>
        <p className="muted">
          Provedores são configurados no backend via variáveis de ambiente
          (AI_PROVIDER, AI_PROVIDER_BASE_URL, AI_PROVIDER_API_KEY, AI_MODEL).
          As chaves nunca ficam no frontend.
        </p>
        <p className="status">{demoMode ? "Backend: não configurado (modo demonstração)" : "Backend: configurado pelo VITE_API_BASE"}</p>
      </div>
    </Page>
  );
}
