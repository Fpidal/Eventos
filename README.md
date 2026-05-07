# Dashboard de Eventos

Sistema de gestión de eventos para salón de fiestas con control de cobranzas, menús personalizados y generación de cotizaciones.

## Funcionalidades

El sistema incluye los siguientes módulos:

1. **Dashboard** - Estadísticas de facturación, gráficos de ventas por vendedor, comensales por mes, eventos por tipo/menú/salón

2. **Gestión de Eventos** - CRUD completo, confirmación de eventos, calendario mensual, filtros y ordenamiento

3. **Cotizaciones PDF** - Generación automática con diseño profesional, 3 paquetes (Classic/Premium/Gold) o precio libre, desglose con IVA 21%

4. **Cobranzas** - Registro de pagos, señas y ajustes IPC. Filtros por estado (Pendientes/Con Saldo/Cancelados)

5. **Menús** - Creación de menús personalizados con categorías, platos predefinidos y extras

6. **Informes** - Auditoría de cambios, estadísticas, gestión de precios (admin) y exportación de backup a Excel

7. **Caja** - Control de ingresos, egresos y transferencias entre cajas

## Novedades v2.2

- **Gestión de Precios**: Editar precios de paquetes (Classic/Premium/Gold) desde Informes (solo admin)
- **Soporte Móvil Mejorado**: Formularios responsive, PDF descargable en móvil, modales optimizados
- **Precios por Evento**: Cada evento guarda sus propios precios, independiente de cambios futuros

## Novedades v2.1

- **Sistema de Paquetes**: Classic, Premium y Gold con precios configurables
- **Cotización PDF Profesional**: Diseño elegante con logo, 3 opciones de experiencia
- **Precio Libre**: Compatibilidad con eventos anteriores al sistema de paquetes
- **Exportar Backup Excel**: Descarga todos los eventos en formato Excel profesional con hojas separadas (Confirmados, Pendientes, Anulados, Resumen)
- **Modo Legacy**: Eventos antiguos mantienen su formato de cotización original

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS |
| Gráficos | Recharts |
| PDF | jsPDF + html2canvas |
| Excel | ExcelJS |
| Base de Datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth |
| Hosting | Vercel |

## Estructura del Repositorio

```
dashboard-eventos-v2/
├── src/
│   ├── App.jsx              # Componente principal
│   ├── CotizacionTemplate.js # Template HTML para cotización PDF
│   ├── supabase.js          # Configuración BD
│   ├── constants.js         # Constantes del sistema
│   ├── utils.js             # Funciones utilitarias
│   ├── supabaseQueries.js   # Consultas a BD
│   ├── hooks/
│   │   ├── useAuth.js       # Autenticación
│   │   └── useEventos.js    # Lógica de eventos
│   └── index.css            # Estilos
├── public/
│   ├── logo-tero.jpg        # Logo color
│   └── logo-tero-blanco.png # Logo blanco
├── SCHEMA.sql               # Estructura de BD
├── CLAUDE.md                # Contexto para IA
└── README.md
```

## Documentación

| Archivo | Descripción |
|---------|-------------|
| [SCHEMA.sql](./SCHEMA.sql) | Estructura de base de datos PostgreSQL |
| [CLAUDE.md](./CLAUDE.md) | Contexto del proyecto para asistentes IA |

## Estado Actual

**Sistema operativo** con:
- Gestión completa de eventos con paquetes y precio libre
- Cobranzas con filtros por estado y ajuste IPC
- Menús personalizables (Tapeo, Asado, 3 Pasos, Premium, Brunch)
- Cotizaciones PDF profesionales con 3 opciones
- Dashboard con estadísticas
- Exportación de backup a Excel
- Sistema de usuarios con roles (admin, vendedor, lectura)
- Caja con ingresos, egresos y transferencias
- Gestión de precios de paquetes desde el sistema
- Soporte completo para dispositivos móviles

## Instalación

```bash
git clone https://github.com/Fpidal/Eventos.git
cd dashboard-eventos-v2
npm install
npm run dev
```

## Variables de Entorno

Crear archivo `.env` con:
```
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

---

*Tero Restaurante - Sistema de Gestión de Eventos - 2026*
