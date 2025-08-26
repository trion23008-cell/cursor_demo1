from datetime import datetime
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.lottery import LotteryDraw, LotteryType
from app.services.cache import cache
from app.services.fetchers import fetch_hk_recent, fetch_macau_recent

CACHE_SECONDS = 600


def normalize_numbers(numbers: str) -> str:
	# Ensure numbers are in comma-separated format without spaces
	parts = [p.strip() for p in numbers.replace(" ", ",").replace("|", ",").split(",") if p.strip()]
	return ",".join(parts)


async def get_recent_draws(db: Session, lottery_type: LotteryType, limit: int = 10) -> List[Dict]:
	cache_key = f"recent:{lottery_type.value}:{limit}"
	cached = cache.get_json(cache_key)
	if cached:
		return cached

	items: List[Dict]
	if lottery_type == LotteryType.HK:
		items = await fetch_hk_recent(limit=limit)
	elif lottery_type == LotteryType.MACAU:
		items = await fetch_macau_recent(limit=limit)
	else:
		# From DB for NEW_HK
		stmt = select(LotteryDraw).where(LotteryDraw.lottery_type == lottery_type).order_by(LotteryDraw.open_time.desc()).limit(limit)
		rows = db.execute(stmt).scalars().all()
		items = [
			{
				"id": row.id,
				"lottery_type": row.lottery_type.value,
				"issue": row.issue,
				"numbers": row.numbers,
				"open_time": row.open_time.isoformat(sep=" ")
			}
			for row in rows
		]
		cache.set_json(cache_key, items, ex_seconds=CACHE_SECONDS)
		return items

	# Persist external draws to DB (upsert by unique issue)
	for item in items:
		issue = item.get("issue") or ""
		numbers = normalize_numbers(item.get("numbers") or "")
		open_time_str = item.get("open_time") or ""
		open_time = datetime.fromisoformat(open_time_str.replace("Z", "").replace("T", " ")) if open_time_str else datetime.utcnow()
		existing = db.execute(
			select(LotteryDraw).where(
				LotteryDraw.lottery_type == lottery_type,
				LotteryDraw.issue == str(issue),
			)
		).scalar_one_or_none()
		if existing is None:
			row = LotteryDraw(lottery_type=lottery_type, issue=str(issue), numbers=numbers, open_time=open_time)
			db.add(row)
	try:
		db.commit()
	except Exception:
		db.rollback()

	cache.set_json(cache_key, items, ex_seconds=CACHE_SECONDS)
	return items


def get_paginated_draws(db: Session, lottery_type: LotteryType, page: int, size: int) -> Tuple[List[LotteryDraw], int]:
	offset = (page - 1) * size
	count_stmt = select(func.count()).select_from(LotteryDraw).where(LotteryDraw.lottery_type == lottery_type)
	total = db.execute(count_stmt).scalar_one()
	stmt = (
		select(LotteryDraw)
		.where(LotteryDraw.lottery_type == lottery_type)
		.order_by(LotteryDraw.open_time.desc())
		.offset(offset)
		.limit(size)
	)
	rows = db.execute(stmt).scalars().all()
	return rows, int(total)


def create_new_hk_draw(db: Session, issue: str, numbers: str, open_time: datetime) -> LotteryDraw:
	numbers_norm = normalize_numbers(numbers)
	draw = LotteryDraw(lottery_type=LotteryType.NEW_HK, issue=str(issue), numbers=numbers_norm, open_time=open_time)
	db.add(draw)
	db.commit()
	db.refresh(draw)
	# Invalidate caches
	cache.set_json("recent:NEW_HK:10", None, ex_seconds=1)
	return draw