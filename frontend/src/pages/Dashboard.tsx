import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, demoMode } from "../api/client";
import { Button, Empty, Field, Spinner } from "../components/ui";
import { Page } from "../components/Layout";

type Project = { id: number; title: string; description: string };

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setProjects(await api<Project[]>("/projects"));
    } catch {
      setProjects([]);
    }
  };

  useEffect(() => {
    if (!demoMode) void load();
    else setProjects([]);
  }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/projects", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTitle("");
      setDescription("");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "erro");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <h2>Meus projetos</h2>
      <form className="card" onSubmit={create}>
        <h3>Novo projeto</h3>
        <Field label="Título" value={title} onChange={setTitle} placeholder="Ex: Lista de tarefas" />
        <Field label="Descreva o app em linguagem natural" value={description} onChange={setDescription} />
        {error && <p className="error" role="alert">{error}</p>}
        <Button type="submit" disabled={busy || demoMode}>{busy ? "criando…" : "Criar projeto"}</Button>
      </form>
      {projects === null ? (
        <Spinner />
      ) : projects.length === 0 ? (
        <Empty text="Nenhum projeto ainda. Crie o primeiro descrevendo sua ideia." />
      ) : (
        <ul className="list">
          {projects.map((project) => (
            <li key={project.id} className="card rowitem">
              <Link to={`/workspace/${project.id}`}>
                <strong>{project.title}</strong>
                <p className="muted">{project.description.slice(0, 120)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
