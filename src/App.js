import { useState, useRef, useEffect, useCallback } from "react";

const STORAGE_KEY = "faison_museum_photos";

function loadPhotos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function savePhotos(photos) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(photos)); } catch {}
}

const AIRCRAFT_TYPES = ["All","Fighter","Bomber","Commercial","Helicopter","Gunship","Transport"];
const ERAS = ["All","WWII","Cold War","Modern","Historic"];
const BRANCHES = ["All","USAF","US Navy","US Army","Marine Corps","Commercial"];

const gold = "#C9A84C";
const steel = "#1B2B4B";
const muted = "#8B9BB4";
const light = "#E8EDF5";
const bg = "#0A0E1A";

// ── AI IDENTIFIER ────────────────────────────────────────────────────────────
async function identifyAircraft(base64Image) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: base64Image }
          },
          {
            type: "text",
            text: `You are an expert aircraft identifier with encyclopedic knowledge of military and commercial aviation. Analyze this photo and identify the aircraft.

Respond ONLY with a JSON object — no markdown, no backticks, no preamble — in this exact format:
{
  "title": "Full aircraft name e.g. F-14 Tomcat",
  "type": "One of: Fighter, Bomber, Transport, Helicopter, Commercial, Gunship, Trainer, Recon",
  "era": "One of: WWII, Cold War, Modern, Historic, Vintage",
  "branch": "e.g. USAF, US Navy, US Army, Marine Corps, Commercial, NATO, or null if unknown",
  "airline": "Airline name if commercial, otherwise null",
  "icon": "One of: ✈️ 🛩️ 🚁 🛫",
  "confidence": "High, Medium, or Low",
  "fun_fact": "One fascinating fact about this specific aircraft in one sentence",
  "notes": "Brief description of what you see in this photo — angle, markings, condition, setting"
}`
          }
        ]
      }]
    })
  });
  const data = await response.json();
  const text = data.content?.find(b => b.type === "text")?.text || "";
  return JSON.parse(text.trim());
}

// ── BADGE LOGO ────────────────────────────────────────────────────────────────
const BadgeLogo = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Gold background */}
    <circle cx="100" cy="100" r="100" fill="#C9A84C" />
    {/* Outer navy ring */}
    <circle cx="100" cy="100" r="95" fill="none" stroke="#0B0F1E" strokeWidth="3" />
    {/* Inner navy ring */}
    <circle cx="100" cy="100" r="80" fill="none" stroke="#0B0F1E" strokeWidth="1.2" />

    {/* Top arc text — sits between inner and outer rings */}
    <path id="tArc" d="M 21 95 A 79 79 0 1 1 179 95" fill="none" />
    <text fontFamily="Arial, sans-serif" fontSize="7" fill="#0B0F1E" fontWeight="bold" letterSpacing="1.2">
      <textPath href="#tArc" startOffset="6%">1:48 SCALE  ✦  HISTORY IN MINIATURE</textPath>
    </text>

    {/* Left plane */}
    <g transform="translate(40, 65) rotate(-25) scale(0.36)">
      <ellipse cx="0" cy="0" rx="4" ry="20" fill="#0B0F1E" />
      <polygon points="0,-4 -26,7 -22,13 0,3 22,13 26,7" fill="#0B0F1E" />
      <polygon points="0,11 -11,18 -9,22 0,15 9,22 11,18" fill="#0B0F1E" />
    </g>
    {/* Center plane */}
    <g transform="translate(100, 55) scale(0.5)">
      <ellipse cx="0" cy="0" rx="4" ry="22" fill="#0B0F1E" />
      <polygon points="0,-4 -30,8 -26,15 0,4 26,15 30,8" fill="#0B0F1E" />
      <polygon points="0,13 -13,21 -11,25 0,17 11,25 13,21" fill="#0B0F1E" />
    </g>
    {/* Right plane */}
    <g transform="translate(160, 65) rotate(25) scale(0.36)">
      <ellipse cx="0" cy="0" rx="4" ry="20" fill="#0B0F1E" />
      <polygon points="0,-4 -26,7 -22,13 0,3 22,13 26,7" fill="#0B0F1E" />
      <polygon points="0,11 -11,18 -9,22 0,15 9,22 11,18" fill="#0B0F1E" />
    </g>

    {/* Navy ribbon — carefully positioned in lower third */}
    <rect x="22" y="100" width="156" height="46" fill="#0B0F1E" />
    <polygon points="22,100 22,146 5,123" fill="#0B0F1E" />
    <polygon points="178,100 178,146 195,123" fill="#0B0F1E" />
    {/* Darker wing accents */}
    <polygon points="22,100 22,123 5,123" fill="#1B2B4B" />
    <polygon points="178,100 178,123 195,123" fill="#1B2B4B" />

    {/* FAISON */}
    <text x="100" y="121" textAnchor="middle" fill="#C9A84C" fontSize="22" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif" letterSpacing="4">FAISON</text>
    {/* Divider */}
    <line x1="32" y1="125" x2="168" y2="125" stroke="#C9A84C" strokeWidth="0.6" opacity="0.5" />
    {/* FAMILY */}
    <text x="100" y="135" textAnchor="middle" fill="#C9A84C" fontSize="9.5" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="4">FAMILY</text>
    {/* Divider */}
    <line x1="32" y1="138" x2="168" y2="138" stroke="#C9A84C" strokeWidth="0.5" opacity="0.4" />
    {/* AIRCRAFT MUSEUM */}
    <text x="100" y="145" textAnchor="middle" fill="#C9A84C" fontSize="6.5" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="2">AIRCRAFT MUSEUM</text>

    {/* Star — sits just below ribbon */}
    <circle cx="100" cy="160" r="9" fill="#C9A84C" stroke="#0B0F1E" strokeWidth="1.8" />
    <polygon points="100,153 101.7,158 107,158 102.8,161 104.3,166 100,163 95.7,166 97.2,161 93,158 98.3,158" fill="#0B0F1E" />

    {/* Bottom arc text — carefully placed below star, above outer ring */}
    <path id="bArc" d="M 26 115 A 74 74 0 0 0 174 115" fill="none" />
    <text fontFamily="Arial, sans-serif" fontSize="6" fill="#0B0F1E" letterSpacing="0.6">
      <textPath href="#bArc" startOffset="6%">BUILT WITH PASSION  ✦  DISPLAYED WITH PRIDE</textPath>
    </text>
  </svg>
);

// ── PHOTO THUMB ───────────────────────────────────────────────────────────────
const PhotoThumb = ({ photo, height = 140 }) => {
  if (photo.image) {
    return (
      <div style={{ height, position: "relative", overflow: "hidden" }}>
        <img src={photo.image} alt={photo.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(10,14,26,0.85))", height: 50 }} />
        {photo.favorite && <div style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: 18, textShadow: "0 1px 4px #000" }}>★</div>}
      </div>
    );
  }
  return (
    <div style={{ height, background: `linear-gradient(160deg, ${photo.color} 0%, #0A0E1A 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, position: "relative", borderBottom: `1px solid ${steel}` }}>
      {photo.icon}
      {photo.favorite && <div style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: 18 }}>★</div>}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(10,14,26,0.9))", height: 40 }} />
      <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", color: "#4A5B7A", fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 1 }}>TAP TO ADD PHOTO</div>
    </div>
  );
};

// ── PLANE CARD ────────────────────────────────────────────────────────────────
const PlaneCard = ({ photo, onClick, onToggleFavorite }) => (
  <div
    onClick={() => onClick(photo)}
    style={{ background: `linear-gradient(135deg, ${photo.color}dd, #0A0E1A)`, border: `1px solid ${steel}`, borderRadius: 8, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", overflow: "hidden", position: "relative" }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,168,76,0.2)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
  >
    <PhotoThumb photo={photo} height={150} />
    <div style={{ padding: "12px 14px" }}>
      <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{photo.title}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ background: steel, color: muted, fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "Roboto Mono, monospace", letterSpacing: 1 }}>{photo.type}</span>
        <span style={{ background: "#C9A84C22", color: gold, fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "Roboto Mono, monospace" }}>{photo.era}</span>
      </div>
      <div style={{ color: muted, fontSize: 11, fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", gap: 3 }}>
        <div>📍 {photo.location}</div>
        <div>📅 {new Date(photo.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
        {photo.branch && <div>🎖️ {photo.branch}</div>}
        {photo.airline && <div>✈️ {photo.airline}</div>}
      </div>
    </div>
    <button onClick={e => { e.stopPropagation(); onToggleFavorite(photo.id); }} style={{ position: "absolute", top: 8, left: 8, background: photo.favorite ? gold : "#0A0E1A99", border: `1px solid ${gold}`, color: photo.favorite ? "#0A0E1A" : gold, borderRadius: "50%", width: 28, height: 28, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>★</button>
  </div>
);

// ── AI IDENTIFIER MODAL ───────────────────────────────────────────────────────
const AIIdentifierModal = ({ onClose, onAddIdentified }) => {
  const [stage, setStage] = useState("upload"); // upload | analyzing | result | form
  const [imageData, setImageData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const full = ev.target.result;
      setImagePreview(full);
      // Strip data URL prefix for API
      const base64 = full.split(",")[1];
      setImageData(base64);
    };
    reader.readAsDataURL(file);
    setStage("ready");
  };

  const handleAnalyze = async () => {
    setStage("analyzing");
    setError(null);
    try {
      const res = await identifyAircraft(imageData);
      setResult(res);
      setStage("result");
    } catch (err) {
      setError("Couldn't identify the aircraft. Please try a clearer photo.");
      setStage("ready");
    }
  };

  const handleAdd = () => {
    onAddIdentified({
      id: Date.now(),
      title: result.title,
      type: result.type,
      era: result.era,
      branch: result.branch,
      airline: result.airline,
      icon: result.icon || "✈️",
      image: imagePreview,
      location: location || "Unknown Location",
      date: date || new Date().toISOString().split("T")[0],
      notes: result.notes || "",
      funFact: result.fun_fact || "",
      favorite: false,
      color: ["#1B3A5C","#3B2F1E","#1A3B2F","#1A1A3B","#2A1A3B","#1A2F1A"][Math.floor(Math.random()*6)],
      aiIdentified: true,
    });
    onClose();
  };

  const inputStyle = { background: "#0D1628", border: `1px solid ${steel}`, borderRadius: 6, color: light, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };
  const labelStyle = { color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, display: "block", marginBottom: 4 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0D1220", border: `1px solid ${gold}`, borderRadius: 12, maxWidth: 520, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 0 80px rgba(201,168,76,0.2)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${steel}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 10, letterSpacing: 2 }}>🤖 AI POWERED</div>
            <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 20, fontWeight: 700 }}>AIRCRAFT IDENTIFIER</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: muted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px" }}>

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current.click()}
            style={{ border: `2px dashed ${imagePreview ? gold : steel}`, borderRadius: 10, height: imagePreview ? 220 : 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative", marginBottom: 20, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = gold}
            onMouseLeave={e => e.currentTarget.style.borderColor = imagePreview ? gold : steel}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <div style={{ fontSize: 28 }}>🔄</div>
                  <div style={{ color: light, fontFamily: "Roboto Mono, monospace", fontSize: 10, letterSpacing: 1 }}>CHANGE PHOTO</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🛩️</div>
                <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>DROP A PLANE PHOTO HERE</div>
                <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 1, marginTop: 6 }}>Claude AI will identify the aircraft</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

          {/* Analyze button */}
          {(stage === "ready" || stage === "analyzing") && (
            <button
              onClick={handleAnalyze}
              disabled={stage === "analyzing"}
              style={{ width: "100%", background: stage === "analyzing" ? steel : gold, color: stage === "analyzing" ? muted : "#0A0E1A", border: "none", borderRadius: 8, padding: "14px", fontFamily: "Oswald, sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, cursor: stage === "analyzing" ? "not-allowed" : "pointer", marginBottom: 16, transition: "all 0.2s" }}
            >
              {stage === "analyzing" ? "🔍 ANALYZING AIRCRAFT..." : "🤖 IDENTIFY THIS AIRCRAFT"}
            </button>
          )}

          {/* Radar animation while analyzing */}
          {stage === "analyzing" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 48, animation: "spin 1.5s linear infinite", display: "inline-block" }}>📡</div>
              <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 11, letterSpacing: 2, marginTop: 10 }}>SCANNING AIRFRAME DATABASE...</div>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div style={{ background: "#3B1A1A", border: "1px solid #8B3A3A", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#FF8B8B", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Result */}
          {stage === "result" && result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* ID card */}
              <div style={{ background: `linear-gradient(135deg, #1B2B4B, #0A0E1A)`, border: `1px solid ${gold}`, borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>
                      🤖 AI IDENTIFICATION · {result.confidence?.toUpperCase()} CONFIDENCE
                    </div>
                    <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 24, fontWeight: 900, letterSpacing: 1 }}>{result.title}</div>
                  </div>
                  <div style={{ fontSize: 36 }}>{result.icon}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  {[
                    ["TYPE", result.type],
                    ["ERA", result.era],
                    ["BRANCH", result.branch || "—"],
                    ["AIRLINE", result.airline || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: "#0A0E1A55", borderRadius: 6, padding: "8px 10px" }}>
                      <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 8, letterSpacing: 2 }}>{k}</div>
                      <div style={{ color: light, fontFamily: "Inter, sans-serif", fontSize: 12, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {result.fun_fact && (
                  <div style={{ background: "#C9A84C11", border: `1px solid #C9A84C44`, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>✈️ FUN FACT</div>
                    <div style={{ color: light, fontFamily: "Inter, sans-serif", fontSize: 12, lineHeight: 1.5 }}>{result.fun_fact}</div>
                  </div>
                )}
              </div>

              {/* Location & date before adding */}
              <div>
                <label style={labelStyle}>WHERE DID YOU SPOT IT?</label>
                <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Miramar Airshow, EAA Oshkosh..." />
              </div>
              <div>
                <label style={labelStyle}>DATE</label>
                <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} />
              </div>

              <button onClick={handleAdd} style={{ width: "100%", background: gold, color: "#0A0E1A", border: "none", borderRadius: 8, padding: "14px", fontFamily: "Oswald, sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>
                ✅ ADD TO MUSEUM LOGBOOK
              </button>
              <button onClick={() => { setStage("ready"); setResult(null); }} style={{ width: "100%", background: "transparent", color: muted, border: `1px solid ${steel}`, borderRadius: 8, padding: "10px", fontFamily: "Roboto Mono, monospace", fontSize: 11, letterSpacing: 1, cursor: "pointer" }}>
                ↩ TRY A DIFFERENT PHOTO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── SLIDESHOW MODE ────────────────────────────────────────────────────────────
const Slideshow = ({ photos, onClose }) => {
  const withImages = photos.filter(p => p.image);
  const allPhotos = withImages.length > 0 ? withImages : photos;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null);

  const go = useCallback((dir) => {
    setFade(false);
    setTimeout(() => {
      setIdx(i => (i + dir + allPhotos.length) % allPhotos.length);
      setFade(true);
    }, 300);
  }, [allPhotos.length]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => go(1), 5000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, go]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") onClose();
      if (e.key === " ") setPlaying(p => !p);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [go, onClose]);

  const current = allPhotos[idx];
  if (!current) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 2000, display: "flex", flexDirection: "column" }}>

      {/* Main image area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {current.image ? (
          <img
            src={current.image}
            alt={current.title}
            style={{ width: "100%", height: "100%", objectFit: "contain", opacity: fade ? 1 : 0, transition: "opacity 0.3s ease" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${current.color}, #0A0E1A)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, opacity: fade ? 1 : 0, transition: "opacity 0.3s ease" }}>
            {current.icon}
          </div>
        )}

        {/* Gradient overlay bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(transparent, rgba(0,0,0,0.9))" }} />

        {/* Top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(rgba(0,0,0,0.7), transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BadgeLogo size={36} />
            <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 3 }}>FAISON FAMILY AIRCRAFT MUSEUM</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${muted}`, color: light, borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Aircraft info overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 32px", opacity: fade ? 1 : 0, transition: "opacity 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ background: steel, color: muted, fontSize: 10, padding: "3px 10px", borderRadius: 3, fontFamily: "Roboto Mono, monospace", letterSpacing: 1 }}>{current.type}</span>
                <span style={{ background: "#C9A84C22", color: gold, fontSize: 10, padding: "3px 10px", borderRadius: 3, fontFamily: "Roboto Mono, monospace" }}>{current.era}</span>
                {current.aiIdentified && <span style={{ background: "#1A3B1A", color: "#4CAF50", fontSize: 10, padding: "3px 10px", borderRadius: 3, fontFamily: "Roboto Mono, monospace" }}>🤖 AI ID</span>}
                {current.favorite && <span style={{ color: gold, fontSize: 16 }}>★</span>}
              </div>
              <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 36, fontWeight: 900, letterSpacing: 2, lineHeight: 1, marginBottom: 8, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{current.title}</div>
              <div style={{ color: muted, fontFamily: "Inter, sans-serif", fontSize: 14, display: "flex", gap: 16 }}>
                {current.location && <span>📍 {current.location}</span>}
                {current.date && <span>📅 {new Date(current.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>}
                {current.branch && <span>🎖️ {current.branch}</span>}
              </div>
              {current.notes && (
                <div style={{ color: "#6A7B9A", fontFamily: "Inter, sans-serif", fontSize: 12, fontStyle: "italic", marginTop: 6, maxWidth: 500 }}>
                  "{current.notes}"
                </div>
              )}
              {current.funFact && (
                <div style={{ color: "#C9A84C99", fontFamily: "Inter, sans-serif", fontSize: 12, marginTop: 6, maxWidth: 500 }}>
                  ✈️ {current.funFact}
                </div>
              )}
            </div>
            {/* Counter */}
            <div style={{ textAlign: "right" }}>
              <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 28, fontWeight: 900 }}>{idx + 1}</div>
              <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 10 }}>of {allPhotos.length}</div>
            </div>
          </div>
        </div>

        {/* Left/Right arrows */}
        {["←", "→"].map((arrow, i) => (
          <button key={arrow} onClick={() => go(i === 0 ? -1 : 1)} style={{
            position: "absolute", top: "50%", [i === 0 ? "left" : "right"]: 20, transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.6)", border: `1px solid ${steel}`, color: light,
            borderRadius: "50%", width: 48, height: 48, fontSize: 20, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.3)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.6)"}
          >{arrow}</button>
        ))}
      </div>

      {/* Bottom controls */}
      <div style={{ background: "rgba(0,0,0,0.9)", borderTop: `1px solid ${steel}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <button onClick={() => go(-1)} style={{ background: steel, border: "none", color: light, borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontFamily: "Roboto Mono, monospace", fontSize: 12 }}>⏮ PREV</button>
        <button onClick={() => setPlaying(p => !p)} style={{ background: playing ? gold : steel, border: "none", color: playing ? "#0A0E1A" : light, borderRadius: 6, padding: "8px 24px", cursor: "pointer", fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1, minWidth: 100 }}>
          {playing ? "⏸ PAUSE" : "▶ PLAY"}
        </button>
        <button onClick={() => go(1)} style={{ background: steel, border: "none", color: light, borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontFamily: "Roboto Mono, monospace", fontSize: 12 }}>NEXT ⏭</button>
        <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 10, marginLeft: 8 }}>5s · ESC to exit · SPACE to pause</div>
      </div>

      {/* Dot indicators */}
      <div style={{ background: "rgba(0,0,0,0.9)", paddingBottom: 12, display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", paddingLeft: 24, paddingRight: 24 }}>
        {allPhotos.map((_, i) => (
          <div key={i} onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 200); }} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? gold : steel, cursor: "pointer", transition: "all 0.3s" }} />
        ))}
      </div>
    </div>
  );
};

// ── DETAIL MODAL ──────────────────────────────────────────────────────────────
const Modal = ({ photo, onClose, onToggleFavorite, onUpdatePhoto, onDelete, onEdit }) => {
  const fileRef = useRef();
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!photo) return null;
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdatePhoto(photo.id, { image: ev.target.result });
    reader.readAsDataURL(file);
  };
  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(photo.id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0D1220", border: `1px solid ${gold}`, borderRadius: 12, maxWidth: 560, width: "100%", overflow: "hidden", boxShadow: "0 0 60px rgba(201,168,76,0.15)" }}>
        <div onClick={() => fileRef.current.click()} style={{ position: "relative", cursor: "pointer" }}>
          {photo.image ? (
            <div style={{ height: 240, overflow: "hidden", position: "relative" }}>
              <img src={photo.image} alt={photo.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.4)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}>
              </div>
            </div>
          ) : (
            <div style={{ height: 200, background: `linear-gradient(160deg, ${photo.color} 0%, #0A0E1A 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, border: `2px dashed #2A3B5A` }}>
              <div style={{ fontSize: 60 }}>{photo.icon}</div>
              <div style={{ background: steel, border: `1px solid ${gold}`, borderRadius: 6, padding: "8px 20px", color: gold, fontFamily: "Oswald, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>📷 UPLOAD PHOTO</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: "absolute", top: 12, right: 12, background: "#0A0E1A99", border: `1px solid ${muted}`, color: light, borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>✕</button>
          {photo.aiIdentified && <div style={{ position: "absolute", top: 12, left: 12, background: "#1A3B1A", border: "1px solid #4CAF50", borderRadius: 4, padding: "3px 8px", color: "#4CAF50", fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 1 }}>🤖 AI IDENTIFIED</div>}
        </div>
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>{photo.type?.toUpperCase()} • {photo.era?.toUpperCase()}</div>
              <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>{photo.title}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <button onClick={() => onToggleFavorite(photo.id)} style={{ background: photo.favorite ? gold : "transparent", border: `1px solid ${gold}`, color: photo.favorite ? "#0A0E1A" : gold, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 1 }}>{photo.favorite ? "★ BEST SHOT" : "☆ MARK BEST"}</button>
              <button onClick={onEdit} style={{ background: "transparent", border: `1px solid ${steel}`, color: muted, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: 1 }}>✏️ EDIT</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              ["LOCATION", "📍 " + photo.location],
              ["DATE", "📅 " + new Date(photo.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
              photo.branch ? ["BRANCH", "🎖️ " + photo.branch] : ["AIRLINE", "✈️ " + (photo.airline || "—")],
              ["ERA", "🕰️ " + photo.era],
            ].map(([label, value]) => (
              <div key={label} style={{ background: "#1B2B4B33", border: `1px solid ${steel}`, borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>{label}</div>
                <div style={{ color: light, fontFamily: "Inter, sans-serif", fontSize: 13 }}>{value}</div>
              </div>
            ))}
          </div>
          {photo.notes && (
            <div style={{ background: "#1B2B4B22", border: `1px solid ${steel}`, borderRadius: 6, padding: "12px 14px", marginBottom: photo.funFact ? 12 : 16 }}>
              <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>FIELD NOTES</div>
              <div style={{ color: muted, fontFamily: "Inter, sans-serif", fontSize: 13, fontStyle: "italic", lineHeight: 1.5 }}>"{photo.notes}"</div>
            </div>
          )}
          {photo.funFact && (
            <div style={{ background: "#C9A84C11", border: `1px solid #C9A84C44`, borderRadius: 6, padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>✈️ FUN FACT</div>
              <div style={{ color: light, fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.5 }}>{photo.funFact}</div>
            </div>
          )}
          <button onClick={() => fileRef.current.click()} style={{ width: "100%", background: "transparent", border: `1px dashed ${steel}`, borderRadius: 6, padding: "10px", cursor: "pointer", color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 11, letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            📷 {photo.image ? "CHANGE PHOTO" : "UPLOAD PHOTO"}
          </button>

          {/* Delete button with confirmation */}
          <button
            onClick={handleDelete}
            onMouseLeave={() => setConfirmDelete(false)}
            style={{ width: "100%", background: confirmDelete ? "#3B1A1A" : "transparent", border: `1px solid ${confirmDelete ? "#8B3A3A" : "#2A3B5A"}`, borderRadius: 6, padding: "10px", cursor: "pointer", color: confirmDelete ? "#FF6B6B" : "#4A5B7A", fontFamily: "Roboto Mono, monospace", fontSize: 11, letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
            🗑️ {confirmDelete ? "TAP AGAIN TO CONFIRM DELETE" : "REMOVE FROM LOGBOOK"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── EDIT MODAL ────────────────────────────────────────────────────────────────
const EditModal = ({ photo, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: photo.title || "",
    type: photo.type || "Fighter",
    era: photo.era || "Modern",
    branch: photo.branch || "USAF",
    airline: photo.airline || "",
    location: photo.location || "",
    date: photo.date || "",
    notes: photo.notes || "",
    icon: photo.icon || "✈️",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSave = () => {
    if (!form.title || !form.location || !form.date) return;
    onSave(photo.id, { ...form });
    onClose();
  };
  const inputStyle = { background: "#0D1628", border: `1px solid ${steel}`, borderRadius: 6, color: light, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };
  const labelStyle = { color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, display: "block", marginBottom: 4 };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0D1220", border: `1px solid ${gold}`, borderRadius: 12, maxWidth: 520, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 0 60px rgba(201,168,76,0.2)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${steel}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 10, letterSpacing: 2 }}>EDIT ENTRY</div>
            <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 20, fontWeight: 700 }}>EDIT AIRCRAFT</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: muted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={labelStyle}>AIRCRAFT NAME *</label><input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. F-14 Tomcat" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>TYPE</label><select style={inputStyle} value={form.type} onChange={e => set("type", e.target.value)}>{["Fighter","Bomber","Transport","Helicopter","Commercial","Gunship","Trainer","Recon"].map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label style={labelStyle}>ERA</label><select style={inputStyle} value={form.era} onChange={e => set("era", e.target.value)}>{["WWII","Cold War","Modern","Historic","Vintage"].map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>BRANCH / SERVICE</label><select style={inputStyle} value={form.branch} onChange={e => set("branch", e.target.value)}>{["USAF","US Navy","US Army","Marine Corps","Coast Guard","NATO","Commercial","Other"].map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label style={labelStyle}>ICON (if no photo)</label><select style={inputStyle} value={form.icon} onChange={e => set("icon", e.target.value)}>{["✈️","🛩️","🚁","🛫","🛬","🪖"].map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div><label style={labelStyle}>AIRLINE (if commercial)</label><input style={inputStyle} value={form.airline} onChange={e => set("airline", e.target.value)} placeholder="e.g. Delta Air Lines" /></div>
          <div><label style={labelStyle}>LOCATION / EVENT *</label><input style={inputStyle} value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. EAA AirVenture, Oshkosh" /></div>
          <div><label style={labelStyle}>DATE *</label><input type="date" style={inputStyle} value={form.date} onChange={e => set("date", e.target.value)} /></div>
          <div><label style={labelStyle}>FIELD NOTES</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="What made this sighting special?" /></div>
          <button onClick={handleSave} style={{ background: gold, color: "#0A0E1A", border: "none", borderRadius: 6, padding: "12px", fontFamily: "Oswald, sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, cursor: "pointer", marginTop: 4 }}>SAVE CHANGES</button>
          <button onClick={onClose} style={{ background: "transparent", color: muted, border: `1px solid ${steel}`, borderRadius: 6, padding: "10px", fontFamily: "Roboto Mono, monospace", fontSize: 11, letterSpacing: 1, cursor: "pointer" }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
};

// ── ADD PHOTO MODAL ───────────────────────────────────────────────────────────
const AddPhotoModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ title: "", type: "Fighter", era: "Modern", branch: "USAF", airline: "", location: "", date: "", notes: "", icon: "✈️", image: null });
  const fileRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("image", ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleSubmit = () => {
    if (!form.title || !form.location || !form.date) return;
    onAdd({ ...form, id: Date.now(), favorite: false, color: ["#1B3A5C","#3B2F1E","#1A3B2F","#1A1A3B","#2A1A3B","#1A2F1A"][Math.floor(Math.random()*6)] });
    onClose();
  };
  const inputStyle = { background: "#0D1628", border: `1px solid ${steel}`, borderRadius: 6, color: light, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };
  const labelStyle = { color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, display: "block", marginBottom: 4 };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0D1220", border: `1px solid ${gold}`, borderRadius: 12, maxWidth: 520, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 0 60px rgba(201,168,76,0.15)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${steel}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 10, letterSpacing: 2 }}>NEW ENTRY</div>
            <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 20, fontWeight: 700 }}>LOG AN AIRCRAFT</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: muted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>PHOTO</label>
            <div onClick={() => fileRef.current.click()} style={{ border: `2px dashed ${form.image ? gold : steel}`, borderRadius: 8, height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative", background: form.image ? "transparent" : "#0D1628" }}>
              {form.image ? (
                <><img src={form.image} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <div style={{ fontSize: 28 }}>📷</div><div style={{ color: light, fontFamily: "Roboto Mono, monospace", fontSize: 10 }}>CHANGE PHOTO</div>
                  </div></>
              ) : (
                <><div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                  <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>UPLOAD PHOTO</div>
                  <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 9, marginTop: 4 }}>Click to browse · JPG, PNG, HEIC</div></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          </div>
          <div><label style={labelStyle}>AIRCRAFT NAME *</label><input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. F-14 Tomcat" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>TYPE</label><select style={inputStyle} value={form.type} onChange={e => set("type", e.target.value)}>{["Fighter","Bomber","Transport","Helicopter","Commercial","Gunship","Trainer","Recon"].map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label style={labelStyle}>ERA</label><select style={inputStyle} value={form.era} onChange={e => set("era", e.target.value)}>{["WWII","Cold War","Modern","Historic","Vintage"].map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>BRANCH / SERVICE</label><select style={inputStyle} value={form.branch} onChange={e => set("branch", e.target.value)}>{["USAF","US Navy","US Army","Marine Corps","Coast Guard","NATO","Commercial","Other"].map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label style={labelStyle}>ICON (if no photo)</label><select style={inputStyle} value={form.icon} onChange={e => set("icon", e.target.value)}>{["✈️","🛩️","🚁","🛫","🛬","🪖"].map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div><label style={labelStyle}>AIRLINE (if commercial)</label><input style={inputStyle} value={form.airline} onChange={e => set("airline", e.target.value)} placeholder="e.g. Delta Air Lines" /></div>
          <div><label style={labelStyle}>LOCATION / EVENT *</label><input style={inputStyle} value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. EAA AirVenture, Oshkosh" /></div>
          <div><label style={labelStyle}>DATE *</label><input type="date" style={inputStyle} value={form.date} onChange={e => set("date", e.target.value)} /></div>
          <div><label style={labelStyle}>FIELD NOTES</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="What made this sighting special?" /></div>
          <button onClick={handleSubmit} style={{ background: gold, color: "#0A0E1A", border: "none", borderRadius: 6, padding: "12px", fontFamily: "Oswald, sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, cursor: "pointer", marginTop: 4 }}>ADD TO MUSEUM LOGBOOK</button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [photos, setPhotosRaw] = useState(loadPhotos);
  const [view, setView] = useState("home");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterEra, setFilterEra] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");
  const [search, setSearch] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);

  // Wrap setPhotos so every change auto-saves to localStorage
  const setPhotos = (updater) => {
    setPhotosRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      savePhotos(next);
      return next;
    });
  };

  const toggleFavorite = (id) => {
    setPhotos(ps => ps.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p));
    setSelectedPhoto(sp => sp && sp.id === id ? { ...sp, favorite: !sp.favorite } : sp);
  };
  const updatePhoto = (id, updates) => {
    setPhotos(ps => ps.map(p => p.id === id ? { ...p, ...updates } : p));
    setSelectedPhoto(sp => sp && sp.id === id ? { ...sp, ...updates } : sp);
  };
  const addPhoto = (photo) => setPhotos(ps => [photo, ...ps]);

  const deletePhoto = (id) => {
    setPhotos(ps => ps.filter(p => p.id !== id));
    setSelectedPhoto(null);
  };

  const editPhoto = (id, updates) => {
    setPhotos(ps => ps.map(p => p.id === id ? { ...p, ...updates } : p));
    setSelectedPhoto(sp => sp && sp.id === id ? { ...sp, ...updates } : sp);
  };

  const filtered = photos.filter(p => {
    if (filterType !== "All" && p.type !== filterType) return false;
    if (filterEra !== "All" && p.era !== filterEra) return false;
    if (filterBranch !== "All" && p.branch !== filterBranch) return false;
    if (showFavOnly && !p.favorite) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: photos.length,
    uniqueTypes: [...new Set(photos.map(p => p.title))].length,
    locations: [...new Set(photos.map(p => p.location))].length,
    favorites: photos.filter(p => p.favorite).length,
    withPhotos: photos.filter(p => p.image).length,
    aiIdentified: photos.filter(p => p.aiIdentified).length,
    byType: AIRCRAFT_TYPES.slice(1).map(t => ({ label: t, count: photos.filter(p => p.type === t).length })).filter(x => x.count > 0),
    byEra: ERAS.slice(1).map(t => ({ label: t, count: photos.filter(p => p.era === t).length })).filter(x => x.count > 0),
  };

  const navItems = [
    { id: "home", icon: "🏠", label: "HOME" },
    { id: "gallery", icon: "📸", label: "GALLERY" },
    { id: "stats", icon: "📊", label: "INTEL" },
    { id: "logbook", icon: "📋", label: "LOGBOOK" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: bg, color: light, fontFamily: "Inter, sans-serif", paddingBottom: 80 }}>

      {/* Top bar */}
      <div style={{ background: "#0D1220", borderBottom: `1px solid ${steel}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BadgeLogo size={40} />
          <div>
            <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, lineHeight: 1 }}>FAISON FAMILY</div>
            <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 3 }}>AIRCRAFT MUSEUM</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSlideshow(true)} style={{ background: steel, color: light, border: "none", borderRadius: 6, padding: "8px 14px", fontFamily: "Oswald, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>▶ SLIDESHOW</button>
          <button onClick={() => setShowAI(true)} style={{ background: "#1A3B1A", color: "#4CAF50", border: "1px solid #2A6A2A", borderRadius: 6, padding: "8px 14px", fontFamily: "Oswald, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>🤖 AI ID</button>
          <button onClick={() => setShowAdd(true)} style={{ background: gold, color: "#0A0E1A", border: "none", borderRadius: 6, padding: "8px 16px", fontFamily: "Oswald, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>+ LOG</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>

        {/* HOME */}
        {view === "home" && (
          <div>
            <div style={{ textAlign: "center", padding: "48px 20px 36px", background: `radial-gradient(ellipse at center top, #1B2B4B44 0%, transparent 70%)` }}>
              <BadgeLogo size={150} />
              <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 32, fontWeight: 900, letterSpacing: 4, marginTop: 20 }}>FAISON FAMILY</div>
              <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 22, letterSpacing: 5, marginBottom: 8 }}>AIRCRAFT MUSEUM</div>
              <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 11, letterSpacing: 2 }}>1:48 SCALE · HISTORY IN MINIATURE</div>
              <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 10, marginTop: 4, letterSpacing: 2 }}>BUILT WITH PASSION · DISPLAYED WITH PRIDE</div>

              {/* Hero action buttons */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
                <button onClick={() => setShowSlideshow(true)} style={{ background: steel, border: `1px solid ${gold}`, color: gold, borderRadius: 8, padding: "12px 24px", fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>▶ LAUNCH SLIDESHOW</button>
                <button onClick={() => setShowAI(true)} style={{ background: "#1A3B1A", border: "1px solid #4CAF50", color: "#4CAF50", borderRadius: 8, padding: "12px 24px", fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>🤖 IDENTIFY AIRCRAFT</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "AIRCRAFT LOGGED", value: stats.total, icon: "✈️" },
                { label: "UNIQUE TYPES", value: stats.uniqueTypes, icon: "🏷️" },
                { label: "LOCATIONS", value: stats.locations, icon: "📍" },
                { label: "AI IDENTIFIED", value: stats.aiIdentified, icon: "🤖" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0D1628", border: `1px solid ${steel}`, borderRadius: 8, padding: "16px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 28, fontWeight: 900 }}>{s.value}</div>
                  <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 8, letterSpacing: 1.5, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Empty state — first time welcome */}
            {photos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ background: "#0D1628", border: `1px dashed ${steel}`, borderRadius: 16, padding: "48px 32px", maxWidth: 480, margin: "0 auto" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>✈️</div>
                  <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>WELCOME TO THE MUSEUM</div>
                  <div style={{ color: muted, fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                    Your logbook is empty and ready for its first entry. Log an aircraft manually, or let the AI identify one from a photo!
                  </div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setShowAdd(true)} style={{ background: gold, color: "#0A0E1A", border: "none", borderRadius: 8, padding: "12px 24px", fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>+ LOG AIRCRAFT</button>
                    <button onClick={() => setShowAI(true)} style={{ background: "#1A3B1A", color: "#4CAF50", border: "1px solid #2A6A2A", borderRadius: 8, padding: "12px 24px", fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>🤖 AI IDENTIFY</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2 }}>RECENTLY LOGGED</div>
                    <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 700 }}>Latest Sightings</div>
                  </div>
                  <button onClick={() => setView("gallery")} style={{ background: "none", border: `1px solid ${steel}`, color: muted, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "Roboto Mono, monospace", fontSize: 10, letterSpacing: 1 }}>VIEW ALL →</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                  {photos.slice(0, 3).map(p => <PlaneCard key={p.id} photo={p} onClick={setSelectedPhoto} onToggleFavorite={toggleFavorite} />)}
                </div>
                {photos.filter(p => p.favorite).length > 0 && (
                  <>
                    <div style={{ marginTop: 32, marginBottom: 12 }}>
                      <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2 }}>COMMANDER'S SELECTION</div>
                      <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 700 }}>Best Shots ★</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                      {photos.filter(p => p.favorite).map(p => <PlaneCard key={p.id} photo={p} onClick={setSelectedPhoto} onToggleFavorite={toggleFavorite} />)}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* GALLERY */}
        {view === "gallery" && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>PHOTO ARCHIVE</div>
                <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 26, fontWeight: 700 }}>Field Gallery</div>
              </div>
              <button onClick={() => setShowSlideshow(true)} style={{ background: steel, border: `1px solid ${gold}`, color: gold, padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontFamily: "Oswald, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>▶ SLIDESHOW</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search aircraft or location..." style={{ background: "#0D1628", border: `1px solid ${steel}`, borderRadius: 6, color: light, padding: "8px 14px", fontFamily: "Inter, sans-serif", fontSize: 13, flex: "1 1 200px", outline: "none" }} />
              {[
                { options: AIRCRAFT_TYPES, val: filterType, set: setFilterType },
                { options: ERAS, val: filterEra, set: setFilterEra },
                { options: BRANCHES, val: filterBranch, set: setFilterBranch },
              ].map((f, i) => (
                <select key={i} value={f.val} onChange={e => f.set(e.target.value)} style={{ background: "#0D1628", border: `1px solid ${steel}`, borderRadius: 6, color: f.val === "All" ? muted : gold, padding: "8px 12px", fontFamily: "Roboto Mono, monospace", fontSize: 11, outline: "none" }}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
              <button onClick={() => setShowFavOnly(!showFavOnly)} style={{ background: showFavOnly ? gold : "transparent", border: `1px solid ${gold}`, color: showFavOnly ? "#0A0E1A" : gold, borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontFamily: "Roboto Mono, monospace", fontSize: 11, letterSpacing: 1 }}>★ BEST</button>
            </div>
            <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 10, letterSpacing: 1, marginBottom: 16 }}>{filtered.length} AIRCRAFT IN ARCHIVE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {filtered.map(p => <PlaneCard key={p.id} photo={p} onClick={setSelectedPhoto} onToggleFavorite={toggleFavorite} />)}
            </div>
          </div>
        )}

        {/* INTEL */}
        {view === "stats" && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>MISSION DEBRIEF</div>
              <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 26, fontWeight: 700 }}>Aviation Intel</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "TOTAL AIRCRAFT LOGGED", value: stats.total, sub: "and counting", icon: "✈️" },
                { label: "UNIQUE AIRCRAFT TYPES", value: stats.uniqueTypes, sub: "distinct airframes", icon: "🏷️" },
                { label: "AIRSHOWS & LOCATIONS", value: stats.locations, sub: "sites visited", icon: "📍" },
                { label: "AI IDENTIFIED", value: stats.aiIdentified, sub: "by Claude AI", icon: "🤖" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0D1628", border: `1px solid ${steel}`, borderRadius: 10, padding: "20px" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 42, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginTop: 6 }}>{s.label}</div>
                  <div style={{ color: "#4A5B7A", fontFamily: "Inter, sans-serif", fontSize: 11, marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 12 }}>BREAKDOWN BY TYPE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.byType.map(({ label, count }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 11, width: 90 }}>{label}</div>
                    <div style={{ flex: 1, background: steel, borderRadius: 3, height: 12, overflow: "hidden" }}>
                      <div style={{ width: `${(count/stats.total)*100}%`, height: "100%", background: `linear-gradient(90deg, ${gold}, #C9A84C88)`, borderRadius: 3 }} />
                    </div>
                    <div style={{ color: gold, fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, width: 24, textAlign: "right" }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 12 }}>BREAKDOWN BY ERA</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.byEra.map(({ label, count }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ color: muted, fontFamily: "Roboto Mono, monospace", fontSize: 11, width: 90 }}>{label}</div>
                    <div style={{ flex: 1, background: steel, borderRadius: 3, height: 12, overflow: "hidden" }}>
                      <div style={{ width: `${(count/stats.total)*100}%`, height: "100%", background: "linear-gradient(90deg, #4A7BC4, #4A7BC488)", borderRadius: 3 }} />
                    </div>
                    <div style={{ color: "#4A7BC4", fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, width: 24, textAlign: "right" }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #1B3A1B, #0A0E1A)", border: "1px solid #2A6A2A", borderRadius: 10, padding: "20px 24px" }}>
              <div style={{ color: "#4CAF50", fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>🎖️ MILESTONE UNLOCKED</div>
              <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 700 }}>{stats.total >= 5 ? "Seasoned Spotter" : "Taking Flight"}</div>
              <div style={{ color: muted, fontFamily: "Inter, sans-serif", fontSize: 13, marginTop: 6 }}>
                {stats.total >= 5 ? `${stats.total} aircraft logged across ${stats.locations} locations. The museum is growing!` : `Log ${5 - stats.total} more aircraft to unlock "Seasoned Spotter"`}
              </div>
            </div>
          </div>
        )}

        {/* LOGBOOK */}
        {view === "logbook" && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ color: gold, fontFamily: "Roboto Mono, monospace", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>FIELD RECORDS</div>
                <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 26, fontWeight: 700 }}>Flight Logbook</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAI(true)} style={{ background: "#1A3B1A", color: "#4CAF50", border: "1px solid #2A6A2A", borderRadius: 6, padding: "8px 14px", fontFamily: "Oswald, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>🤖 AI ID</button>
                <button onClick={() => setShowAdd(true)} style={{ background: gold, color: "#0A0E1A", border: "none", borderRadius: 6, padding: "8px 16px", fontFamily: "Oswald, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>+ ADD</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[...photos].sort((a, b) => new Date(b.date) - new Date(a.date)).map((p, i) => (
                <div key={p.id} onClick={() => setSelectedPhoto(p)} style={{ display: "grid", gridTemplateColumns: "48px 80px 1fr auto", background: i % 2 === 0 ? "#0D1220" : "#0A0E1A", border: `1px solid ${steel}`, borderRadius: 6, padding: "10px 16px", cursor: "pointer", alignItems: "center", gap: 12, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1B2B4B33"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#0D1220" : "#0A0E1A"}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 4, overflow: "hidden", background: p.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {p.image ? <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : p.icon}
                  </div>
                  <div style={{ fontFamily: "Roboto Mono, monospace", fontSize: 11, color: muted }}>
                    {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    <div style={{ fontSize: 10, color: "#4A5B7A" }}>{new Date(p.date).getFullYear()}</div>
                  </div>
                  <div>
                    <div style={{ color: light, fontFamily: "Oswald, sans-serif", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      {p.title} {p.favorite && <span style={{ color: gold, fontSize: 12 }}>★</span>} {p.aiIdentified && <span style={{ color: "#4CAF50", fontSize: 10, fontFamily: "Roboto Mono, monospace" }}>🤖</span>}
                    </div>
                    <div style={{ color: muted, fontFamily: "Inter, sans-serif", fontSize: 11, marginTop: 2 }}>{p.location}</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <div style={{ background: steel, color: muted, fontSize: 9, padding: "3px 8px", borderRadius: 3, fontFamily: "Roboto Mono, monospace", letterSpacing: 1 }}>{p.type}</div>
                    <div style={{ color: "#4A5B7A", fontSize: 10, fontFamily: "Roboto Mono, monospace" }}>{p.era}</div>
                    <button
                      onClick={e => { e.stopPropagation(); if (window.confirm(`Remove "${p.title}" from the logbook?`)) deletePhoto(p.id); }}
                      style={{ background: "transparent", border: "1px solid #2A3B5A", color: "#4A5B7A", borderRadius: 4, padding: "2px 8px", fontSize: 10, cursor: "pointer", fontFamily: "Roboto Mono, monospace", letterSpacing: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#8B3A3A"; e.currentTarget.style.color = "#FF6B6B"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A3B5A"; e.currentTarget.style.color = "#4A5B7A"; }}
                    >🗑️ DEL</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0D1220", borderTop: `1px solid ${steel}`, display: "flex", justifyContent: "space-around", padding: "10px 0 14px", zIndex: 100 }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 16px" }}>
            <div style={{ fontSize: 20 }}>{n.icon}</div>
            <div style={{ fontFamily: "Roboto Mono, monospace", fontSize: 8, letterSpacing: 1.5, color: view === n.id ? gold : muted, borderBottom: view === n.id ? `1px solid ${gold}` : "1px solid transparent", paddingBottom: 2 }}>{n.label}</div>
          </button>
        ))}
      </div>

      {/* Modals */}
      {selectedPhoto && <Modal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} onToggleFavorite={toggleFavorite} onUpdatePhoto={updatePhoto} onDelete={deletePhoto} onEdit={() => setShowEdit(true)} />}
      {showEdit && selectedPhoto && <EditModal photo={selectedPhoto} onClose={() => setShowEdit(false)} onSave={editPhoto} />}
      {showAdd && <AddPhotoModal onClose={() => setShowAdd(false)} onAdd={addPhoto} />}
      {showAI && <AIIdentifierModal onClose={() => setShowAI(false)} onAddIdentified={addPhoto} />}
      {showSlideshow && <Slideshow photos={photos} onClose={() => setShowSlideshow(false)} />}
    </div>
  );
}
