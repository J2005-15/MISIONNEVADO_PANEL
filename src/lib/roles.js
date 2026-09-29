// ── Roles del panel ────────────────────────────────────────────────────────────
// Convierte el nombre del rol de la BD al código interno. Si no lo reconoce
// devuelve null: ese usuario NO tiene acceso al panel.
export function normalizarRol(rolRaw) {
  const r = (rolRaw || '').toUpperCase().trim()
  if (r === 'ADMINISTRADOR' || r === 'ADMIN') return 'ADMINISTRADOR'
  if (r === 'VETERINARIO'   || r === 'VET')   return 'VETERINARIO'
  // Cubre: 'CAMPO', 'OPERADOR', 'PERSONAL DE CAMPO', 'PERSONAL CAMPO', etc.
  if (r.includes('CAMPO') || r.includes('OPERADOR')) return 'CAMPO'
  return null
}

// Rol de la sesión guardada (null si no hay sesión o el rol no es reconocido)
export function rolDeSesion() {
  try {
    const usuario = JSON.parse(localStorage.getItem('siscvi_usuario') || 'null')
    return usuario ? normalizarRol(usuario.ROLREG_NO) : null
  } catch {
    return null
  }
}

export function cerrarSesionLocal() {
  localStorage.removeItem('siscvi_token')
  localStorage.removeItem('siscvi_usuario')
}
