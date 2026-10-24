"""Projetos, arquivos, versões e histórico (isolamento por dono)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Activity, Conversation, FileVersion, Message, Project, ProjectFile, User
from ..schemas import ActivityOut, FileOut, MessageIn, MessageOut, ProjectIn, ProjectOut

router = APIRouter(prefix="/projects", tags=["projects"])


def owned_project(db: Session, user: User, project_id: int) -> Project:
    project = db.get(Project, project_id)
    if project is None or project.owner_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "projeto nao encontrado")
    return project


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Project).filter(Project.owner_id == user.id).order_by(Project.id.desc()).all()


@router.post("", response_model=ProjectOut, status_code=201)
def create_project(
    payload: ProjectIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    project = Project(owner_id=user.id, title=payload.title, description=payload.description)
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectOut(id=project.id, title=project.title, description=project.description)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = owned_project(db, user, project_id)
    return ProjectOut(id=project.id, title=project.title, description=project.description)


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = owned_project(db, user, project_id)
    db.delete(project)
    db.commit()


@router.get("/{project_id}/files", response_model=list[FileOut])
def list_files(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_project(db, user, project_id)
    return db.query(ProjectFile).filter(ProjectFile.project_id == project_id).all()


@router.get("/{project_id}/activity", response_model=list[ActivityOut])
def list_activity(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_project(db, user, project_id)
    return db.query(Activity).filter(Activity.project_id == project_id).order_by(Activity.id.desc()).all()


@router.get("/{project_id}/versions")
def list_versions(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_project(db, user, project_id)
    versions = (
        db.query(FileVersion, ProjectFile.path)
        .join(ProjectFile, FileVersion.file_id == ProjectFile.id)
        .filter(ProjectFile.project_id == project_id)
        .order_by(FileVersion.id.desc())
        .limit(100)
        .all()
    )
    return [
        {"path": path, "version": version.version, "created_at": version.created_at.isoformat()}
        for version, path in versions
    ]


@router.post("/{project_id}/conversations", status_code=201)
def create_conversation(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_project(db, user, project_id)
    conversation = Conversation(project_id=project_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return {"id": conversation.id}
