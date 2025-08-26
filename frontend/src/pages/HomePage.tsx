import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

interface DrawRead {
	id: number
	lottery_type: string
	issue: string
	numbers: string
	open_time: string
}

const cards = [
	{ type: 'HK', title: '香港六合彩', icon: '🀄' },
	{ type: 'MACAU', title: '澳门六合彩', icon: '🎲' },
	{ type: 'NEW_HK', title: '新香港', icon: '🏮' },
]

export default function HomePage() {
	const [latest, setLatest] = useState<Record<string, DrawRead | null>>({})
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		let mounted = true
		async function load() {
			setLoading(true)
			try {
				const results = await Promise.all(
					cards.map(c => api.get<DrawRead[]>(`/lotteries/${c.type}/recent`, { params: { limit: 1 } }))
				)
				if (!mounted) return
				const map: Record<string, DrawRead | null> = {}
				cards.forEach((c, idx) => {
					map[c.type] = results[idx].data[0] || null
				})
				setLatest(map)
			} finally {
				setLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	return (
		<div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
			<h1>{import.meta.env.VITE_APP_TITLE || '彩票中心'}</h1>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
				{cards.map(card => (
					<div key={card.type} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
						<div style={{ fontSize: 32 }}>{card.icon}</div>
						<h3 style={{ marginTop: 8 }}>{card.title}</h3>
						<div style={{ color: '#555' }}>
							{latest[card.type] ? (
								<div>
									<div>最近期数：{latest[card.type]!.issue}</div>
									<div>开奖号码：{latest[card.type]!.numbers}</div>
								</div>
							) : (
								<div>{loading ? '加载中...' : '暂无数据'}</div>
							)}
						</div>
						<div style={{ marginTop: 12 }}>
							<Link to={`/lottery/${card.type}`}>
								<button>查看详情</button>
							</Link>
						</div>
					</div>
				))}
			</div>
			<div style={{ marginTop: 24 }}>
				<Link to="/admin/login">管理员登录</Link>
			</div>
		</div>
	)
}