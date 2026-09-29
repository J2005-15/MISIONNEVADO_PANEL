import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard, TrendingUp, Heart, Calendar, MapPin,
  Save, Check, AlertCircle, Monitor, Shield, Globe,
  Upload, Eye, EyeOff,
} from 'lucide-react'
import api from '../lib/api'

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

// ─── TÍTULO DEL HERO: un solo texto + palabra(s) resaltada(s) ────────────────
// Se guarda como titulo_inicio / titulo_acento / titulo_fin (lo que lee la web).
const palabras = (t) => (t ?? '').trim().split(/\s+/).filter(Boolean)

// Rango [desde, hasta] de palabras resaltadas según las tres partes guardadas
const rangoDesdePartes = (h) => {
  const desde = palabras(h.titulo_inicio).length
  const cant  = palabras(h.titulo_acento).length
  return cant ? [desde, desde + cant - 1] : null
}

const partesDesdeTitulo = (lista, rango) => rango
  ? {
      titulo_inicio: lista.slice(0, rango[0]).join(' '),
      titulo_acento: lista.slice(rango[0], rango[1] + 1).join(' '),
      titulo_fin:    lista.slice(rango[1] + 1).join(' '),
    }
  : { titulo_inicio: lista.join(' '), titulo_acento: '', titulo_fin: '' }

// Partes con los espacios correctos para mostrar (evita "vidaanimalen")
const partesParaMostrar =({ titulo_inicio = '', titulo_acento = '', titulo_fin = '' }) => {
  const ini = titulo_inicio.trim(), acc = titulo_acento.trim(), fin = titulo_fin.trim()
  return {
    antes:   ini && (acc || fin) ? `${ini} ` : ini,
    acento:  acc,
    despues: fin && (ini || acc) && !/^[.,;:!?)]/.test(fin) ? ` ${fin}` : fin,
  }
}

// ─── NORMALIZADORES (respuesta de la BD → forma que usa esta vista) ──────────
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const formatearFecha = (valor) => {
  if (!valor) return ''
  const [a, m, d] = valor.toString().slice(0, 10).split('-')
  return `${parseInt(d)} de ${MESES[parseInt(m) - 1]}, ${a}`
}

const normalizarPaciente = (p) => ({
  ADOPCI_ID: p.adopci_id,
  ADOPCI_FT: p.adopci_ft,
  ADOPCI_NO: p.adopci_no,
  ADOPCI_ES: p.adopci_es ?? '',
  ADOPCI_ED: p.adopci_ed ?? '',
  ADOPCI_TA: p.adopci_ta ?? '',
  ADOPCI_ST: p.adopci_st,
  visibleEnPortada: Boolean(p.adopci_vw),
})

const normalizarJornada = (j) => ({
  JORNAD_ID: j.jornad_id,
  NOM_JORNA: j.jornad_no,
  FEC_JORNA: formatearFecha(j.jornad_fe),
  LUG_JORNA: j.jornad_lu || j.sector_no || '',
  DES_JORNA: j.jornad_de ?? '',
  visibleEnPortada: Boolean(j.jornad_vw),
})

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function GestionWeb({ rolActivo = 'ADMINISTRADOR' }) {

  // ── UI ────────────────────────────────────────────────────────────────────────
  const [tabActiva,  setTabActiva]  = useState('hero')
  const [cargando,   setCargando]   = useState(false)
  const [mensaje,    setMensaje]    = useState(null)

  // ── Datos ─────────────────────────────────────────────────────────────────────
  const [hero,         setHero]         = useState(HERO_INICIAL)
  const [estadisticas, setEstadisticas] = useState(ESTADISTICAS_INICIALES)
  const [pacientes,    setPacientes]    = useState([])
  const [jornadas,     setJornadas]     = useState([])
  const [contacto,     setContacto]     = useState(CONTACTO_INICIAL)
  const [tituloTexto,  setTituloTexto]  = useState(null)   // título tal como se escribe (con espacios)

  // ── Carga de datos desde el backend ──────────────────────────────────────────
  useEffect(() => {
    // Contenido publicado actualmente en la web (TM_CONFIG)
    const cargarContenido = async () => {
      try {
        const { data } = await api.get('/contenido-web')
        if (data.hero) setHero(prev => ({ ...prev, ...data.hero }))
        if (data.estadisticas?.length) setEstadisticas(data.estadisticas)
        if (data.contacto) setContacto(prev => ({ ...prev, ...data.contacto }))
      } catch { /* usa los valores iniciales */ }
    }

    const cargarPacientes = async () => {
      try {
        const { data } = await api.get('/adopciones')
        setPacientes((data.registros ?? []).map(normalizarPaciente))
      } catch { /* usa los datos mock */ }
    }

    const cargarJornadas = async () => {
      try {
        const { data } = await api.get('/jornadas')
        setJornadas((data.registros ?? []).map(normalizarJornada))
      } catch { /* usa los datos mock */ }
    }

    cargarContenido()
    cargarPacientes()
    cargarJornadas()
  }, [])

  // ── Refs para uploads ─────────────────────────────────────────────────────────
  const refImagenHero    = useRef(null)
  const refImagenFrontal = useRef(null)
  // Archivos elegidos y aún no subidos; se suben a Cloudinary al publicar el Hero
  const archivosHero     = useRef({ fondo: null, frontal: null })

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

  // `ruta` llega como '/api/contenido-web/...'; el cliente api ya incluye '/api'
  const enviarPatch = async (ruta, cuerpo) => {
    setCargando(true)
    try {
      await api.patch(ruta.replace(/^\/api/, ''), cuerpo)
      return true
    } catch { return false }
    finally  { setCargando(false) }
  }

  // ── Hero ──────────────────────────────────────────────────────────────────────
  const cambiarHero = (campo, valor) => setHero(prev => ({ ...prev, [campo]: valor }))

  // Título en un solo campo; tituloTexto guarda lo que se escribe (con sus espacios)
  const textoTitulo    = tituloTexto ?? [hero.titulo_inicio, hero.titulo_acento, hero.titulo_fin].map(t => (t ?? '').trim()).filter(Boolean).join(' ')
  const listaPalabras  = palabras(textoTitulo)
  const rangoResaltado = rangoDesdePartes(hero)

  const cambiarTitulo = (texto) => {
    setTituloTexto(texto)
    const lista = palabras(texto)
    let rango = rangoResaltado
    if (rango && rango[1] >= lista.length) rango = rango[0] < lista.length ? [rango[0], lista.length - 1] : null
    setHero(prev => ({ ...prev, ...partesDesdeTitulo(lista, rango) }))
  }

  // Clic en una palabra: la resalta; clic en la vecina amplía; clic en la única resaltada la quita
  const elegirPalabra = (i) => {
    const r = rangoResaltado
    let nuevo
    if (!r)                            nuevo = [i, i]
    else if (r[0] === i && r[1] === i) nuevo = null
    else if (i === r[0] - 1)           nuevo = [i, r[1]]
    else if (i === r[1] + 1)           nuevo = [r[0], i]
    else                               nuevo = [i, i]
    setHero(prev => ({ ...prev, ...partesDesdeTitulo(listaPalabras, nuevo) }))
  }

  const tituloVista = partesParaMostrar(hero)

  const manejarImagenHero = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    archivosHero.current.fondo = archivo
    cambiarHero('imagen_local', URL.createObjectURL(archivo))
    e.target.value = ''
  }

  const manejarImagenFrontal = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    archivosHero.current.frontal = archivo
    cambiarHero('imagen_frontal_local', URL.createObjectURL(archivo))
    e.target.value = ''
  }

  const subirImagenHero = async (archivo) => {
    const datos = new FormData()
    datos.append('imagen', archivo, archivo.name)
    return (await api.post('/contenido-web/imagen', datos)).data.url
  }

  // Primero sube a Cloudinary las imágenes nuevas (si las hay) y luego publica el Hero
  const guardarHero = async () => {
    const { imagen_local, imagen_frontal_local, ...heroParaEnviar } = hero
    setCargando(true)
    try {
      if (archivosHero.current.fondo)   heroParaEnviar.imagen_url         = await subirImagenHero(archivosHero.current.fondo)
      if (archivosHero.current.frontal) heroParaEnviar.imagen_frontal_url = await subirImagenHero(archivosHero.current.frontal)
    } catch (err) {
      setCargando(false)
      mostrarMensaje('error', err.response?.data?.mensaje ?? 'No se pudo subir la imagen.')
      return
    }
    const ok = await enviarPatch('/api/contenido-web/hero', { hero: heroParaEnviar })
    if (ok) {
      archivosHero.current = { fondo: null, frontal: null }
      setHero(prev => ({
        ...prev,
        imagen_url:           heroParaEnviar.imagen_url,
        imagen_frontal_url:   heroParaEnviar.imagen_frontal_url,
        imagen_local:         null,
        imagen_frontal_local: null,
      }))
    }
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

            {/* ── Título principal (un solo campo + palabra resaltada) ── */}
            <div className="rounded-xl border border-[#FFDF96]/50 bg-[#FFDF96]/10 p-3.5 space-y-3">
              <p className="text-[10px] font-black text-[#765A05] uppercase tracking-widest">Título principal</p>
              <div>
                <label className={eLabel}>Texto del título</label>
                <input className={eInput} value={textoTitulo}
                  onChange={e => cambiarTitulo(e.target.value)} />
              </div>
              <div>
                <label className={eLabel}>Palabra en color dorado — haga clic para elegirla</label>
                <div className="flex flex-wrap gap-1.5">
                  {listaPalabras.map((palabra, i) => {
                    const activa = rangoResaltado && i >= rangoResaltado[0] && i <= rangoResaltado[1]
                    return (
                      <button type="button" key={`${palabra}-${i}`} onClick={() => elegirPalabra(i)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          activa
                            ? 'bg-[#D4AC4E] text-[#212529] border-[#D4AC4E]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AC4E]/60'
                        }`}>
                        {palabra}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">
                  Clic en la palabra de al lado para resaltar varias seguidas; clic otra vez para quitarla.
                </p>
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
                      {tituloVista.antes}
                      <span className="text-[#D4AC4E]">{tituloVista.acento}</span>
                      {tituloVista.despues}
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
