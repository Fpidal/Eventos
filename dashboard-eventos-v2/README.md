# Dashboard de Eventos - Tero Resto

Sistema de gestion de eventos para salon de fiestas con control de cobranzas, menus personalizados, agenda de clientes y generacion de cotizaciones profesionales.

## Funcionalidades

El sistema incluye los siguientes modulos:

### 1. Dashboard
- Estadisticas de facturacion mensual
- Graficos de ventas por vendedor
- Comensales por mes
- Eventos por tipo/menu/salon

### 2. Gestion de Eventos
- CRUD completo de eventos
- Confirmacion y anulacion de eventos
- Calendario mensual interactivo
- Filtros por vendedor, mes y estado
- **Exportar a CSV/Excel**

### 3. Cotizaciones PDF
- Generacion profesional con logo
- Colores verde oliva corporativos
- Desglose de menu por categorias
- Formas de pago y politicas de cancelacion
- Subtotal, IVA 21% y Total

### 4. Cobranzas
- Registro de pagos y senas
- Ajustes por IPC
- Auditoria de movimientos
- Filtros por estado (Pendientes/Con Saldo/Cancelados)

### 5. Caja
- Movimientos de ingresos y egresos
- Balance diario
- Proteccion con clave

### 6. Menus
- **Plantillas de Menu**: Tapeo, Asado, 3 Pasos, etc.
- **Catalogo de Platos**: Base de datos de platos y bebidas
- Categorias personalizables
- Extras opcionales

### 7. Agenda de Contactos
- Base de datos de clientes con UUID unico
- Sincronizacion desde eventos
- Campos: nombre, telefono, email, observaciones
- **Exportar a CSV** para integracion con CRM
- ID unico para cada cliente

### 8. Informes
- Estadisticas generales
- Eventos por tipo, menu, salon
- Facturacion por vendedor
- Graficos de tendencias

### 9. Administracion
- Gestion de usuarios
- Roles: admin, lectura
- Tipo de cambio USD

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS |
| Graficos | Recharts |
| PDF | jsPDF |
| Base de Datos | PostgreSQL (Supabase) |
| Autenticacion | Supabase Auth |
| Hosting | Vercel |

## Estructura del Repositorio

```
dashboard-eventos-v2/
├── src/
│   ├── App.jsx          # Componente principal (~7000 lineas)
│   ├── supabase.js      # Configuracion Supabase
│   ├── index.css        # Estilos Tailwind
│   └── main.jsx         # Entry point
├── public/
│   └── logo.png         # Logo Tero Resto
├── dist/                # Build de produccion
├── SCHEMA.sql           # Estructura de BD
├── PROJECT_SPEC.md      # Especificaciones
├── DATA_MODEL.md        # Modelo de datos
├── SETUP.md             # Guia de instalacion
├── MIGRATION_MYSQL.md   # Guia migracion MySQL
├── DEPLOY_SERVER.md     # Deploy en servidor propio
└── README.md
```

## Base de Datos (Supabase)

### Tablas principales:
- `eventos` - Eventos con fechas, clientes, precios
- `pagos` - Pagos y senas de eventos
- `menus` - Plantillas de menu
- `clientes` - Agenda de contactos con UUID
- `usuarios` - Usuarios del sistema
- `caja_movimientos` - Movimientos de caja
- `auditoria_pagos` - Historial de pagos
- `auditoria_eventos` - Historial de eventos

## Documentacion

| Archivo | Descripcion |
|---------|-------------|
| [SCHEMA.sql](./SCHEMA.sql) | Estructura de base de datos PostgreSQL |
| [PROJECT_SPEC.md](./PROJECT_SPEC.md) | Especificaciones del proyecto |
| [DATA_MODEL.md](./DATA_MODEL.md) | Modelo de datos y relaciones |
| [SETUP.md](./SETUP.md) | Guia de instalacion y configuracion |
| [MIGRATION_MYSQL.md](./MIGRATION_MYSQL.md) | Guia de migracion a MySQL |
| [DEPLOY_SERVER.md](./DEPLOY_SERVER.md) | Migracion de Vercel a servidor propio |

## Instalacion Rapida

```bash
git clone https://github.com/Fpidal/Eventos.git
cd dashboard-eventos-v2
npm install
npm run dev
```

Ver [SETUP.md](./SETUP.md) para configuracion completa de Supabase.

## Variables de Entorno

Crear archivo `.env` con:
```
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Deploy

El proyecto esta configurado para deploy automatico en Vercel.
Cada push a `main` dispara un nuevo deploy.

---

*Sistema de gestion de eventos - Tero Resto - 2026*
