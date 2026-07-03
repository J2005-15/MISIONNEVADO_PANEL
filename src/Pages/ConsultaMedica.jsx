import { useState, useEffect } from 'react'
import {
  Stethoscope, Plus, Search, CheckCircle, AlertTriangle, Clock,
  Save, X, Activity, CalendarDays, User, Eye, ShieldCheck, Heart, Printer,
  ChevronLeft, ChevronRight, Loader2, PawPrint,
} from 'lucide-react'
import api from '../lib/api'
import RecetaMedica from './RecetaMedica'

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'
const eArea  = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500 resize-none'
const eSec   = 'text-xs font-bold text-[#765A05] uppercase tracking-widest mb-3 flex items-center gap-2'

const LIMIT = 10

// ─── NORMALIZAR RESPUESTA DB ──────────────────────────────────────────────────
const normalizarConsulta = (c) => ({
  CONSUL_ID:  c.consul_id  ?? c.CONSUL_ID  ?? '',
  CENSOA_ID:  c.censoa_id  ?? c.CENSOA_ID  ?? '',
  NOM_ANIMA:  c.nom_anima  ?? c.NOM_ANIMA  ?? '—',
  PERSON_CE:  c.person_ce  ?? c.PERSON_CE  ?? '—',
  PROPIET_NO: c.propiet_no ?? c.PROPIET_NO ?? '',
  USUARI_ID:  c.usuari_id  ?? c.USUARI_ID  ?? '',
  USUARI_NO:  c.usuari_no  ?? c.USUARI_NO  ?? '—',
  JORNAD_ID:  c.jornad_id  ?? c.JORNAD_ID  ?? null,
  JORNAD_NO:  c.jornad_no  ?? c.JORNAD_NO  ?? '—',
  CONSUL_FE:  (c.consul_fe ?? c.CONSUL_FE  ?? '').slice(0, 10),
  CONSUL_PK:  c.consul_pk  ?? c.CONSUL_PK  ?? '',
  CONSUL_TE:  c.consul_te  ?? c.CONSUL_TE  ?? '',
  CONSUL_FC:  c.consul_fc  ?? c.CONSUL_FC  ?? '',
  CONSUL_FR:  c.consul_fr  ?? c.CONSUL_FR  ?? '',
  CONSUL_MO:  c.consul_mo  ?? c.CONSUL_MO  ?? '',
  CONSUL_DI:  c.consul_di  ?? c.CONSUL_DI  ?? '',
  CONSUL_TR:  c.consul_tr  ?? c.CONSUL_TR  ?? '',
  CONSUL_OB:  c.consul_ob  ?? c.CONSUL_OB  ?? '',
  CONSUL_PR:  (c.consul_pr ?? c.CONSUL_PR  ?? '').slice(0, 10),
  CONSUL_ES:  c.consul_es  ?? c.CONSUL_ES  ?? 'Pendiente',
})

const FORM_VACIO = {
  CENSOA_ID: '', JORNAD_ID: '', CONSUL_FE: '',
  CONSUL_PK: '', CONSUL_TE: '', CONSUL_FC: '', CONSUL_FR: '',
  CONSUL_MO: '', CONSUL_DI: '', CONSUL_TR: '',
  CONSUL_OB: '', CONSUL_PR: '', CONSUL_ES: 'Pendiente',
}

// ─── BADGE ESTADO ─────────────────────────────────────────────────────────────
function BadgeConsulES({ estado }) {
  if (estado === 'Emergencia') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
        Emergencia
      </span>
    )
  }
  const cfg = {
    Atendido:  'bg-green-100 text-green-700 border-green-200',
    Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg[estado] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {estado ?? '—'}
    </span>
  )
}

// ─── MODAL: NUEVA CONSULTA ────────────────────────────────────────────────────
function ModalNuevaConsulta({ onGuardar, onCerrar, veterinarioActual, pacientePreseleccionado, animales, jornadas }) {
  const [datos,     setDatos]     = useState({
    ...FORM_VACIO,
    CENSOA_ID: pacientePreseleccionado?.censoa_id ?? pacientePreseleccionado?.CENSOA_ID ?? '',
    CONSUL_FE: new Date().toISOString().slice(0, 10),
  })
  const [guardando, setGuardando] = useState(false)
  const [errorMsg,  setErrorMsg]  = useState('')

  const cambiar = ({ target: { name, value } }) => setDatos(p => ({ ...p, [name]: value }))

  const enviar = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setGuardando(true)
    try {
      const payload = {
        CENSOA_ID: parseInt(datos.CENSOA_ID),
        JORNAD_ID: datos.JORNAD_ID ? parseInt(datos.JORNAD_ID) : null,
        CONSUL_FE: datos.CONSUL_FE,
        CONSUL_PK: datos.CONSUL_PK || null,
        CONSUL_TE: datos.CONSUL_TE || null,
        CONSUL_FC: datos.CONSUL_FC ? parseInt(datos.CONSUL_FC) : null,
        CONSUL_FR: datos.CONSUL_FR ? parseInt(datos.CONSUL_FR) : null,
        CONSUL_MO: datos.CONSUL_MO || null,
        CONSUL_DI: datos.CONSUL_DI || null,
        CONSUL_TR: datos.CONSUL_TR || null,
        CONSUL_OB: datos.CONSUL_OB || null,
        CONSUL_PR: datos.CONSUL_PR || null,
        CONSUL_ES: datos.CONSUL_ES || 'Pendiente',
      }
      const respuesta = await api.post('/veterinaria', payload)
      onGuardar(normalizarConsulta(respuesta.data.registro))
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje ?? 'Error al registrar la consulta')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">

        {/* Cabecera */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm flex items-center justify-between px-7 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#765A05]/10 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#765A05]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Registrar Consulta Veterinaria</h3>
              <p className="text-xs text-gray-400">
                {veterinarioActual?.nombre
                  ? `Veterinario: ${veterinarioActual.nombre}`
                  : 'TT_CONSU — Historia Clínica'}
              </p>
            </div>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={enviar} className="p-7 space-y-6">

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{errorMsg}</p>
          )}

          {/* ── Sección 1: Datos de la Consulta ── */}
          <div>
            <p className={eSec}><User className="w-3.5 h-3.5" /> Datos de la Consulta</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel}>Animal / Paciente *</label>
                <select required name="CENSOA_ID" value={datos.CENSOA_ID} onChange={cambiar} className={eInput}>
                  <option value="">Seleccionar paciente...</option>
                  {animales.map(a => (
                    <option key={a.censoa_id} value={a.censoa_id}>
                      {a.nom_anima} — {a.person_ce}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={eLabel}>Jornada Asociada</label>
                <select name="JORNAD_ID" value={datos.JORNAD_ID} onChange={cambiar} className={eInput}>
                  <option value="">Sin jornada asignada</option>
                  {jornadas.map(j => (
                    <option key={j.jornad_id} value={j.jornad_id}>{j.jornad_no}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={eLabel}>Fecha de la Consulta *</label>
                <input type="date" required name="CONSUL_FE" value={datos.CONSUL_FE} onChange={cambiar} className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Estado de la Consulta</label>
                <select name="CONSUL_ES" value={datos.CONSUL_ES} onChange={cambiar} className={eInput}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Atendido">Atendido</option>
                  <option value="Emergencia">Emergencia</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Sección 2: Signos Vitales ── */}
          <div>
            <p className={eSec}><Activity className="w-3.5 h-3.5" /> Signos Vitales</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={eLabel}>Peso (kg)</label>
                <input type="number" step="0.1" min="0" name="CONSUL_PK"
                  value={datos.CONSUL_PK} onChange={cambiar} placeholder="0.0" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Temperatura (°C)</label>
                <input type="number" step="0.1" min="35" max="43" name="CONSUL_TE"
                  value={datos.CONSUL_TE} onChange={cambiar} placeholder="38.5" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Frec. Cardíaca (lpm)</label>
                <input type="number" min="0" name="CONSUL_FC"
                  value={datos.CONSUL_FC} onChange={cambiar} placeholder="80" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Frec. Respiratoria (rpm)</label>
                <input type="number" min="0" name="CONSUL_FR"
                  value={datos.CONSUL_FR} onChange={cambiar} placeholder="20" className={eInput} />
              </div>
            </div>
          </div>

          {/* ── Sección 3: Motivo ── */}
          <div>
            <p className={eSec}><Heart className="w-3.5 h-3.5" /> Anamnesis</p>
            <label className={eLabel}>Motivo de la Consulta *</label>
            <textarea required rows={2} name="CONSUL_MO" value={datos.CONSUL_MO} onChange={cambiar}
              placeholder="Describa el motivo principal de la consulta..." className={eArea} />
          </div>

          {/* ── Sección 4: Diagnóstico y Tratamiento ── */}
          <div>
            <p className={eSec}><Stethoscope className="w-3.5 h-3.5" /> Evaluación Clínica</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel}>Diagnóstico *</label>
                <textarea required rows={4} name="CONSUL_DI" value={datos.CONSUL_DI} onChange={cambiar}
                  placeholder="Diagnóstico clínico detallado..." className={eArea} />
              </div>
              <div>
                <label className={eLabel}>Tratamiento Indicado *</label>
                <textarea required rows={4} name="CONSUL_TR" value={datos.CONSUL_TR} onChange={cambiar}
                  placeholder="Medicamentos, dosis y procedimientos..." className={eArea} />
              </div>
            </div>
          </div>

          {/* ── Sección 5: Seguimiento ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className={eLabel}>Observaciones</label>
              <textarea rows={2} name="CONSUL_OB" value={datos.CONSUL_OB} onChange={cambiar}
                placeholder="Anotaciones adicionales..." className={eArea} />
            </div>
            <div>
              <label className={eLabel}>Próxima Cita</label>
              <input type="date" name="CONSUL_PR" value={datos.CONSUL_PR} onChange={cambiar} className={eInput} />
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
                : <><Save className="w-4 h-4" /> Guardar Consulta</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MODAL: VER DETALLE ───────────────────────────────────────────────────────
function ModalDetalleConsulta({ consulta, onCerrar, onImprimirReceta }) {
  const vitales = [
    { label: 'Peso',               valor: consulta.CONSUL_PK ? `${consulta.CONSUL_PK} kg`  : '—' },
    { label: 'Temperatura',        valor: consulta.CONSUL_TE ? `${consulta.CONSUL_TE} °C`  : '—' },
    { label: 'Frec. Cardíaca',     valor: consulta.CONSUL_FC ? `${consulta.CONSUL_FC} lpm` : '—' },
    { label: 'Frec. Respiratoria', valor: consulta.CONSUL_FR ? `${consulta.CONSUL_FR} rpm` : '—' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 bg-white/95 backdrop-blur-sm flex items-center justify-between px-7 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <code className="text-xs font-mono text-[#765A05] bg-[#FFDF96]/20 px-2 py-1 rounded-lg border border-[#FFDF96]/30">
              #{String(consulta.CONSUL_ID).padStart(4, '0')}
            </code>
            <BadgeConsulES estado={consulta.CONSUL_ES} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onImprimirReceta(consulta)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#765A05] hover:text-white bg-[#FFDF96]/20 hover:bg-[#765A05] border border-[#FFDF96]/40 hover:border-[#765A05] px-3 py-1.5 rounded-lg transition-all">
              <Printer className="w-3.5 h-3.5" /> Imprimir Récipe
            </button>
            <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className={eLabel}>Animal / Paciente</p>
              <p className="text-gray-800 font-semibold flex items-center gap-1.5">
                <PawPrint className="w-3.5 h-3.5 text-[#765A05]/50" />
                {consulta.NOM_ANIMA}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Propietario: {consulta.PERSON_CE}</p>
            </div>
            <div>
              <p className={eLabel}>Veterinario</p>
              <p className="text-gray-800 font-semibold">{consulta.USUARI_NO}</p>
            </div>
            <div>
              <p className={eLabel}>Fecha</p>
              <p className="text-gray-700">{consulta.CONSUL_FE}</p>
            </div>
            <div>
              <p className={eLabel}>Jornada</p>
              <p className="text-gray-700">{consulta.JORNAD_NO || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {vitales.map(({ label, valor }) => (
              <div key={label} className="bg-[#FFDF96]/15 border border-[#FFDF96]/30 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-black text-[#765A05] mt-1">{valor}</p>
              </div>
            ))}
          </div>

          {[
            { label: 'Motivo de la Consulta', val: consulta.CONSUL_MO },
            { label: 'Diagnóstico',           val: consulta.CONSUL_DI },
            { label: 'Tratamiento Indicado',  val: consulta.CONSUL_TR },
            { label: 'Observaciones',         val: consulta.CONSUL_OB },
          ].map(({ label, val }) => val ? (
            <div key={label}>
              <p className={eLabel}>{label}</p>
              <p className="text-sm text-gray-700 bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3 leading-relaxed">{val}</p>
            </div>
          ) : null)}

          {consulta.CONSUL_PR && (
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5">
              <CalendarDays className="w-4 h-4 text-sky-500 shrink-0" />
              <p className="text-xs text-sky-800 font-medium">
                Próxima cita programada: <span className="font-bold">{consulta.CONSUL_PR}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── COLUMNAS ─────────────────────────────────────────────────────────────────
const COLUMNAS = ['# Consulta', 'Animal / Propietario', 'Veterinario', 'Fecha', 'Estado', 'Acciones']

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function ConsultaMedica({ rolActivo = 'VETERINARIO', veterinarioActual, pacientePreseleccionado }) {
  const [consultas,          setConsultas]          = useState([])
  const [animales,           setAnimales]           = useState([])
  const [jornadas,           setJornadas]           = useState([])
  const [busqueda,           setBusqueda]           = useState('')
  const [cargando,           setCargando]           = useState(true)
  const [modalNuevo,         setModalNuevo]         = useState(false)
  const [consultaDetalle,    setConsultaDetalle]    = useState(null)
  const [consultaParaReceta, setConsultaParaReceta] = useState(null)
  const [notificacion,       setNotificacion]       = useState(null)
  const [paginaActual,       setPaginaActual]       = useState(1)

  const esVeterinario = rolActivo === 'VETERINARIO'
  const esAdmin       = rolActivo === 'ADMINISTRADOR'
  const esCampo       = rolActivo === 'CAMPO'

  const mostrarToast = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => setNotificacion(null), 4000)
  }

  // Cargar consultas, animales y jornadas al montar
  useEffect(() => {
    const cargar = async () => {
      try {
        const [rConsultas, rAnimales, rJornadas] = await Promise.all([
          api.get('/veterinaria'),
          api.get('/censo'),
          api.get('/jornadas'),
        ])
        setConsultas((rConsultas.data.registros ?? []).map(normalizarConsulta))
        setAnimales(rAnimales.data.registros ?? [])
        setJornadas(rJornadas.data.registros ?? [])
      } catch {
        setConsultas([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Si viene paciente preseleccionado desde FichaPaciente, abrir modal
  useEffect(() => {
    if (pacientePreseleccionado && !cargando) {
      setModalNuevo(true)
    }
  }, [pacientePreseleccionado, cargando])

  // Bloqueo total para Personal de Campo
  if (esCampo) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-base font-bold text-gray-800">Acceso Restringido</p>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            El historial clínico es de uso exclusivo del personal veterinario y la administración.
          </p>
        </div>
      </div>
    )
  }

  const filtradas = consultas.filter(c =>
    String(c.NOM_ANIMA  || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(c.PERSON_CE  || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(c.USUARI_NO  || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(c.CONSUL_ES  || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas  = Math.max(1, Math.ceil(filtradas.length / LIMIT))
  const paginaSafe    = Math.min(paginaActual, totalPaginas)
  const filtradasPag  = filtradas.slice((paginaSafe - 1) * LIMIT, paginaSafe * LIMIT)

  const guardar = (nueva) => {
    setConsultas(prev => [nueva, ...prev])
    setModalNuevo(false)
    mostrarToast('exito', 'Consulta médica registrada exitosamente.')
  }

  const totalAtendidas  = consultas.filter(c => c.CONSUL_ES === 'Atendido').length
  const totalPendientes = consultas.filter(c => c.CONSUL_ES === 'Pendiente').length
  const totalEmergencia = consultas.filter(c => c.CONSUL_ES === 'Emergencia').length

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── ENCABEZADO ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#765A05]/10 border border-[#765A05]/20 rounded-xl flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-[#765A05]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {esAdmin ? 'Historial Clínico — Supervisión' : 'Módulo de Consulta Veterinaria'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Registro de atenciones — TT_CONSU</p>
          </div>
        </div>
        {esVeterinario && (
          <button onClick={() => setModalNuevo(true)}
            className="flex items-center gap-2 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-[#765A05]/10 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
            Nueva Consulta
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

      {/* ── BANNER ADMIN ─────────────────────────────────────────────────────── */}
      {esAdmin && (
        <div className="flex items-center gap-3 bg-sky-50 border border-sky-200/70 rounded-xl px-4 py-3">
          <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-sky-800">Modo supervisión — Solo lectura</p>
            <p className="text-xs text-sky-600 mt-0.5">
              El registro y edición de consultas es exclusivo del Veterinario activo.
            </p>
          </div>
        </div>
      )}

      {/* ── MÉTRICAS ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Consultas Atendidas', valor: totalAtendidas,  Icono: CheckCircle,  bg: 'bg-green-50',  color: 'text-green-600'  },
          { label: 'Pendientes',          valor: totalPendientes, Icono: Clock,        bg: 'bg-amber-50',  color: 'text-amber-500'  },
          { label: 'Emergencias',         valor: totalEmergencia, Icono: AlertTriangle,bg: 'bg-red-50',    color: 'text-red-500'    },
        ].map(({ label, valor, Icono, bg, color }) => (
          <div key={label} className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
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
              placeholder="Buscar por animal, veterinario o estado..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-400 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all bg-white/80" />
          </div>
          <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg shrink-0">
            {filtradas.length} consulta{filtradas.length !== 1 ? 's' : ''}
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
                    <p className="text-sm text-gray-400 font-medium">Cargando historial clínico...</p>
                  </td>
                </tr>
              ) : filtradasPag.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <Stethoscope className="w-9 h-9 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">No se encontraron consultas</p>
                  </td>
                </tr>
              ) : filtradasPag.map(c => (
                <tr key={c.CONSUL_ID} className="border-b border-gray-50 last:border-0 hover:bg-[#FFDF96]/8 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <code className="text-xs font-mono font-semibold text-[#765A05] bg-[#FFDF96]/20 px-2 py-1 rounded-md border border-[#FFDF96]/40">
                      #{String(c.CONSUL_ID).padStart(4, '0')}
                    </code>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">{c.NOM_ANIMA}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.PERSON_CE}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm text-gray-600">{c.USUARI_NO}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {c.CONSUL_FE}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <BadgeConsulES estado={c.CONSUL_ES} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setConsultaDetalle(c)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                        Ver Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400">{consultas.length} consultas en el historial clínico</p>
          <div className="flex items-center gap-3">
            {totalEmergencia > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {totalEmergencia} emergencia{totalEmergencia !== 1 ? 's' : ''} activa{totalEmergencia !== 1 ? 's' : ''}
              </span>
            )}
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
      </div>

      {/* ── MODALES ───────────────────────────────────────────────────────────── */}
      {modalNuevo && esVeterinario && (
        <ModalNuevaConsulta
          onGuardar={guardar}
          onCerrar={() => setModalNuevo(false)}
          veterinarioActual={veterinarioActual}
          pacientePreseleccionado={pacientePreseleccionado}
          animales={animales}
          jornadas={jornadas}
        />
      )}
      {consultaDetalle && (
        <ModalDetalleConsulta
          consulta={consultaDetalle}
          onCerrar={() => setConsultaDetalle(null)}
          onImprimirReceta={(c) => { setConsultaParaReceta(c); setConsultaDetalle(null) }}
        />
      )}
      {consultaParaReceta && (
        <RecetaMedica
          consulta={consultaParaReceta}
          veterinario={veterinarioActual}
          onCerrar={() => setConsultaParaReceta(null)}
        />
      )}
    </div>
  )
}
