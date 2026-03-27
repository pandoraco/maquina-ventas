import { useState, useEffect, useRef } from "react";

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres Travel Mentor AI, un coach experto en marketing digital y ventas para empresarios del sector turístico. Tu misión es guiar al emprendedor turístico paso a paso para construir su sistema completo de ventas, como si fuera una conversación natural con un consultor de alto nivel.

PERSONALIDAD: Cálido, directo, experto. Hablas en español. Usas ejemplos concretos del turismo. Eres como un amigo que sabe mucho de negocios digitales.

TU MISIÓN es guiar al empresario a construir su sistema de ventas completo, cubriendo estos bloques en orden conversacional:

1. BIENVENIDA Y CONTEXTO: Saluda, explica brevemente qué van a construir juntos y pide su nombre y el nombre de su negocio.

2. OFERTA Y NICHO: Pregunta qué tipo de viajes/experiencias vende, en qué destinos se especializa, qué lo hace diferente de otras agencias.

3. BUYER PERSONA: Construye su cliente ideal preguntando: quién es (edad, perfil), qué quiere lograr con el viaje, qué le frustra al buscar opciones, qué le da miedo al contratar, cuál es el sueño detrás del viaje.

4. PROPUESTA DE VALOR: Con todo lo anterior, genera y presenta su propuesta de valor única (la frase que resume qué hace, para quién y qué resultado da). Pide su opinión y ajusta si es necesario.

5. DIFERENCIACIÓN: Pregunta qué hace diferente a su negocio, qué experiencias únicas ofrece, por qué un cliente debería elegirlo a él y no a la competencia. Luego ayúdalo a articular su diferenciador clave.

6. LEAD MAGNET (PDF GANCHO): Explica qué es un lead magnet y por qué es esencial. Propón 3 opciones de título para su PDF gancho basadas en su nicho y buyer persona. Cuando elija, genera la estructura completa del PDF: título, subtítulo, introducción, 3-4 secciones con contenido concreto, y CTA final.

7. ESTRUCTURA DEL EMBUDO: Diseña su embudo personalizado con estas etapas:
   - ATRAER: Recomendaciones de contenido para redes (tipos de posts, temas, frecuencia)
   - CAPTURAR: Landing page simple, botón WhatsApp, formulario de contacto
   - NUTRIR: Secuencia de mensajes WhatsApp (bienvenida, calificación, seguimiento)
   - CONVERTIR: Guion de cierre y cotización
   - FIDELIZAR: Post-venta y referidos

8. MENSAJES DE WHATSAPP: Genera los 4 mensajes clave personalizados para su negocio:
   - Mensaje 1: Bienvenida automática + entrega del PDF
   - Mensaje 2: Calificación (3 preguntas específicas para su nicho)
   - Mensaje 3: Propuesta/siguiente paso
   - Mensaje 4: Reactivación para leads fríos

9. PLAN DE CONTENIDO: Sugiere 5 ideas de Reels específicas para su nicho con hook, mensaje y CTA.

10. RESUMEN Y SIGUIENTE PASO: Cuando hayas cubierto todos los bloques, indica que vas a generar el resumen ejecutivo completo. Pregunta si quiere agregar algo más antes de cerrarlo.

REGLAS IMPORTANTES:
- Haz máximo 2 preguntas a la vez para no abrumar
- Cuando tengas suficiente información de un bloque, avanza al siguiente de forma natural
- Usa los datos que el usuario ya te dio en respuestas anteriores, no repitas preguntas
- Sé específico: en vez de respuestas genéricas, usa el nombre de su negocio, sus destinos, su cliente específico
- Cuando generes contenido (PDF, mensajes, etc.) preséntalo de forma clara y estructurada
- Si el usuario da respuestas cortas, profundiza con una pregunta de seguimiento
- Al final de cada bloque importante, haz un pequeño resumen de lo que construyeron juntos
- Usa emojis con moderación para dar personalidad sin exagerar
- NUNCA menciones el programa de $597 ni hagas pitch de ventas dentro del chat — eso aparecerá al final en el resumen

FORMATO DE RESPUESTAS:
- Usa saltos de línea para separar ideas
- Cuando presentes listas o estructuras, usa formato claro
- Máximo 250 palabras por respuesta para mantener fluidez conversacional
- Si vas a presentar algo largo (como el PDF o los mensajes), avisa antes: "Aquí está tu [X]:"`;

// ─── CLAUDE API ────────────────────────────────────────────────────────────────
async function sendMessage(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Lo siento, hubo un error. Intenta de nuevo.";
}

async function generateSummary(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: "Eres un asistente experto en marketing turístico. Tu tarea es generar un resumen ejecutivo estructurado y completo basado en la conversación proporcionada.",
      messages: [
        ...messages,
        {
          role: "user",
          content: `Basándote en toda nuestra conversación, genera un RESUMEN EJECUTIVO COMPLETO del sistema de ventas que construimos juntos. 
          
Estructura el resumen así (en texto plano, sin markdown especial, usando --- para separar secciones):

RESUMEN EJECUTIVO - TRAVEL MENTOR AI
[Nombre del negocio]

---
1. PERFIL DEL NEGOCIO
Nombre: 
Nicho/Especialidad:
Destinos principales:

---
2. BUYER PERSONA
Perfil del cliente ideal:
Qué busca:
Sus miedos:
Su sueño:

---
3. PROPUESTA DE VALOR
[La frase de propuesta de valor]

---
4. DIFERENCIADOR CLAVE
[Qué lo hace único]

---
5. LEAD MAGNET (PDF GANCHO)
Título:
Estructura:
- Sección 1:
- Sección 2:
- Sección 3:
CTA Final:

---
6. ESTRUCTURA DEL EMBUDO
ATRAER:
CAPTURAR:
NUTRIR:
CONVERTIR:
FIDELIZAR:

---
7. MENSAJES DE WHATSAPP
Mensaje 1 - Bienvenida:
[texto completo]

Mensaje 2 - Calificación:
[texto completo]

Mensaje 3 - Propuesta:
[texto completo]

Mensaje 4 - Reactivación:
[texto completo]

---
8. IDEAS DE CONTENIDO (REELS)
1. [Hook + Mensaje + CTA]
2. [Hook + Mensaje + CTA]
3. [Hook + Mensaje + CTA]
4. [Hook + Mensaje + CTA]
5. [Hook + Mensaje + CTA]

---
9. PRÓXIMOS PASOS RECOMENDADOS
1.
2.
3.

---
Generado por Travel Mentor AI · pandoraco.co`
        }
      ],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const FONT_URL = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";

const CSS = [
  "@import url('" + FONT_URL + "');",
  "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }",
  "html, body { height: 100%; }",
  "body { background: #0A0C10; color: #E8E4D8; font-family: 'DM Sans', sans-serif; overflow: hidden; }",
  "#root { height: 100vh; display: flex; flex-direction: column; }",
  "button { cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; outline: none; }",
  "input, textarea { font-family: 'DM Sans', sans-serif; outline: none; }",
  "::-webkit-scrollbar { width: 4px; }",
  "::-webkit-scrollbar-track { background: transparent; }",
  "::-webkit-scrollbar-thumb { background: rgba(212,168,71,0.25); border-radius: 99px; }",
  "@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }",
  "@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }",
  "@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }",
  "@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }",
  "@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }",
  ".msg-appear { animation: fadeUp 0.35s cubic-bezier(0.4,0,0.2,1) both; }",
  ".gold-text { background: linear-gradient(135deg,#D4A847,#F0C96A,#D4A847); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }",
  ".shimmer-btn { background: linear-gradient(90deg,#D4A847 0%,#F0C96A 50%,#D4A847 100%); background-size:200% 100%; animation:shimmer 2.5s infinite; }",
  "pre { white-space: pre-wrap; word-break: break-word; font-family: 'DM Sans', sans-serif; }",
].join(" ");

// ─── TYPING INDICATOR ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4, padding:"14px 18px", background:"#141720", borderRadius:"18px 18px 18px 4px", width:"fit-content", border:"1px solid rgba(255,255,255,0.06)" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#D4A847", animation:"pulse 1.2s infinite", animationDelay: i * 0.2 + "s" }} />
      ))}
    </div>
  );
}

// ─── MESSAGE BUBBLE ────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isAI = msg.role === "assistant";
  return (
    <div className="msg-appear" style={{
      display: "flex",
      justifyContent: isAI ? "flex-start" : "flex-end",
      marginBottom: 12,
      gap: 10,
      alignItems: "flex-end",
    }}>
      {isAI && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #D4A847, #F0C96A)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, color: "#0A0C10",
          fontFamily: "'Cormorant Garamond', serif",
        }}>T</div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isAI ? "#141720" : "linear-gradient(135deg, #D4A847, #C9963F)",
        color: isAI ? "#E8E4D8" : "#0A0C10",
        padding: "12px 16px",
        borderRadius: isAI ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
        fontSize: 14,
        lineHeight: 1.7,
        border: isAI ? "1px solid rgba(255,255,255,0.06)" : "none",
        fontWeight: isAI ? 400 : 500,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.content}
      </div>
      {!isAI && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "#1C2030", border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>👤</div>
      )}
    </div>
  );
}

// ─── SUMMARY MODAL ──────────────────────────────────────────────────────────────
function SummaryModal({ summary, onClose, onDownload }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#141720", border: "1px solid rgba(212,168,71,0.3)",
        borderRadius: 20, width: "100%", maxWidth: 680, maxHeight: "85vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#D4A847", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              ✦ Resumen Ejecutivo
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>
              Tu Sistema de Ventas
            </h2>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
            color: "#9CA3AF", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <pre style={{ fontSize: 13, lineHeight: 1.8, color: "#E8E4D8", fontFamily: "'DM Sans', sans-serif" }}>
            {summary}
          </pre>
        </div>

        {/* Actions */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: 12, flexShrink: 0,
        }}>
          <button onClick={onDownload} className="shimmer-btn" style={{
            flex: 1, padding: "13px", borderRadius: 12,
            color: "#0A0C10", fontSize: 14, fontWeight: 700,
          }}>
            ⬇️ Descargar como TXT
          </button>
          <button onClick={onClose} style={{
            padding: "13px 20px", borderRadius: 12,
            background: "rgba(255,255,255,0.06)", color: "#9CA3AF", fontSize: 14,
          }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [summary, setSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(function() {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  async function startChat() {
    setStarted(true);
    setLoading(true);
    const firstMessage = await sendMessage([
      { role: "user", content: "Hola, quiero construir mi sistema de ventas para mi negocio de turismo." }
    ]);
    setMessages([
      { role: "user", content: "Hola, quiero construir mi sistema de ventas para mi negocio de turismo." },
      { role: "assistant", content: firstMessage }
    ]);
    setLoading(false);
    setTimeout(function() { if (inputRef.current) inputRef.current.focus(); }, 100);
  }

  async function sendUserMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const apiMessages = newMessages.map(function(m) {
      return { role: m.role, content: m.content };
    });
    const reply = await sendMessage(apiMessages);
    setMessages(function(prev) { return [...prev, { role: "assistant", content: reply }]; });
    setLoading(false);
    setTimeout(function() { if (inputRef.current) inputRef.current.focus(); }, 100);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendUserMessage();
    }
  }

  async function handleGenerateSummary() {
    setGeneratingSummary(true);
    const sum = await generateSummary(messages.map(function(m) {
      return { role: m.role, content: m.content };
    }));
    setSummary(sum);
    setGeneratingSummary(false);
  }

  function handleDownload() {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "travel-mentor-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const msgCount = messages.filter(function(m) { return m.role === "user"; }).length;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0A0C10" }}>
      <style>{CSS}</style>

      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: "rgba(10,12,16,0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg, #D4A847, #F0C96A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#0A0C10",
            fontFamily: "'Cormorant Garamond', serif",
            boxShadow: "0 0 16px rgba(212,168,71,0.3)",
          }}>T</div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              Travel Mentor <span className="gold-text">AI</span>
            </div>
            <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Mono', monospace" }}>
              {started ? (loading ? "escribiendo..." : "en línea") : "Coach de ventas turístico"}
            </div>
          </div>
        </div>

        {started && msgCount >= 6 && (
          <button
            onClick={handleGenerateSummary}
            disabled={generatingSummary}
            style={{
              padding: "8px 16px", borderRadius: 10,
              background: generatingSummary ? "#1C2030" : "rgba(212,168,71,0.15)",
              border: "1px solid rgba(212,168,71,0.3)",
              color: generatingSummary ? "#6B7280" : "#D4A847",
              fontSize: 12, fontWeight: 600, fontFamily: "'DM Mono', monospace",
              letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {generatingSummary
              ? <><div style={{ width:12, height:12, borderRadius:"50%", border:"2px solid rgba(212,168,71,0.3)", borderTopColor:"#D4A847", animation:"spin 0.8s linear infinite" }}/>Generando...</>
              : "✦ Ver resumen"}
          </button>
        )}
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* WELCOME SCREEN */}
          {!started && (
            <div style={{ textAlign: "center", padding: "60px 20px 40px", animation: "fadeUp 0.5s both" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, #D4A847, #F0C96A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 900, color: "#0A0C10",
                fontFamily: "'Cormorant Garamond', serif",
                margin: "0 auto 24px",
                boxShadow: "0 0 40px rgba(212,168,71,0.3)",
              }}>T</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>
                Travel Mentor <span className="gold-text">AI</span>
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 40px" }}>
                Tu coach personal de ventas para turismo. Vamos a construir juntos tu sistema completo — desde tu buyer persona hasta tu embudo de ventas.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 40, textAlign: "left" }}>
                {[
                  ["🎯", "Buyer persona detallado"],
                  ["💡", "Propuesta de valor única"],
                  ["📄", "Lead magnet personalizado"],
                  ["🔄", "Embudo de ventas completo"],
                  ["💬", "Mensajes de WhatsApp listos"],
                  ["🎬", "Ideas de contenido para reels"],
                ].map(function(item) {
                  return (
                    <div key={item[1]} style={{
                      background: "#141720", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12, padding: "12px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <span style={{ fontSize: 20 }}>{item[0]}</span>
                      <span style={{ fontSize: 13, color: "#E8E4D8" }}>{item[1]}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={startChat} className="shimmer-btn" style={{
                padding: "16px 48px", borderRadius: 14,
                color: "#0A0C10", fontSize: 16, fontWeight: 700, letterSpacing: 0.3,
              }}>
                Comenzar sesión →
              </button>
              <p style={{ color: "#4B5563", fontSize: 12, marginTop: 16 }}>
                Al final recibirás un resumen ejecutivo completo descargable
              </p>
            </div>
          )}

          {/* MESSAGES */}
          {messages.map(function(msg, i) {
            return <MessageBubble key={i} msg={msg} />;
          })}

          {/* TYPING INDICATOR */}
          {loading && (
            <div className="msg-appear" style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-end" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #D4A847, #F0C96A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#0A0C10",
                fontFamily: "'Cormorant Garamond', serif",
              }}>T</div>
              <TypingDots />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* INPUT AREA */}
      {started && (
        <div style={{
          flexShrink: 0,
          background: "rgba(10,12,16,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 16px",
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "#141720", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, padding: "10px 10px 10px 16px",
              transition: "border-color 0.2s",
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={function(e) { setInput(e.target.value); }}
                onKeyDown={handleKey}
                placeholder="Escribe tu respuesta..."
                disabled={loading}
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  color: "#fff", fontSize: 14, lineHeight: 1.6,
                  resize: "none", maxHeight: 120, overflowY: "auto",
                  paddingTop: 2,
                }}
                onInput={function(e) {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={sendUserMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: input.trim() && !loading ? "#D4A847" : "#1C2030",
                  color: input.trim() && !loading ? "#0A0C10" : "#4B5563",
                  fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                →
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: "#374151", marginTop: 8, fontFamily: "'DM Mono', monospace" }}>
              Enter para enviar · Shift+Enter para nueva línea
            </p>
          </div>
        </div>
      )}

      {/* SUMMARY MODAL */}
      {summary && (
        <SummaryModal
          summary={summary}
          onClose={function() { setSummary(null); }}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
