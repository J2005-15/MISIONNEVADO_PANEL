import { useState, useEffect } from 'react'
import { Save, Search, Pencil, Trash2, X, ChevronDown, CheckCircle } from 'lucide-react'
import api from '../lib/api'
// ─── COMPONENTES AUXILIARES ─────────────────────────────────────────────────

// Encabezado de campo: solo nombre amigable, sin referencias técnicas de BD
function EtiquetaCampo({ label }) {
  return (
    <div className="mb-1.5">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
        {label}
      </span>
    </div>
  )
}

// Envoltorio de select con flecha personalizada (evita el estilo nativo del navegador)
function SelectCampo({ name, value, onChange, disabled = false, children }) {
  return (
    <div className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 pr-8 rounded-lg border border-gray-400 bg-white text-sm
                   text-gray-700 appearance-none
                   focus:outline-none focus:ring-2 focus:ring-[#765A05]/25 focus:border-[#765A05] transition
                   ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
}

// ─── ESTILOS COMPARTIDOS ────────────────────────────────────────────────────

// Clase reutilizable para inputs de texto, número y fecha
const clsInput =
  'w-full px-3 py-2 rounded-lg border border-gray-400 bg-white text-sm text-gray-700 ' +
  'placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#765A05]/25 focus:border-[#765A05] transition'

// ─── TABLAS DE CONVERSIÓN ELIMINADAS (AHORA SON DINÁMICAS DESDE LA BD) ───────

const FORMULARIO_VACIO = {
  ID_PERSON:  '',
  NOM_ANIMA:  '',
  ESPECIE:    '',
  ID_RAZARE:  '',
  SECTOR_C:   '',
  COL_ANIMA:  '',
  SEX_ANIMA:  '',
  EDAD_ANIMA: '0',
  SINTOMA_C:  '',
  FECHA_CENS: '',
}

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────

// Recibe onGuardar: función del padre que agrega el registro al estado global
export default function CensoAnimal({ setVistaActual, onGuardar, propietarioData, rolActivo = 'ADMINISTRADOR' }) {
  const esAdmin = rolActivo === 'ADMINISTRADOR'
  // Estado del formulario. Los nombres de campo coinciden con las columnas de la base de datos.
  const [formulario, setFormulario] = useState({
    ID_PERSON:  propietarioData?.PERSON_CE || '', // Pre-cargada desde RegistroPropietario
    NOM_ANIMA:  '',
    ESPECIE:    '',   // TM_ESPECI — filtra razas dinámicamente
    ID_RAZARE:  '',   // TM_RAZASG — filtrado por especie seleccionada
    SECTOR_C:   '',   // Sector o aldea de registro
    COL_ANIMA:  '',   // Color predominante del pelaje
    SEX_ANIMA:  '',   // Sexo biológico (M / H)
    EDAD_ANIMA: '0',  // Edad estimada en meses
    SINTOMA_C:  '',   // Estado reproductivo
    FECHA_CENS: '',   // Fecha del censo
  })

  // ─── CATÁLOGOS DINÁMICOS DESDE LA BD ────────────────────────────────────────
  const [catalogoSectores, setCatalogoSectores] = useState([])
  const [catalogoColores, setCatalogoColores] = useState([])
  const [catalogoEspecies, setCatalogoEspecies] = useState([])
  const [catalogoRazas, setCatalogoRazas] = useState([])

  useEffect(() => {
    const cargarCatalogosBase = async () => {
      try {
        const [resSectores, resColores, resEspecies] = await Promise.all([
          api.get('/catalogos/sectores'),
          api.get('/catalogos/colores'),
          api.get('/catalogos/especies')
        ])
        setCatalogoSectores(resSectores.data.registros || [])
        setCatalogoColores(resColores.data.registros || [])
        setCatalogoEspecies(resEspecies.data.registros || [])
      } catch (error) {
        console.error('Error cargando catálogos base:', error)
      }
    }
    cargarCatalogosBase()
  }, [])

  useEffect(() => {
    const cargarRazas = async () => {
      if (!formulario.ESPECIE) {
        setCatalogoRazas([])
        return
      }
      try {
        const especieObj = catalogoEspecies.find(e => e.especi_id.toString() === formulario.ESPECIE.toString())
        if (especieObj) {
          const resRazas = await api.get(`/catalogos/razas?especie=${especieObj.especi_no}`)
          setCatalogoRazas(resRazas.data.registros || [])
        }
      } catch (error) {
        console.error('Error cargando razas dinámicas:', error)
      }
    }
    cargarRazas()
  }, [formulario.ESPECIE, catalogoEspecies])

  // Actualiza el campo que cambió; al cambiar especie, reinicia la raza
  const manejarCambio = ({ target: { name, value } }) => {
    if (name === 'ESPECIE') {
      setFormulario(prev => ({ ...prev, ESPECIE: value, ID_RAZARE: '' }))
    } else {
      setFormulario(prev => ({ ...prev, [name]: value }))
    }
  }

  // ── Handlers de operaciones CRUD ──────────────────────────────────────────

  const handleEnviar = async (e) => {
    e.preventDefault()

    const payload = {
      PERSON_CE: formulario.ID_PERSON,
      PERSON_NO: propietarioData?.PERSON_NO || 'No Registrado',
      PERSON_AP: propietarioData?.PERSON_AP || 'No Registrado',
      PERSON_TL: propietarioData?.PERSON_TL || '00000000000',
      PERSON_EM: propietarioData?.PERSON_EM || 'sin@correo.com',
      SECTOR_ID: parseInt(formulario.SECTOR_C) || null,
      COLORE_ID: parseInt(formulario.COL_ANIMA) || null,
      ESPECI_ID: parseInt(formulario.ESPECIE) || null,
      RAZARE_ID: parseInt(formulario.ID_RAZARE) || null,
      NOM_ANIMA: formulario.NOM_ANIMA,
      SEX_ANIMA: formulario.SEX_ANIMA,
      EDA_ANIMA: parseInt(formulario.EDAD_ANIMA) || 0,
      EST_REPRO: formulario.SINTOMA_C,
      FEC_CENSO: formulario.FECHA_CENS
    }

    console.log('== AUDITORÍA SISCVI: Payload del Censo a Neon ==', payload)

    try {
      const response = await api.post('/censo', payload)
      if (onGuardar) {
        onGuardar(response.data.registro || response.data)
      }
      setVistaActual('censo')
    } catch (error) {
      console.error('Error al registrar en el censo:', error)
      const msgError = error.response?.data?.error ? `\nDetalle SQL: ${error.response.data.error}` : ''
      alert(`${error.response?.data?.mensaje || 'Error al guardar el registro transaccional'}${msgError}`)
    }
  }
  
  const buscar = () => {
    console.log('BUSCAR – Cédula consultada:', formulario.ID_PERSON)
  }

  const modificar = () => {
    console.log('MODIFICAR – Datos actualizados:', formulario)
  }

  const eliminar = () => {
    console.log('ELIMINAR – Registro con cédula:', formulario.ID_PERSON)
  }

  // Cancelar limpia el formulario y regresa a la tabla sin guardar nada
  const cancelar = () => {
    setFormulario({
      ID_PERSON: '', NOM_ANIMA: '', ESPECIE: '', ID_RAZARE: '', SECTOR_C: '',
      COL_ANIMA: '', SEX_ANIMA: '', EDAD_ANIMA: '0', SINTOMA_C: '', FECHA_CENS: '',
    })
    setVistaActual('censo')
  }

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-[#765A05]/5 rounded-2xl p-8">

      {/* Banner de propietario verificado — visible cuando viene del flujo RegistroPropietario */}
      {propietarioData?.PERSON_CE && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-800">Propietario verificado</p>
            <p className="text-xs text-emerald-600 font-mono mt-0.5">{propietarioData.PERSON_CE} — cédula pre-cargada desde el registro de propietario</p>
          </div>
        </div>
      )}

      <form onSubmit={handleEnviar} noValidate>

        {/* ── FILA 1: Cédula · Nombre · Especie · Raza ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-6">

          {/* Cédula del dueño → ID_PERSON */}
          <div>
            <EtiquetaCampo label="Cédula Dueño" descripcion="ID_PERSON" />
            <input
              type="text"
              name="ID_PERSON"
              value={formulario.ID_PERSON}
              onChange={manejarCambio}
              placeholder="V-________"
              className={clsInput}
            />
          </div>
 
          {/* Nombre de la mascota → NOM_ANIMA */}
          <div>
            <EtiquetaCampo label="Nombre Mascota" descripcion="NOM_ANIMA" />
            <input
              type="text"
              name="NOM_ANIMA"
              value={formulario.NOM_ANIMA}
              onChange={manejarCambio}
              placeholder="Ej: Zeus"
              className={clsInput}
            />
          </div>

          {/* Especie → ESPECIE (TM_ESPECI) — determina qué razas se muestran */}
          <div>
            <EtiquetaCampo label="Especie" descripcion="TM_ESPECI" />
            <SelectCampo
              name="ESPECIE"
              value={formulario.ESPECIE}
              onChange={manejarCambio}
            >
              <option value="">Seleccione especie</option>
              {catalogoEspecies.map(e => (
                <option key={e.especi_id} value={e.especi_id}>{e.especi_no}</option>
              ))}
            </SelectCampo>
          </div>

          {/* Raza → ID_RAZARE (TM_RAZASG) — filtrado por especie */}
          <div>
            <EtiquetaCampo label="Raza" descripcion="TM_RAZASG" />
            <SelectCampo
              name="ID_RAZARE"
              value={formulario.ID_RAZARE}
              onChange={manejarCambio}
              disabled={!formulario.ESPECIE}
            >
              <option value="">
                {formulario.ESPECIE ? 'Seleccione raza' : 'Seleccione especie primero'}
              </option>
              {catalogoRazas.map(r => (
                <option key={r.razare_id} value={r.razare_id}>{r.razare_no}</option>
              ))}
            </SelectCampo>
          </div>
        </div>

        {/* ── FILA 2: Sector · Color · Sexo ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

          {/* Sector / Aldea → SECTOR_C */}
          <div>
            <EtiquetaCampo label="Sector" descripcion="Sector / Aldea" />
            <SelectCampo
              name="SECTOR_C"
              value={formulario.SECTOR_C}
              onChange={manejarCambio}
            >
              <option value="">Seleccione sector</option>
              {catalogoSectores.map(s => (
                <option key={s.sector_id} value={s.sector_id}>{s.sector_no}</option>
              ))}
            </SelectCampo>
          </div>

          {/* Color predominante → COL_ANIMA */}
          <div>
            <EtiquetaCampo label="Color" descripcion="Color Predominante" />
            <SelectCampo
              name="COL_ANIMA"
              value={formulario.COL_ANIMA}
              onChange={manejarCambio}
            >
              <option value="">Seleccione color</option>
              {catalogoColores.map(c => (
                <option key={c.colore_id} value={c.colore_id}>{c.colore_no}</option>
              ))}
            </SelectCampo>
          </div>

          {/* Sexo biológico → SEX_ANIMA */}
          <div>
            <EtiquetaCampo label="Sexo" descripcion="Sexo Biológico" />
            <SelectCampo
              name="SEX_ANIMA"
              value={formulario.SEX_ANIMA}
              onChange={manejarCambio}
            >
              <option value="">Seleccione sexo</option>
              <option value="M">Macho</option>
              <option value="H">Hembra</option>
            </SelectCampo>
          </div>
        </div>

        {/* ── FILA 3: Edad · Estado Reproductivo · Fecha ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

          {/* Edad estimada en meses → EDAD_ANIMA */}
          <div>
            <EtiquetaCampo label="Edad" descripcion="Edad Estimada (meses)" />
            <input
              type="number"
              name="EDAD_ANIMA"
              value={formulario.EDAD_ANIMA}
              onChange={manejarCambio}
              min="0"
              max="360"
              className={clsInput}
            />
          </div>

          {/* Estado reproductivo → SINTOMA_C */}
          <div>
            <EtiquetaCampo label="Estado" descripcion="Estado Reproductivo" />
            <SelectCampo
              name="SINTOMA_C"
              value={formulario.SINTOMA_C}
              onChange={manejarCambio}
            >
              <option value="">Seleccione estado</option>
              <option value="ENTERO">Entero/a</option>
              <option value="CASTRADO">Castrado / Esterilizado</option>
              <option value="GESTANTE">Gestante</option>
              <option value="LACTANTE">Lactante</option>
            </SelectCampo>
          </div>

          {/* Fecha del censo → FECHA_CENS */}
          <div>
            <EtiquetaCampo label="Fecha" descripcion="Fecha de Censo" />
            <input
              type="date"
              name="FECHA_CENS"
              value={formulario.FECHA_CENS}
              onChange={manejarCambio}
              className={clsInput}
            />
          </div>
        </div>

        {/* ── FILA DE BOTONES DE ACCIÓN ── */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Guardar: llama a onGuardar con el formulario y navega a la tabla */}
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#765A05] hover:bg-[#5a4304] active:bg-[#3d2d02] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>

          {/* Buscar → consulta por ID_PERSON */}
          <button
            type="button"
            onClick={buscar}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white
                       hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>

          {/* Modificar → actualiza el registro cargado */}
          <button
            type="button"
            onClick={modificar}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white
                       hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Modificar
          </button>

          {/* Eliminar → solo visible para ADMINISTRADOR */}
          {esAdmin && (
            <button
              type="button"
              onClick={eliminar}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white
                         hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}

          {/* Cancelar → limpia el formulario y regresa a la tabla sin guardar */}
          <button
            type="button"
            onClick={cancelar}
            className="flex items-center gap-2 text-red-500 px-6 py-2 rounded-lg hover:bg-red-50 transition ml-auto"
          >
            <X size={18} /> Cancelar
          </button>
        </div>

      </form>
    </div>
  )
}