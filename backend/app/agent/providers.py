"""Provedores de IA intercambiáveis.

Sem credenciais configuradas o sistema usa `DemoAdapter`, que retorna um
plano DECLARADAMENTE de demonstração — nunca finge ser resposta de modelo.
"""
import json
import os
from abc import ABC, abstractmethod

import httpx

SYSTEM_PROMPT = (
    "Você é um engenheiro de software. Responda APENAS com um objeto JSON: "
    '{"files": [{"path": "str", "content": "str"}], "summary": "str"}. '
    "Gere arquivos completos e funcionais para o app descrito. Sem markdown."
)


class ProviderError(Exception):
    pass


class ProviderAdapter(ABC):
    """Interface comum para provedores de modelo."""

    @abstractmethod
    def complete(self, prompt: str) -> str:
        """Retorna a resposta bruta (esperado JSON do plano)."""


class OpenAICompatibleAdapter(ProviderAdapter):
    """Adaptador para qualquer API compatível com OpenAI (endpoint chat)."""

    def __init__(self, base_url: str, api_key: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model

    def complete(self, prompt: str) -> str:
        response = httpx.post(
            f"{self.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 4000,
            },
            timeout=60,
        )
        if response.status_code >= 400:
            raise ProviderError(f"provedor respondeu HTTP {response.status_code}")
        data = response.json()
        return data["choices"][0]["message"]["content"]


class DemoAdapter(ProviderAdapter):
    """Modo demonstração identificado: plano de exemplo, sem resposta de modelo."""

    def complete(self, prompt: str) -> str:
        plan = {
            "demo": True,
            "files": [
                {
                    "path": "README.md",
                    "content": (
                        "# Projeto gerado em modo demonstração\n\n"
                        "Nenhum provedor de IA está configurado no backend.\n"
                        "Configure AI_PROVIDER, AI_PROVIDER_API_KEY e AI_MODEL.\n\n"
                        "Solicitação registrada:\n" + prompt[:500]
                    ),
                }
            ],
            "summary": (
                "Modo demonstração: nenhum modelo conectado. "
                "Configure um provedor em .env para geração real."
            ),
        }
        return json.dumps(plan)


def get_provider() -> tuple[ProviderAdapter, bool]:
    """Retorna (adaptador, is_demo) conforme variáveis de ambiente."""
    name = os.getenv("AI_PROVIDER", "demo")
    api_key = os.getenv("AI_PROVIDER_API_KEY", "").strip()
    base_url = os.getenv("AI_PROVIDER_BASE_URL", "").strip()
    model = os.getenv("AI_MODEL", "gpt-4o-mini")
    if name == "openai-compatible" and api_key and base_url:
        return OpenAICompatibleAdapter(base_url, api_key, model), False
    return DemoAdapter(), True
