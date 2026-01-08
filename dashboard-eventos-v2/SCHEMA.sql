-- =============================================
-- DASHBOARD EVENTOS - ESQUEMA DE BASE DE DATOS
-- PostgreSQL (Supabase)
-- =============================================

-- Habilitar extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: eventos
-- Almacena todos los eventos del salon
-- =============================================
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Datos basicos
  fecha DATE NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),

  -- Horarios
  turno VARCHAR(20), -- 'Noche', 'Mediodia'
  hora_inicio TIME,
  hora_fin TIME,

  -- Clasificacion
  vendedor VARCHAR(100),
  tipo_evento VARCHAR(100), -- 'Cumple 50', 'Casamiento', etc.
  menu VARCHAR(100), -- 'Tapas', 'Asado', '3 Pasos', etc.
  salon VARCHAR(50), -- 'Tero', 'Cristal', 'Salentein'

  -- Servicios adicionales
  tecnica BOOLEAN DEFAULT FALSE,
  dj BOOLEAN DEFAULT FALSE,
  tecnica_superior BOOLEAN DEFAULT FALSE,
  otros TEXT,

  -- Invitados y precios
  adultos INTEGER DEFAULT 0,
  precio_adulto DECIMAL(10,2) DEFAULT 0,
  menores INTEGER DEFAULT 0,
  precio_menor DECIMAL(10,2) DEFAULT 0,

  -- Extras (hasta 3)
  extra1_desc VARCHAR(255),
  extra1_valor DECIMAL(10,2) DEFAULT 0,
  extra1_tipo VARCHAR(20) DEFAULT 'total', -- 'total' o 'por_persona'

  extra2_desc VARCHAR(255),
  extra2_valor DECIMAL(10,2) DEFAULT 0,
  extra2_tipo VARCHAR(20) DEFAULT 'total',

  extra3_desc VARCHAR(255),
  extra3_valor DECIMAL(10,2) DEFAULT 0,
  extra3_tipo VARCHAR(20) DEFAULT 'total',

  -- Totales y estado
  total_evento DECIMAL(12,2) DEFAULT 0,
  confirmado BOOLEAN DEFAULT FALSE,

  -- Menu detallado (JSON)
  menu_detalle JSONB
);

-- Indices para eventos
CREATE INDEX idx_eventos_fecha ON eventos(fecha);
CREATE INDEX idx_eventos_cliente ON eventos(cliente);
CREATE INDEX idx_eventos_confirmado ON eventos(confirmado);
CREATE INDEX idx_eventos_vendedor ON eventos(vendedor);

-- =============================================
-- TABLA: pagos
-- Registra pagos, senas y ajustes IPC
-- =============================================
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  concepto VARCHAR(50) NOT NULL -- 'pago', 'seña', 'ajuste_ipc'
);

-- Indices para pagos
CREATE INDEX idx_pagos_evento ON pagos(evento_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha);
CREATE INDEX idx_pagos_concepto ON pagos(concepto);

-- =============================================
-- TABLA: menus
-- Menus personalizados con categorias y platos
-- =============================================
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  nombre VARCHAR(255) NOT NULL,

  -- Categorias: Array de objetos {nombre: string, items: string[]}
  categorias JSONB,

  -- Extras: Array de strings
  extras JSONB
);

-- =============================================
-- TABLA: usuarios
-- Usuarios del sistema con roles
-- =============================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  user_id UUID REFERENCES auth.users(id), -- Referencia a Supabase Auth
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255),
  rol VARCHAR(20) DEFAULT 'lectura' -- 'admin', 'escritura', 'lectura'
);

-- Indice para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =============================================
-- POLITICAS RLS (Row Level Security)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Politica: usuarios autenticados pueden ver todo
CREATE POLICY "Usuarios autenticados pueden ver eventos"
  ON eventos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver pagos"
  ON pagos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver menus"
  ON menus FOR SELECT
  USING (auth.role() = 'authenticated');

-- Politica: solo admin/escritura pueden insertar/actualizar/eliminar
-- (Verificar rol en la tabla usuarios)
CREATE POLICY "Admin/Escritura pueden modificar eventos"
  ON eventos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE user_id = auth.uid()
      AND rol IN ('admin', 'escritura')
    )
  );

CREATE POLICY "Admin/Escritura pueden modificar pagos"
  ON pagos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE user_id = auth.uid()
      AND rol IN ('admin', 'escritura')
    )
  );

CREATE POLICY "Admin puede modificar menus"
  ON menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE user_id = auth.uid()
      AND rol = 'admin'
    )
  );

CREATE POLICY "Admin puede modificar usuarios"
  ON usuarios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE user_id = auth.uid()
      AND rol = 'admin'
    )
  );
