# Modelo de Datos

## Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────┐
│                           EVENTOS                                │
│─────────────────────────────────────────────────────────────────│
│ id (PK)                                                          │
│ fecha, cliente, telefono                                         │
│ turno, hora_inicio, hora_fin                                     │
│ vendedor, tipo_evento, menu, salon                               │
│ tecnica, dj, tecnica_superior, otros                             │
│ adultos, precio_adulto, menores, precio_menor                    │
│ extra1_desc, extra1_valor, extra1_tipo                           │
│ extra2_desc, extra2_valor, extra2_tipo                           │
│ extra3_desc, extra3_valor, extra3_tipo                           │
│ total_evento, confirmado                                         │
│ menu_detalle (JSON) ──────────────────────┐                      │
└─────────────────────────────────────────────────────────────────┘
         │                                   │
         │ 1:N                               │ Referencia
         ▼                                   ▼
┌─────────────────────┐            ┌─────────────────────┐
│       PAGOS         │            │       MENUS         │
│─────────────────────│            │─────────────────────│
│ id (PK)             │            │ id (PK)             │
│ evento_id (FK)      │            │ nombre              │
│ fecha               │            │ categorias (JSON)   │
│ monto               │            │ extras (JSON)       │
│ concepto            │            └─────────────────────┘
└─────────────────────┘

┌─────────────────────┐
│      USUARIOS       │
│─────────────────────│
│ id (PK)             │
│ user_id (FK Auth)   │
│ email               │
│ nombre              │
│ rol                 │
└─────────────────────┘
```

---

## Detalle de Entidades

### EVENTOS

| Campo | Tipo | Nullable | Default | Descripcion |
|-------|------|----------|---------|-------------|
| id | UUID | No | auto | Identificador unico |
| created_at | Timestamp | No | now() | Fecha de creacion |
| fecha | Date | No | - | Fecha del evento |
| cliente | String(255) | No | - | Nombre del cliente |
| telefono | String(50) | Si | - | Telefono de contacto |
| turno | String(20) | Si | - | 'Noche' o 'Mediodia' |
| hora_inicio | Time | Si | - | Hora de inicio |
| hora_fin | Time | Si | - | Hora de fin |
| vendedor | String(100) | Si | - | Nombre del vendedor |
| tipo_evento | String(100) | Si | - | Tipo de evento |
| menu | String(100) | Si | - | Menu base |
| salon | String(50) | Si | - | Salon asignado |
| tecnica | Boolean | No | false | Incluye tecnica |
| dj | Boolean | No | false | Incluye DJ |
| tecnica_superior | Boolean | No | false | Tecnica superior |
| otros | Text | Si | - | Notas adicionales |
| adultos | Integer | No | 0 | Cantidad de adultos |
| precio_adulto | Decimal(10,2) | No | 0 | Precio por adulto |
| menores | Integer | No | 0 | Cantidad de menores |
| precio_menor | Decimal(10,2) | No | 0 | Precio por menor |
| extra1_desc | String(255) | Si | - | Descripcion extra 1 |
| extra1_valor | Decimal(10,2) | No | 0 | Valor extra 1 |
| extra1_tipo | String(20) | No | 'total' | 'total' o 'por_persona' |
| extra2_desc | String(255) | Si | - | Descripcion extra 2 |
| extra2_valor | Decimal(10,2) | No | 0 | Valor extra 2 |
| extra2_tipo | String(20) | No | 'total' | 'total' o 'por_persona' |
| extra3_desc | String(255) | Si | - | Descripcion extra 3 |
| extra3_valor | Decimal(10,2) | No | 0 | Valor extra 3 |
| extra3_tipo | String(20) | No | 'total' | 'total' o 'por_persona' |
| total_evento | Decimal(12,2) | No | 0 | Total calculado |
| confirmado | Boolean | No | false | Estado confirmacion |
| menu_detalle | JSONB | Si | - | Menu detallado |

**Calculo de total_evento:**
```
total = (adultos * precio_adulto) + (menores * precio_menor)
      + extra1 + extra2 + extra3

donde extraN =
  si tipo = 'por_persona': valor * adultos
  si tipo = 'total': valor
```

---

### PAGOS

| Campo | Tipo | Nullable | Default | Descripcion |
|-------|------|----------|---------|-------------|
| id | UUID | No | auto | Identificador unico |
| created_at | Timestamp | No | now() | Fecha de creacion |
| evento_id | UUID | No | - | FK a eventos |
| fecha | Date | No | - | Fecha del pago |
| monto | Decimal(12,2) | No | - | Monto del pago |
| concepto | String(50) | No | - | Tipo de pago |

**Valores de concepto:**
- `seña` - Pago inicial para confirmar
- `pago` - Pago regular
- `ajuste_ipc` - Ajuste por inflacion

---

### MENUS

| Campo | Tipo | Nullable | Default | Descripcion |
|-------|------|----------|---------|-------------|
| id | UUID | No | auto | Identificador unico |
| created_at | Timestamp | No | now() | Fecha de creacion |
| nombre | String(255) | No | - | Nombre del menu |
| categorias | JSONB | Si | - | Array de categorias |
| extras | JSONB | Si | - | Array de extras |

**Estructura de categorias:**
```json
[
  {
    "nombre": "Entradas",
    "items": ["Plato 1", "Plato 2", "Plato 3"]
  },
  {
    "nombre": "Principales",
    "items": ["Plato A", "Plato B"]
  }
]
```

**Estructura de extras:**
```json
["Extra 1", "Extra 2", "Extra 3"]
```

---

### USUARIOS

| Campo | Tipo | Nullable | Default | Descripcion |
|-------|------|----------|---------|-------------|
| id | UUID | No | auto | Identificador unico |
| created_at | Timestamp | No | now() | Fecha de creacion |
| user_id | UUID | Si | - | FK a auth.users |
| email | String(255) | No | - | Email unico |
| nombre | String(255) | Si | - | Nombre completo |
| rol | String(20) | No | 'lectura' | Rol del usuario |

**Valores de rol:**
- `admin` - Acceso total
- `escritura` - Crear/editar
- `lectura` - Solo ver

---

## Indices

| Tabla | Indice | Campos |
|-------|--------|--------|
| eventos | idx_eventos_fecha | fecha |
| eventos | idx_eventos_cliente | cliente |
| eventos | idx_eventos_confirmado | confirmado |
| eventos | idx_eventos_vendedor | vendedor |
| pagos | idx_pagos_evento | evento_id |
| pagos | idx_pagos_fecha | fecha |
| usuarios | idx_usuarios_email | email |

---

## Relaciones

| Origen | Destino | Tipo | ON DELETE |
|--------|---------|------|-----------|
| pagos.evento_id | eventos.id | N:1 | CASCADE |
| usuarios.user_id | auth.users.id | 1:1 | - |
| eventos.menu_detalle | menus | Referencia JSON | - |
