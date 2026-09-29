import { createRoot } from 'react-dom/client'
import ModalConfirmarClave from '../Pages/ModalConfirmarClave'

// Abre el modal "Escriba su contraseña para confirmar" sobre la pantalla actual
// y devuelve una promesa: true si se eliminó, false si se canceló.
//
//   const eliminado = await confirmarConClave({
//     titulo:  'Eliminar Jornada',
//     mensaje: '¿Eliminar la jornada "X"?',
//     accion:  (clave) => api.delete(`/jornadas/${id}`, { data: { clave } }),
//   })
//   if (eliminado) { …quitar el registro de la lista… }
export default function confirmarConClave({ titulo, mensaje, accion }) {
  return new Promise((resolve) => {
    const contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    const raiz = createRoot(contenedor)

    const cerrar = (eliminado) => {
      raiz.unmount()
      contenedor.remove()
      resolve(eliminado)
    }

    raiz.render(<ModalConfirmarClave titulo={titulo} mensaje={mensaje} accion={accion} onListo={cerrar} />)
  })
}
