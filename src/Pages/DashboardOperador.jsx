import { useState, useEffect } from 'react'
import { PawPrint, Users, FileText, HandHeart, MapPin, ClipboardList, AlertTriangle, CheckCircle, LayoutDashboard } from 'lucide-react'
import api from '../lib/api'

// ─── MÓDULOS PERMITIDOS PARA PERSONAL DE CAMPO ───────────────────────────────
const modulosPermitidos = [
  {
    id:          'censo',
    Icono:       PawPrint,
    color:       'bg-[#765A05]',
    colorHover:  'group-hover:text-[#765A05]',
    label:       'Censo Animal',
    descripcion: 'Registrar y consultar la población animal del sector — incluye registro de propietario',
  },
  {
    id:          'denuncias',
    Icono:       FileText,
    color:       'bg-orange-500',
    colorHover:  'group-hover:text-orange-600',
    label:       'Recepción de Denuncias',
    descripcion: 'Recibir y documentar reportes de maltrato o abandono animal',
  },
  {
    id:          'colaboraciones',
    Icono:       HandHeart,
    color:       'bg-emerald-600',
    colorHover:  'group-hover:text-emerald-600',
    label:       'Registro de Colaboraciones',
    descripcion: 'Registrar aportes recibidos: servicios, insumos o recursos monetarios',
  },
]

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function DashboardOperador({ setVistaActual }) {
  const [conteos, setConteos] = useState({ censo: '—', denuncias: '—', colabs: '—', personas: '—' })

  useEffect(() => {
    Promise.all([
      api.get('/censo').catch(() => ({ data: { registros: [] } })),
      api.get('/denuncias').catch(() => ({ data: { registros: [] } })),
      api.get('/colaboraciones').catch(() => ({ data: { registros: [] } })),
    ]).then(([rCenso, rDen, rColab]) => {
      const censoLista  = rCenso.data.registros  ?? []
      const denLista    = rDen.data.registros    ?? []
      const colabLista  = rColab.data.registros  ?? []
      const personasUnicas = new Set(censoLista.map(r => r.person_id).filter(Boolean)).size
      setConteos({
        censo:    String(censoLista.length),
        denuncias: String(denLista.filter(d =>
          (d.denunc_es ?? '').toUpperCase() !== 'CERRADA'
        ).length),
        colabs:   String(colabLista.length),
        personas: String(personasUnicas),
      })
    })
  }, [])

  const metricas = [
    { label: 'Censos Registrados',  valor: conteos.censo,     sub: 'animales en el sistema',    color: 'text-[#765A05]',   fondo: 'bg-[#FFDF96]/30', borde: 'border-[#FFDF96]/40', Icono: PawPrint      },
    { label: 'Denuncias Activas',   valor: conteos.denuncias, sub: 'pendientes de atención',    color: 'text-orange-600',  fondo: 'bg-orange-50',    borde: 'border-orange-100',   Icono: AlertTriangle },
    { label: 'Colaboraciones',       valor: conteos.colabs,   sub: 'aportes registrados',       color: 'text-emerald-600', fondo: 'bg-emerald-50',   borde: 'border-emerald-100',  Icono: HandHeart     },
    { label: 'Propietarios',        valor: conteos.personas,  sub: 'ciudadanos en el sistema',  color: 'text-sky-600',     fondo: 'bg-sky-50',       borde: 'border-sky-100',      Icono: Users         },
  ]

  return (
    <div className="space-y-7 max-w-5xl">

      {/* ── BANNER DE BIENVENIDA ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#765A05] to-[#9a7606] rounded-2xl p-6 flex flex-row items-center justify-between gap-4 shadow-xl shadow-[#765A05]/20">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#FFDF96] shrink-0" />
            <span className="text-[11px] font-bold text-[#FFDF96]/70 uppercase tracking-widest">
              Personal de Campo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Panel de Operaciones</h2>
          <p className="text-sm text-[#FFDF96]/80 mt-1">
            Fundación Misión Nevado — Módulos habilitados para tu perfil operativo
          </p>
        </div>
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
          <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-[#FFDF96]" />
        </div>
      </div>

      {/* ── TARJETAS MÉTRICAS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricas.map(({ label, valor, sub, color, fondo, borde, Icono }) => (
          <div
            key={label}
            className={`${fondo} border ${borde} rounded-2xl p-5 backdrop-blur-sm shadow-sm`}
          >
            <Icono className={`w-5 h-5 ${color} mb-3`} />
            <p className={`text-3xl font-black ${color}`}>{valor}</p>
            <p className="text-xs font-bold text-gray-700 mt-0.5">{label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── MÓDULOS DISPONIBLES ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard className="w-4 h-4 text-[#765A05]/60" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Módulos habilitados para tu perfil
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modulosPermitidos.map(({ id, Icono, color, colorHover, label, descripcion }) => (
            <button
              key={id}
              onClick={() => setVistaActual(id)}
              className="group bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-[#765A05]/5 rounded-2xl p-6 text-left hover:shadow-xl hover:shadow-[#765A05]/10 hover:bg-white/90 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icono className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold text-gray-900 ${colorHover} transition-colors`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{descripcion}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── AVISO DE RESTRICCIÓN DE ACCESO ──────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200/60 rounded-xl px-4 py-3.5">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Perfil con acceso restringido.</span>{' '}
          Las secciones de Gestión de Usuarios, Bitácora de Auditoría, Control Web y Catálogo Maestro de
          Insumos son exclusivas del Administrador y no están disponibles para este perfil.
        </p>
      </div>
    </div>
  )
}
