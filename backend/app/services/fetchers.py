from datetime import datetime
from typing import List, Dict
import httpx

from app.models.lottery import LotteryType


def _parse_datetime(value: str) -> datetime:
	# Try multiple common formats
	for fmt in ("%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S%z"):
		try:
			return datetime.strptime(value, fmt)
		except Exception:
			continue
	# Fallback to now
	return datetime.utcnow()


async def fetch_hk_recent(limit: int = 10) -> List[Dict]:
	url = "http://free.jiangyuan365.com/K268ab0f2f38532/XGLHC-1.json"
	async with httpx.AsyncClient(timeout=10) as client:
		resp = await client.get(url)
		resp.raise_for_status()
		data = resp.json()
		items: List[Dict] = []
		# Attempt several known shapes
		records = []
		if isinstance(data, dict):
			records = data.get("data") or data.get("list") or data.get("result") or []
		elif isinstance(data, list):
			records = data
		for row in records[:limit]:
			issue = str(row.get("expect") or row.get("issue") or row.get("period") or row.get("id") or "")
			numbers = row.get("opencode") or row.get("numbers") or row.get("openCode") or row.get("code") or ""
			open_time_str = row.get("opentime") or row.get("open_time") or row.get("openTime") or row.get("time") or ""
			items.append({
				"lottery_type": LotteryType.HK.value,
				"issue": issue,
				"numbers": numbers,
				"open_time": _parse_datetime(open_time_str).isoformat(sep=" ") if open_time_str else datetime.utcnow().isoformat(sep=" "),
			})
		return items


async def fetch_macau_recent(limit: int = 10) -> List[Dict]:
	url = "https://macaumarksix.com/api/macaujc2.com"
	async with httpx.AsyncClient(timeout=10) as client:
		resp = await client.get(url)
		resp.raise_for_status()
		data = resp.json()
		items: List[Dict] = []
		records = []
		if isinstance(data, dict):
			records = data.get("data") or data.get("list") or data.get("result") or []
		elif isinstance(data, list):
			records = data
		for row in records[:limit]:
			issue = str(row.get("expect") or row.get("issue") or row.get("period") or row.get("id") or "")
			numbers = row.get("opencode") or row.get("numbers") or row.get("openCode") or row.get("code") or ""
			open_time_str = row.get("opentime") or row.get("open_time") or row.get("openTime") or row.get("time") or ""
			items.append({
				"lottery_type": LotteryType.MACAU.value,
				"issue": issue,
				"numbers": numbers,
				"open_time": _parse_datetime(open_time_str).isoformat(sep=" ") if open_time_str else datetime.utcnow().isoformat(sep=" "),
			})
		return items