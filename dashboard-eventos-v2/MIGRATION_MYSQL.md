# Guia de Migracion a MySQL

## Objetivo

Migrar el sistema desde Supabase (PostgreSQL) a un servidor propio con MySQL.

---

## 1. Esquema MySQL

```sql
-- Crear base de datos
CREATE DATABASE dashboard_eventos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE dashboard_eventos;

-- =============================================
-- TABLA: eventos
-- =============================================
CREATE TABLE eventos (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Datos basicos
  fecha DATE NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),

  -- Horarios
  turno VARCHAR(20),
  hora_inicio TIME,
  hora_fin TIME,

  -- Clasificacion
  vendedor VARCHAR(100),
  tipo_evento VARCHAR(100),
  menu VARCHAR(100),
  salon VARCHAR(50),

  -- Servicios
  tecnica BOOLEAN DEFAULT FALSE,
  dj BOOLEAN DEFAULT FALSE,
  tecnica_superior BOOLEAN DEFAULT FALSE,
  otros TEXT,

  -- Invitados
  adultos INT DEFAULT 0,
  precio_adulto DECIMAL(10,2) DEFAULT 0,
  menores INT DEFAULT 0,
  precio_menor DECIMAL(10,2) DEFAULT 0,

  -- Extras
  extra1_desc VARCHAR(255),
  extra1_valor DECIMAL(10,2) DEFAULT 0,
  extra1_tipo VARCHAR(20) DEFAULT 'total',
  extra2_desc VARCHAR(255),
  extra2_valor DECIMAL(10,2) DEFAULT 0,
  extra2_tipo VARCHAR(20) DEFAULT 'total',
  extra3_desc VARCHAR(255),
  extra3_valor DECIMAL(10,2) DEFAULT 0,
  extra3_tipo VARCHAR(20) DEFAULT 'total',

  -- Totales
  total_evento DECIMAL(12,2) DEFAULT 0,
  confirmado BOOLEAN DEFAULT FALSE,
  menu_detalle JSON,

  -- Indices
  INDEX idx_fecha (fecha),
  INDEX idx_cliente (cliente),
  INDEX idx_confirmado (confirmado)
);

-- =============================================
-- TABLA: pagos
-- =============================================
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

-- =============================================
-- TABLA: menus
-- =============================================
CREATE TABLE menus (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nombre VARCHAR(255) NOT NULL,
  categorias JSON,
  extras JSON
);

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE usuarios (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255),
  rol VARCHAR(20) DEFAULT 'lectura',

  INDEX idx_email (email)
);

-- =============================================
-- TABLA: sesiones (para JWT)
-- =============================================
CREATE TABLE sesiones (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

---

## 2. Backend Node.js/Express

### Estructura de Carpetas

```
/backend
├── src/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── eventos.js
│   │   ├── pagos.js
│   │   ├── menus.js
│   │   └── usuarios.js
│   ├── controllers/
│   │   └── ...
│   └── app.js
├── package.json
└── .env
```

### Dependencias

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
```

### Configuracion Database

```javascript
// src/config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
```

### Middleware Auth

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido' });
  }
};

module.exports = authMiddleware;
```

### Ejemplo Ruta Eventos

```javascript
// src/routes/eventos.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET todos los eventos
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM eventos ORDER BY fecha DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST nuevo evento
router.post('/', auth, async (req, res) => {
  try {
    const { fecha, cliente, ... } = req.body;
    const [result] = await pool.query(
      'INSERT INTO eventos (fecha, cliente, ...) VALUES (?, ?, ...)',
      [fecha, cliente, ...]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 3. Variables de Entorno

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dashboard_eventos
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=clave_secreta_muy_larga_y_segura_cambiar_en_produccion

# Servidor
PORT=3001
NODE_ENV=production
```

---

## 4. Modificar Frontend

### Antes (Supabase)

```javascript
// Consulta
const { data, error } = await supabase
  .from('eventos')
  .select('*');

// Insertar
const { error } = await supabase
  .from('eventos')
  .insert([{ ... }]);
```

### Despues (API REST)

```javascript
// Crear archivo api.js
const API_URL = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return res.json();
  },

  post: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // put, delete similares...
};

// Uso en componentes
const eventos = await api.get('/eventos');
await api.post('/eventos', nuevoEvento);
```

---

## 5. Exportar Datos de Supabase

### Desde Dashboard

1. Ir a **Table Editor**
2. Seleccionar tabla
3. Click en "Export" > "CSV" o "JSON"

### Desde Codigo

```javascript
// Ejecutar en consola del navegador
const exportData = async () => {
  const { data: eventos } = await supabase.from('eventos').select('*');
  const { data: pagos } = await supabase.from('pagos').select('*');
  const { data: menus } = await supabase.from('menus').select('*');
  const { data: usuarios } = await supabase.from('usuarios').select('*');

  console.log('EVENTOS:', JSON.stringify(eventos, null, 2));
  console.log('PAGOS:', JSON.stringify(pagos, null, 2));
  console.log('MENUS:', JSON.stringify(menus, null, 2));
  console.log('USUARIOS:', JSON.stringify(usuarios, null, 2));
};

exportData();
```

---

## 6. Importar a MySQL

```sql
-- Ejemplo para importar eventos desde JSON
-- Usar herramienta como MySQL Workbench o script

LOAD DATA LOCAL INFILE 'eventos.csv'
INTO TABLE eventos
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

O usar script Node.js para insertar desde JSON.

---

## 7. Pasos de Migracion

1. [ ] Crear servidor MySQL
2. [ ] Ejecutar esquema SQL
3. [ ] Crear proyecto backend Node.js
4. [ ] Implementar rutas API
5. [ ] Exportar datos de Supabase
6. [ ] Importar datos a MySQL
7. [ ] Modificar frontend para usar API REST
8. [ ] Implementar autenticacion JWT
9. [ ] Configurar CORS
10. [ ] Desplegar backend (VPS, Railway, etc.)
11. [ ] Desplegar frontend
12. [ ] Probar todas las funcionalidades
13. [ ] Migrar dominio

---

## 8. Consideraciones

### Diferencias PostgreSQL vs MySQL

| PostgreSQL | MySQL |
|------------|-------|
| UUID nativo | CHAR(36) con UUID() |
| JSONB | JSON |
| TIMESTAMP WITH TIME ZONE | TIMESTAMP |
| auth.users (Supabase) | Tabla propia |

### Autenticacion

- Supabase maneja auth automaticamente
- En MySQL debes implementar:
  - Hash de passwords (bcrypt)
  - Generacion de JWT
  - Middleware de verificacion
  - Manejo de sesiones
