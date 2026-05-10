from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.component import ComponentDetail


class BuildCreate(BaseModel):
    name: str
    description: Optional[str] = None
    author: Optional[str] = None
    component_ids: list[int] = []


class BuildOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    author: Optional[str] = None
    is_preset: bool = False
    purpose: Optional[str] = None
    tier: Optional[str] = None
    created_at: datetime
    total_price: Optional[float] = None
    components_count: int = 0

    model_config = {"from_attributes": True}


class BuildDetail(BuildOut):
    components: list[ComponentDetail] = []
    compatibility_issues: list[str] = []
    total_tdp: Optional[int] = None
