import { useState, useEffect } from 'react'
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import api from '../lib/api'
import confirmarConClave from '../lib/confirmarConClave'

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
export default function RegistrosCenso({ setVistaActual, registros: _ignorado = [], onVerFicha, onEditar, rolActivo = 'ADMINISTRADOR' }) {
  const esAdmin = rolActivo === 'ADMINISTRADOR'
  const [busqueda,     setBusqueda] = useState('')
  const [paginaActual, setPagina]   = useState(1)
  const [registros,    setRegistros] = useState([])
  const [cargando,     setCargando]  = useState(true)
  const [errorCarga,   setErrorCarga] = useState('')

  useEffect(() => {
    const cargarRegistros = async () => {
      try {
        setCargando(true)
        const { data } = await api.get('/censo')
        setRegistros(data.registros || [])
      } catch (error) {
        setErrorCarga(error.response?.data?.mensaje || 'Error al cargar los registros del censo')
      } finally {
        setCargando(false)
      }
    }
    cargarRegistros()
  }, [])

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#765A05]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Cargando registros del censo...</p>
      </div>
    )
  }

  if (errorCarga) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-semibold text-rose-600">{errorCarga}</p>
      </div>
    )
  }

  const registrosFiltrados = registros.filter((r) =>
    (r.person_ce || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const LIMIT = 10
  const totalPaginas = Math.max(1, Math.ceil(registrosFiltrados.length / LIMIT))
  const registrosPaginados = registrosFiltrados.slice((paginaActual - 1) * LIMIT, paginaActual * LIMIT)

  const verDetalle = (r) => onVerFicha?.(r)
  const editar     = (r) => onEditar?.(r)   // abre el formulario del censo con el registro cargado

  const eliminar = async (r) => {
    const eliminado = await confirmarConClave({
      titulo:  'Eliminar del Censo',
      mensaje: `¿Eliminar del censo a ${r.nom_anima} (dueño ${r.person_ce})?`,
      accion:  (clave) => api.delete(`/censo/${r.censoa_id}`, { data: { clave } }),
    })
    if (eliminado) setRegistros(prev => prev.filter(x => x.censoa_id !== r.censoa_id))
  }

  // 'YYYY-MM-DD' → dd/mm/aaaa sin pasar por Date (evita correrse un día por zona horaria)
  const fechaCorta = (f) => {
    const [a, m, d] = String(f ?? '').slice(0, 10).split('-')
    return a && m && d ? `${d}/${m}/${a}` : ''
  }

  return (
    <div className="space-y-5">

      {/* ── ENCABEZADO: título + buscador + botón ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Registros de Censo Animal
        </h2>

        <div className="flex items-center gap-3 flex-wrap">

          <div className="relative flex-1 min-w-0 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por Cédula del Propietario (PERSON_CE)..."
              className="pl-9 pr-4 py-2 w-full sm:w-72 text-sm bg-white/80 border border-gray-500 backdrop-blur-xs rounded-xl
                         text-gray-700 placeholder-gray-500 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition"
            />
          </div>

          <button
            type="button"
            onClick={() => setVistaActual('propietario')}
            className="flex items-center gap-2 px-4 py-2 bg-[#765A05] hover:bg-[#5a4304]
                       text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-[#765A05]/10 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* ── TABLA DE REGISTROS (Diseño translúcido) ── */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-[#765A05]/5 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">

          <thead className="bg-white/40 border-b border-gray-200/50">
            <tr>
              {['Cédula', 'Nombre Mascota', 'Raza', 'Sector', 'Fecha'].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3.5 text-left text-xs font-bold text-[#765A05] uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
              <th className="px-6 py-3.5 text-right text-xs font-bold text-[#765A05] uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100/50">
            {registrosPaginados.length > 0 ? (
              registrosPaginados.map((r, index) => (
                <tr key={r.censoa_id ?? index} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-medium">{r.person_ce}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{r.nom_anima}</td>
                  {/* TEXTO DE RAZA (CORREGIDO AL COLOR #765A05) */}
                  <td className="px-6 py-4 text-[#765A05] font-semibold">{r.razare_no ?? r.razare_id ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{r.sector_no ?? r.sector_id}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{fechaCorta(r.fec_censo)}</td>

                  {/* Botones de acción */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => verDetalle(r)}
                        title="Ver ficha del paciente"
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Ficha
                      </button>

                      <button
                        onClick={() => editar(r)}
                        title="Editar registro"
                        className="p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {esAdmin && (
                        <button
                          onClick={() => eliminar(r)}
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  No se encontraron registros para{' '}
                  <span className="font-medium text-gray-600">"{busqueda}"</span>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* ── PAGINACIÓN ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-1">
        {/* TEXTO INFORMATIVO (CORREGIDO AL COLOR #765A05) */}
        <p className="text-sm text-[#765A05] font-medium">
          Mostrando {registrosPaginados.length} de {registrosFiltrados.length} registros
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 rounded-xl hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPagina(n)}
              className={`w-8 h-8 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                paginaActual === n
                  /* CUADRITO ACTIVO (CORREGIDO AL COLOR #765A05) */
                  ? 'bg-[#765A05] text-white shadow-md shadow-[#765A05]/20 scale-105'
                  : 'text-gray-600 hover:bg-white/60'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 rounded-xl hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}