import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login         from './Pages/Login'
import PanelPrincipal from './Pages/PanelPrincipal'
import { rolDeSesion, cerrarSesionLocal } from './lib/roles'

// ── Guarda de ruta privada ─────────────────────────────────────────────────────
// Requiere token Y un rol reconocido; si el rol no es válido se cierra la sesión.
function RutaPrivada({ children }) {
  const token = localStorage.getItem('siscvi_token')
  if (token && rolDeSesion()) return children
  cerrarSesionLocal()
  return <Navigate to="/login" replace />
}

// ── App principal ──────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate()

  const manejarLoginExitoso = () => {
    navigate('/panel', { replace: true })
  }

  const manejarLogout = () => {
    cerrarSesionLocal()
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
              rolInicial={rolDeSesion()}
            />
          </RutaPrivada>
        }
      />

      {/* ── Cualquier ruta desconocida → login ─────────────────────────── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
