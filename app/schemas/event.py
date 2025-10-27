from pydantic import BaseModel
from typing import Optional

class Event(BaseModel):
    id: int
    title: str
    date: str
    tag: str
    desc: Optional[str] = None