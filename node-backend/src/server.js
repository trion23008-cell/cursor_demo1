import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bcrypt from 'bcrypt'
import { config } from './config/config.js'
import { sequelize, defineModels } from './db.js'
import { authRouter } from './routes/auth.js'
import { lotteriesRouter } from './routes/lotteries.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: config.corsOrigins, credentials: true }))
app.use(express.json())

app.get('/', (req, res) => res.json({ name: config.appName }))

app.use(config.apiPrefix + '/auth', authRouter)
app.use(config.apiPrefix + '/lotteries', lotteriesRouter)

async function start() {
	const { Admin } = defineModels()
	await sequelize.authenticate()
	await sequelize.sync()
	// seed admin
	const username = config.defaultAdminUsername
	const password = config.defaultAdminPassword
	const found = await Admin.findOne({ where: { username } })
	if (!found) {
		const password_hash = await bcrypt.hash(password, 10)
		await Admin.create({ username, password_hash })
	}
	app.listen(config.port, () => {
		console.log(`Server running on :${config.port}`)
	})
}

start().catch(err => {
	console.error('Failed to start server', err)
	process.exit(1)
})