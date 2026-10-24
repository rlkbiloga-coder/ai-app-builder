"""Esquemas Pydantic (validação de entrada)."""
from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    email: EmailStr
    name: str = Field(default="", max_length=120)
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenOut(BaseModel):
    token: str
    email: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str


class ProjectIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=4000)


class ProjectOut(BaseModel):
    id: int
    title: str
    description: str


class FileOut(BaseModel):
    id: int
    path: str
    content: str


class ActivityOut(BaseModel):
    kind: str
    detail: str


class MessageIn(BaseModel):
    content: str = Field(min_length=1, max_length=8000)


class MessageOut(BaseModel):
    role: str
    content: str
    demo: bool = False
    files_changed: list[str] = []
