import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard, TrendingUp, Heart, Calendar, MapPin,
  Save, Check, AlertCircle, Monitor, Shield, Globe,
  Upload, Eye, EyeOff,
} from 'lucide-react'

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const eCard  = 'bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl'
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'
const eSec   = 'text-xs font-bold text-[#765A05] uppercase tracking-widest flex items-center gap-2'
const eBoton = 'flex items-center justify-center gap-2 py-2.5 px-4 bg-[#765A05] text-white text-sm font-bold rounded-xl hover:bg-[#5c4504] transition-all shadow-md shadow-[#765A05]/20 disabled:opacity-60'

// ─── PESTAÑAS ─────────────────────────────────────────────────────────────────
const PESTANAS = [
  { id: 'hero',         etiqueta: 'Hero',         Icono: LayoutDashboard },
  { id: 'estadisticas', etiqueta: 'Estadísticas', Icono: TrendingUp      },
  { id: 'adopciones',   etiqueta: 'Adopciones',   Icono: Heart           },
  { id: 'jornadas',     etiqueta: 'Jornadas',     Icono: Calendar        },
  { id: 'contacto',     etiqueta: 'Contacto',     Icono: MapPin          },
]

// ─── DATOS INICIALES — espejo exacto de SISVIC_WEB/SISVIC_1/src/App.jsx ─────

const HERO_INICIAL = {
  badge:                'Fundación de Rescate Animal',
  titulo_inicio:        'Dale una ',
  titulo_acento:        'segunda oportunidad',
  titulo_fin:           ' a quien lo necesita.',
  descripcion:          'Trabajamos incansablemente para brindar atención médica, resguardo y familias amorosas a la fauna vulnerable en La Grita - Táchira.',
  imagen_url:           'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
  imagen_local:         null,
  imagen_frontal_url:   'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
  imagen_frontal_local: null,
}

const ESTADISTICAS_INICIALES = [
  { id: 'EST-1', valor: '+850', etiqueta: 'Rescates Exitosos'    },
  { id: 'EST-2', valor: '+420', etiqueta: 'Familias Encontradas' },
  { id: 'EST-3', valor: '24/7', etiqueta: 'Atención Continua'   },
]

// Datos del backend de adopciones — se carga con fetch; estos son el fallback
const PACIENTES_MOCK = [
  { ADOPCI_ID: 101, ADOPCI_FT: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80', ADOPCI_NO: 'Boby',  ADOPCI_ES: 'Canino', ADOPCI_ED: '2 Años',  ADOPCI_TA: 'Mediano', ADOPCI_ST: 'DISPONIBLE', visibleEnPortada: true  },
  { ADOPCI_ID: 102, ADOPCI_FT: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80', ADOPCI_NO: 'Luna',  ADOPCI_ES: 'Felino', ADOPCI_ED: '1 Año',   ADOPCI_TA: 'Pequeño', ADOPCI_ST: 'DISPONIBLE', visibleEnPortada: true  },
  { ADOPCI_ID: 103, ADOPCI_FT: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=600&q=80', ADOPCI_NO: 'Max',   ADOPCI_ES: 'Canino', ADOPCI_ED: '4 Meses', ADOPCI_TA: 'Pequeño', ADOPCI_ST: 'DISPONIBLE', visibleEnPortada: true  },
  { ADOPCI_ID: 104, ADOPCI_FT: 'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=600&q=80', ADOPCI_NO: 'Rocky', ADOPCI_ES: 'Canino', ADOPCI_ED: '3 Años',  ADOPCI_TA: 'Grande',  ADOPCI_ST: 'DISPONIBLE', visibleEnPortada: false },
  { ADOPCI_ID: 105, ADOPCI_FT: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80', ADOPCI_NO: 'Bella', ADOPCI_ES: 'Felino', ADOPCI_ED: '2 Años',  ADOPCI_TA: 'Mediano', ADOPCI_ST: 'EN PROCESO', visibleEnPortada: false },
  { ADOPCI_ID: 106, ADOPCI_FT: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80', ADOPCI_NO: 'Zeus',  ADOPCI_ES: 'Canino', ADOPCI_ED: '5 Años',  ADOPCI_TA: 'Grande',  ADOPCI_ST: 'DISPONIBLE', visibleEnPortada: false },
]

// Datos del backend de jornadas — se carga con fetch; estos son el fallback
const JORNADAS_MOCK = [
  { JORNAD_ID: 1, NOM_JORNA: 'Gran Jornada de Vacunación',  FEC_JORNA: '15 de Julio, 2026', LUG_JORNA: 'Plaza Bolívar, La Grita', DES_JORNA: 'Vacunación antirrábica y desparasitación gratuita para toda la comunidad. ¡Asiste con tu mascota!', visibleEnPortada: true  },
  { JORNAD_ID: 2, NOM_JORNA: 'Operativo de Esterilización', FEC_JORNA: '22 de Julio, 2026', LUG_JORNA: 'Sede Misión Nevado',      DES_JORNA: 'Esterilización a bajo costo para perros y gatos. Requiere cita previa asignada en la sede central.',  visibleEnPortada: true  },
]

const CONTACTO_INICIAL = {
  descripcion: 'Protegiendo la vida animal y gestionando rescates a través de nuestra plataforma SISCVI.',
  direccion:   'La Grita, Municipio Jáuregui, Edo. Táchira',
  telefono:    '0414-7599094',
  email:       'soporte@sisvic.org.ve',
  horario:     'Lunes a Sábado: 8:00 AM - 5:00 PM',
}

// ─── BARRA DE NAVEGADOR SIMULADA ──────────────────────────────────────────────
function BarraNavegador({ url }) {
  return (
    <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
      <div className="flex gap-1">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 mx-2 bg-white rounded px-2 py-0.5 text-[9px] text-gray-400 font-mono truncate">
        {url}
      </div>
    </div>
  )
}

// ─── HELPER TOKEN ─────────────────────────────────────────────────────────────
const obtenerToken = () => localStorage.getItem('sisvic_token') ?? ''

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function GestionWeb({ rolActivo = 'ADMINISTRADOR' }) {

  // ── UI ────────────────────────────────────────────────────────────────────────
  const [tabActiva,  setTabActiva]  = useState('hero')
  const [cargando,   setCargando]   = useState(false)
  const [mensaje,    setMensaje]    = useState(null)

  // ── Datos ─────────────────────────────────────────────────────────────────────
  const [hero,         setHero]         = useState(HERO_INICIAL)
  const [estadisticas, setEstadisticas] = useState(ESTADISTICAS_INICIALES)
  const [pacientes,    setPacientes]    = useState(PACIENTES_MOCK)
  const [jornadas,     setJornadas]     = useState(JORNADAS_MOCK)
  const [contacto,     setContacto]     = useState(CONTACTO_INICIAL)

  // ── Carga de datos desde el backend ──────────────────────────────────────────
  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const respuesta = await fetch('/api/adopciones', {
          headers: { 'Authorization': `Bearer ${obtenerToken()}` },
        })
        if (respuesta.ok) {
          const datos = await respuesta.json()
          setPacientes(
            (datos.registros ?? []).map(p => ({ ...p, visibleEnPortada: true }))
          )
        }
      } catch { /* usa los datos mock */ }
    }

    const cargarJornadas = async () => {
      try {
        const respuesta = await fetch('/api/jornadas', {
          headers: { 'Authorization': `Bearer ${obtenerToken()}` },
        })
        if (respuesta.ok) {
          const datos = await respuesta.json()
          setJornadas(
            (datos.jornadas ?? []).map(j => ({ ...j, visibleEnPortada: true }))
          )
        }
      } catch { /* usa los datos mock */ }
    }

    cargarPacientes()
    cargarJornadas()
  }, [])

  // ── Refs para uploads ─────────────────────────────────────────────────────────
  const refImagenHero    = useRef(null)
  const refImagenFrontal = useRef(null)

  // ── RBAC ──────────────────────────────────────────────────────────────────────
  if (rolActivo !== 'ADMINISTRADOR') {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Shield className="w-8 h-8 text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-800">Acceso Restringido</p>
          <p className="text-sm text-gray-500 mt-1.5">Solo el Administrador puede editar el contenido web.</p>
        </div>
      </div>
    )
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 4000)
  }

  const enviarPatch = async (ruta, cuerpo) => {
    setCargando(true)
    try {
      const respuesta = await fetch(ruta, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${obtenerToken()}` },
        body:    JSON.stringify(cuerpo),
      })
      return respuesta.ok
    } catch { return false }
    finally  { setCargando(false) }
  }

  // ── Hero ──────────────────────────────────────────────────────────────────────
  const cambiarHero = (campo, valor) => setHero(prev => ({ ...prev, [campo]: valor }))

  const manejarImagenHero = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    cambiarHero('imagen_local', URL.createObjectURL(archivo))
    e.target.value = ''
  }

  const manejarImagenFrontal = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    cambiarHero('imagen_frontal_local', URL.createObjectURL(archivo))
    e.target.value = ''
  }

  const guardarHero = async () => {
    const { imagen_local, imagen_frontal_local, ...heroParaEnviar } = hero
    const ok = await enviarPatch('/api/contenido-web/hero', { hero: heroParaEnviar })
    mostrarMensaje(ok ? 'exito' : 'error', ok ? 'Sección Hero publicada correctamente' : 'Error al guardar. Verifique la conexión.')
  }

  // ── Estadísticas ──────────────────────────────────────────────────────────────
  const cambiarStat  = (id, campo, valor) =>
    setEstadisticas(prev => prev.map(s => s.id === id ? { ...s, [campo]: valor } : s))

  const guardarStats = async () => {
    const ok = await enviarPatch('/api/contenido-web/estadisticas', { estadisticas })
    mostrarMensaje(ok ? 'exito' : 'error', ok ? 'Estadísticas actualizadas' : 'Error al guardar.')
  }

  // ── Adopciones — solo visibilidad ─────────────────────────────────────────────
  const togglePaciente = (id) =>
    setPacientes(prev => prev.map(p =>
      p.ADOPCI_ID === id ? { ...p, visibleEnPortada: !p.visibleEnPortada } : p
    ))

  const guardarVisibilidadPacientes = async () => {
    const visibles = pacientes.filter(p => p.visibleEnPortada).map(p => p.ADOPCI_ID)
    const ok = await enviarPatch('/api/contenido-web/adopciones-visibles', { visibles })
    mostrarMensaje(ok ? 'exito' : 'error', ok
      ? `${visibles.length} pacientes visibles en la cartelera web`
      : 'Error al guardar. Verifique la conexión.')
  }

  // ── Jornadas — solo visibilidad ───────────────────────────────────────────────
  const toggleJornada = (id) =>
    setJornadas(prev => prev.map(j =>
      j.JORNAD_ID === id ? { ...j, visibleEnPortada: !j.visibleEnPortada } : j
    ))

  const guardarVisibilidadJornadas = async () => {
    const visibles = jornadas.filter(j => j.visibleEnPortada).map(j => j.JORNAD_ID)
    const ok = await enviarPatch('/api/contenido-web/jornadas-visibles', { visibles })
    mostrarMensaje(ok ? 'exito' : 'error', ok
      ? `${visibles.length} jornadas visibles en el sitio web`
      : 'Error al guardar. Verifique la conexión.')
  }

  // ── Contacto ──────────────────────────────────────────────────────────────────
  const cambiarContacto = (campo, valor) => setContacto(prev => ({ ...prev, [campo]: valor }))

  const guardarContacto = async () => {
    const ok = await enviarPatch('/api/contenido-web/contacto', { contacto })
    mostrarMensaje(ok ? 'exito' : 'error', ok ? 'Información de contacto actualizada' : 'Error al guardar.')
  }

  // ── Derivados para previsualización ───────────────────────────────────────────
  const imagenHeroActiva      = hero.imagen_local    || hero.imagen_url
  const imagenFrontalActiva   = hero.imagen_frontal_local || hero.imagen_frontal_url
  const pacientesEnPortada    = pacientes.filter(p => p.visibleEnPortada)
  const jornadasEnPortada     = jornadas.filter(j => j.visibleEnPortada)
  const totalPacientesVisible = pacientesEnPortada.length
  const totalJornadasVisible  = jornadasEnPortada.length

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Gestión del Contenido Web</h2>
          <p className="text-xs text-gray-500 mt-0.5">Controla todo lo que ven los ciudadanos en el sitio público SISCVI</p>
        </div>
        <a href="https://misionnevado.org.ve" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#765A05]/20 bg-[#FFDF96]/20 text-xs font-bold text-[#765A05] hover:bg-[#FFDF96]/40 transition-all">
          <Globe className="w-3.5 h-3.5" /> Ver sitio público
        </a>
      </div>

      {/* Toast */}
      {mensaje && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
          ${mensaje.tipo === 'exito' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {mensaje.tipo === 'exito' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {mensaje.texto}
        </div>
      )}

      {/* Navegación de pestañas */}
      <div className="flex gap-1.5 flex-wrap bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60 w-fit">
        {PESTANAS.map(({ id, etiqueta, Icono }) => (
          <button key={id} onClick={() => setTabActiva(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
              ${tabActiva === id
                ? 'bg-[#765A05] text-white shadow-md shadow-[#765A05]/20'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/70'}`}>
            <Icono className="w-4 h-4" />
            {etiqueta}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: HERO                                                              */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Formulario hero */}
          <div className={eCard + ' p-6 space-y-4'}>
            <p className={eSec}><LayoutDashboard className="w-3.5 h-3.5" /> Sección Principal (Hero)</p>
            <p className="text-xs text-gray-400 -mt-1">Primera pantalla visible al abrir el sitio web.</p>

            {/* ── Imágenes del Hero (fondo + frontal) ── */}
            <div className="rounded-xl border border-[#765A05]/20 bg-[#FFDF96]/10 p-3.5 space-y-4">
              <p className="text-[10px] font-black text-[#765A05] uppercase tracking-widest">Imágenes del Hero</p>

              {/* Imagen de fondo */}
              <div className="space-y-1.5">
                <label className={eLabel}>URL Imagen de Fondo</label>
                <div className="flex gap-2">
                  <input className={eInput} value={hero.imagen_url}
                    placeholder="https://..."
                    onChange={e => cambiarHero('imagen_url', e.target.value)} />
                  <button onClick={() => refImagenHero.current?.click()} title="Subir archivo"
                    className="shrink-0 flex items-center px-3 py-2.5 rounded-xl border border-[#765A05]/30 text-[#765A05] hover:bg-[#FFDF96]/30 transition-all">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                <input ref={refImagenHero} type="file" accept="image/*"
                  className="hidden" onChange={manejarImagenHero} />
                {imagenHeroActiva && (
                  <img src={imagenHeroActiva} alt="Fondo del hero"
                    className="w-full h-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                )}
                {hero.imagen_local && (
                  <p className="text-[10px] text-emerald-600 font-medium">Archivo local cargado</p>
                )}
              </div>

              {/* Imagen frontal (tarjeta) */}
              <div className="space-y-1.5 pt-2 border-t border-[#765A05]/10">
                <label className={eLabel}>URL Imagen Frontal (Tarjeta)</label>
                <div className="flex gap-2">
                  <input className={eInput} value={hero.imagen_frontal_url}
                    placeholder="https://..."
                    onChange={e => cambiarHero('imagen_frontal_url', e.target.value)} />
                  <button onClick={() => refImagenFrontal.current?.click()} title="Subir archivo"
                    className="shrink-0 flex items-center px-3 py-2.5 rounded-xl border border-[#765A05]/30 text-[#765A05] hover:bg-[#FFDF96]/30 transition-all">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                <input ref={refImagenFrontal} type="file" accept="image/*"
                  className="hidden" onChange={manejarImagenFrontal} />
                {imagenFrontalActiva && (
                  <img src={imagenFrontalActiva} alt="Imagen frontal hero"
                    className="w-full h-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                )}
                {hero.imagen_frontal_local && (
                  <p className="text-[10px] text-emerald-600 font-medium">Archivo local cargado</p>
                )}
              </div>
            </div>

            {/* ── Badge ── */}
            <div>
              <label className={eLabel}>Chip / Badge superior</label>
              <input className={eInput} value={hero.badge}
                onChange={e => cambiarHero('badge', e.target.value)} />
            </div>

            {/* ── Título (3 partes) ── */}
            <div className="rounded-xl border border-[#FFDF96]/50 bg-[#FFDF96]/10 p-3.5 space-y-3">
              <p className="text-[10px] font-black text-[#765A05] uppercase tracking-widest">Título principal — 3 partes</p>
              <div>
                <label className={eLabel}>Texto inicial</label>
                <input className={eInput} value={hero.titulo_inicio}
                  onChange={e => cambiarHero('titulo_inicio', e.target.value)} />
              </div>
              <div>
                <label className={eLabel}>Texto en color dorado (acento)</label>
                <input className={eInput} value={hero.titulo_acento}
                  onChange={e => cambiarHero('titulo_acento', e.target.value)} />
              </div>
              <div>
                <label className={eLabel}>Texto final</label>
                <input className={eInput} value={hero.titulo_fin}
                  onChange={e => cambiarHero('titulo_fin', e.target.value)} />
              </div>
            </div>

            {/* ── Párrafo ── */}
            <div>
              <label className={eLabel}>Párrafo descriptivo</label>
              <textarea rows={3} className={eInput + ' resize-none leading-relaxed'}
                value={hero.descripcion}
                onChange={e => cambiarHero('descripcion', e.target.value)} />
            </div>

            {/* ── Nota: botones son estructurales ── */}
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-snug">
                Los botones <strong>«Quiero Adoptar»</strong> y <strong>«Reportar Denuncia»</strong> son estructurales del sistema y no pueden modificarse desde aquí.
              </p>
            </div>

            <button onClick={guardarHero} disabled={cargando} className={eBoton + ' w-full'}>
              <Save className="w-4 h-4" />
              {cargando ? 'Publicando…' : 'Publicar Sección Hero'}
            </button>
          </div>

          {/* Previsualización Hero — reacciona en tiempo real */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-3.5 h-3.5 text-[#765A05]/50" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vista Previa — Hero en Tiempo Real</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <BarraNavegador url="misionnevado.org.ve/#inicio" />
              <div
                className="relative min-h-[240px] flex items-center p-5"
                style={{
                  backgroundImage:    imagenHeroActiva ? `url(${imagenHeroActiva})` : undefined,
                  backgroundSize:     'cover',
                  backgroundPosition: 'center',
                  backgroundColor:    imagenHeroActiva ? undefined : '#2D6A4F',
                }}
              >
                <div className="absolute inset-0 bg-[#2D6A4F]/82" />
                {/* Dos columnas: texto izquierda, imagen frontal derecha */}
                <div className="relative z-10 w-full grid grid-cols-2 gap-4 items-center">
                  {/* Columna izquierda — contenido textual */}
                  <div className="text-white space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/30 bg-white/10 text-[#D4AC4E] text-[9px] font-bold">
                      <span className="w-1 h-1 rounded-full bg-[#D4AC4E] animate-pulse" />
                      {hero.badge || '—'}
                    </div>
                    <h1 className="text-[13px] font-extrabold leading-snug drop-shadow-md">
                      {hero.titulo_inicio}
                      <span className="text-[#D4AC4E]">{hero.titulo_acento}</span>
                      {hero.titulo_fin}
                    </h1>
                    <p className="text-[9px] text-white/80 leading-relaxed line-clamp-3">
                      {hero.descripcion}
                    </p>
                    <div className="flex gap-1.5 flex-wrap pt-0.5">
                      <span className="bg-[#D4AC4E] text-[#212529] px-3 py-1 rounded-full text-[8px] font-bold shadow-sm">
                        🐾 Quiero Adoptar
                      </span>
                      <span className="border-2 border-[#E76F51] text-white px-3 py-1 rounded-full text-[8px] font-bold">
                        ⚠ Reportar Denuncia
                      </span>
                    </div>
                  </div>
                  {/* Columna derecha — imagen frontal (tarjeta) */}
                  <div className="flex justify-center">
                    {imagenFrontalActiva ? (
                      <img
                        src={imagenFrontalActiva}
                        alt="Imagen frontal hero"
                        className="w-28 h-28 object-cover rounded-2xl border-4 border-white/25 shadow-2xl"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl border-4 border-dashed border-white/25 bg-white/10 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white/30" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: ESTADÍSTICAS                                                      */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'estadisticas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className={eCard + ' p-6 space-y-5'}>
            <p className={eSec}><TrendingUp className="w-3.5 h-3.5" /> Barra de Impacto Institucional</p>
            <p className="text-xs text-gray-400 -mt-2">Franja dorada debajo del Hero con 3 logros institucionales.</p>

            {estadisticas.map((stat, idx) => (
              <div key={stat.id} className="border border-gray-100 rounded-xl p-4 bg-white/60">
                <p className="text-[10px] font-black text-[#765A05] uppercase tracking-widest mb-3">Bloque {idx + 1}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={eLabel}>Valor / Número</label>
                    <input className={eInput} value={stat.valor}
                      onChange={e => cambiarStat(stat.id, 'valor', e.target.value)} />
                  </div>
                  <div>
                    <label className={eLabel}>Etiqueta descriptiva</label>
                    <input className={eInput} value={stat.etiqueta}
                      onChange={e => cambiarStat(stat.id, 'etiqueta', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={guardarStats} disabled={cargando} className={eBoton + ' w-full'}>
              <Save className="w-4 h-4" />
              {cargando ? 'Publicando…' : 'Publicar Estadísticas'}
            </button>
          </div>

          {/* Previsualización Estadísticas */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-3.5 h-3.5 text-[#765A05]/50" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vista Previa — Barra de Impacto</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <BarraNavegador url="misionnevado.org.ve" />
              <div className="h-10 bg-[#2D6A4F] flex items-center justify-center">
                <p className="text-white/30 text-[9px]">— hero —</p>
              </div>
              <div className="bg-[#D4AC4E] py-5 border-b-4 border-[#2D6A4F]">
                <div className="grid grid-cols-3 divide-x divide-[#212529]/10">
                  {estadisticas.map(stat => (
                    <div key={stat.id} className="text-center px-3 py-1">
                      <h3 className="text-xl font-black text-[#212529]">{stat.valor || '—'}</h3>
                      <p className="text-[9px] text-[#2D6A4F] font-bold uppercase tracking-wider mt-0.5">{stat.etiqueta}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-8 bg-[#FFEFD1] flex items-center justify-center">
                <p className="text-gray-300 text-[9px]">— adopciones —</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: ADOPCIONES — selección de visibilidad                             */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'adopciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Panel de selección */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center justify-between mb-1.5">
              <p className={eSec}><Heart className="w-3.5 h-3.5" /> Pacientes del Sistema</p>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                ${totalPacientesVisible > 0 ? 'bg-[#FFDF96]/40 text-[#765A05]' : 'bg-gray-100 text-gray-400'}`}>
                {totalPacientesVisible} visibles en web
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Datos cargados desde el backend. Activa o desactiva cada paciente para controlar quién aparece en la cartelera pública.
            </p>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-0.5">
              {pacientes.map(paciente => (
                <div key={paciente.ADOPCI_ID}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                    ${paciente.visibleEnPortada
                      ? 'bg-[#FFDF96]/15 border-[#765A05]/20 shadow-sm'
                      : 'bg-white/40 border-gray-100'}`}
                >
                  {/* Foto */}
                  {paciente.ADOPCI_FT
                    ? <img src={paciente.ADOPCI_FT} alt={paciente.ADOPCI_NO}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0" />
                    : <div className="w-11 h-11 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4 text-gray-300" />
                      </div>
                  }

                  {/* Info (solo lectura) */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-none truncate">{paciente.ADOPCI_NO}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {paciente.ADOPCI_ES} · {paciente.ADOPCI_TA} · {paciente.ADOPCI_ED}
                    </p>
                    <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full
                      ${paciente.ADOPCI_ST === 'DISPONIBLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {paciente.ADOPCI_ST}
                    </span>
                  </div>

                  {/* Toggle de visibilidad */}
                  <button
                    onClick={() => togglePaciente(paciente.ADOPCI_ID)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all
                      ${paciente.visibleEnPortada
                        ? 'bg-[#765A05] text-white border-[#765A05] shadow-sm'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                  >
                    {paciente.visibleEnPortada
                      ? <><Eye    className="w-3 h-3" /> Visible</>
                      : <><EyeOff className="w-3 h-3" /> Oculto</>
                    }
                  </button>
                </div>
              ))}
            </div>

            <button onClick={guardarVisibilidadPacientes} disabled={cargando} className={eBoton + ' w-full mt-4'}>
              <Save className="w-4 h-4" />
              {cargando ? 'Guardando…' : `Publicar Selección (${totalPacientesVisible} en portada)`}
            </button>
          </div>

          {/* Previsualización Adopciones */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-3.5 h-3.5 text-[#765A05]/50" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vista Previa — Cartelera Pública</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <BarraNavegador url="misionnevado.org.ve/#adopciones" />
              <div className="bg-[#FFEFD1] p-4">
                <p className="text-[9px] font-black text-[#2D6A4F] uppercase tracking-widest text-center mb-3">
                  Cartelera de Adopción
                </p>

                {pacientesEnPortada.length > 0 ? (
                  <div className="overflow-y-auto max-h-[360px] pr-0.5">
                    <div className="grid grid-cols-3 gap-2">
                      {pacientesEnPortada.map(paciente => (
                        <div key={paciente.ADOPCI_ID}
                          className="bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm">
                          {paciente.ADOPCI_FT
                            ? <img src={paciente.ADOPCI_FT} alt={paciente.ADOPCI_NO}
                                className="w-full h-16 object-cover" />
                            : <div className="h-16 bg-gray-100 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-gray-300" />
                              </div>
                          }
                          <div className="p-2">
                            <p className="text-[9px] font-black text-gray-900 leading-tight">{paciente.ADOPCI_NO}</p>
                            <p className="text-[8px] text-gray-400">{paciente.ADOPCI_ES} · {paciente.ADOPCI_TA}</p>
                            <div className="mt-1.5 bg-[#D4AC4E] text-center py-0.5 rounded text-[7px] font-bold text-[#212529]">
                              Quiero Adoptarlo
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Heart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-400">Ningún paciente activo para mostrar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: JORNADAS — selección de visibilidad                               */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'jornadas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Panel de selección */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center justify-between mb-1.5">
              <p className={eSec}><Calendar className="w-3.5 h-3.5" /> Jornadas del Sistema</p>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                ${totalJornadasVisible > 0 ? 'bg-[#FFDF96]/40 text-[#765A05]' : 'bg-gray-100 text-gray-400'}`}>
                {totalJornadasVisible} visibles en web
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Datos cargados desde el backend. Activa o desactiva cada jornada para controlar cuáles aparecen en el calendario público.
            </p>

            <div className="space-y-3">
              {jornadas.length === 0 && (
                <div className="py-10 text-center">
                  <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Sin jornadas registradas en el sistema.</p>
                </div>
              )}

              {jornadas.map(jornada => (
                <div key={jornada.JORNAD_ID}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all
                    ${jornada.visibleEnPortada
                      ? 'bg-[#FFDF96]/15 border-[#765A05]/20 shadow-sm'
                      : 'bg-white/40 border-gray-100'}`}
                >
                  {/* Ícono */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all
                    ${jornada.visibleEnPortada ? 'bg-[#D4AC4E] shadow-sm' : 'bg-gray-100'}`}>
                    <Calendar className={`w-5 h-5 ${jornada.visibleEnPortada ? 'text-[#212529]' : 'text-gray-400'}`} />
                  </div>

                  {/* Info (solo lectura) */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{jornada.NOM_JORNA}</p>
                    <p className="text-[10px] text-[#2D6A4F] font-semibold mt-0.5">{jornada.FEC_JORNA}</p>
                    <p className="text-[10px] text-gray-400">{jornada.LUG_JORNA}</p>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-snug">{jornada.DES_JORNA}</p>
                  </div>

                  {/* Toggle de visibilidad */}
                  <button
                    onClick={() => toggleJornada(jornada.JORNAD_ID)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all self-start mt-0.5
                      ${jornada.visibleEnPortada
                        ? 'bg-[#765A05] text-white border-[#765A05] shadow-sm'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                  >
                    {jornada.visibleEnPortada
                      ? <><Eye    className="w-3 h-3" /> Visible</>
                      : <><EyeOff className="w-3 h-3" /> Oculta</>
                    }
                  </button>
                </div>
              ))}
            </div>

            <button onClick={guardarVisibilidadJornadas} disabled={cargando} className={eBoton + ' w-full mt-4'}>
              <Save className="w-4 h-4" />
              {cargando ? 'Guardando…' : `Publicar Selección (${totalJornadasVisible} en portada)`}
            </button>
          </div>

          {/* Previsualización Jornadas */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-3.5 h-3.5 text-[#765A05]/50" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vista Previa — Jornadas Públicas</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <BarraNavegador url="misionnevado.org.ve/#jornadas" />
              <div className="bg-white p-4">
                <p className="text-[9px] font-black text-[#2D6A4F] uppercase tracking-widest text-center mb-3">
                  Jornadas Programadas
                </p>

                {jornadasEnPortada.length > 0 ? (
                  <div className="space-y-2">
                    {jornadasEnPortada.map(jornada => (
                      <div key={jornada.JORNAD_ID}
                        className="bg-[#FFDAD2] rounded-xl p-3 border border-[#2D6A4F]/8 flex gap-3 items-start">
                        <div className="w-9 h-9 bg-[#D4AC4E] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <Calendar className="w-4 h-4 text-[#212529]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-900 leading-tight">{jornada.NOM_JORNA}</p>
                          <p className="text-[9px] text-[#2D6A4F] font-semibold mt-0.5">{jornada.FEC_JORNA}</p>
                          <p className="text-[9px] text-gray-500">{jornada.LUG_JORNA}</p>
                          <p className="text-[8px] text-gray-400 mt-1 line-clamp-2">{jornada.DES_JORNA}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-1" />
                    <p className="text-[9px] text-gray-400">Sin jornadas activas para mostrar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: CONTACTO                                                          */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'contacto' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className={eCard + ' p-6 space-y-5'}>
            <p className={eSec}><MapPin className="w-3.5 h-3.5" /> Información de Contacto y Footer</p>
            <p className="text-xs text-gray-400 -mt-2">Datos visibles en la sección final del sitio para todos los ciudadanos.</p>

            <div>
              <label className={eLabel}>Descripción de la fundación</label>
              <textarea rows={2} className={eInput + ' resize-none'} value={contacto.descripcion}
                onChange={e => cambiarContacto('descripcion', e.target.value)} />
            </div>
            <div>
              <label className={eLabel}>Dirección de Sede Central</label>
              <input className={eInput} value={contacto.direccion}
                onChange={e => cambiarContacto('direccion', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={eLabel}>Teléfono de contacto</label>
                <input className={eInput} value={contacto.telefono}
                  onChange={e => cambiarContacto('telefono', e.target.value)} />
              </div>
              <div>
                <label className={eLabel}>Correo electrónico</label>
                <input type="email" className={eInput} value={contacto.email}
                  onChange={e => cambiarContacto('email', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={eLabel}>Horario de atención en sede</label>
              <input className={eInput} value={contacto.horario}
                onChange={e => cambiarContacto('horario', e.target.value)} />
            </div>

            <button onClick={guardarContacto} disabled={cargando} className={eBoton + ' w-full'}>
              <Save className="w-4 h-4" />
              {cargando ? 'Guardando…' : 'Publicar Información de Contacto'}
            </button>
          </div>

          {/* Previsualización Footer */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-3.5 h-3.5 text-[#765A05]/50" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vista Previa — Footer del Sitio</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <BarraNavegador url="misionnevado.org.ve/#contacto" />
              <div className="bg-white/30 backdrop-blur-sm p-4">
                <div className="grid grid-cols-2 gap-5 mb-4">
                  <div className="space-y-2">
                    <div className="h-8 w-20 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center">
                      <p className="text-[8px] text-[#2D6A4F]/40 font-bold">LOGO</p>
                    </div>
                    <p className="text-[9px] text-gray-500 leading-snug">{contacto.descripcion}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#2D6A4F] mb-2">Sede y Contacto</p>
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-gray-600 flex items-start gap-1">
                        <span className="shrink-0">📍</span><span>{contacto.direccion}</span>
                      </p>
                      <p className="text-[9px] text-gray-600 flex items-center gap-1">
                        <span>📞</span>{contacto.telefono}
                      </p>
                      <p className="text-[9px] text-gray-600 flex items-center gap-1">
                        <span>✉️</span>{contacto.email}
                      </p>
                      <p className="text-[9px] text-gray-500 flex items-center gap-1 mt-1">
                        <span>🕐</span>{contacto.horario}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2.5 mb-2">
                  <div className="flex gap-3 justify-center flex-wrap">
                    {['Inicio', 'Adopciones', 'Seguimiento', 'Denuncias'].map(enlace => (
                      <span key={enlace} className="text-[8px] text-[#2D6A4F] font-medium cursor-pointer hover:underline">
                        {enlace}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-center border-t border-gray-100 pt-2">
                  <p className="text-[8px] text-gray-400">© 2026 Plataforma Pública SISCVI. Todos los derechos reservados.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
