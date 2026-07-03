import React, { useState, useEffect } from 'react';
import {
  Package, Plus, RefreshCw, Activity, Search, AlertTriangle,
  Gift, Boxes, Lock, X, Save, CalendarDays,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import api from '../lib/api';

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const LIMIT_INV = 10

const normalizarInsumo = (i) => ({
  INSUMO_ID: i.insum_id   ?? i.INSUMO_ID ?? String(Date.now()),
  INSUMO_NO: i.insumo_no  ?? i.INSUMO_NO ?? '',
  CATEGO_ID: i.catego_no  ?? i.CATEGO_ID ?? '',
  INSUMO_UN: i.insumo_un  ?? i.INSUMO_UN ?? '',
  INSUMO_FE: (i.insumo_fe ?? i.INSUMO_FE ?? '').slice(0, 10),
  INSUMO_SM: i.insumo_sm  ?? i.INSUMO_SM ?? 0,
  INSUMO_EX: i.insumo_ex  ?? i.INSUMO_EX ?? 0,
})

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
const CATEGORIAS = ['Biológico', 'Medicamento', 'Solución IV', 'Suministro', 'Anestésico']

// ─── MOCK DATA — TM_INSUMO ────────────────────────────────────────────────────
const insumosIniciales = [
  { INSUMO_ID: 'INS-001', CATEGO_ID: 'Biológico',   INSUMO_NO: 'Vacuna Antirrábica',            INSUMO_UN: 'dosis',    INSUMO_FE: '2026-12-15', INSUMO_SM: 10,  INSUMO_EX: 24   },
  { INSUMO_ID: 'INS-002', CATEGO_ID: 'Medicamento',  INSUMO_NO: 'Antibiótico Amoxicilina 500mg', INSUMO_UN: 'tabletas', INSUMO_FE: '2027-03-20', INSUMO_SM: 30,  INSUMO_EX: 8    },
  { INSUMO_ID: 'INS-003', CATEGO_ID: 'Solución IV',  INSUMO_NO: 'Suero Fisiológico 0.9%',        INSUMO_UN: 'ml',       INSUMO_FE: '2027-06-01', INSUMO_SM: 500, INSUMO_EX: 1200 },
  { INSUMO_ID: 'INS-004', CATEGO_ID: 'Suministro',   INSUMO_NO: 'Jeringas Desechables 10ml',     INSUMO_UN: 'unidades', INSUMO_FE: '2028-01-01', INSUMO_SM: 50,  INSUMO_EX: 65   },
  { INSUMO_ID: 'INS-005', CATEGO_ID: 'Medicamento',  INSUMO_NO: 'Antiparasitario Ivermectina',   INSUMO_UN: 'ml',       INSUMO_FE: '2026-09-10', INSUMO_SM: 20,  INSUMO_EX: 10   },
  { INSUMO_ID: 'INS-006', CATEGO_ID: 'Suministro',   INSUMO_NO: 'Guantes Quirúrgicos (par)',      INSUMO_UN: 'pares',    INSUMO_FE: '2028-06-30', INSUMO_SM: 20,  INSUMO_EX: 3    },
  { INSUMO_ID: 'INS-007', CATEGO_ID: 'Anestésico',   INSUMO_NO: 'Ketamina Inyectable',           INSUMO_UN: 'ml',       INSUMO_FE: '2027-01-20', INSUMO_SM: 50,  INSUMO_EX: 120  },
  { INSUMO_ID: 'INS-008', CATEGO_ID: 'Suministro',   INSUMO_NO: 'Gasas Estériles 10×10 cm',      INSUMO_UN: 'unidades', INSUMO_FE: '2028-04-15', INSUMO_SM: 25,  INSUMO_EX: 30   },
]

const FORM_VACIO = {
  CATEGO_ID: '',
  INSUMO_NO: '',
  INSUMO_UN: '',
  INSUMO_FE: '',
  INSUMO_SM: '',
  INSUMO_EX: '',
}

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'

// ─── LÓGICA DE ESTADO DE STOCK ────────────────────────────────────────────────
// CRÍTICO: existencias en o por debajo del mínimo
// ALERTA:  existencias entre el mínimo y el 150 % del mínimo
// ÓPTIMO:  existencias por encima del 150 % del mínimo
function calcularEstado(INSUMO_EX, INSUMO_SM) {
  if (INSUMO_EX <= INSUMO_SM)                    return 'CRÍTICO'
  if (INSUMO_EX <= Math.round(INSUMO_SM * 1.5))  return 'ALERTA'
  return 'ÓPTIMO'
}

function calcularPct(INSUMO_EX, INSUMO_SM) {
  return Math.min(100, Math.round((INSUMO_EX / (INSUMO_SM * 2)) * 100))
}

function colorBarra(estado) {
  if (estado === 'ÓPTIMO') return 'bg-green-400'
  if (estado === 'ALERTA') return 'bg-amber-400'
  return 'bg-red-400'
}

// ─── BADGE DE ESTADO ──────────────────────────────────────────────────────────
function BadgeStock({ estado }) {
  if (estado === 'CRÍTICO') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
        Crítico
      </span>
    )
  }
  const cfg = {
    ÓPTIMO: 'bg-green-100 text-green-700 border border-green-200',
    ALERTA: 'bg-amber-100 text-amber-700 border border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg[estado] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {estado === 'ÓPTIMO' ? 'Óptimo' : 'Alerta'}
    </span>
  )
}

// ─── TARJETA DE CONSULTA — VISTA VETERINARIO ──────────────────────────────────
function TarjetaInsumoConsulta({ ins }) {
  const estado     = calcularEstado(ins.INSUMO_EX, ins.INSUMO_SM)
  const pct        = calcularPct(ins.INSUMO_EX, ins.INSUMO_SM)
  const barra      = colorBarra(estado)
  const cifraColor = estado === 'CRÍTICO' ? 'text-red-600'
    : estado === 'ALERTA' ? 'text-amber-600' : 'text-[#765A05]'

  return (
    <div className="bg-white/75 backdrop-blur-md border border-white/50 shadow-lg shadow-[#765A05]/5 rounded-2xl p-5 space-y-3 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 bg-[#765A05]/10 rounded-xl flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-[#765A05]" />
        </div>
        <BadgeStock estado={estado} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 leading-snug">{ins.INSUMO_NO}</p>
        <span className="inline-block mt-1 text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
          {ins.CATEGO_ID}
        </span>
      </div>
      <div>
        <div className="flex justify-between items-baseline text-xs mb-1.5">
          <span className="text-gray-400 font-medium">Existencia actual</span>
          <span className={`font-extrabold text-base ${cifraColor}`}>
            {ins.INSUMO_EX}
            <span className="text-xs font-normal text-gray-400 ml-1">{ins.INSUMO_UN}</span>
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${barra} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Mínimo requerido: <span className="font-semibold">{ins.INSUMO_SM} {ins.INSUMO_UN}</span>
        </p>
      </div>
    </div>
  )
}

// ─── MODAL: REGISTRAR NUEVO SUMINISTRO ───────────────────────────────────────
function ModalNuevoSuministro({ onCerrar, onGuardar }) {
  const [formulario,  setFormulario]  = useState(FORM_VACIO)
  const [guardando,   setGuardando]   = useState(false)
  const [errorMsg,    setErrorMsg]    = useState('')
  const [categorias,  setCategorias]  = useState([])

  useEffect(() => {
    api.get('/catalogos/categorias')
      .then(r => setCategorias(r.data.registros ?? []))
      .catch(() => setCategorias([]))
  }, [])

  const cambiar = ({ target: { name, value } }) =>
    setFormulario(p => ({ ...p, [name]: value }))

  const enviar = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setGuardando(true)
    try {
      const respuesta = await api.post('/inventario', formulario)
      const categoriaSeleccionada = categorias.find(c => String(c.catego_id) === String(formulario.CATEGO_ID))
      onGuardar(normalizarInsumo({
        ...respuesta.data.registro,
        catego_no: categoriaSeleccionada?.catego_no ?? '',
      }))
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje ?? 'Error al registrar el suministro')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-lg">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#765A05]/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-[#765A05]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Registrar Nuevo Suministro</h3>
              <p className="text-xs text-gray-400">Entrada al inventario — TM_INSUMO</p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={enviar} className="p-6 space-y-4">

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{errorMsg}</p>
          )}

          {/* Nombre del Suministro */}
          <div>
            <label className={eLabel}>Nombre del Suministro / Medicamento</label>
            <input
              name="INSUMO_NO" required
              value={formulario.INSUMO_NO}
              onChange={cambiar}
              placeholder="Ej: Antibiótico Amoxicilina 500mg"
              className={eInput}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Categoría */}
            <div>
              <label className={eLabel}>Categoría</label>
              <select name="CATEGO_ID" required value={formulario.CATEGO_ID} onChange={cambiar} className={eInput}>
                <option value="">Seleccione categoría</option>
                {categorias.map(c => (
                  <option key={c.catego_id} value={c.catego_id}>{c.catego_no}</option>
                ))}
              </select>
            </div>

            {/* Unidad de Medida */}
            <div>
              <label className={eLabel}>Unidad de Medida</label>
              <input
                name="INSUMO_UN" required
                value={formulario.INSUMO_UN}
                onChange={cambiar}
                placeholder="ml, tabletas, dosis..."
                className={eInput}
              />
            </div>

            {/* Existencias Actuales */}
            <div>
              <label className={eLabel}>Existencias Actuales</label>
              <input
                type="number" min="0"
                name="INSUMO_EX" required
                value={formulario.INSUMO_EX}
                onChange={cambiar}
                placeholder="0"
                className={eInput}
              />
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className={eLabel}>Stock Mínimo Requerido</label>
              <input
                type="number" min="0"
                name="INSUMO_SM" required
                value={formulario.INSUMO_SM}
                onChange={cambiar}
                placeholder="0"
                className={eInput}
              />
            </div>
          </div>

          {/* Fecha de Vencimiento */}
          <div>
            <label className={eLabel}>Fecha de Vencimiento</label>
            <input
              type="date"
              name="INSUMO_FE" required
              value={formulario.INSUMO_FE}
              onChange={cambiar}
              className={eInput}
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onCerrar}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#765A05] hover:bg-[#5a4304] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'Registrar Entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── COLUMNAS DE TABLA ────────────────────────────────────────────────────────
const COLUMNAS_ADMIN = [
  'ID Insumo', 'Nombre del Suministro', 'Categoría',
  'Unidad de Medida', 'Existencias', 'Stock Mínimo',
  'Vencimiento', 'Estado', 'Acciones',
]

const COLUMNAS_VET = [
  'Nombre del Suministro', 'Categoría',
  'Unidad de Medida', 'Existencia Actual', 'Stock Mínimo', 'Estado',
]

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function LogisticaInventario({ rolActivo }) {
  const [insumos,      setInsumos]      = useState([])
  const [busqueda,     setBusqueda]     = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando,     setCargando]     = useState(true)
  const [notificacion, setNotificacion] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)

  const esVeterinario = rolActivo === 'VETERINARIO'
  const esAdmin       = rolActivo === 'ADMINISTRADOR'
  const COLUMNAS      = esVeterinario ? COLUMNAS_VET : COLUMNAS_ADMIN

  const mostrarToast = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => setNotificacion(null), 4000)
  }

  useEffect(() => {
    api.get('/inventario')
      .then(r => setInsumos((r.data.registros ?? []).map(normalizarInsumo)))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  const insumosFiltrados = insumos.filter(ins =>
    String(ins.INSUMO_NO || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(ins.INSUMO_ID || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(ins.CATEGO_ID || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginasInv   = Math.max(1, Math.ceil(insumosFiltrados.length / LIMIT_INV))
  const paginaSafeInv     = Math.min(paginaActual, totalPaginasInv)
  const insumosPaginados  = insumosFiltrados.slice((paginaSafeInv - 1) * LIMIT_INV, paginaSafeInv * LIMIT_INV)

  const guardarSuministro = (nuevoSuministro) => {
    setInsumos(prev => [nuevoSuministro, ...prev])
    setModalAbierto(false)
    mostrarToast('exito', 'Suministro registrado exitosamente.')
  }

  // Contadores derivados en tiempo real
  const totalRegistrados = insumos.length
  const enCritico        = insumos.filter(i => calcularEstado(i.INSUMO_EX, i.INSUMO_SM) === 'CRÍTICO').length
  const enAlerta         = insumos.filter(i => calcularEstado(i.INSUMO_EX, i.INSUMO_SM) === 'ALERTA').length
  const enAlertaOCritico = enCritico + enAlerta
  const enOptimo         = insumos.filter(i => calcularEstado(i.INSUMO_EX, i.INSUMO_SM) === 'ÓPTIMO').length
  const donacionesDelMes = 3

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── ENCABEZADO ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#765A05]/10 border border-[#765A05]/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-[#765A05]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {esVeterinario ? 'Consulta de Suministros Médicos' : 'Logística y Control de Insumos Médicos'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {esVeterinario
                ? 'Vista de solo consulta — Disponibilidad del almacén veterinario'
                : 'Gestión del almacén veterinario — Misión Nevado'}
            </p>
          </div>
        </div>

        {esAdmin && (
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 bg-[#765A05] hover:bg-[#5a4304] active:bg-[#3d2d02] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-md shadow-[#765A05]/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Nuevo Suministro
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

      {/* ── BANNER SOLO LECTURA — VETERINARIO ───────────────────────────────── */}
      {esVeterinario && (
        <div className="flex items-center gap-3 bg-sky-50 border border-sky-200/70 rounded-xl px-4 py-3">
          <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
            <Lock className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-sky-800">Modo solo consulta</p>
            <p className="text-xs text-sky-600 mt-0.5">
              Como veterinario puede consultar la disponibilidad de suministros.
              Las entradas y ajustes de stock son gestionadas exclusivamente por el Administrador.
            </p>
          </div>
        </div>
      )}

      {/* ── TARJETAS MÉTRICAS ────────────────────────────────────────────────── */}
      {esVeterinario ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#765A05] to-[#5a4304] rounded-2xl shadow-md p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#FFDF96]/80 uppercase tracking-wider">Suministros Disponibles</p>
              <p className="text-3xl font-bold text-white mt-0.5">{totalRegistrados}</p>
              <p className="text-xs text-[#FFDF96]/80 mt-0.5">referencias en almacén</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estado Crítico / Alerta</p>
              <p className="text-3xl font-bold text-gray-900 mt-0.5">{enAlertaOCritico}</p>
              <p className="text-xs text-gray-400 mt-0.5">{enCritico} en estado crítico</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#765A05] to-[#5a4304] rounded-2xl shadow-md p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#FFDF96]/80 uppercase tracking-wider">Total Insumos Médicos</p>
              <p className="text-3xl font-bold text-white mt-0.5">{totalRegistrados}</p>
              <p className="text-xs text-[#FFDF96]/80 mt-0.5">referencias en almacén</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Medicamentos en Alerta</p>
              <p className="text-3xl font-bold text-gray-900 mt-0.5">{enAlertaOCritico}</p>
              <p className="text-xs text-gray-400 mt-0.5">{enCritico} en estado crítico</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Donaciones Recibidas</p>
              <p className="text-3xl font-bold text-gray-900 mt-0.5">{donacionesDelMes}</p>
              <p className="text-xs text-gray-400 mt-0.5">ingresos este mes</p>
            </div>
          </div>
        </div>
      )}

      {/* ── VISTA VETERINARIO: cuadrícula de tarjetas ────────────────────────── */}
      {esVeterinario ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre, ID o categoría..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-400 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all bg-white/80"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg shrink-0">
              {insumosFiltrados.length} suministro{insumosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {insumosFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl">
              <Package className="w-9 h-9 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No se encontraron suministros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {insumosFiltrados.map(ins => (
                <TarjetaInsumoConsulta key={ins.INSUMO_ID} ins={ins} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3 px-1">
            <p className="text-xs text-gray-400">{insumos.length} suministros en el almacén veterinario</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                {enOptimo} en nivel óptimo
              </span>
              <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                {enAlerta} en alerta
              </span>
              <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" />
                {enCritico} en estado crítico
              </span>
            </div>
          </div>
        </div>

      ) : (
        /* ── VISTA ADMINISTRADOR: tabla completa ──────────────────────────── */
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl">

          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre, ID o categoría..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-400 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all bg-white/80"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg shrink-0">
              {insumosFiltrados.length} suministro{insumosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px]">
              <thead>
                <tr className="bg-white/40 border-b border-gray-200/50">
                  {COLUMNAS.map((col, i) => (
                    <th
                      key={col}
                      className={`text-[11px] font-bold text-[#765A05] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap ${
                        i === COLUMNAS.length - 1 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={COLUMNAS.length} className="py-20 text-center">
                      <p className="text-sm text-gray-400 font-medium">Cargando inventario...</p>
                    </td>
                  </tr>
                ) : insumosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNAS.length} className="py-20 text-center">
                      <Package className="w-9 h-9 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 font-medium">No se encontraron suministros</p>
                    </td>
                  </tr>
                ) : insumosPaginados.map(ins => {
                  const estado     = calcularEstado(ins.INSUMO_EX, ins.INSUMO_SM)
                  const pct        = calcularPct(ins.INSUMO_EX, ins.INSUMO_SM)
                  const barra      = colorBarra(estado)
                  // Fila con fondo rojo suave cuando el stock es CRÍTICO
                  const filaAlerta = estado === 'CRÍTICO' ? 'bg-red-50/40' : ''
                  const cifraColor = estado === 'CRÍTICO'
                    ? 'text-red-600 font-bold'
                    : estado === 'ALERTA'
                      ? 'text-amber-600 font-semibold'
                      : 'text-gray-900 font-medium'

                  return (
                    <tr
                      key={ins.INSUMO_ID}
                      className={`border-b border-gray-50 last:border-0 hover:bg-[#FFDF96]/10 transition-colors ${filaAlerta}`}
                    >
                      {/* ID Insumo */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <code className="text-xs font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                          {ins.INSUMO_ID}
                        </code>
                      </td>

                      {/* Nombre */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{ins.INSUMO_NO}</p>
                      </td>

                      {/* Categoría */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                          {ins.CATEGO_ID}
                        </span>
                      </td>

                      {/* Unidad */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-sm text-gray-500">{ins.INSUMO_UN}</p>
                      </td>

                      {/* Existencias con barra de progreso */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-sm ${cifraColor}`}>
                            {ins.INSUMO_EX}
                            <span className="text-xs font-normal text-gray-400 ml-1">{ins.INSUMO_UN}</span>
                          </span>
                          <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barra} rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Stock Mínimo */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-sm text-gray-500">
                          {ins.INSUMO_SM}
                          <span className="text-xs text-gray-400 ml-1">{ins.INSUMO_UN}</span>
                        </p>
                      </td>

                      {/* Vencimiento */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                          {ins.INSUMO_FE}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        <BadgeStock estado={estado} />
                      </td>

                      {/* Acciones — solo visibles para ADMINISTRADOR */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {esAdmin ? (
                            <>
                              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                                <RefreshCw className="w-3.5 h-3.5" />
                                Ajustar Stock
                              </button>
                              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-teal-700 hover:bg-teal-50 border border-gray-200 hover:border-teal-200 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                                <Activity className="w-3.5 h-3.5" />
                                Historial
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-300 italic">Sin acciones</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pie de tabla con leyenda de estados + paginación */}
          <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-gray-400">
              {insumos.length} suministros registrados en el almacén
            </p>
            {totalPaginasInv > 1 && (
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                <button
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaSafeInv === 1}
                  className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-xs font-semibold text-gray-600 px-2">
                  {paginaSafeInv} / {totalPaginasInv}
                </span>
                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginasInv, p + 1))}
                  disabled={paginaSafeInv === totalPaginasInv}
                  className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                {enOptimo} en nivel óptimo
              </span>
              <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                {enAlerta} en alerta
              </span>
              <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" />
                {enCritico} en estado crítico
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NUEVO SUMINISTRO ─────────────────────────────────────────────── */}
      {modalAbierto && (
        <ModalNuevoSuministro
          onCerrar={() => setModalAbierto(false)}
          onGuardar={guardarSuministro}
        />
      )}
    </div>
  );
}
