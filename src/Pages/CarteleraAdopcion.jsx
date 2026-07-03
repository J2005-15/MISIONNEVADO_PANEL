import React, { useState } from 'react';
import { PawPrint, Plus, Pencil, Trash2, Search } from 'lucide-react';

const mascotasIniciales = [
  {
    id: 1,
    foto: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=56&h=56&fit=crop&auto=format',
    nombre: 'Boby',
    especie: 'Perro',
    edad: '2 años',
    comunidad: 'Sector Las Lomas',
    estado: 'Disponible',
  },
  {
    id: 2,
    foto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=56&h=56&fit=crop&auto=format',
    nombre: 'Luna',
    especie: 'Perra',
    edad: '1 año',
    comunidad: 'El Mirador',
    estado: 'Disponible',
  },
  {
    id: 3,
    foto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=56&h=56&fit=crop&auto=format',
    nombre: 'Max',
    especie: 'Perro',
    edad: '3 años',
    comunidad: 'Centro Histórico',
    estado: 'Adoptado',
  },
  {
    id: 4,
    foto: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=56&h=56&fit=crop&auto=format',
    nombre: 'Rocky',
    especie: 'Perro',
    edad: '4 años',
    comunidad: 'Barrio San Miguel',
    estado: 'Disponible',
  },
  {
    id: 5,
    foto: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=56&h=56&fit=crop&auto=format',
    nombre: 'Mia',
    especie: 'Gata',
    edad: '8 meses',
    comunidad: 'Sector Las Lomas',
    estado: 'Disponible',
  },
  {
    id: 6,
    foto: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=56&h=56&fit=crop&auto=format',
    nombre: 'Bella',
    especie: 'Gata',
    edad: '1 año',
    comunidad: 'Urb. Los Pinos',
    estado: 'Adoptado',
  },
];

const ESTILOS_ESTADO = {
  Disponible: 'bg-green-100 text-green-700 border border-green-200',
  Adoptado:   'bg-blue-100 text-blue-700 border border-blue-200',
};

function BadgeEstado({ estado }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ESTILOS_ESTADO[estado] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {estado}
    </span>
  );
}

// Columnas de la tabla para generar el encabezado dinámicamente
const COLUMNAS = ['Foto', 'Nombre', 'Especie', 'Edad', 'Comunidad de Origen', 'Estado', 'Acciones'];

export default function CarteleraAdopcion() {
  const [mascotas, setMascotas] = useState(mascotasIniciales);
  const [busqueda, setBusqueda] = useState('');

  const mascotasFiltradas = mascotas.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.especie.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.comunidad.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminar = (id) => {
    if (window.confirm('¿Eliminar esta mascota de la cartelera? Esta acción no se puede deshacer.')) {
      setMascotas(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">

      {/* ── Encabezado del módulo ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <PawPrint className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Cartelera de Adopción</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Mascotas publicadas en la web pública de Misión Nevado
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-[#765A05] hover:bg-[#5a4304] active:bg-[#3d2d02] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm self-start">
          <Plus className="w-4 h-4" />
          🐾 Registrar Mascota
        </button>
      </div>

      {/* ── Tarjeta con tabla ────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl">

        {/* Barra de búsqueda */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, especie o comunidad..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#765A05]/20 focus:border-[#765A05] transition-all"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg shrink-0">
            {mascotasFiltradas.length} resultado{mascotasFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tabla con scroll horizontal */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {COLUMNAS.map((col, i) => (
                  <th
                    key={col}
                    className={`text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap ${i === COLUMNAS.length - 1 ? 'text-right' : 'text-left'}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mascotasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNAS.length} className="py-20 text-center">
                    <PawPrint className="w-9 h-9 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Sin resultados para esa búsqueda</p>
                    <p className="text-xs text-gray-300 mt-1">Intenta con otro nombre o comunidad</p>
                  </td>
                </tr>
              ) : (
                mascotasFiltradas.map(m => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-[#FFDF96]/10 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <img
                        src={m.foto}
                        alt={m.nombre}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm"
                        onError={e => { e.currentTarget.src = 'https://placehold.co/40x40/dcfce7/166534?text=?'; }}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-900">{m.nombre}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{m.especie}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{m.edad}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{m.comunidad}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <BadgeEstado estado={m.estado} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#765A05] hover:bg-[#FFDF96]/20 border border-gray-200 hover:border-[#FFDF96]/40 px-2.5 py-1.5 rounded-lg transition-all"
                          title={`Editar a ${m.nombre}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => eliminar(m.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-all"
                          title={`Eliminar a ${m.nombre}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de la tabla */}
        <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {mascotas.length} mascota{mascotas.length !== 1 ? 's' : ''} registrada{mascotas.length !== 1 ? 's' : ''} en total
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-[#765A05] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#765A05] inline-block" />
              {mascotas.filter(m => m.estado === 'Disponible').length} disponibles
            </span>
            <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              {mascotas.filter(m => m.estado === 'Adoptado').length} adoptadas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
