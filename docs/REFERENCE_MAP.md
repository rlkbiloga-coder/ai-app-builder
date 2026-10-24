# Mapeamento da referência pública (Base44)

Fontes: páginas públicas acessíveis sem login e a documentação oficial do produto. O endereço `https://app.base44.com/` redireciona para a tela de login (autenticação obrigatória). Não foi acessado nenhum endpoint privado, nem backend, nem dados de terceiros.

## Páginas públicas observáveis
- **app.base44.com (login/entrada)**: formulário de e-mail + "Continuar com Google"; tela "Welcome to Base44". Não acessível além disso sem conta.
- **Chat do Superagent (app.base44.com/superagent/<id>)**: quando o agente é público, exibe header com nome do agente, mensagens do usuário e assistente com timestamps e ações (copiar, ouvir), banner de notificações, "Navegador ao vivo" (tray de sessão de navegador controlada pelo agente), barra inferior com anexos (+), globos de conexão, seletor "Auto", microfone e botão de envio. Privado quando o agente não é publicado.
- **Interface do editor de apps (App Builder)**: não publicamente acessível sem autenticação. Mapeada por descrição da documentação oficial: criação de apps a partir de descrição em linguagem natural, entidades (tabelas), páginas, workflows, backend functions, publicação.

## Funcionalidades documentadas publicamente (verificáveis)
- Criação de apps a partir de texto em linguagem natural
- Entidades com schema JSON e CRUD automático (id, created_date, updated_date, created_by)
- Páginas e componentes; edição por prompt ("builder" com IA)
- Workflows (agendados, por evento de entidade, conectores)
- Backend functions HTTP deployadas
- Segurança por papéis (admin/user), RLS por entidade
- Publicação do app e domínio próprio
- Créditos/limites por plano

## Limitações registradas
- Telas autenticadas do App Builder não foram observadas diretamente (exigem conta). A implementação deste projeto é própria, baseada nos requisitos públicos, sem reproduzir ativos ou identidade visual proprietários.
- Nada foi mapeado do backend original (sem acesso autorizado ao código).
