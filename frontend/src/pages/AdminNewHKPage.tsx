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

export default function AdminNewHKPage() {
	const [issue, setIssue] = useState('')
	const [numbers, setNumbers] = useState('1,2,3,4,5,6,7')
	const [openTime, setOpenTime] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [latest, setLatest] = useState<DrawRead[]>([])

	useEffect(() => {
		refresh()
	}, [])

	async function refresh() {
		const res = await api.get<DrawRead[]>(`/lotteries/NEW_HK/recent`, { params: { limit: 10 } })
		setLatest(res.data)
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError('')
		try {
			await api.post('/lotteries/NEW_HK', {
				issue,
				numbers,
				open_time: openTime,
			})
			setIssue('')
			setNumbers('')
			setOpenTime('')
			await refresh()
		} catch (err: any) {
			setError(err?.response?.data?.detail || '提交失败')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
			<h2>新香港开奖号码录入</h2>
			<form onSubmit={submit}>
				<div style={{ display: 'grid', gap: 12 }}>
					<label>
						期数
						<input value={issue} onChange={e => setIssue(e.target.value)} style={{ width: '100%' }} />
					</label>
					<label>
						开奖号码（用逗号分隔）
						<input value={numbers} onChange={e => setNumbers(e.target.value)} style={{ width: '100%' }} />
					</label>
					<label>
						开奖时间（YYYY-MM-DD HH:mm:ss）
						<input value={openTime} onChange={e => setOpenTime(e.target.value)} style={{ width: '100%' }} placeholder="2025-01-01 20:30:00" />
					</label>
					{error && <div style={{ color: 'red' }}>{error}</div>}
					<div>
						<button disabled={loading}>{loading ? '提交中...' : '提交'}</button>
					</div>
				</div>
			</form>

			<h3 style={{ marginTop: 24 }}>最近 10 期</h3>
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					<tr>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>期数</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>开奖号码</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>开奖时间</th>
					</tr>
				</thead>
				<tbody>
					{latest.map(item => (
						<tr key={item.id}>
							<td style={{ borderBottom: '1px solid #f5f5f5', padding: 8 }}>{item.issue}</td>
							<td style={{ borderBottom: '1px solid #f5f5f5', padding: 8 }}>{item.numbers}</td>
							<td style={{ borderBottom: '1px solid #f5f5f5', padding: 8 }}>{item.open_time}</td>
						</tr>
					))}
				</tbody>
			</table>

			<div style={{ marginTop: 16 }}>
				<Link to="/">返回首页</Link>
			</div>
		</div>
	)
}