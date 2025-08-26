import { Sequelize, DataTypes } from 'sequelize'
import { config } from './config/config.js'

export const sequelize = new Sequelize(config.databaseUrl, {
	logging: false,
	dialectOptions: {
		charset: 'utf8mb4'
	}
})

export const defineModels = () => {
	const Admin = sequelize.define('Admin', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
		password_hash: { type: DataTypes.STRING(255), allowNull: false },
		created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'admins',
		timestamps: false
	})

	const LotteryDraw = sequelize.define('LotteryDraw', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		lottery_type: { type: DataTypes.ENUM('HK','MACAU','NEW_HK'), allowNull: false },
		issue: { type: DataTypes.STRING(50), allowNull: false },
		numbers: { type: DataTypes.STRING(100), allowNull: false },
		open_time: { type: DataTypes.DATE, allowNull: false },
		created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'lottery_draws',
		indexes: [{ fields: ['lottery_type', 'issue'], unique: true }],
		timestamps: false
	})

	return { Admin, LotteryDraw }
}