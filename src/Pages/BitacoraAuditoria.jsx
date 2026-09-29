import { useState, useEffect } from 'react'
import api from '../lib/api'
import ModalExportarReporte from './ModalExportarReporte'
import {
  Search, Clock, User, Activity, Shield,
  AlertTriangle, CheckCircle, Package, Database,
  ChevronLeft, ChevronRight, ShieldCheck, PawPrint,
  Stethoscope, FileText, Users, Download, XCircle,
} from 'lucide-react'

// ─── CONFIGURACIÓN DE MÓDULOS ─────────────────────────────────────────────────

const MODULOS_FILTRO = ['Todos', 'Acceso', 'Censo Animal', 'Consulta Médica', 'Logística', 'Usuarios', 'Denuncias', 'Sistema']

// ─── NORMALIZAR EVENTO DE TH_AUDIT → forma que usa esta vista ────────────────
// Los módulos se agrupan en las categorías del filtro; el resto cae en 'Sistema'.
const MODULO_POR_CODIGO = {
  'Acceso': 'Acceso', 'Autenticación': 'Acceso',
  'CENSO_ANIMAL': 'Censo Animal',
  'VETERINARIA': 'Consulta Médica', 'Consultas': 'Consulta Médica',
  'INVENTARIO': 'Logística',
  'Usuarios': 'Usuarios',
  'DENUNCIAS': 'Denuncias', 'DENUNCIAS_ADMIN': 'Denuncias', 'Denuncias': 'Denuncias',
}
const ROL_POR_ID = { 1: 'Administrador', 2: 'Veterinario', 3: 'Personal de Campo' }

const formatearMarcaTiempo = (valor) => {
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) return valor ?? ''
  const dos = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())} ${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`
}

const normalizarEvento = (ev) => ({
  ...ev,
  modulo:    MODULO_POR_CODIGO[ev.modulo] ?? 'Sistema',
  tipo:      ev.tipo === 'CRITICO' ? 'CRÍTICO' : ev.tipo,
  usuario:   ev.usuario || 'Visitante web',
  rol:       ROL_POR_ID[ev.rol] ?? ev.rol ?? '—',
  timestamp: formatearMarcaTiempo(ev.timestamp),
})

const ICONO_MODULO = {
  'Acceso':          Shield,
  'Censo Animal':    PawPrint,
  'Consulta Médica': Stethoscope,
  'Logística':       Package,
  'Usuarios':        Users,
  'Denuncias':       FileText,
  'Sistema':         Database,
}

const COLOR_MODULO = {
  'Acceso':          'bg-blue-100   text-blue-700   border-blue-200/60',
  'Censo Animal':    'bg-[#FFDF96]/50 text-[#765A05] border-[#FFDF96]/60',
  'Consulta Médica': 'bg-sky-100    text-sky-700    border-sky-200/60',
  'Logística':       'bg-orange-100 text-orange-700 border-orange-200/60',
  'Usuarios':        'bg-purple-100 text-purple-700 border-purple-200/60',
  'Denuncias':       'bg-rose-100   text-rose-700   border-rose-200/60',
  'Sistema':         'bg-gray-100   text-gray-600   border-gray-200/60',
}

const COLOR_TIPO = {
  'INFO':    'bg-slate-100 text-slate-600 border-slate-200/60',
  'ALERTA':  'bg-amber-100 text-amber-700 border-amber-200/60',
  'CRÍTICO': 'bg-rose-100  text-rose-700  border-rose-200/60',
}

const ICONO_TIPO = {
  'INFO':    CheckCircle,
  'ALERTA':  AlertTriangle,
  'CRÍTICO': XCircle,
}

const EVENTOS_POR_PAGINA = 8

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export default function BitacoraAuditoria() {
  const [eventos,      setEventos]      = useState([])
  const [busqueda,     setBusqueda]     = useState('')
  const [filtroModulo, setFiltroModulo] = useState('Todos')
  const [paginaActual, setPagina]       = useState(1)
  const [modalReporte, setModalReporte] = useState(false)

  useEffect(() => {
    api.get('/bitacora?limite=200')
      .then(r => {
        const datos = r.data.registros ?? []
        setEventos(datos.map(normalizarEvento))
      })
      .catch(() => {})
  }, [])

  const eventosFiltrados = eventos.filter((ev) => {
    const coincideBusqueda =
      String(ev.usuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      String(ev.accion  || '').toLowerCase().includes(busqueda.toLowerCase())
    const coincideModulo = filtroModulo === 'Todos' || ev.modulo === filtroModulo
    return coincideBusqueda && coincideModulo
  })

  const totalPaginas    = Math.max(1, Math.ceil(eventosFiltrados.length / EVENTOS_POR_PAGINA))
  const paginaSegura    = Math.min(paginaActual, totalPaginas)
  const eventosPagina   = eventosFiltrados.slice(
    (paginaSegura - 1) * EVENTOS_POR_PAGINA,
    paginaSegura * EVENTOS_POR_PAGINA,
  )

  const totalCriticos = eventos.filter((ev) => ev.tipo === 'CRÍTICO').length
  const totalAlertas  = eventos.filter((ev) => ev.tipo === 'ALERTA').length

  const cambiarFiltro   = (modulo) => { setFiltroModulo(modulo); setPagina(1) }
  const cambiarBusqueda = (valor)  => { setBusqueda(valor);      setPagina(1) }

  return (
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Bitácora del Sistema</h2>
          <p className="text-sm text-[#765A05]/60 mt-0.5">
            Auditoría completa de eventos, accesos y operaciones — SISCVI · Misión Nevado
          </p>
        </div>
        <button
          onClick={() => setModalReporte(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#765A05] bg-[#FFDF96]/20 hover:bg-[#FFDF96]/40 border border-[#FFDF96]/40 rounded-xl transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>

      {/* ── Métricas rápidas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white/65 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-[#765A05]/8 p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-[#765A05]/10 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-[#765A05]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Eventos Registrados</p>
            <p className="text-3xl font-bold text-gray-800 leading-none mt-1">{eventos.length}</p>
          </div>
        </div>

        <div className="bg-white/65 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-amber-300/15 p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Alertas del Día</p>
            <p className="text-3xl font-bold text-gray-800 leading-none mt-1">{totalAlertas}</p>
          </div>
        </div>

        <div className="bg-white/65 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-rose-300/15 p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Eventos Críticos</p>
            <p className="text-3xl font-bold text-gray-800 leading-none mt-1">{totalCriticos}</p>
          </div>
        </div>

      </div>

      {/* ── Barra de búsqueda + chips de módulo ── */}
      <div className="bg-white/65 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-[#765A05]/5 p-5 space-y-4">

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => cambiarBusqueda(e.target.value)}
            placeholder="Buscar por usuario o por acción registrada..."
            className="pl-10 pr-4 py-2.5 w-full text-sm bg-white/80 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {MODULOS_FILTRO.map((mod) => (
            <button
              key={mod}
              onClick={() => cambiarFiltro(mod)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                filtroModulo === mod
                  ? 'bg-[#765A05] text-white border-[#765A05] shadow-sm'
                  : 'bg-white/60 text-gray-500 border-gray-200 hover:border-[#765A05]/30 hover:text-[#765A05]'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

      </div>

      {/* ── Tabla de eventos ── */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-[#765A05]/5 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">

          <thead className="bg-white/40 border-b border-gray-200/50">
            <tr>
              <th className="px-5 py-3.5 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#765A05] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  Fecha y Hora
                </div>
              </th>
              <th className="px-5 py-3.5 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#765A05] uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  Usuario / Rol
                </div>
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-[#765A05] uppercase tracking-wider">
                Módulo
              </th>
              <th className="px-5 py-3.5 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#765A05] uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  Acción Registrada
                </div>
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-[#765A05] uppercase tracking-wider">
                Tipo
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100/50">
            {eventosPagina.length > 0 ? (
              eventosPagina.map((ev) => {
                const IconoMod  = ICONO_MODULO[ev.modulo] ?? Shield
                const IconoBadge = ICONO_TIPO[ev.tipo]   ?? CheckCircle
                return (
                  <tr key={ev.audit_id ?? ev.id} className="hover:bg-white/50 transition-colors">

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Clock className="w-3 h-3 text-gray-300 shrink-0" />
                        {ev.timestamp}
                      </div>
                    </td>

                    {/* Usuario */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-gray-800 truncate max-w-[200px]">{ev.usuario}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{ev.rol}</p>
                    </td>

                    {/* Módulo */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${COLOR_MODULO[ev.modulo] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        <IconoMod className="w-3 h-3 shrink-0" />
                        {ev.modulo}
                      </span>
                    </td>

                    {/* Acción */}
                    <td className="px-5 py-3.5 text-xs text-gray-700 max-w-[300px]">
                      {ev.accion}
                    </td>

                    {/* Tipo / Severidad */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${COLOR_TIPO[ev.tipo] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        <IconoBadge className="w-3 h-3 shrink-0" />
                        {ev.tipo}
                      </span>
                    </td>

                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No se encontraron eventos para{' '}
                  <span className="font-medium text-gray-600">"{busqueda}"</span>
                  {filtroModulo !== 'Todos' && (
                    <> en el módulo <span className="font-medium text-gray-600">"{filtroModulo}"</span></>
                  )}.
                </td>
              </tr>
            )}
          </tbody>

        </table>
        </div>
      </div>

      {/* ── Paginación ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-1">
        <p className="text-sm text-[#765A05] font-medium">
          Mostrando {eventosPagina.length} de {eventosFiltrados.length} eventos
          {filtroModulo !== 'Todos' && <span className="text-[#765A05]/50"> · filtrado por "{filtroModulo}"</span>}
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={paginaSegura === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 rounded-xl hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPagina(n)}
              className={`w-8 h-8 rounded-xl text-sm font-bold transition-all ${
                paginaSegura === n
                  ? 'bg-[#765A05] text-white shadow-md shadow-[#765A05]/20 scale-105'
                  : 'text-gray-600 hover:bg-white/60'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaSegura === totalPaginas}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 rounded-xl hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {modalReporte && <ModalExportarReporte onCerrar={() => setModalReporte(false)} />}

    </div>
  )
}
