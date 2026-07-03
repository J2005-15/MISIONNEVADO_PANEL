import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login         from './Pages/Login'
import PanelPrincipal from './Pages/PanelPrincipal'

// ── Guarda de ruta privada ─────────────────────────────────────────────────────
function RutaPrivada({ children }) {
  const token = localStorage.getItem('siscvi_token')
  return token ? children : <Navigate to="/login" replace />
}

// ── Normaliza cualquier variante del rol al código interno del sistema ─────────
function normalizarRol(rolRaw) {
  const r = (rolRaw || '').toUpperCase().trim()
  if (!r) return 'ADMINISTRADOR'
  if (r === 'ADMINISTRADOR' || r === 'ADMIN') return 'ADMINISTRADOR'
  if (r === 'VETERINARIO'   || r === 'VET')   return 'VETERINARIO'
  // Cubre: 'CAMPO', 'OPERADOR', 'PERSONAL DE CAMPO', 'PERSONAL CAMPO', etc.
  if (r.includes('CAMPO') || r.includes('OPERADOR')) return 'CAMPO'
  // Fallback seguro: si nada coincide, tratar como ADMINISTRADOR
  return 'ADMINISTRADOR'
}

// ── Lee el rol del usuario desde localStorage ──────────────────────────────────
function obtenerRolGuardado() {
  try {
    const raw = localStorage.getItem('siscvi_usuario')
    if (!raw) return 'ADMINISTRADOR'
    const usuario = JSON.parse(raw)
    const rolNorm = normalizarRol(usuario.ROLREG_NO)
    console.log('[SISCVI] ROLREG_NO en BD:', usuario.ROLREG_NO, '→ normalizado:', rolNorm)
    return rolNorm
  } catch {
    return 'ADMINISTRADOR'
  }
}

// ── App principal ──────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate()

  const manejarLoginExitoso = () => {
    navigate('/panel', { replace: true })
  }

  const manejarLogout = () => {
    localStorage.removeItem('siscvi_token')
    localStorage.removeItem('siscvi_usuario')
    navigate('/login', { replace: true })
  }

  return (
    <Routes>
      {/* ── Entrada: redirige siempre a login ──────────────────────────── */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ── Autenticación ──────────────────────────────────────────────── */}
      <Route
        path="/login"
        element={<Login onLoginSuccess={manejarLoginExitoso} />}
      />

      {/* ── Panel administrativo (privado) ─────────────────────────────── */}
      <Route
        path="/panel"
        element={
          <RutaPrivada>
            <PanelPrincipal
              onLogout={manejarLogout}
              rolInicial={obtenerRolGuardado()}
            />
          </RutaPrivada>
        }
      />

      {/* ── Cualquier ruta desconocida → login ─────────────────────────── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
