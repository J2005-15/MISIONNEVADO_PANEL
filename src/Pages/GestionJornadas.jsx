import { useState, useEffect, useCallback } from 'react'
import {
  Calendar, MapPin, Plus, Search, CalendarDays, Save, X,
  CheckCircle, Clock, FileText, AlertTriangle, Trash2,
  ChevronLeft, ChevronRight, ClipboardList, Pencil,
} from 'lucide-react'
import api from '../lib/api'
import confirmarConClave from '../lib/confirmarConClave'

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'

// ─── NORMALIZAR REGISTRO DE LA BD ─────────────────────────────────────────────
function normalizarJornada(j) {
  return {
    JORNAD_ID:  j.jornad_id  ?? j.JORNAD_ID  ?? null,
    SECTOR_ID:  j.sector_id  ?? j.SECTOR_ID  ?? null,
    SECTOR_NO:  j.sector_no  ?? j.SECTOR_NO  ?? '',
    JORNAD_NO:  j.jornad_no  ?? j.JORNAD_NO  ?? '',
    JORNAD_FE:  (j.jornad_fe ?? j.JORNAD_FE ?? '').toString().slice(0, 10),
    JORNAD_LU:  j.jornad_lu  ?? j.JORNAD_LU  ?? '',
    JORNAD_DE:  j.jornad_de  ?? j.JORNAD_DE  ?? '',
    JORNAD_ES:  j.jornad_es  ?? j.JORNAD_ES  ?? '',
    JORNAD_VW:  j.jornad_vw  ?? j.JORNAD_VW  ?? true,
  }
}

// ─── FUNCIÓN: ESTADO VISUAL DE JORNADA ───────────────────────────────────────
function estadoVisual(JORNAD_FE) {
  const hoy   = new Date()
  const fecha = new Date(JORNAD_FE + 'T00:00:00')
  const diff  = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24))
  if (diff < 0)   return 'Realizada'
  if (diff === 0)  return 'Hoy'
  if (diff <= 7)   return 'Próxima'
  return 'Planificada'
}

// ─── BADGE DE ESTADO ──────────────────────────────────────────────────────────
// Usa el valor real del enum de BD cuando existe, o calcula desde la fecha como fallback
function BadgeEstado({ JORNAD_ES, JORNAD_FE }) {
  const cfgEnum = {
    PROGRAMADA: { cls: 'bg-sky-100 text-sky-700 border-sky-200',       icon: <Clock className="w-3 h-3 shrink-0" />,          label: 'Programada'  },
    EN_CURSO:   { cls: 'bg-[#FFDF96]/40 text-[#765A05] border-[#FFDF96]/60', icon: <span className="w-1.5 h-1.5 rounded-full bg-[#765A05] animate-pulse shrink-0" />, label: 'En Curso' },
    FINALIZADA: { cls: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="w-3 h-3 shrink-0" />,     label: 'Finalizada'  },
    CANCELADA:  { cls: 'bg-red-100 text-red-600 border-red-200',       icon: <AlertTriangle className="w-3 h-3 shrink-0" />,   label: 'Cancelada'   },
  }

  if (JORNAD_ES && cfgEnum[JORNAD_ES]) {
    const { cls, icon, label } = cfgEnum[JORNAD_ES]
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
        {icon}{label}
      </span>
    )
  }

  // Fallback: calcular desde la fecha
  const vis = estadoVisual(JORNAD_FE)
  const cfgVis = {
    Realizada:   { cls: 'bg-green-100 text-green-700 border-green-200',  icon: <CheckCircle className="w-3 h-3 shrink-0" /> },
    Hoy:         { cls: 'bg-[#FFDF96]/40 text-[#765A05] border-[#FFDF96]/60', icon: <span className="w-1.5 h-1.5 rounded-full bg-[#765A05] animate-pulse shrink-0" /> },
    Próxima:     { cls: 'bg-amber-100 text-amber-700 border-amber-200',  icon: <AlertTriangle className="w-3 h-3 shrink-0" /> },
    Planificada: { cls: 'bg-sky-100 text-sky-700 border-sky-200',        icon: <Clock className="w-3 h-3 shrink-0" /> },
  }
  const { cls, icon } = cfgVis[vis] ?? cfgVis.Planificada
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {icon}{vis}
    </span>
  )
}

// ─── MODAL: NUEVA JORNADA / EDITAR JORNADA ───────────────────────────────────
// Con `jornada` se abre en modo edición con sus datos cargados.
function ModalNuevaJornada({ sectores, jornada = null, onGuardar, onCerrar }) {
  const FORM_VACIO = { SECTOR_ID: '', JORNAD_NO: '', JORNAD_FE: '', JORNAD_LU: '', JORNAD_DE: '' }
  const esEdicion = !!jornada
  const [datos,    setDatos]    = useState(esEdicion ? {
    SECTOR_ID: jornada.SECTOR_ID != null ? String(jornada.SECTOR_ID) : '',
    JORNAD_NO: jornada.JORNAD_NO ?? '',
    JORNAD_FE: jornada.JORNAD_FE ?? '',
    JORNAD_LU: jornada.JORNAD_LU ?? '',
    JORNAD_DE: jornada.JORNAD_DE ?? '',
  } : { ...FORM_VACIO })
  const [guardando, setGuardando] = useState(false)
  const [error,    setError]    = useState('')

  const cambiar = ({ target: { name, value } }) =>
    setDatos(p => ({ ...p, [name]: value }))

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      if (esEdicion) await api.put(`/jornadas/${jornada.JORNAD_ID}`, datos)
      else           await api.post('/jornadas', datos)
      onGuardar()
    } catch (err) {
      setError(err.response?.data?.mensaje ?? (esEdicion ? 'Error al modificar la jornada' : 'Error al planificar la jornada'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-lg">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#765A05]/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#765A05]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{esEdicion ? 'Editar Jornada' : 'Planificar Nueva Jornada'}</h3>
              <p className="text-xs text-gray-400">Módulo TT_JORNAD</p>
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

          <div>
            <label className={eLabel}>Nombre del Operativo Veterinario *</label>
            <input name="JORNAD_NO" required value={datos.JORNAD_NO} onChange={cambiar}
              placeholder="Ej: Jornada de Vacunación Masiva" className={eInput} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={eLabel}>Sector de Intervención *</label>
              <select name="SECTOR_ID" required value={datos.SECTOR_ID} onChange={cambiar} className={eInput}>
                <option value="">Seleccionar sector...</option>
                {sectores.map(s => (
                  <option key={s.sector_id} value={s.sector_id}>
                    {s.sector_no}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={eLabel}>Fecha Planificada *</label>
              <input type="date" name="JORNAD_FE" required
                min={esEdicion ? undefined : new Date().toISOString().slice(0, 10)}
                value={datos.JORNAD_FE} onChange={cambiar} className={eInput} />
            </div>
          </div>

          <div>
            <label className={eLabel}>Lugar / Punto de Encuentro</label>
            <input name="JORNAD_LU" value={datos.JORNAD_LU} onChange={cambiar}
              placeholder="Ej: Parque central, Barrio Los Pinos" className={eInput} />
          </div>

          <div>
            <label className={eLabel}>Descripción del Operativo</label>
            <textarea name="JORNAD_DE" value={datos.JORNAD_DE} onChange={cambiar} rows={3}
              placeholder="Detalles del operativo veterinario..."
              className={`${eInput} resize-none`} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onCerrar}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-400">
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#765A05] hover:bg-[#5a4304] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : (esEdicion ? 'Guardar Cambios' : 'Planificar Jornada')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MODAL: REGISTRAR OPERATIVO (VETERINARIO) ────────────────────────────────
function ModalRegistrarOperacion({ jornada, onGuardar, onCerrar }) {
  const [datos,     setDatos]     = useState({ CANT_ATEND: '', OBS_JOPER: '' })
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState('')

  const cambiar = ({ target: { name, value } }) =>
    setDatos(p => ({ ...p, [name]: value }))

  const enviar = async (e) => {
    e.preventDefault()
    if (!datos.CANT_ATEND || Number(datos.CANT_ATEND) < 0) {
      setError('Ingrese la cantidad de animales atendidos')
      return
    }
    setError('')
    setGuardando(true)
    try {
      await api.post('/jornadas/operativa', {
        JORNAD_ID:  jornada.JORNAD_ID,
        CANT_ATEND: Number(datos.CANT_ATEND),
        OBS_JOPER:  datos.OBS_JOPER || null,
      })
      onGuardar()
    } catch (err) {
      setError(err.response?.data?.mensaje ?? 'Error al registrar el operativo')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Registrar Operativo</h3>
              <p className="text-xs text-gray-400 truncate max-w-[210px]">{jornada.JORNAD_NO}</p>
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

          <div>
            <label className={eLabel}>Animales Atendidos *</label>
            <input type="number" name="CANT_ATEND" required min="0"
              value={datos.CANT_ATEND} onChange={cambiar}
              placeholder="Cantidad de animales atendidos"
              className={eInput} />
          </div>

          <div>
            <label className={eLabel}>Observaciones del Operativo</label>
            <textarea name="OBS_JOPER" value={datos.OBS_JOPER} onChange={cambiar} rows={3}
              placeholder="Detalles relevantes del trabajo de campo..."
              className={`${eInput} resize-none`} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onCerrar}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-400">
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'Registrar Operativo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── COLUMNAS DE TABLA ────────────────────────────────────────────────────────
const COLUMNAS = ['ID', 'Nombre del Operativo', 'Sector', 'Lugar', 'Fecha', 'Estado', 'Acciones']

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function GestionJornadas({ rolActivo = 'ADMINISTRADOR' }) {
  const LIMIT = 10

  const [jornadas,       setJornadas]       = useState([])
  const [sectores,       setSectores]       = useState([])
  const [cargando,       setCargando]       = useState(true)
  const [busqueda,       setBusqueda]       = useState('')
  const [modalNuevo,     setModalNuevo]     = useState(false)
  const [modalOperacion, setModalOperacion] = useState(null)
  const [jornadaEditar,  setJornadaEditar]  = useState(null)
  const [pagina,         setPagina]         = useState(1)

  const esAdmin = rolActivo === 'ADMINISTRADOR'
  const esVet   = rolActivo === 'VETERINARIO'

  // Los hooks van antes del bloqueo por rol: React exige el mismo orden en cada render
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    try {
      const [rJornadas, rSectores] = await Promise.all([
        api.get('/jornadas'),
        api.get('/catalogos/sectores'),
      ])
      setJornadas((rJornadas.data.registros ?? []).map(normalizarJornada))
      setSectores(rSectores.data.registros ?? [])
    } catch (err) {
      console.error('Error al cargar jornadas:', err.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { if (esAdmin || esVet) cargarDatos() }, [cargarDatos, esAdmin, esVet])

  // Bloqueo total para Personal de Campo
  if (!esAdmin && !esVet) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Calendar className="w-8 h-8 text-amber-400" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-base font-bold text-gray-800">Módulo no disponible</p>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            La planificación de jornadas veterinarias está disponible únicamente
            para los perfiles Administrador y Veterinario.
          </p>
        </div>
      </div>
    )
  }

  const jornadasFiltradas = jornadas.filter(j => {
    const q = busqueda.toLowerCase()
    return (
      j.JORNAD_NO.toLowerCase().includes(q) ||
      j.SECTOR_NO.toLowerCase().includes(q) ||
      String(j.JORNAD_ID).includes(q)
    )
  })

  const totalPaginas    = Math.max(1, Math.ceil(jornadasFiltradas.length / LIMIT))
  const paginaSegura    = Math.min(pagina, totalPaginas)
  const jornadasPagina  = jornadasFiltradas.slice((paginaSegura - 1) * LIMIT, paginaSegura * LIMIT)

  const cambiarBusqueda = (e) => { setBusqueda(e.target.value); setPagina(1) }

  const agregarJornada = async () => {
    setModalNuevo(false)
    await cargarDatos()
    setPagina(1)
  }

  const guardarEdicion = async () => {
    setJornadaEditar(null)
    await cargarDatos()
  }

  const borrarJornada = async (id) => {
    const j = jornadas.find(x => x.JORNAD_ID === id)
    const eliminado = await confirmarConClave({
      titulo:  'Eliminar Jornada',
      mensaje: `¿Eliminar la jornada "${j?.JORNAD_NO ?? ''}"?`,
      accion:  (clave) => api.delete(`/jornadas/${id}`, { data: { clave } }),
    })
    if (eliminado) setJornadas(prev => prev.filter(x => x.JORNAD_ID !== id))
  }

  const totalRealizadas   = jornadas.filter(j => j.JORNAD_ES === 'FINALIZADA').length
  const totalProximas     = jornadas.filter(j => j.JORNAD_ES === 'EN_CURSO').length
  const totalPlanificadas = jornadas.filter(j => j.JORNAD_ES === 'PROGRAMADA').length

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── ENCABEZADO ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#765A05]/10 border border-[#765A05]/20 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#765A05]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Jornadas Veterinarias</h2>
            <p className="text-sm text-gray-400 mt-0.5">Planificación de operativos de campo — TT_JORNAD</p>
          </div>
        </div>
        {(esAdmin || esVet) && (
          <button
            onClick={() => setModalNuevo(true)}
            className="flex items-center gap-2 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-[#765A05]/10 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Planificar Jornada
          </button>
        )}
      </div>

      {/* ── TARJETAS MÉTRICAS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jornadas Realizadas</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{totalRealizadas}</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Próximas / Hoy</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{totalProximas}</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-sky-50 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Planificadas</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{totalPlanificadas}</p>
          </div>
        </div>
      </div>

      {/* ── TABLA ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input type="text" value={busqueda}
              onChange={cambiarBusqueda}
              placeholder="Buscar por nombre, sector o ID..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-400 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all bg-white/80" />
          </div>
          <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg shrink-0">
            {jornadasFiltradas.length} jornada{jornadasFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="bg-white/40 border-b border-gray-200/50">
                {COLUMNAS.map((col, i) => (
                  <th key={col}
                    className={`text-[11px] font-bold text-[#765A05] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap ${i === COLUMNAS.length - 1 ? 'text-right' : 'text-left'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-[#765A05]/30 border-t-[#765A05] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Cargando jornadas...</p>
                  </td>
                </tr>
              ) : jornadasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <Calendar className="w-9 h-9 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">No se encontraron jornadas</p>
                  </td>
                </tr>
              ) : jornadasPagina.map(j => (
                <tr key={j.JORNAD_ID}
                  className="border-b border-gray-50 last:border-0 hover:bg-[#FFDF96]/8 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <code className="text-xs font-mono font-semibold text-[#765A05] bg-[#FFDF96]/20 px-2 py-1 rounded-md border border-[#FFDF96]/40">
                      {j.JORNAD_ID}
                    </code>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <p className="text-sm font-semibold text-gray-900">{j.JORNAD_NO}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-[#765A05]/50 shrink-0" />
                      {j.SECTOR_NO || `Sector ${j.SECTOR_ID}`}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 max-w-[160px]">
                    <p className="text-sm text-gray-500 truncate">{j.JORNAD_LU || '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {j.JORNAD_FE}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <BadgeEstado JORNAD_ES={j.JORNAD_ES} JORNAD_FE={j.JORNAD_FE} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {esVet && (
                        <button
                          onClick={() => setModalOperacion(j)}
                          className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-800 hover:bg-sky-50 border border-transparent hover:border-sky-100 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                          <ClipboardList className="w-3.5 h-3.5" />
                          Registrar Operativo
                        </button>
                      )}
                      {esAdmin && (
                        <button
                          onClick={() => setJornadaEditar(j)}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </button>
                      )}
                      {esAdmin && (
                        <button
                          onClick={() => borrarJornada(j.JORNAD_ID)}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400">
            {jornadas.length} jornadas registradas — mostrando {jornadasPagina.length} de {jornadasFiltradas.length}
          </p>
          {totalPaginas > 1 && (
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={paginaSegura === 1}
                className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xs font-semibold text-gray-600 px-2">
                {paginaSegura} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaSegura === totalPaginas}
                className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: NUEVA JORNADA ──────────────────────────────────────────────── */}
      {modalNuevo && (
        <ModalNuevaJornada
          sectores={sectores}
          onGuardar={agregarJornada}
          onCerrar={() => setModalNuevo(false)}
        />
      )}

      {/* ── MODAL: EDITAR JORNADA ─────────────────────────────────────────────── */}
      {jornadaEditar && (
        <ModalNuevaJornada
          sectores={sectores}
          jornada={jornadaEditar}
          onGuardar={guardarEdicion}
          onCerrar={() => setJornadaEditar(null)}
        />
      )}

      {/* ── MODAL: REGISTRAR OPERATIVO (VETERINARIO) ──────────────────────────── */}
      {modalOperacion && (
        <ModalRegistrarOperacion
          jornada={modalOperacion}
          onGuardar={async () => { setModalOperacion(null); await cargarDatos() }}
          onCerrar={() => setModalOperacion(null)}
        />
      )}
    </div>
  )
}
