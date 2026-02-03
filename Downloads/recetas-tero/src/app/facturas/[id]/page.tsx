'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, FileText, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'

interface FacturaDetalle {
  id: string
  proveedor_nombre: string
  numero_factura: string
  fecha: string
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

export default function VerFacturaPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [factura, setFactura] = useState<FacturaDetalle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFactura()
  }, [id])

  async function fetchFactura() {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('facturas_proveedor')
      .select(`
        id,
        numero_factura,
        fecha,
        total,
        notas,
        proveedores (nombre),
        factura_items (
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
      console.error('Error fetching factura:', error)
      alert('Factura no encontrada')
      router.push('/facturas')
      return
    }

    const facturaData: FacturaDetalle = {
      id: data.id,
      proveedor_nombre: (data.proveedores as any)?.nombre || 'Desconocido',
      numero_factura: data.numero_factura,
      fecha: data.fecha,
      total: data.total,
      notas: data.notas,
      items: (data.factura_items as any[]).map((item: any) => {
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

    setFactura(facturaData)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (!factura) return null

  // Calcular totales de IVA
  const subtotalNeto = factura.items.reduce((sum, item) => sum + item.subtotal, 0)
  const totalIva21 = factura.items.filter(i => i.iva_porcentaje === 21).reduce((sum, item) => sum + item.iva_monto, 0)
  const totalIva105 = factura.items.filter(i => i.iva_porcentaje === 10.5).reduce((sum, item) => sum + item.iva_monto, 0)
  const totalIva = factura.items.reduce((sum, item) => sum + item.iva_monto, 0)
  const totalConIva = subtotalNeto + totalIva

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Factura {factura.numero_factura}</h1>
          <p className="text-gray-600">{factura.proveedor_nombre}</p>
        </div>
        <FileText className="w-8 h-8 text-gray-400" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Info */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Proveedor</p>
            <p className="font-medium">{factura.proveedor_nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Número de Factura</p>
            <p className="font-medium">{factura.numero_factura}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha</p>
            <p className="font-medium">{new Date(factura.fecha).toLocaleDateString('es-AR')}</p>
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
                {factura.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{item.insumo_nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.cantidad} {item.unidad_medida}
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
        {factura.notas && (
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notas</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{factura.notas}</p>
          </div>
        )}

        {/* Info de actualización de precios */}
        <div className="border-t pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Los precios de los insumos de esta factura fueron actualizados automáticamente al momento de guardarla.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end border-t pt-6">
          <Button onClick={() => router.push(`/facturas/${factura.id}/editar`)}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar Factura
          </Button>
        </div>
      </div>
    </div>
  )
}
