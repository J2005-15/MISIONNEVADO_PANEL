import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, User, Lock, KeyRound, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Logo from '../assets/Logo.png';
import api from '../lib/api';
import { normalizarRol } from '../lib/roles';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80';

// Mismas clases de los campos y botones del formulario de ingreso
const eInput      = 'w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#765A05]/30 focus:border-[#765A05] focus:bg-white transition-all duration-300';
const eLabel      = 'block text-xs font-bold text-amber-900/60 uppercase tracking-wider pl-1';
const eIcono      = 'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#765A05]/50 pointer-events-none';
const eBoton      = 'w-full flex items-center justify-center gap-2.5 bg-[#765A05] hover:bg-[#5a4304] active:bg-[#3d2d02] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#765A05]/20 hover:shadow-xl hover:shadow-[#765A05]/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2 cursor-pointer';
const eEnlace     = 'text-sm font-bold text-[#765A05]/70 hover:text-[#765A05] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

function Aviso({ tipo, texto }) {
  if (!texto) return null;
  const exito = tipo === 'exito';
  const Icono = exito ? CheckCircle2 : AlertCircle;
  return (
    <div className={`flex gap-2.5 rounded-xl px-4 py-3 border ${exito ? 'bg-emerald-50 border-emerald-200/70' : 'bg-rose-50 border-rose-200/70'}`}>
      <Icono className={`w-4 h-4 shrink-0 mt-0.5 ${exito ? 'text-emerald-500' : 'text-rose-500'}`} />
      <p className={`text-xs font-semibold leading-snug ${exito ? 'text-emerald-700' : 'text-rose-700'}`}>{texto}</p>
    </div>
  );
}

export default function Login({ onLoginSuccess }) {
  const [USR_LOGIN, setUsrLogin] = useState('');
  const [PWD_LOGIN, setPwdLogin] = useState('');
  const [recordarSesion, setRecordarSesion] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando,    setCargando]    = useState(false);
  const [errorLogin,  setErrorLogin]  = useState('');
  const [avisoLogin,  setAvisoLogin]  = useState('');

  // ── Recuperación de contraseña: 'login' → 'solicitar' (pide código) → 'restablecer'
  const [modo,         setModo]         = useState('login');
  const [identificador, setIdentificador] = useState('');
  const [codigo,       setCodigo]       = useState('');
  const [claveNueva,   setClaveNueva]   = useState('');
  const [claveConfirm, setClaveConfirm] = useState('');
  const [aviso,        setAviso]        = useState(null);   // { tipo, texto }

  const irARecuperar = () => {
    setIdentificador(USR_LOGIN.trim());
    setAviso(null);
    setErrorLogin('');
    setModo('solicitar');
  };

  const volverAlLogin = (mensajeExito = '') => {
    if (identificador.trim()) setUsrLogin(identificador.trim());
    setPwdLogin('');
    setCodigo(''); setClaveNueva(''); setClaveConfirm('');
    setAviso(null);
    setAvisoLogin(mensajeExito);
    setModo('login');
  };

  const solicitarCodigo = async (e) => {
    e?.preventDefault();
    setAviso(null);
    setCargando(true);
    try {
      const { data } = await api.post('/auth/recuperar', { identificador: identificador.trim() });
      setAviso({ tipo: 'exito', texto: data.mensaje });
      setModo('restablecer');
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.response?.data?.mensaje || 'Error de conexión. Verifique que el servidor esté activo.' });
    } finally {
      setCargando(false);
    }
  };

  const restablecer = async (e) => {
    e.preventDefault();
    if (claveNueva.length < 8) {
      setAviso({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (claveNueva !== claveConfirm) {
      setAviso({ tipo: 'error', texto: 'La nueva contraseña y su confirmación no coinciden.' });
      return;
    }
    setAviso(null);
    setCargando(true);
    try {
      const { data } = await api.post('/auth/restablecer', {
        identificador: identificador.trim(), codigo: codigo.trim(), nueva: claveNueva,
      });
      volverAlLogin(data.mensaje);
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.response?.data?.mensaje || 'Error de conexión. Verifique que el servidor esté activo.' });
    } finally {
      setCargando(false);
    }
  };

  const manejarIngreso = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    setAvisoLogin('');
    setCargando(true);

    try {
      const { data } = await api.post('/auth/login', {
        USR_LOGIN: USR_LOGIN.trim(),
        PWD_LOGIN,
      });

      // Un rol que el panel no reconoce no tiene acceso: no se guarda la sesión
      if (!normalizarRol(data.usuario?.ROLREG_NO)) {
        setErrorLogin(`Su rol (${data.usuario?.ROLREG_NO || 'sin rol'}) no tiene acceso al panel. Comuníquese con el administrador.`);
        return;
      }

      // Persistir sesión en localStorage
      localStorage.setItem('siscvi_token',   data.token);
      localStorage.setItem('siscvi_usuario', JSON.stringify(data.usuario));

      if (onLoginSuccess) onLoginSuccess(data.usuario);
    } catch (error) {
      const mensaje = error.response?.data?.mensaje
        || 'Error de conexión. Verifique que el servidor esté activo.';
      setErrorLogin(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#FFEFD1]">

      {/* ══════════════════════════════════════════════════
          PANEL IZQUIERDO — Visual corporativo
      ══════════════════════════════════════════════════ */}
      <div
        className="hidden md:flex relative w-1/2 flex-col justify-between overflow-hidden rounded-r-[5rem] shadow-2xl z-10"
        style={{ backgroundImage: `url(${BG_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Capa de color de marca sobre la fotografía */}
        <div className="absolute inset-0 z-0 bg-[#765A05]/85 rounded-r-[5rem]" />

        {/* Contenido del panel visual */}
        <div className="relative z-10 flex flex-col h-full px-14 py-14 justify-between">

          {/* Logo institucional flotante */}
          <div className="relative z-20 flex justify-start">
            <img
              src={Logo}
              alt="Logo Misión Nevado"
              className="h-20 w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
            />
          </div>

          {/* Texto central de bienvenida */}
          <div className="space-y-6">
            <div className="w-12 h-1 bg-[#CAA750] rounded-full" />
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
              SISCVI
              <br />
              <span className="text-[#CAA750]">Sistema de</span>
              <br />
              Control
            </h1>
            <p className="text-white/80 text-base leading-relaxed max-w-sm">
              Plataforma administrativa de la Fundación Misión Nevado para
              la gestión y seguimiento institucional.
            </p>
          </div>

          {/* Pie del panel visual */}
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#FFEFD1] shrink-0" />
            <p className="text-white/60 text-xs font-semibold tracking-wider uppercase">
              Acceso restringido — Personal autorizado
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PANEL DERECHO — Formulario de autenticación
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">

        {/* Manchas decorativas de fondo */}
        <div className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full bg-[#765A05]/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full bg-[#765A05]/8 blur-[90px] pointer-events-none" />

        {/* Contenedor del formulario */}
        <div className="relative w-full max-w-md space-y-8 z-10">

          {/* Logo móvil flotante */}
          <div className="flex md:hidden justify-center mb-4">
            <img
              src={Logo}
              alt="Logo Misión Nevado"
              className="h-24 w-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Encabezado del formulario */}
          <div className="space-y-1.5 text-center">
            <h2 className="text-2xl font-extrabold text-[#765A05] tracking-tight">
              {modo === 'login' ? 'Acceso Administrativo' : 'Recuperar Contraseña'}
            </h2>
            <p className="text-sm text-amber-900/60 font-medium">
              {modo === 'login' && 'Ingrese sus credenciales de operador para continuar.'}
              {modo === 'solicitar' && 'Le enviaremos un código de 6 dígitos al correo registrado en su cuenta.'}
              {modo === 'restablecer' && 'Escriba el código que recibió y su nueva contraseña.'}
            </p>
          </div>

          {/* ── Recuperación: paso 1, pedir el código ── */}
          {modo === 'solicitar' && (
            <form onSubmit={solicitarCodigo} className="space-y-5">
              <div className="space-y-1.5">
                <label className={eLabel}>Usuario o Correo</label>
                <div className="relative">
                  <User className={eIcono} />
                  <input
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="Ingrese su usuario o correo"
                    required
                    autoFocus
                    className={eInput}
                  />
                </div>
              </div>

              <Aviso {...(aviso ?? {})} />

              <button type="submit" disabled={cargando || !identificador.trim()} className={eBoton}>
                <span className="text-sm tracking-wide">{cargando ? 'Enviando código...' : 'Enviar Código'}</span>
                {!cargando && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex justify-center">
                <button type="button" onClick={() => volverAlLogin()} className={`${eEnlace} flex items-center gap-1.5`}>
                  <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}

          {/* ── Recuperación: paso 2, código + nueva contraseña ── */}
          {modo === 'restablecer' && (
            <form onSubmit={restablecer} className="space-y-5">
              <Aviso {...(aviso ?? {})} />

              <div className="space-y-1.5">
                <label className={eLabel}>Código de Verificación</label>
                <div className="relative">
                  <KeyRound className={eIcono} />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    required
                    autoFocus
                    className={`${eInput} tracking-[0.4em] font-bold`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={eLabel}>Nueva Contraseña</label>
                <div className="relative">
                  <Lock className={eIcono} />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={claveNueva}
                    onChange={(e) => setClaveNueva(e.target.value)}
                    placeholder="Mín. 8 caracteres"
                    required
                    autoComplete="new-password"
                    className={eInput.replace('pr-4', 'pr-12')}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#765A05] transition-colors cursor-pointer"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={eLabel}>Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className={eIcono} />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={claveConfirm}
                    onChange={(e) => setClaveConfirm(e.target.value)}
                    placeholder="Repita la nueva contraseña"
                    required
                    autoComplete="new-password"
                    className={eInput}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando || codigo.length !== 6 || !claveNueva || !claveConfirm}
                className={eBoton}
              >
                <span className="text-sm tracking-wide">{cargando ? 'Guardando...' : 'Restablecer Contraseña'}</span>
                {!cargando && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex items-center justify-between px-1">
                <button type="button" onClick={() => volverAlLogin()} className={`${eEnlace} flex items-center gap-1.5`}>
                  <ArrowLeft className="w-4 h-4" /> Volver
                </button>
                <button type="button" onClick={() => solicitarCodigo()} disabled={cargando} className={eEnlace}>
                  Reenviar código
                </button>
              </div>
            </form>
          )}

          {/* Formulario de autenticación */}
          {modo === 'login' && (
          <form onSubmit={manejarIngreso} className="space-y-5">

            {/* Campo: Cédula de Operador */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-amber-900/60 uppercase tracking-wider pl-1">
                Usuario o Correo 
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#765A05]/50 pointer-events-none" />
                <input
                  type="text"
                  value={USR_LOGIN}
                  onChange={(e) => setUsrLogin(e.target.value)}
                  placeholder="Ingrese su usuario o correo"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#765A05]/30 focus:border-[#765A05] focus:bg-white transition-all duration-300"
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-amber-900/60 uppercase tracking-wider pl-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#765A05]/50 pointer-events-none" />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={PWD_LOGIN}
                  onChange={(e) => setPwdLogin(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#765A05]/30 focus:border-[#765A05] focus:bg-white transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#765A05] transition-colors cursor-pointer"
                >
                  {mostrarPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Opciones secundarias */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recordarSesion}
                  onChange={(e) => setRecordarSesion(e.target.checked)}
                  className="w-4 h-4 rounded border-amber-900/20 cursor-pointer accent-[#765A05]"
                />
                <span className="text-sm text-amber-900/60 font-medium">Recordar sesión</span>
              </label>
              <button
                type="button"
                onClick={irARecuperar}
                className="text-sm font-bold text-[#765A05]/70 hover:text-[#765A05] transition-colors cursor-pointer"
              >
                ¿Olvidó su clave?
              </button>
            </div>

            {/* Confirmación tras restablecer la contraseña */}
            <Aviso tipo="exito" texto={avisoLogin} />

            {/* Mensaje de error de autenticación */}
            {errorLogin && (
              <div className="flex gap-2.5 bg-rose-50 border border-rose-200/70 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-700 leading-snug">{errorLogin}</p>
              </div>
            )}

            {/* Botón principal de ingreso */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2.5 bg-[#765A05] hover:bg-[#5a4304] active:bg-[#3d2d02] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#765A05]/20 hover:shadow-xl hover:shadow-[#765A05]/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2 cursor-pointer"
            >
              {cargando ? (
                <span className="text-sm tracking-wide">Verificando credenciales...</span>
              ) : (
                <>
                  <span className="text-sm tracking-wide">Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          )}

          {/* Estado del sistema */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <span className="w-2 h-2 rounded-full bg-[#765A05] animate-pulse shrink-0" />
            <p className="text-xs text-amber-900/50 font-bold tracking-wide">
              Sistema operativo — Conexión segura
            </p>
          </div>
        </div>

        {/* Pie de página */}
        <p className="absolute bottom-5 left-0 right-0 px-6 text-center text-[10px] sm:text-xs text-amber-900/40 font-medium leading-snug">
          © 2026{' '}
          <span className="text-[#765A05]/60 font-bold">
            ING JULIETH ANDRADE RAMIREZ — UNEFA NUCLEO TACHIRA — SISCVI
          </span>
        </p>
      </div>
    </div>
  );
}