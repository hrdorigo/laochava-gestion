# Sistema de gestión en Supabase + Netlify

Qué hace cada uno:
- **Supabase**: el login (usuarios y contraseñas) y la base de datos en la nube (tus clientes, artículos,
  ventas, etc., disponibles desde cualquier equipo).
- **Netlify**: aloja el sistema y ejecuta la función que envía los mails con el PDF.

Contenido:
- `public/index.html`   → el sistema
- `public/config.js`    → acá pegás los datos de tu Supabase
- `supabase/schema.sql` → crea la tabla y las reglas de seguridad
- `netlify/functions/enviar-informe.js` → envía mails (solo para usuarios con sesión)
- `netlify.toml`, `package.json` → configuración

No necesitás instalar nada: se hace todo desde el navegador.

---
## PARTE 1 — Supabase (login y datos)

1. Entrá a https://supabase.com, creá una cuenta y tocá **New project**.
   Nombre: laochava (o el que quieras). Elegí una contraseña de base de datos (guardala) y la región
   **South America (São Paulo)**. Esperá a que termine de crearse.
2. Menú izquierdo **SQL Editor › New query**. Abrí `supabase/schema.sql`, copiá todo, pegalo y tocá **Run**.
   Debe decir "Success".
3. **Authentication › Sign In / Providers**: dejá activo **Email** y **desactivá "Allow new users to sign up"**
   (así nadie puede registrarse solo). Guardá.
4. **Authentication › Users › Add user › Create new user**: cargá tu mail y una contraseña, y tildá
   **Auto Confirm User**. Ese es tu acceso. Repetí para cada empleado.
5. **Authentication › URL Configuration**: en **Site URL** poné la dirección que te dé Netlify (la tenés en la
   Parte 2; volvé acá después). Esto hace que funcione "Olvidé mi contraseña".
6. (Ya hecho en este paquete) `public/config.js` ya tiene la URL y la clave publishable de tu proyecto.

> Nunca uses ni pegues la clave "service_role": esa es secreta. Solo la "anon public".

---
## PARTE 2 — Netlify (publicar el sistema)

Netlify necesita que el proyecto esté en GitHub (gratis) para poder ejecutar la función de mail.

**A. Subir a GitHub**
1. Creá una cuenta en https://github.com y tocá **New repository**. Nombre: `gestion`. Marcalo **Private**.
2. En el repositorio nuevo tocá **uploading an existing file**.
3. Arrastrá TODO el contenido de esta carpeta (las carpetas `public`, `netlify`, `supabase` y los archivos
   `netlify.toml`, `package.json`, `README.md`). Tocá **Commit changes**.
   (Importante: ya con tu `config.js` editado.)

**B. Conectar con Netlify**
1. Entrá a https://netlify.com, creá la cuenta con GitHub.
2. **Add new site › Import an existing project › GitHub** y elegí el repositorio `gestion`.
3. No cambies nada de la configuración (ya la trae `netlify.toml`) y tocá **Deploy**.
4. Cuando termine te da una dirección tipo `https://algo.netlify.app`. En **Site configuration › Change site
   name** podés poner un nombre propio (ej. `laochava-gestion`).

**C. Variables para el envío de mails** (Netlify › Site configuration › Environment variables › Add a variable)

| Variable | Valor |
|---|---|
| SUPABASE_URL | el Project URL de Supabase |
| SUPABASE_ANON_KEY | la clave anon public |
| SMTP_USER | tu mail de Gmail (el que envía) |
| SMTP_PASS | contraseña de aplicación de Gmail (16 letras) |
| REMITENTE | La Ochava |
| EMAILS_PERMITIDOS | tu mail y el de tus empleados, separados por coma |

(Opcionales: SMTP_HOST = smtp.gmail.com, SMTP_PORT = 465.)

Gmail: activá la verificación en dos pasos y creá la "contraseña de aplicación" en
https://myaccount.google.com/apppasswords (sin espacios).

Después de cargar las variables: **Deploys › Trigger deploy › Deploy site**.

---
## PARTE 3 — Probar

1. Abrí tu dirección de Netlify. Debe pedirte mail y contraseña (los del paso 4 de Supabase).
2. Arriba a la izquierda, bajo tu mail, aparece "☁ Sincronizado".
3. Administración › Envío de correo › **Probar conexión** → "Conexión correcta".
4. Documentos › Consultar informes › Mail › **Enviar ahora**.

## Pasar tus datos actuales
1. En la versión vieja: Administración › **Exportar copia (.zip)**.
2. En el sistema nuevo (ya con sesión iniciada): Administración › **Importar copia (.zip)**.
   Se guarda en la nube y queda disponible en todos tus equipos.

## Cómo funciona la nube (importante)
- Cada cambio se guarda solo en Supabase, unos segundos después. Si no hay internet queda en el equipo y
  se reintenta.
- Si dos equipos modifican a la vez, el sistema avisa y te deja elegir cuál conservar.
- Al **cerrar sesión** se sube todo y se borra la copia local de ese equipo (por seguridad).
- Seguí haciendo **Exportar copia (.zip)** de vez en cuando como respaldo propio.
- Los datos están en una sola fila que comparten todos tus usuarios.

## Costos
Supabase (plan Free) y Netlify (plan Free) alcanzan para un comercio chico. Supabase Free pausa el
proyecto si pasa una semana sin uso: si pasa, entrá al panel y tocá "Restore project".
