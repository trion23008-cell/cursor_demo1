from typing import Any, Optional
import json
import redis
from app.core.config import settings


class RedisCache:
	def __init__(self, url: str) -> None:
		self.client = redis.from_url(url, decode_responses=True)

	def get_json(self, key: str) -> Optional[Any]:
		data = self.client.get(key)
		if data is None:
			return None
		return json.loads(data)

	def set_json(self, key: str, value: Any, ex_seconds: int) -> None:
		self.client.set(key, json.dumps(value), ex=ex_seconds)


cache = RedisCache(settings.redis_url)