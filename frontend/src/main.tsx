import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import HomePage from './pages/HomePage'
import LotteryDetailPage from './pages/LotteryDetailPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminNewHKPage from './pages/AdminNewHKPage'

const router = createBrowserRouter([
	{ path: '/', element: <HomePage /> },
	{ path: '/lottery/:type', element: <LotteryDetailPage /> },
	{ path: '/admin/login', element: <AdminLoginPage /> },
	{ path: '/admin/new-hk', element: <AdminNewHKPage /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
)
