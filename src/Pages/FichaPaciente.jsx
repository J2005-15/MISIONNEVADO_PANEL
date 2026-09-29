import React from 'react';
import {
  PawPrint, User, Phone, Stethoscope, ChevronLeft,
  IdCard, MapPin, Calendar, Activity, ClipboardList,
} from 'lucide-react';

// ── Mapas de código → etiqueta visual ────────────────────────────────────────
const SEXO_LABEL   = { M: 'Macho', H: 'Hembra' };
const COLOR_LABEL  = {
  NEGRO: 'Negro', BLANCO: 'Blanco', MARRON: 'Marrón', GRIS: 'Gris',
  AMARILLO: 'Amarillo / Crema', ATIGRADO: 'Atigrado', MANCHADO: 'Manchado', ROJIZO: 'Rojizo',
};
const ESPECIE_LABEL = { CANINO: 'Canino', FELINO: 'Felino' };

function CampoFicha({ etiqueta, valor, icono: Icono }) {
  if (!valor || valor === '—') return null;
  return (
    <div className="flex items-start gap-2.5">
      {Icono && (
        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <Icono className="w-3 h-3 text-gray-500" />
        </div>
      )}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{etiqueta}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{valor}</p>
      </div>
    </div>
  );
}

// Registro de GET /api/censo (columnas en minúscula) → campos que usa la ficha
const normalizarRegistro = (r) => ({
  ID_PERSON:  r.person_ce ?? r.ID_PERSON,
  NOM_ANIMA:  r.nom_anima ?? r.NOM_ANIMA,
  SEX_ANIMA:  r.sex_anima ?? r.SEX_ANIMA,
  EDAD_ANIMA: r.eda_anima ?? r.EDAD_ANIMA,
  ESPECIE:    r.especi_no ?? r.ESPECIE,
  COL_ANIMA:  r.colore_no ?? r.COL_ANIMA,
  ID_RAZARE:  r.razare_no ?? r.ID_RAZARE,
  ID_SECTOR:  r.sector_no ?? r.ID_SECTOR,
  FEC_CENSO:  r.fec_censo ?? r.FEC_CENSO,
});

export default function FichaPaciente({ registroCenso, onNuevaConsulta, onVolver }) {

  if (!registroCenso) {
    return (
      <div className="space-y-4">
        <button onClick={onVolver}
          className="flex items-center gap-1.5 text-sm text-[#765A05]/65 hover:text-[#765A05] transition-colors font-medium">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
        <p className="text-sm text-gray-400 text-center py-12">No se seleccionó ningún paciente.</p>
      </div>
    );
  }

  const reg = normalizarRegistro(registroCenso);

  // Propietario real: viene en el mismo registro del censo (JOIN con TM_PERSON)
  const propietario = {
    PERSON_CE: reg.ID_PERSON,
    PERSON_NO: registroCenso.person_no ?? registroCenso.PERSON_NO ?? 'No',
    PERSON_AP: registroCenso.person_ap ?? registroCenso.PERSON_AP ?? 'registrado',
    PERSON_TL: registroCenso.person_tl ?? registroCenso.PERSON_TL ?? '—',
  };

  const nombreCompleto = `${propietario.PERSON_NO} ${propietario.PERSON_AP}`.trim();
  const edadLabel      = reg.EDAD_ANIMA ? `${reg.EDAD_ANIMA} meses` : null;
  const especieLabel   = ESPECIE_LABEL[reg.ESPECIE] ?? reg.ESPECIE ?? null;
  const sexoLabel      = SEXO_LABEL[reg.SEX_ANIMA]  ?? reg.SEX_ANIMA  ?? null;
  const colorLabel     = COLOR_LABEL[reg.COL_ANIMA]  ?? reg.COL_ANIMA  ?? null;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Botón volver */}
      <button
        onClick={onVolver}
        className="flex items-center gap-1.5 text-sm text-[#765A05]/65 hover:text-[#765A05] transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al listado de registros
      </button>

      {/* Encabezado de la ficha */}
      <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#765A05]/10 rounded-2xl flex items-center justify-center shrink-0">
              <PawPrint className="w-7 h-7 text-[#765A05]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{reg.NOM_ANIMA}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {especieLabel && (
                  <span className="text-xs font-semibold text-[#765A05] bg-[#FFDF96]/40 border border-[#FFDF96]/50 px-2 py-0.5 rounded-full">
                    {especieLabel}
                  </span>
                )}
                {reg.ID_RAZARE && (
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                    {reg.ID_RAZARE}
                  </span>
                )}
                {sexoLabel && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                    {sexoLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botón Nueva Consulta */}
          <button
            type="button"
            onClick={onNuevaConsulta}
            className="flex items-center gap-2.5 px-5 py-3 bg-[#765A05] hover:bg-[#5a4304] active:bg-[#3d2d02] text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-[#765A05]/20 shrink-0"
          >
            <Stethoscope className="w-4 h-4" />
            Nueva Consulta
          </button>
        </div>
      </div>

      {/* ── Dos tarjetas: Animal + Propietario ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Tarjeta: Datos del Animal */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-[#765A05]/10 rounded-lg flex items-center justify-center shrink-0">
              <PawPrint className="w-4 h-4 text-[#765A05]" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Datos del Animal</h3>
            <span className="ml-auto text-[10px] font-mono text-gray-300">TT_CENSOA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <CampoFicha etiqueta="Nombre"   valor={reg.NOM_ANIMA}  />
            <CampoFicha etiqueta="Especie"  valor={especieLabel}   />
            <CampoFicha etiqueta="Raza"     valor={reg.ID_RAZARE}  />
            <CampoFicha etiqueta="Sexo"     valor={sexoLabel}      />
            <CampoFicha etiqueta="Color"    valor={colorLabel}     />
            <CampoFicha etiqueta="Edad"     valor={edadLabel}      />
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-3">
            <CampoFicha
              etiqueta="Sector / Aldea"
              valor={reg.ID_SECTOR}
              icono={MapPin}
            />
            <CampoFicha
              etiqueta="Fecha de Censo"
              valor={reg.FEC_CENSO}
              icono={Calendar}
            />
          </div>
        </div>

        {/* Tarjeta: Datos del Propietario */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-sky-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Datos del Propietario</h3>
            <span className="ml-auto text-[10px] font-mono text-gray-300">TM_PERSON</span>
          </div>

          {/* Avatar del propietario */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{nombreCompleto}</p>
              <p className="text-xs text-gray-400 mt-0.5">Responsable registrado</p>
            </div>
          </div>

          {/* Campos del propietario */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3 bg-gray-50/70 rounded-xl px-4 py-3">
              <div className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                <IdCard className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cédula de Identidad</p>
                <p className="text-sm font-semibold text-gray-800 font-mono mt-0.5">{propietario.PERSON_CE}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/70 rounded-xl px-4 py-3">
              <div className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teléfono de Contacto</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {propietario.PERSON_TL !== '—' ? propietario.PERSON_TL : (
                    <span className="text-gray-400 font-normal">No registrado</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie — acceso rápido a historial */}
      <div className="bg-[#FFDF96]/20 border border-[#FFDF96]/40 rounded-2xl px-5 py-4 flex items-center gap-4">
        <div className="w-8 h-8 bg-[#765A05]/10 rounded-lg flex items-center justify-center shrink-0">
          <ClipboardList className="w-4 h-4 text-[#765A05]" />
        </div>
        <p className="text-xs text-[#765A05]/80 font-medium flex-1">
          Para ver el historial completo de consultas de <span className="font-bold">{reg.NOM_ANIMA}</span>,
          acceda al módulo de Consulta Médica y use la opción "Ver Historia".
        </p>
        <button
          type="button"
          onClick={onNuevaConsulta}
          className="flex items-center gap-1.5 text-xs font-bold text-[#765A05] hover:text-[#5a4304] transition-colors whitespace-nowrap bg-white/70 border border-[#FFDF96]/60 px-3 py-2 rounded-xl hover:bg-white"
        >
          <Activity className="w-3.5 h-3.5" />
          Iniciar atención
        </button>
      </div>

    </div>
  );
}
