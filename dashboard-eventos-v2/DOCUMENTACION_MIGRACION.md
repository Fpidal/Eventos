# Dashboard de Eventos - Documentacion y Migracion

## 1. Descripcion del Sistema

Sistema de gestion de eventos para salon de fiestas que permite:
- Gestion de eventos (crear, editar, eliminar, confirmar)
- Generacion de cotizaciones en PDF con desglose de IVA
- Gestion de cobranzas y pagos (senas, pagos, ajustes IPC)
- Creacion de menus personalizados con categorias y platos
- Dashboard con estadisticas (facturacion, vendedores, comensales, salones, menus)
- Sistema de usuarios con roles (admin, escritura, lectura)
- Calendario de eventos

---

## 2. Tecnologias Actuales

- **Frontend:** React 18 + Vite
- **Estilos:** Tailwind CSS
- **Graficos:** Recharts
- **PDF:** jsPDF
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticacion:** Supabase Auth
- **Hosting:** (Vercel/Netlify segun configuracion)

---

## 3. Estructura de Base de Datos Actual (Supabase/PostgreSQL)

### Tabla: eventos
```sql
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha DATE NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  turno VARCHAR(20), -- 'Noche', 'Mediodia'
  hora_inicio TIME,
  hora_fin TIME,
  vendedor VARCHAR(100),
  tipo_evento VARCHAR(100), -- 'Cumple 50', 'Casamiento', etc.
  menu VARCHAR(100), -- 'Tapas', 'Asado', '3 Pasos', etc.
  salon VARCHAR(50), -- 'Tero', 'Cristal', 'Salentein'
  tecnica BOOLEAN DEFAULT FALSE,
  dj BOOLEAN DEFAULT FALSE,
  tecnica_superior BOOLEAN DEFAULT FALSE,
  otros TEXT,
  adultos INTEGER DEFAULT 0,
  precio_adulto DECIMAL(10,2) DEFAULT 0,
  menores INTEGER DEFAULT 0,
  precio_menor DECIMAL(10,2) DEFAULT 0,
  extra1_desc VARCHAR(255),
  extra1_valor DECIMAL(10,2) DEFAULT 0,
  extra1_tipo VARCHAR(20) DEFAULT 'total', -- 'total' o 'por_persona'
  extra2_desc VARCHAR(255),
  extra2_valor DECIMAL(10,2) DEFAULT 0,
  extra2_tipo VARCHAR(20) DEFAULT 'total',
  extra3_desc VARCHAR(255),
  extra3_valor DECIMAL(10,2) DEFAULT 0,
  extra3_tipo VARCHAR(20) DEFAULT 'total',
  total_evento DECIMAL(12,2) DEFAULT 0,
  confirmado BOOLEAN DEFAULT FALSE,
  menu_detalle JSONB -- Objeto con detalle del menu seleccionado
);
```

### Tabla: pagos
```sql
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  concepto VARCHAR(50) NOT NULL -- 'pago', 'seña', 'ajuste_ipc'
);
```

### Tabla: menus
```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nombre VARCHAR(255) NOT NULL,
  categorias JSONB, -- Array de {nombre: string, items: string[]}
  extras JSONB -- Array de strings con nombres de extras
);
```

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  nombre VARCHAR(255),
  rol VARCHAR(20) DEFAULT 'lectura' -- 'admin', 'escritura', 'lectura'
);
```

---

## 4. Esquema Equivalente para MySQL

```sql
-- Crear base de datos
CREATE DATABASE dashboard_eventos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dashboard_eventos;

-- Tabla eventos
CREATE TABLE eventos (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha DATE NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  turno VARCHAR(20),
  hora_inicio TIME,
  hora_fin TIME,
  vendedor VARCHAR(100),
  tipo_evento VARCHAR(100),
  menu VARCHAR(100),
  salon VARCHAR(50),
  tecnica BOOLEAN DEFAULT FALSE,
  dj BOOLEAN DEFAULT FALSE,
  tecnica_superior BOOLEAN DEFAULT FALSE,
  otros TEXT,
  adultos INT DEFAULT 0,
  precio_adulto DECIMAL(10,2) DEFAULT 0,
  menores INT DEFAULT 0,
  precio_menor DECIMAL(10,2) DEFAULT 0,
  extra1_desc VARCHAR(255),
  extra1_valor DECIMAL(10,2) DEFAULT 0,
  extra1_tipo VARCHAR(20) DEFAULT 'total',
  extra2_desc VARCHAR(255),
  extra2_valor DECIMAL(10,2) DEFAULT 0,
  extra2_tipo VARCHAR(20) DEFAULT 'total',
  extra3_desc VARCHAR(255),
  extra3_valor DECIMAL(10,2) DEFAULT 0,
  extra3_tipo VARCHAR(20) DEFAULT 'total',
  total_evento DECIMAL(12,2) DEFAULT 0,
  confirmado BOOLEAN DEFAULT FALSE,
  menu_detalle JSON,
  INDEX idx_fecha (fecha),
  INDEX idx_cliente (cliente),
  INDEX idx_confirmado (confirmado)
);

-- Tabla pagos
CREATE TABLE pagos (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  evento_id CHAR(36) NOT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  concepto VARCHAR(50) NOT NULL,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  INDEX idx_evento (evento_id),
  INDEX idx_fecha (fecha)
);

-- Tabla menus
CREATE TABLE menus (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nombre VARCHAR(255) NOT NULL,
  categorias JSON,
  extras JSON
);

-- Tabla usuarios
CREATE TABLE usuarios (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id CHAR(36),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255),
  rol VARCHAR(20) DEFAULT 'lectura',
  INDEX idx_email (email)
);

-- Tabla sesiones (para autenticacion propia)
CREATE TABLE sesiones (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

---

## 5. Variables de Entorno

### Actuales (Supabase)
```env
VITE_SUPABASE_URL=https://ykirofgvxwqnicrhrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Para MySQL (nuevas)
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dashboard_eventos
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# JWT para autenticacion
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura

# Servidor
PORT=3001
NODE_ENV=production
```

---

## 6. Cambios Necesarios para Migracion a MySQL

### 6.1 Backend (Nuevo - Node.js/Express)

Crear un backend con Express que maneje:
- Autenticacion (login, registro, sesiones JWT)
- CRUD de eventos
- CRUD de pagos
- CRUD de menus
- CRUD de usuarios

Ejemplo de estructura:
```
/backend
  /src
    /routes
      - eventos.js
      - pagos.js
      - menus.js
      - usuarios.js
      - auth.js
    /controllers
    /middleware
      - auth.js (verificar JWT)
    /config
      - database.js (conexion MySQL)
    - app.js
    - server.js
  package.json
```

### 6.2 Frontend (Modificaciones)

Reemplazar llamadas a Supabase por llamadas a API REST:

```javascript
// ANTES (Supabase)
const { data, error } = await supabase.from('eventos').select('*');

// DESPUES (API REST)
const response = await fetch('/api/eventos', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
```

### 6.3 Autenticacion

Reemplazar Supabase Auth por JWT propio:
- Login: POST /api/auth/login
- Registro: POST /api/auth/register
- Verificar token en cada request

---

## 7. Datos de Configuracion del Sistema

### Tipos de Evento
```javascript
const TIPOS_EVENTO = [
  'Cumple 50', 'Cumple 40', 'Cumple 30', 'Cumple 60', 'Cumple 70',
  'Cumple 80', 'Cumple 15', 'Cumple Infantil', 'Casamiento',
  'Bautismo', 'Comunion', 'Confirmacion', 'Aniversario',
  'Empresarial', 'Egresados', 'Despedida', 'Otro'
];
```

### Tipos de Menu
```javascript
const TIPOS_MENU = ['Menu Tapeo', 'Menu Asado', 'Menu 3 Pasos', 'Otro'];
```

### Salones
```javascript
const SALONES = ['Tero', 'Cristal', 'Salentein'];
```

### Vendedores
```javascript
const VENDEDORES = ['Francisco', 'Belen', 'Carla', 'Otro'];
```

### Menus Base
```javascript
const MENUS = ['Tapas', 'Asado', '3 Pasos', 'Personalizado'];
```

### Roles de Usuario
- **admin**: Acceso total (crear usuarios, eliminar, todo)
- **escritura**: Puede crear/editar eventos y pagos
- **lectura**: Solo puede ver informacion

---

## 8. Funcionalidades del Sistema

### Dashboard
- Total de eventos del ano
- Facturacion total
- Total de invitados
- Promedio por evento
- Grafico de facturacion por mes
- Grafico de ventas por vendedor
- Grafico de comensales por mes (adultos/menores)
- Eventos por tipo
- Eventos por menu
- Eventos por salon

### Eventos
- Crear nuevo evento con todos los datos
- Editar evento existente
- Eliminar evento (solo si no tiene pagos)
- Marcar como confirmado
- Generar cotizacion PDF con IVA 21%
- Vista de proximos eventos
- Vista de eventos a confirmar
- Calendario mensual
- Tabla con filtros y ordenamiento

### Cobranzas
- Solo muestra eventos confirmados
- Registro de pagos, senas y ajustes IPC
- Filtros por mes y estado
- Estados: Pendientes, Con Saldo, Cancelados
- Estadisticas de facturacion vs cobrado

### Menus
- Crear menus personalizados
- Categorias dinamicas segun tipo de menu
- Platos predefinidos por categoria
- Agregar platos personalizados
- Extras opcionales

### Usuarios (Solo Admin)
- Crear nuevos usuarios
- Asignar roles
- Eliminar usuarios

---

## 9. Estructura de Archivos del Proyecto

```
dashboard-eventos-v2/
├── public/
├── src/
│   ├── App.jsx          # Componente principal (toda la logica)
│   ├── supabase.js      # Configuracion Supabase
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── DOCUMENTACION_MIGRACION.md
```

---

## 10. Pasos para Migrar

1. **Crear servidor MySQL** y ejecutar el esquema SQL
2. **Crear backend Node.js/Express** con las rutas API
3. **Exportar datos de Supabase** a archivos JSON
4. **Importar datos a MySQL**
5. **Modificar frontend** para usar API REST en lugar de Supabase
6. **Implementar autenticacion JWT**
7. **Configurar CORS** en el backend
8. **Desplegar** backend y frontend
9. **Probar** todas las funcionalidades
10. **Migrar dominio** al nuevo servidor

---

## 11. Exportar Datos de Supabase

Para exportar los datos actuales, usar el panel de Supabase:
1. Ir a Table Editor
2. Exportar cada tabla como CSV o JSON
3. O usar la API:

```javascript
// Exportar eventos
const { data: eventos } = await supabase.from('eventos').select('*');
console.log(JSON.stringify(eventos, null, 2));

// Exportar pagos
const { data: pagos } = await supabase.from('pagos').select('*');
console.log(JSON.stringify(pagos, null, 2));

// Exportar menus
const { data: menus } = await supabase.from('menus').select('*');
console.log(JSON.stringify(menus, null, 2));

// Exportar usuarios
const { data: usuarios } = await supabase.from('usuarios').select('*');
console.log(JSON.stringify(usuarios, null, 2));
```

---

## 12. Contacto y Soporte

Sistema desarrollado para gestion de eventos.
Para soporte tecnico o consultas sobre la migracion, contactar al desarrollador.

---

*Documento generado: Enero 2026*
