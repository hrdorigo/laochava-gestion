const nodemailer = require("nodemailer");

const EMAIL = /^[^@\s,;]+@[^@\s,;]+\.[^@\s,;]+$/;
const MAX_PDF = 4 * 1024 * 1024; // 4 MB (Netlify limita el pedido a ~6 MB)
const json = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Método no permitido" });
  }

  const {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SMTP_USER,
    SMTP_PASS,
    SMTP_HOST = "smtp.gmail.com",
    SMTP_PORT = "465",
    REMITENTE = "La Ochava",
    EMAILS_PERMITIDOS = "",
  } = process.env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SMTP_USER || !SMTP_PASS) {
    return json(500, { ok: false, error: "Faltan variables de entorno en Netlify (ver README)" });
  }

  // 1) Sesión: se valida el token del usuario contra Supabase Auth
  const m = String(event.headers.authorization || event.headers.Authorization || "").match(/^Bearer (.+)$/);
  if (!m) return json(401, { ok: false, error: "Falta iniciar sesión" });
  let usuario;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${m[1]}`, apikey: SUPABASE_ANON_KEY },
    });
    if (!r.ok) throw new Error("token");
    usuario = await r.json();
  } catch (e) {
    return json(401, { ok: false, error: "Sesión inválida o vencida. Volvé a ingresar." });
  }
  const permitidos = EMAILS_PERMITIDOS.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (permitidos.length && !permitidos.includes(String(usuario.email || "").toLowerCase())) {
    return json(403, { ok: false, error: "Tu usuario no tiene permiso para enviar mails" });
  }

  let body;
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body;
    body = JSON.parse(raw || "{}");
  } catch (e) {
    return json(400, { ok: false, error: "Pedido inválido" });
  }
  const { to, subject, text, filename, pdfBase64, prueba } = body;

  // Prueba de conexión: valida la sesión sin enviar nada
  if (prueba) return json(200, { ok: true, prueba: true });

  // 2) Validaciones
  if (!EMAIL.test(String(to || ""))) return json(400, { ok: false, error: "Mail de destino inválido" });
  if (!pdfBase64 || typeof pdfBase64 !== "string") return json(400, { ok: false, error: "Falta el PDF" });
  const pdf = Buffer.from(pdfBase64, "base64");
  if (pdf.length === 0 || pdf.length > MAX_PDF) {
    return json(400, { ok: false, error: "PDF vacío o demasiado grande" });
  }
  const nombre = String(filename || "documento.pdf").replace(/[^\w.\-]+/g, "_").slice(0, 80) || "documento.pdf";

  // 3) Envío
  try {
    const puerto = Number(SMTP_PORT);
    const transporte = nodemailer.createTransport({
      host: SMTP_HOST,
      port: puerto,
      secure: puerto === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    const info = await transporte.sendMail({
      from: `"${REMITENTE}" <${SMTP_USER}>`,
      to: String(to),
      subject: String(subject || "Documento").slice(0, 200),
      text: String(text || "").slice(0, 5000),
      attachments: [{ filename: nombre, content: pdf, contentType: "application/pdf" }],
    });
    if (!(info.accepted || []).length) {
      return json(502, { ok: false, error: "El servidor de correo rechazó el destinatario" });
    }
    return json(200, { ok: true, aceptados: info.accepted, id: info.messageId });
  } catch (e) {
    console.error("Error de envío:", e.message);
    return json(502, {
      ok: false,
      error: "No se pudo enviar: " + (e.responseCode ? e.responseCode + " " : "") + e.message,
    });
  }
};
