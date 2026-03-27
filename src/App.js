import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg: "#0D0F14",
  bgCard: "#141720",
  bgCard2: "#1C2030",
  gold: "#D4A847",
  goldLight: "#F0C96A",
  goldDim: "rgba(212,168,71,0.15)",
  goldBorder: "rgba(212,168,71,0.3)",
  white: "#FFFFFF",
  offWhite: "#E8E4D8",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  green: "#22C55E",
  greenDim: "rgba(34,197,94,0.12)",
  red: "#EF4444",
  redDim: "rgba(239,68,68,0.12)",
  border: "rgba(255,255,255,0.06)",
};

// ─── CLAUDE API ───────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// ─── CHECKLIST ITEMS ─────────────────────────────────────────────────────────
const CHECKLIST = [
  { id: "wa", label: "Tengo WhatsApp Business activo", icon: "💬" },
  { id: "ig", label: "Publico contenido en Instagram regularmente", icon: "📸" },
  { id: "pdf", label: "Tengo un PDF o checklist para atraer leads", icon: "📄" },
  { id: "landing", label: "Tengo una página o landing para capturar contactos", icon: "🌐" },
  { id: "respuesta", label: "Respondo consultas en menos de 1 hora", icon: "⚡" },
  { id: "auto", label: "Tengo alguna automatización de mensajes", icon: "🤖" },
];

// ─── FUNNEL STAGES ────────────────────────────────────────────────────────────
const STAGES = [
  { label: "Atraer", icon: "🎯", keys: ["ig", "pdf"] },
  { label: "Capturar", icon: "🪝", keys: ["landing", "wa"] },
  { label: "Convertir", icon: "💰", keys: ["respuesta", "auto"] },
];

// ─── FONTS ────────────────────────────────────────────────────────────────────
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const CSS = `
@import url('${FONT_URL}');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.goldBorder}; border-radius: 99px; }
body { background: ${T.bg}; color: ${T.offWhite}; font-family: 'DM Sans', sans-serif; }
button { cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; outline: none; }
input, textarea, select { font-family: 'DM Sans', sans-serif; outline: none; }
@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes scalePop { 0%{transform:scale(0.95);opacity:0} 100%{transform:scale(1);opacity:1} }
.fade-up { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both; }
.fade-in { animation: fadeIn 0.4s ease both; }
.scale-pop { animation: scalePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
.gold-text { 
  background: linear-gradient(135deg, ${T.gold}, ${T.goldLight}, ${T.gold});
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.shimmer-btn {
  background: linear-gradient(90deg, ${T.gold} 0%, ${T.goldLight} 50%, ${T.gold} 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
`;

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
      <div style={{ flex: 1, height: 1, background: T.goldBorder }} />
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold }} />
      <div style={{ flex: 1, height: 1, background: T.goldBorder }} />
    </div>
  );
}

function Tag({ children, color = T.gold }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 99,
      background: `${color}18`, border: `1px solid ${color}40`,
      fontSize: 11, fontFamily: "'DM Mono', monospace", color,
      letterSpacing: 1, textTransform: "uppercase",
    }}>{children}</span>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px 0" }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `2px solid ${T.goldBorder}`,
        borderTopColor: T.gold,
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: T.muted, fontSize: 13, animation: "pulse 1.5s infinite" }}>
        Analizando tu negocio con IA...
      </p>
    </div>
  );
}

function Input({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, color: T.mutedLight, marginBottom: 8, fontWeight: 500 }}>
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
          style={{
            width: "100%", background: T.bgCard2, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "12px 16px", color: T.white, fontSize: 14,
            resize: "none", lineHeight: 1.6, transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = T.goldBorder)}
          onBlur={(e) => (e.target.style.borderColor = T.border)}
        />
      ) : (
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", background: T.bgCard2, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "12px 16px", color: T.white, fontSize: 14,
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = T.goldBorder)}
          onBlur={(e) => (e.target.style.borderColor = T.border)}
        />
      )}
    </div>
  );
}

// ─── SCREEN 1: WELCOME ────────────────────────────────────────────────────────
function Welcome({ onStart }) {
  return (
    <div className="fade-up" style={{ textAlign: "center", padding: "20px 0 40px" }}>
      <div style={{ marginBottom: 32 }}>
        <Tag>Travel Mentor · Diagnóstico</Tag>
      </div>

      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700,
        color: T.white, lineHeight: 1.15, marginBottom: 20,
      }}>
        Descubre qué le falta a<br />
        <span className="gold-text">tu embudo de ventas</span>
      </h1>

      <p style={{ color: T.mutedLight, fontSize: 16, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 40px" }}>
        En 4 bloques rápidos la IA analiza tu negocio turístico y te entrega un plan concreto para vender más sin perseguir clientes.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 40, textAlign: "left" }}>
        {[
          ["🎯", "Tu oferta en palabras claras"],
          ["👤", "Tu cliente ideal definido"],
          ["📊", "Diagnóstico de tu embudo"],
          ["🗺️", "Tu plan de acción personalizado"],
        ].map(([icon, text]) => (
          <div key={text} style={{
            background: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 13, color: T.offWhite, lineHeight: 1.4 }}>{text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="shimmer-btn"
        style={{
          width: "100%", padding: "18px", borderRadius: 14,
          color: T.bg, fontSize: 16, fontWeight: 700, letterSpacing: 0.3,
        }}
      >
        Comenzar mi diagnóstico →
      </button>

      <p style={{ color: T.muted, fontSize: 12, marginTop: 16 }}>
        ✦ Toma 20 minutos · Resultado inmediato con IA
      </p>
    </div>
  );
}

// ─── SCREEN 2: BLOQUE 1 — Tu Oferta ──────────────────────────────────────────
function BloqueOferta({ data, onChange, onNext, loading }) {
  const valid = data.negocio && data.destino && data.cliente && data.promesa;
  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <Tag>Bloque 1 de 4</Tag>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: T.white, margin: "12px 0 8px" }}>
          Tu <span className="gold-text">Oferta</span>
        </h2>
        <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>
          Vamos a construir la base. Cuéntame sobre tu negocio con tus propias palabras.
        </p>
      </div>
      <GoldDivider />
      <Input label="¿Cómo se llama tu negocio o agencia?" placeholder="Ej: Viajes Perfectos, TravelPro, Escapadas Mías..." value={data.negocio} onChange={(v) => onChange("negocio", v)} />
      <Input label="¿En qué destinos o experiencias te especializas?" placeholder="Ej: Cancún, Europa, tours de aventura en Colombia..." value={data.destino} onChange={(v) => onChange("destino", v)} />
      <Input label="¿A quién le vendes? ¿Quién es tu cliente ideal?" placeholder="Ej: Parejas de 35-50 años, familias con niños, viajeros solos..." value={data.cliente} onChange={(v) => onChange("cliente", v)} />
      <Input label="¿Qué prometes que logran contigo que no logran solos?" placeholder="Ej: Un viaje organizado sin estrés y sin sorpresas de último minuto..." value={data.promesa} onChange={(v) => onChange("promesa", v)} type="textarea" />
      <button
        onClick={onNext} disabled={!valid || loading}
        style={{
          width: "100%", padding: "16px", borderRadius: 14,
          background: valid && !loading ? T.gold : T.bgCard2,
          color: valid && !loading ? T.bg : T.muted,
          fontSize: 15, fontWeight: 700, transition: "all 0.2s",
        }}
      >
        {loading ? "Generando con IA..." : "Generar mi oferta →"}
      </button>
    </div>
  );
}

// ─── SCREEN 3: BLOQUE 2 — Tu Cliente ─────────────────────────────────────────
function BloqueCliente({ data, onChange, onNext, loading }) {
  const valid = data.frustracion && data.miedo && data.sueno;
  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <Tag>Bloque 2 de 4</Tag>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: T.white, margin: "12px 0 8px" }}>
          Tu <span className="gold-text">Cliente Ideal</span>
        </h2>
        <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>
          Quien conoce a su cliente profundamente vende sin esfuerzo. Piensa en tu mejor cliente actual.
        </p>
      </div>
      <GoldDivider />
      <Input label="¿Qué es lo que más le frustra cuando busca un viaje?" placeholder="Ej: Comparar demasiadas opciones sin saber cuál elegir, no saber en quién confiar..." value={data.frustracion} onChange={(v) => onChange("frustracion", v)} type="textarea" />
      <Input label="¿Qué es lo que más le da miedo al contratar?" placeholder="Ej: Que algo salga mal, perder su dinero, que no cumpla con lo prometido..." value={data.miedo} onChange={(v) => onChange("miedo", v)} type="textarea" />
      <Input label="¿Cuál es el sueño detrás de ese viaje?" placeholder="Ej: Crear recuerdos en familia, descansar de verdad, vivir una experiencia única..." value={data.sueno} onChange={(v) => onChange("sueno", v)} type="textarea" />
      <button
        onClick={onNext} disabled={!valid || loading}
        style={{
          width: "100%", padding: "16px", borderRadius: 14,
          background: valid && !loading ? T.gold : T.bgCard2,
          color: valid && !loading ? T.bg : T.muted,
          fontSize: 15, fontWeight: 700, transition: "all 0.2s",
        }}
      >
        {loading ? "Analizando..." : "Analizar mi cliente →"}
      </button>
    </div>
  );
}

// ─── SCREEN 4: BLOQUE 3 — Tu Situación ───────────────────────────────────────
function BloqueSituacion({ checks, onToggle, onNext }) {
  const count = checks.filter(Boolean).length;
  const pct = Math.round((count / CHECKLIST.length) * 100);
  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <Tag>Bloque 3 de 4</Tag>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: T.white, margin: "12px 0 8px" }}>
          Tu <span className="gold-text">Situación Actual</span>
        </h2>
        <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>
          Marca honestamente lo que ya tienes funcionando hoy.
        </p>
      </div>
      <GoldDivider />

      {/* Progress meter */}
      <div style={{ background: T.bgCard2, borderRadius: 14, padding: "16px 20px", marginBottom: 24, border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: T.mutedLight }}>Tu embudo está listo al</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: T.gold, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`, borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {CHECKLIST.map((item, i) => (
        <div
          key={item.id}
          onClick={() => onToggle(i)}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            background: checks[i] ? T.goldDim : T.bgCard,
            border: `1px solid ${checks[i] ? T.goldBorder : T.border}`,
            borderRadius: 12, padding: "14px 16px", marginBottom: 10,
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            background: checks[i] ? T.gold : "transparent",
            border: `2px solid ${checks[i] ? T.gold : T.muted}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
            {checks[i] && <span style={{ color: T.bg, fontSize: 13, fontWeight: 900 }}>✓</span>}
          </div>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span style={{ fontSize: 14, color: checks[i] ? T.offWhite : T.mutedLight, lineHeight: 1.4 }}>{item.label}</span>
        </div>
      ))}

      <div style={{ marginTop: 24 }}>
        <button
          onClick={onNext}
          style={{
            width: "100%", padding: "16px", borderRadius: 14,
            background: T.gold, color: T.bg, fontSize: 15, fontWeight: 700,
          }}
        >
          Ver mi diagnóstico →
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN 5: RESULTADO ──────────────────────────────────────────────────────
function Resultado({ resultado, checks, ofertaData }) {
  const count = checks.filter(Boolean).length;
  const pct = Math.round((count / CHECKLIST.length) * 100);

  const nivel = pct < 35 ? { label: "Embudo en construcción", color: T.red, icon: "🔧" }
    : pct < 70 ? { label: "Embudo a medio camino", color: T.gold, icon: "⚡" }
    : { label: "Embudo casi listo", color: T.green, icon: "🚀" };

  return (
    <div className="fade-up">
      {/* Header resultado */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Tag>Tu Diagnóstico Personalizado</Tag>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: T.white, margin: "16px 0 8px", lineHeight: 1.2 }}>
          {ofertaData.negocio || "Tu negocio"}, aquí está<br />
          <span className="gold-text">tu hoja de ruta</span>
        </h2>
      </div>

      {/* Nivel del embudo */}
      <div style={{
        background: T.bgCard, border: `1px solid ${nivel.color}40`,
        borderRadius: 16, padding: "20px 24px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 20,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: `${nivel.color}18`, border: `2px solid ${nivel.color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, color: nivel.color, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: nivel.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            {nivel.icon} {nivel.label}
          </p>
          <p style={{ fontSize: 14, color: T.mutedLight, lineHeight: 1.5 }}>
            Tienes {count} de {CHECKLIST.length} elementos del embudo activos
          </p>
        </div>
      </div>

      {/* Tu Oferta generada */}
      {resultado?.oferta && (
        <div style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: T.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            ✦ Tu oferta lista para usar
          </p>
          <p style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", color: T.white, fontWeight: 600, lineHeight: 1.5, marginBottom: 12 }}>
            "{resultado.oferta}"
          </p>
          {resultado.mensaje_cliente && (
            <div style={{ background: T.bgCard2, borderRadius: 10, padding: "12px 16px", borderLeft: `3px solid ${T.gold}` }}>
              <p style={{ fontSize: 12, color: T.gold, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>MENSAJE QUE CONECTA</p>
              <p style={{ fontSize: 13, color: T.offWhite, lineHeight: 1.6 }}>{resultado.mensaje_cliente}</p>
            </div>
          )}
        </div>
      )}

      {/* Mapa del embudo */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: T.mutedLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
          📊 Tu mapa de embudo
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {STAGES.map((stage) => {
            const stageChecks = stage.keys.map((k) => {
              const idx = CHECKLIST.findIndex((c) => c.id === k);
              return checks[idx];
            });
            const stagePct = Math.round((stageChecks.filter(Boolean).length / stageChecks.length) * 100);
            const done = stagePct === 100;
            return (
              <div key={stage.label} style={{
                background: T.bgCard2, borderRadius: 12, padding: "14px 12px", textAlign: "center",
                border: `1px solid ${done ? T.goldBorder : T.border}`,
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{stage.icon}</div>
                <p style={{ fontSize: 12, color: done ? T.gold : T.muted, fontWeight: 600, marginBottom: 4 }}>{stage.label}</p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: done ? T.gold : T.mutedLight }}>{stagePct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan de acción */}
      {resultado?.pasos && (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: T.mutedLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
            🗺️ Tus próximos pasos
          </p>
          {resultado.pasos.map((paso, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: T.goldDim, border: `1px solid ${T.goldBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Mono', monospace", fontSize: 12, color: T.gold, fontWeight: 700,
              }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 14, color: T.offWhite, fontWeight: 600, marginBottom: 3 }}>{paso.titulo}</p>
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>{paso.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA al programa */}
      <div style={{
        background: `linear-gradient(135deg, ${T.goldDim}, rgba(212,168,71,0.08))`,
        border: `1px solid ${T.goldBorder}`,
        borderRadius: 20, padding: "28px 24px", marginBottom: 8, textAlign: "center",
      }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: T.gold, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
          ✦ Tu siguiente paso natural
        </p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: T.white, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>
          Monta todo este embudo en 30 días con el{" "}
          <span className="gold-text">Programa Travel Mentor</span>
        </h3>
        <p style={{ fontSize: 14, color: T.mutedLight, lineHeight: 1.7, marginBottom: 24 }}>
          {resultado?.pitch || "Ya sabes exactamente qué necesitas. El programa te da las herramientas, la plataforma y el acompañamiento para ejecutarlo — sin empezar desde cero."}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24, textAlign: "left" }}>
          {["Plataforma SalesHub incluida", "Embudos preconfigurados", "Automatizaciones listas", "Acompañamiento en cohorte"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: T.gold, fontSize: 14 }}>✦</span>
              <span style={{ fontSize: 13, color: T.offWhite }}>{item}</span>
            </div>
          ))}
        </div>
        <a
          href="https://travel.pandoraco.co"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", textDecoration: "none" }}
        >
          <button className="shimmer-btn" style={{
            width: "100%", padding: "18px", borderRadius: 14,
            color: T.bg, fontSize: 16, fontWeight: 700, letterSpacing: 0.3,
          }}>
            Quiero el Programa Travel Mentor →
          </button>
        </a>
        <p style={{ color: T.muted, fontSize: 12, marginTop: 12 }}>
          Programa completo con SalesHub · USD $597
        </p>
      </div>
    </div>
  );
}

// ─── PROGRESS INDICATOR ───────────────────────────────────────────────────────
function Progress({ step }) {
  const steps = ["Oferta", "Cliente", "Situación", "Resultado"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 40 }}>
      {steps.map((s, i) => {
        const active = i === step - 1;
        const done = i < step - 1;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: done ? T.gold : active ? T.goldDim : T.bgCard2,
                border: `2px solid ${done || active ? T.gold : T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s",
              }}>
                {done
                  ? <span style={{ color: T.bg, fontSize: 14, fontWeight: 900 }}>✓</span>
                  : <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: active ? T.gold : T.muted }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: 10, color: active ? T.gold : T.muted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 1, background: done ? T.goldBorder : T.border, margin: "0 4px", marginBottom: 20, transition: "all 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("welcome"); // welcome | b1 | loading1 | b2 | loading2 | b3 | loading3 | resultado
  const [ofertaData, setOfertaData] = useState({ negocio: "", destino: "", cliente: "", promesa: "" });
  const [clienteData, setClienteData] = useState({ frustracion: "", miedo: "", sueno: "" });
  const [checks, setChecks] = useState(new Array(CHECKLIST.length).fill(false));
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [screen]);

  function handleOfertaField(key, val) {
    setOfertaData((p) => ({ ...p, [key]: val }));
  }
  function handleClienteField(key, val) {
    setClienteData((p) => ({ ...p, [key]: val }));
  }
  function toggleCheck(i) {
    setChecks((p) => { const n = [...p]; n[i] = !n[i]; return n; });
  }

  async function handleOfertaNext() {
    setLoading(true);
    setScreen("loading1");
    const prompt = `Eres experto en marketing turístico y copywriting de ventas. Con esta info de un empresario turístico:
- Negocio: ${ofertaData.negocio}
- Destinos/especialidad: ${ofertaData.destino}
- Cliente ideal: ${ofertaData.cliente}
- Promesa: ${ofertaData.promesa}

Genera en español, SOLO JSON sin texto extra:
{
  "oferta": "Su propuesta de valor en 1 frase poderosa (máx 15 palabras, resultado + para quién + sin dolor)",
  "mensaje_cliente": "Mensaje de 2 líneas para redes que haga que su cliente diga 'esto es para mí' (usa segunda persona, habla de su emoción o miedo)"
}`;
    const res = await callClaude(prompt);
    setResultado((p) => ({ ...p, ...res }));
    setLoading(false);
    setScreen("b2");
  }

  async function handleClienteNext() {
    setLoading(true);
    setScreen("loading2");
    // Just move to b3 after brief pause — client analysis stored for final result
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setScreen("b3");
  }

  async function handleSituacionNext() {
    setLoading(true);
    setScreen("loading3");
    const count = checks.filter(Boolean).length;
    const pct = Math.round((count / CHECKLIST.length) * 100);
    const faltantes = CHECKLIST.filter((_, i) => !checks[i]).map((c) => c.label);
    const prompt = `Eres consultor de embudos digitales para turismo. Analiza este empresario:
- Negocio: ${ofertaData.negocio}, especialidad: ${ofertaData.destino}
- Cliente: ${ofertaData.cliente}
- Promesa: ${ofertaData.promesa}
- Frustración cliente: ${clienteData.frustracion}
- Miedo cliente: ${clienteData.miedo}
- Sueño cliente: ${clienteData.sueno}
- Embudo listo al: ${pct}%
- Le falta: ${faltantes.join(", ") || "nada — tiene todo"}

Genera en español, SOLO JSON sin texto extra:
{
  "pasos": [
    {"titulo": "Paso concreto 1", "descripcion": "Explicación de 1 línea de por qué y cómo hacerlo"},
    {"titulo": "Paso concreto 2", "descripcion": "Explicación de 1 línea"},
    {"titulo": "Paso concreto 3", "descripcion": "Explicación de 1 línea"}
  ],
  "pitch": "Párrafo de 2-3 líneas personalizado para este empresario explicando por qué el programa de $597 con SalesHub es su siguiente paso lógico dado su situación actual (menciona lo que le falta y cómo el programa lo resuelve)"
}`;
    const res = await callClaude(prompt);
    setResultado((p) => ({ ...p, ...res }));
    setLoading(false);
    setScreen("resultado");
  }

  const stepNum = { welcome: 0, b1: 1, loading1: 1, b2: 2, loading2: 2, b3: 3, loading3: 3, resultado: 4 }[screen] || 0;

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 60 }}>
        {/* Header */}
        <div style={{
          borderBottom: `1px solid ${T.border}`,
          padding: "16px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: `${T.bg}ee`, backdropFilter: "blur(12px)", zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.gold }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: T.white }}>
              Travel Mentor
            </span>
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.muted }}>
            DIAGNÓSTICO DE EMBUDO
          </span>
        </div>

        {/* Content */}
        <div ref={topRef} style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px 0" }}>
          {stepNum > 0 && stepNum < 4 && <Progress step={stepNum} />}

          {screen === "welcome" && <Welcome onStart={() => setScreen("b1")} />}

          {screen === "b1" && (
            <BloqueOferta data={ofertaData} onChange={handleOfertaField} onNext={handleOfertaNext} loading={loading} />
          )}

          {screen === "loading1" && (
            <div className="fade-in"><Progress step={1} /><Loader /></div>
          )}

          {screen === "b2" && (
            <BloqueCliente data={clienteData} onChange={handleClienteField} onNext={handleClienteNext} loading={loading} />
          )}

          {screen === "loading2" && (
            <div className="fade-in"><Progress step={2} /><Loader /></div>
          )}

          {screen === "b3" && (
            <BloqueSituacion checks={checks} onToggle={toggleCheck} onNext={handleSituacionNext} />
          )}

          {screen === "loading3" && (
            <div className="fade-in"><Progress step={3} /><Loader /></div>
          )}

          {screen === "resultado" && (
            <Resultado resultado={resultado} checks={checks} ofertaData={ofertaData} />
          )}
        </div>
      </div>
    </>
  );
}
