from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    order_id: Optional[int] = None
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)