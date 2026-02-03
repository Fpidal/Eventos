'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, Save, Package, ChefHat } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { Button, Input, Select } from '@/components/ui'

const CATEGORY_COLORS: Record<string, string> = {
  'Carnes': '#d98a8a',
  'Pescados_Mariscos': '#64b5f6',
  'Verduras_Frutas': '#ffd54f',
  'Lacteos_Fiambres': '#ffb74d',
  'Bebidas': '#4fc3f7',
  'Salsas_Recetas': '#81c784',
  'Almacen': '#bdbdbd',
}

interface Insumo {
  id: string
  nombre: string
  unidad_medida: string
  categoria: string
  precio_actual: number | null
  merma_porcentaje: number
  iva_porcentaje: number
  costo_final: number | null
}

interface RecetaBase {
  id: string
  nombre: string
  costo_por_porcion: number
}

interface Ingrediente {
  id: string
  tipo: 'insumo' | 'receta_base'
  item_id: string
  nombre: string
  unidad: string
  categoria: string
  cantidad: number
  costo_unitario: number // Costo final por unidad
  costo_linea: number
}

export default function NuevoPlatoPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [seccion, setSeccion] = useState('Principales')
  const [descripcion, setDescripcion] = useState('')
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [recetasBase, setRecetasBase] = useState<RecetaBase[]>([])
  const [tipoIngrediente, setTipoIngrediente] = useState<'insumo' | 'receta_base'>('insumo')
  const [selectedItem, setSelectedItem] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)

    // Cargar insumos
    const { data: insumosRaw } = await supabase
      .from('v_insumos_con_precio')
      .select('id, nombre, unidad_medida, categoria, precio_actual, merma_porcentaje, iva_porcentaje')
      .eq('activo', true)
      .order('nombre')

    // Calcular costo final para cada insumo
    const insumosData = (insumosRaw || []).map(insumo => ({
      ...insumo,
      costo_final: insumo.precio_actual !== null
        ? insumo.precio_actual * (1 + (insumo.iva_porcentaje || 0) / 100) * (1 + (insumo.merma_porcentaje || 0) / 100)
        : null
    }))

    if (insumosData) {
      setInsumos(insumosData)
    }

    // Cargar recetas base
    const { data: recetasData } = await supabase
      .from('recetas_base')
      .select('id, nombre, costo_por_porcion')
      .eq('activo', true)
      .order('nombre')

    if (recetasData) {
      setRecetasBase(recetasData)
    }

    setIsLoading(false)
  }

  function calcularCostoLinea(costoUnitario: number, cantidad: number): number {
    return cantidad * costoUnitario
  }

  function handleAgregarIngrediente() {
    if (!selectedItem || !cantidad || parseFloat(cantidad) <= 0) {
      alert('Seleccioná un ingrediente y una cantidad válida')
      return
    }

    // Verificar si ya existe
    const yaExiste = ingredientes.some(
      ing => ing.item_id === selectedItem && ing.tipo === tipoIngrediente
    )
    if (yaExiste) {
      alert('Este ingrediente ya está en el plato')
      return
    }

    let nuevoIngrediente: Ingrediente

    if (tipoIngrediente === 'insumo') {
      const insumo = insumos.find(i => i.id === selectedItem)
      if (!insumo) return

      const costoUnitario = insumo.costo_final || 0
      const cantidadNum = parseFloat(cantidad)
      const costoLinea = calcularCostoLinea(costoUnitario, cantidadNum)

      nuevoIngrediente = {
        id: crypto.randomUUID(),
        tipo: 'insumo',
        item_id: insumo.id,
        nombre: insumo.nombre,
        unidad: insumo.unidad_medida,
        categoria: insumo.categoria,
        cantidad: cantidadNum,
        costo_unitario: costoUnitario,
        costo_linea: costoLinea,
      }
    } else {
      const receta = recetasBase.find(r => r.id === selectedItem)
      if (!receta) return

      const cantidadNum = parseFloat(cantidad)
      const costoUnitario = receta.costo_por_porcion
      const costoLinea = calcularCostoLinea(costoUnitario, cantidadNum)

      nuevoIngrediente = {
        id: crypto.randomUUID(),
        tipo: 'receta_base',
        item_id: receta.id,
        nombre: receta.nombre,
        unidad: 'porción',
        categoria: 'Salsas_Recetas',
        cantidad: cantidadNum,
        costo_unitario: costoUnitario,
        costo_linea: costoLinea,
      }
    }

    setIngredientes([...ingredientes, nuevoIngrediente])
    setSelectedItem('')
    setCantidad('')
  }

  function handleEliminarIngrediente(id: string) {
    setIngredientes(ingredientes.filter(ing => ing.id !== id))
  }

  function handleCantidadChange(id: string, nuevaCantidad: string) {
    const cantidadNum = parseFloat(nuevaCantidad) || 0
    setIngredientes(ingredientes.map(ing => {
      if (ing.id === id) {
        return { ...ing, cantidad: cantidadNum, costo_linea: calcularCostoLinea(ing.costo_unitario, cantidadNum) }
      }
      return ing
    }))
  }

  const costoTotal = ingredientes.reduce((sum, ing) => sum + ing.costo_linea, 0)

  async function handleGuardar() {
    if (!nombre.trim()) {
      alert('El nombre es requerido')
      return
    }

    if (ingredientes.length === 0) {
      alert('Agregá al menos un ingrediente')
      return
    }

    setIsSaving(true)

    // Crear el plato
    const { data: plato, error: platoError } = await supabase
      .from('platos')
      .insert({
        nombre: nombre.trim(),
        seccion,
        descripcion: descripcion.trim() || null,
        costo_total: costoTotal,
        activo: true,
      })
      .select()
      .single()

    if (platoError) {
      console.error('Error creando plato:', platoError)
      alert('Error al crear el plato')
      setIsSaving(false)
      return
    }

    // Insertar ingredientes
    const ingredientesData = ingredientes.map(ing => ({
      plato_id: plato.id,
      insumo_id: ing.tipo === 'insumo' ? ing.item_id : null,
      receta_base_id: ing.tipo === 'receta_base' ? ing.item_id : null,
      cantidad: ing.cantidad,
      costo_linea: ing.costo_linea,
    }))

    const { error: ingError } = await supabase
      .from('plato_ingredientes')
      .insert(ingredientesData)

    if (ingError) {
      console.error('Error creando ingredientes:', ingError)
      alert('Plato creado pero hubo un error con los ingredientes')
    }

    setIsSaving(false)
    router.push('/platos')
  }

  const opcionesItems = tipoIngrediente === 'insumo'
    ? insumos.map(i => ({
        value: i.id,
        label: `${i.nombre} (${i.unidad_medida}) - $${(i.costo_final || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
      }))
    : recetasBase.map(r => ({
        value: r.id,
        label: `${r.nombre} - $${r.costo_por_porcion.toLocaleString('es-AR', { maximumFractionDigits: 0 })}/porción`
      }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Plato</h1>
          <p className="text-gray-600">Receta con insumos y/o recetas base</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Datos básicos */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Nombre *"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Bife de Chorizo con Papas"
            />
          </div>
          <div>
            <Select
              label="Sección *"
              options={[
                { value: 'Entradas', label: 'Entradas' },
                { value: 'Principales', label: 'Principales' },
                { value: 'Pastas y Arroces', label: 'Pastas y Arroces' },
                { value: 'Ensaladas', label: 'Ensaladas' },
                { value: 'Postres', label: 'Postres' },
              ]}
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descripción opcional..."
            />
          </div>
        </div>

        {/* Agregar ingrediente */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ingredientes</h3>

          {/* Selector de tipo */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setTipoIngrediente('insumo'); setSelectedItem('') }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tipoIngrediente === 'insumo'
                  ? 'bg-green-100 text-green-800 border-2 border-green-500'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Insumo
            </button>
            <button
              type="button"
              onClick={() => { setTipoIngrediente('receta_base'); setSelectedItem('') }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tipoIngrediente === 'receta_base'
                  ? 'bg-purple-100 text-purple-800 border-2 border-purple-500'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              Receta Base
            </button>
          </div>

          <div className="flex gap-4 items-end mb-4">
            <div className="flex-1">
              <Select
                label={tipoIngrediente === 'insumo' ? 'Insumo' : 'Receta Base'}
                options={[
                  { value: '', label: 'Seleccionar...' },
                  ...opcionesItems
                ]}
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              />
            </div>
            <div className="w-32">
              <Input
                label={tipoIngrediente === 'insumo' ? 'Cantidad' : 'Porciones'}
                type="number"
                step="0.001"
                min="0"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button onClick={handleAgregarIngrediente}>
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>

          {/* Lista de ingredientes */}
          {ingredientes.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingrediente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-green-50">Costo Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-blue-50">Incidencia</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ingredientes.map((ing) => (
                    <tr key={ing.id}>
                      <td className="px-4 py-3">
                        {ing.tipo === 'insumo' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <Package className="w-3 h-3" />
                            Insumo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            <ChefHat className="w-3 h-3" />
                            Receta
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ing.nombre}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={ing.cantidad}
                          onChange={(e) => handleCantidadChange(ing.id, e.target.value)}
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <span className="ml-1 text-sm text-gray-500">{ing.unidad}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 tabular-nums">
                        <span className="text-gray-400">$</span><span className="ml-1">{ing.costo_unitario.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-green-700 bg-green-50 tabular-nums">
                        <span className="text-green-500 font-normal">$</span><span className="ml-1">{ing.costo_linea.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-blue-700 bg-blue-50">
                        {costoTotal > 0 ? `${((ing.costo_linea / costoTotal) * 100).toFixed(1)}%` : '0%'}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarIngrediente(ing.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No hay ingredientes agregados</p>
              <p className="text-sm text-gray-400 mt-1">
                Agregá insumos directos o recetas base
              </p>
            </div>
          )}
        </div>

        {/* Gráfico de incidencia */}
        {ingredientes.length > 0 && costoTotal > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Incidencia por Ingrediente</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const filtered = ingredientes.filter(ing => (ing.costo_linea / costoTotal) * 100 >= 2)
                      return filtered.map((ing) => ({
                        name: ing.nombre,
                        value: ing.costo_linea,
                        categoria: ing.categoria,
                        porcentaje: ((ing.costo_linea / costoTotal) * 100).toFixed(1),
                      }))
                    })()}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, porcentaje }: any) => `${name} ${porcentaje}%`}
                  >
                    {ingredientes
                      .filter(ing => (ing.costo_linea / costoTotal) * 100 >= 2)
                      .map((ing, idx) => (
                        <Cell key={idx} fill={CATEGORY_COLORS[ing.categoria] || '#bdbdbd'} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `$${Number(value).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Resumen de costos */}
        <div className="border-t pt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Costo Total del Plato:</span>
              <span className="text-2xl font-bold text-green-600 tabular-nums">
                <span className="text-green-400 font-normal">$</span> {costoTotal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 border-t pt-6">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Plato'}
          </Button>
        </div>
      </div>
    </div>
  )
}
