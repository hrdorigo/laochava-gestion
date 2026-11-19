# Sistema de gestión - La Ochava

Sistema de gestión (artículos, clientes, ventas, compras, caja, informes técnicos, recibos y servicios técnicos).
Se publica con **GitHub Pages**. El login y la base de datos están en **Supabase**.

## Archivos
- `index.html`  → la aplicación (es el único archivo que cambia en las actualizaciones)
- `config.js`   → datos públicos de tu proyecto de Supabase (no se toca)
- `manifest.webmanifest` y carpeta `icons` → ícono de La Ochava para el acceso directo

## Publicar por primera vez
1. En github.com: **New repository** → nombre `gestion` → **Public** → Create repository.
2. En el repositorio nuevo: **uploading an existing file**. Arrastrá `index.html`, `config.js`,
   `manifest.webmanifest`, `README.md` y la carpeta `icons` (descomprimí el zip antes). **Commit changes**.
3. **Settings › Pages** → *Build and deployment* → Source: **Deploy from a branch** →
   Branch: **main** y carpeta **/(root)** → **Save**.
4. Esperá 1 o 2 minutos. La dirección queda: `https://TU-USUARIO.github.io/gestion/`
5. En Supabase › **Authentication › URL Configuration**:
   - **Site URL**: la dirección del paso 4 (con la barra final).
   - **Redirect URLs**: agregá `https://TU-USUARIO.github.io/gestion/**`

## Actualizar la app (cada vez que haya cambios)
1. En el repositorio, tocá el archivo `index.html` → ícono del lápiz → borrá todo y pegá el contenido
   nuevo, o usá **Add file › Upload files** y subí el `index.html` nuevo (reemplaza al anterior).
2. **Commit changes**. En 1 o 2 minutos está publicado.
Solo se reemplaza `index.html`; `config.js`, `manifest.webmanifest` e `icons` no cambian.

## Notas
- Los datos del negocio no están en GitHub: están en Supabase y solo los ve quien ingresa con usuario.
- El repositorio es público, así que el código de la app se puede ver. La clave de `config.js` es la
  "publishable" de Supabase, pensada para ser pública.
- El envío automático de mails no está activado; la app ofrece el modo manual (PDF + tu correo).
