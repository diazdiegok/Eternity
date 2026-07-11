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

**Importante:** elegí una contraseña fuerte en Render. No uses `admin123` en producción.

---

## Persistencia gratis (sin pagar Starter)

El Web Service Free **no guarda archivos en disco**. Ventas y fotos viven en **Postgres Free** del mismo Render.

### 1. Subir el proyecto a GitHub

```bash
cd eternity-catalog
git add .
git commit -m "Catálogo Eternity Recuerdos"
git push
```

### 2. Crear Postgres Free en Render

1. **New +** → **PostgreSQL**
2. Name: `eternity-db`
3. Plan: **Free**
4. Create

> El Postgres Free **vence a los 30 días**. Antes de eso exportá o creá otra DB.

### 3. Crear / configurar Web Service

1. **New +** → **Web Service** (o usá el existente)
2. Conectá el repo
3. Configuración:

| Campo | Valor |
|-------|--------|
| **Name** | `eternity-recuerdos` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 4. Variables de entorno

```
DATABASE_URL=<Internal Database URL del Postgres>
ADMIN_PASSWORD=TuContraseñaSegura123!
ADMIN_SECRET=una-clave-larga-aleatoria-minimo-32-caracteres
ADMIN_TOTP_SECRET=el-mismo-secreto-que-en-tu-env-local
NEXT_PUBLIC_BASE_URL=https://tu-app.onrender.com
```

Cómo obtener `DATABASE_URL`: Postgres → **Info** → **Internal Database URL** → copiar → pegar en el Web Service → Environment.

Opcional (Mercado Pago):

```
MP_ACCESS_TOKEN=APP_USR-tu-token
MP_SANDBOX=false
```

**No hace falta** `DATA_DIR` ni disco persistente.

### 5. Deploy

Clic en **Deploy**. Al arrancar:

- Corre migraciones
- Si la base está vacía, carga los productos iniciales
- Restaura la venta manual `ET-5464` si no existe

### 6. Probar

- Catálogo: `https://tu-app.onrender.com`
- Admin: `https://tu-app.onrender.com/admin`

---

## Notas importantes

### Plan Free
- La app se duerme tras ~15 min sin visitas
- La DB Postgres Free **sí** sobrevive deploy/sleep
- Postgres Free expira a ~30 días (renová o migrá)

### Imágenes
- Fotos del catálogo seed: en el repo (`public/images/products/`)
- Fotos subidas desde el admin: en Postgres (tabla `Media`)

### Categorías
- En admin → Productos → **Editar categoría** renombrás y se actualiza en todos los productos

### Cambiar contraseña admin
1. Render → Environment → editá `ADMIN_PASSWORD`
2. Save → redeploy

### Dominio propio (opcional)
En Render → **Settings** → **Custom Domain**.
