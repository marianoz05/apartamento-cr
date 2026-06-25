import React, { useState, useEffect, useRef } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────
const SUPABASE_URL = "https://cxjumlciielwwhunvmym.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4anVtbGNpaWVsd3dodW52bXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjcxMjUsImV4cCI6MjA5Nzc0MzEyNX0.VNPmOT3NLvdf0RIA53FdR4n6dpcz-SWS_9Nggmc9g2U";

const sb = {
  headers(token) {
    const h = {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  },
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: this.headers(token),
    });
  },
  async getReservas(token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reservas?order=check_in.asc`, {
      headers: this.headers(token),
    });
    return res.json();
  },
  async createReserva(token, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reservas`, {
      method: "POST",
      headers: { ...this.headers(token), "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateReserva(token, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reservas?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...this.headers(token), "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteReserva(token, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/reservas?id=eq.${id}`, {
      method: "DELETE",
      headers: this.headers(token),
    });
  },
  async getContenido(token) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/contenido?id=eq.1&select=*`, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      const rows = await res.json();
      console.log("getContenido response:", JSON.stringify(rows));
      return Array.isArray(rows) ? (rows[0]?.data || null) : null;
    } catch(e) {
      console.error("getContenido error:", e);
      return null;
    }
  },
  async saveContenido(token, data) {
    await fetch(`${SUPABASE_URL}/rest/v1/contenido?id=eq.1`, {
      method: "PATCH",
      headers: { ...this.headers(token), "Prefer": "return=representation" },
      body: JSON.stringify({ data }),
    });
  },
  async changePassword(token, newPassword) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: { ...this.headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    return res.json();
  },
  async getLimpiezas(token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/limpiezas?order=fecha.asc`, { headers: this.headers(token) });
    return res.json();
  },
  async createLimpieza(token, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/limpiezas`, {
      method: "POST", headers: { ...this.headers(token), "Prefer": "return=representation" }, body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateLimpieza(token, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/limpiezas?id=eq.${id}`, {
      method: "PATCH", headers: { ...this.headers(token), "Prefer": "return=representation" }, body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteLimpieza(token, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/limpiezas?id=eq.${id}`, { method: "DELETE", headers: this.headers(token) });
  },
  async getResenas(token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/resenas?order=created_at.desc`, {
      headers: token ? this.headers(token) : { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
    });
    return res.json();
  },
  async toggleOculta(token, id, oculta) {
    await fetch(`${SUPABASE_URL}/rest/v1/resenas?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...this.headers(token), "Prefer": "return=representation" },
      body: JSON.stringify({ oculta }),
    });
  },
  async deleteResena(token, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/resenas?id=eq.${id}`, {
      method: "DELETE",
      headers: this.headers(token),
    });
  },
  async createResena(data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/resenas`, {
      method: "POST",
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async getReservaByToken(guestToken) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reservas?token=eq.${guestToken}&select=*`, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      const rows = await res.json();
      console.log("getReservaByToken response:", JSON.stringify(rows));
      return Array.isArray(rows) ? (rows[0] || null) : null;
    } catch(e) {
      console.error("getReservaByToken error:", e);
      return null;
    }
  },
};


// ─── DEMO DATA ────────────────────────────────────────────────────
const DEMO_RESERVAS = [
  { id: 1, huesped_nombre: "Carlos Mejía", huesped_email: "carlos@email.com", check_in: "2026-06-20", check_out: "2026-06-24", estado: "activa", limpieza_hecha: true, token: "tok_abc123", noches: 4 },
  { id: 2, huesped_nombre: "María López", huesped_email: "maria@email.com", check_in: "2026-06-26", check_out: "2026-06-29", estado: "confirmada", limpieza_hecha: false, token: "tok_def456", noches: 3 },
  { id: 3, huesped_nombre: "Andrés Torres", huesped_email: "andres@email.com", check_in: "2026-07-02", check_out: "2026-07-07", estado: "confirmada", limpieza_hecha: false, token: "tok_ghi789", noches: 5 },
  { id: 4, huesped_nombre: "Sofía Restrepo", huesped_email: "sofia@email.com", check_in: "2026-05-10", check_out: "2026-05-14", estado: "completada", limpieza_hecha: true, token: "tok_jkl012", noches: 4 },
];

const INITIAL_CONTENT = {
  wifi: { nombre: "ApartamentoCR_5G", clave: "laureles2024" },
  normas: [
    { icon: "🕙", titulo: "Check-in desde las 3:00 PM", desc: "Check-out antes de las 12:00 PM" },
    { icon: "🚭", titulo: "No fumar adentro", desc: "Puedes hacerlo en el balcón." },
    { icon: "🐾", titulo: "No mascotas", desc: "Política del edificio." },
    { icon: "🎵", titulo: "Silencio después de las 10 PM", desc: "Respeta a los vecinos." },
    { icon: "🍽️", titulo: "Deja la cocina limpia", desc: "Lava los utensilios que uses." },
    { icon: "🗑️", titulo: "Basura", desc: "Punto de reciclaje en el primer piso." },
    { icon: "👥", titulo: "Máximo 4 personas", desc: "No se permiten eventos ni fiestas." },
  ],
  restaurantes: [
    { nombre: "Mondongo's", tipo: "Comida típica antioqueña", distancia: "5 min", precio: "$$" },
    { nombre: "Pergamino Café", tipo: "Café de especialidad", distancia: "7 min", precio: "$$" },
    { nombre: "El Rancho de Jonás", tipo: "Bandeja paisa", distancia: "3 min", precio: "$$" },
    { nombre: "La Hamburguesería", tipo: "Hamburguesas artesanales", distancia: "2 min", precio: "$$" },
    { nombre: "El Cielo", tipo: "Cocina colombiana moderna", distancia: "10 min", precio: "$$" },
  ],
  transporte: [
    { icon: "🚇", titulo: "Metro — Estación Estadio", desc: "Línea A · 10 min caminando · $2.950" },
    { icon: "🚌", titulo: "Buses y BRT", desc: "Circular Laureles pasa cada 8 min por Av. El Poblado" },
    { icon: "🛵", titulo: "Rappi / Uber / InDriver", desc: "Todas funcionan bien. InDriver suele ser más económico." },
    { icon: "🚲", titulo: "EnCicla", desc: "Bicicletas públicas. Estación a 4 min. Gratis con registro." },
    { icon: "✈️", titulo: "Aeropuerto JMC", desc: "~45 min en Uber. No uses taxis de la calle." },
  ],
  laureles: [
    { icon: "🌳", lugar: "Parque de Laureles", desc: "El parque central. Ideal para caminar en la mañana." },
    { icon: "🛍️", lugar: "Carrera 70", desc: "La calle más animada. Restaurantes, bares, cafés, tiendas." },
    { icon: "⚽", lugar: "Estadio Atanasio Girardot", desc: "A 10 min. Si hay partido de Nacional o DIM, ve." },
    { icon: "🎨", lugar: "MAMM — Museo de Arte Moderno", desc: "A 15 min. Entrada libre los domingos." },
    { icon: "🌆", lugar: "El Poblado", desc: "El barrio más turístico. 15 min en Uber. Ideal para la noche." },
    { icon: "🚡", lugar: "Metro Cable", desc: "Sube a los cerros y ve la ciudad entera. Única experiencia." },
  ],
  mensajes: {
    bienvenida: "Hola [nombre], te comparto toda la informacion para tu estadia en Apartamento CR.\n\nCheck-in: [checkin] a partir de las 3:00 PM\nCheck-out: [checkout] antes de las 12:00 PM\n\nAqui tu guia:\n[link]\n\nNos vemos pronto!",
    pago: "Hola [nombre], tienes un saldo pendiente de [moneda][saldo] para tu reserva del [checkin].\n\nPor favor coordina el pago antes del check-in.",
    resena: "Hola [nombre], gracias por tu estadía en Apartamento CR 🌿 Nos encantaría conocer tu opinión:\n[link_resena]",
  },
  ubicacion: { direccion: "Laureles, Medellín, Colombia", edificio: "", numero: "", maps_link: "" },
  contacto: {
    anfitrion_nombre: "Yanina Mora",
    anfitrion_tel: "+506 8891-1513",
    emergencias: [
      { icon: "👮", label: "Policía Nacional", num: "123" },
      { icon: "🚒", label: "Bomberos Medellín", num: "119" },
      { icon: "🚑", label: "Ambulancia / Emergencias", num: "125" },
      { icon: "⚡", label: "EPM (luz, gas, agua)", num: "115" },
    ],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────
function generateToken() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
function formatDate(str) { if (!str) return ""; const [y, m, d] = str.split("-"); return `${d}/${m}/${y}`; }
function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function isDateInRange(dateStr, checkIn, checkOut) { return dateStr >= checkIn && dateStr <= checkOut; }
function estadoBadge(estado) {
  const map = {
    pendiente:  { bg: "#FEF3C7", color: "#D97706", label: "Pendiente" },
    confirmada: { bg: "#DBEAFE", color: "#1E40AF", label: "Confirmada" },
    activa:     { bg: "#DCFCE7", color: "#166534", label: "Activa" },
    cancelada:  { bg: "#FEE2E2", color: "#991B1B", label: "Cancelada" },
    completada: { bg: "#F3F4F6", color: "#6B7280", label: "Completada" },
  };
  const s = map[estado] || map.pendiente;
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{s.label}</span>;
}

// ─── SHARED UI ───────────────────────────────────────────────────
function Card({ label, value, accent, large }) {
  return (
    <div style={{ background: accent + "15", border: `1px solid ${accent}40`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 800, fontSize: large ? 28 : 20, letterSpacing: large ? "0.2em" : "0", color: "#111827" }}>{value}</p>
    </div>
  );
}
function Note({ children }) {
  return <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: 12, marginTop: 8 }}><p style={{ margin: 0, fontSize: 13, color: "#92400E" }}>{children}</p></div>;
}
function FieldInput({ label, value, onChange, multiline }) {
  const base = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ ...base, resize: "vertical" }} />
        : <input value={value} onChange={e => onChange(e.target.value)} style={base} />}
    </div>
  );
}

// ─── GUEST PORTAL ────────────────────────────────────────────────
function GuestPortal({ reserva, content }) {
  const [active, setActive] = useState(null);
  const c = content;

  const sections = [
    {
      id: "ubicacion", icon: "📍", title: "Ubicación", color: "#1E3A5F",
      render: () => (
        <div>
          {c.ubicacion?.direccion && (
            <div style={{ background: "#EFF6FF", borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.1em" }}>Dirección</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1E3A5F" }}>{c.ubicacion.direccion}</p>
              {c.ubicacion?.edificio && <p style={{ margin: "6px 0 0", fontSize: 13, color: "#374151" }}>🏢 {c.ubicacion.edificio}</p>}
              {c.ubicacion?.numero && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#374151" }}>🚪 Apto. {c.ubicacion.numero}</p>}
            </div>
          )}
          {c.ubicacion?.maps_link && (
            <a href={c.ubicacion.maps_link} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#2563EB", color: "#fff", padding: "14px 0", borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              🗺️ Abrir en Google Maps
            </a>
          )}
        </div>
      )
    },
    {
      id: "wifi", icon: "📶", title: "WiFi y Acceso", color: "#1B4332",
      render: () => {
        const qrData = `WIFI:T:WPA;S:${c.wifi.nombre};P:${c.wifi.clave};;`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&bgcolor=ffffff&color=1B4332&margin=10`;
        return (
          <div>
            <Card label="Red WiFi" value={c.wifi.nombre} accent="#2D6A4F" />
            <Card label="Contraseña" value={c.wifi.clave} accent="#2D6A4F" />
            <div style={{ background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 16, padding: 20, marginTop: 8, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#1B4332" }}>📱 Escanea para conectarte</p>
              <p style={{ margin: "0 0 14px", fontSize: 12, color: "#6B7280" }}>Apunta la cámara de tu celular al código</p>
              <img src={qrUrl} alt="QR WiFi" style={{ width: 180, height: 180, borderRadius: 12, display: "block", margin: "0 auto" }} />
            </div>
          </div>
        );
      }
    },
    {
      id: "normas", icon: "📋", title: "Normas de la casa", color: "#4C1D95",
      render: () => (
        <div>
          {c.normas.map((n, i) => (
            <div key={i} style={{ display: "flex", gap: 12, background: "#FAF5FF", borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{n.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{n.titulo}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6B7280" }}>{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "restaurantes", icon: "🍽️", title: "Restaurantes cercanos", color: "#7F1D1D",
      render: () => (
        <div>
          {c.restaurantes.map((r, i) => (
            <div key={i} style={{ background: "#FEF2F2", borderRadius: 14, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{r.nombre}</p>
                <p style={{ margin: "2px 0", fontSize: 12, color: "#6B7280" }}>{r.tipo}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#DC2626" }}>📍 {r.distancia} caminando</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#D97706" }}>{r.precio || r.estrellas}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "transporte", icon: "🚇", title: "Cómo moverse", color: "#1E3A5F",
      render: () => (
        <div>
          {c.transporte.map((t, i) => (
            <div key={i} style={{ background: "#EFF6FF", borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{t.icon} {t.titulo}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#4B5563" }}>{t.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "laureles", icon: "🌿", title: "Qué hacer en Laureles", color: "#78350F",
      render: () => (
        <div>
          {c.laureles.map((l, i) => (
            <div key={i} style={{ background: "#FFF7ED", borderRadius: 14, padding: 14, marginBottom: 10, display: "flex", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{l.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{l.lugar}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6B7280" }}>{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "contacto", icon: "📞", title: "Contacto de emergencia", color: "#7F1D1D",
      render: () => (
        <div>
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.1em" }}>Anfitrión</p>
            <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 18 }}>{c.contacto.anfitrion_nombre}</p>
            <a href={`https://wa.me/${c.contacto.anfitrion_tel.replace(/[\s\-+]/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
              💬 Escribir por WhatsApp
            </a>
          </div>
          {c.contacto.emergencias.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9FAFB", borderRadius: 14, padding: "12px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>{e.icon}</span>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{e.label}</p>
              </div>
              <a href={`tel:${e.num}`} style={{ fontWeight: 800, fontSize: 18, color: "#DC2626", textDecoration: "none" }}>{e.num}</a>
            </div>
          ))}
        </div>
      )
    },
  ];

  const scrollRef = useRef(null);
  function scrollTop() { if (scrollRef.current) scrollRef.current.scrollTop = 0; }

  return (
    <div ref={scrollRef} style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F7F5F0", height: "100dvh", maxWidth: 430, margin: "0 auto", overflowY: "auto", WebkitOverflowScrolling: "touch", paddingTop: 0 }}>
      {active === null ? (
        <>
          <div style={{ background: "linear-gradient(160deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)", padding: "36px 20px 28px", paddingTop: "max(36px, env(safe-area-inset-top))", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <p style={{ color: "#95D5B2", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 6px", paddingTop: "env(safe-area-inset-top)" }}>Laureles · Medellín</p>
            <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.1 }}>Apartamento CR</h1>
            <p style={{ color: "#B7E4C7", fontSize: 13, margin: "0 0 16px" }}>Bienvenido/a, {reserva.huesped_nombre.split(" ")[0]} 🌿</p>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", display: "inline-flex", gap: 16 }}>
              {[["Check-in", formatDate(reserva.check_in)], ["Check-out", formatDate(reserva.check_out)], ["Noches", reserva.noches]].map(([lbl, val], i, arr) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</p>
                    <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 }}>{val}</p>
                  </div>
                  {i < arr.length - 1 && <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.2)" }} />}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "20px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {sections.map((s) => (
              <button key={s.id} onClick={() => { setActive(s.id); scrollTop(); }} style={{ background: "#fff", border: "none", borderRadius: 18, padding: "18px 14px", textAlign: "left", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
                <p style={{ margin: "8px 0 2px", fontWeight: 700, fontSize: 13, color: "#1a1a1a", lineHeight: 1.3 }}>{s.title}</p>
                <span style={{ fontSize: 16, color: "#d1d5db" }}>›</span>
              </button>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "#bbb", fontSize: 11, padding: "0 0 32px" }}>Apartamento CR · Laureles, Medellín</p>
        </>
      ) : (() => {
        const sec = sections.find(s => s.id === active);
        return (
          <>
            <div style={{ background: sec.color, padding: "20px 16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => { setActive(null); scrollTop(); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>‹</button>
              <div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Apartamento CR</p>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>{sec.icon} {sec.title}</h2>
              </div>
            </div>
            <div style={{ padding: "20px 16px 40px" }}>{sec.render()}</div>
          </>
        );
      })()}
    </div>
  );
}

// ─── CONTENIDO EDITOR ────────────────────────────────────────────
function ContenidoEditor({ content, onSave }) {
  const [local, setLocal] = useState(JSON.parse(JSON.stringify(content)));
  const [tab, setTab] = useState("wifi");
  const [saved, setSaved] = useState(false);

  function upd(path, value) {
    setLocal(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function updArr(section, idx, field, value) {
    setLocal(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[section][idx][field] = value;
      return next;
    });
  }

  function addItem(section) {
    setLocal(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const templates = {
        normas: { icon: "✅", titulo: "Nueva norma", desc: "Descripción" },
        restaurantes: { nombre: "Nuevo restaurante", tipo: "Tipo de comida", distancia: "0 min", precio: "$$" },
        transporte: { icon: "🚗", titulo: "Nuevo medio", desc: "Descripción" },
        laureles: { icon: "📍", lugar: "Nuevo lugar", desc: "Descripción" },
        emergencias: { icon: "📞", label: "Nuevo contacto", num: "000" },
      };
      if (section === "emergencias") next.contacto.emergencias.push(templates.emergencias);
      else next[section].push(templates[section]);
      return next;
    });
  }

  function removeItem(section, idx) {
    setLocal(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (section === "emergencias") next.contacto.emergencias.splice(idx, 1);
      else next[section].splice(idx, 1);
      return next;
    });
  }

  function handleSave() {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: "wifi", label: "📶 WiFi" },
    { id: "ubicacion", label: "📍 Ubicación" },
    { id: "normas", label: "📋 Normas" },
    { id: "restaurantes", label: "🍽️ Restaurantes" },
    { id: "transporte", label: "🚇 Transporte" },
    { id: "laureles", label: "🌿 Qué hacer" },
    { id: "contacto", label: "📞 Contacto" },
    { id: "mensajes", label: "💬 Mensajes" },
  ];

  const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const cardStyle = { background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 14, padding: 14, marginBottom: 10 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ fontWeight: 800, fontSize: 18, margin: 0, color: "#111827" }}>Contenido del portal</p>
        <button onClick={handleSave} style={{ background: saved ? "#16A34A" : "#1B4332", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {saved ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? "#1B4332" : "#F3F4F6", color: tab === t.id ? "#fff" : "#374151", border: "none", borderRadius: 20, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ubicacion" && (
        <div style={cardStyle}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 12px" }}>Ubicación del apartamento</p>
          <FieldInput label="Dirección" value={local.ubicacion?.direccion || ""} onChange={v => upd("ubicacion.direccion", v)} />
          <FieldInput label="Edificio" value={local.ubicacion?.edificio || ""} onChange={v => upd("ubicacion.edificio", v)} />
          <FieldInput label="Número de departamento" value={local.ubicacion?.numero || ""} onChange={v => upd("ubicacion.numero", v)} />
          <FieldInput label="Link de Google Maps" value={local.ubicacion?.maps_link || ""} onChange={v => upd("ubicacion.maps_link", v)} />
          {local.ubicacion?.maps_link && (
            <a href={local.ubicacion.maps_link} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EFF6FF", color: "#2563EB", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", marginTop: 4 }}>
              🗺️ Ver en Google Maps
            </a>
          )}
        </div>
      )}

      {/* WiFi */}
      {tab === "wifi" && (
        <div style={cardStyle}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 12px" }}>WiFi y Acceso</p>
          <FieldInput label="Nombre de la red WiFi" value={local.wifi.nombre} onChange={v => upd("wifi.nombre", v)} />
          <FieldInput label="Contraseña WiFi" value={local.wifi.clave} onChange={v => upd("wifi.clave", v)} />
        </div>
      )}

      {/* Normas */}
      {tab === "normas" && (
        <div>
          {local.normas.map((n, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#374151" }}>Norma {i + 1}</p>
                  <button onClick={() => { setLocal(prev => { const next = JSON.parse(JSON.stringify(prev)); if (i > 0) { [next.normas[i-1], next.normas[i]] = [next.normas[i], next.normas[i-1]]; } return next; }); }} disabled={i === 0} style={{ background: i===0?"#F9FAFB":"#EFF6FF", color: i===0?"#D1D5DB":"#2563EB", border: "none", borderRadius: 6, padding: "2px 7px", fontSize: 13, cursor: i===0?"default":"pointer", fontWeight: 700 }}>▲</button>
                  <button onClick={() => { setLocal(prev => { const next = JSON.parse(JSON.stringify(prev)); if (i < next.normas.length-1) { [next.normas[i], next.normas[i+1]] = [next.normas[i+1], next.normas[i]]; } return next; }); }} disabled={i === local.normas.length-1} style={{ background: i===local.normas.length-1?"#F9FAFB":"#EFF6FF", color: i===local.normas.length-1?"#D1D5DB":"#2563EB", border: "none", borderRadius: 6, padding: "2px 7px", fontSize: 13, cursor: i===local.normas.length-1?"default":"pointer", fontWeight: 700 }}>▼</button>
                </div>
                <button onClick={() => removeItem("normas", i)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 60 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Ícono</label>
                  <input value={n.icon} onChange={e => updArr("normas", i, "icon", e.target.value)} style={{ ...inputStyle, textAlign: "center", fontSize: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Título</label>
                  <input value={n.titulo} onChange={e => updArr("normas", i, "titulo", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Descripción</label>
                <input value={n.desc} onChange={e => updArr("normas", i, "desc", e.target.value)} style={inputStyle} />
              </div>
            </div>
          ))}
          <button onClick={() => addItem("normas")} style={{ background: "#F0FDF4", color: "#16A34A", border: "1px dashed #86EFAC", borderRadius: 12, padding: "10px 0", width: "100%", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Agregar norma</button>
        </div>
      )}

      {/* Restaurantes */}
      {tab === "restaurantes" && (
        <div>
          {local.restaurantes.map((r, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#374151" }}>{r.nombre || `Restaurante ${i + 1}`}</p>
                <button onClick={() => removeItem("restaurantes", i)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
              </div>
              <FieldInput label="Nombre" value={r.nombre} onChange={v => updArr("restaurantes", i, "nombre", v)} />
              <FieldInput label="Tipo de comida" value={r.tipo} onChange={v => updArr("restaurantes", i, "tipo", v)} />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Distancia</label>
                  <input value={r.distancia} onChange={e => updArr("restaurantes", i, "distancia", e.target.value)} style={inputStyle} placeholder="ej: 5 min" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Precio</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => { const lvl=["$","$$","$$$","$$$$"]; const ix=lvl.indexOf(r.precio||"$$"); if(ix>0) updArr("restaurantes", i, "precio", lvl[ix-1]); }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB", background: "#F9FAFB", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>−</button>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#D97706", minWidth: 36, textAlign: "center" }}>{r.precio||"$$"}</span>
                    <button onClick={() => { const lvl=["$","$$","$$$","$$$$"]; const ix=lvl.indexOf(r.precio||"$$"); if(ix<3) updArr("restaurantes", i, "precio", lvl[ix+1]); }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB", background: "#F9FAFB", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addItem("restaurantes")} style={{ background: "#FEF2F2", color: "#DC2626", border: "1px dashed #FECACA", borderRadius: 12, padding: "10px 0", width: "100%", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Agregar restaurante</button>
        </div>
      )}

      {/* Transporte */}
      {tab === "transporte" && (
        <div>
          {local.transporte.map((t, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#374151" }}>{t.titulo || `Transporte ${i + 1}`}</p>
                <button onClick={() => removeItem("transporte", i)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 60 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Ícono</label>
                  <input value={t.icon} onChange={e => updArr("transporte", i, "icon", e.target.value)} style={{ ...inputStyle, textAlign: "center", fontSize: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Título</label>
                  <input value={t.titulo} onChange={e => updArr("transporte", i, "titulo", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Descripción</label>
                <input value={t.desc} onChange={e => updArr("transporte", i, "desc", e.target.value)} style={inputStyle} />
              </div>
            </div>
          ))}
          <button onClick={() => addItem("transporte")} style={{ background: "#EFF6FF", color: "#2563EB", border: "1px dashed #BFDBFE", borderRadius: 12, padding: "10px 0", width: "100%", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Agregar medio de transporte</button>
        </div>
      )}

      {/* Qué hacer */}
      {tab === "laureles" && (
        <div>
          {local.laureles.map((l, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#374151" }}>{l.lugar || `Lugar ${i + 1}`}</p>
                <button onClick={() => removeItem("laureles", i)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 60 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Ícono</label>
                  <input value={l.icon} onChange={e => updArr("laureles", i, "icon", e.target.value)} style={{ ...inputStyle, textAlign: "center", fontSize: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Nombre del lugar</label>
                  <input value={l.lugar} onChange={e => updArr("laureles", i, "lugar", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Descripción</label>
                <input value={l.desc} onChange={e => updArr("laureles", i, "desc", e.target.value)} style={inputStyle} />
              </div>
            </div>
          ))}
          <button onClick={() => addItem("laureles")} style={{ background: "#FFF7ED", color: "#C2410C", border: "1px dashed #FED7AA", borderRadius: 12, padding: "10px 0", width: "100%", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Agregar lugar</button>
        </div>
      )}

      {/* Mensajes */}
      {tab === "mensajes" && (
        <div>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
            Edita las plantillas de WhatsApp. Variables: <strong>[nombre]</strong>, <strong>[checkin]</strong>, <strong>[checkout]</strong>, <strong>[link]</strong>, <strong>[saldo]</strong>, <strong>[moneda]</strong>, <strong>[link_resena]</strong>
          </p>
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 10px", color: "#1B4332" }}>🌿 Bienvenida + link del portal</p>
            <textarea
              value={local.mensajes?.bienvenida || ""}
              onChange={e => setLocal(prev => ({ ...prev, mensajes: { ...prev.mensajes, bienvenida: e.target.value } }))}
              rows={8}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 10px", color: "#D97706" }}>💰 Recordatorio de pago</p>
            <textarea
              value={local.mensajes?.pago || ""}
              onChange={e => setLocal(prev => ({ ...prev, mensajes: { ...prev.mensajes, pago: e.target.value } }))}
              rows={6}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 14, padding: 14 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 10px", color: "#A16207" }}>⭐ Solicitar reseña</p>
            <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 8px" }}>Variables: <strong>[nombre]</strong>, <strong>[link_resena]</strong></p>
            <textarea
              value={local.mensajes?.resena || ""}
              onChange={e => setLocal(prev => ({ ...prev, mensajes: { ...prev.mensajes, resena: e.target.value } }))}
              rows={4}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
        </div>
      )}

      {/* Contacto */}
      {tab === "contacto" && (
        <div>
          <div style={cardStyle}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 12px" }}>Datos del anfitrión</p>
            <FieldInput label="Tu nombre" value={local.contacto.anfitrion_nombre} onChange={v => upd("contacto.anfitrion_nombre", v)} />
            <FieldInput label="Teléfono / WhatsApp" value={local.contacto.anfitrion_tel} onChange={v => upd("contacto.anfitrion_tel", v)} />
            <FieldInput label="Horario de atención" value={local.contacto.anfitrion_horario} onChange={v => upd("contacto.anfitrion_horario", v)} />
          </div>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "16px 0 10px", color: "#374151" }}>Números de emergencia</p>
          {local.contacto.emergencias.map((e, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#374151" }}>{e.label}</p>
                <button onClick={() => removeItem("emergencias", i)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 60 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Ícono</label>
                  <input value={e.icon} onChange={ev => updArr("emergencias_contact", i, "icon", ev.target.value)}
                    onChange={ev => { setLocal(p => { const n = JSON.parse(JSON.stringify(p)); n.contacto.emergencias[i].icon = ev.target.value; return n; }); }}
                    style={{ ...inputStyle, textAlign: "center", fontSize: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Nombre</label>
                  <input value={e.label}
                    onChange={ev => { setLocal(p => { const n = JSON.parse(JSON.stringify(p)); n.contacto.emergencias[i].label = ev.target.value; return n; }); }}
                    style={inputStyle} />
                </div>
                <div style={{ width: 70 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Número</label>
                  <input value={e.num}
                    onChange={ev => { setLocal(p => { const n = JSON.parse(JSON.stringify(p)); n.contacto.emergencias[i].num = ev.target.value; return n; }); }}
                    style={inputStyle} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addItem("emergencias")} style={{ background: "#FEF2F2", color: "#DC2626", border: "1px dashed #FECACA", borderRadius: 12, padding: "10px 0", width: "100%", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Agregar contacto</button>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────
function AdminPanel({ onLogout, onLogoutToken, content, onContentSave }) {
  const [view, setView] = useState("reservas");
  const [reservas, setReservas] = useState([]);
  const [limpiezas, setLimpiezas] = useState([]);
  const [resenaIds, setResenaIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [showForm, setShowForm] = useState(false);
  const [editReserva, setEditReserva] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [waMenu, setWaMenu] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dashboardDetail, setDashboardDetail] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const emptyForm = { huesped_nombre: "", huesped_email: "", telefono: "", codigo_pais: "+506", check_in: "", check_out: "", noches: 0, cantidad_huespedes: 1, monto_noche: 0, monto_total: 0, moneda: "USD", pago1_monto: 0, pago1_fecha: "", pago2_monto: 0, pago2_fecha: "", saldo: 0, llave_entregada: false, traslape_autorizado: false, estado: "pendiente" };

  const PAISES = [
    { code: "+506", label: "🇨🇷 CR +506" },
    { code: "+502", label: "🇬🇹 GT +502" },
    { code: "+503", label: "🇸🇻 SV +503" },
    { code: "+504", label: "🇭🇳 HN +504" },
    { code: "+505", label: "🇳🇮 NI +505" },
    { code: "+507", label: "🇵🇦 PA +507" },
    { code: "+52",  label: "🇲🇽 MX +52"  },
    { code: "+1",   label: "🇺🇸 US +1"   },
    { code: "+57",  label: "🇨🇴 CO +57"  },
  ];

  const MONEDAS = { CRC: "₡", USD: "$" };

  function fmt(amount, moneda) {
    const sym = MONEDAS[moneda] || "₡";
    return sym + Number(amount || 0).toLocaleString();
  }

  function calcularEstado(r) {
    if (r.estado === "cancelada") return "cancelada";
    const hoy = new Date().toISOString().split("T")[0];
    if (r.check_out && hoy >= r.check_out) return "completada";
    if (r.check_in && hoy >= r.check_in && hoy < r.check_out) return "activa";
    if (Number(r.saldo || 0) <= 0 && Number(r.monto_total || 0) > 0) return "confirmada";
    return "pendiente";
  }

  function checkTraslape(checkIn, checkOut, excludeId = null) {
    if (!checkIn || !checkOut) return { traslape: false, tipo: null };
    return reservas.reduce((acc, r) => {
      if (acc.traslape && acc.tipo === "total") return acc;
      if (excludeId && r.id === excludeId) return acc;
      if (r.estado === "cancelada" || r.estado === "completada") return acc;
      const rIn = r.check_in, rOut = r.check_out;
      if (checkIn === rOut || checkOut === rIn) return { traslape: true, tipo: "limpieza", nombre: r.huesped_nombre };
      if (checkIn < rOut && checkOut > rIn) return { traslape: true, tipo: "total", nombre: r.huesped_nombre };
      return acc;
    }, { traslape: false, tipo: null });
  }
  const [form, setForm] = useState(emptyForm);

  function calcularNoches(ci, co) {
    if (!ci || !co) return 0;
    const diff = new Date(co) - new Date(ci);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  function updForm(key, value) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === "check_in" || key === "check_out") {
        next.noches = calcularNoches(key === "check_in" ? value : prev.check_in, key === "check_out" ? value : prev.check_out);
        next.monto_total = next.noches * Number(next.monto_noche || 0);
        next.saldo = next.monto_total - Number(next.pago1_monto || 0) - Number(next.pago2_monto || 0);
      }
      if (key === "monto_noche") {
        next.monto_total = Number(next.noches || 0) * Number(value || 0);
        next.saldo = next.monto_total - Number(next.pago1_monto || 0) - Number(next.pago2_monto || 0);
      }
      if (key === "pago1_monto" || key === "pago2_monto") {
        next.saldo = Number(next.monto_total || 0) - Number(key === "pago1_monto" ? value : next.pago1_monto || 0) - Number(key === "pago2_monto" ? value : next.pago2_monto || 0);
      }
      return next;
    });
  }

  useEffect(() => {
    const close = () => setWaMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    sb.getLimpiezas(onLogoutToken).then(data => {
      if (Array.isArray(data)) setLimpiezas(data);
    });
    sb.getResenas(onLogoutToken).then(data => {
      if (Array.isArray(data)) setResenaIds(new Set(data.map(r => r.reserva_id).filter(Boolean)));
    });
    sb.getReservas(onLogoutToken).then(data => {
      if (Array.isArray(data)) {
        // Auto-update states based on dates and payments
        const updated = data.map(r => ({ ...r, estado: calcularEstado(r) }));
        setReservas(updated);
        // Persist updated states back to Supabase silently
        updated.forEach(r => {
          const original = data.find(d => d.id === r.id);
          if (original && original.estado !== r.estado) {
            sb.updateReserva(onLogoutToken, r.id, { estado: r.estado });
          }
        });
      }
      setLoading(false);
    });
  }, []);

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const statColors = { activa: "#16A34A", confirmada: "#2563EB", pendiente: "#EA580C", completada: "#9CA3AF", cancelada: "#D1D5DB" };
  const { year, month } = calendarDate;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().split("T")[0];
  const pendingLimpieza = reservas.filter(r => {
    if (!["confirmada","activa","completada"].includes(r.estado)) return false;
    const found = limpiezas.filter(l => l.reserva_id === r.id);
    if (found.length === 0) return true;
    return found.every(l => !l.realizada);
  }).length;
  const limpiezasCoordinadas = limpiezas.filter(l => l.coordinado && !l.realizada).length;
  const limpiezasPendientePago = limpiezas.filter(l => l.realizada && !l.pagado).length;
  const activeNow = reservas.filter(r => r.estado === "activa").length;
  const upcoming = reservas.filter(r => r.estado === "confirmada").length;

  function getLimpiezaStatus(reservaId) {
    const found = limpiezas.filter(l => l.reserva_id === reservaId);
    if (found.length === 0) return "none";
    const realizada = found.some(l => l.realizada);
    const coord = found.some(l => l.coordinado);
    if (realizada) return "realizada";
    if (coord) return "coordinada";
    return "pendiente";
  }

  async function toggleLimpiezaRapida(r) {
    const found = limpiezas.filter(l => l.reserva_id === r.id);
    if (found.length === 0) {
      // none → coordinada
      const nueva = await sb.createLimpieza(onLogoutToken, { reserva_id: r.id, fecha: r.check_out, costo: 0, coordinado: true, pagado: false, realizada: false, notas: "" });
      if (Array.isArray(nueva) && nueva[0]) setLimpiezas(prev => [...prev, nueva[0]]);
    } else {
      const l = found[found.length - 1];
      if (!l.coordinado) {
        // pendiente → coordinada
        await sb.updateLimpieza(onLogoutToken, l.id, { coordinado: true, realizada: false });
        setLimpiezas(prev => prev.map(x => x.id === l.id ? { ...x, coordinado: true, realizada: false } : x));
      } else if (!l.realizada) {
        // coordinada → realizada
        await sb.updateLimpieza(onLogoutToken, l.id, { realizada: true });
        setLimpiezas(prev => prev.map(x => x.id === l.id ? { ...x, realizada: true } : x));
      }
      // realizada → no action (pagada solo desde módulo limpieza)
    }
  }

  async function cancelarReserva(id) {
    await sb.updateReserva(onLogoutToken, id, { estado: "cancelada" });
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: "cancelada" } : r));
    setConfirmDelete(null);
  }

  function getCellReservas(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const order = { activa: 0, confirmada: 1, pendiente: 2, completada: 3 };
    return reservas
      .filter(r => r.estado !== "cancelada" && isDateInRange(dateStr, r.check_in, r.check_out))
      .sort((a, b) => (order[a.estado] ?? 9) - (order[b.estado] ?? 9));
  }
  function openNewReserva() {
    setEditReserva(null);
    const base = { ...emptyForm };
    if (selectedDay) base.check_in = selectedDay;
    setForm(base);
    setShowForm(true);
  }
  function openEditReserva(r) {
    setEditReserva(r);
    setForm({
      huesped_nombre: r.huesped_nombre || "", huesped_email: r.huesped_email || "",
      telefono: r.telefono || "", codigo_pais: r.codigo_pais || "+506",
      check_in: r.check_in || "", check_out: r.check_out || "",
      noches: r.noches || 0, cantidad_huespedes: r.cantidad_huespedes || 1,
      monto_noche: r.monto_noche || 0, monto_total: r.monto_total || 0,
      moneda: r.moneda || "CRC",
      pago1_monto: r.pago1_monto || 0, pago1_fecha: r.pago1_fecha || "",
      pago2_monto: r.pago2_monto || 0, pago2_fecha: r.pago2_fecha || "",
      saldo: r.saldo || 0, llave_entregada: r.llave_entregada || false,
      traslape_autorizado: r.traslape_autorizado || false, estado: r.estado || "pendiente",
    });
    setShowForm(true);
  }
  async function saveReserva() {
    if (!form.huesped_nombre || !form.check_in || !form.check_out) return;
    const traslape = checkTraslape(form.check_in, form.check_out, editReserva?.id);
    if (traslape.traslape && traslape.tipo === "total") {
      alert(`❌ Conflicto de fechas con la reserva de ${traslape.nombre}. No se puede guardar.`);
      return;
    }
    if (traslape.traslape && traslape.tipo === "limpieza" && !form.traslape_autorizado) {
      alert(`⚠️ El check-in/out coincide con la reserva de ${traslape.nombre}. Activa "Autorizar traslape de limpieza" para continuar.`);
      return;
    }
    const basePayload = {
      ...form,
      noches: Number(form.noches),
      cantidad_huespedes: Number(form.cantidad_huespedes),
      monto_noche: Number(form.monto_noche),
      monto_total: Number(form.monto_total),
      pago1_monto: Number(form.pago1_monto),
      pago2_monto: Number(form.pago2_monto),
      saldo: Number(form.saldo),
      pago1_fecha: form.pago1_fecha || null,
      pago2_fecha: form.pago2_fecha || null,
    };
    const payload = { ...basePayload, estado: calcularEstado(basePayload) };
    if (editReserva) {
      await sb.updateReserva(onLogoutToken, editReserva.id, payload);
      setReservas(prev => prev.map(r => r.id === editReserva.id ? { ...r, ...payload } : r));
    } else {
      const created = await sb.createReserva(onLogoutToken, { ...payload, limpieza_hecha: false });
      if (Array.isArray(created) && created[0]) setReservas(prev => [...prev, created[0]]);
    }
    setShowForm(false);
  }
  async function toggleLimpieza(id) {
    const r = reservas.find(r => r.id === id);
    await sb.updateReserva(onLogoutToken, id, { limpieza_hecha: !r.limpieza_hecha });
    setReservas(prev => prev.map(r => r.id === id ? { ...r, limpieza_hecha: !r.limpieza_hecha } : r));
  }
  async function deleteReserva(id) {
    await sb.deleteReserva(onLogoutToken, id);
    setReservas(prev => prev.filter(r => r.id !== id));
    setConfirmDelete(null);
  }
  function copyGuestLink(token) { navigator.clipboard?.writeText(`https://apartamento-cr.vercel.app/g/${token}`); setCopiedToken(token); setTimeout(() => setCopiedToken(null), 2000); }

  function sendWhatsApp(r, tipo) {
    const nombre = r.huesped_nombre.split(" ")[0];
    const portalLink = `https://apartamento-cr.vercel.app/g/${r.token}`;
    const sym = MONEDAS[r.moneda] || "₡";
    const tel = `${(r.codigo_pais||"+506").replace("+","")}${r.telefono.replace(/\D/g,"")}`;

    if (tipo === "link") {
      const msg = "Hola " + nombre + ", aqui tu guia de Apartamento CR: " + portalLink;
      window.open("https://wa.me/" + tel + "?text=" + encodeURIComponent(msg), "_blank");
      return;
    }

    const plantilla = tipo === "bienvenida"
      ? (content?.mensajes?.bienvenida || "Hola [nombre], tu estadia en Apartamento CR.\nCheck-in: [checkin]\nCheck-out: [checkout]\nGuia: [link]")
      : (content?.mensajes?.pago || "Hola [nombre], saldo pendiente: [moneda][saldo] para [checkin].");

    let msg = plantilla
      .replace(/\[nombre\]/g, nombre)
      .replace(/\[checkin\]/g, formatDate(r.check_in))
      .replace(/\[checkout\]/g, formatDate(r.check_out))
      .replace(/\[link\]/g, portalLink)
      .replace(/\[saldo\]/g, Number(r.saldo||0).toLocaleString())
      .replace(/\[moneda\]/g, sym)
      .replace(/\\n/g, "\n");

    if (tipo === "bienvenida" && r.traslape_autorizado) {
      msg += "\n\n⚠️ El check-in coincide con la salida de otro huesped. Acceso disponible a partir de las 3:00 PM.";
    }

    const url = "https://wa.me/" + tel + "?text=" + encodeURIComponent(msg);
    window.open(url, "_blank");
  }

  const navItems = [["reservas","🏠","Reservas"],["limpieza","🧹","Limpieza"],["reportes","📈","Reportes"],["resenas","⭐","Reseñas"],["contenido","✏️","Contenido"],["cuenta","⚙️","Cuenta"]];

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [view]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <div style={{ background: "#1B4332", padding: "14px 20px", paddingTop: "max(14px, env(safe-area-inset-top))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "#95D5B2", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.15em" }}>Panel Admin</p>
          <p style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: 0 }}>Apartamento CR</p>
        </div>
        <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Salir</button>
      </div>

      {/* Top nav - desktop */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", display: "flex", overflowX: "auto", padding: "0 8px" }}>
        {navItems.map(([id, icon, label]) => (
          <button key={id} onClick={() => setView(id)} style={{ background: "none", border: "none", borderBottom: view === id ? "2px solid #1B4332" : "2px solid transparent", padding: "12px 10px", cursor: "pointer", fontSize: 12, fontWeight: view === id ? 700 : 500, color: view === id ? "#1B4332" : "#6B7280", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
            {icon} {label}
          </button>
        ))}
      </div>
      {/* Bottom nav - mobile */}
      <style>{`
        @media (max-width: 600px) {
          .admin-bottom-nav { display: flex !important; }
          .admin-content { padding-bottom: 80px !important; }
        }
      `}</style>
      <div className="admin-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #E5E7EB", zIndex: 100, justifyContent: "space-around", padding: "8px 0 12px" }}>
        {navItems.map(([id, icon, label]) => (
          <button key={id} onClick={() => setView(id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 8px", color: view === id ? "#1B4332" : "#9CA3AF" }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: view === id ? 700 : 500 }}>{label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content" style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>



        {view === "calendario" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 18, margin: 0, color: "#111827" }}>Calendario</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setCalendarDate(d => { const m = d.month === 0 ? 11 : d.month - 1; return { month: m, year: m === 11 ? d.year - 1 : d.year }; })} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16 }}>‹</button>
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 120, textAlign: "center" }}>{monthNames[month]} {year}</span>
                <button onClick={() => setCalendarDate(d => { const m = d.month === 11 ? 0 : d.month + 1; return { month: m, year: m === 0 ? d.year + 1 : d.year }; })} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16 }}>›</button>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Do","Lu","Ma","Mi","Ju","Vi","Sa"].map(d => <div key={d} style={{ textAlign: "center", padding: "8px 0", fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>{d}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={"e"+i} style={{ minHeight: 52, borderRight: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6" }} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                  const dayRes = getCellReservas(day);
                  const isToday = dateStr === today;
                  return (
                    <div key={day} style={{ minHeight: 52, borderRight: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6", padding: 4, background: isToday ? "#F0FDF4" : "#fff" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: isToday ? 800 : 500, color: isToday ? "#16A34A" : "#374151", textAlign: "center" }}>{day}</p>
                      {dayRes.slice(0,1).map(r => <div key={r.id} style={{ background: statColors[r.estado]+"20", borderLeft: `2px solid ${statColors[r.estado]}`, borderRadius: 3, padding: "1px 3px", fontSize: 9, fontWeight: 700, color: statColors[r.estado], overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{r.huesped_nombre.split(" ")[0]}</div>)}
                      {dayRes.length > 1 && <p style={{ margin: "1px 0 0", fontSize: 9, color: "#9CA3AF", textAlign: "center" }}>+{dayRes.length-1}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === "reservas" && (
          <div>
            {!showForm && (
              <p style={{ fontWeight: 800, fontSize: 18, margin: "0 0 16px", color: "#111827" }}>Reservas</p>
            )}
            {!showForm && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Reserva Activa", value: activeNow, color: "#16A34A", bg: "#DCFCE7" },
                  { label: "Próximas Reservas", value: upcoming, color: "#2563EB", bg: "#DBEAFE" },
                  { label: "Limpieza Coordinada", value: limpiezasCoordinadas, color: "#D97706", bg: "#FEF3C7" },
                  { label: "Limpieza Pendiente Pago", value: limpiezasPendientePago, color: "#DC2626", bg: "#FEE2E2" },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {!showForm && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => setCalendarDate(d => { const m = d.month === 0 ? 11 : d.month - 1; return { month: m, year: m === 11 ? d.year - 1 : d.year }; })} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>‹</button>
                    <span style={{ fontWeight: 700, fontSize: 13, minWidth: 110, textAlign: "center" }}>{monthNames[month]} {year}</span>
                    <button onClick={() => setCalendarDate(d => { const m = d.month === 11 ? 0 : d.month + 1; return { month: m, year: m === 0 ? d.year + 1 : d.year }; })} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>›</button>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {selectedDay && (
                      <button onClick={() => setSelectedDay(null)} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#6B7280" }}>✕ Quitar filtro</button>
                    )}
                    <button onClick={openNewReserva} style={{ background: "#1B4332", color: "#fff", border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Nueva</button>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                    {["Do","Lu","Ma","Mi","Ju","Vi","Sa"].map(d => <div key={d} style={{ textAlign: "center", padding: "6px 0", fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>{d}</div>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                    {Array.from({ length: firstDay }).map((_, i) => <div key={"e"+i} style={{ minHeight: 44, borderRight: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6" }} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                      const dayRes = getCellReservas(day);
                      const isToday = dateStr === today;
                      const isSelected = selectedDay === dateStr;
                      return (
                        <div key={day} onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                          style={{ minHeight: 44, borderRight: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6", padding: 3, background: isSelected ? "#DCFCE7" : isToday ? "#F0FDF4" : "#fff", cursor: "pointer" }}>
                          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: isToday ? 800 : 500, color: isSelected ? "#166534" : isToday ? "#16A34A" : "#374151", textAlign: "center" }}>{day}</p>
                          {dayRes.slice(0,1).map(r => <div key={r.id} style={{ background: (statColors[r.estado]||"#9CA3AF")+"20", borderLeft: `2px solid ${statColors[r.estado]||"#9CA3AF"}`, borderRadius: 3, padding: "1px 3px", fontSize: 9, fontWeight: 700, color: statColors[r.estado]||"#6B7280", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{r.huesped_nombre.split(" ")[0]}</div>)}
                          {dayRes.length > 1 && <p style={{ margin: "1px 0 0", fontSize: 9, color: "#9CA3AF", textAlign: "center" }}>+{dayRes.length-1}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  {[["activa","#16A34A","🟢 Activa"],["confirmada","#2563EB","🔵 Confirmada"],["pendiente","#EA580C","🟠 Pendiente"],["completada","#9CA3AF","⚫ Completada"]].map(([e,col,l]) => (
                    <div key={e} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "#6B7280" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showForm && (
              <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 14px" }}>{editReserva ? "Editar reserva" : "Nueva reserva"}</p>

                <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Huésped</p>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Nombre completo</label>
                  <input type="text" value={form.huesped_nombre} onChange={e => updForm("huesped_nombre", e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: !form.huesped_nombre ? "1px solid #FCA5A5" : "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box" }} placeholder="Requerido" />
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 130 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>País</label>
                    <select value={form.codigo_pais} onChange={e => updForm("codigo_pais", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, outline: "none", background: "#fff" }}>
                      {PAISES.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Teléfono</label>
                    <input type="tel" value={form.telefono} onChange={e => updForm("telefono", e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Cantidad de huéspedes</label>
                  <input type="number" min="1" max="10" value={form.cantidad_huespedes || ""} onChange={e => updForm("cantidad_huespedes", e.target.value === "" ? "" : Number(e.target.value))} onBlur={e => { if (!e.target.value) updForm("cantidad_huespedes", 1); }} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>

                <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em", margin: "12px 0 8px" }}>Fechas</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Check-in</label>
                    <input type="date" value={form.check_in} onChange={e => updForm("check_in", e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Check-out</label>
                    <input type="date" value={form.check_out} onChange={e => updForm("check_out", e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "8px 12px", marginBottom: 10, display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 13, color: "#166534" }}>🌙 <strong>{form.noches}</strong> noches</span>
                </div>

                {/* Traslape warning */}
                {(() => {
                  const t = checkTraslape(form.check_in, form.check_out, editReserva?.id);
                  if (!t.traslape) return null;
                  if (t.tipo === "total") return (
                    <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#991B1B", fontWeight: 600 }}>❌ Conflicto con reserva de {t.nombre}</p>
                    </div>
                  );
                  return (
                    <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#92400E", fontWeight: 600 }}>⚠️ Check-in/out coincide con {t.nombre}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => updForm("traslape_autorizado", !form.traslape_autorizado)} style={{ width: 24, height: 24, borderRadius: 6, border: form.traslape_autorizado ? "none" : "2px solid #D97706", background: form.traslape_autorizado ? "#D97706" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {form.traslape_autorizado && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                        </button>
                        <span style={{ fontSize: 12, color: "#92400E", fontWeight: 600 }}>Autorizar traslape de limpieza</span>
                      </div>
                    </div>
                  );
                })()}

                <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em", margin: "12px 0 8px" }}>Moneda</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {Object.entries(MONEDAS).reverse().map(([key, sym]) => (
                    <button key={key} onClick={() => updForm("moneda", key)} style={{ flex: 1, background: form.moneda === key ? "#1B4332" : "#F3F4F6", color: form.moneda === key ? "#fff" : "#374151", border: "none", borderRadius: 10, padding: "8px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      {sym} {key}
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em", margin: "12px 0 8px" }}>Montos</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Monto por noche</label>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
                      <span style={{ padding: "8px 10px", background: "#F9FAFB", fontSize: 13, fontWeight: 700, color: "#374151", borderRight: "1px solid #E5E7EB" }}>{MONEDAS[form.moneda]||"$"}</span>
                      <input type="number" value={form.monto_noche} onChange={e => updForm("monto_noche", e.target.value)} style={{ flex: 1, padding: "8px 12px", border: "none", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Total</label>
                    <div style={{ padding: "8px 12px", borderRadius: 8, background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: 13, fontWeight: 700, color: "#1B4332" }}>{fmt(form.monto_total, form.moneda)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Pago 1</label>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
                      <span style={{ padding: "8px 10px", background: "#F9FAFB", fontSize: 13, fontWeight: 700, color: "#374151", borderRight: "1px solid #E5E7EB" }}>{MONEDAS[form.moneda]||"$"}</span>
                      <input type="number" value={form.pago1_monto} onChange={e => updForm("pago1_monto", e.target.value)} style={{ flex: 1, padding: "8px 12px", border: "none", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Fecha pago 1</label>
                    <input type="date" value={form.pago1_fecha} onChange={e => updForm("pago1_fecha", e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                {Number(form.pago1_monto) > 0 && form.pago1_fecha && Number(form.saldo) > 0 && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Pago 2</label>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
                        <span style={{ padding: "8px 10px", background: "#F9FAFB", fontSize: 13, fontWeight: 700, color: "#374151", borderRight: "1px solid #E5E7EB" }}>{MONEDAS[form.moneda]||"$"}</span>
                        <input type="number" value={form.pago2_monto} onChange={e => updForm("pago2_monto", e.target.value)} style={{ flex: 1, padding: "8px 12px", border: "none", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Fecha pago 2</label>
                      <input type="date" value={form.pago2_fecha} onChange={e => updForm("pago2_fecha", e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                )}
                <div style={{ background: Number(form.saldo) > 0 ? "#FEF3C7" : "#DCFCE7", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: Number(form.saldo) > 0 ? "#D97706" : "#166534" }}>
                    Saldo pendiente: {fmt(form.saldo, form.moneda)}
                  </span>
                </div>

                {editReserva && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <button onClick={() => updForm("estado", form.estado === "cancelada" ? "pendiente" : "cancelada")} style={{ width: 28, height: 28, borderRadius: 8, border: form.estado === "cancelada" ? "none" : "2px solid #D1D5DB", background: form.estado === "cancelada" ? "#DC2626" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {form.estado === "cancelada" && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>❌ Marcar como cancelada</span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <button onClick={() => updForm("llave_entregada", !form.llave_entregada)} style={{ width: 28, height: 28, borderRadius: 8, border: form.llave_entregada ? "none" : "2px solid #D1D5DB", background: form.llave_entregada ? "#1B4332" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {form.llave_entregada && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>🔑 Llave entregada</span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveReserva} style={{ background: "#1B4332", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", flex: 1 }}>Guardar</button>
                  <button onClick={() => setShowForm(false)} style={{ background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                </div>
              </div>
            )}
                        {!showForm && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(() => {
                const estadoOrder = { activa: 0, confirmada: 1, pendiente: 2, completada: 3, cancelada: 4 };
                let list = [...reservas].sort((a, b) => {
                  const oa = estadoOrder[a.estado] ?? 5;
                  const ob = estadoOrder[b.estado] ?? 5;
                  if (oa !== ob) return oa - ob;
                  return a.check_in > b.check_in ? 1 : -1;
                });
                if (selectedDay) {
                  const hit = list.filter(r => isDateInRange(selectedDay, r.check_in, r.check_out));
                  const rest = list.filter(r => !isDateInRange(selectedDay, r.check_in, r.check_out));
                  list = [...hit, ...rest];
                }


                const currentYear = today.substring(0, 4);
                const currentMonth = today.substring(0, 7);
                const monthGroups = {};
                list.filter(r => r.check_in).forEach(r => {
                  const mk = r.check_in.substring(0, 7);
                  if (!monthGroups[mk]) monthGroups[mk] = [];
                  monthGroups[mk].push(r);
                });
                const curYearKeys = Object.keys(monthGroups).filter(mk => mk.startsWith(currentYear)).sort((a, b) => b.localeCompare(a));
                const pastYearKeys = Object.keys(monthGroups).filter(mk => !mk.startsWith(currentYear));
                const pastYears = [...new Set(pastYearKeys.map(mk => mk.substring(0, 4)))].sort((a, b) => b.localeCompare(a));
                return (
                  <div>
                    {curYearKeys.map(mk => {
                      const [gy, gm] = mk.split("-");
                      const isOpen = expandedMonths.has(mk) || mk === currentMonth;
                      const label = monthNames[parseInt(gm)-1] + " " + gy;
                      const groupList = monthGroups[mk];
                      return (
                        <div key={mk} style={{ marginBottom: 8 }}>
                          {mk === currentMonth ? (
                            <p style={{ fontWeight: 700, fontSize: 13, color: "#1B4332", margin: "0 0 8px" }}>📅 {label} · {groupList.length} reserva{groupList.length !== 1 ? "s" : ""}</p>
                          ) : (
                            <button onClick={() => setExpandedMonths(prev => { const n = new Set(prev); n.has(mk) ? n.delete(mk) : n.add(mk); return n; })}
                              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F3F4F6", border: "none", borderRadius: 12, padding: "10px 14px", cursor: "pointer", marginBottom: isOpen ? 8 : 0 }}>
                              <span style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>{label}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{groupList.length} reserva{groupList.length !== 1 ? "s" : ""}</span>
                                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{isOpen ? "▲" : "▼"}</span>
                              </div>
                            </button>
                          )}
                          {isOpen && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {groupList.map(r => {
                              const highlighted = selectedDay && isDateInRange(selectedDay, r.check_in, r.check_out);
                                                return (
                                              <div key={r.id} style={{ background: highlighted ? "#F0FDF4" : "#fff", borderRadius: 16, padding: 14, boxShadow: highlighted ? "0 0 0 2px #16A34A" : "0 1px 6px rgba(0,0,0,0.07)" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                                  <div>
                                                    <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>{r.huesped_nombre}</p>
                                                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{r.cantidad_huespedes ? `👥 ${r.cantidad_huespedes} huéspedes` : ""}{r.telefono ? ` · ${r.codigo_pais||""} ${r.telefono}` : ""}</p>
                                                  </div>
                                                  {estadoBadge(r.estado)}
                                                </div>
                                                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                                  {[["Check-in", formatDate(r.check_in)], ["Check-out", formatDate(r.check_out)], ["Noches", r.noches]].map(([lbl, val]) => (
                                                    <div key={lbl} style={{ background: "#F9FAFB", borderRadius: 8, padding: "6px 10px" }}>
                                                      <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{lbl}</p>
                                                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{val}</p>
                                                    </div>
                                                  ))}
                                                </div>
                                                {["confirmada","activa","completada"].includes(r.estado) && (() => {
                                                  const st = getLimpiezaStatus(r.id);
                                                  const lmap = {
                      none:       { bg: "#F3F4F6", color: "#6B7280", label: "🧹 Sin limpieza coordinada", btn: "Coordinar" },
                      pendiente:  { bg: "#FEF3C7", color: "#D97706", label: "🧹 Limpieza pendiente", btn: "Coordinar" },
                      coordinada: { bg: "#DBEAFE", color: "#1E40AF", label: "🧹 Limpieza coordinada", btn: "Marcar realizada" },
                      realizada:  { bg: "#DCFCE7", color: "#166534", label: "🧹 Limpieza realizada ✓", btn: null },
                      lista:      { bg: "#DCFCE7", color: "#166534", label: "🧹 Limpieza realizada ✓", btn: null },
                    };
                                                  const s = lmap[st] || lmap.none;
                                                  return (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.label}</span>
                                                      {s.btn && <button onClick={() => toggleLimpiezaRapida(r)} style={{ background: "none", border: `1px solid ${s.color}`, borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 600, color: s.color, cursor: "pointer" }}>{s.btn}</button>}
                                                    </div>
                                                  );
                                                })()}
                                                {r.monto_total > 0 && (
                                                  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                                                    <div style={{ background: "#F0FDF4", borderRadius: 8, padding: "5px 10px" }}>
                                                      <p style={{ margin: 0, fontSize: 10, color: "#6B7280" }}>Total</p>
                                                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#166534" }}>{fmt(r.monto_total, r.moneda)}</p>
                                                    </div>
                                                    <div style={{ background: "#EFF6FF", borderRadius: 8, padding: "5px 10px" }}>
                                                      <p style={{ margin: 0, fontSize: 10, color: "#6B7280" }}>Pagado</p>
                                                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#1E40AF" }}>{fmt(Number(r.pago1_monto||0) + Number(r.pago2_monto||0), r.moneda)}</p>
                                                    </div>
                                                    {Number(r.saldo||0) > 0 && (
                                                      <div style={{ background: "#FEF3C7", borderRadius: 8, padding: "5px 10px" }}>
                                                        <p style={{ margin: 0, fontSize: 10, color: "#6B7280" }}>Saldo</p>
                                                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#D97706" }}>{fmt(r.saldo, r.moneda)}</p>
                                                      </div>
                                                    )}
                                                    {r.llave_entregada ? (
                                                      <div style={{ background: "#F0FDF4", borderRadius: 8, padding: "5px 10px" }}>
                                                        <p style={{ margin: 0, fontSize: 11, color: "#166534", fontWeight: 700 }}>🔑 Llave entregada</p>
                                                      </div>
                                                    ) : ["pendiente","confirmada"].includes(r.estado) ? (
                                                      <div style={{ background: "#FEE2E2", borderRadius: 8, padding: "5px 10px" }}>
                                                        <p style={{ margin: 0, fontSize: 11, color: "#991B1B", fontWeight: 700 }}>🔑 Llave pendiente</p>
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )}
                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                  <button onClick={() => openEditReserva(r)} style={{ background: "#F9FAFB", color: "#374151", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✏️ Editar</button>
                                                  <div style={{ position: "relative" }}>
                                                    <button onClick={e => { e.stopPropagation(); setWaMenu(waMenu === r.id ? null : r.id); }} style={{ background: "#DCFCE7", color: "#166534", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                                      💬 WhatsApp ▾
                                                    </button>
                                                    {waMenu === r.id && (
                                                      <div style={{ position: "absolute", bottom: 36, left: 0, background: "#fff", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 50, minWidth: 230, overflow: "hidden" }}>
                                                        {r.telefono && (
                                                          <a href={`https://wa.me/${(r.codigo_pais||"+506").replace("+","")}${r.telefono.replace(/\\\\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                                                            onClick={() => setWaMenu(null)}
                                                            style={{ display: "block", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#374151", textDecoration: "none", borderBottom: "1px solid #F3F4F6" }}>
                                                            💬 Contacto directo
                                                          </a>
                                                        )}
                                                        {r.telefono && r.check_out >= new Date().toISOString().split("T")[0] && (
                                                          <button onClick={() => { sendWhatsApp(r, "bienvenida"); setWaMenu(null); }} style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", fontSize: 13, textAlign: "left", cursor: "pointer", borderBottom: "1px solid #F3F4F6", fontWeight: 600, color: "#1B4332" }}>
                                                            🌿 Bienvenida + link del portal
                                                          </button>
                                                        )}
                                                        {r.telefono && Number(r.saldo||0) > 0 && (
                                                          <button onClick={() => { sendWhatsApp(r, "pago"); setWaMenu(null); }} style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", fontSize: 13, textAlign: "left", cursor: "pointer", borderBottom: "1px solid #F3F4F6", fontWeight: 600, color: "#D97706" }}>
                                                            💰 Recordatorio de pago
                                                          </button>
                                                        )}
                                                        {["pendiente","confirmada","activa"].includes(r.estado) && (
                                                          <button onClick={() => {
                                                            if (r.telefono) { sendWhatsApp(r, "link"); }
                                                            else { navigator.clipboard?.writeText(`https://apartamento-cr.vercel.app/g/${r.token}`); setCopiedToken(r.token); setTimeout(() => setCopiedToken(null), 2000); }
                                                            setWaMenu(null);
                                                          }} style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", fontSize: 13, textAlign: "left", cursor: "pointer", fontWeight: 600, color: "#2563EB" }}>
                                                            {copiedToken === r.token ? "✓ Copiado" : r.telefono ? "📤 Enviar link del portal" : "🔗 Copiar link del portal"}
                                                          </button>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                  {r.estado === "completada" && r.telefono && (
                                                    <button onClick={() => {
                                                      const link = `https://apartamento-cr.vercel.app/resena/${r.id}`;
                                                      const msg = `Hola ${r.huesped_nombre.split(" ")[0]}, gracias por tu estadía en Apartamento CR 🌿 Nos encantaría conocer tu opinión: ${link}`;
                                                      const tel = `${(r.codigo_pais||"+506").replace("+","")}${r.telefono.replace(/\\\\D/g,"")}`;
                                                      window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, "_blank");
                                                    }} style={{ background: "#FEF9C3", color: "#A16207", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                                      ⭐ Solicitar reseña
                                                    </button>
                                                  )}
                                                  <button onClick={() => setConfirmDelete(r)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🗑️ Eliminar</button>
                                                </div>
                                                {confirmDelete?.id === r.id && (
                                                  <div style={{ marginTop: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: 14 }}>
                                                    <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: "#991B1B" }}>¿Qué deseas hacer con la reserva de {r.huesped_nombre}?</p>
                                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                      <button onClick={() => cancelarReserva(r.id)} style={{ background: "#FEF3C7", color: "#92400E", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>❌ Cancelar reserva</button>
                                                      <button onClick={() => deleteReserva(r.id)} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑️ Eliminar permanentemente</button>
                                                      <button onClick={() => setConfirmDelete(null)} style={{ background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Volver</button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                              );
                              
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {pastYears.map(yr => {
                      const isYearOpen = expandedMonths.has("year-" + yr);
                      const total = pastYearKeys.filter(mk => mk.startsWith(yr)).reduce((s, mk) => s + monthGroups[mk].length, 0);
                      const yearMonths = pastYearKeys.filter(mk => mk.startsWith(yr)).sort((a, b) => b.localeCompare(a));
                      return (
                        <div key={yr} style={{ marginBottom: 8 }}>
                          <button onClick={() => setExpandedMonths(prev => { const n = new Set(prev); n.has("year-"+yr) ? n.delete("year-"+yr) : n.add("year-"+yr); return n; })}
                            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#E5E7EB", border: "none", borderRadius: 12, padding: "10px 14px", cursor: "pointer", marginBottom: isYearOpen ? 8 : 0 }}>
                            <span style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>{yr}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11, color: "#6B7280" }}>{total} reserva{total !== 1 ? "s" : ""}</span>
                              <span style={{ fontSize: 12, color: "#6B7280" }}>{isYearOpen ? "▲" : "▼"}</span>
                            </div>
                          </button>
                          {isYearOpen && yearMonths.map(mk => {
                            const [gy, gm] = mk.split("-");
                            const isMOpen = expandedMonths.has(mk);
                            const label = monthNames[parseInt(gm)-1] + " " + gy;
                            const groupList = monthGroups[mk];
                            return (
                              <div key={mk} style={{ marginBottom: 8, paddingLeft: 8 }}>
                                <button onClick={() => setExpandedMonths(prev => { const n = new Set(prev); n.has(mk) ? n.delete(mk) : n.add(mk); return n; })}
                                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F3F4F6", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", marginBottom: isMOpen ? 8 : 0 }}>
                                  <span style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>{label}</span>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>{groupList.length} reserva{groupList.length !== 1 ? "s" : ""}</span>
                                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>{isMOpen ? "▲" : "▼"}</span>
                                  </div>
                                </button>
                                {isMOpen && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {groupList.map(r => {
                                    const highlighted = selectedDay && isDateInRange(selectedDay, r.check_in, r.check_out);
                                                      return (
                                                    <div key={r.id} style={{ background: highlighted ? "#F0FDF4" : "#fff", borderRadius: 16, padding: 14, boxShadow: highlighted ? "0 0 0 2px #16A34A" : "0 1px 6px rgba(0,0,0,0.07)" }}>
                                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                                        <div>
                                                          <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>{r.huesped_nombre}</p>
                                                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{r.cantidad_huespedes ? `👥 ${r.cantidad_huespedes} huéspedes` : ""}{r.telefono ? ` · ${r.codigo_pais||""} ${r.telefono}` : ""}</p>
                                                        </div>
                                                        {estadoBadge(r.estado)}
                                                      </div>
                                                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                                        {[["Check-in", formatDate(r.check_in)], ["Check-out", formatDate(r.check_out)], ["Noches", r.noches]].map(([lbl, val]) => (
                                                          <div key={lbl} style={{ background: "#F9FAFB", borderRadius: 8, padding: "6px 10px" }}>
                                                            <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{lbl}</p>
                                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{val}</p>
                                                          </div>
                                                        ))}
                                                      </div>
                                                      {["confirmada","activa","completada"].includes(r.estado) && (() => {
                                                        const st = getLimpiezaStatus(r.id);
                                                        const lmap = {
                      none:       { bg: "#F3F4F6", color: "#6B7280", label: "🧹 Sin limpieza coordinada", btn: "Coordinar" },
                      pendiente:  { bg: "#FEF3C7", color: "#D97706", label: "🧹 Limpieza pendiente", btn: "Coordinar" },
                      coordinada: { bg: "#DBEAFE", color: "#1E40AF", label: "🧹 Limpieza coordinada", btn: "Marcar realizada" },
                      realizada:  { bg: "#DCFCE7", color: "#166534", label: "🧹 Limpieza realizada ✓", btn: null },
                      lista:      { bg: "#DCFCE7", color: "#166534", label: "🧹 Limpieza realizada ✓", btn: null },
                    };
                                                        const s = lmap[st] || lmap.none;
                                                        return (
                                                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                            <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.label}</span>
                                                            {s.btn && <button onClick={() => toggleLimpiezaRapida(r)} style={{ background: "none", border: `1px solid ${s.color}`, borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 600, color: s.color, cursor: "pointer" }}>{s.btn}</button>}
                                                          </div>
                                                        );
                                                      })()}
                                                      {r.monto_total > 0 && (
                                                        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                                                          <div style={{ background: "#F0FDF4", borderRadius: 8, padding: "5px 10px" }}>
                                                            <p style={{ margin: 0, fontSize: 10, color: "#6B7280" }}>Total</p>
                                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#166534" }}>{fmt(r.monto_total, r.moneda)}</p>
                                                          </div>
                                                          <div style={{ background: "#EFF6FF", borderRadius: 8, padding: "5px 10px" }}>
                                                            <p style={{ margin: 0, fontSize: 10, color: "#6B7280" }}>Pagado</p>
                                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#1E40AF" }}>{fmt(Number(r.pago1_monto||0) + Number(r.pago2_monto||0), r.moneda)}</p>
                                                          </div>
                                                          {Number(r.saldo||0) > 0 && (
                                                            <div style={{ background: "#FEF3C7", borderRadius: 8, padding: "5px 10px" }}>
                                                              <p style={{ margin: 0, fontSize: 10, color: "#6B7280" }}>Saldo</p>
                                                              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#D97706" }}>{fmt(r.saldo, r.moneda)}</p>
                                                            </div>
                                                          )}
                                                          {r.llave_entregada ? (
                                                            <div style={{ background: "#F0FDF4", borderRadius: 8, padding: "5px 10px" }}>
                                                              <p style={{ margin: 0, fontSize: 11, color: "#166534", fontWeight: 700 }}>🔑 Llave entregada</p>
                                                            </div>
                                                          ) : ["pendiente","confirmada"].includes(r.estado) ? (
                                                            <div style={{ background: "#FEE2E2", borderRadius: 8, padding: "5px 10px" }}>
                                                              <p style={{ margin: 0, fontSize: 11, color: "#991B1B", fontWeight: 700 }}>🔑 Llave pendiente</p>
                                                            </div>
                                                          ) : null}
                                                        </div>
                                                      )}
                                                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                        <button onClick={() => openEditReserva(r)} style={{ background: "#F9FAFB", color: "#374151", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✏️ Editar</button>
                                                        <div style={{ position: "relative" }}>
                                                          <button onClick={e => { e.stopPropagation(); setWaMenu(waMenu === r.id ? null : r.id); }} style={{ background: "#DCFCE7", color: "#166534", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                                            💬 WhatsApp ▾
                                                          </button>
                                                          {waMenu === r.id && (
                                                            <div style={{ position: "absolute", bottom: 36, left: 0, background: "#fff", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 50, minWidth: 230, overflow: "hidden" }}>
                                                              {r.telefono && (
                                                                <a href={`https://wa.me/${(r.codigo_pais||"+506").replace("+","")}${r.telefono.replace(/\\\\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                                                                  onClick={() => setWaMenu(null)}
                                                                  style={{ display: "block", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#374151", textDecoration: "none", borderBottom: "1px solid #F3F4F6" }}>
                                                                  💬 Contacto directo
                                                                </a>
                                                              )}
                                                              {r.telefono && r.check_out >= new Date().toISOString().split("T")[0] && (
                                                                <button onClick={() => { sendWhatsApp(r, "bienvenida"); setWaMenu(null); }} style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", fontSize: 13, textAlign: "left", cursor: "pointer", borderBottom: "1px solid #F3F4F6", fontWeight: 600, color: "#1B4332" }}>
                                                                  🌿 Bienvenida + link del portal
                                                                </button>
                                                              )}
                                                              {r.telefono && Number(r.saldo||0) > 0 && (
                                                                <button onClick={() => { sendWhatsApp(r, "pago"); setWaMenu(null); }} style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", fontSize: 13, textAlign: "left", cursor: "pointer", borderBottom: "1px solid #F3F4F6", fontWeight: 600, color: "#D97706" }}>
                                                                  💰 Recordatorio de pago
                                                                </button>
                                                              )}
                                                              {["pendiente","confirmada","activa"].includes(r.estado) && (
                                                                <button onClick={() => {
                                                                  if (r.telefono) { sendWhatsApp(r, "link"); }
                                                                  else { navigator.clipboard?.writeText(`https://apartamento-cr.vercel.app/g/${r.token}`); setCopiedToken(r.token); setTimeout(() => setCopiedToken(null), 2000); }
                                                                  setWaMenu(null);
                                                                }} style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", fontSize: 13, textAlign: "left", cursor: "pointer", fontWeight: 600, color: "#2563EB" }}>
                                                                  {copiedToken === r.token ? "✓ Copiado" : r.telefono ? "📤 Enviar link del portal" : "🔗 Copiar link del portal"}
                                                                </button>
                                                              )}
                                                            </div>
                                                          )}
                                                        </div>
                                                        {r.estado === "completada" && r.telefono && (
                                                          <button onClick={() => {
                                                            const link = `https://apartamento-cr.vercel.app/resena/${r.id}`;
                                                            const msg = `Hola ${r.huesped_nombre.split(" ")[0]}, gracias por tu estadía en Apartamento CR 🌿 Nos encantaría conocer tu opinión: ${link}`;
                                                            const tel = `${(r.codigo_pais||"+506").replace("+","")}${r.telefono.replace(/\\\\D/g,"")}`;
                                                            window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, "_blank");
                                                          }} style={{ background: "#FEF9C3", color: "#A16207", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                                            ⭐ Solicitar reseña
                                                          </button>
                                                        )}
                                                        <button onClick={() => setConfirmDelete(r)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🗑️ Eliminar</button>
                                                      </div>
                                                      {confirmDelete?.id === r.id && (
                                                        <div style={{ marginTop: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: 14 }}>
                                                          <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: "#991B1B" }}>¿Qué deseas hacer con la reserva de {r.huesped_nombre}?</p>
                                                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                            <button onClick={() => cancelarReserva(r.id)} style={{ background: "#FEF3C7", color: "#92400E", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>❌ Cancelar reserva</button>
                                                            <button onClick={() => deleteReserva(r.id)} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑️ Eliminar permanentemente</button>
                                                            <button onClick={() => setConfirmDelete(null)} style={{ background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Volver</button>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                    );
                                    
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

            </div>}
          </div>
        )}

        {view === "limpieza" && (
          <LimpiezaView token={onLogoutToken} reservas={reservas} limpiezas={limpiezas} setLimpiezas={setLimpiezas} />
        )}

        {view === "reportes" && (
          <ReportesView token={onLogoutToken} reservas={reservas} />
        )}

        {view === "resenas" && (
          <ResenasAdminView token={onLogoutToken} reservas={reservas} />
        )}

        {view === "contenido" && (
          <ContenidoEditor content={content} onSave={onContentSave} />
        )}

        {view === "cuenta" && (
          <CuentaPanel token={onLogoutToken} />
        )}
      </div>
    </div>
  );
}



// ─── RESENAS ADMIN VIEW ───────────────────────────────────────────
function ResenasAdminView({ token, reservas }) {
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [resenaPage, setResenaPage] = useState(10);

  useEffect(() => {
    sb.getResenas(token).then(data => { if (Array.isArray(data)) setResenas(data); setLoading(false); });
  }, []);

  const visibles = resenas.filter(r => !r.oculta);
  const promedio = visibles.length > 0 ? (visibles.reduce((s,r)=>s+r.calificacion,0)/visibles.length).toFixed(1) : null;
  function Stars({ n, size=16 }) { return <span>{[1,2,3,4,5].map(i=><span key={i} style={{fontSize:size,color:i<=n?"#F59E0B":"#E5E7EB"}}>★</span>)}</span>; }
  async function toggleOculta(id, oculta) {
    await sb.toggleOculta(token, id, oculta);
    setResenas(prev => prev.map(r => r.id === id ? { ...r, oculta } : r));
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <p style={{fontWeight:800,fontSize:18,margin:0,color:"#111827"}}>Reseñas</p>
        <button onClick={()=>{navigator.clipboard?.writeText("https://apartamento-cr.vercel.app/apartamento-medellin");setCopied(true);setTimeout(()=>setCopied(false),2000);}}
          style={{background:"#F0FDF4",color:"#166534",border:"1px solid #A7F3D0",borderRadius:10,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {copied?"✓ Copiado":"🔗 Copiar link público"}
        </button>
      </div>
      {resenas.length===0&&!loading&&(
        <div style={{background:"#fff",borderRadius:16,padding:32,textAlign:"center",color:"#9CA3AF"}}>
          <p style={{fontSize:32,margin:"0 0 8px"}}>⭐</p>
          <p style={{margin:0,fontWeight:600}}>Aún no hay reseñas</p>
          <p style={{margin:"8px 0 0",fontSize:13}}>Solicítalas desde las reservas completadas</p>
        </div>
      )}
      {resenas.length>0&&(
        <div style={{background:"#fff",borderRadius:16,padding:16,marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",textAlign:"center"}}>
          <p style={{margin:"0 0 4px",fontSize:36,fontWeight:800,color:"#111827"}}>{promedio}</p>
          <Stars n={Math.round(promedio)} size={24}/>
          <p style={{margin:"8px 0 0",fontSize:13,color:"#6B7280"}}>{visibles.length} visible{visibles.length!==1?"s":""} · {resenas.length} total</p>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {resenas.slice(0, resenaPage).map(r=>(
          <div key={r.id} style={{background:"#fff",borderRadius:16,padding:14,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <p style={{margin:0,fontWeight:700,fontSize:14}}>{r.huesped_nombre}</p>
                <p style={{margin:"2px 0 0",fontSize:11,color:"#9CA3AF"}}>{formatDate(r.created_at?.split("T")[0])}</p>
              </div>
              <Stars n={r.calificacion} size={16}/>
            </div>
            {r.comentario&&<p style={{margin:0,fontSize:13,color:"#374151",lineHeight:1.5,fontStyle:"italic"}}>"{r.comentario}"</p>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
              {r.oculta
                ? <span style={{background:"#F3F4F6",color:"#6B7280",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>👁️ Oculta</span>
                : <span/>}
              <button onClick={()=>toggleOculta(r.id, !r.oculta)}
                style={{background:r.oculta?"#EFF6FF":"#F9FAFB",color:r.oculta?"#2563EB":"#9CA3AF",border:`1px solid ${r.oculta?"#BFDBFE":"#E5E7EB"}`,borderRadius:8,padding:"3px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>
                {r.oculta ? "👁️ Mostrar" : "🙈 Ocultar"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {resenaPage < resenas.length && (
        <button onClick={() => setResenaPage(p => p + 10)}
          style={{ width: "100%", background: "#F3F4F6", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer", marginTop: 8 }}>
          Ver {Math.min(10, resenas.length - resenaPage)} reseña{Math.min(10, resenas.length - resenaPage) !== 1 ? "s" : ""} más ▼
        </button>
      )}
    </div>
  );
}

// ─── RESENA EMAIL ─────────────────────────────────────────────────
async function sendResenaEmail(resena) {
  const RESEND_KEYS = [
    { key: "re_NZ1ckJbz_25CMRCKNj4YJmXsPpUaxkTT3", to: "marianoz-5@hotmail.com" },
    { key: "re_4e4MkzNA_DjuD9JmUc2tYZLC7xDLfnqTa", to: "ymora93@gmail.com" },
  ];
  const stars = "★".repeat(resena.calificacion) + "☆".repeat(5 - resena.calificacion);
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#1B4332;margin:0 0 4px">⭐ Nueva reseña — Apartamento CR</h2>
      <p style="color:#6B7280;margin:0 0 20px;font-size:13px">Acaba de llegar una nueva reseña</p>
      <div style="background:#F9FAFB;border-radius:12px;padding:16px;margin-bottom:16px">
        <p style="margin:0 0 6px;font-weight:700;font-size:16px">${resena.huesped_nombre}</p>
        <p style="margin:0 0 8px;font-size:22px;color:#F59E0B">${stars}</p>
        ${resena.comentario ? `<p style="margin:0;font-size:14px;color:#374151;font-style:italic">"${resena.comentario}"</p>` : "<p style='margin:0;font-size:13px;color:#9CA3AF'>Sin comentario</p>"}
      </div>
      <a href="https://apartamento-cr.vercel.app" style="display:inline-block;background:#1B4332;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px">Ver panel admin</a>
    </div>`;
  for (const { key, to } of RESEND_KEYS) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Apartamento CR <onboarding@resend.dev>",
          to,
          subject: `⭐ Nueva reseña de ${resena.huesped_nombre} — ${resena.calificacion}/5`,
          html,
        }),
      });
    } catch(e) { console.error("Email error:", e); }
  }
}

// ─── RESENA FORM ──────────────────────────────────────────────────
function ResenaForm({ reservaId }) {
  const [reserva, setReserva] = useState(null);
  const [cal, setCal] = useState(0);
  const [comentario, setComentario] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/resenas?reserva_id=eq.${reservaId}&select=*`,{headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":`Bearer ${SUPABASE_ANON_KEY}`}})
      .then(r=>r.json()).then(rows=>{
        if(Array.isArray(rows)&&rows.length>0){setStatus("already");return;}
        fetch(`${SUPABASE_URL}/rest/v1/reservas?id=eq.${reservaId}&select=huesped_nombre,check_in,check_out`,{headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":`Bearer ${SUPABASE_ANON_KEY}`}})
          .then(r=>r.json()).then(rows=>{if(Array.isArray(rows)&&rows[0])setReserva(rows[0]);setStatus("form");});
      }).catch(()=>setStatus("error"));
  },[reservaId]);

  async function submit() {
    if(cal===0)return;
    setStatus("loading");
    const resenaData = {reserva_id:reservaId,huesped_nombre:reserva?.huesped_nombre||"Huésped",calificacion:cal,comentario};
    await sb.createResena(resenaData);
    sendResenaEmail(resenaData); // fire and forget
    setStatus("sent");
  }

  if(status==="loading")return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F7F5F0",fontFamily:"Inter,sans-serif"}}><p style={{color:"#6B7280"}}>Cargando...</p></div>;
  if(status==="already")return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F7F5F0",fontFamily:"Inter,sans-serif",padding:20}}><div style={{textAlign:"center"}}><p style={{fontSize:48,margin:"0 0 12px"}}>✅</p><p style={{fontWeight:800,fontSize:20,color:"#111827"}}>¡Gracias!</p><p style={{color:"#6B7280",fontSize:14}}>Ya enviaste tu reseña.</p></div></div>;
  if(status==="sent")return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F7F5F0",fontFamily:"Inter,sans-serif",padding:20}}><div style={{textAlign:"center"}}><p style={{fontSize:48,margin:"0 0 12px"}}>🌿</p><p style={{fontWeight:800,fontSize:22,color:"#111827",margin:"0 0 8px"}}>¡Muchas gracias!</p><p style={{color:"#6B7280",fontSize:15}}>Tu reseña fue enviada con éxito.</p></div></div>;

  return (
    <div style={{fontFamily:"Inter,sans-serif",background:"#F7F5F0",minHeight:"100vh",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{background:"#fff",borderRadius:24,padding:28,width:"100%",maxWidth:400,boxShadow:"0 8px 40px rgba(0,0,0,0.1)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{background:"linear-gradient(160deg,#1B4332,#2D6A4F)",borderRadius:16,padding:"20px 0",marginBottom:16}}>
            <p style={{color:"#95D5B2",fontSize:11,fontWeight:700,letterSpacing:"0.15em",margin:"0 0 4px",textTransform:"uppercase"}}>Apartamento CR</p>
            <p style={{color:"#fff",fontSize:20,fontWeight:800,margin:0}}>¿Cómo fue tu estadía?</p>
          </div>
          {reserva&&<p style={{color:"#6B7280",fontSize:13,margin:0}}>{reserva.huesped_nombre} · {formatDate(reserva.check_in)} → {formatDate(reserva.check_out)}</p>}
        </div>
        <p style={{fontWeight:700,fontSize:14,color:"#374151",textAlign:"center",marginBottom:12}}>Calificación</p>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {[1,2,3,4,5].map(i=><button key={i} onClick={()=>setCal(i)} style={{fontSize:36,background:"none",border:"none",cursor:"pointer",color:i<=cal?"#F59E0B":"#E5E7EB"}}>★</button>)}
        </div>
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:8}}>Comentario (opcional)</label>
          <textarea value={comentario} onChange={e=>setComentario(e.target.value)} rows={4} placeholder="Cuéntanos tu experiencia..."
            style={{width:"100%",padding:"10px 14px",borderRadius:12,border:"1px solid #E5E7EB",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",resize:"none",lineHeight:1.5}}/>
        </div>
        <button onClick={submit} disabled={cal===0}
          style={{width:"100%",background:cal===0?"#D1D5DB":"#1B4332",color:"#fff",border:"none",borderRadius:14,padding:"14px 0",fontSize:15,fontWeight:700,cursor:cal===0?"not-allowed":"pointer"}}>
          {cal===0?"Selecciona una calificación":"Enviar reseña ✨"}
        </button>
      </div>
    </div>
  );
}

// ─── RESENAS PUBLICAS ─────────────────────────────────────────────
function ResenasPublicas() {
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resenaPage, setResenaPage] = useState(10);
  useEffect(()=>{sb.getResenas(null).then(data=>{if(Array.isArray(data))setResenas(data.filter(r=>!r.oculta));setLoading(false);});},[]);
  const promedio = resenas.length>0?(resenas.reduce((s,r)=>s+r.calificacion,0)/resenas.length).toFixed(1):null;
  function Stars({n,size=18}){return<span>{[1,2,3,4,5].map(i=><span key={i} style={{fontSize:size,color:i<=n?"#F59E0B":"#E5E7EB"}}>★</span>)}</span>;}
  return (
    <div style={{fontFamily:"Inter,sans-serif",background:"#F7F5F0",minHeight:"100vh"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(160deg,#1B4332,#2D6A4F)",padding:"36px 20px 24px",textAlign:"center"}}>
        <p style={{color:"#95D5B2",fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",margin:"0 0 6px"}}>Laureles · Medellín</p>
        <h1 style={{color:"#fff",fontSize:28,fontWeight:800,margin:"0 0 4px"}}>Apartamento Medellín</h1>
        <p style={{color:"#B7E4C7",fontSize:14,margin:0}}>Moderno · Fresco · Central</p>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",paddingBottom:40}}>
        {/* Main photo */}
        <img src="/flyer.jpg" alt="Apartamento CR Medellín"
          style={{width:"100%",display:"block",objectFit:"contain",background:"#fff"}}
          onError={e=>{e.target.style.display="none";}}/>

        {/* WhatsApp CTA */}
        <div style={{background:"#fff",padding:"16px",borderBottom:"1px solid #F3F4F6"}}>
          <a href="https://wa.me/50688911513" target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#25D366",color:"#fff",padding:"14px 0",borderRadius:14,fontWeight:700,fontSize:15,textDecoration:"none"}}>
            💬 Consultar disponibilidad por WhatsApp
          </a>
        </div>

        {/* Rating summary */}
        {promedio&&(
          <div style={{background:"#fff",padding:16,margin:"12px 16px 0",borderRadius:16,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",display:"flex",alignItems:"center",gap:16}}>
            <div style={{textAlign:"center",minWidth:60}}>
              <p style={{margin:0,fontSize:40,fontWeight:800,color:"#111827",lineHeight:1}}>{promedio}</p>
              <Stars n={Math.round(promedio)} size={16}/>
            </div>
            <div>
              <p style={{margin:0,fontWeight:700,fontSize:14,color:"#111827"}}>{resenas.length} reseña{resenas.length!==1?"s":""} verificadas</p>
              <p style={{margin:"4px 0 0",fontSize:12,color:"#6B7280"}}>De huéspedes que se hospedaron aquí</p>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div style={{padding:"16px 16px 0"}}>
          <p style={{fontWeight:700,fontSize:16,color:"#111827",margin:"0 0 12px"}}>Lo que dicen nuestros huéspedes</p>
          {loading&&<p style={{textAlign:"center",color:"#9CA3AF"}}>Cargando...</p>}
          {!loading&&resenas.length===0&&(
            <div style={{textAlign:"center",padding:32,color:"#9CA3AF",background:"#fff",borderRadius:16}}>
              <p style={{fontSize:32,margin:"0 0 8px"}}>⭐</p>
              <p style={{margin:0}}>Aún no hay reseñas publicadas.</p>
            </div>
          )}
          {resenas.slice(0, resenaPage).map(r=>(
            <div key={r.id} style={{background:"#fff",borderRadius:16,padding:16,marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <p style={{margin:0,fontWeight:700,fontSize:15}}>{r.huesped_nombre}</p>
                  <p style={{margin:"2px 0 0",fontSize:11,color:"#9CA3AF"}}>{formatDate(r.created_at?.split("T")[0])}</p>
                </div>
                <Stars n={r.calificacion} size={18}/>
              </div>
              {r.comentario&&<p style={{margin:0,fontSize:14,color:"#374151",lineHeight:1.6,fontStyle:"italic"}}>"{r.comentario}"</p>}
            </div>
          ))}
          {resenaPage < resenas.length && (
            <button onClick={() => setResenaPage(p => p + 10)}
              style={{ width: "100%", background: "#F3F4F6", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer", margin: "0 0 8px" }}>
              Ver {Math.min(10, resenas.length - resenaPage)} reseña{Math.min(10, resenas.length - resenaPage) !== 1 ? "s" : ""} más ▼
            </button>
          )}
        </div>
        <p style={{textAlign:"center",color:"#bbb",fontSize:11,padding:"16px 0 0"}}>Apartamento CR · Laureles, Medellín</p>
      </div>
    </div>
  );
}

// ─── REPORTES VIEW ────────────────────────────────────────────────
function ReportesView({ token, reservas }) {
  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [limpiezas, setLimpiezas] = useState([]);
  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  useEffect(()=>{sb.getLimpiezas(token).then(data=>{if(Array.isArray(data))setLimpiezas(data);});},[]);
  const mStr = `${selYear}-${String(selMonth+1).padStart(2,"0")}`;
  const rMes = reservas.filter(r=>r.check_in&&r.check_in.startsWith(mStr)&&r.estado!=="cancelada");
  const lMes = limpiezas.filter(l=>l.fecha&&l.fecha.startsWith(mStr));
  const dias = new Date(selYear,selMonth+1,0).getDate();
  const noches = rMes.reduce((s,r)=>s+(Number(r.noches)||0),0);
  const ocup = Math.round((noches/dias)*100);
  const iUSD = rMes.filter(r=>r.moneda==="USD").reduce((s,r)=>s+Number(r.monto_total||0),0);
  const iCRC = rMes.filter(r=>r.moneda==="CRC").reduce((s,r)=>s+Number(r.monto_total||0),0);
  const cUSD = rMes.filter(r=>r.moneda==="USD").reduce((s,r)=>s+Number(r.pago1_monto||0)+Number(r.pago2_monto||0),0);
  const cCRC = rMes.filter(r=>r.moneda==="CRC").reduce((s,r)=>s+Number(r.pago1_monto||0)+Number(r.pago2_monto||0),0);
  const cLimp = lMes.reduce((s,l)=>s+Number(l.costo||0),0);
  const pLimp = lMes.filter(l=>l.pagado).reduce((s,l)=>s+Number(l.costo||0),0);
  const huespedes = rMes.reduce((s,r)=>s+Number(r.cantidad_huespedes||0),0);
  const promN = rMes.length>0?(noches/rMes.length).toFixed(1):0;
  function toCSV(rows) {
    return rows.map(row =>
      row.map(v => {
        const s = String(v ?? "").replace(/"/g, '""');
        return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
      }).join(",")
    ).join("\n");
  }

  function downloadCSV(content, filename) {
    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  async function exportExcel() {
    const fecha = new Date().toISOString().split("T")[0];

    // Reservas CSV
    const resRows = [
      ["Nombre","Check-in","Check-out","Noches","Huéspedes","Estado","Moneda","Total","Pagado","Saldo","Llave","Teléfono"],
      ...reservas.map(r => [
        r.huesped_nombre||"", r.check_in||"", r.check_out||"",
        r.noches||0, r.cantidad_huespedes||0, r.estado||"",
        r.moneda||"", Number(r.monto_total||0),
        Number(r.pago1_monto||0)+Number(r.pago2_monto||0),
        Number(r.saldo||0), r.llave_entregada?"Sí":"No",
        r.telefono?`${r.codigo_pais||""} ${r.telefono}`:"",
      ])
    ];
    downloadCSV(toCSV(resRows), `ApartamentoCR_Reservas_${fecha}.csv`);

    // Limpiezas CSV
    const limpRows = [
      ["Fecha","Reserva","Costo COP","Coordinada","Realizada","Pagada","Notas"],
      ...limpiezas.map(l => {
        const res = reservas.find(r => r.id === l.reserva_id);
        return [l.fecha||"", res?res.huesped_nombre:"Independiente",
          Number(l.costo||0), l.coordinado?"Sí":"No",
          l.realizada?"Sí":"No", l.pagado?"Sí":"No", l.notas||""];
      })
    ];
    downloadCSV(toCSV(limpRows), `ApartamentoCR_Limpiezas_${fecha}.csv`);

    // Reseñas CSV
    const resenas = await sb.getResenas(token);
    const resenaRows = [
      ["Nombre","Calificación","Comentario","Fecha","Oculta"],
      ...(Array.isArray(resenas)?resenas:[]).map(r => [
        r.huesped_nombre||"", r.calificacion||0, r.comentario||"",
        r.created_at?r.created_at.split("T")[0]:"", r.oculta?"Sí":"No",
      ])
    ];
    downloadCSV(toCSV(resenaRows), `ApartamentoCR_Resenas_${fecha}.csv`);
  }

  const SC = ({label,value,sub,color,bg})=>(
    <div style={{background:bg||"#fff",borderRadius:14,padding:16,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
      <p style={{margin:"0 0 4px",fontSize:11,fontWeight:700,color:color||"#6B7280",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</p>
      <p style={{margin:0,fontSize:22,fontWeight:800,color:color||"#111827"}}>{value}</p>
      {sub&&<p style={{margin:"4px 0 0",fontSize:11,color:"#9CA3AF"}}>{sub}</p>}
    </div>
  );
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <p style={{fontWeight:800,fontSize:18,margin:0,color:"#111827"}}>Reportes</p>
        <button onClick={exportExcel} style={{background:"#1B4332",color:"#fff",border:"none",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>⬇️ Exportar CSV</button>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>{let m=selMonth-1,y=selYear;if(m<0){m=11;y--;}setSelMonth(m);setSelYear(y);}} style={{background:"#F3F4F6",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14}}>‹</button>
          <span style={{fontWeight:700,fontSize:13,minWidth:110,textAlign:"center"}}>{monthNames[selMonth]} {selYear}</span>
          <button onClick={()=>{let m=selMonth+1,y=selYear;if(m>11){m=0;y++;}setSelMonth(m);setSelYear(y);}} style={{background:"#F3F4F6",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14}}>›</button>
        </div>
      </div>
      <p style={{fontWeight:700,fontSize:13,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 10px"}}>Ocupación</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        <SC label="Reservas" value={rMes.length}/><SC label="Noches" value={noches} sub={`de ${dias} días`}/>
        <SC label="Ocupación" value={`${ocup}%`} color={ocup>70?"#16A34A":ocup>40?"#D97706":"#DC2626"} bg={ocup>70?"#DCFCE7":ocup>40?"#FEF3C7":"#FEE2E2"}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        <SC label="Huéspedes" value={huespedes}/><SC label="Prom. noches" value={promN} sub="por reserva"/>
      </div>
      <p style={{fontWeight:700,fontSize:13,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 10px"}}>Ingresos</p>
      {iUSD>0&&(
        <div style={{background:"#fff",borderRadius:14,padding:16,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginBottom:10}}>
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#374151"}}>💵 Dólares (USD)</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div style={{background:"#F0FDF4",borderRadius:10,padding:10,textAlign:"center"}}><p style={{margin:0,fontSize:10,color:"#6B7280"}}>Total</p><p style={{margin:0,fontWeight:800,fontSize:16,color:"#166534"}}>${iUSD.toLocaleString()}</p></div>
            <div style={{background:"#EFF6FF",borderRadius:10,padding:10,textAlign:"center"}}><p style={{margin:0,fontSize:10,color:"#6B7280"}}>Cobrado</p><p style={{margin:0,fontWeight:800,fontSize:16,color:"#1E40AF"}}>${cUSD.toLocaleString()}</p></div>
            <div style={{background:(iUSD-cUSD)>0?"#FEF3C7":"#F0FDF4",borderRadius:10,padding:10,textAlign:"center"}}><p style={{margin:0,fontSize:10,color:"#6B7280"}}>Saldo</p><p style={{margin:0,fontWeight:800,fontSize:16,color:(iUSD-cUSD)>0?"#D97706":"#166534"}}>${(iUSD-cUSD).toLocaleString()}</p></div>
          </div>
        </div>
      )}
      {iCRC>0&&(
        <div style={{background:"#fff",borderRadius:14,padding:16,boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginBottom:20}}>
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#374151"}}>🇨🇷 Colones (CRC)</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div style={{background:"#F0FDF4",borderRadius:10,padding:10,textAlign:"center"}}><p style={{margin:0,fontSize:10,color:"#6B7280"}}>Total</p><p style={{margin:0,fontWeight:800,fontSize:16,color:"#166534"}}>₡{iCRC.toLocaleString()}</p></div>
            <div style={{background:"#EFF6FF",borderRadius:10,padding:10,textAlign:"center"}}><p style={{margin:0,fontSize:10,color:"#6B7280"}}>Cobrado</p><p style={{margin:0,fontWeight:800,fontSize:16,color:"#1E40AF"}}>₡{cCRC.toLocaleString()}</p></div>
            <div style={{background:(iCRC-cCRC)>0?"#FEF3C7":"#F0FDF4",borderRadius:10,padding:10,textAlign:"center"}}><p style={{margin:0,fontSize:10,color:"#6B7280"}}>Saldo</p><p style={{margin:0,fontWeight:800,fontSize:16,color:(iCRC-cCRC)>0?"#D97706":"#166534"}}>₡{(iCRC-cCRC).toLocaleString()}</p></div>
          </div>
        </div>
      )}
      {iUSD===0&&iCRC===0&&<div style={{background:"#F9FAFB",borderRadius:14,padding:20,textAlign:"center",marginBottom:20,color:"#9CA3AF"}}><p style={{margin:0}}>Sin ingresos registrados este mes</p></div>}
      <p style={{fontWeight:700,fontSize:13,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 10px"}}>Limpiezas</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        <SC label="Total" value={lMes.length}/><SC label="Costo COP" value={`$${cLimp.toLocaleString()}`} color="#DC2626"/><SC label="Pagado" value={`$${pLimp.toLocaleString()}`} color="#16A34A"/>
      </div>
      {rMes.length>0&&(
        <>
          <p style={{fontWeight:700,fontSize:13,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 10px"}}>Detalle de reservas</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {rMes.map(r=>(
              <div key={r.id} style={{background:"#fff",borderRadius:12,padding:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><p style={{margin:0,fontWeight:700,fontSize:13}}>{r.huesped_nombre}</p><p style={{margin:"2px 0 0",fontSize:11,color:"#6B7280"}}>{formatDate(r.check_in)} → {formatDate(r.check_out)} · {r.noches} noches</p></div>
                <div style={{textAlign:"right"}}>
                  <p style={{margin:0,fontWeight:700,fontSize:13,color:"#166534"}}>{r.moneda==="USD"?"$":"₡"}{Number(r.monto_total||0).toLocaleString()}</p>
                  {Number(r.saldo||0)>0&&<p style={{margin:"2px 0 0",fontSize:11,color:"#D97706",fontWeight:700}}>Saldo: {r.moneda==="USD"?"$":"₡"}{Number(r.saldo).toLocaleString()}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── LIMPIEZA VIEW ────────────────────────────────────────────────
function LimpiezaView({ token, reservas, limpiezas, setLimpiezas }) {
  const [showForm, setShowForm] = useState(false);
  const [editL, setEditL] = useState(null);
  const [limpiezasPage, setLimpiezasPage] = useState(5);
  const LIMP_PAGE = 5;
  const emptyF = { fecha:"", reserva_id:"", costo:0, coordinado:false, realizada:false, pagado:false, notas:"" };
  const [form, setForm] = useState(emptyF);
  function openNew() { setEditL(null); setForm(emptyF); setShowForm(true); }
  function openEdit(l) { setEditL(l); setForm({fecha:l.fecha||"",reserva_id:l.reserva_id||"",costo:l.costo||0,coordinado:l.coordinado||false,realizada:l.realizada||false,pagado:l.pagado||false,notas:l.notas||""}); setShowForm(true); }
  async function save() {
    if(!form.fecha)return;
    const p = {...form,costo:Number(form.costo),reserva_id:form.reserva_id||null};
    if(editL){ await sb.updateLimpieza(token,editL.id,p); setLimpiezas(prev=>prev.map(l=>l.id===editL.id?{...l,...p}:l)); }
    else { const cr=await sb.createLimpieza(token,p); if(Array.isArray(cr)&&cr[0])setLimpiezas(prev=>[...prev,cr[0]]); }
    setShowForm(false);
  }
  async function del(id){ await sb.deleteLimpieza(token,id); setLimpiezas(prev=>prev.filter(l=>l.id!==id)); }
  async function tog(id,field){ const l=limpiezas.find(l=>l.id===id); const v=!l[field]; await sb.updateLimpieza(token,id,{[field]:v}); setLimpiezas(prev=>prev.map(l=>l.id===id?{...l,[field]:v}:l)); }
  function getR(id){ return reservas.find(r=>r.id===id); }
  const iS = {width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const rAct = reservas.filter(r=>["pendiente","confirmada","activa"].includes(r.estado));
  return (
    <div>
      {!showForm&&(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <p style={{fontWeight:800,fontSize:18,margin:0,color:"#111827"}}>Limpiezas</p>
          <button onClick={openNew} style={{background:"#1B4332",color:"#fff",border:"none",borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Nueva</button>
        </div>
      )}
      {showForm&&(
        <div style={{background:"#fff",borderRadius:16,padding:16,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.1)"}}>
          <p style={{fontWeight:700,fontSize:15,margin:"0 0 14px"}}>{editL?"Editar limpieza":"Nueva limpieza"}</p>
          <div style={{marginBottom:10}}><label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4}}>Fecha de limpieza</label><input type="date" value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))} style={iS}/></div>
          <div style={{marginBottom:10}}><label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4}}>Asociar a reserva (opcional)</label>
            <select value={form.reserva_id} onChange={e=>setForm(f=>({...f,reserva_id:e.target.value}))} style={{...iS,background:"#fff"}}>
              <option value="">— Limpieza independiente —</option>
              {rAct.map(r=><option key={r.id} value={r.id}>{r.huesped_nombre} · {formatDate(r.check_in)} → {formatDate(r.check_out)}</option>)}
            </select>
          </div>
          <div style={{marginBottom:10}}><label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4}}>Costo (COP)</label>
            <div style={{display:"flex",alignItems:"center",border:"1px solid #E5E7EB",borderRadius:8,overflow:"hidden"}}>
              <span style={{padding:"8px 10px",background:"#F9FAFB",fontSize:13,fontWeight:700,color:"#374151",borderRight:"1px solid #E5E7EB"}}>$</span>
              <input type="number" value={form.costo} onChange={e=>setForm(f=>({...f,costo:e.target.value}))} style={{flex:1,padding:"8px 12px",border:"none",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{marginBottom:10}}><label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4}}>Notas</label><textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} rows={2} style={{...iS,resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setForm(f=>({...f,coordinado:!f.coordinado}))} style={{width:24,height:24,borderRadius:6,border:form.coordinado?"none":"2px solid #D1D5DB",background:form.coordinado?"#2563EB":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {form.coordinado&&<span style={{color:"#fff",fontSize:12}}>✓</span>}
              </button><span style={{fontSize:13,fontWeight:600,color:"#374151"}}>📋 Coordinada</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setForm(f=>({...f,realizada:!f.realizada}))} style={{width:24,height:24,borderRadius:6,border:form.realizada?"none":"2px solid #D1D5DB",background:form.realizada?"#D97706":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {form.realizada&&<span style={{color:"#fff",fontSize:12}}>✓</span>}
              </button><span style={{fontSize:13,fontWeight:600,color:"#374151"}}>🧹 Realizada</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setForm(f=>({...f,pagado:!f.pagado}))} style={{width:24,height:24,borderRadius:6,border:form.pagado?"none":"2px solid #D1D5DB",background:form.pagado?"#16A34A":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {form.pagado&&<span style={{color:"#fff",fontSize:12}}>✓</span>}
              </button><span style={{fontSize:13,fontWeight:600,color:"#374151"}}>💰 Pagada</span>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{background:"#1B4332",color:"#fff",border:"none",borderRadius:8,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",flex:1}}>Guardar</button>
            <button onClick={()=>setShowForm(false)} style={{background:"#F3F4F6",color:"#374151",border:"none",borderRadius:8,padding:"10px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancelar</button>
          </div>
        </div>
      )}
      {!showForm&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {limpiezas.length===0&&<div style={{background:"#fff",borderRadius:16,padding:32,textAlign:"center",color:"#9CA3AF"}}><p style={{fontSize:32,margin:"0 0 8px"}}>🧹</p><p style={{margin:0,fontWeight:600}}>No hay limpiezas registradas</p></div>}
          {(() => {
            const sorted = [...limpiezas].sort((a,b) => a.fecha > b.fecha ? 1 : -1);
            const isPending = l => !(l.coordinado && l.realizada && l.pagado);
            const pending = sorted.filter(isPending);
            const done = sorted.filter(l => !isPending(l));
            const visibleDone = done.slice(0, limpiezasPage);
            return (
              <>
                {pending.map(l => {
                  const res = l.reserva_id ? reservas.find(r=>r.id===l.reserva_id) : null;
                  return(
                    <div key={l.id} style={{background:"#fff",borderRadius:16,padding:14,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div>
                          <p style={{margin:0,fontWeight:800,fontSize:15}}>🧹 {formatDate(l.fecha)}</p>
                          <p style={{margin:"2px 0 0",fontSize:12,color:"#6B7280"}}>{res?`📋 ${res.huesped_nombre} · Check-in ${formatDate(res.check_in)}`:"Limpieza independiente"}</p>
                          {l.notas&&<p style={{margin:"4px 0 0",fontSize:12,color:"#9CA3AF",fontStyle:"italic"}}>{l.notas}</p>}
                        </div>
                        {l.costo>0&&<div style={{background:"#F0FDF4",borderRadius:8,padding:"4px 10px",textAlign:"right"}}><p style={{margin:0,fontSize:10,color:"#6B7280"}}>COP</p><p style={{margin:0,fontWeight:700,fontSize:13,color:"#166534"}}>${Number(l.costo).toLocaleString()}</p></div>}
                      </div>
                      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                        <button onClick={()=>tog(l.id,"coordinado")} style={{display:"flex",alignItems:"center",gap:5,background:l.coordinado?"#DBEAFE":"#F3F4F6",color:l.coordinado?"#1E40AF":"#6B7280",border:"none",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>📋 {l.coordinado?"Coordinada ✓":"Coordinar"}</button>
                        <button onClick={()=>tog(l.id,"realizada")} style={{display:"flex",alignItems:"center",gap:5,background:l.realizada?"#FEF3C7":"#F3F4F6",color:l.realizada?"#D97706":"#6B7280",border:"none",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>🧹 {l.realizada?"Realizada ✓":"Marcar realizada"}</button>
                        <button onClick={()=>tog(l.id,"pagado")} style={{display:"flex",alignItems:"center",gap:5,background:l.pagado?"#DCFCE7":"#F3F4F6",color:l.pagado?"#166534":"#6B7280",border:"none",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>💰 {l.pagado?"Pagada ✓":"Pendiente pago"}</button>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>openEdit(l)} style={{background:"#F9FAFB",color:"#374151",border:"none",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>✏️ Editar</button>
                        <button onClick={()=>del(l.id)} style={{background:"#FEF2F2",color:"#DC2626",border:"none",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>🗑️ Eliminar</button>
                      </div>
                    </div>
                  );
                })}
                {done.length > 0 && (
                  <>
                    {visibleDone.length === 0 ? (
                      <button onClick={() => setLimpiezasPage(p => p + LIMP_PAGE)}
                        style={{width:"100%",background:"#F3F4F6",border:"none",borderRadius:12,padding:"12px 0",fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",marginTop:4}}>
                        Ver {Math.min(LIMP_PAGE, done.length)} limpieza{Math.min(LIMP_PAGE, done.length)!==1?"s":""} completadas ▼
                      </button>
                    ) : (
                      <>
                        <p style={{fontSize:12,color:"#9CA3AF",fontWeight:600,margin:"8px 0 6px",paddingLeft:4}}>Completadas</p>
                        {visibleDone.map(l => {
                          const res = l.reserva_id ? reservas.find(r=>r.id===l.reserva_id) : null;
                          return (
                            <div key={l.id} style={{background:"#F9FAFB",borderRadius:16,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                                <div>
                                  <p style={{margin:0,fontWeight:700,fontSize:14,color:"#6B7280"}}>🧹 {formatDate(l.fecha)}</p>
                                  <p style={{margin:"2px 0 0",fontSize:12,color:"#9CA3AF"}}>{res?res.huesped_nombre:"Independiente"}</p>
                                </div>
                                {l.costo>0&&<div style={{background:"#F0FDF4",borderRadius:8,padding:"4px 10px",textAlign:"right"}}><p style={{margin:0,fontSize:10,color:"#6B7280"}}>COP</p><p style={{margin:0,fontWeight:700,fontSize:13,color:"#166534"}}>${Number(l.costo).toLocaleString()}</p></div>}
                              </div>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                                <span style={{background:"#DBEAFE",color:"#1E40AF",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>📋 Coordinada ✓</span>
                                <span style={{background:"#FEF3C7",color:"#D97706",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>🧹 Realizada ✓</span>
                                <span style={{background:"#DCFCE7",color:"#166534",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>💰 Pagada ✓</span>
                              </div>
                              <div style={{display:"flex",gap:8}}>
                                <button onClick={()=>openEdit(l)} style={{background:"#F9FAFB",color:"#374151",border:"none",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>✏️ Editar</button>
                                <button onClick={()=>del(l.id)} style={{background:"#FEF2F2",color:"#DC2626",border:"none",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>🗑️ Eliminar</button>
                              </div>
                            </div>
                          );
                        })}
                        {done.length > limpiezasPage && (
                          <button onClick={() => setLimpiezasPage(p => p + LIMP_PAGE)}
                            style={{width:"100%",background:"#F3F4F6",border:"none",borderRadius:12,padding:"12px 0",fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",marginTop:4}}>
                            Ver {Math.min(LIMP_PAGE, done.length - limpiezasPage)} más ▼
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── CUENTA PANEL ────────────────────────────────────────────────
function CuentaPanel({ token }) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "ok" | "error"
  const [msg, setMsg] = useState("");

  async function handleChange() {
    if (!newPass || !confirmPass) { setMsg("Completa todos los campos."); setStatus("error"); return; }
    if (newPass !== confirmPass) { setMsg("Las contraseñas no coinciden."); setStatus("error"); return; }
    if (newPass.length < 6) { setMsg("La contraseña debe tener al menos 6 caracteres."); setStatus("error"); return; }
    setStatus("loading");
    const res = await sb.changePassword(token, newPass);
    if (res.id || res.email) {
      setStatus("ok");
      setMsg("Contraseña actualizada correctamente.");
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } else {
      setStatus("error");
      setMsg(res.message || "Error al actualizar. Intenta de nuevo.");
    }
  }

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <p style={{ fontWeight: 800, fontSize: 18, margin: "0 0 16px", color: "#111827" }}>Cuenta</p>
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 16px", color: "#374151" }}>🔒 Cambiar contraseña</p>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nueva contraseña</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Confirmar nueva contraseña</label>
          <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChange()} style={inputStyle} />
        </div>
        {msg && (
          <div style={{ background: status === "ok" ? "#DCFCE7" : "#FEE2E2", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: status === "ok" ? "#166534" : "#991B1B" }}>{msg}</p>
          </div>
        )}
        <button onClick={handleChange} disabled={status === "loading"} style={{ width: "100%", background: status === "loading" ? "#6B7280" : "#1B4332", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: status === "loading" ? "not-allowed" : "pointer" }}>
          {status === "loading" ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </div>
    </div>
  );
}

// ─── GUEST SCREEN ────────────────────────────────────────────────
function GuestScreen({ token, initialContent }) {
  const [reserva, setReserva] = useState(null);
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    Promise.all([
      sb.getReservaByToken(token),
      sb.getContenido(null),
    ]).then(([r, c]) => {
      if (r && r.id) {
        setReserva(r);
        if (c && typeof c === "object" && Object.keys(c).length > 0) setContent(c);
        setStatus("ok");
      } else {
        setStatus("error");
      }
    }).catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: "#F7F5F0" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 32, margin: "0 0 12px" }}>🌿</p>
        <p style={{ color: "#6B7280", fontSize: 14 }}>Cargando tu guía...</p>
      </div>
    </div>
  );

  if (status === "error") return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F5F0" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <p style={{ fontSize: 48, margin: "0 0 16px" }}>🔒</p>
        <p style={{ fontWeight: 800, fontSize: 20, color: "#111827", margin: "0 0 8px" }}>Link no válido</p>
        <p style={{ color: "#6B7280", fontSize: 14 }}>Este link no existe o ya expiró.</p>
      </div>
    </div>
  );

  return <GuestPortal reserva={reserva} content={content} />;
}

// ─── LOGIN ────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError("Ingresa email y contraseña."); return; }
    setLoading(true);
    setError("");
    try {
      const data = await sb.signIn(email, password);
      if (data.access_token) {
        onLogin(data.access_token);
      } else {
        setError("Email o contraseña incorrectos.");
        setLoading(false);
      }
    } catch (e) {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px 20px" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontSize: 36, margin: "0 0 8px" }}>🌿</p>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#111827" }}>Apartamento CR</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>Panel de administración</p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@apartamentocr.com" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        {error && <p style={{ color: "#DC2626", fontSize: 13, margin: "0 0 12px", textAlign: "center" }}>{error}</p>}
        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: loading ? "#6B7280" : "#1B4332", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  const path = window.location.pathname;
  const guestMatch = path.match(/^\/g\/(.+)$/);
  const guestToken = guestMatch ? guestMatch[1] : null;
  const resenaMatch = path.match(/^\/resena\/(.+)$/);
  const resenaId = resenaMatch ? resenaMatch[1] : null;
  const isResenasPublicas = path === "/resenas" || path === "/apartamento-medellin";

  const savedToken = localStorage.getItem("cr_token");
  const [screen, setScreen] = useState(
    guestToken ? "guest" : resenaId ? "resena" : isResenasPublicas ? "resenas_publicas" : savedToken ? "admin" : "login"
  );
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [token, setToken] = useState(savedToken);

  useEffect(() => {
    if (savedToken && !guestToken) {
      sb.getContenido(savedToken).then(c => {
        if (c && Object.keys(c).length > 0) setContent(c);
      });
    }
  }, []);

  async function handleLogin(t) {
    setToken(t);
    localStorage.setItem("cr_token", t);
    const savedContent = await sb.getContenido(t);
    if (savedContent && Object.keys(savedContent).length > 0) setContent(savedContent);
    setScreen("admin");
    setTimeout(() => {
      if (document.activeElement) document.activeElement.blur();
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 100);
  }

  return (
    <div>
      {screen === "login" && (
        <div>
          <Login onLogin={handleLogin} />
          <div style={{ position: "fixed", bottom: 16, right: 16 }}>
            <button onClick={() => setScreen("portal_preview")} style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.4)" }}>
              👤 Ver portal huésped
            </button>
          </div>
        </div>
      )}
      {screen === "admin" && (
        <AdminPanel
          onLogout={async () => { await sb.signOut(token); setToken(null); localStorage.removeItem("cr_token"); setScreen("login"); }}
          onLogoutToken={token}
          content={content}
          onContentSave={async (updated) => { await sb.saveContenido(token, updated); setContent(updated); }}
        />
      )}
      {screen === "guest" && (
        <GuestScreen token={guestToken} initialContent={INITIAL_CONTENT} />
      )}
      {screen === "resena" && (
        <ResenaForm reservaId={resenaId} />
      )}
      {screen === "portal_preview" && (
        <GuestPortal
          reserva={{ huesped_nombre: "Admin", check_in: new Date().toISOString().split("T")[0], check_out: new Date(Date.now()+3*86400000).toISOString().split("T")[0], noches: 3 }}
          content={content}
        />
      )}
      {screen === "resenas_publicas" && (
        <ResenasPublicas />
      )}
    </div>
  );
}
