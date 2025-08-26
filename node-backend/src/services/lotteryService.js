import { Op } from 'sequelize'
import { sequelize, defineModels } from '../db.js'
import { getJson, setJson } from './cache.js'
import { fetchHKRecent, fetchMacauRecent } from './fetchers.js'

const { LotteryDraw } = defineModels()
const CACHE_SECONDS = 600

function normalizeNumbers(numbers) {
	return numbers.replace(/\s+/g, ',').replace(/\|/g, ',').split(',').map(s => s.trim()).filter(Boolean).join(',')
}

export async function getRecentDraws(lotteryType, limit = 10) {
	const key = `recent:${lotteryType}:${limit}`
	const cached = await getJson(key)
	if (cached) return cached
	let items
	if (lotteryType === 'HK') items = await fetchHKRecent(limit)
	else if (lotteryType === 'MACAU') items = await fetchMacauRecent(limit)
	else {
		const rows = await LotteryDraw.findAll({ where: { lottery_type: 'NEW_HK' }, order: [['open_time','DESC']], limit })
		items = rows.map(r => ({ id: r.id, lottery_type: r.lottery_type, issue: r.issue, numbers: r.numbers, open_time: r.open_time.toISOString() }))
		await setJson(key, items, CACHE_SECONDS)
		return items
	}
	// upsert into DB
	for (const item of items) {
		const issue = String(item.issue || '')
		const numbers = normalizeNumbers(item.numbers || '')
		const openTime = new Date(item.open_time)
		await LotteryDraw.findOrCreate({
			where: { lottery_type: lotteryType, issue },
			defaults: { lottery_type: lotteryType, issue, numbers, open_time: openTime }
		})
	}
	await setJson(key, items, CACHE_SECONDS)
	return items
}

export async function getPaginatedDraws(lotteryType, page = 1, size = 10) {
	const offset = (page - 1) * size
	const { rows, count } = await LotteryDraw.findAndCountAll({
		where: { lottery_type: lotteryType },
		order: [['open_time','DESC']],
		limit: size,
		offset,
	})
	return { items: rows, total: count }
}

export async function createNewHK(issue, numbers, openTimeStr) {
	const open_time = new Date(openTimeStr)
	const numbersNorm = normalizeNumbers(numbers)
	const row = await LotteryDraw.create({ lottery_type: 'NEW_HK', issue: String(issue), numbers: numbersNorm, open_time })
	// invalidate cache by setting short ttl
	await setJson('recent:NEW_HK:10', null, 1)
	return row
}