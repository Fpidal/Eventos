'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Eye, FileText, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button, Select, Table } from '@/components/ui'
import Link from 'next/link'

interface OrdenConProveedor {
  id: string
  proveedor_id: string
  fecha: string
  estado: 'borrador' | 'enviada' | 'recibida' | 'cancelada'
  total: number
  notas: string | null
  proveedores: {
    nombre: string
    categoria: string | null
  }
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

const CATEGORIAS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'Carnes', label: 'Carnes' },
  { value: 'Verduras y Frutas', label: 'Verduras y Frutas' },
  { value: 'Pescados y Mariscos', label: 'Pescados y Mariscos' },
  { value: 'Lácteos y Fiambres', label: 'Lácteos y Fiambres' },
  { value: 'Almacén', label: 'Almacén' },
  { value: 'Bebidas', label: 'Bebidas' },
  { value: 'Limpieza', label: 'Limpieza' },
  { value: 'Otros', label: 'Otros' },
]

export default function OrdenesCompraPage() {
  const [ordenes, setOrdenes] = useState<OrdenConProveedor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filtros
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  useEffect(() => {
    fetchOrdenes()
  }, [])

  async function fetchOrdenes() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('ordenes_compra')
      .select(`
        *,
        proveedores (nombre, categoria)
      `)
      .order('fecha', { ascending: false })

    if (error) {
      console.error('Error fetching ordenes:', error)
    } else {
      setOrdenes((data as OrdenConProveedor[]) || [])
    }
    setIsLoading(false)
  }

  // Opciones de proveedores únicas extraídas de las órdenes
  const proveedoresOptions = useMemo(() => {
    const map = new Map<string, string>()
    ordenes.forEach((o) => {
      if (o.proveedor_id && o.proveedores?.nombre) {
        map.set(o.proveedor_id, o.proveedores.nombre)
      }
    })
    const sorted = Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
    return [
      { value: '', label: 'Todos los proveedores' },
      ...sorted.map(([id, nombre]) => ({ value: id, label: nombre })),
    ]
  }, [ordenes])

  // Filtrado client-side
  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((o) => {
      if (filtroFechaDesde && o.fecha < filtroFechaDesde) return false
      if (filtroFechaHasta && o.fecha > filtroFechaHasta) return false
      if (filtroProveedor && o.proveedor_id !== filtroProveedor) return false
      if (filtroCategoria && o.proveedores?.categoria !== filtroCategoria) return false
      return true
    })
  }, [ordenes, filtroFechaDesde, filtroFechaHasta, filtroProveedor, filtroCategoria])

  const hayFiltrosActivos = filtroFechaDesde || filtroFechaHasta || filtroProveedor || filtroCategoria

  function limpiarFiltros() {
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setFiltroProveedor('')
    setFiltroCategoria('')
  }

  const columns = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (o: OrdenConProveedor) => (
        <span>{new Date(o.fecha).toLocaleDateString('es-AR')}</span>
      ),
    },
    {
      key: 'proveedor',
      header: 'Proveedor',
      render: (o: OrdenConProveedor) => (
        <div>
          <span className="font-medium">{o.proveedores?.nombre}</span>
          {o.proveedores?.categoria && (
            <span className="ml-2 text-xs text-gray-400">{o.proveedores.categoria}</span>
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (o: OrdenConProveedor) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            estadoColors[o.estado]
          }`}
        >
          {estadoLabels[o.estado]}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o: OrdenConProveedor) => (
        <span className="font-medium">
          ${o.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-right',
      render: (o: OrdenConProveedor) => (
        <div className="flex justify-end gap-2">
          <Link href={`/ordenes-compra/${o.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h1>
          <p className="text-gray-600">Pedidos a proveedores</p>
        </div>
        <Link href="/ordenes-compra/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden
          </Button>
        </Link>
      </div>

      {/* Barra de filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => setFiltroFechaDesde(e.target.value)}
              className="block rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => setFiltroFechaHasta(e.target.value)}
              className="block rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="w-48">
            <Select
              label="Proveedor"
              id="filtroProveedor"
              value={filtroProveedor}
              onChange={(e) => setFiltroProveedor(e.target.value)}
              options={proveedoresOptions}
            />
          </div>
          <div className="w-48">
            <Select
              label="Categoría"
              id="filtroCategoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              options={CATEGORIAS}
            />
          </div>
          {hayFiltrosActivos && (
            <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="text-gray-500">
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        {hayFiltrosActivos && (
          <p className="text-xs text-gray-400 mt-2">
            Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes
          </p>
        )}
      </div>

      <Table
        columns={columns}
        data={ordenesFiltradas}
        keyExtractor={(o) => o.id}
        isLoading={isLoading}
        emptyMessage="No hay órdenes de compra registradas"
      />
    </div>
  )
}
