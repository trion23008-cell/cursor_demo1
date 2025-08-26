import axios from 'axios'

function parseDate(value) {
	const tryFormats = [
		'YYYY-MM-DD HH:mm:ss',
		'YYYY/MM/DD HH:mm:ss',
	]
	const d = new Date(value)
	return isNaN(d.getTime()) ? new Date() : d
}

export async function fetchHKRecent(limit = 10) {
	const url = 'http://free.jiangyuan365.com/K268ab0f2f38532/XGLHC-1.json'
	const { data } = await axios.get(url, { timeout: 10000 })
	const list = Array.isArray(data) ? data : (data?.data || data?.list || data?.result || [])
	return list.slice(0, limit).map(row => ({
		lottery_type: 'HK',
		issue: String(row.expect || row.issue || row.period || row.id || ''),
		numbers: String(row.opencode || row.numbers || row.openCode || row.code || ''),
		open_time: parseDate(row.opentime || row.open_time || row.openTime || row.time || new Date()).toISOString(),
	}))
}

export async function fetchMacauRecent(limit = 10) {
	const url = 'https://macaumarksix.com/api/macaujc2.com'
	const { data } = await axios.get(url, { timeout: 10000 })
	const list = Array.isArray(data) ? data : (data?.data || data?.list || data?.result || [])
	return list.slice(0, limit).map(row => ({
		lottery_type: 'MACAU',
		issue: String(row.expect || row.issue || row.period || row.id || ''),
		numbers: String(row.opencode || row.numbers || row.openCode || row.code || ''),
		open_time: parseDate(row.opentime || row.open_time || row.openTime || row.time || new Date()).toISOString(),
	}))
}