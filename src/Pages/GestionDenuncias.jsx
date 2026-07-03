import { useState, useEffect } from 'react'
import {
  AlertTriangle, Plus, Search, CheckCircle, MapPin,
  X, FileText, ChevronDown, Save, Clock, ChevronLeft, ChevronRight
} from 'lucide-react'
import api from '../lib/api'

// ─── MOCK DATA — TT_DENUNC ────────────────────────────────────────────────────

const denunciasIniciales = [
  { DENUNC_ID: 'DEN-2026-001', PERSON_ID: 'ANONIMO',      SECTOR_ID: 'Las Lomas',  DENUNC_MO: 'Perro abandonado con signos visibles de desnutrición severa en calle principal', DENUNC_FE: '2026-06-08', DENUNC_ES: 'ABIERTA'  },
  { DENUNC_ID: 'DEN-2026-002', PERSON_ID: 'V-22.897.541', SECTOR_ID: 'Centro',     DENUNC_MO: 'Canino con signos de maltrato físico y heridas evidentes en el cuerpo',         DENUNC_FE: '2026-06-07', DENUNC_ES: 'ABIERTA'  },
  { DENUNC_ID: 'DEN-2026-003', PERSON_ID: 'ANONIMO',      SECTOR_ID: 'El Llano',   DENUNC_MO: 'Colonia de felinos en condición sanitaria precaria, posible foco de rabia',    DENUNC_FE: '2026-06-05', DENUNC_ES: 'CERRADA'  },
  { DENUNC_ID: 'DEN-2026-004', PERSON_ID: 'V-18.452.123', SECTOR_ID: 'La Montaña', DENUNC_MO: 'Envenenamiento masivo de animales domésticos en parcela abandonada del sector', DENUNC_FE: '2026-06-04', DENUNC_ES: 'CERRADA'  },
  { DENUNC_ID: 'DEN-2026-005', PERSON_ID: 'ANONIMO',      SECTOR_ID: 'Los Andes',  DENUNC_MO: 'Animal herido en zona de tráfico vehicular intenso, requiere atención urgente', DENUNC_FE: '2026-06-03', DENUNC_ES: 'ABIERTA'  },
  { DENUNC_ID: 'DEN-2026-006', PERSON_ID: 'V-30.112.005', SECTOR_ID: 'Las Lomas',  DENUNC_MO: 'Perro encadenado en condiciones precarias, sin acceso a agua ni alimento',      DENUNC_FE: '2026-06-01', DENUNC_ES: 'ABIERTA'  },
]

const FORM_VACIO = {
  PERSON_ID: '',
  SECTOR_ID: '',
  DENUNC_MO: '',
  DENUNC_FE: '',
  DENUNC_ES: 'EN_PROCESO',
}

const SECTORES = ['Las Lomas', 'Centro', 'El Llano', 'La Montaña', 'Los Andes']

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────

const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'

// ─── BADGE DE ESTADO (DENUNC_ES) ──────────────────────────────────────────────

function BadgeDenuncES({ estado }) {
  if (estado === 'EN_PROCESO' || estado === 'ABIERTA' || estado === 'Pendiente') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
        En Proceso
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircle className="w-3 h-3 shrink-0" />
      Cerrada
    </span>
  )
}

// ─── MODAL — REGISTRAR DENUNCIA ───────────────────────────────────────────────

function ModalNuevaDenuncia({ onGuardar, onCerrar, rolActivo = 'ADMINISTRADOR' }) {
  const esCampo = rolActivo === 'CAMPO'
  const [datos, setDatos] = useState(FORM_VACIO)
  const [catalogoSectores, setCatalogoSectores] = useState([])

  useEffect(() => {
    const fetchSectores = async () => {
      try {
        const res = await api.get('/catalogos/sectores')
        setCatalogoSectores(res.data.registros || [])
      } catch (e) {
        console.error('Error cargando sectores', e)
      }
    }
    fetchSectores()
  }, [])

  const cambiar = (campo, valor) => setDatos(p => ({ ...p, [campo]: valor }))

  const manejarSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        DENUNC_CE: datos.PERSON_ID,
        SECTOR_ID: parseInt(datos.SECTOR_ID) || null,
        DENUNC_FE: datos.DENUNC_FE,
        DENUNC_MO: datos.DENUNC_MO,
        DENUNC_ES: datos.DENUNC_ES || 'EN_PROCESO'
      }
      console.log('Payload Denuncia:', payload)
      const res = await api.post('/denuncias', payload)
      onGuardar(res.data.registro)
      if (typeof window !== 'undefined' && window.mostrarNotificacionGlobal) {
        window.mostrarNotificacionGlobal('exito', 'Denuncia registrada exitosamente')
      }
    } catch (error) {
      console.error('Error al registrar denuncia', error)
      if (typeof window !== 'undefined' && window.mostrarNotificacionGlobal) {
        window.mostrarNotificacionGlobal('error', error.response?.data?.error || error.response?.data?.mensaje || 'Error al guardar la denuncia')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="absolute inset-0" onClick={onCerrar} />

      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-black/25 mx-4 max-h-[90vh] overflow-y-auto">

        {/* Cabecera del modal */}
        <div className="border-b border-gray-100 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Registrar Denuncia</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Nuevo reporte de maltrato o abandono animal</p>
            </div>
          </div>
          <button type="button" onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="p-7 space-y-5">

          {/* Cédula + Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={eLabel}>Cédula del Denunciante *</label>
              <input type="text" required value={datos.PERSON_ID}
                onChange={e => cambiar('PERSON_ID', e.target.value)}
                placeholder="V-00.000.000 o ANONIMO"
                className={eInput} />
            </div>
            <div>
              <label className={eLabel}>Sector o Comunidad *</label>
              <div className="relative">
                <select required value={datos.SECTOR_ID}
                  onChange={e => cambiar('SECTOR_ID', e.target.value)}
                  className={`${eInput} pr-8 appearance-none cursor-pointer`}>
                  <option value="">Seleccione sector</option>
                  {catalogoSectores.map(s => <option key={s.sector_id} value={s.sector_id}>{s.sector_no}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Motivo de la Denuncia */}
          <div>
            <label className={eLabel}>Motivo de la Denuncia *</label>
            <textarea required rows={3} value={datos.DENUNC_MO}
              onChange={e => cambiar('DENUNC_MO', e.target.value)}
              placeholder="Describa detalladamente la situación reportada..."
              className={`${eInput} resize-none`} />
          </div>

          {/* Fecha + Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={eLabel}>Fecha del Reporte *</label>
              <input type="date" required value={datos.DENUNC_FE}
                onChange={e => cambiar('DENUNC_FE', e.target.value)}
                className={eInput} />
            </div>
            <div>
              <label className={eLabel}>Estado del Caso</label>
              {esCampo ? (
                <div className="w-full px-3.5 py-2.5 text-sm text-gray-400 border border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2 cursor-not-allowed">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
                  En Proceso — asignado automáticamente
                </div>
              ) : (
                <div className="relative">
                  <select value={datos.DENUNC_ES}
                    onChange={e => cambiar('DENUNC_ES', e.target.value)}
                    className={`${eInput} pr-8 appearance-none cursor-pointer`}>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="CERRADA">Cerrada</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onCerrar}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-300">
              Cancelar
            </button>
            <button type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-[#765A05]/20">
              <Save className="w-4 h-4" />
              Registrar Denuncia
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

const COLUMNAS = [
  'N° Expediente', 'Denunciante', 'Sector', 'Motivo del Reporte',
  'Fecha', 'Estado', 'Acciones',
]

export default function GestionDenuncias({ rolActivo = 'ADMINISTRADOR' }) {
  const esAdmin = rolActivo === 'ADMINISTRADOR'
  const [denuncias,    setDenuncias]    = useState([])
  const [denunciasWeb, setDenunciasWeb] = useState([])
  const [vistaActual,  setVistaActual]  = useState('internos')
  const [busqueda,     setBusqueda]     = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [notificacion, setNotificacion] = useState(null)
  const LIMIT = 10

  useEffect(() => {
    window.mostrarNotificacionGlobal = (tipo, mensaje) => {
      setNotificacion({ tipo, mensaje })
      setTimeout(() => setNotificacion(null), 4000)
    }
    return () => { delete window.mostrarNotificacionGlobal }
  }, [])

  useEffect(() => {
    const fetchDenuncias = async () => {
      try {
        const res = await api.get('/denuncias')
        setDenuncias(res.data.registros || [])
      } catch (error) {
        console.error('Error al obtener las denuncias', error)
      }
    }
    fetchDenuncias()
  }, [])

  const denunciasAMostrar = vistaActual === 'internos' ? denuncias : denunciasWeb

  const denunciasFiltradas = denunciasAMostrar.filter(d =>
    String(d.sector_nombre || d.SECTOR_NOMBRE || d.sector_id || d.SECTOR_ID || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(d.denunc_mo || d.DENUNC_MO || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(d.person_ce || d.PERSON_CE || d.person_id || d.PERSON_ID || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(denunciasFiltradas.length / LIMIT))
  const denunciasPaginadas = denunciasFiltradas.slice((paginaActual - 1) * LIMIT, paginaActual * LIMIT)

  const totalAbiertas = denunciasAMostrar.filter(d => (d.denunc_es || d.DENUNC_ES) === 'EN_PROCESO' || (d.denunc_es || d.DENUNC_ES) === 'Pendiente' || (d.denunc_es || d.DENUNC_ES) === 'ABIERTA').length
  const totalCerradas = denunciasAMostrar.filter(d => (d.denunc_es || d.DENUNC_ES) === 'CERRADA').length

  const cerrarCaso = async (id) => {
    if (window.confirm('¿Confirmar el cierre de este expediente?')) {
      try {
        await api.patch(`/denuncias/${id}`, { DENUNC_ES: 'CERRADA' })
        setDenuncias(prev => prev.map(d =>
          (d.denunc_id || d.DENUNC_ID) === id
            ? { ...d, denunc_es: 'CERRADA', DENUNC_ES: 'CERRADA' }
            : d
        ))
      } catch (error) {
        console.error('Error al cerrar la denuncia', error)
      }
    }
  }

  const guardarDenuncia = (nueva) => {
    setDenuncias(prev => [nueva, ...prev])
    setModalAbierto(false)
    setPaginaActual(1)
  }

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Denuncias</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Reportes de maltrato y abandono animal — Misión Nevado
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm shadow-[#765A05]/20">
          <Plus className="w-4 h-4" />
          Registrar Nueva Denuncia
        </button>
      </div>

      {/* ── Tabs (Expedientes Internos / Bandeja Web) ── */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => { setVistaActual('internos'); setPaginaActual(1); }}
          className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 cursor-pointer ${
            vistaActual === 'internos'
              ? 'border-[#765A05] text-[#765A05]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}>
          Expedientes Internos
        </button>
        <button
          onClick={() => { setVistaActual('web'); setPaginaActual(1); }}
          className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            vistaActual === 'web'
              ? 'border-[#765A05] text-[#765A05]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}>
          Bandeja Web
          {denunciasWeb.length > 0 && (
            <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{denunciasWeb.length}</span>
          )}
        </button>
      </div>

      {/* ── Métricas rápidas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Denuncias Abiertas</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{totalAbiertas}</p>
            <p className="text-xs text-gray-400 mt-0.5">pendientes de atención</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Casos Cerrados</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{totalCerradas}</p>
            <p className="text-xs text-gray-400 mt-0.5">expedientes resueltos</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#FFDF96]/50 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-[#FFDF96]/30 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#765A05]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Registros</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{denuncias.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">en el sistema</p>
          </div>
        </div>
      </div>

      {/* ── Tabla de denuncias ── */}
      <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por cédula, sector o motivo..."
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500" />
          </div>
          <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg shrink-0">
            {denunciasFiltradas.length} expediente{denunciasFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {COLUMNAS.map((col, i) => (
                  <th key={col}
                    className={`text-[11px] font-bold text-[#765A05] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap ${i === COLUMNAS.length - 1 ? 'text-right' : 'text-left'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {denunciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <AlertTriangle className="w-9 h-9 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">No se encontraron denuncias</p>
                    <p className="text-xs text-gray-300 mt-1">Intenta con otro sector o descripción del caso</p>
                  </td>
                </tr>
              ) : (
                denunciasPaginadas.map(d => {
                  const id = d.denunc_id || d.DENUNC_ID
                  const persona = d.person_ce || d.PERSON_CE || d.PERSON_ID
                  const sector = d.sector_nombre || d.SECTOR_NOMBRE || d.sector_id || d.SECTOR_ID
                  const motivo = d.denunc_mo || d.DENUNC_MO
                  const fecha = d.denunc_fe || d.DENUNC_FE
                  const estado = d.denunc_es || d.DENUNC_ES
                  
                  return (
                    <tr key={id}
                      className="border-b border-gray-50 last:border-0 hover:bg-[#FFDF96]/8 transition-colors">

                      {/* N° Expediente */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <code className="text-xs font-mono font-semibold text-[#765A05] bg-[#FFDF96]/20 px-2 py-1 rounded-md border border-[#FFDF96]/40 tracking-wider">
                          {id}
                        </code>
                      </td>

                      {/* Denunciante */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {persona === 'ANONIMO' || !persona ? (
                          <span className="text-sm text-gray-400 italic font-medium">Anónimo</span>
                        ) : (
                          <code className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                            {persona}
                          </code>
                        )}
                      </td>

                      {/* Sector */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-700">{sector}</span>
                        </div>
                      </td>

                      {/* Motivo */}
                      <td className="px-5 py-3.5 max-w-[260px]">
                        <p className="text-sm text-gray-700 truncate" title={motivo}>{motivo}</p>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          {fecha ? new Date(fecha).toLocaleDateString('es-VE') : ''}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        <BadgeDenuncES estado={estado} />
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {esAdmin && (estado === 'ABIERTA' || estado === 'Pendiente' || estado === 'EN_PROCESO') && (
                            <button
                              onClick={() => cerrarCaso(id)}
                              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Cerrar Caso
                            </button>
                          )}
                          {estado === 'CERRADA' && (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium px-2.5 py-1.5">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Caso cerrado
                            </span>
                          )}
                          {!esAdmin && (estado === 'ABIERTA' || estado === 'Pendiente' || estado === 'EN_PROCESO') && (
                            <span className="text-xs text-gray-400 italic px-2.5 py-1.5">Solo lectura</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-400">
              Mostrando {denunciasPaginadas.length} de {denunciasFiltradas.length} expediente{denunciasFiltradas.length !== 1 ? 's' : ''}
            </p>
            
            {/* Controles de Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                <button 
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-xs font-semibold text-gray-600 px-2">
                  {paginaActual} / {totalPaginas}
                </span>
                <button 
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {totalAbiertas > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {totalAbiertas} denuncia{totalAbiertas !== 1 ? 's' : ''} activa{totalAbiertas !== 1 ? 's' : ''} — pendiente{totalAbiertas !== 1 ? 's' : ''} de atención
            </span>
          )}
        </div>
      </div>

      {modalAbierto && (
        <ModalNuevaDenuncia
          onGuardar={guardarDenuncia}
          onCerrar={() => setModalAbierto(false)}
          rolActivo={rolActivo}
        />
      )}

      {notificacion && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all animate-in fade-in slide-in-from-bottom-5 ${
          notificacion.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {notificacion.tipo === 'error' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
          <p className="text-sm font-semibold">{notificacion.mensaje}</p>
          <button onClick={() => setNotificacion(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
