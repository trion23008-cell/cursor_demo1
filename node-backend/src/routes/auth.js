import { Router } from 'express'
import bcrypt from 'bcrypt'
import { createAccessToken } from '../utils/jwt.js'
import { sequelize, defineModels } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const { Admin } = defineModels()
export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
	const { username, password } = req.body || {}
	if (!username || !password) return res.status(400).json({ detail: 'Missing credentials' })
	const admin = await Admin.findOne({ where: { username } })
	if (!admin) return res.status(401).json({ detail: 'Invalid credentials' })
	const ok = await bcrypt.compare(password, admin.password_hash)
	if (!ok) return res.status(401).json({ detail: 'Invalid credentials' })
	const token = createAccessToken(admin.username)
	return res.json({ access_token: token, token_type: 'bearer' })
})

authRouter.post('/register', authMiddleware, async (req, res) => {
	const { username, password } = req.body || {}
	if (!username || !password) return res.status(400).json({ detail: 'Missing data' })
	const exists = await Admin.findOne({ where: { username } })
	if (exists) return res.status(400).json({ detail: 'Username already exists' })
	const password_hash = await bcrypt.hash(password, 10)
	await Admin.create({ username, password_hash })
	const token = createAccessToken(username)
	return res.json({ access_token: token, token_type: 'bearer' })
})