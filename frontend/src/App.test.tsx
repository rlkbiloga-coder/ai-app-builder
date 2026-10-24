import { render, screen } from "@testing-library/react";
import { HashRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "./App";
import { ApiError, demoMode } from "./api/client";

describe("frontend", () => {
  it("renderiza a home com o pitch do produto", () => {
    render(
      <HashRouter>
        <App />
      </HashRouter>,
    );
    expect(screen.getByText("Crie apps conversando")).toBeTruthy();
  });

  it("rotas de auth existem (navegação interna)", () => {
    render(
      <HashRouter>
        <App />
      </HashRouter>,
    );
    expect(screen.getByText("Entrar")).toBeTruthy();
    expect(screen.getByText("Criar conta")).toBeTruthy();
  });

  it("modo demo bloqueia chamadas com erro claro (sem resposta falsa)", async () => {
    expect(demoMode).toBe(true); // ambiente de teste sem VITE_API_BASE
    await expect(
      import("./api/client").then((m) => m.api("/projects")),
    ).rejects.toThrow(ApiError);
  });
});
