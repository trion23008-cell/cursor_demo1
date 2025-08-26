import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'

export function createAccessToken(subject) {
	const expiresIn = `${config.tokenExpiresMinutes}m`
	return jwt.sign({ sub: subject }, config.secretKey, { algorithm: 'HS256', expiresIn })
}

export function verifyToken(token) {
	return jwt.verify(token, config.secretKey)
}