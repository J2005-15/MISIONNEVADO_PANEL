import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Logo from '../assets/Logo.png'

// ─── REGLAS DE IMPRESIÓN ──────────────────────────────────────────────────────
const CSS_IMPRESION = `
  @media print {

    @page {
      size: letter portrait;
      margin: 0.5in 0.6in;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      overflow: visible !important;
      height: auto !important;
    }

    /*
      El récipe está portado directamente a <body> (hermano de #root).
      "display: none" colapsa el espacio de todo el sistema UI —
      evita que la altura del DOM cree páginas extras en blanco.
    */
    body > *:not(.receta-root) {
      display: none !important;
    }

    /* El récipe fluye normalmente desde el inicio del documento */
    .receta-root {
      display: block !important;
      position: static !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      background: white !important;
    }

    .receta-root * {
      color: #111 !important;
      background: white !important;
      box-shadow: none !important;
      text-shadow: none !important;
      text-decoration: none !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Tipografía base: garantiza que el contenido típico entre en 1 página */
    .receta-root {
      font-size: 11px !important;
      line-height: 1.35 !important;
    }

    /* La hoja: sin márgenes extra — @page provee el espacio en blanco */
    .receta-hoja {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      min-height: auto !important;
    }

    /* Bordes visibles en papel */
    .rb-titulo  { border-bottom: 2px solid #111 !important; }
    .rb-seccion { border-bottom: 1px solid #ccc !important; }
    .rb-bloque  { border: 1px solid #aaa !important;        }
    .rb-vital   { border: 1px solid #ccc !important;        }
    .rb-cita    { border: 1px solid #888 !important;        }
    .rb-firma   { border-bottom: 2px solid #111 !important; }
    .rb-pie     { border-top: 1px solid #ccc !important;    }

    /* Evitar corte a mitad de bloque; si el contenido es largo pasa completo a p.2 */
    .receta-bloque {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Barra de control: solo en pantalla */
    .receta-barra {
      display: none !important;
    }
  }
`

export default function RecetaMedica({ consulta, veterinario, onCerrar }) {

  useEffect(() => {
    const t = setTimeout(() => window.print(), 350)
    const alTerminar = () => onCerrar()
    window.addEventListener('afterprint', alTerminar)
    return () => { clearTimeout(t); window.removeEventListener('afterprint', alTerminar) }
  }, [onCerrar])

  const hoy = new Date().toLocaleDateString('es-VE', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const nombreAnimal      = consulta.NOM_ANIMA ?? consulta.CENSOA_ID ?? '—'
  const cedulaPropietario = consulta.PERSON_CE ?? '—'

  const vetNombre = veterinario?.nombre ?? consulta.USUARI_NO ?? consulta.USUARI_ID ?? '—'
  const vetCedula = veterinario?.cedula ?? '—'

  const signosVitales = [
    { etiqueta: 'Peso',           valor: `${consulta.CONSUL_PK ?? '—'} kg`  },
    { etiqueta: 'Temperatura',    valor: `${consulta.CONSUL_TE ?? '—'} °C`  },
    { etiqueta: 'Frec. Cardíaca', valor: `${consulta.CONSUL_FC ?? '—'} lpm` },
    { etiqueta: 'Frec. Resp.',    valor: `${consulta.CONSUL_FR ?? '—'} rpm` },
  ]

  const seccionesEval = [
    { titulo: 'Diagnóstico',          contenido: consulta.CONSUL_DI, negrita: false },
    { titulo: 'Tratamiento Indicado', contenido: consulta.CONSUL_TR, negrita: true  },
    { titulo: 'Observaciones',        contenido: consulta.CONSUL_OB, negrita: false },
  ].filter(s => s.contenido)

  // ─── CONTENIDO DEL RÉCIPE ────────────────────────────────────────────────────
  const contenido = (
    <>
      <style>{CSS_IMPRESION}</style>

      {/*
        receta-root: en pantalla = overlay fijo sobre el sistema.
        En impresión = position:static (CSS lo anula), fluye normal.
        Al estar portado a <body>, sus hermanos (#root, etc.) son
        ocultados con display:none en @media print → sin espacio extra.
      */}
      <div className="receta-root fixed inset-0 z-[1000] bg-white overflow-y-auto">

        {/* ── Barra de control — solo pantalla ── */}
        <div className="receta-barra sticky top-0 z-10 bg-gray-50 border-b border-gray-200
                        px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#765A05]" />
            <p className="text-sm font-semibold text-gray-700">
              Vista previa — Carta (8.5 × 11 pulg.) ·{' '}
              <span className="font-mono text-[#765A05]">{consulta.CONSUL_ID}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-[#765A05] text-white
                         text-xs font-bold rounded-xl hover:bg-[#5c4504] transition-colors shadow-sm">
              🖨 Imprimir Récipe
            </button>
            <button onClick={onCerrar}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600
                         text-xs font-bold rounded-xl border border-gray-300
                         hover:bg-gray-100 transition-colors">
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/*
          Hoja carta — preview pantalla:
          max-w-[816px] = 8.5in × 96dpi   (ancho carta)
          minHeight 1056px = 11in × 96dpi  (alto carta)
          En impresión @page toma control; .receta-hoja queda width:100%, padding:0, margin:0
        */}
        <div className="receta-hoja max-w-[816px] w-full mx-auto my-8 bg-white
                        border border-gray-200 px-14 py-8"
          style={{ minHeight: '1056px' }}>

          {/* ── ENCABEZADO ── */}
          <div className="receta-bloque rb-titulo flex items-start justify-between pb-3 mb-3">
            <div className="flex items-start gap-3">
              <img src={Logo} alt="Misión Nevado" className="h-12 w-auto object-contain shrink-0" />
              <div>
                <h1 className="text-[13px] font-black text-gray-900 uppercase tracking-wide leading-tight">
                  Fundación Misión Nevado
                </h1>
                <p className="text-[11px] text-gray-700 font-semibold mt-0.5">
                  Sistema de Control y Vigilancia Animal — SISCVI
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  La Grita, Municipio Jáuregui — Edo. Táchira, Venezuela
                </p>
                <p className="text-[10px] text-gray-500">Tel: 0414-7599094 · soporte@sisvic.org.ve</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="rb-bloque px-3 py-2 text-center inline-block">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">N° Consulta</p>
                <p className="text-[12px] font-black text-gray-900 font-mono mt-0.5">{consulta.CONSUL_ID}</p>
              </div>
              <p className="text-[10px] text-gray-600 mt-1 font-medium">Fecha: {hoy}</p>
            </div>
          </div>

          {/* ── TÍTULO ── */}
          <div className="receta-bloque rb-seccion text-center pb-2 mb-3">
            <h2 className="text-[15px] font-black text-gray-900 uppercase tracking-[0.18em]">
              Récipe Médico Veterinario
            </h2>
          </div>

          {/* ── DATOS DEL VETERINARIO ── */}
          <div className="receta-bloque rb-bloque p-2.5 mb-2">
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5">
              Datos del Veterinario Responsable
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { titulo: 'Nombre',         valor: vetNombre          },
                { titulo: 'Cédula',         valor: vetCedula          },
                { titulo: 'Fecha Consulta', valor: consulta.CONSUL_FE },
              ].map(({ titulo, valor }) => (
                <div key={titulo}>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">{titulo}</p>
                  <p className="text-[11px] text-gray-900 font-semibold mt-0.5">{valor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── DATOS DEL PACIENTE + SIGNOS VITALES ── */}
          <div className="receta-bloque rb-bloque p-2.5 mb-2">
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5">
              Datos del Paciente
            </p>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Nombre del Animal</p>
                <p className="text-[13px] text-gray-900 font-black mt-0.5">{nombreAnimal}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Cédula del Propietario</p>
                <p className="text-[11px] text-gray-900 font-semibold mt-0.5">{cedulaPropietario}</p>
              </div>
            </div>

            <div className="rb-seccion pt-2">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Signos Vitales</p>
              <div className="grid grid-cols-4 gap-2">
                {signosVitales.map(({ etiqueta, valor }) => (
                  <div key={etiqueta} className="rb-vital text-center py-1.5 px-1">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">{etiqueta}</p>
                    <p className="text-[12px] font-black text-gray-900 mt-0.5">{valor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── MOTIVO DE LA CONSULTA ── */}
          <div className="receta-bloque rb-seccion mb-2 pb-2">
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
              Motivo de la Consulta
            </p>
            <p className="text-[11px] text-gray-900 leading-snug">{consulta.CONSUL_MO}</p>
          </div>

          {/* ── EVALUACIÓN CLÍNICA ── */}
          <div className="receta-bloque rb-bloque p-2.5 mb-2">
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] rb-seccion pb-1.5 mb-2">
              Evaluación Clínica
            </p>
            <div className="space-y-2">
              {seccionesEval.map(({ titulo, contenido: texto, negrita }, indice) => (
                <div key={titulo} className={indice > 0 ? 'rb-seccion pt-2' : ''}>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {titulo}
                  </p>
                  <p className={`text-[11px] text-gray-900 leading-snug ${negrita ? 'font-semibold' : ''}`}>
                    {texto}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── PRÓXIMA CITA (condicional) ── */}
          {consulta.CONSUL_PR && (
            <div className="receta-bloque rb-cita px-3 py-2 mb-2 flex items-center gap-3">
              <span className="text-[11px] font-bold text-gray-900">📅 Próxima cita:</span>
              <span className="text-[11px] font-mono font-semibold text-gray-800">
                {consulta.CONSUL_PR}
              </span>
            </div>
          )}

          {/* ── FIRMA ── */}
          <div className="receta-bloque flex justify-end mt-6 mb-4">
            <div className="text-center w-52">
              <div className="rb-firma mb-1.5" style={{ height: '44px' }} />
              <p className="text-[11px] font-bold text-gray-900">{vetNombre}</p>
              <p className="text-[10px] text-gray-500 font-mono">{vetCedula}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">
                Médico Veterinario — Fundación Misión Nevado
              </p>
            </div>
          </div>

          {/* ── PIE ── */}
          <div className="rb-pie pt-2 text-center">
            <p className="text-[9px] text-gray-400 leading-relaxed">
              Documento generado por SISCVI · Fundación Misión Nevado · La Grita, Táchira, Venezuela
            </p>
            <p className="text-[9px] text-gray-400 mt-0.5">
              Válido únicamente con sello y firma del veterinario responsable.
            </p>
          </div>

        </div>
      </div>
    </>
  )

  // Portamos a document.body para que en @media print "body > *:not(.receta-root)"
  // elimine completamente el espacio del sistema UI y no cree páginas extra.
  return createPortal(contenido, document.body)
}
