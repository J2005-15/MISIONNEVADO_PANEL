import { useState, useEffect, useRef } from 'react'
import {
  Heart, ClipboardList, Save, Check, AlertCircle,
  Phone, Mail, Clock, ThumbsUp, ThumbsDown, User, Upload, X,
  ChevronLeft, ChevronRight,
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
  { id: 'registro',    etiqueta: 'Registro de Paciente',   Icono: Heart         },
  { id: 'solicitudes', etiqueta: 'Gestión de Solicitudes', Icono: ClipboardList },
]

// ─── CATÁLOGO MOCK — pacientes registrados (fallback mientras carga backend) ──
const REGISTROS_MOCK = [
  {
    ADOPCI_ID: 101,
    ADOPCI_FT: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80',
    ADOPCI_NO: 'Boby',
    ADOPCI_ES: 'Canino',
    ADOPCI_SE: 'Macho',
    ADOPCI_RA: 'Mestizo',
    ADOPCI_CO: 'Marrón',
    ADOPCI_FN: '2024-03-15',
    ADOPCI_PE: '12.5',
    ADOPCI_DE: 'Animal sociable, bueno con niños. Rescatado de la vía pública en buen estado de salud.',
    ADOPCI_ST: 'DISPONIBLE',
  },
  {
    ADOPCI_ID: 102,
    ADOPCI_FT: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=120&q=80',
    ADOPCI_NO: 'Luna',
    ADOPCI_ES: 'Felino',
    ADOPCI_SE: 'Hembra',
    ADOPCI_RA: 'Doméstico pelo corto',
    ADOPCI_CO: 'Blanco y negro',
    ADOPCI_FN: '2025-01-20',
    ADOPCI_PE: '3.2',
    ADOPCI_DE: 'Muy cariñosa. Desparasitada y vacunada. Ideal para espacios pequeños.',
    ADOPCI_ST: 'DISPONIBLE',
  },
  {
    ADOPCI_ID: 103,
    ADOPCI_FT: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=120&q=80',
    ADOPCI_NO: 'Max',
    ADOPCI_ES: 'Canino',
    ADOPCI_SE: 'Macho',
    ADOPCI_RA: 'Golden Retriever cruzado',
    ADOPCI_CO: 'Dorado',
    ADOPCI_FN: '2025-09-10',
    ADOPCI_PE: '8.0',
    ADOPCI_DE: 'Cachorro juguetón y enérgico. Requiere espacio exterior. Esterilizado.',
    ADOPCI_ST: 'DISPONIBLE',
  },
  {
    ADOPCI_ID: 104,
    ADOPCI_FT: 'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=120&q=80',
    ADOPCI_NO: 'Rocky',
    ADOPCI_ES: 'Canino',
    ADOPCI_SE: 'Macho',
    ADOPCI_RA: 'Rottweiler Mestizo',
    ADOPCI_CO: 'Negro con café',
    ADOPCI_FN: '2023-05-08',
    ADOPCI_PE: '28.4',
    ADOPCI_DE: 'Leal y protector. Requiere adoptante con experiencia en razas grandes.',
    ADOPCI_ST: 'EN PROCESO',
  },
  {
    ADOPCI_ID: 105,
    ADOPCI_FT: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=120&q=80',
    ADOPCI_NO: 'Bella',
    ADOPCI_ES: 'Felino',
    ADOPCI_SE: 'Hembra',
    ADOPCI_RA: 'Siamés cruzado',
    ADOPCI_CO: 'Caramelo con puntas oscuras',
    ADOPCI_FN: '2024-07-22',
    ADOPCI_PE: '4.1',
    ADOPCI_DE: 'Independiente pero afectuosa. Convive bien con otros felinos.',
    ADOPCI_ST: 'ADOPTADO',
  },
]

// ─── SOLICITUDES MOCK ─────────────────────────────────────────────────────────
const SOLICITUDES_MOCK = [
  {
    SOL_ID:      1,
    SOL_FECHA:   '2026-07-01',
    SOL_ESTADO:  'PENDIENTE',
    SOL_MENSAJE: 'Tengo casa amplia con jardín. Trabajo desde casa y puedo dedicarle tiempo completo. Tengo experiencia previa con animales rescatados.',
    SOLICITANTE: { nombre: 'María García',  cedula: 'V-12.345.678', telefono: '0414-1234567', email: 'maria@gmail.com'        },
    PACIENTE:    { ADOPCI_ID: 101, ADOPCI_NO: 'Boby', ADOPCI_ES: 'Canino', ADOPCI_SE: 'Macho',  ADOPCI_FT: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80' },
  },
  {
    SOL_ID:      2,
    SOL_FECHA:   '2026-06-29',
    SOL_ESTADO:  'PENDIENTE',
    SOL_MENSAJE: 'Vivo en apartamento pero salgo dos veces al día. Mi familia está completamente de acuerdo con la adopción.',
    SOLICITANTE: { nombre: 'Carlos Méndez', cedula: 'V-9.876.543',  telefono: '0426-9876543', email: 'carlos.m@hotmail.com'   },
    PACIENTE:    { ADOPCI_ID: 102, ADOPCI_NO: 'Luna', ADOPCI_ES: 'Felino', ADOPCI_SE: 'Hembra', ADOPCI_FT: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80' },
  },
  {
    SOL_ID:      3,
    SOL_FECHA:   '2026-06-28',
    SOL_ESTADO:  'PENDIENTE',
    SOL_MENSAJE: 'Soy veterinaria y tengo toda la capacidad para cuidar al animal. Busco compañero para mi trabajo remoto.',
    SOLICITANTE: { nombre: 'Ana Rojas',     cedula: 'V-15.432.100', telefono: '0412-5554433', email: 'ana.rojas@vet.com'      },
    PACIENTE:    { ADOPCI_ID: 103, ADOPCI_NO: 'Max',  ADOPCI_ES: 'Canino', ADOPCI_SE: 'Macho',  ADOPCI_FT: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=200&q=80' },
  },
]

// ─── CATÁLOGO DE RAZAS POR ESPECIE ───────────────────────────────────────────
const RAZAS = {
  Canino: [
    'Mestizo / Criollo', 'Labrador Retriever', 'Golden Retriever',
    'Pastor Alemán', 'Poodle', 'Bulldog', 'Husky Siberiano',
    'Rottweiler', 'Beagle', 'Chihuahua', 'Boxer', 'Doberman',
    'Pit Bull', 'Schnauzer', 'Yorkshire Terrier', 'Cocker Spaniel',
    'Dálmata', 'Shih Tzu', 'Otro',
  ],
  Felino: [
    'Doméstico Pelo Corto', 'Doméstico Pelo Largo', 'Siamés',
    'Persa', 'Maine Coon', 'Bengalí', 'Ragdoll', 'Angora',
    'Abisinio', 'Sphynx', 'Otro',
  ],
  Otro: ['Mestizo / Criollo', 'Otro'],
}

// ─── NORMALIZADOR CATÁLOGO ────────────────────────────────────────────────────
const normalizarAnimal = (a) => ({
  ADOPCI_ID: a.adopci_id ?? a.ADOPCI_ID ?? null,
  ADOPCI_NO: a.adopci_no ?? a.ADOPCI_NO ?? '',
  ADOPCI_ES: a.adopci_es ?? a.ADOPCI_ES ?? '',
  ADOPCI_SE: a.adopci_se ?? a.ADOPCI_SE ?? '',
  ADOPCI_RA: a.adopci_ra ?? a.ADOPCI_RA ?? '',
  ADOPCI_CO: a.adopci_co ?? a.ADOPCI_CO ?? '',
  ADOPCI_FN: a.adopci_fn ?? a.ADOPCI_FN ?? '',
  ADOPCI_PE: a.adopci_pe ?? a.ADOPCI_PE ?? '',
  ADOPCI_FT: a.adopci_ft ?? a.ADOPCI_FT ?? null,
  ADOPCI_DE: a.adopci_de ?? a.ADOPCI_DE ?? '',
  ADOPCI_ST: a.adopci_st ?? a.ADOPCI_ST ?? 'DISPONIBLE',
})

// ─── NORMALIZADOR SOLICITUDES ─────────────────────────────────────────────────
const normalizarSolicitud = (s, animales = []) => {
  const animal = animales.find(a => a.ADOPCI_ID === (s.adopci_id ?? s.ADOPCI_ID)) ?? {}
  return {
    SOL_ID:      s.solic_id    ?? s.SOL_ID,
    SOL_FECHA:   (s.solic_fe   ?? s.SOL_FECHA  ?? '').toString().slice(0, 10),
    SOL_ESTADO:  (s.solic_es ?? s.SOL_ESTADO ?? 'PENDIENTE').toUpperCase(),
    SOL_MENSAJE: s.solic_mo    ?? s.SOL_MENSAJE ?? '',
    SOLICITANTE: {
      nombre:   s.solic_no    ?? s.SOLICITANTE?.nombre   ?? '—',
      cedula:   s.solic_ce    ?? s.SOLICITANTE?.cedula   ?? '—',
      telefono: s.solic_tl    ?? s.SOLICITANTE?.telefono ?? '—',
      email:    s.solic_em    ?? s.SOLICITANTE?.email    ?? '—',
    },
    PACIENTE: {
      ADOPCI_ID: s.adopci_id   ?? s.PACIENTE?.ADOPCI_ID ?? null,
      ADOPCI_NO: s.mascota_no  ?? animal.ADOPCI_NO ?? s.PACIENTE?.ADOPCI_NO ?? '—',
      ADOPCI_ES: animal.ADOPCI_ES ?? s.PACIENTE?.ADOPCI_ES ?? '',
      ADOPCI_SE: animal.ADOPCI_SE ?? s.PACIENTE?.ADOPCI_SE ?? '',
      ADOPCI_FT: animal.ADOPCI_FT ?? s.PACIENTE?.ADOPCI_FT ?? null,
    },
  }
}

// ─── FORMULARIO VACÍO — campos sincronizados con la BD ───────────────────────
const FORMULARIO_VACIO = {
  nombre:           '',
  especie:          '',
  sexo:             '',
  raza:             '',
  color:            '',
  fecha_nacimiento: '',
  peso:             '',
  descripcion:      '',
}

// ─── PALETA DE ESTADOS ────────────────────────────────────────────────────────
const COLORES_ESTADO = {
  'DISPONIBLE': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'EN PROCESO': 'bg-amber-100   text-amber-700   border border-amber-200',
  'ADOPTADO':   'bg-sky-100     text-sky-700     border border-sky-200',
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function AdopcionesAdmin({ rolActivo = 'ADMINISTRADOR' }) {

  const [tabActiva,    setTabActiva]    = useState('registro')
  const [enviando,     setEnviando]     = useState(false)
  const [mensaje,      setMensaje]      = useState(null)
  const [formulario,   setFormulario]   = useState(FORMULARIO_VACIO)
  const [registros,    setRegistros]    = useState(REGISTROS_MOCK)
  const [solicitudes,  setSolicitudes]  = useState([])
  const [procesandoId, setProcesandoId] = useState(null)
  const [archivoFoto,  setArchivoFoto]  = useState(null)
  const [previewFoto,  setPreviewFoto]  = useState(null)
  const inputArchivo = useRef(null)
  const [paginaAdopciones, setPaginaAdopciones] = useState(1)
  const LIMIT = 10

  // ── Carga de datos desde el backend ──────────────────────────────────────────
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [rAnimales, rSolicitudes] = await Promise.all([
          api.get('/adopciones'),
          api.get('/adopciones/solicitudes').catch(() => ({ data: { registros: [] } })),
        ])
        const animales = (rAnimales.data.registros ?? []).map(normalizarAnimal)
        if (animales.length) setRegistros(animales)
        const solsDB = rSolicitudes.data.registros ?? []
        if (solsDB.length) setSolicitudes(solsDB.map(s => normalizarSolicitud(s, animales)))
      } catch { /* mantiene registros mock si la carga falla */ }
    }
    cargarDatos()
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 5000)
  }

  const cambiarFormulario = (campo, valor) =>
    setFormulario(prev => ({ ...prev, [campo]: valor }))

  // ── Limpiar foto seleccionada ─────────────────────────────────────────────────
  const limpiarFoto = () => {
    if (previewFoto) URL.revokeObjectURL(previewFoto)
    setArchivoFoto(null)
    setPreviewFoto(null)
    if (inputArchivo.current) inputArchivo.current.value = ''
  }

  // ── Registro de nuevo paciente — POST ─────────────────────────────────────────
  const manejarRegistro = async (e) => {
    e.preventDefault()
    if (!formulario.nombre.trim() || !formulario.especie || !formulario.sexo) {
      mostrarMensaje('error', 'Nombre, Especie y Sexo son campos obligatorios.')
      return
    }
    setEnviando(true)
    try {
      let respuesta
      if (archivoFoto) {
        const datos = new FormData()
        Object.entries(formulario).forEach(([k, v]) => datos.append(k, v))
        datos.append('foto', archivoFoto, archivoFoto.name)
        respuesta = await api.post('/adopciones', datos)
      } else {
        respuesta = await api.post('/adopciones', formulario)
      }

      const datosPaciente = respuesta.data.paciente ?? {
        ADOPCI_ID: Date.now(),
        ADOPCI_NO: formulario.nombre,
        ADOPCI_ES: formulario.especie,
        ADOPCI_SE: formulario.sexo,
        ADOPCI_RA: formulario.raza,
        ADOPCI_CO: formulario.color,
        ADOPCI_FN: formulario.fecha_nacimiento,
        ADOPCI_PE: formulario.peso,
        ADOPCI_FT: previewFoto ?? undefined,
        ADOPCI_DE: formulario.descripcion,
        ADOPCI_ST: 'DISPONIBLE',
      }
      const nuevoPaciente = normalizarAnimal(datosPaciente)
      setRegistros(prev => [nuevoPaciente, ...prev])
      mostrarMensaje('exito', `Paciente "${formulario.nombre}" registrado en la cartelera de adopción.`)
      setFormulario(FORMULARIO_VACIO)
      limpiarFoto()
    } catch (error) {
      mostrarMensaje('error', error.response?.data?.mensaje ?? 'Error al registrar el paciente.')
    } finally {
      setEnviando(false)
    }
  }

  // ── Procesar solicitud — PATCH ────────────────────────────────────────────────
  const procesarSolicitud = async (id, accion) => {
    setProcesandoId(id)
    try {
      await api.patch(`/adopciones/solicitud/${id}`, { SOLIC_ES: accion })
      setSolicitudes(prev => prev.filter(s => s.SOL_ID !== id))
      mostrarMensaje('exito',
        accion === 'APROBADA'
          ? 'Solicitud aprobada. Se notificará al solicitante.'
          : 'Solicitud rechazada y archivada en el sistema.'
      )
    } catch {
      mostrarMensaje('error', 'Sin conexión con el servidor.')
    } finally {
      setProcesandoId(null)
    }
  }

  // ── Derivados ─────────────────────────────────────────────────────────────────
  const solicitudesPendientes  = solicitudes.filter(s => s.SOL_ESTADO === 'PENDIENTE')
  const formularioCompleto     = formulario.nombre.trim() && formulario.especie && formulario.sexo
  const totalDisponibles       = registros.filter(r => r.ADOPCI_ST === 'DISPONIBLE').length

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl">

      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-black text-gray-900">Módulo de Adopciones</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Registro de pacientes en cartelera y gestión de solicitudes ciudadanas
        </p>
      </div>

      {/* Toast de estado */}
      {mensaje && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all
          ${mensaje.tipo === 'exito'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'}`}>
          {mensaje.tipo === 'exito'
            ? <Check       className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {mensaje.texto}
        </div>
      )}

      {/* Navegación de pestañas */}
      <div className="flex gap-1.5 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60 w-fit">
        {PESTANAS.map(({ id, etiqueta, Icono }) => (
          <button key={id} onClick={() => setTabActiva(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
              ${tabActiva === id
                ? 'bg-[#765A05] text-white shadow-md shadow-[#765A05]/20'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/70'}`}>
            <Icono className="w-4 h-4" />
            {etiqueta}
            {id === 'solicitudes' && solicitudesPendientes.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                ${tabActiva === id ? 'bg-white/25 text-white' : 'bg-[#765A05]/12 text-[#765A05]'}`}>
                {solicitudesPendientes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: REGISTRO DE PACIENTE                                              */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'registro' && (
        <div className="space-y-6">

          {/* Fila superior: Formulario + Vista Previa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Formulario de alta ─────────────────────────────────────────── */}
            <div className={eCard + ' p-6'}>
              <p className={eSec}><Heart className="w-3.5 h-3.5" /> Alta de Nuevo Paciente</p>
              <p className="text-xs text-gray-400 mt-1 mb-5">
                Complete los datos del animal para registrarlo en la cartelera de adopción pública.
              </p>

              <form onSubmit={manejarRegistro} className="space-y-3.5">

                {/* Nombre */}
                <div>
                  <label className={eLabel}>
                    Nombre <span className="text-red-400 normal-case font-normal">*</span>
                  </label>
                  <input className={eInput} placeholder="Ej: Boby, Luna, Max…"
                    value={formulario.nombre}
                    onChange={e => cambiarFormulario('nombre', e.target.value)} />
                </div>

                {/* Especie + Sexo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={eLabel}>
                      Especie <span className="text-red-400 normal-case font-normal">*</span>
                    </label>
                    <select className={eInput} value={formulario.especie}
                      onChange={e => {
                        cambiarFormulario('especie', e.target.value)
                        cambiarFormulario('raza', '')
                      }}>
                      <option value="">Seleccionar…</option>
                      <option value="Canino">Canino</option>
                      <option value="Felino">Felino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className={eLabel}>
                      Sexo <span className="text-red-400 normal-case font-normal">*</span>
                    </label>
                    <select className={eInput} value={formulario.sexo}
                      onChange={e => cambiarFormulario('sexo', e.target.value)}>
                      <option value="">Seleccionar…</option>
                      <option value="Macho">Macho</option>
                      <option value="Hembra">Hembra</option>
                    </select>
                  </div>
                </div>

                {/* Raza */}
                <div>
                  <label className={eLabel}>Raza</label>
                  <select
                    className={eInput}
                    value={formulario.raza}
                    onChange={e => cambiarFormulario('raza', e.target.value)}
                    disabled={!formulario.especie}
                  >
                    <option value="">
                      {formulario.especie ? 'Seleccionar raza…' : 'Seleccione especie primero'}
                    </option>
                    {(RAZAS[formulario.especie] ?? []).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Color + Peso */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={eLabel}>Color / Pelaje</label>
                    <input className={eInput} placeholder="Ej: Marrón, Blanco…"
                      value={formulario.color}
                      onChange={e => cambiarFormulario('color', e.target.value)} />
                  </div>
                  <div>
                    <label className={eLabel}>Peso (kg)</label>
                    <input className={eInput} type="number" min="0" step="0.1" placeholder="0.0"
                      value={formulario.peso}
                      onChange={e => cambiarFormulario('peso', e.target.value)} />
                  </div>
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className={eLabel}>Fecha de Nacimiento</label>
                  <input className={eInput} type="date"
                    value={formulario.fecha_nacimiento}
                    onChange={e => cambiarFormulario('fecha_nacimiento', e.target.value)} />
                </div>

                {/* Fotografía del Paciente — Subida de Archivo */}
                <div>
                  <label className={eLabel}>Fotografía del Paciente</label>
                  <label
                    htmlFor="foto-archivo-paciente"
                    className={`flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                      previewFoto
                        ? 'border-[#765A05]/30 h-28 p-0'
                        : 'h-24 p-4 border-gray-300 bg-gray-50/80 hover:border-[#765A05]/40 hover:bg-[#FFDF96]/10'
                    }`}
                  >
                    {previewFoto ? (
                      <div className="relative w-full h-full group">
                        <img src={previewFoto} alt="Vista previa"
                          className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-bold flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" /> Cambiar imagen
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <div className="text-center leading-snug">
                          <p className="text-xs text-gray-500">
                            Arrastra una imagen aquí o{' '}
                            <span className="text-[#765A05] font-bold">haz clic para seleccionar</span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP · máx. 5 MB</p>
                        </div>
                      </>
                    )}
                  </label>
                  <input
                    id="foto-archivo-paciente"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    ref={inputArchivo}
                    onChange={e => {
                      const archivo = e.target.files?.[0]
                      if (!archivo) return
                      if (previewFoto) URL.revokeObjectURL(previewFoto)
                      setArchivoFoto(archivo)
                      setPreviewFoto(URL.createObjectURL(archivo))
                    }}
                  />
                  {archivoFoto && (
                    <button
                      type="button"
                      onClick={limpiarFoto}
                      className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-3 h-3" /> Quitar imagen
                    </button>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className={eLabel}>Descripción</label>
                  <textarea rows={3} className={eInput + ' resize-none leading-relaxed'}
                    placeholder="Carácter, historia de rescate, necesidades especiales…"
                    value={formulario.descripcion}
                    onChange={e => cambiarFormulario('descripcion', e.target.value)} />
                </div>

                <button type="submit" disabled={enviando || !formularioCompleto}
                  className={eBoton + ' w-full'}>
                  <Save className="w-4 h-4" />
                  {enviando ? 'Registrando…' : 'Registrar en Cartelera Pública'}
                </button>
              </form>
            </div>

            {/* ── Vista previa — tarjeta web ──────────────────────────────────── */}
            <div className={eCard + ' p-5 flex flex-col'}>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5">
                Vista Previa — Tarjeta en la Cartelera Web
              </p>

              <div className="flex-1 flex items-center justify-center">
                <div className="w-[210px]">
                  <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl">

                    {previewFoto ? (
                      <img src={previewFoto} alt={formulario.nombre || 'Paciente'}
                        className="w-full h-44 object-cover" />
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-[#FFEFD1] to-[#D4AC4E]/20 flex items-center justify-center">
                        <Heart className="w-16 h-16 text-[#D4AC4E]/40" />
                      </div>
                    )}

                    <div className="p-4 space-y-2.5">
                      {/* Nombre + Especie */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[15px] font-black text-gray-900 leading-tight">
                          {formulario.nombre || 'Nombre del animal'}
                        </h3>
                        {formulario.especie && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0">
                            {formulario.especie}
                          </span>
                        )}
                      </div>

                      {/* Chips de datos clave */}
                      <div className="flex gap-1 flex-wrap">
                        {formulario.sexo && (
                          <span className="text-[9px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">
                            {formulario.sexo}
                          </span>
                        )}
                        {formulario.raza && (
                          <span className="text-[9px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full truncate max-w-[90px]">
                            {formulario.raza}
                          </span>
                        )}
                        {formulario.color && (
                          <span className="text-[9px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full truncate max-w-[80px]">
                            {formulario.color}
                          </span>
                        )}
                        {formulario.peso && (
                          <span className="text-[9px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">
                            {formulario.peso} kg
                          </span>
                        )}
                      </div>

                      {formulario.descripcion && (
                        <p className="text-[10px] text-gray-500 leading-snug line-clamp-3">
                          {formulario.descripcion}
                        </p>
                      )}

                      <button className="w-full bg-[#D4AC4E] text-[#212529] py-2 rounded-xl text-xs font-bold shadow-sm">
                        🐾 Quiero Adoptarlo
                      </button>
                    </div>
                  </div>

                  <p className="text-[9px] text-gray-400 text-center mt-3">
                    Así aparecerá en la cartelera pública
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Catálogo completo de pacientes registrados ──────────────────── */}
          <div className={eCard + ' p-5'}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={eSec}><ClipboardList className="w-3.5 h-3.5" /> Catálogo de Pacientes</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {registros.length} animales registrados · {totalDisponibles} disponibles para adopción
                </p>
              </div>
            </div>

            {registros.length === 0 ? (
              <div className="py-10 text-center">
                <Heart className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Sin registros en el sistema</p>
              </div>
            ) : (
              <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <div className="overflow-y-auto max-h-[420px]">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#FFDF96]/30 backdrop-blur-sm border-b border-[#765A05]/10">
                        <th className="text-left px-3 py-3 font-bold text-[#765A05] uppercase tracking-wider w-14">Foto</th>
                        <th className="text-left px-3 py-3 font-bold text-[#765A05] uppercase tracking-wider">Nombre</th>
                        <th className="text-left px-3 py-3 font-bold text-[#765A05] uppercase tracking-wider">Especie / Raza</th>
                        <th className="text-left px-3 py-3 font-bold text-[#765A05] uppercase tracking-wider">Sexo</th>
                        <th className="text-left px-3 py-3 font-bold text-[#765A05] uppercase tracking-wider">Color</th>
                        <th className="text-left px-3 py-3 font-bold text-[#765A05] uppercase tracking-wider">Peso</th>
                        <th className="text-left px-3 py-3 font-bold text-[#765A05] uppercase tracking-wider">F. Nacimiento</th>
                        <th className="text-left px-3 py-3 font-bold text-[#765A05] uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/80">
                      {registros.slice((paginaAdopciones - 1) * LIMIT, paginaAdopciones * LIMIT).map(animal => (
                        <tr key={animal.ADOPCI_ID}
                          className="hover:bg-[#FFDF96]/10 transition-colors">
                          <td className="px-3 py-2.5">
                            {animal.ADOPCI_FT ? (
                              <img src={animal.ADOPCI_FT} alt={animal.ADOPCI_NO}
                                className="w-10 h-10 object-cover rounded-xl border border-gray-200"
                                onError={e => { e.currentTarget.style.display = 'none' }} />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                                <Heart className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-bold text-gray-900">{animal.ADOPCI_NO}</p>
                            {animal.ADOPCI_DE && (
                              <p className="text-[10px] text-gray-400 line-clamp-1 max-w-[140px]">
                                {animal.ADOPCI_DE}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-gray-800">{animal.ADOPCI_ES}</p>
                            <p className="text-[10px] text-gray-400">{animal.ADOPCI_RA || '—'}</p>
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">{animal.ADOPCI_SE || '—'}</td>
                          <td className="px-3 py-2.5 text-gray-700">{animal.ADOPCI_CO || '—'}</td>
                          <td className="px-3 py-2.5 text-gray-700">
                            {animal.ADOPCI_PE ? `${animal.ADOPCI_PE} kg` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">
                            {animal.ADOPCI_FN || '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap
                              ${COLORES_ESTADO[animal.ADOPCI_ST] ?? 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                              {animal.ADOPCI_ST ?? 'SIN ESTADO'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2 mt-4 px-1">
                <p className="text-xs text-gray-400">
                  Mostrando {registros.slice((paginaAdopciones - 1) * LIMIT, paginaAdopciones * LIMIT).length} de {registros.length} registros
                </p>
                {Math.ceil(registros.length / LIMIT) > 1 && (
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                    <button
                      onClick={() => setPaginaAdopciones(p => Math.max(1, p - 1))}
                      disabled={paginaAdopciones === 1}
                      className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs font-semibold text-gray-600 px-2">
                      {paginaAdopciones} / {Math.ceil(registros.length / LIMIT)}
                    </span>
                    <button
                      onClick={() => setPaginaAdopciones(p => Math.min(Math.ceil(registros.length / LIMIT), p + 1))}
                      disabled={paginaAdopciones === Math.ceil(registros.length / LIMIT)}
                      className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB: GESTIÓN DE SOLICITUDES                                            */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {tabActiva === 'solicitudes' && (
        <div className="space-y-4">

          <p className="text-xs text-gray-500">
            {solicitudesPendientes.length > 0
              ? `${solicitudesPendientes.length} solicitud${solicitudesPendientes.length !== 1 ? 'es' : ''} pendiente${solicitudesPendientes.length !== 1 ? 's' : ''} de revisión`
              : 'No hay solicitudes pendientes en este momento'}
          </p>

          {/* Estado vacío */}
          {solicitudesPendientes.length === 0 && (
            <div className={eCard + ' p-14 text-center'}>
              <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">Todo al día</p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                No hay solicitudes de adopción pendientes de revisión.
              </p>
            </div>
          )}

          {/* Tarjetas de solicitudes */}
          {solicitudesPendientes.map(solicitud => (
            <div key={solicitud.SOL_ID} className={eCard + ' p-5'}>
              <div className="flex items-start gap-5">

                {/* Paciente solicitado */}
                <div className="shrink-0 text-center w-24">
                  {solicitud.PACIENTE.ADOPCI_FT ? (
                    <img src={solicitud.PACIENTE.ADOPCI_FT} alt={solicitud.PACIENTE.ADOPCI_NO}
                      className="w-20 h-20 object-cover rounded-2xl border-2 border-[#D4AC4E]/30 shadow-md mx-auto" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#FFEFD1] border-2 border-[#D4AC4E]/30 flex items-center justify-center mx-auto">
                      <Heart className="w-8 h-8 text-[#D4AC4E]/60" />
                    </div>
                  )}
                  <p className="text-[10px] font-black text-gray-700 mt-1.5 leading-tight">
                    {solicitud.PACIENTE.ADOPCI_NO}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {solicitud.PACIENTE.ADOPCI_ES} · {solicitud.PACIENTE.ADOPCI_SE}
                  </p>
                  <span className="inline-block mt-1 text-[8px] font-bold px-2 py-0.5 rounded-full bg-[#FFEFD1] text-[#765A05] border border-[#D4AC4E]/30">
                    Solicitado
                  </span>
                </div>

                {/* Info del solicitante */}
                <div className="flex-1 min-w-0 space-y-3">

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#765A05]/50 shrink-0" />
                        <p className="text-sm font-black text-gray-900">{solicitud.SOLICITANTE.nombre}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 pl-[22px]">{solicitud.SOLICITANTE.cedula}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      {solicitud.SOL_FECHA}
                    </div>
                  </div>

                  <div className="flex gap-5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <Phone className="w-3 h-3 text-[#765A05]/50 shrink-0" />
                      {solicitud.SOLICITANTE.telefono}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <Mail className="w-3 h-3 text-[#765A05]/50 shrink-0" />
                      {solicitud.SOLICITANTE.email}
                    </span>
                  </div>

                  <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100/80">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Mensaje del Solicitante
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">{solicitud.SOL_MENSAJE}</p>
                  </div>

                  <div className="flex gap-3 pt-0.5">
                    <button
                      onClick={() => procesarSolicitud(solicitud.SOL_ID, 'APROBADA')}
                      disabled={procesandoId === solicitud.SOL_ID}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-60">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Aprobar Adopción
                    </button>
                    <button
                      onClick={() => procesarSolicitud(solicitud.SOL_ID, 'RECHAZADA')}
                      disabled={procesandoId === solicitud.SOL_ID}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 text-xs font-bold rounded-xl transition-all disabled:opacity-60">
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
