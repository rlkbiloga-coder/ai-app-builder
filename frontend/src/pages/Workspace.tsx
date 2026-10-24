import { type FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, demoMode } from "../api/client";
import { Button, Spinner } from "../components/ui";
import { Page } from "../components/Layout";

type FileItem = { id: number; path: string; content: string };
type Message = { role: string; content: string; demo?: boolean; files_changed?: string[] };

export default function Workspace() {
  const { id } = useParams();
  const [files, setFiles] = useState<FileItem[] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selected, setSelected] = useState<FileItem | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setFiles(await api<FileItem[]>(`/projects/${id}/files`));
    } catch {
      setFiles([]);
    }
  };

  useEffect(() => {
    if (!demoMode) void load();
    else setFiles([]);
  }, [id]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || demoMode) return;
    setBusy(true);
    setError("");
    try {
      let current = conversationId;
      if (current === null) {
        const created = await api<{ id: number }>(`/projects/${id}/conversations`, {
          method: "POST",
        });
        current = created.id;
        setConversationId(current);
      }
      setMessages((prev) => [...prev, { role: "user", content }]);
      const reply = await api<Message>(`/conversations/${current}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setMessages((prev) => [...prev, reply]);
      setDraft("");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "erro");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <div className="workspace">
        <aside className="files">
          <h4>Arquivos</h4>
          {files === null ? (
            <Spinner />
          ) : files.length === 0 ? (
            <p className="muted">vazio — peça ao agente para gerar</p>
          ) : (
            <ul>
              {files.map((file) => (
                <li key={file.id}>
                  <button type="button" onClick={() => setSelected(file)}>{file.path}</button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <section className="chat">
          <div className="messages">
            {messages.length === 0 && <p className="muted">Descreva o que o agente deve construir.</p>}
            {messages.map((message, index) => (
              <article key={index} className={`msg ${message.role}`}>
                {message.content}
                {message.files_changed && message.files_changed.length > 0 && (
                  <p className="muted">arquivos: {message.files_changed.join(", ")}</p>
                )}
              </article>
            ))}
            {busy && <Spinner label="o agente está planejando…" />}
            {error && <p className="error" role="alert">{error}</p>}
          </div>
          <form className="composer" onSubmit={send}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ex: crie uma página de tarefas com salvamento local"
              aria-label="Mensagem para o agente"
              disabled={busy || demoMode}
            />
            <Button type="submit" disabled={busy || demoMode}>Enviar</Button>
          </form>
        </section>
        <section className="preview card">
          <h4>{selected ? selected.path : "Selecione um arquivo"}</h4>
          {selected && (
            <pre className="code">
              {selected.content.split("\n").map((line, number) => (
                <span key={number} className="line">
                  <em>{number + 1}</em>
                  {line}
                </span>
              ))}
            </pre>
          )}
        </section>
      </div>
    </Page>
  );
}
