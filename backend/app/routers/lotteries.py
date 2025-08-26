from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.lottery import LotteryType, LotteryDraw
from app.schemas.lottery import LotteryDrawCreate, LotteryDrawRead, Page, PageMeta
from app.core.security import get_current_admin
from app.services.lottery_service import get_recent_draws, get_paginated_draws, create_new_hk_draw


router = APIRouter(prefix="/lotteries")


@router.get("/{lottery_type}/recent", response_model=List[LotteryDrawRead])
async def recent_draws(lottery_type: LotteryType, limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
	items = await get_recent_draws(db, lottery_type, limit=limit)
	# Ensure id present for external types by mapping DB if missing
	result: List[LotteryDrawRead] = []
	for item in items:
		if "id" not in item:
			# attempt to find id by issue
			row = db.query(LotteryDraw).filter(
				LotteryDraw.lottery_type == lottery_type,
				LotteryDraw.issue == str(item.get("issue")),
			).first()
			if row:
				item["id"] = row.id
		result.append(LotteryDrawRead(**item))
	return result


@router.get("/{lottery_type}", response_model=Page[LotteryDrawRead])
def paginated_draws(lottery_type: LotteryType, page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
	rows, total = get_paginated_draws(db, lottery_type, page, size)
	items = [LotteryDrawRead.model_validate(row) for row in rows]
	return Page(items=items, meta=PageMeta(total=total, page=page, size=size))


@router.post("/NEW_HK", response_model=LotteryDrawRead)
def create_new_hk(payload: LotteryDrawCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
	row = create_new_hk_draw(db, issue=payload.issue, numbers=payload.numbers, open_time=payload.open_time)
	return LotteryDrawRead.model_validate(row)