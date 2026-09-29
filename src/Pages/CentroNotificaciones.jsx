import { useState, useEffect } from 'react'
import { Bell, Heart, AlertTriangle, Stethoscope, ChevronRight, CheckCircle } from 'lucide-react'
import api from '../lib/api'

// ─── CENTRO DE NOTIFICACIONES ────────────────────────────────────────────────
// "Ver todas las notificaciones": el detalle de cada pendiente que la campana
// resume por tipo. Cada fila lleva al módulo donde se atiende.
// roles: mismos permisos que las alertas de la campana y el menú lateral.
const SECCIONES = [
  { id: 'sol', titulo: 'Solicitudes de adopción pendientes', icono: Heart,         color: 'bg-rose-100 text-rose-500',   roles: ['ADMINISTRADOR', 'CAMPO'],       destino: 'cartelera', tab: 'solicitudes' },
  { id: 'inv', titulo: 'Insumos por debajo del stock mínimo', icono: AlertTriangle, color: 'bg-amber-100 text-amber-600', roles: ['ADMINISTRADOR', 'VETERINARIO'], destino: 'logistica' },
  { id: 'vet', titulo: 'Consultas veterinarias pendientes',   icono: Stethoscope,   color: 'bg-sky-100 text-sky-500',     roles: ['ADMINISTRADOR', 'VETERINARIO'], destino: 'medica' },
]

// 'YYYY-MM-DD' (o marca de tiempo) → dd/mm/aaaa
const fechaCorta = (v) => {
  const [a, m, d] = String(v ?? '').slice(0, 10).split('-')
  return a && m && d ? `${d}/${m}/${a}` : ''
}

export default function CentroNotificaciones({ rolActivo, onNavegar }) {
  const [items,    setItems]    = useState({ sol: [], inv: [], vet: [] })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const vacio = { data: { registros: [] } }
    const puede = (id) => SECCIONES.find(s => s.id === id).roles.includes(rolActivo)
    Promise.all([
      puede('sol') ? api.get('/adopciones/solicitudes').catch(() => vacio) : vacio,
      puede('inv') ? api.get('/inventario').catch(() => vacio) : vacio,
      puede('vet') ? api.get('/veterinaria').catch(() => vacio) : vacio,
    ]).then(([rSol, rInv, rVet]) => {
      setItems({
        sol: (rSol.data.registros ?? []).filter(s => s.solic_es === 'PENDIENTE').map(s => ({
          clave: `sol-${s.solic_id}`,
          titulo: `${s.solic_no} solicitó adoptar a "${s.mascota_no ?? '—'}"`,
          detalle: [s.solic_em, s.solic_tl].filter(Boolean).join(' · '),
          fecha: fechaCorta(s.solic_fe),
        })),
        inv: (rInv.data.registros ?? []).filter(i => Number(i.insumo_sm) > 0 && Number(i.insumo_ex) < Number(i.insumo_sm)).map(i => ({
          clave: `inv-${i.insum_id}`,
          titulo: i.insumo_no,
          detalle: `Existencia ${i.insumo_ex} ${i.insumo_un ?? ''} · mínimo requerido ${i.insumo_sm}`,
          fecha: '',
        })),
        vet: (rVet.data.registros ?? []).filter(c => c.consul_es === 'Pendiente').map(c => ({
          clave: `vet-${c.consul_id}`,
          titulo: `Paciente "${c.nom_anima}"`,
          detalle: c.consul_mo ? `Motivo: ${c.consul_mo}` : 'Consulta sin cerrar',
          fecha: fechaCorta(c.consul_fe),
        })),
      })
    }).finally(() => setCargando(false))
  }, [rolActivo])

  const visibles = SECCIONES.filter(s => s.roles.includes(rolActivo))
  const total = visibles.reduce((n, s) => n + items[s.id].length, 0)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Notificaciones</h2>
          <p className="text-sm text-[#765A05]/60 mt-0.5">Todo lo que está pendiente de atención — haga clic en un elemento para ir a atenderlo</p>
        </div>
        <span className="flex items-center gap-2 text-xs font-semibold text-amber-900/60 bg-[#FFDF96]/40 px-3 py-1.5 rounded-full">
          <Bell className="w-3.5 h-3.5" />
          {cargando ? 'Cargando…' : `${total} pendiente${total === 1 ? '' : 's'}`}
        </span>
      </div>

      {!cargando && total === 0 && (
        <div className="bg-white/65 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-[#765A05]/5 py-14 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">No hay notificaciones pendientes</p>
          <p className="text-xs text-gray-400 mt-1">Todo está al día.</p>
        </div>
      )}

      {visibles.filter(s => items[s.id].length > 0).map(({ id, titulo, icono: Icono, color, destino, tab }) => (
        <div key={id} className="bg-white/65 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-[#765A05]/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#765A05]/10">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icono className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">{titulo}</h3>
            </div>
            <span className="text-xs font-semibold text-amber-900/50 bg-[#FFDF96]/40 px-2 py-0.5 rounded-full">{items[id].length}</span>
          </div>
          <ul className="divide-y divide-[#765A05]/8">
            {items[id].map(item => (
              <li key={item.clave}
                onClick={() => onNavegar(destino, tab)}
                className="px-5 py-3 hover:bg-[#FFDF96]/20 transition-colors cursor-pointer flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{item.titulo}</p>
                  {item.detalle && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.detalle}</p>}
                </div>
                {item.fecha && <span className="text-xs text-gray-400 shrink-0">{item.fecha}</span>}
                <ChevronRight className="w-4 h-4 text-[#765A05]/40 shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
