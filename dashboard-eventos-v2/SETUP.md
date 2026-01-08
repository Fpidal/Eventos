# Guia de Instalacion y Configuracion

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta en Supabase (gratis)
- Git

---

## 1. Clonar Repositorio

```bash
git clone https://github.com/Fpidal/Eventos.git
cd Eventos/dashboard-eventos-v2
```

---

## 2. Instalar Dependencias

```bash
npm install
```

**Dependencias principales:**
- react
- react-dom
- recharts (graficos)
- jspdf (generacion PDF)
- @supabase/supabase-js
- lucide-react (iconos)

---

## 3. Configurar Supabase

### 3.1 Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Esperar que se inicialice (~2 minutos)

### 3.2 Crear Tablas

1. Ir a **SQL Editor** en Supabase
2. Copiar contenido de `SCHEMA.sql`
3. Ejecutar el script

### 3.3 Obtener Credenciales

1. Ir a **Settings > API**
2. Copiar:
   - Project URL
   - anon/public key

### 3.4 Configurar en el Proyecto

Editar `src/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TU_PROJECT_URL'
const supabaseKey = 'TU_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## 4. Crear Usuario Admin

### Opcion A: Desde Supabase Dashboard

1. Ir a **Authentication > Users**
2. Click "Add user"
3. Ingresar email y password
4. Ir a **Table Editor > usuarios**
5. Insertar registro:
```sql
INSERT INTO usuarios (user_id, email, nombre, rol)
VALUES ('UUID_DEL_USER', 'admin@email.com', 'Administrador', 'admin');
```

### Opcion B: Desde SQL Editor

```sql
-- Primero crear usuario en auth (desde dashboard)
-- Luego insertar en tabla usuarios
INSERT INTO usuarios (user_id, email, nombre, rol)
SELECT id, email, 'Administrador', 'admin'
FROM auth.users
WHERE email = 'admin@email.com';
```

---

## 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

---

## 6. Build para Produccion

```bash
npm run build
```

Los archivos se generan en `/dist`

---

## 7. Deploy en Vercel

### 7.1 Conectar Repositorio

1. Ir a [vercel.com](https://vercel.com)
2. "Add New Project"
3. Importar desde GitHub
4. Seleccionar repositorio "Eventos"

### 7.2 Configurar Build

| Setting | Valor |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | dashboard-eventos-v2 |
| Build Command | npm run build |
| Output Directory | dist |

### 7.3 Variables de Entorno (Opcional)

Si usas variables de entorno en lugar de hardcodear:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

Y modificar `supabase.js`:
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

---

## 8. Estructura de Archivos

```
dashboard-eventos-v2/
├── public/
│   └── logo.png          # Logo para PDF
├── src/
│   ├── App.jsx           # Componente principal
│   ├── supabase.js       # Configuracion Supabase
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 9. Configuracion Tailwind

`tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## 10. Comandos Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build para produccion |
| `npm run preview` | Preview del build |

---

## Troubleshooting

### Error: "No user found"
- Verificar que el usuario existe en `auth.users`
- Verificar que existe registro en tabla `usuarios`

### Error: "Permission denied"
- Verificar politicas RLS en Supabase
- Verificar que el usuario tiene rol correcto

### Error: "Failed to fetch"
- Verificar URL y Key de Supabase
- Verificar que las tablas existen

### PDF no muestra logo
- Verificar que existe `public/logo.png`
- El logo debe ser PNG o JPEG
