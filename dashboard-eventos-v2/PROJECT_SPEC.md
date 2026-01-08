# Especificaciones del Proyecto

## Vision General

Sistema de gestion integral para salon de fiestas que permite administrar eventos, cobranzas, menus personalizados y generar cotizaciones profesionales en PDF.

---

## Modulos del Sistema

### 1. Dashboard

**Objetivo:** Visualizar metricas clave del negocio en tiempo real.

**Componentes:**
- Cards con totales (eventos, facturacion, invitados, promedio)
- Grafico de facturacion por mes (Area Chart)
- Grafico de ventas por vendedor (Pie Chart)
- Grafico de comensales por mes (Bar Chart - adultos/menores)
- Grillas de eventos por tipo, menu y salon

**Filtros:**
- Selector de ano

---

### 2. Gestion de Eventos

**Objetivo:** CRUD completo de eventos con toda la informacion necesaria.

**Datos del Evento:**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| fecha | Date | Fecha del evento |
| cliente | String | Nombre del cliente |
| telefono | String | Telefono de contacto |
| turno | Enum | Noche / Mediodia |
| hora_inicio | Time | Hora de inicio |
| hora_fin | Time | Hora de fin |
| vendedor | String | Vendedor asignado |
| tipo_evento | String | Tipo (Cumple 50, Casamiento, etc.) |
| menu | String | Menu base |
| salon | String | Salon asignado |
| tecnica | Boolean | Incluye tecnica |
| dj | Boolean | Incluye DJ |
| tecnica_superior | Boolean | Tecnica superior |
| adultos | Number | Cantidad de adultos |
| precio_adulto | Number | Precio por adulto |
| menores | Number | Cantidad de menores |
| precio_menor | Number | Precio por menor |
| extras | Array | Hasta 3 extras con descripcion, valor y tipo |
| confirmado | Boolean | Estado de confirmacion |
| menu_detalle | JSON | Menu detallado seleccionado |

**Vistas:**
- Proximos eventos (confirmados)
- Eventos a confirmar (pendientes futuros)
- Calendario mensual
- Tabla con filtros

---

### 3. Cotizaciones PDF

**Objetivo:** Generar presupuestos profesionales para entregar al cliente.

**Contenido del PDF:**
1. Encabezado con logo y datos del salon
2. Datos del evento (fecha, cliente, salon)
3. Estado (Confirmado / A Confirmar)
4. Detalle del menu (si tiene menu_detalle)
5. Extras opcionales del menu
6. Tabla de precios:
   - Adultos x precio
   - Menores x precio
   - Extras adicionales
7. **Subtotal** (sin IVA)
8. **IVA 21%**
9. **TOTAL** (con IVA)
10. Condiciones de pago

---

### 4. Cobranzas

**Objetivo:** Control de pagos y saldos de eventos confirmados.

**Reglas de Negocio:**
- Solo eventos confirmados aparecen en cobranzas
- No se puede eliminar evento si tiene pagos registrados
- Tipos de pago: Sena, Pago, Ajuste IPC

**Conceptos:**
| Concepto | Descripcion |
|----------|-------------|
| seña | Pago inicial para confirmar evento |
| pago | Pago regular del saldo |
| ajuste_ipc | Ajuste por inflacion (no descuenta del saldo base) |

**Calculos:**
- Saldo = Total Evento - (Senas + Pagos)
- Total Cobrado = Senas + Pagos + Ajustes IPC

**Filtros:**
- Por mes
- Por estado: Pendientes / Con Saldo / Cancelados

---

### 5. Menus

**Objetivo:** Crear menus personalizados para cotizaciones.

**Tipos de Menu:**
- Menu Tapeo
- Menu Asado
- Menu 3 Pasos
- Otro (personalizado)

**Estructura:**
```json
{
  "nombre": "Menu Asado - Opcion 1",
  "categorias": [
    {
      "nombre": "Entradas",
      "items": ["Chorizo Criollo", "Morcilla", "Mollejas"]
    },
    {
      "nombre": "Principales",
      "items": ["Asado Banderita", "Vacio", "Picanha"]
    }
  ],
  "extras": ["J&W Etiqueta Negra", "Champagne"]
}
```

**Categorias por Tipo:**
| Tipo | Categorias |
|------|------------|
| Menu Tapeo | Tapeo Frio, Tapeo Caliente, Cazuelas, Mesa de Dulces, Fin de Fiesta, Bebidas |
| Menu Asado | Entradas, Principales, Postres, Bebidas |
| Menu 3 Pasos | Entradas, Principales, Postres, Bebidas |

---

### 6. Usuarios

**Objetivo:** Control de acceso al sistema.

**Roles:**
| Rol | Permisos |
|-----|----------|
| admin | Acceso total, gestionar usuarios |
| escritura | Crear/editar eventos y pagos |
| lectura | Solo visualizacion |

---

## Configuracion del Sistema

### Salones
- Tero
- Cristal
- Salentein

### Vendedores
- Francisco
- Belen
- Carla
- Otro

### Tipos de Evento
- Cumple 50, 40, 30, 60, 70, 80
- Cumple 15
- Cumple Infantil
- Casamiento
- Bautismo
- Comunion
- Confirmacion
- Aniversario
- Empresarial
- Egresados
- Despedida
- Otro

### Menus Base
- Tapas
- Asado
- 3 Pasos
- Personalizado

---

## Reglas de Negocio

1. **Eventos pendientes** no aparecen en Cobranzas
2. **Eventos con pagos** no pueden eliminarse (primero borrar pagos)
3. **Cotizacion PDF** incluye IVA 21% calculado sobre subtotal
4. **Ajustes IPC** se suman al total cobrado pero no descuentan del saldo base
5. **Numeracion automatica** de menus (Opcion 1, Opcion 2, etc.)
