import axios from 'axios'

// ── Instancia base ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  // Render (plan gratuito) puede tardar ~50 s en "despertar" tras un rato sin uso
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Interceptor de solicitud — inyecta el JWT automáticamente ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('siscvi_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Con la cabecera JSON por defecto, axios convierte un FormData en JSON y los
    // archivos (fotos) se pierden. Sin Content-Type, se envía como multipart real.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      config.headers.delete('Content-Type')
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Interceptor de respuesta — gestión global de sesión expirada ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Un 401 en el propio login son credenciales incorrectas, no sesión vencida:
    // no se redirige, para que Login pueda mostrar el mensaje.
    const esLogin = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !esLogin) {
      localStorage.removeItem('siscvi_token')
      localStorage.removeItem('siscvi_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
