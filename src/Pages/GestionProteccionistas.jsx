import { useState, useEffect } from 'react'
import {
  Users, Plus, Search, Save, X, Trash2, Pencil,
  ShieldCheck, Phone, MapPin, Building2, PawPrint,
  Camera, Globe, AtSign, Video, Activity,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react'
import api from '../lib/api'

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const LIMIT = 10
const TIPOS_ORGANIZACION = ['Independiente', 'Fundación']

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'
const eSec   = 'text-xs font-bold text-[#765A05] uppercase tracking-widest mb-3 flex items-center gap-2'

// ─── NORMALIZAR RESPUESTA DB ──────────────────────────────────────────────────
const normalizarProteccionista = (p) => ({
  PRTEC_ID: p.protec_id  ?? p.PRTEC_ID  ?? String(Date.now()),
  PRTEC_NO: (p.person_no && p.person_ap)
    ? `${p.person_no} ${p.person_ap}`
    : (p.PRTEC_NO ?? ''),
  PRTEC_CI: p.person_ce  ?? p.PRTEC_CI  ?? '',
  PRTEC_TP: p.person_tl  ?? p.PRTEC_TP  ?? '',
  PRTEC_TS: p.prtec_ts   ?? p.PRTEC_TS  ?? '',
  PRTEC_TI: p.prtec_ti   ?? p.PRTEC_TI  ?? 'Independiente',
  PRTEC_ON: p.prtec_on   ?? p.PRTEC_ON  ?? '',
  PRTEC_RF: p.prtec_rf   ?? p.PRTEC_RF  ?? '',
  PRTEC_ES: p.prtec_es   ?? p.PRTEC_ES  ?? '',
  PRTEC_CC: p.prtec_cc   ?? p.PRTEC_CC  ?? '',
  PRTEC_CA: p.prtec_ca   ?? p.PRTEC_CA  ?? 0,
  PRTEC_CF: p.prtec_cf   ?? p.PRTEC_CF  ?? 0,
  PRTEC_CX: p.prtec_cx   ?? p.PRTEC_CX  ?? 0,
  PRTEC_IG: p.prtec_ig   ?? p.PRTEC_IG  ?? '',
  PRTEC_TK: p.prtec_tk   ?? p.PRTEC_TK  ?? '',
  PRTEC_FB: p.prtec_fb   ?? p.PRTEC_FB  ?? '',
  PRTEC_TW: p.prtec_tw   ?? p.PRTEC_TW  ?? '',
  PRTEC_ST: p.prtec_st   ?? p.PRTEC_ST  ?? 'Activo',
})

const FORM_VACIO = {
  PRTEC_NO: '', PRTEC_CI: '',
  PRTEC_TP: '', PRTEC_TS: '',
  PRTEC_TI: 'Independiente',
  PRTEC_ON: '', PRTEC_RF: '',
  PRTEC_ES: '', PRTEC_CC: '',
  PRTEC_CA: '0', PRTEC_CF: '0', PRTEC_CX: '0',
  PRTEC_IG: '', PRTEC_TK: '', PRTEC_FB: '', PRTEC_TW: '',
  PRTEC_ST: 'Activo',
}

// ─── BADGES ───────────────────────────────────────────────────────────────────
function BadgeTipoOrg({ tipo }) {
  const cfg = {
    Fundación:     'bg-sky-100 text-sky-700 border-sky-200',
    Independiente: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg[tipo] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {tipo}
    </span>
  )
}

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

    if (esEdicion) {
      onGuardar(datos)
      return
    }

    setGuardando(true)
    try {
      const payload = {
        PRTEC_NO:  datos.PRTEC_NO,
        PERSON_CE: datos.PRTEC_CI,
        PERSON_TL: datos.PRTEC_TP,
        PRTEC_TS:  datos.PRTEC_TS  || null,
        PRTEC_TI:  datos.PRTEC_TI,
        PRTEC_ON:  datos.PRTEC_ON,
        PRTEC_RF:  datos.PRTEC_RF  || null,
        PRTEC_ES:  datos.PRTEC_ES  || null,
        PRTEC_CC:  datos.PRTEC_CC  || null,
        PRTEC_CA:  datos.PRTEC_CA,
        PRTEC_CF:  datos.PRTEC_CF,
        PRTEC_CX:  datos.PRTEC_CX,
        PRTEC_IG:  datos.PRTEC_IG  || null,
        PRTEC_TK:  datos.PRTEC_TK  || null,
        PRTEC_FB:  datos.PRTEC_FB  || null,
        PRTEC_TW:  datos.PRTEC_TW  || null,
        PRTEC_ST:  datos.PRTEC_ST,
      }
      const respuesta = await api.post('/proteccionistas', payload)
      onGuardar(normalizarProteccionista(respuesta.data.registro))
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje ?? 'Error al registrar el proteccionista')
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
              <Users className="w-5 h-5 text-[#765A05]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {esEdicion ? 'Editar Proteccionista' : 'Registrar Proteccionista'}
              </h3>
              <p className="text-xs text-gray-400">TM_PROTEC — Talento Humano</p>
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

          {/* ── Datos del Responsable ── */}
          <div>
            <p className={eSec}><ShieldCheck className="w-3.5 h-3.5" /> Datos del Responsable</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={eLabel}>Nombres y Apellidos *</label>
                <input required name="PRTEC_NO" value={datos.PRTEC_NO} onChange={cambiar}
                  placeholder="Nombre completo del responsable" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Cédula de Identidad *</label>
                <input required name="PRTEC_CI" value={datos.PRTEC_CI} onChange={cambiar}
                  placeholder="V-00.000.000" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Teléfono Principal *</label>
                <input required name="PRTEC_TP" value={datos.PRTEC_TP} onChange={cambiar}
                  placeholder="04XX-XXX-XXXX" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Teléfono Secundario</label>
                <input name="PRTEC_TS" value={datos.PRTEC_TS} onChange={cambiar}
                  placeholder="04XX-XXX-XXXX (opcional)" className={eInput} />
              </div>
            </div>
          </div>

          {/* ── Datos de la Organización ── */}
          <div>
            <p className={eSec}><Building2 className="w-3.5 h-3.5" /> Datos de la Organización</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel}>Tipo de Organización *</label>
                <select required name="PRTEC_TI" value={datos.PRTEC_TI} onChange={cambiar} className={eInput}>
                  {TIPOS_ORGANIZACION.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={eLabel}>Nombre de la Organización *</label>
                <input required name="PRTEC_ON" value={datos.PRTEC_ON} onChange={cambiar}
                  placeholder="Nombre oficial" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>RIF</label>
                <input name="PRTEC_RF" value={datos.PRTEC_RF} onChange={cambiar}
                  placeholder="J-00.000.000-0 (si aplica)" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Estado del Registro</label>
                <select name="PRTEC_ST" value={datos.PRTEC_ST} onChange={cambiar} className={eInput}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Ubicación ── */}
          <div>
            <p className={eSec}><MapPin className="w-3.5 h-3.5" /> Ubicación</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel}>Estado / Municipio</label>
                <input name="PRTEC_ES" value={datos.PRTEC_ES} onChange={cambiar}
                  placeholder="Ej: Mérida / Libertador" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Consejo Comunal</label>
                <input name="PRTEC_CC" value={datos.PRTEC_CC} onChange={cambiar}
                  placeholder="Nombre del Consejo Comunal" className={eInput} />
              </div>
            </div>
          </div>

          {/* ── Animales ── */}
          <div>
            <p className={eSec}><PawPrint className="w-3.5 h-3.5" /> Animales Bajo Resguardo</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={eLabel}>Caninos</label>
                <input type="number" min="0" name="PRTEC_CA" value={datos.PRTEC_CA} onChange={cambiar} className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Felinos</label>
                <input type="number" min="0" name="PRTEC_CF" value={datos.PRTEC_CF} onChange={cambiar} className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Otras Especies</label>
                <input type="number" min="0" name="PRTEC_CX" value={datos.PRTEC_CX} onChange={cambiar} className={eInput} />
              </div>
            </div>
          </div>

          {/* ── Redes Sociales ── */}
          <div>
            <p className={eSec}><Camera className="w-3.5 h-3.5" /> Redes Sociales</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel + ' flex items-center gap-1.5'}><Camera className="w-3 h-3 text-pink-400" /> Instagram</label>
                <input name="PRTEC_IG" value={datos.PRTEC_IG} onChange={cambiar} placeholder="@usuario" className={eInput} />
              </div>
              <div>
                <label className={eLabel + ' flex items-center gap-1.5'}><Video className="w-3 h-3 text-gray-500" /> TikTok</label>
                <input name="PRTEC_TK" value={datos.PRTEC_TK} onChange={cambiar} placeholder="@usuario" className={eInput} />
              </div>
              <div>
                <label className={eLabel + ' flex items-center gap-1.5'}><Globe className="w-3 h-3 text-blue-400" /> Facebook</label>
                <input name="PRTEC_FB" value={datos.PRTEC_FB} onChange={cambiar} placeholder="Perfil o página" className={eInput} />
              </div>
              <div>
                <label className={eLabel + ' flex items-center gap-1.5'}><AtSign className="w-3 h-3 text-sky-400" /> X (Twitter)</label>
                <input name="PRTEC_TW" value={datos.PRTEC_TW} onChange={cambiar} placeholder="@usuario" className={eInput} />
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
                : <><Save className="w-4 h-4" /> {esEdicion ? 'Guardar Cambios' : 'Registrar Proteccionista'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── COLUMNAS ─────────────────────────────────────────────────────────────────
const COLUMNAS = ['Responsable / CI', 'Organización', 'Municipio / CC', 'Animales', 'Redes', 'Estado', 'Acciones']

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function GestionProteccionistas({ rolActivo = 'ADMINISTRADOR' }) {
  const [proteccionistas, setProteccionistas] = useState([])
  const [busqueda,        setBusqueda]        = useState('')
  const [modalNuevo,      setModalNuevo]      = useState(false)
  const [editando,        setEditando]        = useState(null)
  const [cargando,        setCargando]        = useState(true)
  const [notificacion,    setNotificacion]    = useState(null)
  const [paginaActual,    setPaginaActual]    = useState(1)

  const esAdmin = rolActivo === 'ADMINISTRADOR'
  const esCampo = rolActivo === 'CAMPO'

  const mostrarToast = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => setNotificacion(null), 4000)
  }

  useEffect(() => {
    api.get('/proteccionistas')
      .then(r => setProteccionistas((r.data.registros ?? []).map(normalizarProteccionista)))
      .catch(() => setProteccionistas([]))
      .finally(() => setCargando(false))
  }, [])

  const filtrados = proteccionistas.filter(p =>
    String(p.PRTEC_NO || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.PRTEC_ON || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.PRTEC_ES || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.PRTEC_CI || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas       = Math.max(1, Math.ceil(filtrados.length / LIMIT))
  const paginaSafe         = Math.min(paginaActual, totalPaginas)
  const filtradosPaginados = filtrados.slice((paginaSafe - 1) * LIMIT, paginaSafe * LIMIT)

  const guardar = (nuevo) => {
    if (editando) {
      setProteccionistas(prev => prev.map(p => (p.PRTEC_ID === editando.PRTEC_ID) ? nuevo : p))
      setEditando(null)
      mostrarToast('exito', 'Proteccionista actualizado correctamente.')
      return
    }
    setProteccionistas(prev => [nuevo, ...prev])
    setModalNuevo(false)
    mostrarToast('exito', 'Proteccionista registrado exitosamente.')
  }

  const eliminar = (id) => setProteccionistas(prev => prev.filter(p => p.PRTEC_ID !== id))

  const totalActivos  = proteccionistas.filter(p => p.PRTEC_ST === 'Activo').length
  const totalAnimales = proteccionistas.reduce((acc, p) =>
    acc + (parseInt(p.PRTEC_CA) || 0) + (parseInt(p.PRTEC_CF) || 0) + (parseInt(p.PRTEC_CX) || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── ENCABEZADO ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#765A05]/10 border border-[#765A05]/20 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#765A05]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Registro de Proteccionistas</h2>
            <p className="text-sm text-gray-400 mt-0.5">Organizaciones e independientes — TM_PROTEC</p>
          </div>
        </div>
        {(esAdmin || esCampo) && (
          <button onClick={() => setModalNuevo(true)}
            className="flex items-center gap-2 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-[#765A05]/10 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
            Nuevo Registro
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
          { label: 'Proteccionistas Activos', valor: totalActivos,           color: 'text-emerald-600', fondo: 'bg-emerald-50',   Icono: Activity  },
          { label: 'Total Registrados',       valor: proteccionistas.length, color: 'text-[#765A05]',   fondo: 'bg-[#FFDF96]/30', Icono: Users     },
          { label: 'Animales Resguardados',   valor: totalAnimales,          color: 'text-sky-600',     fondo: 'bg-sky-50',       Icono: PawPrint  },
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
            {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
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
                    <p className="text-sm text-gray-400 font-medium">Cargando proteccionistas...</p>
                  </td>
                </tr>
              ) : filtradosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <Users className="w-9 h-9 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Sin registros para mostrar</p>
                  </td>
                </tr>
              ) : filtradosPaginados.map(p => (
                <tr key={p.PRTEC_ID} className={`border-b border-gray-50 last:border-0 hover:bg-[#FFDF96]/8 transition-colors ${p.PRTEC_ST === 'Inactivo' ? 'opacity-55' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">{p.PRTEC_NO}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.PRTEC_CI}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-800">{p.PRTEC_ON || '—'}</p>
                    <div className="mt-0.5"><BadgeTipoOrg tipo={p.PRTEC_TI} /></div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {p.PRTEC_ES || '—'}
                    </div>
                    {p.PRTEC_CC && <p className="text-xs text-gray-400 mt-0.5 pl-5">{p.PRTEC_CC}</p>}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>🐕 {p.PRTEC_CA ?? 0}</span>
                      <span>🐈 {p.PRTEC_CF ?? 0}</span>
                      {parseInt(p.PRTEC_CX) > 0 && <span>🐾 {p.PRTEC_CX}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <RedesIndicador IG={p.PRTEC_IG} FB={p.PRTEC_FB} TK={p.PRTEC_TK} TW={p.PRTEC_TW} />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <BadgeEstado estado={p.PRTEC_ST} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {esAdmin && (
                        <>
                          <button onClick={() => setEditando(p)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button onClick={() => eliminar(p.PRTEC_ID)}
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
          <p className="text-xs text-gray-400">{proteccionistas.length} proteccionistas registrados en el sistema</p>
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
