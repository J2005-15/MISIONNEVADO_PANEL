import { useState, useEffect, useCallback } from 'react'
import { Banknote, ShieldCheck, XCircle, TrendingUp, CheckCircle, Clock, AlertCircle, Search, Loader2 } from 'lucide-react'
import api from '../lib/api'

// ─── NORMALIZAR REGISTRO DE TT_COLAB ─────────────────────────────────────────
function normalizarDonacion(c) {
  return {
    COLAB_ID: c.colab_id ?? c.COLAB_ID ?? null,
    COLAB_CO: c.colab_co ?? c.COLAB_CO ?? '—',
    COLAB_TI: c.colab_ti ?? c.COLAB_TI ?? '—',
    COLAB_ES: c.colab_es ?? c.COLAB_ES ?? 'Recibida',
  }
}

// ─── BADGE ESTADO ─────────────────────────────────────────────────────────────
const ESTILOS_ES = {
  Recibida:     'bg-amber-100 text-amber-700 border border-amber-200',
  Confirmada:   'bg-green-100 text-green-700 border border-green-200',
  'En Proceso': 'bg-sky-100 text-sky-700 border border-sky-200',
  Rechazada:    'bg-red-100 text-red-600 border border-red-200',
}

function BadgeEstado({ estado }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${ESTILOS_ES[estado] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {estado}
    </span>
  )
}

const COLUMNAS = ['ID Colaboración', 'Donante / Entidad', 'Tipo', 'Estado', 'Acciones']

export default function ControlDonaciones() {
  const [donaciones,  setDonaciones]  = useState([])
  const [cargando,    setCargando]    = useState(true)
  const [busqueda,    setBusqueda]    = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/colaboraciones')
      const todas = (data.registros ?? []).map(normalizarDonacion)
      // Mostrar solo las que son de tipo Donación
      setDonaciones(todas.filter(c => c.COLAB_TI === 'Donación'))
    } catch (err) {
      console.error('Error al cargar donaciones:', err.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/colaboraciones/${id}`, { COLAB_ES: nuevoEstado })
      setDonaciones(prev =>
        prev.map(d => d.COLAB_ID === id ? { ...d, COLAB_ES: nuevoEstado } : d)
      )
    } catch (err) {
      console.error('Error al cambiar estado:', err.message)
    }
  }

  const filtradas    = donaciones.filter(d =>
    d.COLAB_CO.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(d.COLAB_ID).toLowerCase().includes(busqueda.toLowerCase())
  )

  const confirmadas  = donaciones.filter(d => d.COLAB_ES === 'Confirmada').length
  const porVerificar = donaciones.filter(d => d.COLAB_ES === 'Recibida').length
  const rechazadas   = donaciones.filter(d => d.COLAB_ES === 'Rechazada').length

  return (
    <div className="space-y-6 max-w-6xl">

      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
          <Banknote className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control y Auditoría de Donaciones</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Colaboraciones de tipo Donación — TT_COLAB
          </p>
        </div>
      </div>

      {/* ── Tarjetas de resumen ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#765A05] to-[#5a4304] rounded-2xl shadow-md p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-green-200 uppercase tracking-wider">Total Donaciones</p>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white leading-tight">{donaciones.length}</p>
            <p className="text-xs text-green-200 mt-1">registros en el sistema</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Por Verificar</p>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{porVerificar}</p>
          <p className="text-xs text-gray-400 mt-1">Recibidas / pendientes</p>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Confirmadas</p>
            <div className="w-8 h-8 bg-[#FFDF96]/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{confirmadas}</p>
          <p className="text-xs text-gray-400 mt-1">Donaciones validadas</p>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rechazadas</p>
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{rechazadas}</p>
          <p className="text-xs text-gray-400 mt-1">No procedieron</p>
        </div>
      </div>

      {/* ── Tabla ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-gray-700">Historial de Donaciones</p>
            <p className="text-xs text-gray-400 mt-0.5">{donaciones.length} donaciones registradas</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por donante o ID..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
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
                    <p className="text-sm text-gray-400">Cargando donaciones...</p>
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <Banknote className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 font-medium">No hay donaciones registradas</p>
                  </td>
                </tr>
              ) : filtradas.map(d => (
                <tr key={d.COLAB_ID}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <code className="text-xs font-mono bg-[#FFDF96]/20 text-[#765A05] px-2 py-1 rounded-md border border-[#FFDF96]/40 tracking-wider">
                      {d.COLAB_ID}
                    </code>
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">{d.COLAB_CO}</p>
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                      {d.COLAB_TI}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <BadgeEstado estado={d.COLAB_ES} />
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {d.COLAB_ES !== 'Confirmada' && (
                        <button onClick={() => cambiarEstado(d.COLAB_ID, 'Confirmada')}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Confirmar
                        </button>
                      )}
                      {d.COLAB_ES !== 'Rechazada' && (
                        <button onClick={() => cambiarEstado(d.COLAB_ID, 'Rechazada')}
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
          <p className="text-xs text-gray-400">{donaciones.length} donaciones en el sistema — TT_COLAB</p>
        </div>
      </div>
    </div>
  )
}
