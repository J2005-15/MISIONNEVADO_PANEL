import { useState, useEffect } from 'react'
import {
  HandHeart, Plus, Search, Save, X, Eye, Trash2,
  CalendarDays, CheckCircle, Clock, BadgeCheck,
  CircleDollarSign, Package, Wrench, ShieldCheck, PlusCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import api from '../lib/api'

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
const LIMIT = 10

const normalizarColab = (c) => ({
  DONACI_ID: c.colab_id   ?? c.DONACI_ID  ?? `COL-${Date.now()}`,
  PERSON_NO: c.colab_co   ?? c.PERSON_NO  ?? '—',
  PERSON_ID: c.person_ce  ?? c.PERSON_ID  ?? '—',
  DONACI_FE: (c.colab_fe  ?? c.fec_regis  ?? c.DONACI_FE ?? '').slice(0, 10),
  DONACI_TI: c.colab_ti   ?? c.DONACI_TI  ?? '—',
  DONACI_ES: c.colab_es   ?? c.DONACI_ES  ?? '—',
  DONACI_OB: c.colab_ob   ?? c.DONACI_OB  ?? '',
  detalles:  c.detalles   ?? [],
})

// ─── CATÁLOGOS ────────────────────────────────────────────────────────────────
const TIPOS_APORTE = ['Monetario', 'En Especie', 'Servicio Profesional']

const SERVICIOS_CATALOGO = [
  'Examen diagnóstico', 'Examen de laboratorio', 'Cirugía ortopédica',
  'Esterilización quirúrgica', 'Estética canina', 'Desparasitación',
  'Vacunación antirrábica', 'Medicamentos', 'Alimento concentrado',
  'Equipamiento médico', 'Transporte animal', 'Otro',
]

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatCOP = (v) =>
  !v || isNaN(v) ? '—' :
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

const calcTotal = (detalles) =>
  detalles.reduce((acc, d) =>
    acc + (parseFloat(d.DETDON_CA) || 0) * (parseFloat(d.DETDON_VA) || 0), 0)

// ─── MOCK DATA — TT_DONACI con TT_DETDON embebido ────────────────────────────
const colaboracionesIniciales = [
  {
    DONACI_ID: 'COL-2026-001', PERSON_ID: 'V-18.452.123', PERSON_NO: 'Carlos Mendoza',
    DONACI_FE: '2026-06-10', DONACI_TI: 'Monetario', DONACI_ES: 'Recibida',
    DONACI_OB: 'Aporte voluntario para campaña de vacunación masiva del sector norte.',
    detalles: [
      { DETDON_ID: 'DD-001', DETDON_NO: 'Vacunación antirrábica', DETDON_CA: 15, DETDON_UN: 'dosis',   DETDON_VA: 8000  },
      { DETDON_ID: 'DD-002', DETDON_NO: 'Desparasitación',        DETDON_CA: 10, DETDON_UN: 'dosis',   DETDON_VA: 5000  },
    ],
  },
  {
    DONACI_ID: 'COL-2026-002', PERSON_ID: 'V-22.897.541', PERSON_NO: 'Ana Rodríguez',
    DONACI_FE: '2026-06-07', DONACI_TI: 'En Especie', DONACI_ES: 'Recibida',
    DONACI_OB: 'Donación de alimento para refugio temporal.',
    detalles: [
      { DETDON_ID: 'DD-003', DETDON_NO: 'Alimento concentrado', DETDON_CA: 20, DETDON_UN: 'kg', DETDON_VA: 7500 },
    ],
  },
  {
    DONACI_ID: 'COL-2026-003', PERSON_ID: 'NIT-860.002.311', PERSON_NO: 'Empresa Petrocorp',
    DONACI_FE: '2026-06-05', DONACI_TI: 'Servicio Profesional', DONACI_ES: 'Procesada',
    DONACI_OB: 'Aporte institucional para jornada veterinaria en sector El Llano.',
    detalles: [
      { DETDON_ID: 'DD-004', DETDON_NO: 'Cirugía ortopédica',  DETDON_CA: 2, DETDON_UN: 'servicio', DETDON_VA: 180000 },
      { DETDON_ID: 'DD-005', DETDON_NO: 'Estética canina',     DETDON_CA: 5, DETDON_UN: 'servicio', DETDON_VA: 35000  },
      { DETDON_ID: 'DD-006', DETDON_NO: 'Examen diagnóstico',  DETDON_CA: 3, DETDON_UN: 'examen',   DETDON_VA: 45000  },
    ],
  },
  {
    DONACI_ID: 'COL-2026-004', PERSON_ID: 'V-30.112.005', PERSON_NO: 'Sofía Martínez',
    DONACI_FE: '2026-06-03', DONACI_TI: 'Monetario', DONACI_ES: 'Pendiente',
    DONACI_OB: 'Aporte para medicamentos de cirugía programada de urgencia.',
    detalles: [
      { DETDON_ID: 'DD-007', DETDON_NO: 'Medicamentos', DETDON_CA: 1, DETDON_UN: 'kit', DETDON_VA: 95000 },
    ],
  },
  {
    DONACI_ID: 'COL-2026-005', PERSON_ID: 'V-25.678.901', PERSON_NO: 'Jorge Herrera',
    DONACI_FE: '2026-05-28', DONACI_TI: 'En Especie', DONACI_ES: 'Recibida',
    DONACI_OB: 'Equipamiento para sala de atención veterinaria del centro.',
    detalles: [
      { DETDON_ID: 'DD-008', DETDON_NO: 'Equipamiento médico', DETDON_CA: 1, DETDON_UN: 'lote', DETDON_VA: 250000 },
    ],
  },
  {
    DONACI_ID: 'COL-2026-006', PERSON_ID: 'V-14.234.789', PERSON_NO: 'María Vargas',
    DONACI_FE: '2026-05-20', DONACI_TI: 'Servicio Profesional', DONACI_ES: 'Recibida',
    DONACI_OB: 'Servicio de estética y cuidado canino para animales en adopción.',
    detalles: [
      { DETDON_ID: 'DD-009', DETDON_NO: 'Estética canina',          DETDON_CA: 8, DETDON_UN: 'servicio', DETDON_VA: 35000 },
      { DETDON_ID: 'DD-010', DETDON_NO: 'Examen de laboratorio',    DETDON_CA: 4, DETDON_UN: 'examen',   DETDON_VA: 55000 },
    ],
  },
]

const FORM_VACIO = {
  PERSON_ID: '', PERSON_NO: '',
  DONACI_FE: '', DONACI_TI: 'Monetario', DONACI_ES: 'Recibida', DONACI_OB: '',
}

const DETDON_VACIO = { DETDON_NO: '', DETDON_CA: '1', DETDON_UN: 'unidad', DETDON_VA: '' }

// ─── BADGE TIPO DE APORTE ─────────────────────────────────────────────────────
function BadgeTipo({ tipo }) {
  const cfg = {
    'Monetario':            { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',  Icono: CircleDollarSign },
    'En Especie':           { cls: 'bg-sky-100 text-sky-700 border-sky-200',              Icono: Package          },
    'Servicio Profesional': { cls: 'bg-purple-100 text-purple-700 border-purple-200',     Icono: Wrench           },
  }
  const { cls, Icono } = cfg[tipo] ?? { cls: 'bg-gray-100 text-gray-600 border-gray-200', Icono: HandHeart }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      <Icono className="w-3 h-3 shrink-0" />
      {tipo}
    </span>
  )
}

// ─── BADGE ESTADO ─────────────────────────────────────────────────────────────
function BadgeEstadoColaboracion({ estado }) {
  const cfg = {
    Recibida:  { cls: 'bg-green-100 text-green-700 border-green-200',  Icono: CheckCircle },
    Pendiente: { cls: 'bg-amber-100 text-amber-700 border-amber-200',  Icono: Clock       },
    Procesada: { cls: 'bg-sky-100 text-sky-700 border-sky-200',        Icono: BadgeCheck  },
  }
  const { cls, Icono } = cfg[estado] ?? { cls: 'bg-gray-100 text-gray-600 border-gray-200', Icono: Clock }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      <Icono className="w-3 h-3 shrink-0" />
      {estado}
    </span>
  )
}

// ─── MODAL: NUEVA COLABORACIÓN ────────────────────────────────────────────────
function ModalNuevaColaboracion({ onGuardar, onCerrar }) {
  const [datos,    setDatos]    = useState({ ...FORM_VACIO, DONACI_FE: new Date().toISOString().slice(0, 10) })
  const [detalles, setDetalles] = useState([{ ...DETDON_VACIO }])

  const cambiar = ({ target: { name, value } }) => setDatos(p => ({ ...p, [name]: value }))

  const cambiarDetalle = (idx, campo, val) =>
    setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, [campo]: val } : d))

  const agregarFila    = () => setDetalles(prev => [...prev, { ...DETDON_VACIO }])
  const eliminarFila   = (idx) => setDetalles(prev => prev.filter((_, i) => i !== idx))

  const enviar = (e) => {
    e.preventDefault()
    onGuardar({
      ...datos,
      DONACI_ID: `COL-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      detalles: detalles.map((d, i) => ({
        ...d,
        DETDON_ID: `DD-${Date.now()}-${i}`,
        DONACI_ID: '',
      })),
    })
  }

  const totalPreview = calcTotal(detalles)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* Cabecera */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#765A05]/10 rounded-xl flex items-center justify-center">
              <HandHeart className="w-5 h-5 text-[#765A05]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Registrar Colaboración</h3>
              <p className="text-xs text-gray-400">TT_DONACI + TT_DETDON</p>
            </div>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={enviar} className="p-6 space-y-5">

          {/* ── Datos del colaborador ── */}
          <div>
            <p className="text-xs font-bold text-[#765A05] uppercase tracking-widest mb-3">Datos del Colaborador</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel}>Nombre del Colaborador *</label>
                <input required name="PERSON_NO" value={datos.PERSON_NO} onChange={cambiar}
                  placeholder="Nombre completo o razón social" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Cédula o NIT *</label>
                <input required name="PERSON_ID" value={datos.PERSON_ID} onChange={cambiar}
                  placeholder="Ej. V-18.452.123" className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Fecha de la Colaboración *</label>
                <input type="date" required name="DONACI_FE" value={datos.DONACI_FE} onChange={cambiar} className={eInput} />
              </div>
              <div>
                <label className={eLabel}>Tipo de Aporte *</label>
                <select name="DONACI_TI" value={datos.DONACI_TI} onChange={cambiar} className={eInput}>
                  {TIPOS_APORTE.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={eLabel}>Estado del Aporte</label>
                <select name="DONACI_ES" value={datos.DONACI_ES} onChange={cambiar} className={eInput}>
                  <option value="Recibida">Recibida</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Procesada">Procesada</option>
                </select>
              </div>
              <div>
                <label className={eLabel}>Observaciones</label>
                <input name="DONACI_OB" value={datos.DONACI_OB} onChange={cambiar}
                  placeholder="Descripción breve del aporte..." className={eInput} />
              </div>
            </div>
          </div>

          {/* ── Detalle del aporte (TT_DETDON) ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-[#765A05] uppercase tracking-widest">Descripción del Aporte</p>
              <button type="button" onClick={agregarFila}
                className="flex items-center gap-1.5 text-xs font-bold text-[#765A05] hover:text-[#5a4304] bg-[#FFDF96]/20 hover:bg-[#FFDF96]/40 border border-[#FFDF96]/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                <PlusCircle className="w-3.5 h-3.5" />
                Agregar servicio / producto
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
              <div className="min-w-[480px]">
              <div className="grid grid-cols-[1fr_64px_80px_90px_36px] gap-0 bg-[#FFDF96]/20 border-b border-gray-200 px-3 py-2">
                {['Descripción del servicio o producto', 'Cant.', 'Unidad', 'Valor unit.', ''].map((h) => (
                  <p key={h} className="text-[10px] font-bold text-[#765A05] uppercase tracking-wider">{h}</p>
                ))}
              </div>

              {detalles.map((d, idx) => (
                <div key={d.DETDON_ID || idx}
                  className="grid grid-cols-[1fr_64px_80px_90px_36px] gap-0 items-center px-3 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <div className="pr-2">
                    <select value={d.DETDON_NO} onChange={e => cambiarDetalle(idx, 'DETDON_NO', e.target.value)}
                      className="w-full text-xs text-gray-900 border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#765A05]">
                      <option value="">Seleccionar...</option>
                      {SERVICIOS_CATALOGO.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="pr-2">
                    <input type="number" min="1" value={d.DETDON_CA}
                      onChange={e => cambiarDetalle(idx, 'DETDON_CA', e.target.value)}
                      className="w-full text-xs text-gray-900 border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#765A05] text-center" />
                  </div>
                  <div className="pr-2">
                    <input value={d.DETDON_UN} onChange={e => cambiarDetalle(idx, 'DETDON_UN', e.target.value)}
                      placeholder="ud." className="w-full text-xs text-gray-900 border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#765A05]" />
                  </div>
                  <div className="pr-2">
                    <input type="number" min="0" value={d.DETDON_VA}
                      onChange={e => cambiarDetalle(idx, 'DETDON_VA', e.target.value)}
                      placeholder="0" className="w-full text-xs text-gray-900 border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#765A05] text-right" />
                  </div>
                  <div className="flex justify-center">
                    {detalles.length > 1 && (
                      <button type="button" onClick={() => eliminarFila(idx)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              </div>
              </div>
            </div>

            {totalPreview > 0 && (
              <div className="mt-2 text-right">
                <span className="text-xs font-bold text-[#765A05]">
                  Total estimado: {formatCOP(totalPreview)}
                </span>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onCerrar}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-400">
              Cancelar
            </button>
            <button type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <Save className="w-4 h-4" />
              Guardar Colaboración
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MODAL: VER DETALLE ───────────────────────────────────────────────────────
function ModalDetalleColaboracion({ colaboracion, onCerrar }) {
  const total = calcTotal(colaboracion.detalles)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/97 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-xl max-h-[86vh] overflow-y-auto">

        <div className="sticky top-0 bg-white/95 backdrop-blur-sm flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <code className="text-xs font-mono text-[#765A05] bg-[#FFDF96]/20 px-2.5 py-1 rounded-lg border border-[#FFDF96]/30">
              {colaboracion.DONACI_ID}
            </code>
            <BadgeTipo tipo={colaboracion.DONACI_TI} />
            <BadgeEstadoColaboracion estado={colaboracion.DONACI_ES} />
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><p className={eLabel}>Colaborador</p><p className="font-semibold text-gray-900">{colaboracion.PERSON_NO}</p></div>
            <div><p className={eLabel}>Cédula / NIT</p><p className="text-gray-700">{colaboracion.PERSON_ID}</p></div>
            <div><p className={eLabel}>Fecha</p>
              <div className="flex items-center gap-1.5 text-gray-700">
                <CalendarDays className="w-3.5 h-3.5 text-gray-300" />{colaboracion.DONACI_FE}
              </div>
            </div>
            {colaboracion.DONACI_OB && (
              <div className="col-span-2">
                <p className={eLabel}>Observaciones</p>
                <p className="text-gray-700 bg-gray-50 rounded-xl px-3 py-2 text-xs leading-relaxed">{colaboracion.DONACI_OB}</p>
              </div>
            )}
          </div>

          <div>
            <p className={eLabel + ' mb-2'}>Descripción del Aporte</p>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-xs">
                <thead>
                  <tr className="bg-[#FFDF96]/20 border-b border-gray-100">
                    {['Servicio / Producto', 'Cant.', 'Unidad', 'Valor Unit.', 'Subtotal'].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-bold text-[#765A05] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {colaboracion.detalles.map((d) => (
                    <tr key={d.DETDON_ID} className="hover:bg-[#FFDF96]/8">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">{d.DETDON_NO}</td>
                      <td className="px-3 py-2.5 text-gray-600 text-center">{d.DETDON_CA}</td>
                      <td className="px-3 py-2.5 text-gray-500">{d.DETDON_UN}</td>
                      <td className="px-3 py-2.5 text-gray-600">{formatCOP(d.DETDON_VA)}</td>
                      <td className="px-3 py-2.5 font-bold text-[#765A05]">
                        {formatCOP((parseFloat(d.DETDON_CA) || 0) * (parseFloat(d.DETDON_VA) || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            {total > 0 && (
              <div className="mt-2.5 text-right bg-[#FFDF96]/20 border border-[#FFDF96]/30 rounded-xl px-4 py-2.5">
                <span className="text-xs text-gray-500 font-medium">Total del aporte: </span>
                <span className="text-sm font-black text-[#765A05]">{formatCOP(total)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── COLUMNAS DE TABLA ────────────────────────────────────────────────────────
const COLUMNAS = ['N° Colaboración', 'Colaborador', 'Fecha', 'Tipo de Aporte', 'Estado', 'Total', 'Acciones']

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function ControlColaboraciones({ rolActivo = 'ADMINISTRADOR' }) {
  const [colaboraciones, setColaboraciones] = useState([])
  const [busqueda,       setBusqueda]       = useState('')
  const [modalNuevo,     setModalNuevo]     = useState(false)
  const [detalle,        setDetalle]        = useState(null)
  const [cargando,       setCargando]       = useState(true)
  const [notificacion,   setNotificacion]   = useState(null)
  const [paginaActual,   setPaginaActual]   = useState(1)

  const esAdmin = rolActivo === 'ADMINISTRADOR'
  const esCampo = rolActivo === 'CAMPO'

  const mostrarToast = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => setNotificacion(null), 4000)
  }

  useEffect(() => {
    api.get('/colaboraciones')
      .then(r => setColaboraciones((r.data.registros ?? []).map(normalizarColab)))
      .catch(() => setColaboraciones([]))
      .finally(() => setCargando(false))
  }, [])

  const filtradas = colaboraciones.filter(c =>
    String(c.PERSON_NO || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(c.DONACI_TI || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(c.DONACI_ES || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(c.DONACI_ID || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas     = Math.max(1, Math.ceil(filtradas.length / LIMIT))
  const paginaSafe       = Math.min(paginaActual, totalPaginas)
  const filtradasPaginadas = filtradas.slice((paginaSafe - 1) * LIMIT, paginaSafe * LIMIT)

  const guardar = async (nueva) => {
    const payload = {
      COLAB_CO:  nueva.PERSON_NO,
      COLAB_TI:  nueva.DONACI_TI,
      COLAB_FE:  nueva.DONACI_FE,
      COLAB_ES:  nueva.DONACI_ES,
      COLAB_OB:  nueva.DONACI_OB || null,
      PERSON_CE: nueva.PERSON_ID,
      PERSON_NO: nueva.PERSON_NO,
      datos_colaboracion: (nueva.detalles ?? []).map(d => ({
        DETDON_NO: d.DETDON_NO,
        DETDON_CA: parseFloat(d.DETDON_CA) || 1,
        DETDON_UN: d.DETDON_UN,
        DETDON_VA: parseFloat(d.DETDON_VA) || 0,
      })),
    }
    try {
      const r = await api.post('/colaboraciones', payload)
      const creada = normalizarColab({
        ...r.data.registro,
        DONACI_TI: nueva.DONACI_TI,
        PERSON_NO: nueva.PERSON_NO,
        PERSON_ID: nueva.PERSON_ID,
        DONACI_FE: nueva.DONACI_FE,
        DONACI_ES: nueva.DONACI_ES,
        DONACI_OB: nueva.DONACI_OB,
        detalles:  nueva.detalles,
      })
      setColaboraciones(prev => [creada, ...prev])
      mostrarToast('exito', 'Colaboración registrada exitosamente.')
    } catch (error) {
      mostrarToast('error', error.response?.data?.mensaje ?? 'Error al registrar la colaboración.')
    }
    setModalNuevo(false)
  }

  const eliminar = (id) =>
    setColaboraciones(prev => prev.filter(c => c.DONACI_ID !== id))

  const totalRecibido  = colaboraciones.filter(c => c.DONACI_ES === 'Recibida').length
  const totalPendiente = colaboraciones.filter(c => c.DONACI_ES === 'Pendiente').length
  const montoTotal     = colaboraciones.reduce((acc, c) => acc + calcTotal(c.detalles), 0)

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── ENCABEZADO ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#765A05]/10 border border-[#765A05]/20 rounded-xl flex items-center justify-center shrink-0">
            <HandHeart className="w-5 h-5 text-[#765A05]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Módulo de Colaboraciones</h2>
            <p className="text-sm text-gray-400 mt-0.5">Aportes y servicios recibidos — TT_DONACI / TT_DETDON</p>
          </div>
        </div>
        {(esAdmin || esCampo) && (
          <button
            onClick={() => { setModalNuevo(true) }}
            className="flex items-center gap-2 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-[#765A05]/10 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva Colaboración
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

      {/* ── TARJETAS MÉTRICAS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Colaboraciones Recibidas</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{totalRecibido}</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pendientes de Confirmar</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{totalPendiente}</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Valor Total Estimado</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{formatCOP(montoTotal)}</p>
          </div>
        </div>
      </div>

      {/* ── TABLA ────────────────────────────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input type="text" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPaginaActual(1) }}
              placeholder="Buscar por colaborador, tipo o estado..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-400 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all bg-white/80" />
          </div>
          <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg shrink-0">
            {filtradas.length} colaboración{filtradas.length !== 1 ? 'es' : ''}
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
                    <p className="text-sm text-gray-400 font-medium">Cargando colaboraciones...</p>
                  </td>
                </tr>
              ) : filtradasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-16 text-center">
                    <HandHeart className="w-9 h-9 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Sin colaboraciones registradas</p>
                  </td>
                </tr>
              ) : filtradasPaginadas.map(c => (
                <tr key={c.DONACI_ID} className="border-b border-gray-50 last:border-0 hover:bg-[#FFDF96]/8 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <code className="text-xs font-mono font-semibold text-[#765A05] bg-[#FFDF96]/20 px-2 py-1 rounded-md border border-[#FFDF96]/40">
                      {c.DONACI_ID}
                    </code>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">{c.PERSON_NO}</p>
                    <p className="text-xs text-gray-400">{c.PERSON_ID}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {c.DONACI_FE}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><BadgeTipo tipo={c.DONACI_TI} /></td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><BadgeEstadoColaboracion estado={c.DONACI_ES} /></td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-emerald-700">{formatCOP(calcTotal(c.detalles))}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setDetalle(c)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                        Ver detalle
                      </button>
                      {esAdmin && (
                        <button onClick={() => eliminar(c.DONACI_ID)}
                          className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
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
          <p className="text-xs text-gray-400">{colaboraciones.length} colaboraciones registradas en el sistema</p>
          {totalPaginas > 1 && (
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaSafe === 1}
                className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xs font-semibold text-gray-600 px-2">
                {paginaSafe} / {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaSafe === totalPaginas}
                className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODALES ───────────────────────────────────────────────────────────── */}
      {modalNuevo && <ModalNuevaColaboracion onGuardar={guardar} onCerrar={() => setModalNuevo(false)} />}
      {detalle    && <ModalDetalleColaboracion colaboracion={detalle} onCerrar={() => setDetalle(null)} />}
    </div>
  )
}
