import Redis from 'ioredis'
import { config } from '../config/config.js'

export const redis = new Redis(config.redisUrl)

export async function getJson(key) {
	const val = await redis.get(key)
	if (!val) return null
	try { return JSON.parse(val) } catch { return null }
}

export async function setJson(key, value, ttlSeconds) {
	await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
}