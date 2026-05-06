from datetime import date
from pydantic import BaseModel, Field
from typing import Literal

class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: str = ""
    dueDate: date
    priority: Literal["Low", "Medium", "High"] = "Medium"
    projectId: str
    assignedTo: str | None = None

class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    dueDate: date | None = None
    priority: Literal["Low", "Medium", "High"] | None = None
    status: Literal["To Do", "In Progress", "Done"] | None = None
    assignedTo: str | None = None

class TaskStatusUpdate(BaseModel):
    status: Literal["To Do", "In Progress", "Done"]