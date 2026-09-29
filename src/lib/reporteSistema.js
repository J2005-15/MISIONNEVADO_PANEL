// ── Reporte General del Sistema ───────────────────────────────────────────────
// Convierte la respuesta de GET /api/reportes/sistema en un documento con los
// colores del panel y abre el diálogo de impresión (desde ahí: "Guardar como PDF").

export const CREDITOS = '© 2026 ING JULIETH ANDRADE RAMIREZ — UNEFA NUCLEO TACHIRA — SISCVI'

const esc = (t) => String(t ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// 'YYYY-MM-DD' → dd/mm/aaaa sin pasar por Date (no se corre un día)
const fecha = (v) => {
  const s = String(v ?? '')
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { const [a, m, d] = s.split('-'); return `${d}/${m}/${a}` }
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
}
const num    = (n) => Number(n ?? 0).toLocaleString('es-VE')
const moneda = (n) => `$${Number(n ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const tarjeta = (titulo, valor, detalle = '') => `
  <div class="kpi"><p class="kpi-t">${esc(titulo)}</p><p class="kpi-v">${valor}</p>${detalle ? `<p class="kpi-d">${detalle}</p>` : ''}</div>`

const tabla = (columnas, filas, vacio = 'Sin registros en el periodo.') => filas.length
  ? `<table><thead><tr>${columnas.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
     <tbody>${filas.map(f => `<tr>${f.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  : `<p class="vacio">${esc(vacio)}</p>`

const seccion = (titulo, contenido) => `<section><h2>${esc(titulo)}</h2>${contenido}</section>`

const chipStock = (estado) => {
  const clase = estado === 'Agotado' ? 'rojo' : estado === 'Bajo mínimo' ? 'ambar' : 'verde'
  return `<span class="chip ${clase}">${esc(estado)}</span>`
}
const chipMovimiento = (tipo) =>
  `<span class="chip ${tipo === 'ENTRADA' ? 'verde' : tipo === 'SALIDA' ? 'rojo' : 'ambar'}">${esc({ ENTRADA: 'Entrada', SALIDA: 'Salida', AJUSTE: 'Ajuste' }[tipo] ?? tipo)}</span>`
const chipTipo = (tipo) => `<span class="chip ${tipo === 'CRITICO' ? 'rojo' : 'ambar'}">${tipo === 'CRITICO' ? 'CRÍTICO' : esc(tipo)}</span>`

export function construirReporteHTML(d, logoUrl) {
  const r = d.resumen
  const inst = d.institucion ?? {}
  const periodo = `${fecha(d.periodo.desde)} al ${fecha(d.periodo.hasta)}`

  const resumen = `
    <div class="kpis">
      ${tarjeta('Animales en el censo', num(r.censo.total), `${num(r.censo.periodo)} registrados en el periodo`)}
      ${tarjeta('Adopciones', num(r.adopciones.adoptados) + ' adoptados', `${num(r.adopciones.disponibles)} disponibles · ${num(r.adopciones.enProceso)} en proceso`)}
      ${tarjeta('Solicitudes de adopción', num(r.adopciones.solicitudes.periodo) + ' en el periodo', `${num(r.adopciones.solicitudes.pendientes)} pendientes · ${num(r.adopciones.solicitudes.aprobadas)} aprobadas · ${num(r.adopciones.solicitudes.rechazadas)} rechazadas`)}
      ${tarjeta('Consultas veterinarias', num(r.veterinaria.consultas), `${num(r.veterinaria.pacientes)} pacientes distintos`)}
      ${tarjeta('Jornadas', num(r.veterinaria.jornadas.periodo), `${num(r.veterinaria.jornadas.finalizadas)} finalizadas · ${num(r.veterinaria.jornadas.atendidos)} animales atendidos · ${num(r.veterinaria.jornadas.proximas)} próximas`)}
      ${tarjeta('Denuncias', num(r.denuncias.periodo) + ' en el periodo', r.denuncias.porEstado.map(e => `${num(e.total)} ${esc(String(e.estado).replace('_', ' ').toLowerCase())}`).join(' · '))}
      ${tarjeta('Colaboraciones', num(r.colaboraciones.periodo), `Aporte estimado: ${moneda(r.colaboraciones.monto)}`)}
      ${tarjeta('Voluntarios', num(r.voluntarios.activos) + ' activos', `${num(r.voluntarios.espera)} en espera de aprobación`)}
      ${tarjeta('Proteccionistas', num(r.proteccionistas.activos) + ' activos', `${num(r.proteccionistas.espera)} en espera de aprobación`)}
      ${tarjeta('Inventario', num(r.inventario.insumos) + ' insumos', `${num(r.inventario.bajoMinimo)} bajo mínimo · ${num(r.inventario.agotados)} agotados`)}
      ${tarjeta('Usuarios del panel', num(r.usuarios.activos) + ' activos', `de ${num(r.usuarios.total)} registrados`)}
      ${tarjeta('Bitácora del periodo', num(r.bitacora.info + r.bitacora.alertas + r.bitacora.criticos) + ' eventos', `${num(r.bitacora.alertas)} alertas · ${num(r.bitacora.criticos)} críticos`)}
    </div>`

  const censo = `
    <div class="dos">
      <div><h3>Por especie</h3>${tabla(['Especie', 'Animales'], r.censo.porEspecie.map(e => [esc(e.nombre), num(e.total)]), 'Sin animales censados.')}</div>
      <div><h3>Por sector</h3>${tabla(['Sector', 'Animales'], r.censo.porSector.map(e => [esc(e.nombre), num(e.total)]), 'Sin animales censados.')}</div>
    </div>
    <h3>Animales registrados en el periodo (${num(d.censoPeriodo.length)})</h3>
    ${tabla(['Fecha', 'Animal', 'Especie', 'Sector', 'Propietario', 'Cédula'],
      d.censoPeriodo.map(c => [fecha(c.fecha), esc(c.animal), esc(c.especie ?? '—'), esc(c.sector ?? '—'), esc(c.dueno || '—'), esc(c.cedula ?? '—')]))}
    <h3>Movimientos del censo (${num(d.movimientosCenso.length)})</h3>
    ${tabla(['Fecha y hora', 'Usuario', 'Movimiento'], d.movimientosCenso.map(m => [fecha(m.fecha), esc(m.usuario), esc(m.accion)]))}`

  const inventario = `
    <h3>Stock actual</h3>
    ${tabla(['Insumo', 'Categoría', 'Existencia', 'Mínimo', 'Vence', 'Estado'],
      d.stock.map(s => [esc(s.insumo), esc(s.categoria ?? '—'), `${num(s.existencia)} ${esc(s.unidad ?? '')}`, num(s.minimo), s.vence ? fecha(s.vence) : '—', chipStock(s.estado)]),
      'No hay insumos registrados.')}
    <h3>Movimientos de stock en el periodo (${num(d.movimientosStock.length)})</h3>
    ${tabla(['Fecha y hora', 'Insumo', 'Tipo', 'Cantidad', 'Antes → Después', 'Motivo', 'Usuario'],
      d.movimientosStock.map(m => [
        fecha(m.fecha), esc(m.insumo), chipMovimiento(m.tipo),
        `${m.tipo === 'SALIDA' ? '−' : m.tipo === 'ENTRADA' ? '+' : ''}${num(m.cantidad)} ${esc(m.unidad ?? '')}`,
        `${num(m.anterior)} → ${num(m.nueva)}`, esc(m.motivo), esc(m.usuario ?? '—'),
      ]))}`

  const colaboraciones = r.colaboraciones.porTipo.length
    ? tabla(['Tipo de colaboración', 'Cantidad'], r.colaboraciones.porTipo.map(t => [esc(t.tipo), num(t.total)]))
    : '<p class="vacio">Sin colaboraciones en el periodo.</p>'

  const eventos = tabla(['Fecha y hora', 'Tipo', 'Módulo', 'Usuario', 'Evento'],
    d.eventosImportantes.map(e => [fecha(e.fecha), chipTipo(e.tipo), esc(e.modulo), esc(e.usuario), esc(e.accion)]),
    'Sin alertas ni eventos críticos en el periodo.')

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Reporte SISCVI ${esc(d.periodo.desde)} a ${esc(d.periodo.hasta)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Geist Variable', 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 11px; margin: 0; }
  header { display: flex; align-items: center; gap: 16px; padding: 14px 18px; background: #765A05; color: #fff; border-radius: 14px; }
  header img { height: 54px; background: #fff; border-radius: 10px; padding: 4px; }
  header h1 { margin: 0; font-size: 18px; }
  header p { margin: 2px 0 0; color: #FFDF96; font-size: 11px; }
  .meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin: 10px 2px 4px; color: #6b7280; }
  .meta b { color: #765A05; }
  section { margin-top: 16px; }
  h2 { font-size: 13px; color: #765A05; text-transform: uppercase; letter-spacing: .08em; border-bottom: 2px solid #FFDF96; padding-bottom: 4px; margin: 0 0 8px; break-after: avoid; }
  h3 { font-size: 11.5px; color: #374151; margin: 12px 0 6px; break-after: avoid; }
  .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .kpi { background: #FFEFD1; border: 1px solid #FFDF96; border-radius: 10px; padding: 8px 10px; break-inside: avoid; }
  .kpi-t { margin: 0; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #765A05; }
  .kpi-v { margin: 3px 0 0; font-size: 15px; font-weight: 800; color: #111827; }
  .kpi-d { margin: 2px 0 0; font-size: 9.5px; color: #6b7280; }
  .dos { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  table { width: 100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  th { background: #765A05; color: #fff; text-align: left; font-size: 9.5px; text-transform: uppercase; letter-spacing: .04em; padding: 5px 7px; }
  td { padding: 4px 7px; border-bottom: 1px solid #f1e6cc; vertical-align: top; }
  tr { break-inside: avoid; }
  tbody tr:nth-child(even) td { background: #fffaf0; }
  .vacio { color: #9ca3af; font-style: italic; margin: 4px 2px; }
  .chip { display: inline-block; padding: 1px 7px; border-radius: 999px; font-size: 9px; font-weight: 700; }
  .verde { background: #d1fae5; color: #047857; } .ambar { background: #fef3c7; color: #b45309; } .rojo { background: #ffe4e6; color: #be123c; }
  footer { margin-top: 22px; padding-top: 8px; border-top: 1px solid #FFDF96; text-align: center; color: #9ca3af; font-size: 9.5px; }
  footer b { color: #765A05; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style></head>
<body>
  <header>
    ${logoUrl ? `<img src="${esc(logoUrl)}" alt="Logo">` : ''}
    <div>
      <h1>Reporte General del Sistema</h1>
      <p>${esc(inst.nombre || 'Fundación Misión Nevado')}${inst.lema ? ` · ${esc(inst.lema)}` : ''}</p>
    </div>
  </header>
  <div class="meta">
    <span>Periodo: <b>${periodo}</b></span>
    <span>Generado: <b>${fecha(d.generado)}</b> por <b>${esc(d.generadoPor)}</b></span>
  </div>

  ${seccion('Resumen del sistema', resumen)}
  ${seccion('Censo animal', censo)}
  ${seccion('Inventario y stock', inventario)}
  ${seccion('Colaboraciones del periodo', colaboraciones)}
  ${seccion('Alertas y eventos críticos de la bitácora', eventos)}

  <footer><b>${esc(CREDITOS)}</b></footer>
</body></html>`
}

// Imprime el documento en un iframe oculto (no lo bloquea el navegador como a una ventana emergente)
export function imprimirReporte(html) {
  const marco = document.createElement('iframe')
  Object.assign(marco.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' })
  document.body.appendChild(marco)

  const doc = marco.contentWindow.document
  doc.open(); doc.write(html); doc.close()

  const quitar = () => setTimeout(() => marco.remove(), 500)
  const imprimir = () => {
    marco.contentWindow.onafterprint = quitar
    marco.contentWindow.focus()
    marco.contentWindow.print()
    setTimeout(() => marco.isConnected && marco.remove(), 120000)   // respaldo
  }

  // Espera a que cargue el logo antes de imprimir
  const imagenes = Array.from(doc.images)
  Promise.all(imagenes.map(img => img.complete ? null : new Promise(ok => { img.onload = ok; img.onerror = ok })))
    .then(() => setTimeout(imprimir, 150))
}
