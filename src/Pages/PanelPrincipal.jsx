import React, { useState, useRef, useEffect } from 'react';
import api from '../lib/api';
import {
  LayoutDashboard,
  PawPrint,
  Stethoscope,
  FileText,
  Boxes,
  Heart,
  ClipboardList,
  HandHeart,
  Bell,
  CircleUser,
  Calendar,
  MapPin,
  Activity,
  AlertTriangle,
  Package,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle,
  Users,
  TrendingUp,
  FlaskConical,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Menu,
  X,
} from 'lucide-react';

import CensoAnimal from './CensoAnimal';
import RegistrosCenso from './RegistrosCenso';
import RegistroPropietario from './RegistroPropietario';
import FichaPaciente from './FichaPaciente';
import AdopcionesAdmin from './AdopcionesAdmin';
import CarteleraAdopcion from './CarteleraAdopcion';
import SolicitudesAdopcion from './SolicitudesAdopcion';
import ControlColaboraciones from './ControlColaboraciones';
import GestionProteccionistas from './GestionProteccionistas';
import GestionVoluntarios from './GestionVoluntarios';
import ConsultaMedica from './ConsultaMedica';
import GestionDenuncias from './GestionDenuncias';
import LogisticaInventario from './LogisticaInventario';
import BitacoraAuditoria from './BitacoraAuditoria';
import GestionUsuarios from './GestionUsuarios';
import GestionJornadas from './GestionJornadas';
import DashboardOperador from './DashboardOperador';
import GestionWeb from './GestionWeb';
import PerfilOperador from './PerfilOperador';
import ConfiguracionSistema from './ConfiguracionSistema';
import CentroNotificaciones from './CentroNotificaciones';
import { normalizarRol } from '../lib/roles';
import Logo from '../assets/Logo.png';
import { cn } from "@/lib/utils";

// ─── LAYOUT RAÍZ ────────────────────────────────────────────────────────────

export default function PanelPrincipal({ onLogout, rolInicial }) {
  const [vistaActual, setVistaActual] = useState('inicio');
  // RutaPrivada ya garantiza un rol reconocido; 'CAMPO' es solo resguardo
  const _normRol = normalizarRol(rolInicial) ?? 'CAMPO'
  const [rolActivo, setRolActivo] = useState(_normRol);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  // Al cambiar de rol volvemos siempre al dashboard de ese perfil
  useEffect(() => {
    setVistaActual('inicio');
  }, [rolActivo]);

  const [personaParaCenso, setPersonaParaCenso] = useState(null);
  const [censoParaEditar, setCensoParaEditar] = useState(null);   // registro abierto con "Editar"

  // Pestaña con la que abre el módulo de Adopciones (las notificaciones de
  // solicitudes llevan directo a "Gestión de Solicitudes"). `n` fuerza a
  // reabrir el módulo aunque ya esté en pantalla.
  const [tabAdopciones, setTabAdopciones] = useState({ tab: 'registro', n: 0 });
  const irAVista = (vista, tab = 'registro') => {
    setTabAdopciones(p => ({ tab, n: p.n + 1 }));
    setVistaActual(vista);
  };
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [pacienteParaConsulta, setPacienteParaConsulta] = useState(null);

  const [registrosCenso, setRegistrosCenso] = useState([]);
  const [datosDashboard, setDatosDashboard] = useState({
    totalCenso: '0',
    colaboraciones: '0',
    denuncias: '0',
    usuarios: '0'
  });

  useEffect(() => {
    const cargarDatosReales = async () => {
      let censoData = [];
      let colabData = [];
      let denuncData = [];
      let usuariosData = [];

      try {
        const res = await api.get('/censo');
        censoData = res.data.registros || [];
        setRegistrosCenso(censoData);
      } catch (error) {
        console.error("Error obteniendo datos de censo:", error);
      }

      try {
        const res = await api.get('/colaboraciones');
        colabData = res.data.registros || [];
      } catch (error) {
        console.error("Error obteniendo datos de colaboraciones:", error);
      }

      try {
        const res = await api.get('/denuncias');
        denuncData = res.data.registros || [];
      } catch (error) {
        console.error("Error obteniendo datos de denuncias:", error);
      }

      try {
        const res = await api.get('/usuarios');
        usuariosData = res.data.registros || [];
      } catch {
        // Solo el Administrador puede listar usuarios (los demás roles reciben 403)
      }

      setDatosDashboard({
        totalCenso: censoData.length.toString(),
        colaboraciones: colabData.length.toString(),
        denuncias: denuncData.length.toString(),
        usuarios: usuariosData.length.toString()
      });
    };
    cargarDatosReales();
  }, []);

  return (
    <div className={cn('relative', 'flex', 'h-screen', 'overflow-hidden', 'bg-[#FFFBF0]', 'font-sans', 'print:block', 'print:h-auto', 'print:overflow-visible')}>

      {/* Blobs decorativos */}
      <div className={cn('absolute', '-top-40', '-left-20', 'w-[560px]', 'h-[560px]', 'rounded-full', 'bg-[#FFDF96]/25', 'blur-[110px]', 'pointer-events-none', 'z-0')} />
      <div className={cn('absolute', '-bottom-44', '-right-20', 'w-[480px]', 'h-[480px]', 'rounded-full', 'bg-[#FFDF96]/20', 'blur-[100px]', 'pointer-events-none', 'z-0')} />
      <div className={cn('absolute', 'top-[35%]', 'right-[25%]', 'w-[340px]', 'h-[340px]', 'rounded-full', 'bg-[#765A05]/6', 'blur-[85px]', 'pointer-events-none', 'z-0')} />
      <div className={cn('absolute', 'top-[5%]', 'right-[8%]', 'w-[220px]', 'h-[220px]', 'rounded-full', 'bg-[#FFDF96]/15', 'blur-[65px]', 'pointer-events-none', 'z-0')} />

      {/* Overlay oscuro móvil — cierra el sidebar al tocar fuera */}
      {sidebarAbierto && (
        <div
          className={cn('fixed', 'inset-0', 'z-20', 'bg-black/50', 'md:hidden')}
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      <BarraLateral
        setVistaActual={irAVista}
        vistaActual={vistaActual}
        onLogout={onLogout}
        rolActivo={rolActivo}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
      />

      <div className={cn('relative', 'flex', 'flex-col', 'flex-1', 'overflow-hidden', 'z-10', 'print:overflow-visible')}>
        <Encabezado
          vistaActual={vistaActual}
          rolActivo={rolActivo}
          setRolActivo={setRolActivo}
          setVistaActual={irAVista}
          onNavegar={irAVista}
          setSidebarAbierto={setSidebarAbierto}
        />

        <main className={cn('flex-1', 'overflow-y-auto', 'p-3', 'md:p-8')}>
          <div className={cn('max-w-6xl', 'mx-auto', 'space-y-8')}>

            {/* Dashboard condicional por rol */}
            {vistaActual === 'inicio' && rolActivo === 'ADMINISTRADOR' && (
              <ResumenAdministrador setVistaActual={setVistaActual} datos={datosDashboard} />
            )}
            {vistaActual === 'inicio' && rolActivo === 'VETERINARIO' && (
              <ResumenVeterinario setVistaActual={setVistaActual} />
            )}
            {vistaActual === 'inicio' && (rolActivo === 'CAMPO' || rolActivo === 'OPERADOR') && (
              <DashboardOperador setVistaActual={setVistaActual} />
            )}

            {vistaActual === 'censo' && (
              <RegistrosCenso
                setVistaActual={setVistaActual}
                registros={registrosCenso}
                rolActivo={rolActivo}
                onVerFicha={(r) => {
                  setPacienteSeleccionado(r);
                  setVistaActual('ficha-paciente');
                }}
                onEditar={(r) => {
                  setPersonaParaCenso(null);
                  setCensoParaEditar(r);
                  setVistaActual('censo-formulario');
                }}
              />
            )}
            {vistaActual === 'ficha-paciente' && pacienteSeleccionado && (
              <FichaPaciente
                registroCenso={pacienteSeleccionado}
                onNuevaConsulta={() => {
                  setPacienteParaConsulta(pacienteSeleccionado);
                  setVistaActual('medica');
                }}
                onVolver={() => setVistaActual('censo')}
              />
            )}
            {vistaActual === 'propietario' && (
              <RegistroPropietario
                setVistaActual={setVistaActual}
                onPersonaSeleccionada={(persona) => {
                  setCensoParaEditar(null);
                  setPersonaParaCenso(persona);
                  setVistaActual('censo-formulario');
                }}
              />
            )}
            {vistaActual === 'censo-formulario' && (
              <CensoAnimal
                setVistaActual={(vista) => { setCensoParaEditar(null); setVistaActual(vista); }}
                propietarioData={personaParaCenso}
                registroInicial={censoParaEditar}
                rolActivo={rolActivo}
                onGuardar={(nuevoRegistro) => {
                  setRegistrosCenso([...registrosCenso, nuevoRegistro]);
                  setPersonaParaCenso(null);
                  setCensoParaEditar(null);
                  setVistaActual('censo');
                }}
              />
            )}

            {vistaActual === 'cartelera' && (
              <AdopcionesAdmin key={`adopciones-${tabAdopciones.n}`} rolActivo={rolActivo} tabInicial={tabAdopciones.tab} />
            )}
            {vistaActual === 'solicitudes' && <SolicitudesAdopcion />}
            {vistaActual === 'colaboraciones' && <ControlColaboraciones rolActivo={rolActivo} />}
            {vistaActual === 'proteccionistas' && <GestionProteccionistas rolActivo={rolActivo} />}
            {vistaActual === 'voluntarios' && <GestionVoluntarios rolActivo={rolActivo} />}
            {vistaActual === 'medica' && (
              <ConsultaMedica
                rolActivo={rolActivo}
                pacientePreseleccionado={pacienteParaConsulta}
                veterinarioActual={(() => {
                  if (rolActivo !== 'VETERINARIO') return null
                  try {
                    const s = JSON.parse(localStorage.getItem('siscvi_usuario') || '{}')
                    return {
                      USUARI_NO: s.USUARI_NO ?? 'veterinario',
                      nombre: [s.PERSON_NO, s.PERSON_AP].filter(Boolean).join(' ') || s.USUARI_NO || 'Veterinario',
                      USUARI_ID: s.USUARI_ID,
                    }
                  } catch { return { USUARI_NO: 'veterinario', nombre: 'Veterinario', USUARI_ID: null } }
                })()}
              />
            )}
            {vistaActual === 'denuncias' && <GestionDenuncias rolActivo={rolActivo} />}
            {vistaActual === 'logistica' && <LogisticaInventario rolActivo={rolActivo} />}
            {vistaActual === 'jornadas' && <GestionJornadas rolActivo={rolActivo} />}
            {vistaActual === 'usuarios' && <GestionUsuarios />}
            {vistaActual === 'bitacora' && <BitacoraAuditoria />}
            {vistaActual === 'contenido-web' && <GestionWeb rolActivo={rolActivo} />}

            {vistaActual === 'mi-perfil' && <PerfilOperador rolActivo={rolActivo} />}
            {vistaActual === 'configuracion' && <ConfiguracionSistema rolActivo={rolActivo} />}
            {vistaActual === 'notificaciones' && <CentroNotificaciones rolActivo={rolActivo} onNavegar={irAVista} />}
            {vistaActual === 'soporte' && <SoporteTecnico />}

            {vistaActual === 'formulario-mascota' && (
              <PlaceholderFormulario tipo="Registro de Mascota en Adopción" icono={Heart} setVistaActual={setVistaActual} retorno="cartelera" />
            )}
            {vistaActual === 'formulario-consulta' && (
              <PlaceholderFormulario tipo="Registro de Nueva Consulta Veterinaria" icono={Stethoscope} setVistaActual={setVistaActual} retorno="medica" />
            )}
            {vistaActual === 'formulario-denuncia' && (
              <PlaceholderFormulario tipo="Registro de Denuncia o Rescate Animal" icono={AlertTriangle} setVistaActual={setVistaActual} retorno="denuncias" />
            )}
            {vistaActual === 'formulario-insumos' && (
              <PlaceholderFormulario tipo="Entrada de Insumos Médicos al Almacén" icono={Package} setVistaActual={setVistaActual} retorno="logistica" />
            )}

          </div>

          {/* Créditos (mismo estilo del pie del login) */}
          <p className="max-w-6xl mx-auto mt-10 pb-1 text-center text-[10px] sm:text-xs text-amber-900/40 font-medium leading-snug print:hidden">
            © 2026{' '}
            <span className="text-[#765A05]/60 font-bold">
              ING JULIETH ANDRADE RAMIREZ — UNEFA NUCLEO TACHIRA — SISCVI
            </span>
          </p>
        </main>
      </div>
    </div>
  );
}

// ─── BARRA LATERAL ───────────────────────────────────────────────────────────

function BarraLateral({ setVistaActual, vistaActual, onLogout, rolActivo, sidebarAbierto, setSidebarAbierto }) {
  // Alias de rol para estandarización solicitada
  const userRole = (rolActivo === 'CAMPO' || rolActivo === 'OPERADOR') ? 'OPERADOR' : rolActivo === 'ADMINISTRADOR' ? 'ADMIN' : rolActivo === 'VETERINARIO' ? 'VETERINARIO' : 'ADMIN';

  // Helper para verificar visibilidad según el rol
  const esVisible = (rolesPermitidos) => rolesPermitidos.includes(userRole) || rolesPermitidos.includes('TODOS');

  const modulosNavegacion = [
    {
      grupo: 'Inicio',
      opciones: [
        { id: 'inicio', icono: LayoutDashboard, etiqueta: 'Panel Principal', rolesPermitidos: ['TODOS'] }
      ]
    },
    {
      grupo: 'Gestión Web',
      opciones: [
        { id: 'cartelera', icono: Heart, etiqueta: 'Adopciones', rolesPermitidos: ['ADMIN', 'OPERADOR'] },
        { id: 'jornadas', icono: Calendar, etiqueta: 'Jornadas Programadas', rolesPermitidos: ['TODOS'] },
        { id: 'denuncias', icono: FileText, etiqueta: 'Recepción de Denuncias', rolesPermitidos: ['ADMIN', 'OPERADOR'] },
      ],
    },
    {
      grupo: 'Control Administrativo',
      opciones: [
        { id: 'colaboraciones', icono: HandHeart, etiqueta: 'Colaboraciones', rolesPermitidos: ['ADMIN', 'OPERADOR'] },
        { id: 'logistica', icono: Boxes, etiqueta: 'Logística e Insumos', rolesPermitidos: ['ADMIN', 'VETERINARIO'] },
        { id: 'proteccionistas', icono: ShieldCheck, etiqueta: 'Proteccionistas', rolesPermitidos: ['ADMIN', 'OPERADOR'] },
        { id: 'voluntarios', icono: UserPlus, etiqueta: 'Voluntarios', rolesPermitidos: ['ADMIN', 'OPERADOR'] },
        { id: 'censo', icono: PawPrint, etiqueta: 'Censo Animal', rolesPermitidos: ['TODOS'] },
      ],
    },
    {
      grupo: 'Atención Clínica',
      opciones: [
        { id: 'medica', icono: Stethoscope, etiqueta: 'Historias Clínicas', rolesPermitidos: ['ADMIN', 'VETERINARIO'] },
      ],
    },
    {
      grupo: 'Gestión de Control',
      opciones: [
        { id: 'bitacora', icono: Activity, etiqueta: 'Bitácora de Auditoría', rolesPermitidos: ['ADMIN'] },
        { id: 'usuarios', icono: Settings, etiqueta: 'Configuración de Roles', rolesPermitidos: ['ADMIN'] },
        { id: 'contenido-web', icono: LayoutDashboard, etiqueta: 'Gestión de Contenido Web', rolesPermitidos: ['ADMIN'] },
      ],
    },
  ];

  const esActivo = (id) =>
    vistaActual === id ||
    (id === 'censo' && (vistaActual === 'censo-formulario' || vistaActual === 'propietario' || vistaActual === 'ficha-paciente')) ||
    (id === 'medica' && vistaActual === 'formulario-consulta') ||
    (id === 'denuncias' && vistaActual === 'formulario-denuncia') ||
    (id === 'logistica' && vistaActual === 'formulario-insumos');

  const EnlaceNav = ({ id, icono: Icono, etiqueta }) => (
    <li>
      <button
        onClick={() => { setVistaActual(id); setSidebarAbierto(false); }}
        className={`w-full flex items-center justify-between pl-2.5 pr-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left border-l-2 ${esActivo(id)
          ? 'bg-[#FFDF96]/15 text-white font-semibold border-[#FFDF96]'
          : 'text-white/60 hover:bg-white/10 hover:text-white/90 border-transparent'
          }`}
      >
        <div className={cn('flex', 'items-center', 'gap-3')}>
          <Icono className={`w-4 h-4 shrink-0 transition-colors ${esActivo(id) ? 'text-[#FFDF96]' : 'text-white/55'}`} />
          <span>{etiqueta}</span>
        </div>
        {esActivo(id) && <ChevronRight className={cn('w-3.5', 'h-3.5', 'text-[#FFDF96]/70', 'shrink-0')} />}
      </button>
    </li>
  );

  return (
    <aside className={`
      fixed md:relative inset-y-0 left-0
      z-30 md:z-20
      w-64 flex flex-col shrink-0
      bg-[#765A05] shadow-2xl shadow-[#765A05]/40
      transform transition-transform duration-300 ease-in-out
      ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      print:hidden
    `}>

      <div className={cn('absolute', 'top-0', 'left-0', 'right-0', 'h-28', 'bg-gradient-to-b', 'from-white/10', 'to-transparent', 'pointer-events-none')} />

      {/* Identidad institucional */}
      <div className={cn('relative', 'px-5', 'pt-5', 'pb-4', 'border-b', 'border-white/10', 'flex', 'flex-col', 'items-center')}>
        {/* Botón cerrar — solo en móvil */}
        <button
          onClick={() => setSidebarAbierto(false)}
          className={cn('md:hidden', 'absolute', 'top-3', 'right-3', 'w-7', 'h-7', 'rounded-lg', 'bg-white/10', 'flex', 'items-center', 'justify-center', 'text-white/60', 'hover:text-white', 'hover:bg-white/20', 'transition-all')}
          aria-label="Cerrar menú"
        >
          <X className={cn('w-4', 'h-4')} />
        </button>
        <img src={Logo} alt="Logo Misión Nevado" className={cn('h-14', 'w-auto', 'object-contain', 'drop-shadow-lg')} />
        <div className={cn('mt-2.5', 'text-center')}>
          <span className={cn('text-lg', 'font-bold', 'text-[#FFDF96]', 'tracking-[0.22em]', 'uppercase')}>SISVIC</span>
          <p className={cn('text-[9px]', 'text-[#FFDF96]/50', 'uppercase', 'tracking-[0.18em]', 'mt-0.5')}>Sistema de Control</p>
        </div>

        {/* Chip de rol activo */}
        <div className={`mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rolActivo === 'ADMINISTRADOR'
          ? 'bg-[#FFDF96]/20 text-[#FFDF96] border border-[#FFDF96]/30'
          : rolActivo === 'VETERINARIO'
            ? 'bg-sky-400/20 text-sky-200 border border-sky-400/30'
            : 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
          }`}>
          <ShieldCheck className={cn('w-3', 'h-3', 'shrink-0')} />
          {userRole === 'ADMIN' ? 'Administrador' : userRole === 'VETERINARIO' ? 'Veterinario' : 'Personal de Campo'}
        </div>
      </div>

      {/* Navegación modular */}
      <div className={cn('relative', 'flex-1', 'overflow-y-auto', 'px-3', 'py-4', 'space-y-5', '[&::-webkit-scrollbar]:hidden', '[scrollbar-width:none]', '[-ms-overflow-style:none]')}>
        {modulosNavegacion.map((modulo, indice) => {
          const opcionesVisibles = modulo.opciones.filter(opcion => esVisible(opcion.rolesPermitidos));

          if (opcionesVisibles.length === 0) return null;

          return (
            <nav key={indice}>
              <p className={cn('text-[9px]', 'font-bold', 'text-[#FFDF96]/40', 'uppercase', 'tracking-[0.22em]', 'px-3', 'mb-2.5')}>
                {modulo.grupo}
              </p>
              <ul className="space-y-0.5">
                {opcionesVisibles.map((opcion) => (
                  <EnlaceNav key={opcion.id} {...opcion} />
                ))}
              </ul>
            </nav>
          );
        })}
      </div>

      {/* Pie: Cerrar Sesión + Estado */}
      <div className={cn('relative', 'px-3', 'pb-4', 'space-y-2.5')}>
        <button
          onClick={onLogout}
          className={cn('group', 'w-full', 'flex', 'items-center', 'gap-3', 'px-3.5', 'py-2.5', 'rounded-xl', 'text-sm', 'text-white/60', 'hover:bg-white/10', 'hover:text-[#FFDF96]', 'transition-all', 'duration-200', 'border', 'border-white/10', 'hover:border-[#FFDF96]/25')}
        >
          <LogOut className={cn('w-4', 'h-4', 'shrink-0', 'transition-colors', 'group-hover:text-[#FFDF96]')} />
          <span>Cerrar Sesión</span>
        </button>

        <div className={cn('bg-white/8', 'rounded-xl', 'px-3.5', 'py-3', 'border', 'border-white/10')}>
          <p className={cn('text-xs', 'font-semibold', 'text-white/75')}>Estado del Entorno</p>
          <div className={cn('flex', 'items-center', 'gap-2', 'mt-1.5')}>
            <span className={cn('w-2', 'h-2', 'rounded-full', 'bg-[#FFDF96]', 'animate-pulse', 'shrink-0')} />
            <p className={cn('text-xs', 'text-[#FFDF96]/80', 'font-medium')}>Conexión Neon Estable</p>
          </div>
        </div>
      </div>

    </aside>
  );
}

// ─── ENCABEZADO ──────────────────────────────────────────────────────────────

function Encabezado({ vistaActual, rolActivo, setRolActivo, setVistaActual, onNavegar, setSidebarAbierto }) {
  // Lee el usuario autenticado desde el token guardado en sesión
  const usuarioSesion = (() => {
    try { return JSON.parse(localStorage.getItem('siscvi_usuario') || '{}') } catch { return {} }
  })()
  const identificadorUsuario = usuarioSesion.USUARI_NO || usuarioSesion.PERSON_CE || 'Operador'

  const titulos = {
    inicio: rolActivo === 'VETERINARIO' ? 'Panel Operativo Veterinario' : (rolActivo === 'CAMPO' || rolActivo === 'OPERADOR') ? 'Panel de Operaciones — Personal de Campo' : 'Resumen Logístico — Panel Directivo',
    censo: 'Censo de Población Animal',
    'censo-formulario': 'Formulario de Registro — Censo',
    cartelera: 'Módulo de Adopciones',
    solicitudes: 'Auditoría de Solicitudes Recibidas',
    colaboraciones: 'Módulo de Colaboraciones',
    proteccionistas: 'Registro de Proteccionistas',
    voluntarios: 'Registro de Voluntarios',
    medica: rolActivo === 'ADMINISTRADOR' ? 'Historial Clínico — Supervisión' : 'Módulo de Consulta Médica',
    jornadas: 'Módulo de Jornadas Veterinarias',
    denuncias: 'Módulo de Gestión de Denuncias',
    logistica: 'Módulo de Logística e Insumos Médicos',
    usuarios: 'Gestión de Usuarios y Control Web',
    bitacora: 'Bitácora del Sistema — Auditoría',
    'formulario-mascota': 'Formulario — Registro de Mascota',
    'formulario-consulta': 'Formulario — Nueva Consulta Veterinaria',
    'formulario-denuncia': 'Formulario — Registro de Denuncia',
    'formulario-insumos': 'Formulario — Entrada de Insumos Médicos',
    'propietario': 'Registro de Propietario — Pre-Censo',
    'ficha-paciente': 'Ficha del Paciente',
    'mi-perfil': 'Mi Perfil — Operador Activo',
    configuracion: 'Configuración del Sistema',
    notificaciones: 'Centro de Notificaciones',
    'soporte': 'Soporte Técnico — Sistema SISCVI',
  };

  // Notificaciones reales: solicitudes pendientes, stock bajo y consultas pendientes
  const [alertas, setAlertas] = useState([]);
  // Se consulta al entrar a cada módulo y cada 30 s, así se ven al instante sin recargar
  useEffect(() => {
    const cargarAlertas = () => {
      const vacio = { data: { registros: [] } };
      Promise.all([
        api.get('/adopciones/solicitudes').catch(() => vacio),
        api.get('/inventario').catch(() => vacio),
        api.get('/veterinaria').catch(() => vacio),
      ]).then(([rSol, rInv, rVet]) => {
        // destino: vista a la que lleva el clic · roles: mismos permisos del menú lateral
        const nuevas = [];
        const pendientes = (rSol.data.registros ?? []).filter(s => s.solic_es === 'PENDIENTE');
        if (pendientes.length) {
          nuevas.push({
            id: 'sol', destino: 'cartelera', tab: 'solicitudes', roles: ['ADMINISTRADOR', 'CAMPO', 'OPERADOR'],
            icono: Heart, color: 'bg-rose-100 text-rose-500',
            titulo: pendientes.length === 1 ? 'Nueva solicitud de adopción recibida' : `${pendientes.length} solicitudes de adopción pendientes`,
            descripcion: `${pendientes[0].solic_no} solicitó adoptar a "${pendientes[0].mascota_no ?? '—'}"`
          });
        }
        const bajos = (rInv.data.registros ?? []).filter(i => Number(i.insumo_sm) > 0 && Number(i.insumo_ex) < Number(i.insumo_sm));
        if (bajos.length) {
          nuevas.push({
            id: 'inv', destino: 'logistica', roles: ['ADMINISTRADOR', 'VETERINARIO'],
            icono: AlertTriangle, color: 'bg-amber-100 text-amber-600',
            titulo: 'Alerta de insumos médicos — Stock crítico',
            descripcion: bajos.length === 1 ? `${bajos[0].insumo_no} por debajo del umbral mínimo` : `${bajos[0].insumo_no} y ${bajos.length - 1} insumo(s) más por debajo del umbral mínimo`
          });
        }
        const consultasPend = (rVet.data.registros ?? []).filter(c => c.consul_es === 'Pendiente');
        if (consultasPend.length) {
          nuevas.push({
            id: 'vet', destino: 'medica', roles: ['ADMINISTRADOR', 'VETERINARIO'],
            icono: Stethoscope, color: 'bg-sky-100 text-sky-500',
            titulo: 'Consulta veterinaria pendiente de revisión',
            descripcion: `Paciente "${consultasPend[0].nom_anima}" — cita del ${String(consultasPend[0].consul_fe ?? '').slice(0, 10)} sin cerrar`
          });
        }
        setAlertas(nuevas.filter(a => a.roles.includes(rolActivo)));
      });
    };
    cargarAlertas();
    const intervalo = setInterval(cargarAlertas, 30000);
    return () => clearInterval(intervalo);
  }, [rolActivo, vistaActual]);

  const opcionesUsuario = [
    { etiqueta: 'Mi Perfil', icono: CircleUser, vista: 'mi-perfil' },
    { etiqueta: 'Configuración del Sistema', icono: Settings, vista: 'configuracion', soloAdmin: true },
    { etiqueta: 'Soporte Técnico', icono: HelpCircle, vista: 'soporte' },
  ].filter(o => !o.soloAdmin || rolActivo === 'ADMINISTRADOR');

  const [menuNotificacionesOpen, setMenuNotificacionesOpen] = useState(false);
  const [menuUsuarioOpen, setMenuUsuarioOpen] = useState(false);
  const refNotificaciones = useRef(null);
  const refUsuario = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (refNotificaciones.current && !refNotificaciones.current.contains(e.target))
        setMenuNotificacionesOpen(false);
      if (refUsuario.current && !refUsuario.current.contains(e.target))
        setMenuUsuarioOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleNotificaciones = () => { setMenuNotificacionesOpen((v) => !v); setMenuUsuarioOpen(false); };
  const toggleUsuario = () => { setMenuUsuarioOpen((v) => !v); setMenuNotificacionesOpen(false); };

  return (
    <header className={cn('relative', 'shrink-0', 'z-10', 'bg-white/60', 'backdrop-blur-lg', 'border-b', 'border-white/40', 'px-4', 'md:px-8', 'py-3', 'md:py-4', 'flex', 'items-center', 'justify-between', 'gap-3', 'shadow-sm', 'shadow-[#765A05]/5', 'print:hidden')}>

      {/* Botón hamburguesa — solo móvil */}
      <button
        onClick={() => setSidebarAbierto(v => !v)}
        className={cn('md:hidden', 'p-2', 'rounded-xl', 'text-gray-500', 'hover:bg-white/60', 'hover:text-gray-700', 'transition-all', 'border', 'border-white/50', 'bg-white/40', 'backdrop-blur-sm', 'shadow-sm', 'shrink-0')}
        aria-label="Abrir menú"
      >
        <Menu className={cn('w-5', 'h-5')} />
      </button>

      {/* Título dinámico */}
      <div className={cn('flex', 'items-center', 'gap-2', 'md:gap-3', 'min-w-0', 'flex-1')}>
        <div className={cn('w-2.5', 'h-2.5', 'rounded-full', 'bg-[#765A05]', 'shadow-sm', 'shadow-[#765A05]/60', 'shrink-0')} />
        <h1 className={cn('text-sm', 'md:text-base', 'font-bold', 'text-gray-800', 'tracking-tight', 'truncate')}>
          {titulos[vistaActual] ?? 'Panel Administrativo'}
        </h1>
      </div>

      <div className={cn('flex', 'items-center', 'gap-2', 'md:gap-3', 'shrink-0')}>

        {/* ── Campana de Notificaciones ─────────────────────────── */}
        <div ref={refNotificaciones} className="relative">
          <button
            onClick={toggleNotificaciones}
            className={cn('relative', 'w-9', 'h-9', 'flex', 'items-center', 'justify-center', 'rounded-xl', 'bg-white/60', 'border', 'border-white/50', 'text-gray-500', 'hover:bg-white/90', 'hover:text-gray-700', 'transition-all', 'backdrop-blur-sm', 'shadow-sm')}
          >
            <Bell className={cn('w-4', 'h-4')} />
            {alertas.length > 0 && (
              <span className={cn('absolute', 'top-1.5', 'right-1.5', 'w-2', 'h-2', 'bg-orange-500', 'rounded-full', 'border', 'border-white', 'shadow-sm')} />
            )}
          </button>

          {menuNotificacionesOpen && (
            <div className={cn('absolute', 'right-0', 'top-full', 'mt-2', 'w-80', 'bg-white/90', 'backdrop-blur-md', 'border', 'border-[#765A05]/10', 'rounded-2xl', 'shadow-xl', 'shadow-[#765A05]/10', 'z-50', 'overflow-hidden')}>
              <div className={cn('px-4', 'py-3', 'border-b', 'border-[#765A05]/10', 'flex', 'items-center', 'justify-between')}>
                <h3 className={cn('text-sm', 'font-bold', 'text-[#765A05]')}>Notificaciones</h3>
                <span className={cn('text-xs', 'font-semibold', 'text-amber-900/50', 'bg-[#FFDF96]/40', 'px-2', 'py-0.5', 'rounded-full')}>{alertas.length} pendientes</span>
              </div>
              <ul className={cn('divide-y', 'divide-[#765A05]/8')}>
                {alertas.map(({ id, destino, tab, icono: Icono, color, titulo, descripcion }) => (
                  <li key={id}
                    onClick={() => { onNavegar(destino, tab); setMenuNotificacionesOpen(false); }}
                    className={cn('px-4', 'py-3', 'hover:bg-[#FFDF96]/20', 'transition-colors', 'cursor-pointer', 'flex', 'items-start', 'gap-3')}>
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icono className={cn('w-3.5', 'h-3.5')} />
                    </div>
                    <div className="min-w-0">
                      <p className={cn('text-xs', 'font-semibold', 'text-gray-800', 'leading-snug')}>{titulo}</p>
                      <p className={cn('text-xs', 'text-gray-500', 'mt-0.5', 'leading-snug')}>{descripcion}</p>
                    </div>
                  </li>
                ))}
                {alertas.length === 0 && (
                  <li className={cn('px-4', 'py-6', 'text-center', 'text-xs', 'text-gray-400')}>No hay notificaciones pendientes</li>
                )}
              </ul>
              <div className={cn('px-4', 'py-2.5', 'border-t', 'border-[#765A05]/10', 'text-center')}>
                <button
                  onClick={() => { onNavegar('notificaciones'); setMenuNotificacionesOpen(false); }}
                  className={cn('text-xs', 'font-semibold', 'text-[#765A05]', 'hover:text-[#5a4304]', 'transition-colors')}>
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Perfil de Operador ────────────────────────────────── */}
        <div ref={refUsuario} className="relative">
          <button
            onClick={toggleUsuario}
            className={cn('flex', 'items-center', 'gap-2.5', 'bg-white/60', 'border', 'border-white/50', 'rounded-xl', 'px-3.5', 'py-1.5', 'backdrop-blur-sm', 'shadow-sm', 'hover:bg-white/90', 'transition-all')}
          >
            <CircleUser className={cn('w-4', 'h-4', 'text-[#765A05]/60')} />
            <span className={cn('hidden', 'sm:inline', 'text-xs', 'text-gray-700', 'font-semibold', 'tracking-wide')}>{identificadorUsuario}</span>
          </button>

          {menuUsuarioOpen && (
            <div className={cn('absolute', 'right-0', 'top-full', 'mt-2', 'w-56', 'bg-white/90', 'backdrop-blur-md', 'border', 'border-[#765A05]/10', 'rounded-2xl', 'shadow-xl', 'shadow-[#765A05]/10', 'z-50', 'overflow-hidden')}>
              <div className={cn('px-4', 'py-3', 'border-b', 'border-[#765A05]/10')}>
                <p className={cn('text-xs', 'font-bold', 'text-gray-800')}>Operador Activo</p>
                <p className={cn('text-xs', 'text-amber-900/50', 'mt-0.5')}>{usuarioSesion.USUARI_EM || identificadorUsuario}</p>
              </div>
              <ul className="py-1.5">
                {opcionesUsuario.map(({ etiqueta, icono: Icono, vista }) => (
                  <li key={etiqueta}>
                    <button
                      onClick={() => { setVistaActual(vista); setMenuUsuarioOpen(false); }}
                      className={cn('w-full', 'flex', 'items-center', 'gap-3', 'px-4', 'py-2.5', 'text-xs', 'text-gray-700', 'hover:bg-[#FFDF96]/30', 'hover:text-[#765A05]', 'transition-colors')}>
                      <Icono className={cn('w-3.5', 'h-3.5', 'text-[#765A05]/50', 'shrink-0')} />
                      {etiqueta}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

// ─── DASHBOARD: PERFIL ADMINISTRADOR ─────────────────────────────────────────

function ResumenAdministrador({ setVistaActual, datos }) {

  const indicadores = [
    { id: 'censo', titulo: 'Total Censados', valor: datos?.totalCenso || '0', icono: PawPrint, iconoBg: 'bg-[#765A05]/10', iconoColor: 'text-[#765A05]', sombra: 'shadow-[#765A05]/10' },
    { id: 'colaboraciones', titulo: 'Aportes Recibidos', valor: datos?.colaboraciones || '0', icono: HandHeart, iconoBg: 'bg-emerald-100', iconoColor: 'text-emerald-600', sombra: 'shadow-emerald-300/15' },
    { id: 'denuncias', titulo: 'Denuncias Registradas', valor: datos?.denuncias || '0', icono: AlertTriangle, iconoBg: 'bg-orange-100', iconoColor: 'text-orange-600', sombra: 'shadow-orange-300/15' },
    { id: 'usuarios', titulo: 'Personal Activo', valor: datos?.usuarios || '0', icono: Users, iconoBg: 'bg-[#765A05]/10', iconoColor: 'text-[#765A05]', sombra: 'shadow-[#765A05]/10' },
  ];

  // Widgets alimentados con datos reales: inventario, colaboraciones, usuarios y voluntarios
  const [alertasStock, setAlertasStock] = useState([]);
  const [colaboracionesRecientes, setColaboracionesRecientes] = useState([]);
  const [resumenColab, setResumenColab] = useState({ etiqueta: '', total: '$0', donantes: 0 });
  const [personalAsignado, setPersonalAsignado] = useState([]);
  const totalActivos = personalAsignado.filter(p => p.estado === 'Activo').length;

  useEffect(() => {
    const vacio = { data: { registros: [] } };
    Promise.all([
      api.get('/inventario').catch(() => vacio),
      api.get('/colaboraciones').catch(() => vacio),
      api.get('/usuarios').catch(() => vacio),
      api.get('/voluntarios').catch(() => vacio),
    ]).then(([rInv, rCol, rUsu, rVol]) => {
      const fechaCorta = (v) => {
        const d = new Date(String(v ?? '').length === 10 ? `${v}T00:00:00` : v);
        return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      };
      const moneda = (n) => `$${Number(n).toLocaleString('es-VE')}`;

      // TM_INSUMO — INSUMO_EX: existencia actual · INSUMO_SM: stock mínimo
      setAlertasStock((rInv.data.registros ?? [])
        .filter(i => Number(i.insumo_sm) > 0 && Number(i.insumo_ex) < Number(i.insumo_sm))
        .map(i => ({
          nombre: i.insumo_no,
          unidad: i.insumo_un,
          INSUMO_EX: Number(i.insumo_ex),
          INSUMO_SM: Number(i.insumo_sm),
          estado: Number(i.insumo_ex) <= Number(i.insumo_sm) / 2 ? 'critico' : 'alerta',
        }))
        .sort((a, b) => a.INSUMO_EX / a.INSUMO_SM - b.INSUMO_EX / b.INSUMO_SM));

      // TT_COLAB — las 3 más recientes y el total aportado en el mes en curso
      const colabs = rCol.data.registros ?? [];
      const hoy = new Date();
      const delMes = colabs.filter(c => {
        const d = new Date(c.colab_fe);
        return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
      });
      setResumenColab({
        etiqueta: hoy.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' }),
        total: moneda(delMes.reduce((s, c) => s + Number(c.colab_total ?? 0), 0)),
        donantes: new Set(colabs.map(c => c.person_id ?? c.colab_co)).size,
      });
      setColaboracionesRecientes(colabs.slice(0, 3).map(c => ({
        colaborador: c.colab_co,
        concepto: c.colab_ob || c.colab_ti,
        monto: Number(c.colab_total) > 0 ? moneda(c.colab_total) : c.colab_ti,
        fecha: fechaCorta(c.colab_fe),
      })));

      // Personal de la misión (usuarios) y voluntarios
      const personal = (rUsu.data.registros ?? []).map(u => ({
        nombre: u.person_no ? `${u.person_no} ${u.person_ap ?? ''}`.trim() : u.usuari_no,
        cargo: u.rolreg_no,
        estado: u.usuari_es === 'ACTIVO' ? 'Activo' : 'Inactivo',
        cedula: u.person_ce ?? `usuario-${u.usuari_id}`,
        ASIGJO_HI: null, ASIGJO_HF: null,
      }));
      const voluntarios = (rVol.data.registros ?? []).map(v => ({
        nombre: `${v.person_no ?? ''} ${v.person_ap ?? ''}`.trim(),
        cargo: 'Voluntario',
        estado: v.volun_st ?? 'Activo',
        cedula: v.person_ce ?? `voluntario-${v.volunt_id}`,
        ASIGJO_HI: null, ASIGJO_HF: null,
      }));
      setPersonalAsignado([...personal, ...voluntarios]);
    });
  }, []);

  return (
    <div className="space-y-6">

      <div>
        <h2 className={cn('text-2xl', 'font-bold', 'text-gray-800', 'tracking-tight')}>Resumen Logístico</h2>
        <p className={cn('text-sm', 'text-[#765A05]/60', 'mt-0.5')}>Panel directivo — Estado operacional del sistema · SISCVI · Misión Nevado</p>
      </div>

      {/* ── Tarjetas métricas ── */}
      <div className={cn('grid', 'grid-cols-2', 'md:grid-cols-4', 'gap-3', 'md:gap-4')}>
        {indicadores.map(({ id, titulo, valor, icono: Icono, iconoBg, iconoColor, sombra }) => (
          <button
            key={id}
            onClick={() => setVistaActual(id)}
            className={`group bg-white/65 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl ${sombra} p-5 flex items-center justify-between text-left transition-all duration-300 hover:bg-white/85 hover:shadow-2xl hover:scale-[1.025] cursor-pointer`}
          >
            <div>
              <p className={cn('text-[10px]', 'font-bold', 'text-gray-400', 'tracking-widest', 'uppercase', 'leading-tight')}>{titulo}</p>
              <p className={cn('text-3xl', 'font-bold', 'text-gray-800', 'mt-1.5', 'leading-none')}>{valor}</p>
            </div>
            <div className={`w-11 h-11 ${iconoBg} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm shrink-0`}>
              <Icono className={`w-5 h-5 ${iconoColor}`} />
            </div>
          </button>
        ))}
      </div>

      {/* ── Widget 1: Alertas de Stock Crítico (TM_INSUMO) ── */}
      <div className={cn('bg-white/65', 'backdrop-blur-md', 'rounded-2xl', 'border', 'border-white/60', 'shadow-xl', 'shadow-[#765A05]/8', 'p-5')}>
        <div className={cn('flex', 'items-start', 'justify-between', 'mb-5')}>
          <div className={cn('flex', 'items-start', 'gap-3')}>
            <div className={cn('w-9', 'h-9', 'bg-rose-100', 'border', 'border-rose-200/60', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
              <Package className={cn('w-4', 'h-4', 'text-rose-600')} />
            </div>
            <div>
              <p className={cn('text-sm', 'font-bold', 'text-gray-800')}>Alertas de Stock Crítico</p>
              <p className={cn('text-xs', 'text-gray-400', 'mt-0.5')}>
                Suministros con existencia (INSUMO_EX) por debajo del mínimo requerido (INSUMO_SM)
              </p>
            </div>
          </div>
          <span className={cn('text-xs', 'font-bold', 'bg-rose-100', 'text-rose-700', 'px-2.5', 'py-1', 'rounded-full', 'border', 'border-rose-200/60', 'shrink-0')}>
            {alertasStock.length} alertas activas
          </span>
        </div>

        <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-3')}>
          {alertasStock.map(({ nombre, unidad, INSUMO_EX, INSUMO_SM, estado }) => {
            const porcentaje = Math.round((INSUMO_EX / INSUMO_SM) * 100);
            const esCritico = estado === 'critico';
            return (
              <div
                key={nombre}
                className={`rounded-xl p-4 border ${esCritico ? 'bg-rose-50/70 border-rose-200/60' : 'bg-amber-50/70 border-amber-200/60'}`}
              >
                <div className={cn('flex', 'items-start', 'justify-between', 'gap-2', 'mb-2')}>
                  <div>
                    <p className={cn('text-xs', 'font-bold', 'text-gray-800')}>{nombre}</p>
                    <p className={cn('text-[11px]', 'text-gray-400')}>{unidad}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${esCritico ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'}`}>
                    {esCritico ? 'CRÍTICO' : 'ALERTA'}
                  </span>
                </div>
                <div className={cn('flex', 'items-center', 'justify-between', 'text-xs', 'mb-1.5')}>
                  <span className="text-gray-500">
                    Existencia: <span className={`font-bold ${esCritico ? 'text-rose-600' : 'text-amber-600'}`}>{INSUMO_EX}</span>
                  </span>
                  <span className="text-gray-400">Mín: {INSUMO_SM}</span>
                </div>
                <div className={cn('h-1.5', 'bg-gray-200/60', 'rounded-full', 'overflow-hidden')}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${esCritico ? 'bg-rose-400' : 'bg-amber-400'}`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <p className={`text-[10px] mt-1 font-semibold ${esCritico ? 'text-rose-500' : 'text-amber-600'}`}>
                  {porcentaje}% del mínimo requerido
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Fila: Widget 2 — Colaboraciones + Widget 3 — Talento Humano ── */}
      <div className={cn('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-5')}>

        {/* Widget 2 — Resumen de Colaboraciones */}
        <div className={cn('bg-white/65', 'backdrop-blur-md', 'rounded-2xl', 'border', 'border-white/60', 'shadow-xl', 'shadow-[#765A05]/8', 'p-5')}>
          <div className={cn('flex', 'items-start', 'gap-3', 'mb-4')}>
            <div className={cn('w-9', 'h-9', 'bg-emerald-100', 'border', 'border-emerald-200/60', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
              <TrendingUp className={cn('w-4', 'h-4', 'text-emerald-600')} />
            </div>
            <div>
              <p className={cn('text-sm', 'font-bold', 'text-gray-800')}>Resumen de Colaboraciones</p>
              <p className={cn('text-xs', 'text-gray-400', 'mt-0.5')}>Aportes y servicios recibidos este mes</p>
            </div>
          </div>

          {/* Indicador global */}
          <div className={cn('bg-emerald-50/60', 'border', 'border-emerald-100/60', 'rounded-xl', 'px-4', 'py-3', 'mb-4', 'flex', 'items-center', 'justify-between')}>
            <div>
              <p className={cn('text-[10px]', 'text-gray-400', 'font-bold', 'uppercase', 'tracking-wider')}>Total {resumenColab.etiqueta}</p>
              <p className={cn('text-2xl', 'font-extrabold', 'text-emerald-700', 'mt-0.5')}>{resumenColab.total}</p>
            </div>
            <div className="text-right">
              <p className={cn('text-[10px]', 'text-gray-400', 'font-medium')}>Donantes registrados</p>
              <p className={cn('text-xl', 'font-bold', 'text-gray-700')}>{resumenColab.donantes}</p>
            </div>
          </div>

          <ul className="space-y-2">
            {colaboracionesRecientes.map(({ colaborador, concepto, monto, fecha }, i) => (
              <li key={`${colaborador}-${i}`} className={cn('flex', 'items-center', 'justify-between', 'gap-3', 'bg-emerald-50/40', 'rounded-xl', 'px-3.5', 'py-2.5', 'border', 'border-emerald-100/60')}>
                <div className="min-w-0">
                  <p className={cn('text-xs', 'font-bold', 'text-gray-800', 'truncate')}>{colaborador}</p>
                  <p className={cn('text-[11px]', 'text-gray-500', 'truncate')}>{concepto}</p>
                </div>
                <div className={cn('text-right', 'shrink-0')}>
                  <p className={cn('text-xs', 'font-bold', 'text-emerald-700')}>{monto}</p>
                  <p className={cn('text-[11px]', 'text-gray-400')}>{fecha}</p>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setVistaActual('colaboraciones')}
            className={cn('mt-3.5', 'w-full', 'text-xs', 'font-semibold', 'text-[#765A05]', 'hover:text-[#5a4304]', 'transition-colors', 'text-center', 'py-1.5', 'rounded-lg', 'hover:bg-[#FFDF96]/20')}
          >
            Ver historial completo →
          </button>
        </div>

        {/* Widget 3 — Talento Humano (TT_ASIGJO) */}
        <div className={cn('bg-white/65', 'backdrop-blur-md', 'rounded-2xl', 'border', 'border-white/60', 'shadow-xl', 'shadow-[#765A05]/8', 'p-5')}>
          <div className={cn('flex', 'items-start', 'justify-between', 'mb-4')}>
            <div className={cn('flex', 'items-start', 'gap-3')}>
              <div className={cn('w-9', 'h-9', 'bg-[#765A05]/10', 'border', 'border-[#765A05]/15', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
                <Users className={cn('w-4', 'h-4', 'text-[#765A05]')} />
              </div>
              <div>
                <p className={cn('text-sm', 'font-bold', 'text-gray-800')}>Talento Humano</p>
                <p className={cn('text-xs', 'text-gray-400', 'mt-0.5')}>Voluntarios y personal activo — TT_ASIGJO</p>
              </div>
            </div>
            <span className={cn('text-xs', 'font-bold', 'bg-emerald-100', 'text-emerald-700', 'px-2.5', 'py-1', 'rounded-full', 'border', 'border-emerald-200/60', 'shrink-0')}>
              {totalActivos} activos
            </span>
          </div>

          <ul className="space-y-2">
            {personalAsignado.map(({ nombre, cargo, estado, cedula, ASIGJO_HI, ASIGJO_HF }) => (
              <li key={cedula} className={cn('flex', 'items-center', 'gap-3', 'bg-[#FFDF96]/10', 'rounded-xl', 'px-3.5', 'py-2.5', 'border', 'border-[#FFDF96]/20')}>
                <div className={cn('w-7', 'h-7', 'bg-[#765A05]/10', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
                  <CircleUser className={cn('w-4', 'h-4', 'text-[#765A05]/70')} />
                </div>
                <div className={cn('flex-1', 'min-w-0')}>
                  <p className={cn('text-xs', 'font-bold', 'text-gray-800', 'truncate')}>{nombre}</p>
                  <p className={cn('text-[11px]', 'text-gray-500', 'truncate')}>
                    {cargo} · {ASIGJO_HI ? `${ASIGJO_HI}–${ASIGJO_HF}` : 'Sin turno asignado'}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${estado === 'Activo'
                  ? 'bg-emerald-100 text-emerald-700'
                  : estado === 'Permiso'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                  }`}>
                  {estado}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setVistaActual('usuarios')}
            className={cn('mt-3.5', 'w-full', 'text-xs', 'font-semibold', 'text-[#765A05]', 'hover:text-[#5a4304]', 'transition-colors', 'text-center', 'py-1.5', 'rounded-lg', 'hover:bg-[#FFDF96]/20')}
          >
            Gestionar personal →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD: PERFIL VETERINARIO ───────────────────────────────────────────

function ResumenVeterinario({ setVistaActual }) {
  const [metrVet, setMetrVet] = useState({ censo: '—', consultas: '—', criticos: '—' })
  const [ultimasConsultas, setUltimasConsultas] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/censo').catch(() => ({ data: { registros: [] } })),
      api.get('/veterinaria').catch(() => ({ data: { registros: [] } })),
      api.get('/inventario').catch(() => ({ data: { registros: [] } })),
    ]).then(([rCenso, rVet, rInv]) => {
      const censoDatos = rCenso.data.registros ?? []
      const consultaDatos = rVet.data.registros ?? []
      const invDatos = rInv.data.registros ?? []
      const criticos = invDatos.filter(i => Number(i.insumo_ex ?? 0) < Number(i.insumo_sm ?? 0))
      setMetrVet({
        censo: String(censoDatos.length),
        consultas: String(consultaDatos.length),
        criticos: String(criticos.length),
      })
      setUltimasConsultas(consultaDatos.slice(0, 5))
    })
  }, [])

  const accesosRapidos = [
    {
      id: 'censo',
      icono: PawPrint,
      titulo: 'Censo Animal',
      descripcion: 'Registro y seguimiento de la población animal atendida',
      iconoBg: 'bg-[#765A05]/10 text-[#765A05]',
      bordeHover: 'hover:border-[#765A05]/30',
      valor: metrVet.censo,
      etiquetaValor: 'registros activos',
    },
    {
      id: 'medica',
      icono: Stethoscope,
      titulo: 'Consultas Médicas',
      descripcion: 'Historial clínico y registro de nuevas consultas veterinarias',
      iconoBg: 'bg-sky-100 text-sky-600',
      bordeHover: 'hover:border-sky-300/50',
      valor: metrVet.consultas,
      etiquetaValor: 'consultas registradas',
    },
    {
      id: 'logistica',
      icono: FlaskConical,
      titulo: 'Suministros Médicos',
      descripcion: 'Control de insumos disponibles y registro de consumos',
      iconoBg: 'bg-rose-100 text-rose-600',
      bordeHover: 'hover:border-rose-300/50',
      valor: metrVet.criticos,
      etiquetaValor: 'insumos críticos',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Encabezado del panel operativo */}
      <div className={cn('flex', 'flex-col', 'sm:flex-row', 'sm:items-start', 'sm:justify-between', 'gap-3')}>
        <div>
          <h2 className={cn('text-2xl', 'font-bold', 'text-gray-800', 'tracking-tight')}>Panel Operativo</h2>
          <p className={cn('text-sm', 'text-[#765A05]/60', 'mt-0.5')}>
            Acceso clínico directo — Veterinario en turno · SISCVI
          </p>
        </div>
        <div className={cn('flex', 'items-center', 'gap-2', 'bg-sky-50', 'border', 'border-sky-200/60', 'rounded-xl', 'px-3.5', 'py-2', 'shadow-sm')}>
          <Stethoscope className={cn('w-4', 'h-4', 'text-sky-500', 'shrink-0')} />
          <span className={cn('text-xs', 'font-bold', 'text-sky-700')}>Perfil: Veterinario</span>
        </div>
      </div>

      {/* Accesos rápidos a módulos */}
      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-3', 'gap-4')}>
        {accesosRapidos.map(({ id, icono: Icono, titulo, descripcion, iconoBg, bordeHover, valor, etiquetaValor }) => (
          <button
            key={id}
            onClick={() => setVistaActual(id)}
            className={`group bg-white/65 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-[#765A05]/8 p-5 text-left transition-all duration-300 hover:bg-white/85 hover:shadow-2xl hover:scale-[1.025] ${bordeHover}`}
          >
            <div className={`w-12 h-12 rounded-2xl ${iconoBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <Icono className={cn('w-6', 'h-6')} />
            </div>
            <p className={cn('text-sm', 'font-bold', 'text-gray-800')}>{titulo}</p>
            <p className={cn('text-xs', 'text-gray-500', 'mt-1', 'leading-relaxed')}>{descripcion}</p>
            <div className={cn('mt-4', 'flex', 'items-baseline', 'gap-1.5')}>
              <span className={cn('text-2xl', 'font-extrabold', 'text-gray-800')}>{valor}</span>
              <span className={cn('text-xs', 'text-gray-400', 'font-medium')}>{etiquetaValor}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Últimas consultas médicas registradas */}
      <div className={cn('bg-white/65', 'backdrop-blur-md', 'rounded-2xl', 'border', 'border-white/60', 'shadow-xl', 'shadow-[#765A05]/8', 'p-5')}>
        <div className={cn('flex', 'items-start', 'justify-between', 'mb-5')}>
          <div className={cn('flex', 'items-start', 'gap-3')}>
            <div className={cn('w-9', 'h-9', 'bg-rose-100', 'border', 'border-rose-200/60', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
              <FlaskConical className={cn('w-4', 'h-4', 'text-rose-600')} />
            </div>
            <div>
              <p className={cn('text-sm', 'font-bold', 'text-gray-800')}>Últimas Consultas Médicas</p>
              <p className={cn('text-xs', 'text-gray-400', 'mt-0.5')}>Historial reciente de atenciones veterinarias registradas</p>
            </div>
          </div>
          <button
            onClick={() => setVistaActual('medica')}
            className={cn('text-xs', 'font-semibold', 'text-[#765A05]', 'hover:text-[#5a4304]', 'transition-colors', 'whitespace-nowrap', 'bg-[#FFDF96]/20', 'px-3', 'py-1.5', 'rounded-lg', 'hover:bg-[#FFDF96]/40', 'border', 'border-[#FFDF96]/30')}
          >
            Ver historial →
          </button>
        </div>

        {/* Tabla de últimas consultas */}
        <div className={cn('overflow-x-auto', 'rounded-xl', 'border', 'border-[#765A05]/8')}>
          <table className={cn('w-full', 'text-xs')}>
            <thead>
              <tr className={cn('bg-[#FFDF96]/20', 'border-b', 'border-[#765A05]/8')}>
                <th className={cn('text-left', 'px-4', 'py-2.5', 'font-bold', 'text-[#765A05]', 'uppercase', 'tracking-wider')}>Motivo</th>
                <th className={cn('text-left', 'px-4', 'py-2.5', 'font-bold', 'text-[#765A05]', 'uppercase', 'tracking-wider')}>Estado</th>
                <th className={cn('text-left', 'px-4', 'py-2.5', 'font-bold', 'text-[#765A05]', 'uppercase', 'tracking-wider')}>Paciente</th>
                <th className={cn('text-left', 'px-4', 'py-2.5', 'font-bold', 'text-[#765A05]', 'uppercase', 'tracking-wider')}>Fecha</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', 'divide-[#765A05]/5')}>
              {ultimasConsultas.length === 0 && (
                <tr>
                  <td colSpan={4} className={cn('px-4', 'py-6', 'text-center', 'text-gray-400', 'text-xs')}>
                    Sin consultas registradas
                  </td>
                </tr>
              )}
              {ultimasConsultas.map((c) => (
                <tr key={c.consul_id} className={cn('hover:bg-[#FFDF96]/10', 'transition-colors')}>
                  <td className={cn('px-4', 'py-3', 'font-semibold', 'text-gray-800')}>{c.consul_mo ?? '—'}</td>
                  <td className={cn('px-4', 'py-3', 'text-gray-600')}>{c.consul_es ?? '—'}</td>
                  <td className={cn('px-4', 'py-3')}>
                    <div className={cn('flex', 'items-center', 'gap-1.5')}>
                      <PawPrint className={cn('w-3', 'h-3', 'text-[#765A05]/50')} />
                      <span className={cn('text-gray-700', 'font-medium')}>{c.nom_anima ?? '—'}</span>
                    </div>
                  </td>
                  <td className={cn('px-4', 'py-3', 'text-gray-400')}>{(c.consul_fe ?? '').toString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={cn('text-[11px]', 'text-gray-400', 'mt-3', 'text-center', 'font-medium')}>
          {ultimasConsultas.length} consultas recientes · Actualizado hoy {new Date().toLocaleDateString('es-VE')}
        </p>
      </div>
    </div>
  );
}

// ─── PANTALLA: SOPORTE TÉCNICO ────────────────────────────────────────────────

function SoporteTecnico() {
  const contactos = [
    { etiqueta: 'Correo de Soporte', valor: 'julieth20051506@Gmail.com' },
    { etiqueta: 'Teléfono Principal', valor: '0414-7599094' },
    { etiqueta: 'Horario de Atención', valor: 'Lunes a Viernes · 8:00 AM – 5:00 PM' },
    { etiqueta: 'Versión del Sistema', valor: 'SISCVI · Julio 2026' },
  ]
  return (
    <div className={cn('space-y-6', 'max-w-2xl')}>
      <div>
        <h2 className={cn('text-xl', 'font-black', 'text-gray-900')}>Soporte Técnico</h2>
        <p className={cn('text-xs', 'text-gray-500', 'mt-0.5')}>Canal oficial de asistencia del Sistema SISCVI</p>
      </div>
      <div className={cn('bg-white/65', 'backdrop-blur-md', 'rounded-2xl', 'border', 'border-white/60', 'shadow-xl', 'shadow-[#765A05]/8', 'p-6')}>
        <div className={cn('flex', 'items-start', 'gap-4', 'mb-6')}>
          <div className={cn('w-12', 'h-12', 'bg-[#FFDF96]/30', 'border', 'border-[#FFDF96]/40', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'shrink-0', 'shadow-sm')}>
            <HelpCircle className={cn('w-6', 'h-6', 'text-[#765A05]')} />
          </div>
          <div>
            <h3 className={cn('text-base', 'font-bold', 'text-gray-800')}>Centro de Ayuda — Fundación Misión Nevado</h3>
            <p className={cn('text-sm', 'text-gray-400', 'mt-0.5')}>
              Para reportar incidencias, solicitar asistencia o consultar la documentación del sistema.
            </p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {contactos.map(({ etiqueta, valor }) => (
            <li key={etiqueta}
              className={cn('flex', 'items-center', 'justify-between', 'px-4', 'py-3', 'bg-[#FFDF96]/10', 'border', 'border-[#FFDF96]/20', 'rounded-xl')}>
              <span className={cn('text-[10px]', 'font-bold', 'text-gray-500', 'uppercase', 'tracking-wider')}>{etiqueta}</span>
              <span className={cn('text-sm', 'font-semibold', 'text-gray-800')}>{valor}</span>
            </li>
          ))}
        </ul>

        <div className={cn('mt-5', 'pt-4', 'border-t', 'border-white/50', 'text-center')}>
          <p className={cn('text-xs', 'text-gray-400', 'font-medium')}>
            Ante una falla crítica del sistema, contactar directamente al área de TI de la fundación.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── PLACEHOLDER PARA SUB-PANTALLAS DE FORMULARIOS ──────────────────────────

function PlaceholderFormulario({ tipo, icono: Icono, setVistaActual, retorno }) {
  return (
    <div className={cn('space-y-5', 'max-w-2xl')}>
      <button
        onClick={() => setVistaActual(retorno)}
        className={cn('flex', 'items-center', 'gap-1.5', 'text-sm', 'text-[#765A05]/65', 'hover:text-[#765A05]', 'transition-colors', 'font-medium')}
      >
        <ChevronRight className={cn('w-4', 'h-4', 'rotate-180')} />
        Volver al módulo anterior
      </button>

      <div className={cn('bg-white/65', 'backdrop-blur-md', 'rounded-2xl', 'border', 'border-white/60', 'shadow-xl', 'shadow-[#765A05]/8', 'px-8', 'py-12', 'flex', 'flex-col', 'items-center', 'text-center')}>
        <div className={cn('w-16', 'h-16', 'bg-[#FFDF96]/30', 'border', 'border-[#FFDF96]/40', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'mb-5')}>
          <Icono className={cn('w-8', 'h-8', 'text-[#765A05]')} />
        </div>
        <h2 className={cn('text-xl', 'font-bold', 'text-gray-800')}>{tipo}</h2>
        <p className={cn('text-sm', 'text-gray-400', 'mt-2', 'max-w-sm', 'leading-relaxed')}>
          Este formulario está preparado para recibir datos. La implementación
          completa se conectará al backend del sistema SISCVI.
        </p>
        <div className={cn('mt-6', 'flex', 'items-center', 'gap-1.5', 'text-xs', 'text-[#765A05]/50', 'font-medium', 'bg-[#FFDF96]/15', 'border', 'border-[#FFDF96]/20', 'px-3.5', 'py-2', 'rounded-lg')}>
          <span className={cn('w-1.5', 'h-1.5', 'rounded-full', 'bg-[#765A05]/40', 'inline-block')} />
          Formulario en construcción — disponible próximamente
        </div>
      </div>
    </div>
  );
}
