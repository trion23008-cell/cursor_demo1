from datetime import datetime
from enum import Enum
from sqlalchemy import Integer, String, DateTime, Enum as SqlEnum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class LotteryType(str, Enum):
	HK = "HK"
	MACAU = "MACAU"
	NEW_HK = "NEW_HK"


class LotteryDraw(Base):
	__tablename__ = "lottery_draws"
	__table_args__ = (
		UniqueConstraint("lottery_type", "issue", name="uq_lottery_issue"),
	)

	id: Mapped[int] = mapped_column(Integer, primary_key=True)
	lottery_type: Mapped[LotteryType] = mapped_column(SqlEnum(LotteryType), index=True, nullable=False)
	issue: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
	numbers: Mapped[str] = mapped_column(String(100), nullable=False)
	open_time: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)