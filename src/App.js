import { useState, useEffect, useRef } from "react";

// ─── PALETTE & TOKENS ────────────────────────────────────────────────────────
const C = {
  cream: "#FDFAF3",
  yellow: "#F9E84E",
  yellowDark: "#E8D63A",
  coral: "#FF6B5B",
  coralLight: "#FFE8E5",
  mint: "#B8EFD8",
  sky: "#C8E8F8",
  skyDark: "#A0D4F0",
  ink: "#1A1A2E",
  inkLight: "#3D3D5C",
  muted: "#8888AA",
  white: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E8E4D8",
  success: "#2ECC71",
};

// ─── STEPS CONFIG ────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    emoji: "🎯",
    title: "Define tu Oferta",
    subtitle: "Imposible de Ignorar",
    color: C.yellow,
    textColor: C.ink,
    description: "Crea una oferta turística clara, vendible y fácil de explicar.",
    fields: [
      { key: "nicho", label: "¿Qué tipo de viaje vendes?", placeholder: "Ej: Tours privados en Cancún, Lunas de miel en Europa...", type: "text" },
      { key: "cliente_tipo", label: "¿Para quién es?", placeholder: "Ej: Parejas de 30-50 años, familias con niños...", type: "text" },
      { key: "promesa", label: "¿Cuál es tu promesa principal?", placeholder: "Ej: Organiza tu viaje sin estrés ni sorpresas", type: "text" },
    ],
    aiPrompt: (data) => `Eres un experto en marketing turístico. Basándote en esta información:
- Nicho/tipo de viaje: ${data.nicho || "viajes turísticos"}
- Cliente objetivo: ${data.cliente_tipo || "viajeros"}
- Promesa inicial: ${data.promesa || "viajes sin estrés"}

Genera exactamente esto en español, en formato JSON con estas claves:
{
  "promesa_final": "Una frase poderosa de máximo 12 palabras con la fórmula: Resultado + facilidad + sin dolor",
  "incluye": ["item 1", "item 2", "item 3", "item 4"],
  "no_incluye": ["item 1", "item 2", "item 3"],
  "paquete_basico": "Descripción breve del paquete básico",
  "paquete_estandar": "Descripción breve del paquete estándar (el más vendido)",
  "paquete_premium": "Descripción breve del paquete premium"
}
Responde SOLO con el JSON, sin texto adicional ni markdown.`,
    outputKeys: ["promesa_final", "incluye", "no_incluye", "paquete_basico", "paquete_estandar", "paquete_premium"],
  },
  {
    id: 2,
    emoji: "👤",
    title: "Cliente Ideal",
    subtitle: "En 15 Minutos",
    color: C.coral,
    textColor: C.white,
    description: "Define con precisión a quién le hablas para que todo conecte.",
    fields: [
      { key: "cliente_perfil", label: "¿Quién es tu cliente ideal?", placeholder: "Ej: Parejas de 35-50 años con hijos adultos...", type: "text" },
      { key: "frustration", label: "¿Qué le frustra hoy?", placeholder: "Ej: Comparar demasiadas opciones, no saber en quién confiar...", type: "text" },
      { key: "miedo", label: "¿Qué le da miedo?", placeholder: "Ej: Perder dinero, que algo salga mal...", type: "text" },
    ],
    aiPrompt: (data) => `Eres experto en psicología del consumidor para el sector turístico. Con esta info:
- Perfil del cliente: ${data.cliente_perfil || "viajeros adultos"}
- Frustraciones: ${data.frustration || "demasiadas opciones"}
- Miedos: ${data.miedo || "perder dinero"}

Genera en español, formato JSON:
{
  "ficha_cliente": "Descripción de 2 líneas del cliente ideal en primera persona como si él hablara",
  "pregunta_mental": "La pregunta interna que se hace antes de comprar (máx 15 palabras, entre comillas)",
  "pain_points": ["dolor 1 concreto", "dolor 2 concreto", "dolor 3 concreto"],
  "mensaje_conexion": "Frase de 1 línea para usar en redes que haga que diga 'esto es para mí'",
  "gancho_pdf": "Por qué este cliente descargaría tu PDF (1 frase)"
}
Responde SOLO con el JSON.`,
    outputKeys: ["ficha_cliente", "pregunta_mental", "pain_points", "mensaje_conexion", "gancho_pdf"],
  },
  {
    id: 3,
    emoji: "📄",
    title: "Tu PDF Gancho",
    subtitle: "Lead Magnet Estratégico",
    color: C.sky,
    textColor: C.ink,
    description: "Crea el PDF que atrae leads calificados y abre conversaciones.",
    fields: [
      { key: "destino_pdf", label: "¿Para qué destino es el PDF?", placeholder: "Ej: Cancún, Europa, Colombia...", type: "text" },
      { key: "tipo_pdf", label: "¿Qué tipo de PDF prefieres?", placeholder: "Checklist, Mini Guía o Itinerario Base", type: "select", options: ["Checklist de viaje", "Mini Guía del destino", "Itinerario Base"] },
      { key: "beneficio_pdf", label: "¿Qué problema resuelve?", placeholder: "Ej: Evitar errores costosos al viajar a Cancún", type: "text" },
    ],
    aiPrompt: (data) => `Eres especialista en lead magnets para agencias de turismo. Con:
- Destino: ${data.destino_pdf || "un destino turístico"}
- Tipo de PDF: ${data.tipo_pdf || "Checklist de viaje"}
- Beneficio: ${data.beneficio_pdf || "evitar errores"}

Genera en español, formato JSON:
{
  "titulo_pdf": "Título ganador del PDF (fórmula: Qué es + para quién + beneficio claro, máx 12 palabras)",
  "subtitulo": "Subtítulo complementario de 1 línea",
  "introduccion": "Párrafo de introducción del PDF (3 líneas máximo, segunda persona)",
  "secciones": ["Sección 1 con 3 ítems de checklist", "Sección 2 con 3 ítems", "Sección 3 con 3 ítems"],
  "cta_final": "Llamado a la acción final del PDF (1 frase clara y humana)",
  "frase_portada": "Frase inspiradora corta para la portada"
}
Responde SOLO con el JSON.`,
    outputKeys: ["titulo_pdf", "subtitulo", "introduccion", "secciones", "cta_final", "frase_portada"],
  },
  {
    id: 4,
    emoji: "🌐",
    title: "Landing Page",
    subtitle: "Embudo Simple de Ventas",
    color: C.mint,
    textColor: C.ink,
    description: "Estructura tu página que convierte visitas en leads reales.",
    fields: [
      { key: "nombre_agencia", label: "¿Cómo se llama tu agencia/negocio?", placeholder: "Ej: Viajes Perfectos, TravelPro...", type: "text" },
      { key: "destino_landing", label: "¿Cuál es el destino/oferta principal?", placeholder: "Ej: Cancún, Luna de miel en Europa...", type: "text" },
      { key: "cta_landing", label: "¿Qué acción quieres que tomen?", placeholder: "Descargar PDF, Escribir por WhatsApp, Agendar llamada", type: "select", options: ["Descargar PDF gratis", "Escribir por WhatsApp", "Agendar una llamada"] },
    ],
    aiPrompt: (data) => `Eres copywriter especialista en landing pages de turismo. Con:
- Agencia: ${data.nombre_agencia || "la agencia"}
- Oferta principal: ${data.destino_landing || "viajes"}
- CTA deseado: ${data.cta_landing || "WhatsApp"}

Genera en español, formato JSON:
{
  "headline": "Titular principal de la landing (máx 10 palabras, impactante, orientado a resultado)",
  "subheadline": "Subtítulo que complementa el headline (1 línea, claridad total)",
  "pain_section": ["Dolor 1 que siente el visitante", "Dolor 2", "Dolor 3"],
  "beneficios_pdf": ["Beneficio 1 del PDF/servicio", "Beneficio 2", "Beneficio 3", "Beneficio 4"],
  "boton_cta": "Texto del botón principal (accionable, máx 5 palabras)",
  "frase_confianza": "Frase corta de quién está detrás (credibilidad, 1 línea)",
  "pagina_gracias": "Mensaje de la página de gracias después de registrarse (2 líneas, humano y claro)"
}
Responde SOLO con el JSON.`,
    outputKeys: ["headline", "subheadline", "pain_section", "beneficios_pdf", "boton_cta", "frase_confianza", "pagina_gracias"],
  },
  {
    id: 5,
    emoji: "💬",
    title: "WhatsApp + Formulario",
    subtitle: "Sistema de Captura",
    color: "#25D366",
    textColor: C.white,
    description: "Configura el flujo que captura leads y los mueve solos.",
    fields: [
      { key: "numero_wa", label: "¿Cuál es tu número de WhatsApp?", placeholder: "Ej: +57 300 123 4567", type: "text" },
      { key: "destino_mensaje", label: "¿Qué destino mencionar en el mensaje?", placeholder: "Ej: Cancún, Europa, Colombia...", type: "text" },
      { key: "campos_form", label: "¿Qué datos quieres capturar?", placeholder: "Nombre, WhatsApp, destino, fechas...", type: "text" },
    ],
    aiPrompt: (data) => `Eres experto en automatización de ventas para turismo con WhatsApp. Con:
- Número WA: ${data.numero_wa || "tu número"}
- Destino del mensaje: ${data.destino_mensaje || "el destino"}
- Datos a capturar: ${data.campos_form || "nombre y teléfono"}

Genera en español, formato JSON:
{
  "link_wa": "https://wa.me/${(data.numero_wa || "").replace(/[^0-9]/g, "")}?text=Hola%2C%20quiero%20la%20checklist%20para%20viajar%20a%20${encodeURIComponent(data.destino_mensaje || "el destino")}%20y%20recibir%20ayuda%20para%20organizar%20mi%20viaje.",
  "mensaje_prellenado": "Texto del mensaje prellenado para el botón de WhatsApp (natural, 1-2 líneas)",
  "campos_formulario": ["Campo 1", "Campo 2", "Campo 3", "Campo 4"],
  "mensaje_pagina_gracias": "Mensaje exacto de la página de gracias (cálido, genera expectativa del contacto)",
  "instruccion_tecnica": "Instrucción paso a paso para pegar el link wa.me en el botón de la landing"
}
Responde SOLO con el JSON.`,
    outputKeys: ["link_wa", "mensaje_prellenado", "campos_formulario", "mensaje_pagina_gracias", "instruccion_tecnica"],
  },
  {
    id: 6,
    emoji: "🤖",
    title: "4 Automatizaciones",
    subtitle: "Mensajes Clave de WhatsApp",
    color: "#7C3AED",
    textColor: C.white,
    description: "Los 4 mensajes que trabajan por ti 24/7 sin sonar robótico.",
    fields: [
      { key: "nombre_negocio_wa", label: "¿Nombre de tu negocio/asesor?", placeholder: "Ej: TravelPro / María de Viajes Perfectos", type: "text" },
      { key: "destino_auto", label: "¿Destino principal para automatizar?", placeholder: "Ej: Cancún, Europa...", type: "text" },
      { key: "siguiente_paso", label: "¿Cuál es tu siguiente paso al hablar con el cliente?", placeholder: "Llamada de 10 min, enviar cotización, enviar propuesta...", type: "text" },
    ],
    aiPrompt: (data) => `Eres experto en automatización conversacional para agencias de turismo. Con:
- Negocio/asesor: ${data.nombre_negocio_wa || "el asesor"}
- Destino: ${data.destino_auto || "el destino"}
- Siguiente paso: ${data.siguiente_paso || "una llamada"}

Genera 4 mensajes de WhatsApp en español, formato JSON:
{
  "msg1_bienvenida": "Mensaje de bienvenida inmediata al llegar el lead (máx 4 líneas, cálido, entrega el PDF, sin ventas)",
  "msg2_calificacion": "Mensaje de calificación con exactamente 3 preguntas clave para cotizar (numeradas)",
  "msg3_siguiente_paso": "Mensaje para mover al cliente al siguiente paso (${data.siguiente_paso || "llamada/cotización"}) (máx 3 líneas)",
  "msg4_reactivacion": "Mensaje de reactivación para leads fríos sin respuesta (suave, sin presión, máx 3 líneas)",
  "regla_humano": "Cuándo exactamente el asesor debe tomar el control (2 situaciones concretas)"
}
Responde SOLO con el JSON.`,
    outputKeys: ["msg1_bienvenida", "msg2_calificacion", "msg3_siguiente_paso", "msg4_reactivacion", "regla_humano"],
  },
  {
    id: 7,
    emoji: "🎬",
    title: "10 Guiones de Reels",
    subtitle: "Contenido que Convierte",
    color: "#FF6B5B",
    textColor: C.white,
    description: "Guiones listos para grabar con tu celular. Sin ser influencer.",
    fields: [
      { key: "destino_reels", label: "¿Para qué destino son los reels?", placeholder: "Ej: Cancún, Europa, Colombia...", type: "text" },
      { key: "tono_reels", label: "¿Cuál es tu tono de comunicación?", placeholder: "Cercano y amigable, profesional, experto...", type: "select", options: ["Cercano y amigable", "Profesional y confiable", "Experto y directo"] },
      { key: "cta_reels", label: "¿Cuál es tu CTA principal?", placeholder: "Descargar checklist, link en bio, escribir por WA...", type: "select", options: ["Descarga la checklist", "Link en la bio", "Escríbeme por WhatsApp"] },
    ],
    aiPrompt: (data) => `Eres creador de contenido especialista en turismo para redes sociales. Con:
- Destino: ${data.destino_reels || "destino turístico"}
- Tono: ${data.tono_reels || "cercano y amigable"}
- CTA: ${data.cta_reels || "descarga la checklist"}

Genera 5 guiones de Reels (10-15 segundos) en español, formato JSON. Cada guion tiene hook, mensaje y CTA:
{
  "reel1": {"hook": "...", "mensaje": "...", "cta": "..."},
  "reel2": {"hook": "...", "mensaje": "...", "cta": "..."},
  "reel3": {"hook": "...", "mensaje": "...", "cta": "..."},
  "reel4": {"hook": "...", "mensaje": "...", "cta": "..."},
  "reel5": {"hook": "...", "mensaje": "...", "cta": "..."},
  "tip_grabacion": "Tip práctico para grabar desde el celular sin producción",
  "caption_base": "Caption base para publicar cualquiera de los reels (con emojis, máx 3 líneas)"
}
Responde SOLO con el JSON.`,
    outputKeys: ["reel1", "reel2", "reel3", "reel4", "reel5", "tip_grabacion", "caption_base"],
  },
  {
    id: 8,
    emoji: "📊",
    title: "Plan de Tráfico",
    subtitle: "7 Días de Contenido",
    color: "#F9E84E",
    textColor: C.ink,
    description: "Campaña mínima viable para llevar personas a tu sistema.",
    fields: [
      { key: "presupuesto_ads", label: "¿Cuánto puedes invertir en ads?", placeholder: "Ej: $5 diarios, $50 totales, $0 solo orgánico...", type: "text" },
      { key: "plataforma_ads", label: "¿En qué plataforma estás activo?", placeholder: "Instagram, Facebook, TikTok...", type: "select", options: ["Instagram / Facebook", "TikTok", "Solo contenido orgánico"] },
      { key: "objetivo_semana", label: "¿Cuántos leads quieres en 7 días?", placeholder: "Ej: 10 leads, 20 conversaciones...", type: "text" },
    ],
    aiPrompt: (data) => `Eres estratega de tráfico digital para agencias de turismo. Con:
- Presupuesto: ${data.presupuesto_ads || "bajo/orgánico"}
- Plataforma: ${data.plataforma_ads || "Instagram/Facebook"}
- Objetivo: ${data.objetivo_semana || "conseguir leads"}

Genera un plan de 7 días en español, formato JSON:
{
  "dia1": "Acción del Día 1 (concreta, 1 línea)",
  "dia2": "Acción del Día 2",
  "dia3": "Acción del Día 3",
  "dia4": "Acción del Día 4",
  "dia5": "Acción del Día 5",
  "dia6": "Acción del Día 6",
  "dia7": "Acción del Día 7",
  "metricas_clave": ["Métrica 1 a revisar", "Métrica 2", "Métrica 3"],
  "config_anuncio": "Configuración básica del anuncio: objetivo, público, presupuesto, formato (3 líneas)",
  "regla_de_oro": "La regla más importante para que el tráfico convierta (1 frase)"
}
Responde SOLO con el JSON.`,
    outputKeys: ["dia1","dia2","dia3","dia4","dia5","dia6","dia7","metricas_clave","config_anuncio","regla_de_oro"],
  },
  {
    id: 9,
    emoji: "🤝",
    title: "Guion de Cierre",
    subtitle: "Sin Perseguir + Cotización",
    color: "#C8E8F8",
    textColor: C.ink,
    description: "Convierte conversaciones en ventas con un guion humano.",
    fields: [
      { key: "destino_cierre", label: "¿Para qué destino/oferta es el cierre?", placeholder: "Ej: Cancún, Luna de miel Europa...", type: "text" },
      { key: "precio_rango", label: "¿Cuál es el rango de precios?", placeholder: "Ej: $500-$3000 USD por persona...", type: "text" },
      { key: "objecion_comun", label: "¿Cuál es la objeción más común?", placeholder: "Ej: 'Está muy caro', 'Lo voy a pensar', 'Voy a comparar'...", type: "text" },
    ],
    aiPrompt: (data) => `Eres experto en ventas consultivas para turismo de alto valor. Con:
- Destino/oferta: ${data.destino_cierre || "el viaje"}
- Rango de precios: ${data.precio_rango || "precio medio-alto"}
- Objeción común: ${data.objecion_comun || "lo voy a pensar"}

Genera en español, formato JSON:
{
  "fase1_confirmacion": "Script exacto de la fase de confirmación (2-3 líneas, verificar interés)",
  "preguntas_comprension": ["Pregunta 1 para entender qué busca", "Pregunta 2", "Pregunta 3"],
  "presentacion_opciones": "Cómo presentar las 3 opciones sin presionar (3-4 líneas)",
  "cierre_natural": "Pregunta de cierre natural que guía a decidir (no presiona)",
  "manejo_objecion": "Cómo manejar '${data.objecion_comun || "lo voy a pensar"}' sin pelear (3 líneas)",
  "plantilla_cotizacion": "Estructura exacta de la cotización: qué incluir en cada sección",
  "mensaje_seguimiento": "Mensaje de seguimiento 24h después si no decide (suave, 2 líneas)"
}
Responde SOLO con el JSON.`,
    outputKeys: ["fase1_confirmacion","preguntas_comprension","presentacion_opciones","cierre_natural","manejo_objecion","plantilla_cotizacion","mensaje_seguimiento"],
  },
  {
    id: 10,
    emoji: "⭐",
    title: "Entrega + Reseñas",
    subtitle: "Post-venta Inteligente",
    color: "#B8EFD8",
    textColor: C.ink,
    description: "Convierte cada cliente en tu mejor vendedor.",
    fields: [
      { key: "nombre_final", label: "¿Nombre del negocio para los mensajes?", placeholder: "Ej: Viajes Perfectos, TravelPro...", type: "text" },
      { key: "plataforma_resena", label: "¿Dónde quieres las reseñas?", placeholder: "Google, Facebook, TripAdvisor...", type: "select", options: ["Google", "Facebook", "Instagram", "TripAdvisor"] },
      { key: "siguiente_viaje", label: "¿Qué destino podrías ofrecer de nuevo?", placeholder: "Ej: Otro viaje a Europa, escapada local...", type: "text" },
    ],
    aiPrompt: (data) => `Eres experto en fidelización y referidos para agencias de turismo. Con:
- Negocio: ${data.nombre_final || "la agencia"}
- Plataforma de reseñas: ${data.plataforma_resena || "Google"}
- Próximo destino: ${data.siguiente_viaje || "otro viaje"}

Genera en español, formato JSON:
{
  "msg_bienvenida_postventa": "Mensaje de bienvenida tras confirmación de pago (cálido, confirma pasos, 3-4 líneas)",
  "kit_viajero": ["Ítem 1 del kit del viajero", "Ítem 2", "Ítem 3", "Ítem 4"],
  "msg_solicitud_resena": "Mensaje para pedir reseña en ${data.plataforma_resena || "Google"} (natural, no invasivo, 3 líneas)",
  "msg_referidos": "Mensaje para activar referidos sin incomodar (suave, 2-3 líneas)",
  "msg_postventa_7dias": "Mensaje 7 días después del viaje para mantener relación (2 líneas)",
  "oferta_recompra": "Cómo presentar el próximo viaje '${data.siguiente_viaje || ""}' de forma natural"
}
Responde SOLO con el JSON.`,
    outputKeys: ["msg_bienvenida_postventa","kit_viajero","msg_solicitud_resena","msg_referidos","msg_postventa_7dias","oferta_recompra"],
  },
];

// ─── OUTPUT LABEL MAP ─────────────────────────────────────────────────────────
const OUTPUT_LABELS = {
  promesa_final: "✨ Promesa final", incluye: "✅ Incluye", no_incluye: "❌ No incluye",
  paquete_basico: "📦 Paquete básico", paquete_estandar: "⭐ Paquete estándar", paquete_premium: "💎 Paquete premium",
  ficha_cliente: "👤 Ficha del cliente", pregunta_mental: "💭 Pregunta mental", pain_points: "⚡ Pain points",
  mensaje_conexion: "📣 Mensaje conexión", gancho_pdf: "🎣 Gancho del PDF",
  titulo_pdf: "📄 Título del PDF", subtitulo: "💬 Subtítulo", introduccion: "📝 Introducción",
  secciones: "📋 Secciones del PDF", cta_final: "🎯 CTA final", frase_portada: "✍️ Frase portada",
  headline: "🔥 Headline", subheadline: "💡 Subheadline", pain_section: "😤 Dolores del visitante",
  beneficios_pdf: "🎁 Beneficios", boton_cta: "🔘 Texto del botón", frase_confianza: "🛡️ Confianza",
  pagina_gracias: "🙏 Página de gracias",
  link_wa: "🔗 Link de WhatsApp", mensaje_prellenado: "💬 Mensaje prellenado", campos_formulario: "📝 Campos del formulario",
  mensaje_pagina_gracias: "✅ Mensaje de gracias", instruccion_tecnica: "⚙️ Instrucción técnica",
  msg1_bienvenida: "👋 Mensaje 1: Bienvenida", msg2_calificacion: "❓ Mensaje 2: Calificación",
  msg3_siguiente_paso: "➡️ Mensaje 3: Siguiente paso", msg4_reactivacion: "🔄 Mensaje 4: Reactivación",
  regla_humano: "🧑 Cuándo intervenir tú",
  reel1: "🎬 Reel 1", reel2: "🎬 Reel 2", reel3: "🎬 Reel 3", reel4: "🎬 Reel 4", reel5: "🎬 Reel 5",
  tip_grabacion: "📱 Tip de grabación", caption_base: "📝 Caption base",
  dia1: "Día 1", dia2: "Día 2", dia3: "Día 3", dia4: "Día 4", dia5: "Día 5", dia6: "Día 6", dia7: "Día 7",
  metricas_clave: "📊 Métricas clave", config_anuncio: "⚙️ Config del anuncio", regla_de_oro: "🏆 Regla de oro",
  fase1_confirmacion: "✅ Fase 1: Confirmación", preguntas_comprension: "❓ Preguntas de comprensión",
  presentacion_opciones: "🎯 Presentar opciones", cierre_natural: "🤝 Cierre natural",
  manejo_objecion: "🛡️ Manejo de objeción", plantilla_cotizacion: "📄 Plantilla cotización",
  mensaje_seguimiento: "⏰ Mensaje de seguimiento",
  msg_bienvenida_postventa: "👋 Bienvenida post-venta", kit_viajero: "🎒 Kit del viajero",
  msg_solicitud_resena: "⭐ Solicitar reseña", msg_referidos: "🤝 Activar referidos",
  msg_postventa_7dias: "📅 Mensaje 7 días", oferta_recompra: "🔄 Oferta recompra",
};

// ─── API CALL ─────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch { return null; }
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ padding: "0 24px 0", marginBottom: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: C.muted, letterSpacing: 1 }}>
          PASO {current} DE {total}
        </span>
        <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: C.muted }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: C.border, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: `linear-gradient(90deg, ${C.coral}, ${C.yellow})`,
          width: `${pct}%`,
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
    </div>
  );
}

function StepNav({ steps, currentStep, completedSteps, onSelect }) {
  return (
    <div style={{
      display: "flex", gap: 8, padding: "16px 24px",
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      {steps.map((s) => {
        const done = completedSteps.includes(s.id);
        const active = s.id === currentStep;
        return (
          <button key={s.id} onClick={() => onSelect(s.id)} style={{
            flexShrink: 0,
            width: 40, height: 40, borderRadius: 12,
            border: active ? `2px solid ${C.ink}` : done ? `2px solid ${C.success}` : `2px solid ${C.border}`,
            background: active ? C.ink : done ? C.mint : C.white,
            color: active ? C.white : done ? C.ink : C.muted,
            fontSize: 14, cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {done ? "✓" : s.id}
          </button>
        );
      })}
    </div>
  );
}

function OutputValue({ k, v }) {
  const label = OUTPUT_LABELS[k] || k;
  if (Array.isArray(v)) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
        {typeof v[0] === "object" ? (
          <div style={{ background: C.cream, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: C.ink, lineHeight: 1.7 }}>
            {v.map((item, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                {Object.entries(item).map(([ik, iv]) => (
                  <div key={ik}><b style={{ color: C.coral }}>{ik}:</b> {iv}</div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
            {v.map((item, i) => <li key={i} style={{ fontSize: 13, color: C.ink, marginBottom: 4, lineHeight: 1.6 }}>{item}</li>)}
          </ul>
        )}
      </div>
    );
  }
  if (typeof v === "object" && v !== null) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
        <div style={{ background: C.cream, borderRadius: 10, padding: "12px 14px" }}>
          {Object.entries(v).map(([ik, iv]) => (
            <div key={ik} style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: C.muted, textTransform: "uppercase" }}>{ik}: </span>
              <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>{iv}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{
        background: C.cream, borderRadius: 10, padding: "12px 14px",
        fontSize: 14, color: C.ink, lineHeight: 1.7,
        borderLeft: `3px solid ${C.coral}`,
      }}>{v}</div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState({});
  const [allOutputs, setAllOutputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const topRef = useRef(null);

  const step = STEPS.find(s => s.id === currentStep);
  const stepData = allData[currentStep] || {};
  const stepOutput = allOutputs[currentStep];

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });
    setShowOutput(!!allOutputs[currentStep]);
  }, [currentStep]);

  function handleFieldChange(key, value) {
    setAllData(prev => ({
      ...prev,
      [currentStep]: { ...(prev[currentStep] || {}), [key]: value }
    }));
  }

  async function handleGenerate() {
    setLoading(true);
    setShowOutput(false);
    const data = allData[currentStep] || {};
    const prompt = step.aiPrompt(data);
    const result = await callClaude(prompt);
    setAllOutputs(prev => ({ ...prev, [currentStep]: result }));
    setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    setShowOutput(true);
    setLoading(false);
  }

  function handleNext() {
    if (currentStep < STEPS.length) {
      setCurrentStep(s => s + 1);
      setShowOutput(false);
    } else {
      setShowSummary(true);
    }
  }

  function handlePrev() {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  }

  if (showSummary) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { display: none; }
        `}</style>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.ink, margin: 0, lineHeight: 1.2 }}>
              Tu Máquina de Ventas está lista
            </h1>
            <p style={{ color: C.muted, marginTop: 12, fontSize: 15 }}>
              Completaste los 10 pasos del sistema Travel Mentor
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
            {STEPS.map(s => (
              <div key={s.id} onClick={() => { setShowSummary(false); setCurrentStep(s.id); }} style={{
                background: C.white, borderRadius: 16, padding: "16px",
                border: `1px solid ${C.border}`, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                transition: "transform 0.15s",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: s.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                }}>{s.emoji}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: completedSteps.includes(s.id) ? C.success : C.muted }}>
                    {completedSteps.includes(s.id) ? "✓ Completado" : "Pendiente"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowSummary(false)} style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: C.ink, color: C.white, fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            Revisar pasos →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        textarea, input, select { outline: none; }
        textarea:focus, input:focus, select:focus { border-color: ${C.coral} !important; box-shadow: 0 0 0 3px ${C.coralLight}; }
        button:hover { opacity: 0.88; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>

      {/* Header */}
      <div ref={topRef} style={{
        background: C.ink, padding: "20px 24px 0",
        borderRadius: "0 0 24px 24px",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: C.yellow, letterSpacing: 2, marginBottom: 4 }}>
                TRAVEL MENTOR
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.white, fontFamily: "'Playfair Display', serif" }}>
                Máquina de Ventas
              </div>
            </div>
            <button onClick={() => setShowSummary(true)} style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10, padding: "8px 14px", color: C.white, fontSize: 12,
              cursor: "pointer", fontFamily: "'DM Mono', monospace",
            }}>
              {completedSteps.length}/10 ✓
            </button>
          </div>
          <ProgressBar current={currentStep} total={STEPS.length} />
          <StepNav steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} onSelect={setCurrentStep} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 120px" }}>

        {/* Step header card */}
        <div className="fade-up" style={{
          borderRadius: 20, overflow: "hidden", marginTop: 20, marginBottom: 20,
        }}>
          <div style={{
            background: step.color, padding: "24px 24px 20px",
            display: "flex", alignItems: "flex-start", gap: 16,
          }}>
            <div style={{ fontSize: 40 }}>{step.emoji}</div>
            <div>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: step.textColor, opacity: 0.7, letterSpacing: 1 }}>
                PASO {step.id} DE 10
              </div>
              <h2 style={{ margin: "4px 0 4px", fontSize: 24, fontFamily: "'Playfair Display', serif", color: step.textColor, lineHeight: 1.2 }}>
                {step.title}
              </h2>
              <div style={{ fontSize: 14, color: step.textColor, opacity: 0.8, fontWeight: 500 }}>
                {step.subtitle}
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 13, color: step.textColor, opacity: 0.75, lineHeight: 1.6 }}>
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Input fields */}
        <div className="fade-up" style={{ background: C.white, borderRadius: 20, padding: 24, marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: C.muted, letterSpacing: 1, marginBottom: 18, textTransform: "uppercase" }}>
            Tu información
          </div>
          {step.fields.map((field) => (
            <div key={field.key} style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  value={stepData[field.key] || ""}
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12,
                    border: `1.5px solid ${C.border}`, fontSize: 14, color: C.ink,
                    background: C.cream, fontFamily: "'DM Sans', sans-serif",
                    transition: "border-color 0.2s",
                  }}
                >
                  <option value="">Selecciona una opción...</option>
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={stepData[field.key] || ""}
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12,
                    border: `1.5px solid ${C.border}`, fontSize: 14, color: C.ink,
                    background: C.cream, fontFamily: "'DM Sans', sans-serif",
                    transition: "border-color 0.2s",
                  }}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: loading ? C.border : C.coral,
              color: loading ? C.muted : C.white,
              fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: "pulse 1s infinite" }}>⏳</span>
                Generando con IA...
              </>
            ) : (
              <>✨ Generar con IA</>
            )}
          </button>
        </div>

        {/* Output */}
        {showOutput && stepOutput && (
          <div className="fade-up" style={{ background: C.white, borderRadius: 20, padding: 24, marginBottom: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: C.muted, letterSpacing: 1, marginBottom: 18, textTransform: "uppercase" }}>
              ✨ Resultado generado
            </div>
            {step.outputKeys.map(k =>
              stepOutput[k] !== undefined ? <OutputValue key={k} k={k} v={stepOutput[k]} /> : null
            )}
            <div style={{
              marginTop: 20, padding: "12px 16px", borderRadius: 12,
              background: C.coralLight, fontSize: 13, color: C.coral,
              fontWeight: 600, textAlign: "center",
            }}>
              💡 Puedes editar los campos y regenerar cuantas veces necesites
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handlePrev} disabled={currentStep === 1} style={{
            flex: 1, padding: "14px", borderRadius: 14,
            border: `1.5px solid ${C.border}`, background: C.white,
            color: currentStep === 1 ? C.muted : C.ink,
            fontSize: 14, fontWeight: 600, cursor: currentStep === 1 ? "default" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            ← Anterior
          </button>
          <button onClick={handleNext} style={{
            flex: 2, padding: "14px", borderRadius: 14, border: "none",
            background: currentStep === STEPS.length ? C.success : C.ink,
            color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {currentStep === STEPS.length ? "🎯 Ver resumen final" : `Siguiente: Paso ${currentStep + 1} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
