import { useState, useEffect } from 'react'
import {
  CircleUser, Mail, Lock, Save, Check, AlertCircle,
  Eye, EyeOff, ShieldCheck, Stethoscope, MapPin, Phone,
} from 'lucide-react'
import api from '../lib/api'

// ─── ESTILOS COMPARTIDOS (mismos que el resto del panel) ─────────────────────
const eCard  = 'bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl shadow-[#765A05]/5'
const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-400'
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5'
const eSec   = 'text-xs font-bold text-[#765A05] uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/60 pb-3'
const eBoton = 'flex items-center justify-center gap-2 py-2.5 px-5 bg-[#765A05] text-white text-sm font-bold rounded-xl hover:bg-[#5c4504] transition-all shadow-md shadow-[#765A05]/20 disabled:opacity-60 disabled:cursor-not-allowed'

// ─── APARIENCIA SEGÚN ROL ─────────────────────────────────────────────────────
const CONFIG_ROL = {
  ADMINISTRADOR: {
    etiqueta: 'Administrador',
    icono:    ShieldCheck,
    chip:     'bg-[#FFDF96]/40 text-[#765A05] border border-[#FFDF96]/60',
    avatar:   'bg-[#FFDF96]/30 border-[#FFDF96]/60',
    avatarIc: 'text-[#765A05]',
  },
  VETERINARIO: {
    etiqueta: 'Veterinario',
    icono:    Stethoscope,
    chip:     'bg-sky-100 text-sky-700 border border-sky-200',
    avatar:   'bg-sky-50 border-sky-200',
    avatarIc: 'text-sky-600',
  },
  CAMPO: {
    etiqueta: 'Personal de Campo',
    icono:    MapPin,
    chip:     'bg-emerald-100 text-emerald-700 border border-emerald-200',
    avatar:   'bg-emerald-50 border-emerald-200',
    avatarIc: 'text-emerald-600',
  },
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium mb-4 ${
      msg.tipo === 'exito'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {msg.tipo === 'exito'
        ? <Check className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg.texto}
    </div>
  )
}

// ─── INPUT CON TOGGLE DE VISIBILIDAD ─────────────────────────────────────────
function InputPassword({ name, value, visible, placeholder, label, onChange, onToggle }) {
  return (
    <div>
      <label className={eLabel}>{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={eInput + ' pr-11'}
        />
        <button type="button" onClick={onToggle} tabIndex={-1}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function PerfilOperador({ rolActivo = 'ADMINISTRADOR' }) {

  // Perfil en estado — inicia con los datos de la sesión y se completa con el backend
  const perfilInicial = (() => {
    let u = {}
    try { u = JSON.parse(localStorage.getItem('siscvi_usuario') || '{}') } catch { /* sesión vacía */ }
    return {
      nombre:   u.PERSON_NO ? `${u.PERSON_NO} ${u.PERSON_AP ?? ''}`.trim() : (u.USUARI_NO ?? '—'),
      cedula:   '—',
      email:    u.USUARI_EM ?? '',
      rol:      rolActivo,
      ingreso:  '',
      telefono: '—',
    }
  })()
  const [perfil, setPerfil] = useState(perfilInicial)

  // Cargar el perfil real del backend
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data: datos } = await api.get('/auth/perfil')
        setPerfil(prev => ({
          ...prev,
          nombre:   datos.nombre    ?? prev.nombre,
          email:    datos.email     ?? prev.email,
          cedula:   datos.PERSON_CE ?? '—',
          telefono: datos.PERSON_TL ?? '—',
          ingreso:  (datos.USUARI_FE ?? '').toString().slice(0, 10) || prev.ingreso,
        }))
        if (datos.email) setCorreoNuevo(datos.email)
        if (datos.PERSON_TL) setTelefonoNuevo(datos.PERSON_TL)
      } catch { /* se mantienen los datos de la sesión */ }
    }
    cargarPerfil()
  }, [rolActivo])

  // ── Estado formulario de correo ───────────────────────────────────────────────
  const [correoNuevo,     setCorreoNuevo]     = useState(perfilInicial.email)
  const [guardandoCorreo, setGuardandoCorreo] = useState(false)
  const [mensajeCorreo,   setMensajeCorreo]   = useState(null)

  // ── Estado formulario de teléfono ─────────────────────────────────────────────
  const [telefonoNuevo,     setTelefonoNuevo]     = useState('')
  const [guardandoTelefono, setGuardandoTelefono] = useState(false)
  const [mensajeTelefono,   setMensajeTelefono]   = useState(null)

  // ── Estado formulario de contraseña ──────────────────────────────────────────
  const [passwords,         setPasswords]         = useState({ actual: '', nueva: '', confirmar: '' })
  const [visibilidad,       setVisibilidad]       = useState({ actual: false, nueva: false, confirmar: false })
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const [mensajePassword,   setMensajePassword]   = useState(null)

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const mostrarMsg = (setter, tipo, texto) => {
    setter({ tipo, texto })
    setTimeout(() => setter(null), 5000)
  }

  const cambiarPassword = ({ target: { name, value } }) =>
    setPasswords(p => ({ ...p, [name]: value }))

  const toggleVer = (campo) =>
    setVisibilidad(p => ({ ...p, [campo]: !p[campo] }))

  // ── Actualizar correo ─────────────────────────────────────────────────────────
  const actualizarCorreo = async (e) => {
    e.preventDefault()
    if (!correoNuevo.trim()) return
    setGuardandoCorreo(true)
    try {
      await api.patch('/auth/perfil/email', { email: correoNuevo })
      setPerfil(p => ({ ...p, email: correoNuevo }))
      mostrarMsg(setMensajeCorreo, 'exito', 'Correo electrónico actualizado correctamente.')
    } catch (err) {
      mostrarMsg(setMensajeCorreo, 'error', err.response?.data?.mensaje ?? 'Sin conexión con el servidor.')
    } finally {
      setGuardandoCorreo(false)
    }
  }

  // ── Actualizar teléfono ───────────────────────────────────────────────────────
  const actualizarTelefono = async (e) => {
    e.preventDefault()
    if (!telefonoNuevo.trim()) return
    setGuardandoTelefono(true)
    try {
      const { data } = await api.patch('/auth/perfil/telefono', { telefono: telefonoNuevo.trim() })
      setPerfil(p => ({ ...p, telefono: data.PERSON_TL ?? telefonoNuevo.trim() }))
      mostrarMsg(setMensajeTelefono, 'exito', 'Teléfono de contacto actualizado correctamente.')
    } catch (err) {
      mostrarMsg(setMensajeTelefono, 'error', err.response?.data?.mensaje ?? 'Sin conexión con el servidor.')
    } finally {
      setGuardandoTelefono(false)
    }
  }

  // ── Cambiar contraseña ────────────────────────────────────────────────────────
  const cambiarContrasena = async (e) => {
    e.preventDefault()
    if (passwords.nueva.length < 8) {
      mostrarMsg(setMensajePassword, 'error', 'La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (passwords.nueva !== passwords.confirmar) {
      mostrarMsg(setMensajePassword, 'error', 'La nueva contraseña y su confirmación no coinciden.')
      return
    }
    setGuardandoPassword(true)
    try {
      await api.patch('/auth/perfil/password', { actual: passwords.actual, nueva: passwords.nueva })
      mostrarMsg(setMensajePassword, 'exito', 'Contraseña actualizada correctamente.')
      setPasswords({ actual: '', nueva: '', confirmar: '' })
    } catch (err) {
      mostrarMsg(setMensajePassword, 'error',
        err.response ? (err.response.data?.mensaje ?? 'Contraseña actual incorrecta.') : 'Sin conexión con el servidor.')
    } finally {
      setGuardandoPassword(false)
    }
  }

  const cfg        = CONFIG_ROL[rolActivo] ?? CONFIG_ROL.ADMINISTRADOR
  const IconoRol   = cfg.icono
  const fechaIngreso = new Date(perfil.ingreso + 'T00:00:00').toLocaleDateString('es-VE', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Título ── */}
      <div>
        <h2 className="text-xl font-black text-gray-900">Mi Perfil</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Información del operador activo y configuración de acceso al sistema
        </p>
      </div>

      {/* ── Tarjeta de identidad ── */}
      <div className={eCard + ' p-6'}>
        <div className="flex items-center gap-5">
          {/* Avatar coloreado por rol */}
          <div className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${cfg.avatar}`}>
            <CircleUser className={`w-9 h-9 ${cfg.avatarIc}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-gray-900 truncate">{perfil.nombre}</h3>
            <p className="text-sm text-gray-500 font-mono mt-0.5">{perfil.cedula}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* Chip de rol */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.chip}`}>
                <IconoRol className="w-3 h-3" />
                {cfg.etiqueta}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Activo desde {fechaIngreso}
              </span>
            </div>
          </div>
        </div>

        {/* Grid de contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 pt-5 border-t border-white/50">
          <div>
            <p className={eLabel}>Correo Electrónico Registrado</p>
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#765A05]/50 shrink-0" />
              {perfil.email}
            </p>
          </div>
          <div>
            <p className={eLabel}>Teléfono de Contacto</p>
            <p className="text-sm font-semibold text-gray-800">{perfil.telefono}</p>
          </div>
        </div>
      </div>

      {/* ── Actualizar correo ── */}
      <div className={eCard + ' p-6'}>
        <p className={eSec}><Mail className="w-3.5 h-3.5" /> Actualizar Correo Electrónico</p>

        <Toast msg={mensajeCorreo} />

        <form onSubmit={actualizarCorreo} className="space-y-4">
          <div>
            <label className={eLabel}>Nuevo Correo Electrónico</label>
            <input
              type="email"
              required
              value={correoNuevo}
              onChange={e => setCorreoNuevo(e.target.value)}
              placeholder="nuevo@correo.com"
              className={eInput}
            />
            <p className="text-[11px] text-gray-400 font-medium mt-1.5">
              A este correo llegará el código para recuperar su contraseña si la olvida: verifique que esté bien escrito.
            </p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={guardandoCorreo || !correoNuevo.trim()} className={eBoton}>
              <Save className="w-4 h-4" />
              {guardandoCorreo ? 'Guardando...' : 'Guardar Correo'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Actualizar teléfono ── */}
      <div className={eCard + ' p-6'}>
        <p className={eSec}><Phone className="w-3.5 h-3.5" /> Actualizar Teléfono de Contacto</p>

        <Toast msg={mensajeTelefono} />

        <form onSubmit={actualizarTelefono} className="space-y-4">
          <div>
            <label className={eLabel}>Nuevo Teléfono</label>
            <input
              type="tel"
              required
              maxLength={15}
              value={telefonoNuevo}
              onChange={e => setTelefonoNuevo(e.target.value)}
              placeholder="0414-1234567"
              className={eInput}
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={guardandoTelefono || !telefonoNuevo.trim()} className={eBoton}>
              <Save className="w-4 h-4" />
              {guardandoTelefono ? 'Guardando...' : 'Guardar Teléfono'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Seguridad: cambio de contraseña ── */}
      <div className={eCard + ' p-6'}>
        <p className={eSec}><Lock className="w-3.5 h-3.5" /> Seguridad — Cambiar Contraseña</p>

        <Toast msg={mensajePassword} />

        <form onSubmit={cambiarContrasena} className="space-y-4">
          <InputPassword
            name="actual"
            value={passwords.actual}
            visible={visibilidad.actual}
            placeholder="••••••••"
            label="Contraseña Actual *"
            onChange={cambiarPassword}
            onToggle={() => toggleVer('actual')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputPassword
              name="nueva"
              value={passwords.nueva}
              visible={visibilidad.nueva}
              placeholder="Mín. 8 caracteres"
              label="Nueva Contraseña *"
              onChange={cambiarPassword}
              onToggle={() => toggleVer('nueva')}
            />
            <InputPassword
              name="confirmar"
              value={passwords.confirmar}
              visible={visibilidad.confirmar}
              placeholder="Repetir nueva contraseña"
              label="Confirmar Contraseña *"
              onChange={cambiarPassword}
              onToggle={() => toggleVer('confirmar')}
            />
          </div>

          {/* Indicador visual de coincidencia */}
          {passwords.nueva && passwords.confirmar && (
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border ${
              passwords.nueva === passwords.confirmar
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {passwords.nueva === passwords.confirmar
                ? <><Check className="w-3.5 h-3.5" /> Las contraseñas coinciden</>
                : <><AlertCircle className="w-3.5 h-3.5" /> Las contraseñas no coinciden</>}
            </div>
          )}

          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
            Mín. 8 caracteres. Usa letras mayúsculas, minúsculas, números y símbolos para mayor seguridad.
          </p>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardandoPassword || !passwords.actual || !passwords.nueva || !passwords.confirmar}
              className={eBoton}
            >
              <Lock className="w-4 h-4" />
              {guardandoPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
