# Eternity Recuerdos — Catálogo

Catálogo online para **Eternity Recuerdos** con panel de administración, carrito, checkout por WhatsApp e integración opcional con Mercado Pago.

## Funcionalidades

- Catálogo público **sin registro** para clientes
- Panel admin en `/admin` para cargar productos, precios e imágenes
- Carrito de compras (se guarda en el navegador)
- **Finalizar por WhatsApp** con mensaje armado automáticamente
- **Mercado Pago** (opcional, si configurás el token)
- Links a Instagram y WhatsApp integrados

## Inicio rápido (local)

```bash
npm install
copy .env.example .env
npm run db:migrate
npm run db:seed        # productos de ejemplo (opcional)
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

- **Catálogo:** `/`
- **Admin:** `/admin` — contraseña por defecto: `admin123` (cambiala en `.env`)

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | SQLite, ej: `file:./dev.db` |
| `ADMIN_PASSWORD` | Contraseña del panel admin |
| `ADMIN_SECRET` | Clave para firmar la sesión admin |
| `NEXT_PUBLIC_BASE_URL` | URL pública del sitio (obligatoria en producción) |
| `MP_ACCESS_TOKEN` | Token de Mercado Pago (opcional) |
| `MP_SANDBOX` | `true` para usar pagos de prueba |

### Mercado Pago

1. Creá una cuenta de desarrollador en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Creá una aplicación y obtené el **Access Token**
3. Agregalo en `.env` como `MP_ACCESS_TOKEN`
4. Para pruebas, usá `MP_SANDBOX=true`

Si no configurás Mercado Pago, el carrito igual funciona y el cliente puede finalizar por WhatsApp.

## ¿GitHub Pages sirve?

**No para este proyecto.** GitHub Pages solo sirve sitios estáticos (HTML/CSS/JS). Este catálogo necesita:

- Base de datos (productos)
- Subida de imágenes
- Panel admin con contraseña
- API de Mercado Pago

Todo eso requiere un **servidor backend**, no solo archivos estáticos.

## Hosting gratuito recomendado: Render

[Render](https://render.com) tiene plan gratuito para apps web con backend. Es la opción más simple para este proyecto.

### Pasos para publicar en Render

1. Subí el proyecto a un repositorio en GitHub (solo la carpeta `eternity-catalog`)
2. En Render → **New → Web Service**
3. Conectá el repo
4. Configuración:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Agregá un **disco persistente** (importante para que no se borren la base de datos ni las imágenes):
   - Mount path: `/opt/render/project/src/data`
   - Size: 1 GB (gratis)
6. Variables de entorno en Render:

```
DATABASE_URL=file:/opt/render/project/src/data/dev.db
ADMIN_PASSWORD=tu-contraseña-segura
ADMIN_SECRET=clave-larga-aleatoria
NEXT_PUBLIC_BASE_URL=https://tu-app.onrender.com
MP_ACCESS_TOKEN=...   (opcional)
```

7. Deploy

> **Nota:** En el plan gratuito de Render la app se duerme tras inactividad (~50 s al despertar). Para un catálogo chico suele ser aceptable.

### Alternativas gratuitas

| Plataforma | ¿Funciona? | Notas |
|------------|------------|-------|
| **Render** | ✅ Recomendado | Backend + disco persistente |
| **Railway** | ✅ | Créditos mensuales limitados |
| **Vercel** | ⚠️ Parcial | SQLite no persiste bien; mejor Postgres (Neon gratis) |
| **Fly.io** | ✅ | Requiere más configuración |
| **GitHub Pages** | ❌ | Solo estático, sin admin ni DB |

## Contacto del negocio (configurado)

- WhatsApp: `5493435001061`
- Instagram: [eternity.recuerdos](https://www.instagram.com/eternity.recuerdos)

Para cambiar estos datos, editá `src/lib/config.ts`.

## Estructura

```
src/
  app/           # Páginas y API routes
  components/    # UI del catálogo y admin
  context/       # Carrito (localStorage)
  lib/           # DB, auth, WhatsApp, Mercado Pago
public/uploads/  # Imágenes subidas
prisma/          # Esquema y migraciones SQLite
```

## Comandos útiles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run db:migrate   # Aplicar migraciones
npm run db:seed      # Cargar productos de ejemplo
```
