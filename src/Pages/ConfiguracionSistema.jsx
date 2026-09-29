import { useState, useEffect } from 'react'
import {
  Mail, Bell, BellOff, Lock, Building2, Save, Check, AlertCircle, Shield,
} from 'lucide-react'
import api from '../lib/api'

// ─── ESTILOS COMPARTIDOS (mismos que Mi Perfil y Contenido Web) ──────────────
const eCard  = 'bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl shadow-[#765A05]/5'
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-400'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'
const eSec   = 'text-xs font-bold text-[#765A05] uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/60 pb-3'
const eAyuda = 'text-[11px] text-gray-400 font-medium mt-1.5'
const eBoton = 'flex items-center justify-center gap-2 py-2.5 px-5 bg-[#765A05] text-white text-sm font-bold rounded-xl hover:bg-[#5c4504] transition-all shadow-md shadow-[#765A05]/20 disabled:opacity-60 disabled:cursor-not-allowed'

const AVISOS = [
  { clave: 'adopciones', titulo: 'Adopciones',                    detalle: 'Solicitud recibida, adopción aprobada o no aprobada, y animal adoptado por otra familia.' },
  { clave: 'registros',  titulo: 'Voluntarios y Proteccionistas', detalle: 'Registro recibido desde la web y registro aprobado.' },
  { clave: 'denuncias',  titulo: 'Denuncias',                     detalle: 'Denuncia recibida y cada cambio de estado del caso.' },
]

const CONFIG_INICIAL = {
  avisos: { adopciones: true, registros: true, denuncias: true },
  sesionHoras: 8,
  recuperacionMinutos: 15,
  institucion: { nombre: '', lema: '', firma: '' },
}

function Toast({ msg }) {
  if (!msg) return null
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
      msg.tipo === 'exito'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {msg.tipo === 'exito' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg.texto}
    </div>
  )
}

export default function ConfiguracionSistema({ rolActivo = 'ADMINISTRADOR' }) {
  const [config,    setConfig]    = useState(CONFIG_INICIAL)
  const [limites,   setLimites]   = useState({ sesionHoras: { min: 1, max: 24 }, recuperacionMinutos: { min: 5, max: 60 } })
  const [cargando,  setCargando]  = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje,   setMensaje]   = useState(null)

  useEffect(() => {
    if (rolActivo !== 'ADMINISTRADOR') return
    api.get('/config/sistema')
      .then(({ data }) => {
        setConfig(data.configuracion)
        if (data.limites) setLimites(data.limites)
      })
      .catch((err) => setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje ?? 'No se pudo cargar la configuración.' }))
      .finally(() => setCargando(false))
  }, [rolActivo])

  if (rolActivo !== 'ADMINISTRADOR') {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Shield className="w-8 h-8 text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-800">Acceso Restringido</p>
          <p className="text-sm text-gray-500 mt-1.5">Solo el Administrador puede modificar la configuración del sistema.</p>
        </div>
      </div>
    )
  }

  const alternarAviso = (clave) =>
    setConfig(c => ({ ...c, avisos: { ...c.avisos, [clave]: !c.avisos[clave] } }))

  const cambiarInstitucion = ({ target: { name, value } }) =>
    setConfig(c => ({ ...c, institucion: { ...c.institucion, [name]: value } }))

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje(null)
    try {
      const { data } = await api.put('/config/sistema', {
        configuracion: {
          ...config,
          sesionHoras:         Number(config.sesionHoras),
          recuperacionMinutos: Number(config.recuperacionMinutos),
        },
      })
      setConfig(data.configuracion)
      setMensaje({ tipo: 'exito', texto: 'Configuración guardada correctamente.' })
      setTimeout(() => setMensaje(null), 5000)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje ?? 'Sin conexión con el servidor.' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-6 max-w-3xl">

      {/* ── Título ── */}
      <div>
        <h2 className="text-xl font-black text-gray-900">Configuración del Sistema</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Parámetros generales del SISCVI: avisos por correo, seguridad del acceso y datos de la institución
        </p>
      </div>

      <Toast msg={mensaje} />

      {/* ── Avisos por correo ── */}
      <div className={eCard + ' p-6'}>
        <p className={eSec}><Mail className="w-3.5 h-3.5" /> Avisos por Correo</p>
        <p className="text-xs text-gray-400 mb-4">
          Correos automáticos que reciben los ciudadanos. Desactivarlos ayuda a cuidar el límite mensual de EmailJS.
          Los correos de seguridad (recuperación de contraseña) se envían siempre.
        </p>

        <div className="space-y-2">
          {AVISOS.map(({ clave, titulo, detalle }) => {
            const activo = config.avisos[clave]
            return (
              <div key={clave}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                  ${activo ? 'bg-[#FFDF96]/15 border-[#765A05]/20 shadow-sm' : 'bg-white/40 border-gray-100'}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-none">{titulo}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{detalle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => alternarAviso(clave)}
                  disabled={cargando}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all
                    ${activo
                      ? 'bg-[#765A05] text-white border-[#765A05] shadow-sm'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                >
                  {activo
                    ? <><Bell    className="w-3 h-3" /> Activo</>
                    : <><BellOff className="w-3 h-3" /> Desactivado</>}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Seguridad de sesión ── */}
      <div className={eCard + ' p-6'}>
        <p className={eSec}><Lock className="w-3.5 h-3.5" /> Seguridad de Sesión</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={eLabel}>Duración de la sesión (horas)</label>
            <input
              type="number"
              required
              min={limites.sesionHoras.min}
              max={limites.sesionHoras.max}
              value={config.sesionHoras}
              onChange={e => setConfig(c => ({ ...c, sesionHoras: e.target.value }))}
              disabled={cargando}
              className={eInput}
            />
            <p className={eAyuda}>
              Tiempo que un usuario permanece conectado antes de volver a iniciar sesión
              ({limites.sesionHoras.min} a {limites.sesionHoras.max} h). Aplica desde el próximo inicio de sesión.
            </p>
          </div>
          <div>
            <label className={eLabel}>Vigencia del código de recuperación (minutos)</label>
            <input
              type="number"
              required
              min={limites.recuperacionMinutos.min}
              max={limites.recuperacionMinutos.max}
              value={config.recuperacionMinutos}
              onChange={e => setConfig(c => ({ ...c, recuperacionMinutos: e.target.value }))}
              disabled={cargando}
              className={eInput}
            />
            <p className={eAyuda}>
              Tiempo para usar el código de “¿Olvidó su clave?” ({limites.recuperacionMinutos.min} a {limites.recuperacionMinutos.max} min). Admite 5 intentos.
            </p>
          </div>
        </div>
      </div>

      {/* ── Datos de la institución ── */}
      <div className={eCard + ' p-6'}>
        <p className={eSec}><Building2 className="w-3.5 h-3.5" /> Datos de la Institución</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={eLabel}>Nombre de la institución *</label>
              <input
                name="nombre"
                required
                maxLength={300}
                value={config.institucion.nombre}
                onChange={cambiarInstitucion}
                disabled={cargando}
                placeholder="Fundación Misión Nevado"
                className={eInput}
              />
            </div>
            <div>
              <label className={eLabel}>Lema o sede</label>
              <input
                name="lema"
                maxLength={300}
                value={config.institucion.lema}
                onChange={cambiarInstitucion}
                disabled={cargando}
                placeholder="Misión Nevado · La Grita"
                className={eInput}
              />
            </div>
          </div>
          <div>
            <label className={eLabel}>Firma de los correos</label>
            <textarea
              name="firma"
              rows={2}
              maxLength={300}
              value={config.institucion.firma}
              onChange={cambiarInstitucion}
              disabled={cargando}
              placeholder="Ej.: Equipo de Misión Nevado — La Grita, Táchira"
              className={eInput + ' resize-none'}
            />
            <p className={eAyuda}>
              El nombre y el lema aparecen en el encabezado y el pie de todos los correos; la firma (opcional) se agrega al final del mensaje.
              La dirección y el teléfono de los correos se editan en Contenido Web → Contacto.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={cargando || guardando} className={eBoton}>
          <Save className="w-4 h-4" />
          {guardando ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  )
}
