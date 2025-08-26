import dotenv from 'dotenv'
dotenv.config()

export const config = {
	appName: process.env.APP_NAME || 'Lottery Service',
	apiPrefix: process.env.API_PREFIX || '/api',
	secretKey: process.env.SECRET_KEY || 'change-me',
	algorithm: process.env.ALGORITHM || 'HS256',
	tokenExpiresMinutes: Number(process.env.ACCESS_TOKEN_EXPIRES_MINUTES || 1440),
	databaseUrl: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/lottery',
	redisUrl: process.env.REDIS_URL || 'redis://localhost:6379/0',
	corsOrigins: (process.env.CORS_ORIGINS ? JSON.parse(process.env.CORS_ORIGINS) : ['*']),
	defaultAdminUsername: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
	defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
	port: Number(process.env.PORT || 8000)
}