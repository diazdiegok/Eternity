# Despliegue en Render — Eternity Recuerdos

## ¿Cómo funciona el login admin?

| Quién | ¿Necesita login? | Cómo |
|-------|------------------|------|
| **Clientes** (catálogo) | No | Entran directo a la web, ven productos y carrito |
| **Vos (admin)** | Sí | Contraseña + código de **Microsoft Authenticator** (2FA) |

No hay usuarios ni emails. Solo:

1. Variables `ADMIN_PASSWORD` y `ADMIN_TOTP_SECRET` en Render
2. Ingresás en `/admin` → contraseña → código de 6 dígitos del autenticador
3. Quedás logueado **12 horas** con una cookie segura
4. Desde ahí cargás productos, fotos y precios

**Configurar el autenticador (una sola vez, en tu PC):**

```bash
npm run totp:setup
```

Escaneá el QR (`totp-qr.png`) con Microsoft Authenticator. Copiá el valor de `ADMIN_TOTP_SECRET` del `.env` a Render.

---

## Persistencia recomendada: Neon (gratis, no vence a los 30 días)

El Web Service sigue en **Render Free**. La base de datos vive en **[Neon](https://neon.tech)** (Postgres gratis).

### 1. Crear proyecto en Neon

1. Entrá a [console.neon.tech](https://console.neon.tech) y registrate (GitHub está bien)
2. **Create a project** → nombre `eternity` → región cercana
3. Tocá **Connect** → copiá la connection string  
   (preferí la **directa**, sin `-pooler`, o la pooled; ambas sirven)
4. Asegurate de que termine con `?sslmode=require`

### 2. Web Service en Render (Free)

| Campo | Valor |
|-------|--------|
| **Build** | `npm install && npm run build` |
| **Start** | `npm start` |
| **Plan** | Free |

Environment:

```
DATABASE_URL=<connection string de Neon>
ADMIN_PASSWORD=...
ADMIN_SECRET=...
ADMIN_TOTP_SECRET=...
NEXT_PUBLIC_BASE_URL=https://tu-app.onrender.com
```

### 3. Migrar datos desde Render Postgres → Neon (una vez)

Si ya tenías datos en el Postgres Free de Render:

1. En Render → `eternity-db` → **Connections** → copiá **External Database URL**
2. En tu PC, en la carpeta del proyecto:

```powershell
$env:SOURCE_DATABASE_URL="pegá-acá-la-External-URL-de-Render"
$env:TARGET_DATABASE_URL="pegá-acá-la-URL-de-Neon"
node scripts/migrate-db.mjs
```

3. En Render → Web Service → Environment → `DATABASE_URL` = URL de Neon → Save/deploy
4. Cuando confirmes que el catálogo y ventas están bien, podés **borrar** el Postgres de Render

### 4. Probar

- Catálogo + admin
- Productos, fotos y ventas deben verse igual

---

## Notas

- Render Free se duerme sin visitas; **Neon no borra** tus datos por eso
- Fotos del admin viven en la tabla `Media` (Postgres)
- Admin → Productos → **Editar categoría** para renombrar
- No corras `npm run db:seed` en producción (pisa el catálogo)

### Alternativa: Postgres Free de Render

Vence ~30 días. Solo para pruebas cortas. Preferí Neon.
