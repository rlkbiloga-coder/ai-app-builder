"""Execução do plano do agente: write_file com versionamento e histórico."""
import json

from sqlalchemy.orm import Session

from ..models import Activity, FileVersion, ProjectFile


class PlanError(Exception):
    pass


def parse_plan(raw: str) -> dict:
    """Extrai o JSON do plano da resposta do modelo."""
    text = raw.strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = text.split("\n", 1)[-1]
    try:
        plan = json.loads(text)
    except json.JSONDecodeError as exc:
        raise PlanError("resposta do agente nao e um JSON valido") from exc
    if not isinstance(plan, dict) or "files" not in plan:
        raise PlanError("plano sem a chave 'files'")
    return plan


def apply_plan(db: Session, project_id: int, plan: dict) -> list[str]:
    """Cria/atualiza arquivos do projeto e registra versões + atividade."""
    changed: list[str] = []
    for spec in plan.get("files", [])[:50]:
        path = str(spec.get("path", ""))[:500].strip()
        content = str(spec.get("content", ""))
        if not path or path.startswith("/") or ".." in path.split("/"):
            continue
        file = (
            db.query(ProjectFile)
            .filter(ProjectFile.project_id == project_id, ProjectFile.path == path)
            .one_or_none()
        )
        if file is None:
            file = ProjectFile(project_id=project_id, path=path, content=content)
            db.add(file)
            db.flush()
            db.add(FileVersion(file_id=file.id, version=1, content=content))
        else:
            last = (
                db.query(FileVersion)
                .filter(FileVersion.file_id == file.id)
                .order_by(FileVersion.version.desc())
                .first()
            )
            next_version = (last.version + 1) if last else 1
            file.content = content
            db.add(FileVersion(file_id=file.id, version=next_version, content=content))
        changed.append(path)
    db.add(
        Activity(
            project_id=project_id,
            kind="plan_applied",
            detail=str(plan.get("summary", ""))[:1000],
        )
    )
    db.commit()
    return changed
