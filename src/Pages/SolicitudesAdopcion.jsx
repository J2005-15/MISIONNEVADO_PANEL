import { useState, useEffect, useCallback } from 'react'
import { Heart, Phone, CheckCircle, XCircle, Clock, User, Search, Loader2 } from 'lucide-react'
import api from '../lib/api'

// ─── NORMALIZAR SOLICITUD ────────────────────────────────────────────────────
function normalizarSolicitud(s) {
  return {
    SOLIC_ID:   s.solic_id   ?? s.SOLIC_ID   ?? null,
    ADOPCI_ID:  s.adopci_id  ?? s.ADOPCI_ID  ?? null,
    MASCOTA_NO: s.mascota_no ?? s.MASCOTA_NO ?? '—',
    SOLIC_CE:   s.solic_ce   ?? s.SOLIC_CE   ?? '',
    SOLIC_NO:   s.solic_no   ?? s.SOLIC_NO   ?? '',
    SOLIC_EM:   s.solic_em   ?? s.SOLIC_EM   ?? '',
    SOLIC_TL:   s.solic_tl   ?? s.SOLIC_TL   ?? '',
    SOLIC_MO:   s.solic_mo   ?? s.SOLIC_MO   ?? '',
    SOLIC_ES:   s.solic_es   ?? s.SOLIC_ES   ?? 'Pendiente',
    SOLIC_FE:   (s.solic_fe  ?? s.SOLIC_FE   ?? '').toString().slice(0, 10),
  }
}

// ─── ESTILOS DE ESTADO ────────────────────────────────────────────────────────
const ESTILOS_SOLICITUD = {
  Pendiente:  'bg-amber-100 text-amber-700 border border-amber-200',
  APROBADA:   'bg-green-100 text-green-700 border border-green-200',
  RECHAZADA:  'bg-red-100 text-red-600 border border-red-200',
}

function BadgeSolicitud({ estado }) {
  const label = estado === 'APROBADA' ? 'Aprobada' : estado === 'RECHAZADA' ? 'Rechazada' : 'Pendiente'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ESTILOS_SOLICITUD[estado] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {label}
    </span>
  )
}

const COLUMNAS = ['Fecha', 'Solicitante', 'Teléfono', 'Mascota', 'Estado', 'Acciones']

export default function SolicitudesAdopcion() {
  const [solicitudes,  setSolicitudes]  = useState([])
  const [cargando,     setCargando]     = useState(true)
  const [busqueda,     setBusqueda]     = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/adopciones/solicitudes')
      setSolicitudes((data.registros ?? []).map(normalizarSolicitud))
    } catch (err) {
      console.error('Error al cargar solicitudes:', err.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/adopciones/solicitud/${id}`, { SOLIC_ES: nuevoEstado })
      setSolicitudes(prev =>
        prev.map(s => s.SOLIC_ID === id ? { ...s, SOLIC_ES: nuevoEstado } : s)
      )
    } catch (err) {
      console.error('Error al cambiar estado:', err.message)
    }
  }

  const filtradas  = solicitudes.filter(s =>
    s.SOLIC_NO.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.MASCOTA_NO.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.SOLIC_CE.toLowerCase().includes(busqueda.toLowerCase())
  )

  const pendientes = solicitudes.filter(s => s.SOLIC_ES === 'Pendiente').length
  const aprobadas  = solicitudes.filter(s => s.SOLIC_ES === 'APROBADA').length
  const rechazadas = solicitudes.filter(s => s.SOLIC_ES === 'RECHAZADA').length

  return (
    <div className="space-y-6 max-w-6xl">

      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Adopción Recibidas</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Formularios enviados desde la web pública de Misión Nevado
          </p>
        </div>
      </div>

      {/* ── Tarjetas de conteo ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pendientes</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{pendientes}</p>
            <p className="text-xs text-gray-400 mt-0.5">requieren atención</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-[#FFDF96]/30 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Aprobadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{aprobadas}</p>
            <p className="text-xs text-gray-400 mt-0.5">procesos en curso</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rechazadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{rechazadas}</p>
            <p className="text-xs text-gray-400 mt-0.5">no procedieron</p>
          </div>
        </div>
      </div>

      {/* ── Tabla ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Registro de Solicitudes</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {solicitudes.length} solicitudes en total · {pendientes} requieren acción inmediata
            </p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, cédula o mascota..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {COLUMNAS.map((col, i) => (
                  <th key={col}
                    className={`text-[11px] font-bold text-[#765A05] uppercase tracking-wider px-5 py-3 whitespace-nowrap ${i === COLUMNAS.length - 1 ? 'text-right' : 'text-left'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-[#765A05] animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Cargando solicitudes...</p>
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <Heart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 font-medium">No hay solicitudes registradas</p>
                  </td>
                </tr>
              ) : filtradas.map(s => (
                <tr key={s.SOLIC_ID}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm text-gray-600 font-medium">{s.SOLIC_FE || '—'}</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{s.SOLIC_NO}</p>
                        {s.SOLIC_CE && <p className="text-xs text-gray-400">{s.SOLIC_CE}</p>}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm text-gray-600 font-mono tracking-wide">{s.SOLIC_TL || '—'}</p>
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      {s.MASCOTA_NO}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <BadgeSolicitud estado={s.SOLIC_ES} />
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {s.SOLIC_TL && (
                        <a href={`tel:${s.SOLIC_TL}`}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap">
                          <Phone className="w-3.5 h-3.5" />
                          Llamar
                        </a>
                      )}
                      {s.SOLIC_ES !== 'APROBADA' && (
                        <button onClick={() => cambiarEstado(s.SOLIC_ID, 'APROBADA')}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Aprobar
                        </button>
                      )}
                      {s.SOLIC_ES !== 'RECHAZADA' && (
                        <button onClick={() => cambiarEstado(s.SOLIC_ID, 'RECHAZADA')}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                          <XCircle className="w-3.5 h-3.5" />
                          Rechazar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            {solicitudes.length} solicitudes en el sistema — TT_SOLIC
          </p>
        </div>
      </div>
    </div>
  )
}
