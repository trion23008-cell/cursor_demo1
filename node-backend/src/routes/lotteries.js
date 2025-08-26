import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { defineModels } from '../db.js'
import { getRecentDraws, getPaginatedDraws, createNewHK } from '../services/lotteryService.js'

const { LotteryDraw } = defineModels()
export const lotteriesRouter = Router()

lotteriesRouter.get('/:lottery_type/recent', async (req, res) => {
	const { lottery_type } = req.params
	const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50)
	try {
		const items = await getRecentDraws(lottery_type, limit)
		// ensure id
		const results = []
		for (const item of items) {
			if (item.id == null) {
				const found = await LotteryDraw.findOne({ where: { lottery_type, issue: String(item.issue) } })
				if (found) item.id = found.id
			}
			results.push({ id: item.id, lottery_type: item.lottery_type, issue: item.issue, numbers: item.numbers, open_time: item.open_time })
		}
		return res.json(results)
	} catch (e) {
		return res.status(500).json({ detail: 'Failed to load recent' })
	}
})

lotteriesRouter.get('/:lottery_type', async (req, res) => {
	const { lottery_type } = req.params
	const page = Math.max(parseInt(req.query.page || '1', 10), 1)
	const size = Math.min(Math.max(parseInt(req.query.size || '10', 10), 1), 100)
	try {
		const { items, total } = await getPaginatedDraws(lottery_type, page, size)
		return res.json({ items, meta: { total, page, size } })
	} catch (e) {
		return res.status(500).json({ detail: 'Failed to load page' })
	}
})

lotteriesRouter.post('/NEW_HK', authMiddleware, async (req, res) => {
	const { issue, numbers, open_time } = req.body || {}
	if (!issue || !numbers || !open_time) return res.status(400).json({ detail: 'Missing data' })
	try {
		const row = await createNewHK(issue, numbers, open_time)
		return res.json(row)
	} catch (e) {
		return res.status(500).json({ detail: 'Create failed' })
	}
})