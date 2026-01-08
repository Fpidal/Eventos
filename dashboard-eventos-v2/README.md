# Dashboard de Eventos

Sistema de gestion de eventos para salon de fiestas.

## Funcionalidades

### Dashboard
- Estadisticas de facturacion, eventos, invitados
- Graficos de ventas por vendedor y por mes
- Comensales por mes (adultos/menores)
- Eventos por tipo, menu y salon

### Gestion de Eventos
- Crear, editar y eliminar eventos
- Confirmar eventos
- Generar cotizacion PDF con IVA 21%
- Calendario mensual
- Filtros y ordenamiento

### Cobranzas
- Registro de pagos, senas y ajustes IPC
- Filtros por mes y estado (Pendientes/Con Saldo/Cancelados)
- Solo eventos confirmados

### Menus
- Menus personalizados (Tapeo, Asado, 3 Pasos)
- Categorias y platos predefinidos
- Extras opcionales

### Usuarios
- Roles: Admin, Escritura, Lectura
- Gestion de permisos

## Tecnologias

- **Frontend:** React 18 + Vite
- **Estilos:** Tailwind CSS
- **Graficos:** Recharts
- **PDF:** jsPDF
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticacion:** Supabase Auth

## Instalacion

```bash
npm install
npm run dev
```

## Documentacion

Ver [DOCUMENTACION_MIGRACION.md](./DOCUMENTACION_MIGRACION.md) para:
- Esquema de base de datos
- Guia de migracion a MySQL
- Variables de entorno
- Estructura del proyecto

## Configuracion

Crear archivo `src/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TU_URL_SUPABASE'
const supabaseKey = 'TU_KEY_SUPABASE'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## Estructura de Base de Datos

| Tabla | Descripcion |
|-------|-------------|
| eventos | Datos de eventos (fecha, cliente, precios, etc.) |
| pagos | Pagos, senas y ajustes IPC |
| menus | Menus personalizados con categorias |
| usuarios | Usuarios y roles |

## Salones

- Tero
- Cristal
- Salentein

## Tipos de Menu

- Menu Tapeo
- Menu Asado
- Menu 3 Pasos
- Otro (personalizado)

---

*Sistema de gestion de eventos - 2026*
