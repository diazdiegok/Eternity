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
| `DATABASE_URL` | Postgres, ej. Internal URL de Render Postgres Free |
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

## Hosting recomendado: Render (Free)

Web Service Free + **Postgres Free** (mismo Render). Las ventas y fotos del admin viven en Postgres, no en disco.

### Pasos

1. Subí el proyecto a GitHub
2. Render → **New → PostgreSQL** → plan Free
3. Render → **New → Web Service** (o el existente)
   - **Build:** `npm install && npm run build`
   - **Start:** `npm start`
   - **Plan:** Free
4. Environment:
   - `DATABASE_URL` = Internal Database URL del Postgres
   - `ADMIN_PASSWORD`, `ADMIN_SECRET`, `NEXT_PUBLIC_BASE_URL`
5. Deploy

Detalle completo en [`DEPLOY.md`](DEPLOY.md).

> El Postgres Free de Render vence a ~30 días. El Web Free se duerme sin visitas, pero ya no borra la DB.

### Alternativas

| Plataforma | ¿Funciona? | Notas |
|------------|------------|-------|
| **Render Free + Postgres Free** | ✅ Recomendado | Sin pagar; DB vence ~30 días |
| **Railway** | ✅ | Créditos mensuales limitados |
| **Vercel + Neon** | ✅ | Postgres externo |
| **GitHub Pages** | ❌ | Solo estático |

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
