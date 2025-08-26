import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import { sequelize, defineModels } from '../db.js'

const { Admin } = defineModels()

export async function authMiddleware(req, res, next) {
	const auth = req.headers['authorization'] || ''
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
	if (!token) return res.status(401).json({ detail: 'Unauthorized' })
	try {
		const payload = jwt.verify(token, config.secretKey)
		const username = payload.sub
		const admin = await Admin.findOne({ where: { username } })
		if (!admin) return res.status(401).json({ detail: 'Unauthorized' })
		req.admin = admin
		next()
	} catch (e) {
		return res.status(401).json({ detail: 'Unauthorized' })
	}
}