import { useState, useEffect } from 'react'
import {
  Users, Plus, Search, ShieldCheck, Stethoscope, MapPin,
  Eye, EyeOff, Save, X, UserCheck, UserX, Lock,
  Calendar, Clock, ChevronLeft, ChevronRight,
} from 'lucide-react'
import api from '../lib/api'

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const LIMIT = 10

const mapEstado = (es) => {
  if (es === 'SUSPENDIDO') return 'BLOQUEADO'
  return es ?? 'ACTIVO'
}

const normalizarUsuario = (u) => ({
  USUARI_ID: u.usuari_id ?? u.USUARI_ID,
  PERSON_ID: u.person_ce ?? u.PERSON_ID ?? '—',
  ROLESG_ID: u.rolreg_no ?? u.ROLESG_ID ?? '—',
  ROLREG_ID: u.rolreg_id ?? u.ROLREG_ID ?? null,
  USUARI_NO: u.usuari_no ?? u.USUARI_NO ?? '',
  USUARI_CL: '••••••••',
  USUARI_ES: mapEstado(u.usuari_es ?? u.USUARI_ES),
  USUARI_FC: (u.usuari_fe ?? u.USUARI_FC ?? '').slice(0, 10),
  USUARI_FM: (u.usuari_fm ?? u.USUARI_FM ?? '').slice(0, 10),
})

// ─── MOCK DATA — TM_USUARI ────────────────────────────────────────────────────

const usuariosIniciales = [
  {
    USUARI_ID: 'USR-001',
    PERSON_ID: 'V-15.883.241',
    ROLESG_ID: 'Administrador',
    USUARI_NO: 'jperez.admin',
    USUARI_CL: '••••••••',
    USUARI_ES: 'ACTIVO',
    USUARI_FC: '2025-01-15',
    USUARI_FM: '2026-05-20',
  },
  {
    USUARI_ID: 'USR-002',
    PERSON_ID: 'V-22.456.789',
    ROLESG_ID: 'Veterinario',
    USUARI_NO: 'dra.torres.vet',
    USUARI_CL: '••••••••',
    USUARI_ES: 'ACTIVO',
    USUARI_FC: '2025-03-08',
    USUARI_FM: '2026-06-01',
  },
  {
    USUARI_ID: 'USR-003',
    PERSON_ID: 'V-28.001.334',
    ROLESG_ID: 'Personal de Campo',
    USUARI_NO: 'campo.garcia',
    USUARI_CL: '••••••••',
    USUARI_ES: 'ACTIVO',
    USUARI_FC: '2025-04-12',
    USUARI_FM: '2026-06-10',
  },
  {
    USUARI_ID: 'USR-004',
    PERSON_ID: 'V-19.774.562',
    ROLESG_ID: 'Veterinario',
    USUARI_NO: 'vet.morales',
    USUARI_CL: '••••••••',
    USUARI_ES: 'INACTIVO',
    USUARI_FC: '2025-02-20',
    USUARI_FM: '2026-04-15',
  },
  {
    USUARI_ID: 'USR-005',
    PERSON_ID: 'V-31.228.900',
    ROLESG_ID: 'Personal de Campo',
    USUARI_NO: 'voluntario.ruiz',
    USUARI_CL: '••••••••',
    USUARI_ES: 'BLOQUEADO',
    USUARI_FC: '2025-05-30',
    USUARI_FM: '2026-05-31',
  },
  {
    USUARI_ID: 'USR-006',
    PERSON_ID: 'V-24.118.073',
    ROLESG_ID: 'Personal de Campo',
    USUARI_NO: 'logistica.leon',
    USUARI_CL: '••••••••',
    USUARI_ES: 'ACTIVO',
    USUARI_FC: '2025-06-01',
    USUARI_FM: '2026-06-12',
  },
]

const FORM_VACIO = {
  PERSON_ID: '',
  ROLESG_ID: '',
  USUARI_NO: '',
  USUARI_CL: '',
  USUARI_ES: 'ACTIVO',
}

const ROLES_DISPLAY = ['Administrador', 'Veterinario', 'Personal de Campo']
const ROLES_FALLBACK = { 'Administrador': 1, 'Veterinario': 2, 'Personal de Campo': 3 }

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────

const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'

// ─── BADGE: NIVEL DE ACCESO ───────────────────────────────────────────────────

function BadgeRol({ rol }) {
  const cfg = {
    'Administrador':      { color: 'bg-[#765A05]/10 text-[#765A05] border-[#765A05]/20',   Icono: ShieldCheck  },
    'Veterinario':        { color: 'bg-sky-50 text-sky-700 border-sky-200',                 Icono: Stethoscope  },
    'Personal de Campo':  { color: 'bg-amber-50 text-amber-700 border-amber-200',           Icono: MapPin       },
  }[rol] ?? { color: 'bg-gray-100 text-gray-600 border-gray-200', Icono: Users }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.color}`}>
      <cfg.Icono className="w-3 h-3" />
      {rol}
    </span>
  )
}

// ─── BADGE: ESTADO DEL USUARIO ────────────────────────────────────────────────

function BadgeEstadoUsuario({ estado }) {
  const cfg = {
    ACTIVO:    { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Activo'   },
    INACTIVO:  { color: 'bg-gray-100 text-gray-500 border-gray-200',         label: 'Inactivo' },
    BLOQUEADO: { color: 'bg-rose-50 text-rose-600 border-rose-200',          label: 'Bloqueado'},
  }[estado] ?? { color: 'bg-gray-100 text-gray-500 border-gray-200', label: estado }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.color}`}>
      {estado === 'BLOQUEADO' && <Lock className="w-3 h-3" />}
      {estado === 'ACTIVO'    && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {cfg.label}
    </span>
  )
}

// ─── MODAL: NUEVO USUARIO ─────────────────────────────────────────────────────

function ModalNuevoUsuario({ onCerrar, onGuardar }) {
  const [formulario, setFormulario] = useState(FORM_VACIO)
  const [verClave,   setVerClave]   = useState(false)

  const cambiar = ({ target: { name, value } }) =>
    setFormulario(p => ({ ...p, [name]: value }))

  const enviar = (e) => {
    e.preventDefault()
    const nuevoUsuario = {
      ...formulario,
      USUARI_ID: `USR-${String(Date.now()).slice(-3)}`,
      USUARI_FC: new Date().toISOString().slice(0, 10),
      USUARI_FM: new Date().toISOString().slice(0, 10),
    }
    onGuardar(nuevoUsuario)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-lg">

        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#765A05]/10 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-[#765A05]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Nuevo Acceso de Usuario</h3>
              <p className="text-xs text-gray-400">Registro en TM_USUARI</p>
            </div>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={enviar} className="p-6 space-y-4">

          {/* Cédula de Identidad */}
          <div>
            <label className={eLabel}>Cédula de Identidad del Titular</label>
            <input
              name="PERSON_ID" required
              value={formulario.PERSON_ID}
              onChange={cambiar}
              placeholder="V-00.000.000"
              className={eInput}
            />
          </div>

          {/* Nombre de Usuario */}
          <div>
            <label className={eLabel}>Nombre de Usuario (Login)</label>
            <input
              name="USUARI_NO" required
              value={formulario.USUARI_NO}
              onChange={cambiar}
              placeholder="usuario.apellido"
              className={eInput}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className={eLabel}>Contraseña de Acceso</label>
            <div className="relative">
              <input
                type={verClave ? 'text' : 'password'}
                name="USUARI_CL" required
                value={formulario.USUARI_CL}
                onChange={cambiar}
                placeholder="Mínimo 8 caracteres"
                className={`${eInput} pr-11`}
              />
              <button
                type="button"
                onClick={() => setVerClave(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {verClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Nivel de Acceso */}
            <div>
              <label className={eLabel}>Nivel de Acceso</label>
              <select
                name="ROLESG_ID" required
                value={formulario.ROLESG_ID}
                onChange={cambiar}
                className={eInput}
              >
                <option value="">Seleccione nivel</option>
                {ROLES_DISPLAY.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className={eLabel}>Estado Inicial</label>
              <select
                name="USUARI_ES"
                value={formulario.USUARI_ES}
                onChange={cambiar}
                className={eInput}
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
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
              className="flex items-center gap-2 px-6 py-2.5 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Crear Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function GestionUsuarios() {
  const [usuarios,     setUsuarios]     = useState(usuariosIniciales)
  const [busqueda,     setBusqueda]     = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando,     setCargando]     = useState(true)
  const [notificacion, setNotificacion] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [rolesMap,     setRolesMap]     = useState(ROLES_FALLBACK)

  const mostrarToast = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => setNotificacion(null), 4000)
  }

  useEffect(() => {
    const cargarRoles = api.get('/roles')
      .then(r => {
        const mapa = {}
        ;(r.data.registros ?? r.data ?? []).forEach(rol => {
          mapa[rol.rolreg_no ?? rol.ROLREG_NO ?? ''] = rol.rolreg_id ?? rol.ROLREG_ID
        })
        if (Object.keys(mapa).length) setRolesMap(mapa)
      })
      .catch(() => {})

    const cargarUsuarios = api.get('/usuarios')
      .then(r => {
        const datos = r.data.registros ?? []
        if (datos.length) setUsuarios(datos.map(normalizarUsuario))
      })
      .catch(() => {})

    Promise.allSettled([cargarRoles, cargarUsuarios])
      .finally(() => setCargando(false))
  }, [])

  const cambiarEstado = async (usuariId, nuevoEstado) => {
    const hoy = new Date().toISOString().slice(0, 10)
    const estadoApi = nuevoEstado === 'BLOQUEADO' ? 'SUSPENDIDO' : nuevoEstado
    setUsuarios(prev =>
      prev.map(u =>
        (u.USUARI_ID === usuariId || String(u.USUARI_ID) === String(usuariId))
          ? { ...u, USUARI_ES: nuevoEstado, USUARI_FM: hoy }
          : u
      )
    )
    try {
      await api.patch(`/usuarios/${usuariId}/estado`, { USUARI_ES: estadoApi })
      mostrarToast('exito', `Estado actualizado a ${nuevoEstado === 'BLOQUEADO' ? 'bloqueado' : nuevoEstado.toLowerCase()}.`)
    } catch {
      mostrarToast('error', 'No se pudo actualizar el estado en el servidor.')
    }
  }

  const guardarUsuario = async (nuevoUsuario) => {
    const rolId = rolesMap[nuevoUsuario.ROLESG_ID] ?? ROLES_FALLBACK[nuevoUsuario.ROLESG_ID] ?? 1
    const payload = {
      PERSON_ID: nuevoUsuario.PERSON_ID,
      ROLESG_ID: rolId,
      USUARI_NO: nuevoUsuario.USUARI_NO,
      USUARI_CL: nuevoUsuario.USUARI_CL,
      USUARI_ES: nuevoUsuario.USUARI_ES,
    }
    try {
      const r = await api.post('/usuarios', payload)
      const creado = normalizarUsuario({
        ...r.data.registro,
        ROLESG_ID: nuevoUsuario.ROLESG_ID,
        USUARI_FM: new Date().toISOString().slice(0, 10),
      })
      setUsuarios(prev => [creado, ...prev])
      mostrarToast('exito', 'Usuario creado exitosamente.')
    } catch (error) {
      setUsuarios(prev => [nuevoUsuario, ...prev])
      mostrarToast('error', error.response?.data?.mensaje ?? 'Usuario guardado localmente.')
    }
    setModalAbierto(false)
  }

  const usuariosFiltrados = usuarios.filter(u =>
    String(u.USUARI_NO || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.PERSON_ID || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(u.ROLESG_ID || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas      = Math.max(1, Math.ceil(usuariosFiltrados.length / LIMIT))
  const paginaSafe        = Math.min(paginaActual, totalPaginas)
  const usuariosPaginados = usuariosFiltrados.slice((paginaSafe - 1) * LIMIT, paginaSafe * LIMIT)

  // Contadores para tarjetas métricas
  const totalActivos   = usuarios.filter(u => u.USUARI_ES === 'ACTIVO').length
  const totalBloqueado = usuarios.filter(u => u.USUARI_ES === 'BLOQUEADO').length
  const totalRegistros = usuarios.length

  const COLUMNAS = [
    'ID Sistema', 'Cédula Titular', 'Nivel de Acceso', 'Usuario Login',
    'Estado', 'Fecha de Alta', 'Ú. Modificación', 'Acciones',
  ]

  return (
    <div className="space-y-6">

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

      {/* ── TARJETAS MÉTRICAS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Usuarios Activos',   valor: totalActivos,   color: 'text-emerald-600', fondo: 'bg-emerald-50/80',  borde: 'border-emerald-100' },
          { label: 'Accesos Bloqueados', valor: totalBloqueado, color: 'text-rose-600',    fondo: 'bg-rose-50/80',     borde: 'border-rose-100'    },
          { label: 'Total Registros',    valor: totalRegistros, color: 'text-[#765A05]',   fondo: 'bg-white/70',       borde: 'border-white/50'    },
        ].map(({ label, valor, color, fondo, borde }) => (
          <div key={label} className={`${fondo} backdrop-blur-md border ${borde} rounded-2xl shadow-lg p-5`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{valor}</p>
          </div>
        ))}
      </div>

      {/* ── ENCABEZADO: buscador + botón nuevo ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Gestión de Usuarios y Control Web
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-0 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPaginaActual(1) }}
              placeholder="Buscar por usuario, cédula o rol..."
              className="pl-9 pr-4 py-2 w-full sm:w-72 text-sm bg-white/80 border border-gray-400 backdrop-blur-sm rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition"
            />
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-[#765A05]/10 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* ── TABLA DE USUARIOS ─────────────────────────────────────────────────── */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-[#765A05]/5 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/40 border-b border-gray-200/50">
            <tr>
              {COLUMNAS.map(col => (
                <th
                  key={col}
                  className="px-5 py-3.5 text-left text-xs font-bold text-[#765A05] uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {cargando ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                  Cargando usuarios...
                </td>
              </tr>
            ) : usuariosPaginados.length > 0 ? (
              usuariosPaginados.map(u => (
                <tr key={u.USUARI_ID} className="hover:bg-white/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-gray-400 font-medium">{u.USUARI_ID}</td>
                  <td className="px-5 py-4 text-gray-700 font-medium">{u.PERSON_ID}</td>
                  <td className="px-5 py-4"><BadgeRol rol={u.ROLESG_ID} /></td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-800 font-semibold">{u.USUARI_NO}</td>
                  <td className="px-5 py-4"><BadgeEstadoUsuario estado={u.USUARI_ES} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {u.USUARI_FC}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {u.USUARI_FM}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {u.USUARI_ES !== 'ACTIVO' && (
                        <button
                          onClick={() => cambiarEstado(u.USUARI_ID, 'ACTIVO')}
                          className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Activar
                        </button>
                      )}
                      {u.USUARI_ES !== 'BLOQUEADO' && (
                        <button
                          onClick={() => cambiarEstado(u.USUARI_ID, 'BLOQUEADO')}
                          className="flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Bloquear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                  No se encontraron usuarios{busqueda && <> para <span className="font-medium text-gray-600">"{busqueda}"</span></>}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* ── PAGINACIÓN ────────────────────────────────────────────────────────── */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <p className="text-xs text-gray-400">{usuarios.length} usuarios registrados en el sistema</p>
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
        </div>
      )}

      {/* ── MODAL NUEVO USUARIO ───────────────────────────────────────────────── */}
      {modalAbierto && (
        <ModalNuevoUsuario
          onCerrar={() => setModalAbierto(false)}
          onGuardar={guardarUsuario}
        />
      )}
    </div>
  )
}
