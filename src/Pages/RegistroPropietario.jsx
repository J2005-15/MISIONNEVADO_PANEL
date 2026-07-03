import React, { useState } from 'react';
import { UserPlus, ChevronLeft, ArrowRight, Loader2, User, Phone, IdCard } from 'lucide-react';

// ── Formulario vacío — TM_PERSON ─────────────────────────────────────────────
const FORM_VACIO = {
  PERSON_CE: '',
  PERSON_NO: '',
  PERSON_AP: '',
  PERSON_TL: '',
};

const eInput = 'w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all placeholder-gray-500';
const eLabel = 'block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5';

export default function RegistroPropietario({ setVistaActual, onPersonaSeleccionada }) {
  const [formulario, setFormulario] = useState(FORM_VACIO);
  const [guardando,  setGuardando]  = useState(false);

  const cambiar = ({ target: { name, value } }) =>
    setFormulario(p => ({ ...p, [name]: value }));

  const manejarGuardar = (e) => {
    e.preventDefault();
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      onPersonaSeleccionada(formulario);
    }, 500);
  };

  return (
    <div className="space-y-5 max-w-xl">

      {/* Botón volver */}
      <button
        onClick={() => setVistaActual('censo')}
        className="flex items-center gap-1.5 text-sm text-[#765A05]/65 hover:text-[#765A05] transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al listado de registros
      </button>

      {/* Encabezado */}
      <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#765A05]/10 rounded-2xl flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6 text-[#765A05]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Registro de Propietario</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Complete los datos del responsable del animal antes de registrar el censo.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl p-6">

        <form onSubmit={manejarGuardar} className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* PERSON_CE — Cédula */}
            <div>
              <label className={eLabel}>Cédula de Identidad</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="text" name="PERSON_CE" required
                  value={formulario.PERSON_CE}
                  onChange={cambiar}
                  placeholder="V-00.000.000"
                  className={`${eInput} pl-9`}
                />
              </div>
            </div>

            {/* PERSON_TL — Teléfono */}
            <div>
              <label className={eLabel}>Teléfono de Contacto</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="tel" name="PERSON_TL" required
                  value={formulario.PERSON_TL}
                  onChange={cambiar}
                  placeholder="0416-000-0000"
                  className={`${eInput} pl-9`}
                />
              </div>
            </div>

            {/* PERSON_NO — Nombres */}
            <div>
              <label className={eLabel}>Nombres</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="text" name="PERSON_NO" required
                  value={formulario.PERSON_NO}
                  onChange={cambiar}
                  placeholder="Juan Carlos..."
                  className={`${eInput} pl-9`}
                />
              </div>
            </div>

            {/* PERSON_AP — Apellidos */}
            <div>
              <label className={eLabel}>Apellidos</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="text" name="PERSON_AP" required
                  value={formulario.PERSON_AP}
                  onChange={cambiar}
                  placeholder="García López..."
                  className={`${eInput} pl-9`}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setVistaActual('censo')}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#765A05] hover:bg-[#5a4304] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-[#765A05]/20"
            >
              {guardando
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <ArrowRight className="w-4 h-4" />
              }
              {guardando ? 'Guardando...' : 'Registrar y Continuar al Censo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
