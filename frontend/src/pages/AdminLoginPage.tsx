import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function AdminLoginPage() {
	const navigate = useNavigate()
	const [username, setUsername] = useState('admin')
	const [password, setPassword] = useState('admin123')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')
		try {
			const res = await api.post('/auth/login', { username, password })
			localStorage.setItem('token', res.data.access_token)
			navigate('/admin/new-hk')
		} catch (err: any) {
			setError(err?.response?.data?.detail || '登录失败')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '0 auto', padding: 16 }}>
			<h2>管理员登录</h2>
			<form onSubmit={submit}>
				<div style={{ marginTop: 12 }}>
					<label>用户名</label>
					<input value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%' }} />
				</div>
				<div style={{ marginTop: 12 }}>
					<label>密码</label>
					<input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%' }} />
				</div>
				{error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
				<div style={{ marginTop: 12 }}>
					<button disabled={loading}>{loading ? '登录中...' : '登录'}</button>
				</div>
			</form>
			<div style={{ marginTop: 16 }}>
				<Link to="/">返回首页</Link>
			</div>
		</div>
	)
}