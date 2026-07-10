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

## Pasos para publicar en Render

### 1. Subir el proyecto a GitHub

Creá un repo nuevo (solo la carpeta `eternity-catalog`) y subilo:

```bash
cd eternity-catalog
git add .
git commit -m "Catálogo Eternity Recuerdos listo para deploy"
git remote add origin https://github.com/TU-USUARIO/eternity-recuerdos.git
git push -u origin main
```

### 2. Crear cuenta en Render

Entrá a [render.com](https://render.com) y registrate (podés usar tu cuenta de GitHub).

### 3. Crear Web Service

1. **New +** → **Web Service**
2. Conectá el repositorio de GitHub
3. Configuración:

| Campo | Valor |
|-------|--------|
| **Name** | `eternity-recuerdos` |
| **Region** | La más cercana (ej. Oregon) |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 4. Disco persistente (obligatorio)

Sin esto se borran productos e imágenes subidas en cada deploy.

1. En el servicio → **Disks** → **Add disk**
2. **Mount path:** `/opt/render/project/src/data`
3. **Size:** 1 GB

### 5. Variables de entorno

En **Environment** agregá:

```
DATA_DIR=/opt/render/project/src/data
DATABASE_URL=file:/opt/render/project/src/data/dev.db
ADMIN_PASSWORD=TuContraseñaSegura123!
ADMIN_SECRET=una-clave-larga-aleatoria-minimo-32-caracteres
ADMIN_TOTP_SECRET=el-mismo-secreto-que-en-tu-env-local
NEXT_PUBLIC_BASE_URL=https://eternity-recuerdos.onrender.com
```

Reemplazá la URL por la que te asigne Render (aparece arriba cuando creás el servicio).

Opcional (Mercado Pago):

```
MP_ACCESS_TOKEN=APP_USR-tu-token
MP_SANDBOX=false
```

### 6. Deploy

Clic en **Create Web Service**. El primer deploy tarda unos minutos.

La primera vez carga automáticamente los **18 productos** con fotos si la base está vacía.

### 7. Probar

- Catálogo: `https://tu-app.onrender.com`
- Admin: `https://tu-app.onrender.com/admin` → tu `ADMIN_PASSWORD`

---

## Notas importantes

### Plan gratuito
- La app **se duerme** tras ~15 min sin visitas
- La primera visita puede tardar **30–60 segundos** en despertar
- Para un catálogo chico suele alcanzar

### Imágenes
- Las fotos del catálogo inicial van en el repo (`public/images/products/`)
- Las que subís desde el admin se guardan en el **disco persistente**

### Cambiar contraseña admin
1. Render → Environment → editá `ADMIN_PASSWORD`
2. Save → redeploy automático

### Dominio propio (opcional)
En Render → **Settings** → **Custom Domain** podés conectar tu dominio.

---

## Alternativa: Blueprint automático

Si el repo incluye `render.yaml`, podés usar **New → Blueprint** y Render crea el servicio con la config base. Igual tenés que setear manualmente:

- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_BASE_URL`
