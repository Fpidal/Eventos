# Dashboard de Eventos

Sistema de gestion de eventos para salon de fiestas con control de cobranzas, menus personalizados y generacion de cotizaciones.

## Funcionalidades (MVP)

El sistema incluye cinco modulos principales:

1. **Dashboard** - Estadisticas de facturacion, graficos de ventas por vendedor, comensales por mes, eventos por tipo/menu/salon

2. **Gestion de Eventos** - CRUD completo, confirmacion de eventos, calendario mensual, filtros y ordenamiento

3. **Cotizaciones PDF** - Generacion automatica con desglose de Subtotal, IVA 21% y Total

4. **Cobranzas** - Registro de pagos, senas y ajustes IPC. Filtros por estado (Pendientes/Con Saldo/Cancelados)

5. **Menus** - Creacion de menus personalizados con categorias, platos predefinidos y extras

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
│   ├── App.jsx          # Componente principal
│   ├── supabase.js      # Configuracion BD
│   └── index.css        # Estilos
├── SCHEMA.sql           # Estructura de BD
├── PROJECT_SPEC.md      # Especificaciones
├── DATA_MODEL.md        # Modelo de datos
├── SETUP.md             # Guia de instalacion
├── MIGRATION_MYSQL.md   # Guia migracion MySQL
└── README.md
```

## Documentacion

| Archivo | Descripcion |
|---------|-------------|
| [SCHEMA.sql](./SCHEMA.sql) | Estructura de base de datos PostgreSQL |
| [PROJECT_SPEC.md](./PROJECT_SPEC.md) | Especificaciones del proyecto |
| [DATA_MODEL.md](./DATA_MODEL.md) | Modelo de datos y relaciones |
| [SETUP.md](./SETUP.md) | Guia de instalacion y configuracion |
| [MIGRATION_MYSQL.md](./MIGRATION_MYSQL.md) | Guia de migracion a MySQL |
| [DEPLOY_SERVER.md](./DEPLOY_SERVER.md) | Migracion de Vercel a servidor propio (con claves) |

## Estado Actual

**MVP operativo** con:
- Sistema de eventos completo
- Cobranzas con filtros por estado
- Menus personalizables (Tapeo, Asado, 3 Pasos)
- Cotizaciones PDF con IVA
- Dashboard con estadisticas
- Sistema de usuarios con roles

## Instalacion Rapida

```bash
git clone https://github.com/Fpidal/Eventos.git
cd dashboard-eventos-v2
npm install
npm run dev
```

Ver [SETUP.md](./SETUP.md) para configuracion completa.

---

*Sistema de gestion de eventos - 2026*
