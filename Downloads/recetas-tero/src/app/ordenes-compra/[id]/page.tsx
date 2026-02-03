'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, Package, FileDown, Pencil } from 'lucide-react'
import jsPDF from 'jspdf'
import { supabase } from '@/lib/supabase'
import { Button, Select } from '@/components/ui'

interface OrdenDetalle {
  id: string
  proveedor_id: string
  proveedor_nombre: string
  proveedor_telefono: string | null
  proveedor_contacto: string | null
  proveedor_email: string | null
  proveedor_direccion: string | null
  fecha: string
  estado: 'borrador' | 'enviada' | 'recibida' | 'cancelada'
  total: number
  notas: string | null
  items: {
    id: string
    insumo_nombre: string
    unidad_medida: string
    cantidad: number
    precio_unitario: number
    subtotal: number
    iva_porcentaje: number
    iva_monto: number
  }[]
}

const estadoColors = {
  borrador: 'bg-gray-100 text-gray-800',
  enviada: 'bg-blue-100 text-blue-800',
  recibida: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
}

const estadoLabels = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  recibida: 'Recibida',
  cancelada: 'Cancelada',
}

export default function VerOrdenCompraPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [orden, setOrden] = useState<OrdenDetalle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [tieneFactura, setTieneFactura] = useState(false)

  useEffect(() => {
    fetchOrden()
  }, [id])

  async function fetchOrden() {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('ordenes_compra')
      .select(`
        id,
        proveedor_id,
        fecha,
        estado,
        total,
        notas,
        proveedores (nombre, telefono, contacto, email, direccion),
        orden_compra_items (
          id,
          cantidad,
          precio_unitario,
          subtotal,
          insumos (nombre, unidad_medida, iva_porcentaje)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching orden:', error)
      alert('Orden no encontrada')
      router.push('/ordenes-compra')
      return
    }

    const prov = data.proveedores as any
    const ordenData: OrdenDetalle = {
      id: data.id,
      proveedor_id: data.proveedor_id,
      proveedor_nombre: prov?.nombre || 'Desconocido',
      proveedor_telefono: prov?.telefono || null,
      proveedor_contacto: prov?.contacto || null,
      proveedor_email: prov?.email || null,
      proveedor_direccion: prov?.direccion || null,
      fecha: data.fecha,
      estado: data.estado,
      total: data.total,
      notas: data.notas,
      items: (data.orden_compra_items as any[]).map((item: any) => {
        const subtotal = parseFloat(item.subtotal)
        const ivaPorcentaje = item.insumos?.iva_porcentaje || 21
        const ivaMonto = subtotal * (ivaPorcentaje / 100)
        return {
          id: item.id,
          insumo_nombre: item.insumos?.nombre || 'Desconocido',
          unidad_medida: item.insumos?.unidad_medida || '',
          cantidad: parseFloat(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario),
          subtotal,
          iva_porcentaje: ivaPorcentaje,
          iva_monto: ivaMonto,
        }
      }),
    }

    setOrden(ordenData)

    // Verificar si tiene factura asociada
    const { data: facturaData } = await supabase
      .from('facturas_proveedor')
      .select('id')
      .eq('orden_compra_id', id)
      .single()

    setTieneFactura(!!facturaData)
    setIsLoading(false)
  }

  async function handleCambiarEstado(nuevoEstado: string) {
    if (!orden) return

    setIsSaving(true)

    const { error } = await supabase
      .from('ordenes_compra')
      .update({ estado: nuevoEstado })
      .eq('id', orden.id)

    if (error) {
      alert('Error al cambiar el estado')
    } else {
      setOrden({ ...orden, estado: nuevoEstado as any })
    }

    setIsSaving(false)
  }

  // Calcular totales con desglose de IVA
  const subtotalNeto = orden?.items.reduce((sum, item) => sum + item.subtotal, 0) || 0
  const totalIva21 = orden?.items.filter(i => i.iva_porcentaje === 21).reduce((sum, item) => sum + item.iva_monto, 0) || 0
  const totalIva105 = orden?.items.filter(i => i.iva_porcentaje === 10.5).reduce((sum, item) => sum + item.iva_monto, 0) || 0
  const totalIva = orden?.items.reduce((sum, item) => sum + item.iva_monto, 0) || 0
  const totalConIva = subtotalNeto + totalIva

  async function handleGenerarPDF() {
    if (!orden) return

    // A5 vertical (mitad de A4)
    const doc = new jsPDF({ unit: 'mm', format: 'a5' })
    const pageWidth = 148
    const pageHeight = 210
    const margin = 10
    const contentWidth = pageWidth - margin * 2
    const TERRACOTA = [163, 82, 52] as const    // #A35234
    const TERRACOTA_LIGHT = [214, 165, 145] as const // #D6A591
    const TERRACOTA_BG = [251, 245, 241] as const   // #FBF5F1

    // Logo desde Supabase (pre-fetch)
    let logoDataUrl: string | null = null
    try {
      const { data: urlData } = supabase.storage.from('logo-tero').getPublicUrl('logo.png')
      if (urlData?.publicUrl) {
        const response = await fetch(urlData.publicUrl)
        if (response.ok) {
          const blob = await response.blob()
          logoDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
        }
      }
    } catch {}

    function drawPageFrame() {
      // Fondo blanco puro
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      // Borde redondeado terracota
      doc.setDrawColor(...TERRACOTA_LIGHT)
      doc.setLineWidth(0.4)
      doc.roundedRect(5, 5, pageWidth - 10, pageHeight - 10, 3, 3, 'S')
    }

    function fmtMoney(n: number): string {
      return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    // === PÁGINA 1 ===
    drawPageFrame()
    let y = 15

    // === HEADER ===
    // Franja terracota superior
    doc.setFillColor(...TERRACOTA)
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F')

    // "Tero Restó" en la franja
    doc.setFont('times', 'bolditalic')
    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.text('Tero Restó', margin + 6, y + 7)

    // "ORDEN DE COMPRA" subtítulo
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('ORDEN DE COMPRA', margin + 6, y + 13.5)

    // Fecha y estado a la derecha
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    const fechaStr = new Date(orden.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
    doc.text(fechaStr, pageWidth - margin - 6, y + 7, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.text(estadoLabels[orden.estado].toUpperCase(), pageWidth - margin - 6, y + 13.5, { align: 'right' })

    // Logo si existe
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', pageWidth - margin - 6 - 25, y + 1, 7, 7)
      } catch {}
    }

    y += 24

    // === DATOS DEL PROVEEDOR ===
    doc.setFillColor(248, 244, 241) // beige muy suave
    doc.roundedRect(margin, y, contentWidth, orden.proveedor_direccion ? 22 : 17, 2, 2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(...TERRACOTA)
    doc.text('PROVEEDOR', margin + 4, y + 4)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)
    doc.text(orden.proveedor_nombre, margin + 4, y + 10)

    // Datos de contacto en una línea
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(80, 80, 80)

    const contactoParts: string[] = []
    if (orden.proveedor_contacto) contactoParts.push(`Contacto: ${orden.proveedor_contacto}`)
    if (orden.proveedor_telefono) contactoParts.push(`Tel: ${orden.proveedor_telefono}`)
    if (orden.proveedor_email) contactoParts.push(orden.proveedor_email)

    if (contactoParts.length > 0) {
      doc.text(contactoParts.join('  |  '), margin + 4, y + 14.5)
    }

    if (orden.proveedor_direccion) {
      doc.text(orden.proveedor_direccion, margin + 4, y + 19)
      y += 26
    } else {
      y += 21
    }

    // === TABLA DE ITEMS ===
    y += 4

    // Columnas proporcionales: # 5%, INSUMO 35%, CANT 15%, UN 10%, PRECIO 17.5%, SUBTOTAL 17.5%
    const rowH = 7.5
    const colX = {
      num: margin + 3,
      insumo: margin + contentWidth * 0.05 + 3,
      cantRight: margin + contentWidth * 0.55 - 2,
      unidad: margin + contentWidth * 0.55 + 2,
      precioRight: margin + contentWidth * 0.825 - 2,
      subtotalRight: pageWidth - margin - 3,
    }

    // Header de tabla
    doc.setFillColor(...TERRACOTA)
    doc.rect(margin, y, contentWidth, rowH, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(255, 255, 255)

    const hTextY = y + 5
    doc.text('#', colX.num, hTextY)
    doc.text('INSUMO', colX.insumo, hTextY)
    doc.text('CANT.', colX.cantRight, hTextY, { align: 'right' })
    doc.text('UN.', colX.unidad, hTextY)
    doc.text('PRECIO', colX.precioRight, hTextY, { align: 'right' })
    doc.text('SUBTOTAL', colX.subtotalRight, hTextY, { align: 'right' })

    y += rowH

    // Filas
    orden.items.forEach((item, idx) => {
      // Alternar fondo gris muy suave
      if (idx % 2 === 0) {
        doc.setFillColor(248, 248, 248)
        doc.rect(margin, y, contentWidth, rowH, 'F')
      }

      // Línea separadora fina entre filas
      doc.setDrawColor(230, 230, 230)
      doc.setLineWidth(0.15)
      doc.line(margin, y, pageWidth - margin, y)

      const textY = y + 5
      doc.setFontSize(7)

      // #
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text(`${idx + 1}`, colX.num, textY)

      // Insumo (izquierda)
      doc.setTextColor(30, 30, 30)
      doc.text(item.insumo_nombre, colX.insumo, textY)

      // Cantidad (derecha)
      doc.setTextColor(50, 50, 50)
      const cantStr = item.cantidad % 1 === 0 ? item.cantidad.toFixed(0) : item.cantidad.toFixed(2).replace('.', ',')
      doc.text(cantStr, colX.cantRight, textY, { align: 'right' })

      // Unidad (izquierda, columna separada)
      doc.setTextColor(120, 120, 120)
      doc.setFontSize(6.5)
      doc.text(item.unidad_medida, colX.unidad, textY)
      doc.setFontSize(7)

      // Precio (derecha)
      doc.setTextColor(50, 50, 50)
      doc.text(fmtMoney(item.precio_unitario), colX.precioRight, textY, { align: 'right' })

      // Subtotal (derecha, bold)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(fmtMoney(item.subtotal), colX.subtotalRight, textY, { align: 'right' })

      y += rowH
    })

    // Línea cierre tabla
    doc.setDrawColor(...TERRACOTA_LIGHT)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5

    // === TOTALES ===
    const totalesX = colX.subtotalRight
    const labelX = colX.precioRight

    // Subtotal neto
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text('Subtotal Neto:', labelX, y, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 40)
    doc.text(fmtMoney(subtotalNeto), totalesX, y, { align: 'right' })
    y += 5

    // IVA 21%
    if (totalIva21 > 0) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('IVA 21%:', labelX, y, { align: 'right' })
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(40, 40, 40)
      doc.text(fmtMoney(totalIva21), totalesX, y, { align: 'right' })
      y += 5
    }

    // IVA 10.5%
    if (totalIva105 > 0) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('IVA 10.5%:', labelX, y, { align: 'right' })
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(40, 40, 40)
      doc.text(fmtMoney(totalIva105), totalesX, y, { align: 'right' })
      y += 5
    }

    // Total con IVA - badge terracota
    y += 2
    const totalText = fmtMoney(totalConIva)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    const totalBadgeW = doc.getTextWidth(totalText) + doc.getTextWidth('TOTAL:  ') + 14
    const totalBadgeX = pageWidth - margin - totalBadgeW

    doc.setFillColor(...TERRACOTA)
    doc.roundedRect(totalBadgeX, y - 4, totalBadgeW, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text('TOTAL:', totalBadgeX + 6, y + 2)
    doc.setFontSize(9)
    doc.text(totalText, pageWidth - margin - 5, y + 2, { align: 'right' })
    y += 14

    // === NOTAS / CONDICIONES ===
    if (orden.notas) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(...TERRACOTA)
      doc.text('NOTAS / CONDICIONES', margin + 2, y)
      y += 3.5

      doc.setFillColor(248, 244, 241)
      const notasLines = doc.splitTextToSize(orden.notas, contentWidth - 8)
      const notasHeight = notasLines.length * 3.5 + 4
      doc.roundedRect(margin, y - 1.5, contentWidth, notasHeight, 2, 2, 'F')

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(60, 60, 60)
      doc.text(notasLines, margin + 4, y + 2)
      y += notasHeight + 3
    }

    // === FOOTER ===
    const footerY = pageHeight - 15
    doc.setDrawColor(...TERRACOTA_LIGHT)
    doc.setLineWidth(0.2)
    doc.line(margin + 15, footerY, pageWidth - margin - 15, footerY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(150, 130, 120)
    doc.text('Tero Restó  |  Orden de Compra', pageWidth / 2, footerY + 4, { align: 'center' })
    doc.text(`Generada: ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, footerY + 7.5, { align: 'center' })

    // Guardar
    const fileName = `OC_${orden.proveedor_nombre.replace(/\s+/g, '_')}_${orden.fecha}.pdf`
    doc.save(fileName)

    // Si es borrador, marcar como enviada
    if (orden.estado === 'borrador') {
      handleCambiarEstado('enviada')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (!orden) return null

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Orden de Compra</h1>
          <p className="text-gray-600">{orden.proveedor_nombre}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoColors[orden.estado]}`}>
          {estadoLabels[orden.estado]}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Info */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Proveedor</p>
            <p className="font-medium">{orden.proveedor_nombre}</p>
            {orden.proveedor_contacto && (
              <p className="text-sm text-gray-500">{orden.proveedor_contacto}</p>
            )}
            {orden.proveedor_telefono && (
              <p className="text-sm text-gray-500">{orden.proveedor_telefono}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha</p>
            <p className="font-medium">{new Date(orden.fecha).toLocaleDateString('es-AR')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cambiar Estado</p>
            <Select
              options={[
                { value: 'borrador', label: 'Borrador' },
                { value: 'enviada', label: 'Enviada' },
                { value: 'recibida', label: 'Recibida' },
                { value: 'cancelada', label: 'Cancelada' },
              ]}
              value={orden.estado}
              onChange={(e) => handleCambiarEstado(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Items */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>

          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">IVA</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orden.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{item.insumo_nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.cantidad % 1 === 0 ? item.cantidad : item.cantidad.toLocaleString('es-AR')} {item.unidad_medida}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      ${item.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.iva_porcentaje === 21 ? 'bg-blue-100 text-blue-800' :
                        item.iva_porcentaje === 10.5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.iva_porcentaje}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-sm text-gray-600">
                    Subtotal Neto:
                  </td>
                  <td className="px-4 py-2 text-right text-sm text-gray-900">
                    ${subtotalNeto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {totalIva21 > 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-1 text-right text-sm text-gray-600">
                      IVA 21%:
                    </td>
                    <td className="px-4 py-1 text-right text-sm text-gray-900">
                      ${totalIva21.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                {totalIva105 > 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-1 text-right text-sm text-gray-600">
                      IVA 10.5%:
                    </td>
                    <td className="px-4 py-1 text-right text-sm text-gray-900">
                      ${totalIva105.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-gray-300">
                  <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-900">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-green-600">
                    ${totalConIva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notas */}
        {orden.notas && (
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notas</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{orden.notas}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-between items-center border-t pt-6">
          <div className="flex gap-2">
            {orden.estado === 'borrador' && (
              <Button variant="secondary" onClick={() => handleCambiarEstado('cancelada')}>
                <X className="w-4 h-4 mr-2" />
                Cancelar Orden
              </Button>
            )}
            {orden.estado === 'enviada' && (
              <Button onClick={() => handleCambiarEstado('recibida')}>
                <Check className="w-4 h-4 mr-2" />
                Marcar como Recibida
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {!tieneFactura && (
              <Button variant="secondary" onClick={() => router.push(`/ordenes-compra/${orden.id}/editar`)}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            <Button onClick={handleGenerarPDF}>
              <FileDown className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
