import axios from 'axios'

// ── Instancia base ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Interceptor de solicitud — inyecta el JWT automáticamente ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('siscvi_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Interceptor de respuesta — gestión global de sesión expirada ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('siscvi_token')
      localStorage.removeItem('siscvi_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
