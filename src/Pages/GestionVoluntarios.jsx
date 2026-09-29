import { useState, useEffect } from 'react'
import {
  UserPlus, Plus, Search, Save, X, Trash2, Pencil,
  ShieldCheck, Phone, MapPin, Building2,
  Camera, Globe, AtSign, Video, Activity,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react'
import api from '../lib/api'
import confirmarConClave from '../lib/confirmarConClave'

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const LIMIT = 10

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'
const eSec   = 'text-xs font-bold text-[#765A05] uppercase tracking-widest mb-3 flex items-center gap-2'

// ─── NORMALIZAR RESPUESTA DB ──────────────────────────────────────────────────
const normalizarVoluntario = (v) => ({
  VOLUN_ID: v.volunt_id  ?? v.VOLUN_ID  ?? String(Date.now()),
  VOLUN_NO: (v.person_no && v.person_ap)
    ? `${v.person_no} ${v.person_ap}`
    : (v.VOLUN_NO ?? ''),
  VOLUN_CI: v.person_ce  ?? v.VOLUN_CI  ?? '',
  VOLUN_TP: v.person_tl  ?? v.VOLUN_TP  ?? '',
  VOLUN_EM: v.person_em  ?? v.VOLUN_EM  ?? '',
  VOLUN_TS: v.volun_ts   ?? v.VOLUN_TS  ?? '',
  VOLUN_OS: v.volun_os   ?? v.VOLUN_OS  ?? '',
  VOLUN_ES: v.volun_es   ?? v.VOLUN_ES  ?? '',
  VOLUN_CC: v.volun_cc   ?? v.VOLUN_CC  ?? '',
  VOLUN_IG: v.volun_ig   ?? v.VOLUN_IG  ?? '',
  VOLUN_TK: v.volun_tk   ?? v.VOLUN_TK  ?? '',
  VOLUN_FB: v.volun_fb   ?? v.VOLUN_FB  ?? '',
  VOLUN_TW: v.volun_tw   ?? v.VOLUN_TW  ?? '',
  VOLUN_ST: v.volun_st   ?? v.VOLUN_ST  ?? 'Activo',
})

const FORM_VACIO = {
  VOLUN_NO: '', VOLUN_CI: '',
  VOLUN_TP: '', VOLUN_TS: '', VOLUN_EM: '',
  VOLUN_OS: '',
  VOLUN_ES: '', VOLUN_CC: '',
  VOLUN_IG: '', VOLUN_TK: '', VOLUN_FB: '', VOLUN_TW: '',
  VOLUN_ST: 'Activo',
}

// ─── BADGES ───────────────────────────────────────────────────────────────────
function BadgeEstado({ estado }) {
  return estado === 'Activo' ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" /> Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" /> Inactivo
    </span>
  )
}

function RedesIndicador({ IG, FB, TK, TW }) {
  return (
    <div className="flex items-center gap-1.5">
      {IG && <Camera className="w-3.5 h-3.5 text-pink-400" />}
      {FB && <Globe  className="w-3.5 h-3.5 text-blue-400" />}
      {TK && <Video  className="w-3.5 h-3.5 text-gray-500" />}
      {TW && <AtSign className="w-3.5 h-3.5 text-sky-400"  />}
      {!IG && !FB && !TK && !TW && <span className="text-xs text-gray-300">—</span>}
    </div>
  )
}

// ─── MODAL: REGISTRO / EDICIÓN ────────────────────────────────────────────────
function ModalRegistro({ registro = null, onGuardar, onCerrar }) {
  const [datos,     setDatos]     = useState(registro ? { ...registro } : { ...FORM_VACIO })
  const [guardando, setGuardando] = useState(false)
  const [errorMsg,  setErrorMsg]  = useState('')
  const esEdicion = !!registro

  const cambiar = ({ target: { name, value } }) => setDatos(p => ({ ...p, [name]: value }))

  const enviar = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    setGuardando(true)
    try {
      const payload = {
        VOLUN_NO:  datos.VOLUN_NO,
        PERSON_CE: datos.VOLUN_CI,
        PERSON_TL: datos.VOLUN_TP,
        PERSON_EM: datos.VOLUN_EM  || null,
        VOLUN_TS:  datos.VOLUN_TS  || null,
        VOLUN_OS:  datos.VOLUN_OS,
        VOLUN_ES:  datos.VOLUN_ES  || null,
        VOLUN_CC:  datos.VOLUN_CC  || null,
        VOLUN_IG:  datos.VOLUN_IG  || null,
        VOLUN_TK:  datos.VOLUN_TK  || null,
        VOLUN_FB:  datos.VOLUN_FB  || null,
        VOLUN_TW:  datos.VOLUN_TW  || null,
        VOLUN_ST:  datos.VOLUN_ST,
      }
      const respuesta = esEdicion
        ? await api.put(`/voluntarios/${registro.VOLUN_ID}`, payload)
        : await api.post('/voluntarios', payload)
      onGuardar(normalizarVoluntario(respuesta.data.registro))
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje ?? (esEdicion ? 'Error al actualizar el voluntario' : 'Error al registrar el voluntario'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* Cabecera */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#765A05]/10 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#765A05]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {esEdicion ? 'Editar Voluntario' : 'Registrar Voluntario'}
              </h3>
              <p className="text-xs text-gray-400">TM_VOLUNT — Talento Humano</p>
            </div>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={enviar} className="p-6 space-y-6">

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{errorMsg}</p>
          )}

          {/* ── Datos Personales ── */}
          <div>
            <p className={eSec}><ShieldCheck className="w-3.5 h-3.5" /> Datos Personales</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={eLabel}>Nombres y Apellidos *</label>
                <input required name="VOLUN_NO" value={datos.VOLUN_NO} onChange={cambiar}
                  placeholder="Nombre completo del voluntario" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Cédula de Identidad *</label>
                <input required name="VOLUN_CI" value={datos.VOLUN_CI} onChange={cambiar}
                  placeholder="V-00.000.000" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Organización Social *</label>
                <input required name="VOLUN_OS" value={datos.VOLUN_OS} onChange={cambiar}
                  placeholder="Nombre de la organización o 'Independiente'" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Estado de Actividad</label>
                <select name="VOLUN_ST" value={datos.VOLUN_ST} onChange={cambiar} className={eInput}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Contacto ── */}
          <div>
            <p className={eSec}><Phone className="w-3.5 h-3.5" /> Datos de Contacto</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel}>Teléfono Principal *</label>
                <input required name="VOLUN_TP" value={datos.VOLUN_TP} onChange={cambiar}
                  placeholder="04XX-XXX-XXXX" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Teléfono Secundario</label>
                <input name="VOLUN_TS" value={datos.VOLUN_TS} onChange={cambiar}
                  placeholder="04XX-XXX-XXXX (opcional)" className={eInput} />
              </div>
              <div className="sm:col-span-2">
                <label className={eLabel}>Correo Electrónico</label>
                <input type="email" name="VOLUN_EM" value={datos.VOLUN_EM} onChange={cambiar}
                  placeholder="usuario@correo.com (opcional)" className={eInput} />
              </div>
            </div>
          </div>

          {/* ── Ubicación ── */}
          <div>
            <p className={eSec}><MapPin className="w-3.5 h-3.5" /> Ubicación</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel}>Estado / Municipio</label>
                <input name="VOLUN_ES" value={datos.VOLUN_ES} onChange={cambiar}
                  placeholder="Ej: Mérida / Libertador" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Consejo Comunal</label>
                <input name="VOLUN_CC" value={datos.VOLUN_CC} onChange={cambiar}
                  placeholder="Nombre del Consejo Comunal" className={eInput} />
              </div>
            </div>
          </div>

          {/* ── Redes Sociales ── */}
          <div>
            <p className={eSec}><Camera className="w-3.5 h-3.5" /> Redes Sociales</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel + ' flex items-center gap-1.5'}><Camera className="w-3 h-3 text-pink-400" /> Instagram</label>
                <input name="VOLUN_IG" value={datos.VOLUN_IG} onChange={cambiar} placeholder="@usuario" className={eInput} />
              </div>
              <div>
                <label className={eLabel + ' flex items-center gap-1.5'}><Video className="w-3 h-3 text-gray-500" /> TikTok</label>
                <input name="VOLUN_TK" value={datos.VOLUN_TK} onChange={cambiar} placeholder="@usuario" className={eInput} />
              </div>
              <div>
                <label className={eLabel + ' flex items-center gap-1.5'}><Globe className="w-3 h-3 text-blue-400" /> Facebook</label>
                <input name="VOLUN_FB" value={datos.VOLUN_FB} onChange={cambiar} placeholder="Perfil o página" className={eInput} />
              </div>
              <div>
                <label className={eLabel + ' flex items-center gap-1.5'}><AtSign className="w-3 h-3 text-sky-400" /> X (Twitter)</label>
                <input name="VOLUN_TW" value={datos.VOLUN_TW} onChange={cambiar} placeholder="@usuario" className={eInput} />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onCerrar}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-400">
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#765A05] hover:bg-[#5a4304] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              {guardando
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                : <><Save className="w-4 h-4" /> {esEdicion ? 'Guardar Cambios' : 'Registrar Voluntario'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── COLUMNAS ─────────────────────────────────────────────────────────────────
const COLUMNAS = ['Voluntario / CI', 'Organización Social', 'Municipio / CC', 'Teléfono', 'Redes', 'Estado', 'Acciones']

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function GestionVoluntarios({ rolActivo = 'ADMINISTRADOR' }) {
  const [voluntarios,  setVoluntarios]  = useState([])
  const [busqueda,     setBusqueda]     = useState('')
  const [modalNuevo,   setModalNuevo]   = useState(false)
  const [editando,     setEditando]     = useState(null)
  const [cargando,     setCargando]     = useState(true)
  const [notificacion, setNotificacion] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)

  const esAdmin = rolActivo === 'ADMINISTRADOR'
  const esCampo = rolActivo === 'CAMPO'

  const mostrarToast = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => setNotificacion(null), 4000)
  }

  useEffect(() => {
    api.get('/voluntarios')
      .then(r => setVoluntarios((r.data.registros ?? []).map(normalizarVoluntario)))
      .catch(() => setVoluntarios([]))
      .finally(() => setCargando(false))
  }, [])

  const filtrados = voluntarios.filter(v =>
    String(v.VOLUN_NO || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(v.VOLUN_OS || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(v.VOLUN_ES || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(v.VOLUN_CI || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas       = Math.max(1, Math.ceil(filtrados.length / LIMIT))
  const paginaSafe         = Math.min(paginaActual, totalPaginas)
  const filtradosPaginados = filtrados.slice((paginaSafe - 1) * LIMIT, paginaSafe * LIMIT)

  const guardar = (nuevo) => {
    if (editando) {
      setVoluntarios(prev => prev.map(v => (v.VOLUN_ID === editando.VOLUN_ID) ? nuevo : v))
      setEditando(null)
      mostrarToast('exito', 'Voluntario actualizado correctamente.')
      return
    }
    setVoluntarios(prev => [nuevo, ...prev])
    setModalNuevo(false)
    mostrarToast('exito', 'Voluntario registrado exitosamente.')
  }

  const eliminar = async (id) => {
    const v = voluntarios.find(x => x.VOLUN_ID === id)
    const eliminado = await confirmarConClave({
      titulo:  'Eliminar Voluntario',
      mensaje: `¿Eliminar al voluntario ${v?.VOLUN_NO ?? ''}?`,
      accion:  (clave) => api.delete(`/voluntarios/${id}`, { data: { clave } }),
    })
    if (!eliminado) return
    setVoluntarios(prev => prev.filter(x => x.VOLUN_ID !== id))
    mostrarToast('exito', 'Voluntario eliminado.')
  }

  // Los registros hechos desde la web entran Inactivos ("En espera") hasta ser aprobados
  const aprobar = async (v) => {
    try {
      await api.patch(`/voluntarios/${v.VOLUN_ID}/estado`, { VOLUN_ST: 'Activo' })
      setVoluntarios(prev => prev.map(x => (x.VOLUN_ID === v.VOLUN_ID ? { ...x, VOLUN_ST: 'Activo' } : x)))
      mostrarToast('exito', `Voluntario ${v.VOLUN_NO} aprobado.`)
    } catch (err) {
      mostrarToast('error', err.response?.data?.mensaje ?? 'No se pudo aprobar el voluntario.')
    }
  }

  const totalActivos = voluntarios.filter(v => v.VOLUN_ST === 'Activo').length

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── ENCABEZADO ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#765A05]/10 border border-[#765A05]/20 rounded-xl flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-[#765A05]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Registro de Voluntarios</h2>
            <p className="text-sm text-gray-400 mt-0.5">Talento humano de apoyo — TM_VOLUNT</p>
          </div>
        </div>
        {(esAdmin || esCampo) && (
          <button onClick={() => setModalNuevo(true)}
            className="flex items-center gap-2 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-[#765A05]/10 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
            Nuevo Voluntario
          </button>
        )}
      </div>

      {/* ── TOAST ────────────────────────────────────────────────────────────── */}
      {notificacion && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
          ${notificacion.tipo === 'exito'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span className="shrink-0">{notificacion.tipo === 'exito' ? '✓' : '✕'}</span>
          {notificacion.mensaje}
        </div>
      )}

      {/* ── BANNER CAMPO ─────────────────────────────────────────────────────── */}
      {esCampo && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/70 rounded-xl px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            <span className="font-bold">Acceso de registro.</span> La edición y eliminación son exclusivas del Administrador.
          </p>
        </div>
      )}

      {/* ── TARJETAS MÉTRICAS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Voluntarios Activos', valor: totalActivos,        color: 'text-emerald-600', fondo: 'bg-emerald-50',   Icono: Activity  },
          { label: 'Total Registrados',   valor: voluntarios.length,  color: 'text-[#765A05]',   fondo: 'bg-[#FFDF96]/30', Icono: UserPlus  },
          { label: 'Sin Actividad',       valor: voluntarios.length - totalActivos, color: 'text-gray-500', fondo: 'bg-gray-50', Icono: UserPlus },
        ].map(({ label, valor, color, fondo, Icono }) => (
          <div key={label} className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${fondo} rounded-xl flex items-center justify-center shrink-0`}>
              <Icono className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-black text-gray-900 mt-0.5">{valor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABLA ────────────────────────────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input type="text" value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPaginaActual(1) }}
              placeholder="Buscar por nombre, organización o municipio..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-400 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all bg-white/80" />
          </div>
          <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg shrink-0">
            {filtrados.length} voluntario{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
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
                    <p className="text-sm text-gray-400 font-medium">Cargando voluntarios...</p>
                  </td>
                </tr>
              ) : filtradosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <UserPlus className="w-9 h-9 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Sin voluntarios para mostrar</p>
                  </td>
                </tr>
              ) : filtradosPaginados.map(v => (
                <tr key={v.VOLUN_ID} className={`border-b border-gray-50 last:border-0 hover:bg-[#FFDF96]/8 transition-colors ${v.VOLUN_ST === 'Inactivo' ? 'opacity-55' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">{v.VOLUN_NO}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{v.VOLUN_CI}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Building2 className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="truncate max-w-[160px]">{v.VOLUN_OS || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {v.VOLUN_ES || '—'}
                    </div>
                    {v.VOLUN_CC && <p className="text-xs text-gray-400 mt-0.5 pl-5">{v.VOLUN_CC}</p>}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {v.VOLUN_TP || '—'}
                    </div>
                    {v.VOLUN_EM && <p className="text-xs text-gray-400 mt-0.5 pl-5">{v.VOLUN_EM}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <RedesIndicador IG={v.VOLUN_IG} FB={v.VOLUN_FB} TK={v.VOLUN_TK} TW={v.VOLUN_TW} />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <BadgeEstado estado={v.VOLUN_ST} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {esAdmin && (
                        <>
                          {v.VOLUN_ST === 'Inactivo' && (
                            <button onClick={() => aprobar(v)}
                              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
                              <ShieldCheck className="w-3.5 h-3.5" /> Aprobar
                            </button>
                          )}
                          <button onClick={() => setEditando(v)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button onClick={() => eliminar(v.VOLUN_ID)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {!esAdmin && <p className="text-xs text-gray-300 pr-1">Solo lectura</p>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400">{voluntarios.length} voluntarios registrados en el sistema</p>
          {totalPaginas > 1 && (
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
              <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaSafe === 1}
                className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xs font-semibold text-gray-600 px-2">{paginaSafe} / {totalPaginas}</span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaSafe === totalPaginas}
                className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODALES ───────────────────────────────────────────────────────────── */}
      {(modalNuevo || editando) && (
        <ModalRegistro
          registro={editando}
          onGuardar={guardar}
          onCerrar={() => { setModalNuevo(false); setEditando(null) }}
        />
      )}
    </div>
  )
}
