import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import api from '../api/client'

interface DrawRead {
	id: number
	lottery_type: string
	issue: string
	numbers: string
	open_time: string
}

interface PageMeta { total: number; page: number; size: number }
interface Page<T> { items: T[]; meta: PageMeta }

const titles: Record<string, string> = {
	HK: '香港六合彩',
	MACAU: '澳门六合彩',
	NEW_HK: '新香港',
}

export default function LotteryDetailPage() {
	const { type = 'HK' } = useParams()
	const [searchParams, setSearchParams] = useSearchParams()
	const page = Number(searchParams.get('page') || '1')
	const size = Number(searchParams.get('size') || '10')
	const [data, setData] = useState<Page<DrawRead> | null>(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		let mounted = true
		async function load() {
			setLoading(true)
			try {
				const res = await api.get<Page<DrawRead>>(`/lotteries/${type}`, { params: { page, size } })
				if (mounted) setData(res.data)
			} finally {
				setLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [type, page, size])

	const next = () => setSearchParams({ page: String(page + 1), size: String(size) })
	const prev = () => setSearchParams({ page: String(Math.max(1, page - 1)), size: String(size) })

	return (
		<div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
			<h2>{titles[type!] || type}</h2>
			<Link to="/">返回首页</Link>
			<div style={{ marginTop: 16 }}>
				{loading && <div>加载中...</div>}
				{data && (
					<div>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead>
								<tr>
									<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>期数</th>
									<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>开奖号码</th>
									<th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>开奖时间</th>
								</tr>
							</thead>
							<tbody>
								{data.items.map(item => (
									<tr key={item.id}>
										<td style={{ borderBottom: '1px solid #f5f5f5', padding: 8 }}>{item.issue}</td>
										<td style={{ borderBottom: '1px solid #f5f5f5', padding: 8 }}>{item.numbers}</td>
										<td style={{ borderBottom: '1px solid #f5f5f5', padding: 8 }}>{item.open_time}</td>
									</tr>
								))}
							</tbody>
						</table>
						<div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
							<button onClick={prev} disabled={page <= 1}>上一页</button>
							<span>第 {data.meta.page} / {Math.ceil(data.meta.total / data.meta.size)} 页</span>
							<button onClick={next} disabled={page >= Math.ceil(data.meta.total / data.meta.size)}>下一页</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}