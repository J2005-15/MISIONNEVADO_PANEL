import { useState } from 'react'
import { Download, X, FileText } from 'lucide-react'
import api from '../lib/api'
import Logo from '../assets/Logo.png'
import { construirReporteHTML, imprimirReporte } from '../lib/reporteSistema'

// Mismos estilos de los modales del panel (ver ModalAprobarAdopcion)
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'

const hoy = () => new Date().toLocaleDateString('en-CA')   // YYYY-MM-DD local
const inicioDeMes = () => `${hoy().slice(0, 8)}01`

// ─── MODAL: EXPORTAR REPORTE GENERAL DEL SISTEMA ─────────────────────────────
export default function ModalExportarReporte({ onCerrar }) {
  const [periodo,   setPeriodo]   = useState({ desde: inicioDeMes(), hasta: hoy() })
  const [generando, setGenerando] = useState(false)
  const [error,     setError]     = useState('')

  const cambiar = ({ target: { name, value } }) => setPeriodo(p => ({ ...p, [name]: value }))

  const generar = async (e) => {
    e.preventDefault()
    if (periodo.desde > periodo.hasta) {
      setError('La fecha "desde" no puede ser posterior a la fecha "hasta".')
      return
    }
    setError('')
    setGenerando(true)
    try {
      const { data } = await api.get('/reportes/sistema', { params: periodo })
      imprimirReporte(construirReporteHTML(data, new URL(Logo, window.location.href).href))
      onCerrar()
    } catch (err) {
      setError(err.response?.data?.mensaje ?? 'No se pudo generar el reporte.')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFDF96]/40 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#765A05]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Exportar Reporte del Sistema</h3>
              <p className="text-xs text-gray-400">Resumen general, censo, stock y bitácora</p>
            </div>
          </div>
          <button type="button" onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={generar} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}

          <p className="text-xs text-gray-500 leading-relaxed">
            Incluye el resumen de todos los módulos, los animales censados y los movimientos del censo,
            el stock actual con sus movimientos, las colaboraciones y las alertas de la bitácora del periodo.
            Se abrirá la ventana de impresión: elija <span className="font-semibold">“Guardar como PDF”</span> para descargarlo.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={eLabel}>Desde *</label>
              <input type="date" name="desde" required max={hoy()} value={periodo.desde} onChange={cambiar} className={eInput} />
            </div>
            <div>
              <label className={eLabel}>Hasta *</label>
              <input type="date" name="hasta" required max={hoy()} value={periodo.hasta} onChange={cambiar} className={eInput} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onCerrar}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-400">
              Cancelar
            </button>
            <button type="submit" disabled={generando}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#765A05] hover:bg-[#5c4504] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              {generando ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
