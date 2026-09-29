import { useState, useEffect } from 'react'
import { ThumbsUp, X } from 'lucide-react'
import api from '../lib/api'

// Mismos estilos de los modales del panel (ver ModalRegistrarOperacion en GestionJornadas)
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'

// ─── MODAL: APROBAR ADOPCIÓN ──────────────────────────────────────────────────
// Pide cédula y sector del adoptante (datos que toma el personal en la
// capacitación presencial); con ellos el backend registra al animal en el
// Censo con su nuevo dueño.
// solicitud: { id, solicitante, cedula, mascota }
export default function ModalAprobarAdopcion({ solicitud, onAprobada, onCerrar }) {
  const cedulaInicial = /\d{5,}/.test(solicitud.cedula ?? '') ? solicitud.cedula : ''
  const [datos,     setDatos]     = useState({ PERSON_CE: cedulaInicial, SECTOR_ID: '' })
  const [sectores,  setSectores]  = useState([])
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    api.get('/catalogos/sectores')
      .then(r => setSectores(r.data.registros ?? []))
      .catch(() => setError('No se pudieron cargar los sectores'))
  }, [])

  const cambiar = ({ target: { name, value } }) =>
    setDatos(p => ({ ...p, [name]: value }))

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      const { data } = await api.patch(`/adopciones/solicitud/${solicitud.id}`, {
        SOLIC_ES:  'APROBADA',
        PERSON_CE: datos.PERSON_CE.trim(),
        SECTOR_ID: Number(datos.SECTOR_ID),
      })
      onAprobada(data)
    } catch (err) {
      setError(err.response?.data?.mensaje ?? 'Error al aprobar la adopción')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Aprobar Adopción</h3>
              <p className="text-xs text-gray-400 truncate max-w-[210px]">
                {solicitud.mascota} → {solicitud.solicitante}
              </p>
            </div>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={enviar} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}

          <p className="text-xs text-gray-500 leading-relaxed">
            Al aprobar, el animal queda como <span className="font-semibold">adoptado</span> y se
            registra en el Censo Animal con el adoptante como propietario.
          </p>

          <div>
            <label className={eLabel}>Cédula del Adoptante *</label>
            <input name="PERSON_CE" required value={datos.PERSON_CE} onChange={cambiar}
              placeholder="Ej: V-12345678" className={eInput} />
          </div>

          <div>
            <label className={eLabel}>Sector donde vivirá el animal *</label>
            <select name="SECTOR_ID" required value={datos.SECTOR_ID} onChange={cambiar} className={eInput}>
              <option value="">Seleccionar sector…</option>
              {sectores.map(s => (
                <option key={s.sector_id} value={s.sector_id}>{s.sector_no}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onCerrar}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-400">
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <ThumbsUp className="w-4 h-4" />
              {guardando ? 'Aprobando...' : 'Aprobar Adopción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
