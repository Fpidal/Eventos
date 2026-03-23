# Dashboard Eventos - Contexto del Proyecto

## Stack Técnico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.2 | Frontend SPA |
| Vite | 5.0 | Build tool y dev server |
| Supabase | 2.39 | Backend (PostgreSQL + Auth) |
| Tailwind CSS | 3.4 | Estilos |
| jsPDF | 4.0 | Generación de PDFs |
| Recharts | 2.10 | Gráficos y visualizaciones |
| Lucide React | 0.263 | Iconos |
| EmailJS | 4.4 | Envío de emails |

**Deploy:** Vercel (auto-deploy desde GitHub)

---

## Estructura de Carpetas

```
dashboard-eventos-v2/
├── public/
│   ├── logo-tero.jpg          # Logo para PDFs
│   └── manifest.json          # PWA manifest
├── src/
│   ├── App.jsx                # Componente principal (~9500 líneas, monolito)
│   ├── main.jsx               # Entry point React
│   ├── supabase.js            # Cliente Supabase
│   ├── data.js                # Datos de migración inicial (54 eventos)
│   └── index.css              # Estilos Tailwind + custom
├── SCHEMA.sql                 # Esquema completo de BD
├── DATA_MODEL.md              # Documentación del modelo de datos
├── index.html                 # HTML base
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json                # Config de deploy
```

---

## Módulos Principales (Tabs)

| Tab | ID | Descripción |
|-----|-----|-------------|
| Dashboard | `dashboard` | Resumen: eventos próximos, confirmados sin reserva, métricas |
| Próximos | `proximos` | Eventos confirmados futuros |
| A Confirmar | `aconfirmar` | Cotizaciones pendientes de confirmación |
| Realizados | `realizados` | Eventos pasados (histórico) |
| Calendario | `calendario` | Vista mensual de eventos |
| Eventos | `eventos` | CRUD completo de eventos |
| Cobranzas | `cobranzas` | Estado de cuenta, pagos, IPC |
| Menús | `menus` | Catálogo de platos y menús |
| Informes | `informes` | Reportes y gráficos |
| Agenda | `agenda` | Contactos/clientes |
| Usuarios | `usuarios` | Gestión de usuarios (solo admin) |
| Caja | `caja` | Ingresos, egresos, transferencias |

---

## Tablas de Supabase

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `eventos` | Eventos del salón (fecha, cliente, precios, extras, estado) |
| `pagos` | Pagos asociados a eventos (seña, pago, ajuste_ipc) |
| `menus` | Menús personalizados con categorías (JSONB) |
| `clientes` | Agenda de contactos |
| `usuarios` | Usuarios del sistema con roles |
| `ipc_mensual` | Registro de IPC aplicados por mes |
| `caja_movimientos` | Movimientos de caja (ingresos/egresos) |

### Tablas de Auditoría

| Tabla | Descripción |
|-------|-------------|
| `auditoria_eventos` | Log de cambios en eventos |
| `auditoria_pagos` | Log de cambios en pagos |
| `auditoria_caja` | Log de movimientos de caja |

### Campos Clave - Eventos

```sql
-- Identificación
id UUID PRIMARY KEY
fecha DATE NOT NULL
cliente VARCHAR(255) NOT NULL
telefono VARCHAR(50)

-- Clasificación
vendedor VARCHAR(100)        -- 'Francisco', 'Rodrigo', 'Piru'
tipo_evento VARCHAR(100)     -- 'Cumple 50', 'Casamiento', etc.
menu VARCHAR(100)            -- 'Tapas', 'Asado', '3 Pasos'
salon VARCHAR(50)            -- 'Tero', 'Cristal', 'Salentein'
turno VARCHAR(20)            -- 'Noche', 'M. Dia'

-- Invitados y precios
adultos INTEGER
precio_adulto DECIMAL(10,2)
menores INTEGER
precio_menor DECIMAL(10,2)

-- Extras (hasta 3)
extra1_desc, extra1_valor, extra1_tipo, extra1_confirmado
extra2_desc, extra2_valor, extra2_tipo, extra2_confirmado
extra3_desc, extra3_valor, extra3_tipo, extra3_confirmado
-- tipo: 'total' o 'por_persona'
-- confirmado: si se incluye en el presupuesto final

-- Servicios adicionales
tecnica BOOLEAN              -- Sonido/iluminación básica
tecnica_superior BOOLEAN     -- Técnica premium
tecnica_precio DECIMAL
tecnica_superior_precio DECIMAL
dj VARCHAR                   -- Nombre del DJ
ceremonia BOOLEAN

-- Dietas especiales
celiacos INTEGER
vegetarianos INTEGER
veganos INTEGER

-- Estado
confirmado BOOLEAN           -- false = cotización, true = confirmado
anulado BOOLEAN              -- Evento cancelado
total_evento DECIMAL(12,2)
total_ajustes_ipc DECIMAL    -- Suma de ajustes por inflación

-- Menú detallado
menu_detalle JSONB           -- Estructura de categorías y platos
```

### Campos Clave - Pagos

```sql
evento_id UUID (FK)
fecha DATE
monto DECIMAL(12,2)
concepto VARCHAR(50)         -- 'seña', 'pago', 'ajuste_ipc'
cobrador VARCHAR             -- Quién recibió el pago
moneda VARCHAR               -- 'ARS' o 'USD'
cotizacion_dolar DECIMAL     -- Si es USD, cotización usada
ipc_indec DECIMAL            -- Si es ajuste_ipc
ipc_aplicado DECIMAL         -- Porcentaje aplicado
```

---

## Variables de Entorno

El proyecto usa credenciales hardcodeadas en `src/supabase.js`:

```javascript
const supabaseUrl = 'https://ykirofgvxwqnicrhrlxe.supabase.co'
const supabaseKey = 'sb_publishable_...'
```

> **Nota:** En producción se recomienda usar variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

---

## Convenciones de Código

### Nomenclatura

- **Variables de negocio:** Español (`precioAdulto`, `totalEvento`, `fechaEvento`)
- **Variables técnicas:** Inglés (`loading`, `error`, `saving`)
- **Constantes:** SCREAMING_SNAKE_CASE (`VENDEDORES`, `TIPOS_EVENTO`, `MESES`)
- **Componentes:** PascalCase (actualmente todo en `App.jsx`)
- **Funciones:** camelCase (`formatCurrency`, `handleSubmit`, `fetchEventos`)

### Formato de Datos

- **Moneda:** Formato argentino con `$` y puntos de miles (`$1.234.567`)
- **Fechas:** ISO en BD (`YYYY-MM-DD`), mostrar como `DD/MM/YYYY`
- **Inputs numéricos:** Se formatean con puntos y se parsean sin puntos para guardar

### Funciones de Formato

```javascript
formatCurrency(value)     // $1.234.567
formatNumber(num)         // 1.234.567 (sin $)
formatNumberInput(value)  // Para inputs con puntos
parseNumberInput(value)   // Quita puntos para guardar
formatDate(dateStr)       // "08 mar 2025"
formatDateDMY(dateStr)    // "08/03/2025"
getLocalDateString()      // "2025-03-08" (fecha actual)
```

### Estilos

- **Tema:** Dark mode con glassmorphism
- **Colores principales:** Indigo/Violet (`#6366f1`, `#8b5cf6`)
- **Fondo:** Gradiente oscuro (`from-slate-950 via-indigo-950 to-slate-900`)
- **Cards:** Clase `.glass` con blur y bordes semitransparentes
- **Tipografía:** Inter con números tabulares para montos

---

## Reglas de Negocio

### Estados de Evento

```
┌─────────────────┐
│   COTIZACIÓN    │  confirmado: false, anulado: false
│   (Pendiente)   │
└────────┬────────┘
         │ Confirmar
         ▼
┌─────────────────┐
│   CONFIRMADO    │  confirmado: true, anulado: false
│                 │
└────────┬────────┘
         │ Anular
         ▼
┌─────────────────┐
│    ANULADO      │  anulado: true
│                 │
└─────────────────┘
```

### Cálculo de Total del Evento

```javascript
total = (adultos * precio_adulto) + (menores * precio_menor)
      + técnica_precio (si aplica)
      + técnica_superior_precio (si aplica)
      + extras confirmados (extra1 + extra2 + extra3)

// Extras:
// - Si tipo = 'por_persona': valor * adultos
// - Si tipo = 'total': valor
// - Solo suman si extra_confirmado = true
```

### Lógica de IPC (Índice de Precios al Consumidor)

1. Se carga el IPC mensual (INDEC oficial vs aplicado al negocio)
2. Aplica a eventos que:
   - Tienen saldo pendiente
   - Su primer pago fue ANTES del mes del IPC
   - No están anulados
3. Se crea un pago con `concepto: 'ajuste_ipc'`
4. Fórmula: `ajuste = saldo_pendiente * (ipc_aplicado / 100)`
5. Se acumula en `total_ajustes_ipc` del evento

### Manejo de Monedas (Pesos / Dólares)

- Moneda por defecto: ARS (pesos argentinos)
- Pagos en USD requieren cotización del dólar
- Se guarda `cotizacion_dolar` al momento del pago
- API usada: `https://dolarapi.com/v1/dolares/blue`
- Caja maneja `monto_pesos` y `monto_dolares` por separado

### Cobradores / Cajas

```javascript
const COBRADORES = ['Francisco', 'Rodrigo', 'Piru', 'Banco', 'Caja'];
```

- Cada pago registra quién lo recibió
- Caja tiene módulo separado para ingresos/egresos/transferencias
- Requiere desbloqueo con contraseña (tiempo limitado)

### Vendedores

```javascript
const VENDEDORES = ['Rodrigo', 'Francisco', 'Piru'];
```

### Roles de Usuario

| Rol | Permisos |
|-----|----------|
| `admin` | Todo: crear, editar, eliminar, ver usuarios |
| `vendedor` | Crear y editar eventos/pagos |
| `lectura` | Solo visualización |

### Generación de PDFs

| PDF | Función | Uso |
|-----|---------|-----|
| Resumen Operativo | `generarPDF()` | B/N para cocina/encargados |
| Cotización | `generarCotizacion()` | Presupuesto formal para cliente |
| Recibo | `generarRecibo()` | Comprobante de pago |

---

## Salones

| Salón | Capacidad típica |
|-------|------------------|
| Tero | Principal |
| Cristal | Alternativo |
| Salentein | Íntimo |

## Tipos de Menú

```javascript
const TIPOS_MENU = ['Menu Tapeo', 'Menu Asado', 'Menu 3 Pasos', 'Menu Premium', 'Menu Brunch', 'Otro'];
```

Cada tipo tiene sus categorías predefinidas en `CATEGORIAS_POR_MENU` y platos en `PLATOS_POR_MENU`.

---

## Contexto de Negocio

- **Empresa:** Tero Restaurante y Salón de Eventos
- **Ubicación:** Argentina (zona Nordelta/Tigre)
- **Público:** Eventos sociales y empresariales
- **Rango de precios:** $1M - $25M ARS por evento
- **Eventos típicos:** Cumpleaños (40, 50, 60), Casamientos, Eventos empresariales, Bat/Bar Mitzvah

### Política de Pagos (desde PDF)

- Anticipo del 50%
- Saldos se ajustan por IPC
- Cancelación 15 días antes del evento
- IVA 21% se agrega al total
- Propina sugerida: 7-10% del presupuesto
