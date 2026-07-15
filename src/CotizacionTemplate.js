// Función que genera el HTML completo de la cotización como string
// Se usa con window.print() para generar PDF

export const generarCotizacionHTML = (evento) => {
  // ============ HELPERS ============
  const formatMoney = (num) => {
    if (!num && num !== 0) return '$0';
    return '$' + Math.round(num).toLocaleString('es-AR');
  };

  const toTitleCase = (texto) => {
    if (!texto) return '';
    return texto.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // ============ DATOS ============
  const adultos = evento.adultos || 0;
  const menores = evento.menores || 0;
  const precioMenor = evento.precio_menor || 0;
  const menuDetalle = evento.menu_detalle || {};
  const opcionSugerida = evento.opcion_sugerida || '';

  // Fechas
  const fechaCreacion = evento.created_at ? new Date(evento.created_at) : new Date();
  const fechaEmision = fechaCreacion.toLocaleDateString('es-AR');
  const fechaValidez = new Date(fechaCreacion.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR');
  const numCotizacion = evento.id ? String(evento.id).slice(-6).toUpperCase() : String(Date.now()).slice(-6);

  // Fecha evento formateada
  let fechaEventoStr = evento.fecha || 'A confirmar';
  if (evento.fecha) {
    try {
      const date = new Date(evento.fecha + 'T12:00:00');
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      fechaEventoStr = `${dias[date.getDay()]}, ${date.getDate()} ${meses[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      fechaEventoStr = evento.fecha;
    }
  }

  // ============ PRECIOS PÁGINA 2 ============
  // Usar precios del evento, con fallback a precio_adulto o defaults
  const CLASSIC_PP = evento.precio_classic || evento.precio_adulto || 120000;
  const PREMIUM_PP = evento.precio_premium || evento.precio_adulto || 135000;
  const GOLD_PP = evento.precio_gold || evento.precio_adulto || 155000;

  // Detectar si es evento legacy (sin opcion_sugerida)
  const esEventoLegacy = !opcionSugerida && evento.precio_adulto > 0;

  // Subtotal 1: solo adultos
  const sub1Classic = CLASSIC_PP * adultos;
  const sub1Premium = PREMIUM_PP * adultos;
  const sub1Gold = GOLD_PP * adultos;

  // Menores (igual para los 3 paquetes)
  const menoresTotal = menores * precioMenor;

  // Extras confirmados (solo para el paquete seleccionado)
  let extrasConfirmadosTotal = 0;
  const extrasConfirmadosHTML = [];

  [1, 2, 3].forEach(i => {
    const desc = evento['extra' + i + '_desc'];
    const valor = parseFloat(evento['extra' + i + '_valor']) || 0;
    const tipo = evento['extra' + i + '_tipo'];
    const confirmado = evento['extra' + i + '_confirmado'];
    if (desc && valor > 0 && confirmado) {
      const subtotalExtra = tipo === 'por_persona' ? valor * adultos : valor;
      extrasConfirmadosTotal += subtotalExtra;
      // Solo nombre + total, sin detalle de "X pers · $precio/pp"
      extrasConfirmadosHTML.push(`
        <div class="pkg-row">
          <span>${toTitleCase(desc)}</span>
          <span>${formatMoney(subtotalExtra)}</span>
        </div>
      `);
    }
  });

  // Técnica confirmada
  const tecnicaPrecio = parseFloat(evento.tecnica_precio) || 0;
  if (evento.tecnica && tecnicaPrecio > 0) {
    extrasConfirmadosTotal += tecnicaPrecio;
    extrasConfirmadosHTML.push(`
      <div class="pkg-row">
        <span>Técnica de sonido e iluminación</span>
        <span>${formatMoney(tecnicaPrecio)}</span>
      </div>
    `);
  }

  // Técnica superior confirmada
  const tecnicaSupPrecio = parseFloat(evento.tecnica_superior_precio) || 0;
  if (evento.tecnica_superior && tecnicaSupPrecio > 0) {
    extrasConfirmadosTotal += tecnicaSupPrecio;
    extrasConfirmadosHTML.push(`
      <div class="pkg-row">
        <span>Técnica superior</span>
        <span>${formatMoney(tecnicaSupPrecio)}</span>
      </div>
    `);
  }

  // Subtotal 2 y totales para cada paquete
  const hayExtrasOMenores = menores > 0 || extrasConfirmadosTotal > 0;

  // CLASSIC
  const sub2Classic = sub1Classic + menoresTotal + (opcionSugerida === 'Classic' ? extrasConfirmadosTotal : 0);
  const ivaClassic = sub2Classic * 0.21;
  const totClassic = sub2Classic + ivaClassic;

  // PREMIUM
  const sub2Premium = sub1Premium + menoresTotal + (opcionSugerida === 'Premium' ? extrasConfirmadosTotal : 0);
  const ivaPremium = sub2Premium * 0.21;
  const totPremium = sub2Premium + ivaPremium;

  // GOLD
  const sub2Gold = sub1Gold + menoresTotal + (opcionSugerida === 'Gold' ? extrasConfirmadosTotal : 0);
  const ivaGold = sub2Gold * 0.21;
  const totGold = sub2Gold + ivaGold;

  // ============ MODO LEGACY - Cálculos ============
  const precioAdultoLegacy = evento.precio_adulto || 0;
  const subtotalAdultosLegacy = precioAdultoLegacy * adultos;

  // Construir filas de la tabla legacy
  let legacyRows = [];
  let subtotalLegacy = 0;

  // Fila adultos
  if (adultos > 0 && precioAdultoLegacy > 0) {
    legacyRows.push({
      concepto: 'Adultos',
      cant: adultos,
      precio: precioAdultoLegacy,
      subtotal: subtotalAdultosLegacy
    });
    subtotalLegacy += subtotalAdultosLegacy;
  }

  // Fila menores
  if (menores > 0 && precioMenor > 0) {
    legacyRows.push({
      concepto: 'Menores',
      cant: menores,
      precio: precioMenor,
      subtotal: menoresTotal
    });
    subtotalLegacy += menoresTotal;
  }

  // Extras confirmados para legacy
  [1, 2, 3].forEach(i => {
    const desc = evento['extra' + i + '_desc'];
    const valor = parseFloat(evento['extra' + i + '_valor']) || 0;
    const tipo = evento['extra' + i + '_tipo'];
    const confirmado = evento['extra' + i + '_confirmado'];
    if (desc && valor > 0 && confirmado) {
      const subtotalExtra = tipo === 'por_persona' ? valor * adultos : valor;
      legacyRows.push({
        concepto: toTitleCase(desc),
        cant: tipo === 'por_persona' ? adultos : 1,
        precio: valor,
        subtotal: subtotalExtra
      });
      subtotalLegacy += subtotalExtra;
    }
  });

  // Técnica para legacy
  if (evento.tecnica && tecnicaPrecio > 0) {
    legacyRows.push({
      concepto: 'Técnica de sonido e iluminación',
      cant: 1,
      precio: tecnicaPrecio,
      subtotal: tecnicaPrecio
    });
    subtotalLegacy += tecnicaPrecio;
  }

  // Técnica superior para legacy
  if (evento.tecnica_superior && tecnicaSupPrecio > 0) {
    legacyRows.push({
      concepto: 'Técnica superior',
      cant: 1,
      precio: tecnicaSupPrecio,
      subtotal: tecnicaSupPrecio
    });
    subtotalLegacy += tecnicaSupPrecio;
  }

  const ivaLegacy = subtotalLegacy * 0.21;
  const totalLegacy = subtotalLegacy + ivaLegacy;

  // Generar HTML de filas legacy
  const legacyRowsHTML = legacyRows.map(row => `
    <tr>
      <td>${row.concepto}</td>
      <td>${row.cant}</td>
      <td>${formatMoney(row.precio)}</td>
      <td>${formatMoney(row.subtotal)}</td>
    </tr>
  `).join('');

  // Observaciones para legacy
  const observacionesLegacy = evento.otros || evento.observaciones || '';

  // ============ MENÚ - Distribuir en 2 columnas ============
  const categoriasValidas = (menuDetalle.categorias || []).filter(c =>
    c.items && c.items.length > 0 && c.items.some(item => item && item.trim() !== '')
  ).map(cat => ({
    ...cat,
    items: cat.items.filter(item => item && item.trim() !== '')
  }));

  // Balancear columnas
  const totalItems = categoriasValidas.reduce((sum, c) => sum + c.items.length + 2, 0);
  const mitad = totalItems / 2;
  let col1 = [];
  let col2 = [];
  let countCol1 = 0;

  categoriasValidas.forEach(cat => {
    const catWeight = cat.items.length + 2;
    if (countCol1 + catWeight <= mitad || col1.length === 0) {
      col1.push(cat);
      countCol1 += catWeight;
    } else {
      col2.push(cat);
    }
  });

  // Notas por defecto de "a elección" según categoría (Menu Tapeo)
  const NOTAS_CATEGORIA = {
    'Cazuelas': '2 a elección',
    'Fin de Fiesta': '1 a elección'
  };
  const notaCategoria = (nombre) => NOTAS_CATEGORIA[nombre]
    ? `<div class="cnote">${NOTAS_CATEGORIA[nombre]}</div>`
    : '';

  // Generar HTML del menú columna 1
  const menuCol1HTML = col1.map(cat => `
    <div class="ct">${cat.nombre.toUpperCase()}</div>
    ${notaCategoria(cat.nombre)}
    ${cat.items.map(item => `<div class="ci">${item}</div>`).join('')}
    <div class="csp"></div>
  `).join('');

  // Generar HTML del menú columna 2
  const menuCol2HTML = col2.map(cat => `
    <div class="ct">${cat.nombre.toUpperCase()}</div>
    ${notaCategoria(cat.nombre)}
    ${cat.items.map(item => `<div class="ci">${item}</div>`).join('')}
    <div class="csp"></div>
  `).join('');

  // ============ OPCIONALES - TODOS LOS EXTRAS ============
  let opcionalesHTML = '';
  const todosLosExtras = [];

  [1, 2, 3].forEach(i => {
    const desc = evento['extra' + i + '_desc'];
    const valor = evento['extra' + i + '_valor'];
    const tipo = evento['extra' + i + '_tipo'];
    // Mostrar TODOS los extras sin importar si están confirmados
    if (desc && valor > 0) {
      const total = tipo === 'por_persona' ? valor * adultos : valor;
      const nombreTitleCase = toTitleCase(desc);
      if (tipo === 'por_persona') {
        todosLosExtras.push(`
          <div class="oprow-grid">
            <span>${nombreTitleCase} · ${adultos} pers</span>
            <span class="op-price">${formatMoney(valor)}/pp</span>
            <span class="op-subtotal">${formatMoney(total)}</span>
          </div>
        `);
      } else {
        todosLosExtras.push(`
          <div class="oprow-grid">
            <span>${nombreTitleCase}</span>
            <span class="op-price">—</span>
            <span class="op-subtotal">${formatMoney(total)}</span>
          </div>
        `);
      }
    }
  });

  // DJ (informativo, sin precio)
  if (evento.dj) {
    todosLosExtras.push(`
      <div class="oprow">
        <span>DJ: ${toTitleCase(evento.dj)}</span>
      </div>
    `);
  }

  // Observaciones/otros en Title Case
  const observaciones = evento.otros || evento.observaciones || '';
  let observacionesHTML = '';
  if (observaciones && observaciones.trim()) {
    observacionesHTML = `<div class="obs">* ${toTitleCase(observaciones.trim())}</div>`;
  }

  if (todosLosExtras.length > 0 || observacionesHTML) {
    opcionalesHTML = `
      <div class="opc">
        <div class="opt">OPCIONALES — Servicios adicionales disponibles</div>
        ${todosLosExtras.join('')}
        ${observacionesHTML}
      </div>
    `;
  }

  // Versión sin observaciones para modo Libre (ya tiene su propia sección de observaciones)
  let opcionalesLegacyHTML = '';
  if (todosLosExtras.length > 0) {
    opcionalesLegacyHTML = `
      <div class="opc">
        <div class="opt">OPCIONALES — Servicios adicionales disponibles</div>
        ${todosLosExtras.join('')}
      </div>
    `;
  }

  // ============ BADGES Y HEADERS ============
  // Badges fijos por paquete (PREMIUM y GOLD siempre tienen badge)
  const badgePremium = '<div class="rec">★ RECOMENDADO</div>';
  const badgeGold = '<div class="rec gold-badge">✦ LA EXPERIENCIA COMPLETA</div>';

  // Header verde oliva para el paquete seleccionado
  const headerClassic = opcionSugerida === 'Classic'
    ? '<div class="ph selected"><span>CLASSIC</span><span class="sel-tag">✓ Opción seleccionada</span></div>'
    : '<div class="ph">CLASSIC</div>';
  const headerPremium = opcionSugerida === 'Premium'
    ? '<div class="ph selected"><span>PREMIUM</span><span class="sel-tag">✓ Opción seleccionada</span></div>'
    : '<div class="ph">PREMIUM</div>';
  const headerGold = opcionSugerida === 'Gold'
    ? '<div class="ph selected"><span>GOLD</span><span class="sel-tag">✓ Opción seleccionada</span></div>'
    : '<div class="ph">GOLD</div>';

  // HTML de extras confirmados para cada paquete (solo el seleccionado los incluye)
  const extrasHTMLClassic = opcionSugerida === 'Classic' ? extrasConfirmadosHTML.join('') : '';
  const extrasHTMLPremium = opcionSugerida === 'Premium' ? extrasConfirmadosHTML.join('') : '';
  const extrasHTMLGold = opcionSugerida === 'Gold' ? extrasConfirmadosHTML.join('') : '';

  // Bloque opción sugerida para página 1 (solo si tiene valor)
  let bloqueOpcionSugerida = '';
  if (opcionSugerida) {
    // Font-size dinámico según longitud del nombre
    let sugFontSize = '18px';
    let sugLetterSpacing = '1px';
    if (opcionSugerida === 'Premium') {
      sugFontSize = '16px';
    } else if (opcionSugerida.length > 7) {
      sugFontSize = '14px';
      sugLetterSpacing = '0';
    }
    bloqueOpcionSugerida = `
      <div class="sug-box">
        <div class="sug-left">
          <div class="sug-label">OPCIÓN SUGERIDA</div>
          <div class="sug-name" style="font-size:${sugFontSize};letter-spacing:${sugLetterSpacing}">${opcionSugerida.toUpperCase()}</div>
        </div>
        <div class="sug-right">
          <div class="sug-desc">Esta propuesta fue armada en base a lo conversado, contemplando el formato del evento, la cantidad de invitados y la dinámica prevista.</div>
        </div>
      </div>
    `;
  }

  // ============ HTML COMPLETO ============
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${evento.cliente || 'Evento'} - ${evento.fecha ? evento.fecha.split('-').reverse().join('-') : ''}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      html, body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .page {
        page-break-after: always;
        page-break-inside: avoid;
      }
      .page:last-child {
        page-break-after: auto;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      background: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page {
      width: 210mm;
      height: 297mm;
      background: white;
      overflow: hidden;
    }

    /* Tipografías */
    .font-display { font-family: 'Playfair Display', Georgia, serif; }
    .font-body { font-family: 'Inter', Arial, sans-serif; }

    /* PAGE 1 */
    .p1 { display: flex; min-height: 297mm; }
    .sidebar {
      width: 55mm;
      min-width: 55mm;
      background: #1A1A1A !important;
      padding: 6mm 4mm;
      display: flex;
      flex-direction: column;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .s-logo { width: 40mm; height: auto; margin: 0 auto 4mm; display: block; }
    .s-brand {
      color: white;
      font-size: 24pt;
      font-weight: 700;
      letter-spacing: 3px;
      text-align: center;
      font-family: 'Playfair Display', Georgia, serif;
    }
    .s-sub {
      color: #C9A84C;
      font-size: 7pt;
      letter-spacing: 4px;
      text-align: center;
      margin-bottom: 4mm;
    }
    .s-title {
      color: white;
      font-size: 14pt;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 2mm;
      font-family: 'Playfair Display', Georgia, serif;
    }
    .s-prop { color: #C9A84C; font-size: 6pt; letter-spacing: 2px; margin-bottom: 4mm; }
    .s-hr { border: none; border-top: 0.5pt solid #C9A84C; margin: 3mm 0; }
    .s-tag { color: #B0B0B0; font-size: 6.5pt; font-style: italic; line-height: 1.5; margin-bottom: 5mm; }
    .benefit { display: flex; align-items: flex-start; gap: 2mm; margin-bottom: 3mm; }
    .bico {
      width: 4mm;
      height: 4mm;
      min-width: 4mm;
      background: #C9A84C !important;
      border-radius: 1mm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7pt;
      color: #1A1A1A;
      font-weight: bold;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .btxt { color: white; font-size: 6.5pt; font-weight: 600; line-height: 1.3; }
    .s-foot {
      margin-top: auto;
      border-top: 0.5pt solid #8B7A3E;
      padding-top: 3mm;
      color: #C9A84C;
      font-size: 6pt;
      font-style: italic;
      text-align: center;
      line-height: 1.5;
    }

    .content { flex: 1; padding: 5mm 6mm; display: flex; flex-direction: column; }
    .topline {
      font-size: 7pt;
      color: #888;
      margin-bottom: 4mm;
      border-bottom: 1pt solid #C9A84C;
      padding-bottom: 2mm;
    }
    .topline strong { color: #333; }

    .boxes { display: flex; gap: 4mm; margin-bottom: 4mm; }
    .box { flex: 1; border: 0.5pt solid #D4D4D4; padding: 12px; }

    /* Bloque Opción Sugerida */
    .sug-box {
      background: #F9F7F2 !important;
      border: 1px solid #C9A84C;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 4mm;
      display: flex;
      gap: 16px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .sug-left { width: 30%; }
    .sug-right { width: 70%; }
    .sug-label {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 8px;
      font-weight: 700;
      color: #C9A84C;
      letter-spacing: 1px;
      margin-bottom: 2mm;
    }
    .sug-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      font-weight: 700;
      color: #1A1A1A;
    }
    .sug-desc {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 8px;
      font-style: italic;
      color: #666;
      line-height: 1.6;
    }
    .box-t {
      color: #C9A84C;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 3mm;
    }
    .brow { display: flex; gap: 2mm; align-items: baseline; margin-bottom: 2mm; }
    .blbl { font-size: 9pt; color: #888; min-width: 18mm; }
    .bval { font-size: 9pt; color: #222; font-weight: 600; }

    .menu-wrap {
      border: 0.5pt solid #C9A84C;
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .m-title {
      text-align: center;
      font-size: 14pt;
      font-weight: 700;
      color: #1A1A1A;
      letter-spacing: 1px;
      font-family: 'Playfair Display', Georgia, serif;
    }
    .m-line { border: none; border-top: 1pt solid #C9A84C; width: 15mm; margin: 1mm auto 1mm; }
    .m-sub {
      text-align: center;
      font-size: 7pt;
      color: #888;
      font-style: italic;
      margin-bottom: 3mm;
    }
    .mcols { display: flex; gap: 4mm; flex: 1; }
    .mcol { flex: 1; }
    .ct {
      font-size: 9pt;
      font-weight: 700;
      color: #C9A84C;
      margin-bottom: 2mm;
      border-bottom: 0.3pt solid #eee;
      padding-bottom: 2mm;
    }
    .ci { font-size: 8pt; color: #444; line-height: 1.8; padding-left: 2mm; }
    .ci::before { content: "· "; color: #C9A84C; }
    .cnote { font-size: 7.5pt; font-style: italic; color: #8a7a3f; margin: -1mm 0 1.5mm 0; }
    .csp { height: 12px; }
    .bevs {
      display: flex;
      gap: 4mm;
      margin-top: auto;
      padding-top: 12px;
      border-top: 0.3pt solid #ddd;
    }
    .bev { flex: 1; text-align: center; font-size: 9pt; color: #555; }
    .bev-i { font-size: 20px; display: block; margin-bottom: 2mm; }
    .p1-banner {
      background: #1A1A1A !important;
      padding: 10px 16px;
      margin-top: auto;
      text-align: center;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .p1-banner-txt {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-size: 13px;
      color: #C9A84C;
    }
    .p1-foot {
      text-align: center;
      font-size: 7pt;
      color: #888;
      font-style: italic;
      margin-top: 3mm;
      padding-top: 2mm;
      border-top: 0.3pt solid #ddd;
    }
    .pnum { text-align: right; font-size: 8pt; font-weight: 700; color: #C9A84C; margin-top: 2mm; }

    /* PAGE 2 */
    .p2 { padding: 0 6mm; min-height: 297mm; display: flex; flex-direction: column; }
    .p2-bar {
      height: 2mm;
      background: #C9A84C !important;
      margin-bottom: 5mm;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .p2-title {
      font-size: 18pt;
      font-weight: 700;
      text-align: center;
      color: #1A1A1A;
      letter-spacing: 2px;
      margin-bottom: 2mm;
      font-family: 'Playfair Display', Georgia, serif;
    }
    .p2-ln { width: 20mm; border: none; border-top: 1.5pt solid #C9A84C; margin: 0 auto 2mm; }
    .p2-sub { font-size: 7.5pt; color: #888; text-align: center; margin-bottom: 5mm; }

    .pkgs { display: flex; gap: 3mm; margin-bottom: 4mm; }
    .pkg { flex: 1; border: 0.5pt solid #D0D0D0; display: flex; flex-direction: column; }
    .pkg.prem {
      border: 1.5pt solid #C9A84C;
      background: #FBF8F0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .ph {
      background: #1A1A1A !important;
      color: white;
      text-align: center;
      padding: 2.5mm 2mm;
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: 1px;
      font-family: 'Playfair Display', Georgia, serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .ph.selected {
      background: #5C6B2F !important;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2.5mm 3mm;
    }
    .sel-tag {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 7px;
      font-weight: 600;
      letter-spacing: 0.5px;
      opacity: 0.9;
    }
    .pkg.prem .ph { background: #C9A84C !important; }
    .pkg.prem .ph.selected { background: #5C6B2F !important; }
    .rec {
      background: #C9A84C !important;
      color: white;
      font-family: 'Inter', Arial, sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      padding: 4px 8px;
      letter-spacing: 1px;
      width: 100%;
      display: block;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .rec.gold-badge {
      background: #1A1A1A !important;
      color: #C9A84C;
    }
    .pkg-row {
      display: flex;
      justify-content: space-between;
      font-size: 7.5px;
      color: #555;
      margin-bottom: 1mm;
      padding: 0;
      white-space: nowrap;
    }
    .pkg-row span:last-child {
      font-weight: 500;
      color: #555;
    }
    .pkg-subtotal {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      font-weight: 700;
      color: #1A1A1A;
      border-top: 0.5px solid #ddd;
      padding-top: 3px;
      margin-top: 3px;
    }
    .pkg-iva {
      display: flex;
      justify-content: space-between;
      font-size: 7px;
      color: #9CA3AF;
      margin: 2px 0;
    }
    .pkg-total {
      display: flex;
      justify-content: space-between;
      border-top: 0.5pt solid #1A1A1A;
      padding-top: 3px;
      margin-top: 3px;
    }
    .pkg.prem .pkg-total { border-top-color: #C9A84C; }
    .pkg-total-label {
      font-size: 10px;
      font-weight: 700;
      color: #1A1A1A;
    }
    .pkg-total-value {
      font-size: 11px;
      font-weight: 700;
      color: #1A1A1A;
    }
    .pkg.prem .pkg-total-value { color: #C9A84C; }
    .pb { padding: 16px; flex: 1; display: flex; flex-direction: column; }
    .pp {
      font-size: 32px;
      font-weight: 700;
      color: #1A1A1A;
      margin-bottom: 1mm;
      font-family: 'Playfair Display', Georgia, serif;
    }
    .pkg.prem .pp { color: #C9A84C; }
    .ppu { font-size: 9pt; color: #9CA3AF; margin-bottom: 3mm; }
    .pdiv { border: none; border-top: 0.3pt solid #D0D0D0; margin: 2mm 0; }
    .pkg.prem .pdiv { border-color: #C9A84C; }
    .pi { display: flex; align-items: center; gap: 2mm; margin-bottom: 3px; line-height: 1.3; }
    .dot {
      width: 1.8mm;
      height: 1.8mm;
      border-radius: 50%;
      min-width: 1.8mm;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .dot.g { background: #5C6B2F !important; }
    .dot.gold { background: #C9A84C !important; }
    .pit { font-size: 7.5px; color: #333; }
    .pkg-sep { font-family: 'Inter', sans-serif; font-size: 7pt; color: #C9A84C; font-weight: 600; margin: 6px 0 4px 0; }
    .ptag { font-size: 8pt; color: #C9A84C; font-style: italic; text-align: center; margin: 3mm 0; }
    .ptots { margin-top: auto; padding-top: 4mm; border-top: 0.3pt solid #D0D0D0; }
    .prow { display: flex; justify-content: space-between; margin-bottom: 2mm; }
    .prl { font-size: 9pt; color: #888; }
    .prv { font-size: 9pt; color: #555; }
    .ptot { display: flex; justify-content: space-between; padding-top: 2mm; border-top: 0.5pt solid #1A1A1A; margin-top: 2mm; }
    .pkg.prem .ptot { border-top-color: #C9A84C; }
    .ptl { font-size: 10pt; font-weight: 700; }
    .ptv { font-size: 11pt; font-weight: 700; }
    .pkg.prem .ptv { color: #C9A84C; }

    .opc {
      background: #FAF8F3 !important;
      border: 0.5pt solid #D4D4D4;
      padding: 12px;
      margin-bottom: 5mm;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .opt { font-size: 9pt; font-weight: 700; color: #555; margin-bottom: 3mm; }
    .oprow { font-size: 9pt; color: #777; margin-bottom: 2mm; }
    .oprow-grid {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      align-items: baseline;
      margin-bottom: 4px;
      font-size: 9pt;
      color: #555;
    }
    .op-price { color: #888; min-width: 80px; text-align: right; }
    .op-subtotal { font-weight: 600; min-width: 90px; text-align: right; }
    .obs { font-size: 9pt; color: #888; font-style: italic; margin-top: 2mm; }

    .conds { display: flex; gap: 4mm; margin-bottom: 5mm; }
    .cc { flex: 1; }
    .cct { font-size: 9pt; font-weight: 700; color: #333; margin-bottom: 2mm; }
    .cci { font-size: 8pt; color: #666; line-height: 1.8; }
    .cci::before { content: "· "; }
    .clogo { text-align: right; }
    .c-logo-img { width: 45mm; height: auto; }

    .p2f {
      background: #1A1A1A !important;
      margin: auto -6mm 0;
      padding: 3mm 6mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .p2ft { font-size: 6pt; color: #B0B0B0; }
    .p2fn { font-size: 8pt; font-weight: 700; color: #C9A84C; }

    /* ============ MODO LEGACY ============ */
    .legacy-title {
      font-family: 'Playfair Display', serif;
      font-size: 16pt;
      font-weight: 700;
      text-align: center;
      color: #1A1A1A;
      margin-bottom: 3mm;
    }
    .legacy-line {
      border: none;
      border-top: 1.5pt solid #C9A84C;
      margin: 0 auto 5mm;
      width: 60%;
    }
    .legacy-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5mm;
    }
    .legacy-table th {
      background: #1A1A1A !important;
      color: #fff;
      font-size: 8pt;
      font-weight: 600;
      padding: 3mm 2mm;
      text-align: left;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .legacy-table th:nth-child(2),
    .legacy-table th:nth-child(3),
    .legacy-table th:nth-child(4) { text-align: right; }
    .legacy-table td {
      font-size: 9pt;
      padding: 2.5mm 2mm;
      border-bottom: 0.3pt solid #E0E0E0;
    }
    .legacy-table td:nth-child(2),
    .legacy-table td:nth-child(3),
    .legacy-table td:nth-child(4) { text-align: right; }
    .legacy-table tr:nth-child(even) {
      background: #FAFAFA !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .legacy-subtotal td {
      font-weight: 700;
      border-top: 1pt solid #1A1A1A;
      padding-top: 3mm;
    }
    .legacy-iva td {
      font-size: 8pt;
      color: #888;
    }
    .legacy-total td {
      font-size: 11pt;
      font-weight: 700;
      color: #1A1A1A;
      border-top: 1.5pt solid #C9A84C;
      padding-top: 3mm;
    }
    .legacy-obs {
      margin-top: 5mm;
      padding: 3mm;
      background: #FAF8F3 !important;
      border: 0.5pt solid #D4D4D4;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .legacy-obs-title {
      font-size: 8pt;
      font-weight: 700;
      color: #555;
      margin-bottom: 2mm;
    }
    .legacy-obs-text {
      font-size: 9pt;
      color: #666;
      font-style: italic;
    }
  </style>
</head>
<body>

<!-- PÁGINA 1 -->
<div class="page">
  <div class="p1">
    <div class="sidebar">
      <img src="/logo-tero-blanco.png" class="s-logo" alt="Tero Restó">
      <div class="s-title">COTIZACIÓN<br>DE EVENTO</div>
      <div class="s-prop">PROPUESTA COMERCIAL</div>
      <hr class="s-hr">
      <div class="s-tag">En Tero nos ocupamos de cada detalle para que tu evento sea una experiencia única</div>
      <div class="benefit"><div class="bico">✓</div><div class="btxt">Salones exclusivos</div></div>
      <div class="benefit"><div class="bico">✓</div><div class="btxt">Gastronomía de primer nivel</div></div>
      <div class="benefit"><div class="bico">✓</div><div class="btxt">Estacionamiento incluido</div></div>
      <div class="benefit"><div class="bico">✓</div><div class="btxt">Seguridad incluida</div></div>
      <div class="s-foot">Gracias por confiar en<br>Tero Restaurante y<br>Salón de Eventos</div>
    </div>
    <div class="content">
      <div class="topline">
        Emisión: <strong>${fechaEmision}</strong> · Válida hasta: <strong>${fechaValidez}</strong> · N° <strong>${numCotizacion}</strong>
      </div>
      <div class="boxes">
        <div class="box">
          <div class="box-t">DATOS DEL CLIENTE</div>
          <div class="brow"><span class="blbl">Cliente:</span><span class="bval">${evento.cliente || 'N/A'}</span></div>
          <div class="brow"><span class="blbl">Tel:</span><span class="bval">${evento.telefono || 'N/A'}</span></div>
        </div>
        <div class="box">
          <div class="box-t">DETALLES DEL EVENTO</div>
          <div class="brow"><span class="blbl">Evento:</span><span class="bval">${evento.tipo_evento || 'Evento'}</span></div>
          <div class="brow"><span class="blbl">Turno:</span><span class="bval">${evento.turno || 'Noche'}${evento.hora_inicio && evento.hora_fin ? ` de ${String(evento.hora_inicio).slice(0, 5)} a ${String(evento.hora_fin).slice(0, 5)}` : ''}</span></div>
          <div class="brow"><span class="blbl">Fecha:</span><span class="bval">${fechaEventoStr}</span></div>
          <div class="brow"><span class="blbl">Invitados:</span><span class="bval">${adultos} adultos${menores > 0 ? `, ${menores} menores` : ''}</span></div>
          <div class="brow"><span class="blbl">Salón:</span><span class="bval">${evento.salon || 'Tero'}</span></div>
        </div>
      </div>
      ${bloqueOpcionSugerida}
      <div class="menu-wrap">
        <div class="m-title">MENÚ</div>
        <hr class="m-line">
        <div class="m-sub">${menuDetalle.nombre || 'Menu Personalizado'}</div>
        <div class="mcols">
          <div class="mcol">${menuCol1HTML}</div>
          <div class="mcol">${menuCol2HTML}</div>
        </div>
        <div class="bevs">
          <div class="bev"><span class="bev-i">🍷</span>Vino</div>
          <div class="bev"><span class="bev-i">🥤</span>Bebidas Sin Alcohol</div>
          <div class="bev"><span class="bev-i">🍸</span>Tragos</div>
          <div class="bev"><span class="bev-i">🥂</span>Champagne</div>
        </div>
      </div>
      <div class="p1-banner">
        <div class="p1-banner-txt">Nos ocupamos de cada detalle para que tu evento sea una experiencia única e inolvidable.</div>
      </div>
      <div class="p1-foot">Gracias por confiar en Tero Restaurante y Salón de Eventos</div>
    </div>
  </div>
</div>

<!-- PÁGINA 2 -->
<div class="page">
  <div class="p2">
    <div class="p2-bar"></div>

    ${esEventoLegacy ? `
    <!-- MODO LEGACY - Tabla clásica -->
    <div class="legacy-title">DETALLE DE PRECIOS</div>
    <hr class="legacy-line">

    <table class="legacy-table">
      <thead>
        <tr>
          <th>CONCEPTO</th>
          <th>CANT.</th>
          <th>PRECIO UNIT.</th>
          <th>SUBTOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${legacyRowsHTML}
        <tr class="legacy-subtotal">
          <td colspan="3">SUBTOTAL</td>
          <td>${formatMoney(subtotalLegacy)}</td>
        </tr>
        <tr class="legacy-iva">
          <td colspan="3">IVA 21%</td>
          <td>${formatMoney(ivaLegacy)}</td>
        </tr>
        <tr class="legacy-total">
          <td colspan="3">TOTAL</td>
          <td>${formatMoney(totalLegacy)}</td>
        </tr>
      </tbody>
    </table>

    ${observacionesLegacy ? `
    <div class="legacy-obs">
      <div class="legacy-obs-title">OBSERVACIONES</div>
      <div class="legacy-obs-text">${toTitleCase(observacionesLegacy)}</div>
    </div>
    ` : ''}

    ${opcionalesLegacyHTML}

    ` : `
    <!-- MODO NUEVO - 3 paquetes -->
    <div class="p2-title">OPCIONES DE EXPERIENCIA</div>
    <hr class="p2-ln">
    <div class="p2-sub">Elegí el paquete que mejor se adapte a tu evento</div>

    <div class="pkgs">
      <!-- CLASSIC -->
      <div class="pkg${opcionSugerida === 'Classic' ? ' prem' : ''}">
        ${headerClassic}
        <div class="pb">
          <div class="pp">${formatMoney(CLASSIC_PP)}</div>
          <div class="ppu">por persona + IVA</div>
          <hr class="pdiv">
          <div class="pi"><div class="dot g"></div><div class="pit">Técnica de sonido e iluminación estándar</div></div>
          <div class="pi"><div class="dot g"></div><div class="pit">Vajilla y cristalería completa</div></div>
          <div class="pi"><div class="dot g"></div><div class="pit">Seguridad del evento</div></div>
          <div class="pi"><div class="dot g"></div><div class="pit">Estacionamiento privado</div></div>
          <div class="pi"><div class="dot g"></div><div class="pit">Personal de servicio completo</div></div>
          <div class="ptots">
            <div class="pkg-row"><span>${adultos} adultos × ${formatMoney(CLASSIC_PP)}</span><span>${formatMoney(sub1Classic)}</span></div>
            ${menores > 0 ? `<div class="pkg-row"><span>${menores} menores × ${formatMoney(precioMenor)}</span><span>${formatMoney(menoresTotal)}</span></div>` : ''}
            ${extrasHTMLClassic}
            ${(menores > 0 || (opcionSugerida === 'Classic' && extrasConfirmadosTotal > 0)) ? `<div class="pkg-subtotal"><span>SUBTOTAL</span><span>${formatMoney(sub2Classic)}</span></div>` : ''}
            <div class="pkg-iva"><span>IVA 21%</span><span>${formatMoney(ivaClassic)}</span></div>
            <div class="pkg-total"><span class="pkg-total-label">TOTAL</span><span class="pkg-total-value">${formatMoney(totClassic)}</span></div>
          </div>
        </div>
      </div>

      <!-- PREMIUM -->
      <div class="pkg${opcionSugerida === 'Premium' ? ' prem' : ''}">
        ${badgePremium}
        ${headerPremium}
        <div class="pb">
          <div class="pp">${formatMoney(PREMIUM_PP)}</div>
          <div class="ppu">por persona + IVA</div>
          <hr class="pdiv">
          <div class="pi"><div class="dot gold"></div><div class="pit">Todo lo incluido en Classic</div></div>
          <div class="pkg-sep">Además incluye:</div>
          <div class="pi"><div class="dot g"></div><div class="pit">Técnica superior de sonido e iluminación</div></div>
          <div class="pi"><div class="dot g"></div><div class="pit">Iluminación exterior en jardín</div></div>
          <div class="pi"><div class="dot g"></div><div class="pit">DJ profesional incluido</div></div>
          <div class="pi"><div class="dot g"></div><div class="pit">Mesa de fiambres y quesos</div></div>
          <div class="ptots">
            <div class="pkg-row"><span>${adultos} adultos × ${formatMoney(PREMIUM_PP)}</span><span>${formatMoney(sub1Premium)}</span></div>
            ${menores > 0 ? `<div class="pkg-row"><span>${menores} menores × ${formatMoney(precioMenor)}</span><span>${formatMoney(menoresTotal)}</span></div>` : ''}
            ${extrasHTMLPremium}
            ${(menores > 0 || (opcionSugerida === 'Premium' && extrasConfirmadosTotal > 0)) ? `<div class="pkg-subtotal"><span>SUBTOTAL</span><span>${formatMoney(sub2Premium)}</span></div>` : ''}
            <div class="pkg-iva"><span>IVA 21%</span><span>${formatMoney(ivaPremium)}</span></div>
            <div class="pkg-total"><span class="pkg-total-label">TOTAL</span><span class="pkg-total-value">${formatMoney(totPremium)}</span></div>
          </div>
        </div>
      </div>

      <!-- GOLD -->
      <div class="pkg${opcionSugerida === 'Gold' ? ' prem' : ''}">
        ${badgeGold}
        ${headerGold}
        <div class="pb">
          <div class="pp">${formatMoney(GOLD_PP)}</div>
          <div class="ppu">por persona + IVA</div>
          <hr class="pdiv">
          <div class="pi"><div class="dot gold"></div><div class="pit">Todo lo incluido en Premium</div></div>
          <div class="pkg-sep">Además incluye:</div>
          <div class="pi"><div class="dot g"></div><div class="pit">Living lounge y ambientación</div></div>
          <div class="pi"><div class="dot g"></div><div class="pit">Iluminación escénica y efectos</div></div>
          <div class="pi"><div class="dot g"></div><div class="pit">Coctelería premium con bartender</div></div>
          <div class="ptots">
            <div class="pkg-row"><span>${adultos} adultos × ${formatMoney(GOLD_PP)}</span><span>${formatMoney(sub1Gold)}</span></div>
            ${menores > 0 ? `<div class="pkg-row"><span>${menores} menores × ${formatMoney(precioMenor)}</span><span>${formatMoney(menoresTotal)}</span></div>` : ''}
            ${extrasHTMLGold}
            ${(menores > 0 || (opcionSugerida === 'Gold' && extrasConfirmadosTotal > 0)) ? `<div class="pkg-subtotal"><span>SUBTOTAL</span><span>${formatMoney(sub2Gold)}</span></div>` : ''}
            <div class="pkg-iva"><span>IVA 21%</span><span>${formatMoney(ivaGold)}</span></div>
            <div class="pkg-total"><span class="pkg-total-label">TOTAL</span><span class="pkg-total-value">${formatMoney(totGold)}</span></div>
          </div>
        </div>
      </div>
    </div>

    ${opcionalesHTML}
    `}

    <div class="conds">
      <div class="cc">
        <div class="cct">CONDICIONES</div>
        <div class="cci">Valores expresados sin IVA (21%)</div>
        <div class="cci">Anticipo del 50% para confirmar fecha</div>
        <div class="cci">Saldo ajustable por IPC hasta el evento</div>
        <div class="cci">Cancelación total: 15 días antes</div>
      </div>
      <div class="cc">
        <div class="cct">CANCELACIÓN</div>
        <div class="cci">Postergación: se reprograma sin costo adicional</div>
        <div class="cci">Más de 2 meses: retención del 30% de la seña</div>
        <div class="cci">Menos de 2 meses: retención total de la seña</div>
      </div>
      <div class="cc">
        <div class="cct">NOTAS</div>
        <div class="cci">Propina no incluida (se sugiere 7-10%)</div>
        <div class="cci">Servicios externos: consultar requisitos de seguro</div>
      </div>
    </div>

    <div class="p2f">
      <div class="p2ft">Av. Agustín M. García 9501, Benavidez · Zona Norte · 11 3112 8757 · @teroresto.eventos · www.teroresto.com.ar</div>
    </div>
  </div>
</div>

</body>
</html>`;
};
