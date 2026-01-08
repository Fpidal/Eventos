# Guia de Migracion desde Vercel a Servidor Propio

---

## CREDENCIALES Y CLAVES DEL SISTEMA

### Supabase (Base de Datos Actual)

| Variable | Valor |
|----------|-------|
| **URL** | `https://ykirofgvxwqnicrhrlxe.supabase.co` |
| **Anon Key** | `sb_publishable_u_FywpyJGVeiTwRL0-1d-A_ajcDugGy` |
| **Dashboard** | https://supabase.com/dashboard/project/ykirofgvxwqnicrhrlxe |

### GitHub

| Variable | Valor |
|----------|-------|
| **Repositorio** | https://github.com/Fpidal/Eventos |
| **Usuario** | Fpidal |
| **Rama principal** | main |

### Vercel (Hosting Actual)

| Variable | Valor |
|----------|-------|
| **Dashboard** | https://vercel.com/dashboard |
| **Proyecto** | dashboard-eventos-v2 |

### Archivos de Configuracion

| Archivo | Ubicacion |
|---------|-----------|
| Supabase config | `src/supabase.js` |
| Vite config | `vite.config.js` |
| Tailwind config | `tailwind.config.js` |

### Variables de Entorno para Nuevo Servidor

```env
# Supabase
VITE_SUPABASE_URL=https://ykirofgvxwqnicrhrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_u_FywpyJGVeiTwRL0-1d-A_ajcDugGy

# Si migras a MySQL (backend propio)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dashboard_eventos
DB_USER=eventos_user
DB_PASSWORD=TU_PASSWORD_SEGURO

# JWT (para autenticacion propia)
JWT_SECRET=clave_secreta_cambiar_en_produccion_minimo_32_caracteres

# Servidor
PORT=3001
NODE_ENV=production
```

### Datos de la Aplicacion

| Dato | Valor |
|------|-------|
| **Nombre** | Dashboard de Eventos |
| **Framework** | React 18 + Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Root Directory** | `dashboard-eventos-v2` |

---

## Opciones de Hosting

| Opcion | Tipo | Costo Aprox | Dificultad |
|--------|------|-------------|------------|
| VPS (DigitalOcean, Linode) | Servidor completo | $5-20/mes | Media |
| Railway | PaaS | $5-20/mes | Facil |
| Render | PaaS | Gratis-$25/mes | Facil |
| Hostinger VPS | Servidor completo | $5-15/mes | Media |
| AWS Lightsail | Servidor completo | $5-20/mes | Media |
| Servidor propio | On-premise | Variable | Alta |

---

## Opcion 1: VPS (DigitalOcean, Linode, Hostinger)

### 1.1 Requisitos del Servidor

- Ubuntu 22.04 LTS
- 1 GB RAM minimo (2 GB recomendado)
- 25 GB SSD
- Node.js 18+
- Nginx (reverse proxy)
- Certificado SSL (Let's Encrypt)

### 1.2 Configuracion Inicial del Servidor

```bash
# Conectar por SSH
ssh root@TU_IP_SERVIDOR

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verificar
node --version  # v18.x.x
npm --version   # 9.x.x

# Instalar Nginx
apt install -y nginx

# Instalar Certbot (SSL)
apt install -y certbot python3-certbot-nginx

# Instalar PM2 (gestor de procesos)
npm install -g pm2

# Crear usuario para la app (no usar root)
adduser eventos
usermod -aG sudo eventos
```

### 1.3 Clonar y Configurar Proyecto

```bash
# Cambiar a usuario eventos
su - eventos

# Clonar repositorio
git clone https://github.com/Fpidal/Eventos.git
cd Eventos/dashboard-eventos-v2

# Instalar dependencias
npm install

# Build de produccion
npm run build

# Los archivos quedan en /dist
```

### 1.4 Configurar Nginx

```bash
# Crear configuracion
sudo nano /etc/nginx/sites-available/eventos
```

Contenido:
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    # SSL (se configura con certbot)
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Directorio del build
    root /home/eventos/Eventos/dashboard-eventos-v2/dist;
    index index.html;

    # SPA - redirigir todo a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/eventos /etc/nginx/sites-enabled/

# Verificar configuracion
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 1.5 Configurar SSL con Let's Encrypt

```bash
# Obtener certificado
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Renovacion automatica (ya configurado por defecto)
sudo certbot renew --dry-run
```

### 1.6 Configurar Firewall

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

### 1.7 Script de Actualizacion

Crear `/home/eventos/update.sh`:
```bash
#!/bin/bash
cd /home/eventos/Eventos/dashboard-eventos-v2
git pull origin main
npm install
npm run build
echo "Deploy completado: $(date)"
```

```bash
chmod +x update.sh
```

---

## Opcion 2: Railway (Mas Facil)

### 2.1 Crear Cuenta

1. Ir a [railway.app](https://railway.app)
2. Registrarse con GitHub

### 2.2 Deploy

1. Click "New Project"
2. Seleccionar "Deploy from GitHub repo"
3. Elegir repositorio Fpidal/Eventos
4. Configurar:
   - Root Directory: `dashboard-eventos-v2`
   - Build Command: `npm run build`
   - Start Command: `npx serve dist`

### 2.3 Dominio Personalizado

1. En Railway, ir a Settings
2. Agregar dominio personalizado
3. Configurar DNS en tu registrador

---

## Opcion 3: Render

### 3.1 Crear Cuenta

1. Ir a [render.com](https://render.com)
2. Registrarse con GitHub

### 3.2 Crear Static Site

1. New > Static Site
2. Conectar repositorio
3. Configurar:
   - Name: dashboard-eventos
   - Root Directory: dashboard-eventos-v2
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### 3.3 Dominio

Render provee dominio gratis: `tu-app.onrender.com`
O agregar dominio personalizado en Settings.

---

## Opcion 4: Servidor con Backend (Full Stack)

Si migraste a MySQL y tenes backend propio:

### 4.1 Estructura

```
/home/eventos/
├── frontend/          # React app
│   └── dist/
└── backend/           # Node.js API
    └── src/
```

### 4.2 PM2 para Backend

```bash
cd /home/eventos/backend
pm2 start src/app.js --name "eventos-api"
pm2 save
pm2 startup
```

### 4.3 Nginx para Full Stack

```nginx
server {
    listen 443 ssl http2;
    server_name tudominio.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Frontend
    location / {
        root /home/eventos/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Configuracion DNS

### Apuntar Dominio al Servidor

En tu registrador de dominio (GoDaddy, Namecheap, etc.):

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | @ | TU_IP_SERVIDOR | 3600 |
| A | www | TU_IP_SERVIDOR | 3600 |

O si usas Railway/Render, agregar CNAME segun sus instrucciones.

---

## Checklist de Migracion

### Antes de Migrar
- [ ] Hacer backup de Supabase (exportar datos)
- [ ] Documentar configuracion actual
- [ ] Probar build en local

### Durante Migracion
- [ ] Configurar servidor/servicio
- [ ] Subir codigo
- [ ] Configurar variables de entorno
- [ ] Build de produccion
- [ ] Configurar dominio y SSL
- [ ] Probar todas las funcionalidades

### Despues de Migrar
- [ ] Verificar que todo funciona
- [ ] Configurar backups automaticos
- [ ] Monitorear errores
- [ ] Eliminar proyecto de Vercel (opcional)

---

## Variables de Entorno en Produccion

Si usas variables de entorno:

```bash
# En el servidor, crear archivo .env
nano /home/eventos/Eventos/dashboard-eventos-v2/.env
```

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

O configurar en el panel del servicio (Railway, Render).

---

## Comandos Utiles

```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Reiniciar servicios
sudo systemctl restart nginx
pm2 restart all

# Ver estado
sudo systemctl status nginx
pm2 status

# Actualizar desde GitHub
cd /home/eventos/Eventos/dashboard-eventos-v2
git pull origin main
npm run build
```

---

## Costos Estimados

| Servicio | Costo Mensual |
|----------|---------------|
| VPS basico (1GB) | $5-6 USD |
| Dominio .com | $12 USD/año |
| SSL Let's Encrypt | Gratis |
| Railway (uso basico) | $5-10 USD |
| Render (gratis) | $0 |
| Supabase (gratis) | $0 |

**Total minimo: ~$5-10 USD/mes**

---

## Soporte

Si tenes problemas durante la migracion:
1. Verificar logs de Nginx y PM2
2. Verificar que el build se completo sin errores
3. Verificar configuracion DNS (puede tardar hasta 48hs)
4. Verificar puertos del firewall
