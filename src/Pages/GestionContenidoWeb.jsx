import { useState, useRef } from 'react'
import {
  Image, FileText, PawPrint, Upload, Save, Star,
  Monitor, ChevronUp, ChevronDown, Check, AlertCircle,
  Globe, ChevronLeft, ChevronRight, Shield,
} from 'lucide-react'

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const eCard  = 'bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl'
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'
const eSec   = 'text-xs font-bold text-[#765A05] uppercase tracking-widest mb-3 flex items-center gap-2'

// ─── PESTAÑAS ─────────────────────────────────────────────────────────────────
const PESTANAS = [
  { id: 'banners',   etiqueta: 'Banners Principales',  Icono: Image    },
  { id: 'textos',    etiqueta: 'Textos Públicos',       Icono: FileText },
  { id: 'pacientes', etiqueta: 'Pacientes Destacados',  Icono: PawPrint },
]

// ─── DATOS INICIALES ──────────────────────────────────────────────────────────
const BANNERS_INICIALES = [
  { id: 'BAN-1', titulo: 'Adopta y Cambia una Vida',        subtitulo: 'Miles de animales esperan un hogar',   orden: 1, imagen: null, activo: true  },
  { id: 'BAN-2', titulo: 'Jornadas de Vacunación Gratuita', subtitulo: 'Próximas fechas en tu sector',         orden: 2, imagen: null, activo: true  },
  { id: 'BAN-3', titulo: 'Únete como Voluntario',           subtitulo: 'Tu tiempo marca la diferencia',        orden: 3, imagen: null, activo: false },
]

const TEXTOS_INICIALES = {
  titulo_bienvenida:    'Fundación Misión Nevado',
  subtitulo_bienvenida: 'Protegiendo y rescatando animales en Venezuela',
  texto_mision:         'Promover el bienestar animal mediante la educación, el rescate y la adopción responsable de animales en situación de vulnerabilidad.',
  texto_vision:         'Ser la organización líder en protección animal en Venezuela, construyendo una sociedad más compasiva.',
  comunicado:           '',
}

const CATALOGO_INICIAL = [
  { id: 'CEN-001', nombre: 'Max',   especie: 'Canino', raza: 'Mestizo',   destacado: true  },
  { id: 'CEN-002', nombre: 'Luna',  especie: 'Felino', raza: 'Doméstico', destacado: false },
  { id: 'CEN-003', nombre: 'Rocky', especie: 'Canino', raza: 'Labrador',  destacado: true  },
  { id: 'CEN-004', nombre: 'Mia',   especie: 'Felino', raza: 'Persa',     destacado: false },
  { id: 'CEN-005', nombre: 'Thor',  especie: 'Canino', raza: 'Golden',    destacado: false },
  { id: 'CEN-006', nombre: 'Nala',  especie: 'Felino', raza: 'Siamés',    destacado: true  },
]

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

// ─── HELPER: TOKEN ────────────────────────────────────────────────────────────
const obtenerToken = () => localStorage.getItem('sisvic_token') ?? ''

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function GestionContenidoWeb({ rolActivo = 'ADMINISTRADOR' }) {

  // ── Estado de UI ─────────────────────────────────────────────────────────────
  const [tabActiva,    setTabActiva]    = useState('banners')
  const [cargando,     setCargando]     = useState(false)
  const [mensaje,      setMensaje]      = useState(null)
  const [bannerPrevia, setBannerPrevia] = useState(0)

  // ── Estado de datos ───────────────────────────────────────────────────────────
  const [banners,  setBanners]  = useState(BANNERS_INICIALES)
  const [textos,   setTextos]   = useState(TEXTOS_INICIALES)
  const [catalogo, setCatalogo] = useState(CATALOGO_INICIAL)

  const refArchivo        = useRef(null)
  const refBannerObjetivo = useRef(null)

  // ── RBAC ──────────────────────────────────────────────────────────────────────
  if (rolActivo !== 'ADMINISTRADOR') {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Shield className="w-8 h-8 text-gray-300" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-base font-bold text-gray-800">Acceso Restringido</p>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            Este módulo es exclusivo del Administrador del sistema.
          </p>
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
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${obtenerToken()}`,
        },
        body: JSON.stringify(cuerpo),
      })
      return respuesta.ok
    } catch {
      return false
    } finally {
      setCargando(false)
    }
  }

  // ── Handlers: Banners ─────────────────────────────────────────────────────────
  const abrirSelectorImagen = (idBanner) => {
    refBannerObjetivo.current = idBanner
    refArchivo.current.click()
  }

  const manejarImagen = (e) => {
    const archivo = e.target.files[0]
    if (!archivo || !refBannerObjetivo.current) return
    const urlPrevia = URL.createObjectURL(archivo)
    setBanners(prev => prev.map(b =>
      b.id === refBannerObjetivo.current ? { ...b, imagen: urlPrevia } : b
    ))
    e.target.value = ''
  }

  const cambiarOrden = (idBanner, dir) => {
    setBanners(prev => {
      const copia = [...prev]
      const idx   = copia.findIndex(b => b.id === idBanner)
      const dest  = idx + (dir === 'arriba' ? -1 : 1)
      if (dest < 0 || dest >= copia.length) return copia
      ;[copia[idx], copia[dest]] = [copia[dest], copia[idx]]
      return copia.map((b, i) => ({ ...b, orden: i + 1 }))
    })
  }

  const toggleActivoBanner = (idBanner) =>
    setBanners(prev => prev.map(b =>
      b.id === idBanner ? { ...b, activo: !b.activo } : b
    ))

  const editarBanner = (idBanner, campo, valor) =>
    setBanners(prev => prev.map(b =>
      b.id === idBanner ? { ...b, [campo]: valor } : b
    ))

  const guardarBanners = async () => {
    const ok = await enviarPatch('/api/contenido-web/banners', {
      banners: banners.map(({ imagen, ...resto }) => resto),
    })
    mostrarMensaje(ok ? 'exito' : 'error', ok
      ? 'Banners actualizados y publicados correctamente'
      : 'Error al guardar. Verifique la conexión con el servidor.')
  }

  // ── Handlers: Textos ──────────────────────────────────────────────────────────
  const cambiarTexto = (campo, valor) =>
    setTextos(prev => ({ ...prev, [campo]: valor }))

  const guardarTextos = async () => {
    const ok = await enviarPatch('/api/contenido-web/textos', { textos })
    mostrarMensaje(ok ? 'exito' : 'error', ok
      ? 'Textos publicados correctamente en la web'
      : 'Error al guardar. Verifique la conexión con el servidor.')
  }

  // ── Handlers: Pacientes ───────────────────────────────────────────────────────
  const toggleDestacado = (idAnimal) =>
    setCatalogo(prev => prev.map(a =>
      a.id === idAnimal ? { ...a, destacado: !a.destacado } : a
    ))

  const guardarDestacados = async () => {
    const destacados = catalogo.filter(a => a.destacado).map(a => a.id)
    const ok = await enviarPatch('/api/contenido-web/destacados', { destacados })
    mostrarMensaje(ok ? 'exito' : 'error', ok
      ? 'Selección de pacientes destacados actualizada en portada'
      : 'Error al guardar. Verifique la conexión con el servidor.')
  }

  // ── Derivados para previsualización ───────────────────────────────────────────
  const bannersActivos   = banners.filter(b => b.activo)
  const totalActivos     = bannersActivos.length
  const idxSeguro        = totalActivos > 0 ? bannerPrevia % totalActivos : 0
  const bannerEnPrevia   = bannersActivos[idxSeguro]
  const pacientesDestacados = catalogo.filter(a => a.destacado)

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl">

      {/* ── Encabezado ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Gestión de Contenido Web</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Controla todo lo que ven los ciudadanos en la página pública
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#765A05]/20 bg-[#FFDF96]/20 text-xs font-bold text-[#765A05] hover:bg-[#FFDF96]/40 transition-all"
        >
          <Globe className="w-3.5 h-3.5" /> Ver sitio público
        </a>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────────── */}
      {mensaje && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all
          ${mensaje.tipo === 'exito'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'}`}>
          {mensaje.tipo === 'exito'
            ? <Check className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {mensaje.texto}
        </div>
      )}

      {/* ── Pestañas ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60 w-fit">
        {PESTANAS.map(({ id, etiqueta, Icono }) => (
          <button
            key={id}
            onClick={() => setTabActiva(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
              ${tabActiva === id
                ? 'bg-[#765A05] text-white shadow-md shadow-[#765A05]/20'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/70'}`}
          >
            <Icono className="w-4 h-4" />
            {etiqueta}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: BANNERS                                                           */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Controles */}
          <div className={eCard + ' p-6 space-y-4'}>
            <p className={eSec}><Image className="w-3.5 h-3.5" /> Orden y Configuración</p>

            {banners.map((banner, idx) => (
              <div key={banner.id}
                className="border border-gray-100 rounded-xl p-4 bg-white/60 space-y-3">

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#765A05] uppercase tracking-widest">
                    Banner {banner.orden}
                  </span>
                  {/* Toggle activo */}
                  <button
                    onClick={() => toggleActivoBanner(banner.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all
                      ${banner.activo
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                  >
                    <div className={`w-3 h-3 rounded-full ${banner.activo ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {banner.activo ? 'Activo' : 'Oculto'}
                  </button>
                </div>

                <div>
                  <label className={eLabel}>Título</label>
                  <input className={eInput} value={banner.titulo}
                    onChange={e => editarBanner(banner.id, 'titulo', e.target.value)} />
                </div>

                <div>
                  <label className={eLabel}>Subtítulo</label>
                  <input className={eInput} value={banner.subtitulo}
                    onChange={e => editarBanner(banner.id, 'subtitulo', e.target.value)} />
                </div>

                <div className="flex items-center gap-2">
                  {banner.imagen
                    ? <img src={banner.imagen} alt={banner.titulo}
                        className="w-16 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                    : <div className="w-16 h-10 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center shrink-0">
                        <Image className="w-4 h-4 text-gray-400" />
                      </div>
                  }
                  <button
                    onClick={() => abrirSelectorImagen(banner.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border border-[#765A05]/30 text-[#765A05] hover:bg-[#FFDF96]/20 transition-all">
                    <Upload className="w-3 h-3" /> Subir imagen
                  </button>
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => cambiarOrden(banner.id, 'arriba')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
                      <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button onClick={() => cambiarOrden(banner.id, 'abajo')}
                      disabled={idx === banners.length - 1}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
                      <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <input ref={refArchivo} type="file" accept="image/*"
              className="hidden" onChange={manejarImagen} />

            <button
              onClick={guardarBanners}
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#765A05] text-white text-sm font-bold rounded-xl hover:bg-[#5c4504] transition-all shadow-md shadow-[#765A05]/20 disabled:opacity-60">
              <Save className="w-4 h-4" />
              {cargando ? 'Publicando…' : 'Guardar y Publicar Banners'}
            </button>
          </div>

          {/* Previsualización carrusel */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-3.5 h-3.5 text-[#765A05]/50" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Vista Previa — Carrusel en Tiempo Real
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <BarraNavegador url="misionnevado.org.ve" />

              {totalActivos > 0 && bannerEnPrevia ? (
                <div className="relative">
                  {bannerEnPrevia.imagen
                    ? <img src={bannerEnPrevia.imagen} alt={bannerEnPrevia.titulo}
                        className="w-full h-48 object-cover" />
                    : <div className="h-48 bg-gradient-to-br from-[#765A05] to-[#c4932a] flex items-center justify-center">
                        <Image className="w-14 h-14 text-white/20" />
                      </div>
                  }
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
                    <p className="text-white font-black text-lg leading-tight drop-shadow-lg">
                      {bannerEnPrevia.titulo}
                    </p>
                    <p className="text-white/80 text-xs mt-1.5 drop-shadow">
                      {bannerEnPrevia.subtitulo}
                    </p>
                  </div>

                  {totalActivos > 1 && (
                    <>
                      <button onClick={() => setBannerPrevia(p => p === 0 ? totalActivos - 1 : p - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all">
                        <ChevronLeft className="w-4 h-4 text-gray-700" />
                      </button>
                      <button onClick={() => setBannerPrevia(p => (p + 1) % totalActivos)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all">
                        <ChevronRight className="w-4 h-4 text-gray-700" />
                      </button>
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {bannersActivos.map((_, i) => (
                          <button key={i} onClick={() => setBannerPrevia(i)}
                            className={`h-1.5 rounded-full transition-all
                              ${i === idxSeguro ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gray-50 flex flex-col items-center justify-center gap-2">
                  <Image className="w-8 h-8 text-gray-300" />
                  <p className="text-xs text-gray-400">Ningún banner activo</p>
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-3">
              {totalActivos} de {banners.length} banners visibles en la web
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: TEXTOS                                                            */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'textos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Formulario */}
          <div className={eCard + ' p-6 space-y-5'}>
            <p className={eSec}><FileText className="w-3.5 h-3.5" /> Contenido Editable</p>

            <div>
              <label className={eLabel}>Título de Bienvenida</label>
              <input className={eInput} value={textos.titulo_bienvenida}
                onChange={e => cambiarTexto('titulo_bienvenida', e.target.value)} />
            </div>
            <div>
              <label className={eLabel}>Subtítulo de Bienvenida</label>
              <input className={eInput} value={textos.subtitulo_bienvenida}
                onChange={e => cambiarTexto('subtitulo_bienvenida', e.target.value)} />
            </div>
            <div>
              <label className={eLabel}>Misión</label>
              <textarea rows={3} className={eInput + ' resize-none leading-relaxed'}
                value={textos.texto_mision}
                onChange={e => cambiarTexto('texto_mision', e.target.value)} />
            </div>
            <div>
              <label className={eLabel}>Visión</label>
              <textarea rows={3} className={eInput + ' resize-none leading-relaxed'}
                value={textos.texto_vision}
                onChange={e => cambiarTexto('texto_vision', e.target.value)} />
            </div>
            <div>
              <label className={eLabel}>
                Comunicado Público
                <span className="ml-1 text-gray-400 normal-case font-normal tracking-normal">(opcional)</span>
              </label>
              <textarea rows={3} className={eInput + ' resize-none leading-relaxed'}
                value={textos.comunicado}
                placeholder="Deja vacío si no hay comunicado activo…"
                onChange={e => cambiarTexto('comunicado', e.target.value)} />
            </div>

            <button
              onClick={guardarTextos}
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#765A05] text-white text-sm font-bold rounded-xl hover:bg-[#5c4504] transition-all shadow-md shadow-[#765A05]/20 disabled:opacity-60">
              <Save className="w-4 h-4" />
              {cargando ? 'Publicando…' : 'Publicar Textos en la Web'}
            </button>
          </div>

          {/* Previsualización textos */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-3.5 h-3.5 text-[#765A05]/50" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Vista Previa — Sección Pública
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <BarraNavegador url="misionnevado.org.ve/#nosotros" />
              <div className="bg-[#FFFBF0] p-5 space-y-4">

                {/* Hero */}
                <div className="bg-gradient-to-br from-[#765A05] to-[#c4932a] rounded-xl p-5 text-center">
                  <h1 className="text-white font-black text-base leading-tight">
                    {textos.titulo_bienvenida || <span className="opacity-40">Título de bienvenida</span>}
                  </h1>
                  <p className="text-white/80 text-xs mt-1.5">
                    {textos.subtitulo_bienvenida || <span className="opacity-40">Subtítulo</span>}
                  </p>
                </div>

                {/* Misión y Visión */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-[#FFDF96]/60">
                    <p className="text-[9px] font-black text-[#765A05] uppercase tracking-wider mb-1.5">Misión</p>
                    <p className="text-[10px] text-gray-600 leading-snug">
                      {textos.texto_mision || <span className="text-gray-300">—</span>}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-[#FFDF96]/60">
                    <p className="text-[9px] font-black text-[#765A05] uppercase tracking-wider mb-1.5">Visión</p>
                    <p className="text-[10px] text-gray-600 leading-snug">
                      {textos.texto_vision || <span className="text-gray-300">—</span>}
                    </p>
                  </div>
                </div>

                {/* Comunicado (solo si hay contenido) */}
                {textos.comunicado && (
                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-wider mb-1">
                      Comunicado
                    </p>
                    <p className="text-[10px] text-amber-800 leading-snug">{textos.comunicado}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: PACIENTES DESTACADOS                                              */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'pacientes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Selector */}
          <div className={eCard + ' p-6'}>
            <div className="flex items-center justify-between mb-4">
              <p className={eSec}><PawPrint className="w-3.5 h-3.5" /> Catálogo de Adopción</p>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                ${pacientesDestacados.length > 0
                  ? 'bg-[#FFDF96]/40 text-[#765A05]'
                  : 'bg-gray-100 text-gray-400'}`}>
                {pacientesDestacados.length} seleccionados
              </span>
            </div>

            <div className="space-y-2 mb-5">
              {catalogo.map(animal => (
                <div
                  key={animal.id}
                  onClick={() => toggleDestacado(animal.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none
                    ${animal.destacado
                      ? 'bg-[#FFDF96]/20 border-[#765A05]/25 shadow-sm'
                      : 'bg-white/40 border-gray-100 hover:border-gray-200 hover:bg-white/60'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                    ${animal.especie === 'Canino' ? 'bg-amber-100' : 'bg-purple-100'}`}>
                    <PawPrint className={`w-4 h-4 ${animal.especie === 'Canino' ? 'text-amber-600' : 'text-purple-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-none">{animal.nombre}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{animal.raza} · {animal.especie}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                    ${animal.destacado ? 'bg-[#765A05] border-[#765A05]' : 'border-gray-300'}`}>
                    {animal.destacado && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={guardarDestacados}
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#765A05] text-white text-sm font-bold rounded-xl hover:bg-[#5c4504] transition-all shadow-md shadow-[#765A05]/20 disabled:opacity-60">
              <Star className="w-4 h-4" />
              {cargando ? 'Publicando…' : 'Publicar Selección en Portada'}
            </button>
          </div>

          {/* Previsualización portada */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-3.5 h-3.5 text-[#765A05]/50" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Vista Previa — Portada Pública
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <BarraNavegador url="misionnevado.org.ve/#adopta" />
              <div className="bg-[#FFFBF0] p-4">
                <p className="text-[9px] font-black text-[#765A05] uppercase tracking-widest mb-3 text-center">
                  Nuestros Pacientes en Adopción
                </p>

                {pacientesDestacados.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {pacientesDestacados.map(animal => (
                      <div key={animal.id}
                        className="bg-white rounded-xl border border-[#FFDF96]/50 p-3 text-center shadow-sm">
                        <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center
                          ${animal.especie === 'Canino' ? 'bg-amber-100' : 'bg-purple-100'}`}>
                          <PawPrint className={`w-5 h-5 ${animal.especie === 'Canino' ? 'text-amber-600' : 'text-purple-600'}`} />
                        </div>
                        <p className="text-[9px] font-black text-gray-800 leading-tight">{animal.nombre}</p>
                        <p className="text-[8px] text-gray-400 mt-0.5">{animal.raza}</p>
                        <div className="mt-2 bg-[#765A05] rounded-md py-0.5 px-1">
                          <span className="text-[7px] text-white font-bold">Adoptar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <PawPrint className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-400">Ningún paciente seleccionado para la portada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
