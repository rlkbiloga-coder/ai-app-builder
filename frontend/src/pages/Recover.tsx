import { Page } from "../components/Layout";

export default function Recover() {
  return (
    <Page>
      <div className="auth">
        <h2>Recuperar acesso</h2>
        <p className="muted">
          Recuperação por e-mail pendente de configuração do serviço de envio
          (pendência registrada em docs/FEATURE_MATRIX.md).
        </p>
      </div>
    </Page>
  );
}
