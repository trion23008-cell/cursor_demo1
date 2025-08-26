from datetime import datetime
from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel


class LotteryDrawBase(BaseModel):
	lottery_type: str
	issue: str
	numbers: str
	open_time: datetime


class LotteryDrawCreate(BaseModel):
	issue: str
	numbers: str
	open_time: datetime


class LotteryDrawRead(LotteryDrawBase):
	id: int

	class Config:
		from_attributes = True


T = TypeVar("T")


class PageMeta(BaseModel):
	total: int
	page: int
	size: int


class Page(BaseModel, Generic[T]):
	items: List[T]
	meta: PageMeta