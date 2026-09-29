import { useState } from 'react'
import { Trash2, X, Lock, Eye, EyeOff } from 'lucide-react'

// Mismos estilos de los modales del panel (ver ModalAprobarAdopcion)
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'

// ─── MODAL: CONFIRMAR ELIMINACIÓN CON CONTRASEÑA ─────────────────────────────
// accion(clave): promesa que hace la eliminación en el backend. Si falla
// (contraseña incorrecta, registro con historial, etc.) el mensaje se muestra
// aquí mismo y el modal sigue abierto.
export default function ModalConfirmarClave({ titulo, mensaje, accion, onListo }) {
  const [clave,     setClave]     = useState('')
  const [verClave,  setVerClave]  = useState(false)
  const [enviando,  setEnviando]  = useState(false)
  const [error,     setError]     = useState('')

  const confirmar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await accion(clave)
      onListo(true)
    } catch (err) {
      setError(err.response?.data?.mensaje ?? 'No se pudo completar la eliminación.')
      setClave('')
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{titulo}</h3>
              <p className="text-xs text-gray-400">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button type="button" onClick={() => onListo(false)} disabled={enviando}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={confirmar} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}

          <p className="text-sm text-gray-600 leading-relaxed">{mensaje}</p>

          <div>
            <label className={eLabel}>Escriba su contraseña para confirmar *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type={verClave ? 'text' : 'password'}
                required
                autoFocus
                autoComplete="current-password"
                value={clave}
                onChange={e => setClave(e.target.value)}
                placeholder="••••••••"
                className={eInput + ' pl-10 pr-11'}
              />
              <button type="button" onClick={() => setVerClave(v => !v)} tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {verClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => onListo(false)} disabled={enviando}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-400">
              Cancelar
            </button>
            <button type="submit" disabled={enviando || !clave}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <Trash2 className="w-4 h-4" />
              {enviando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
