"""Conversa com o agente: plano -> arquivos -> resumo."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..agent.providers import ProviderError, get_provider
from ..agent.tools import PlanError, apply_plan, parse_plan
from ..auth import get_current_user
from ..database import get_db
from ..models import Conversation, Message, Project, ProjectFile, User
from ..schemas import MessageIn, MessageOut

router = APIRouter(tags=["agent"])


def owned_conversation(db: Session, user: User, conversation_id: int):
    conversation = (
        db.query(Conversation, Project)
        .join(Project, Conversation.project_id == Project.id)
        .filter(Conversation.id == conversation_id, Project.owner_id == user.id)
        .one_or_none()
    )
    if conversation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "conversa nao encontrada")
    return conversation[0], conversation[1]


@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut)
def send_message(
    conversation_id: int,
    payload: MessageIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conversation, project = owned_conversation(db, user, conversation_id)
    db.add(Message(conversation_id=conversation.id, role="user", content=payload.content))
    db.commit()

    files = (
        db.query(ProjectFile)
        .filter(ProjectFile.project_id == project.id)
        .order_by(ProjectFile.path)
        .all()
    )
    context = f"Projeto: {project.title}\nDescricao: {project.description}\n"
    if files:
        context += "Arquivos atuais:\n" + "\n".join(
            f"- {f.path} ({len(f.content)} bytes)" for f in files[:50]
        )
    prompt = context + f"\nPedido do usuario:\n{payload.content}"

    provider, is_demo = get_provider()
    try:
        raw = provider.complete(prompt)
        plan = parse_plan(raw)
    except (ProviderError, PlanError) as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"falha no agente: {exc}") from None

    changed = apply_plan(db, project.id, plan)
    summary = str(plan.get("summary", ""))[:4000]
    db.add(Message(conversation_id=conversation.id, role="assistant", content=summary))
    db.commit()
    return MessageOut(role="assistant", content=summary, demo=is_demo, files_changed=changed)
