'use client'

import { useState, useEffect } from 'react'
import { Plus, Eye, FileText, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button, Table } from '@/components/ui'
import Link from 'next/link'

interface FacturaConProveedor {
  id: string
  proveedor_id: string
  numero_factura: string
  fecha: string
  total: number
  notas: string | null
  proveedores: {
    nombre: string
  }
}

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<FacturaConProveedor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFacturas()
  }, [])

  async function fetchFacturas() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('facturas_proveedor')
      .select(
        `
        *,
        proveedores (nombre)
      `
      )
      .order('fecha', { ascending: false })

    if (error) {
      console.error('Error fetching facturas:', error)
    } else {
      setFacturas((data as FacturaConProveedor[]) || [])
    }
    setIsLoading(false)
  }

  const columns = [
    {
      key: 'numero',
      header: 'Número',
      render: (f: FacturaConProveedor) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{f.numero_factura}</span>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (f: FacturaConProveedor) => (
        <span>{new Date(f.fecha).toLocaleDateString('es-AR')}</span>
      ),
    },
    {
      key: 'proveedor',
      header: 'Proveedor',
      render: (f: FacturaConProveedor) => (
        <span>{f.proveedores?.nombre}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (f: FacturaConProveedor) => (
        <span className="font-medium">
          ${f.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-right',
      render: (f: FacturaConProveedor) => (
        <div className="flex justify-end gap-2">
          <Link href={`/facturas/${f.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/facturas/${f.id}/editar`}>
            <Button variant="ghost" size="sm">
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600">Registro de compras a proveedores</p>
        </div>
        <Link href="/facturas/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
        </Link>
      </div>

      <Table
        columns={columns}
        data={facturas}
        keyExtractor={(f) => f.id}
        isLoading={isLoading}
        emptyMessage="No hay facturas registradas"
      />
    </div>
  )
}
