import { Link } from "react-router-dom";
import { Page } from "../components/Layout";

export default function Home() {
  return (
    <Page>
      <section className="hero">
        <h1>Crie apps conversando</h1>
        <p>
          Descreva sua ideia em linguagem natural. O agente planeja, gera os
          arquivos e mantém o histórico de versões do seu projeto.
        </p>
        <div className="row">
          <Link className="btn" to="/register">Começar agora</Link>
          <Link className="btn ghost" to="/login">Já tenho conta</Link>
        </div>
      </section>
      <section className="grid3">
          <div className="card"><h3>1. Descreva</h3><p>Um parágrafo com o que o app deve fazer.</p></div>
          <div className="card"><h3>2. O agente constrói</h3><p>Arquivos gerados, versionados e auditáveis.</p></div>
          <div className="card"><h3>3. Acompanhe</h3><p>Histórico de conversas, mudanças e versões.</p></div>
      </section>
    </Page>
  );
}
