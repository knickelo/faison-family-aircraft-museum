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
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
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
    <circle cx="100" cy="100" r="78" fill="none" stroke="#0B0F1E" strokeWidth="1.2" />

    {/* Top arc text — in the band between inner ring (r=78) and outer ring (r=95), midpoint r=86 */}
    <path id="tArcFull" d="M 14 100 A 86 86 0 0 1 186 100" fill="none" />
    <text fontFamily="Arial, sans-serif" fontSize="6.5" fill="#0B0F1E" fontWeight="bold" letterSpacing="1.2">
      <textPath href="#tArcFull" startOffset="50%" textAnchor="middle">1:48 SCALE  ✦  HISTORY IN MINIATURE</textPath>
    </text>

    {/* W-FORMATION PLANES — centered between inner ring top and ribbon */}
    {/* Center plane — moved up, nose near inner ring top */}
    <g transform="translate(100, 60) scale(0.5)">
      <ellipse cx="0" cy="0" rx="4" ry="22" fill="#0B0F1E" />
      <polygon points="0,-4 -30,8 -26,15 0,4 26,15 30,8" fill="#0B0F1E" />
      <polygon points="0,13 -13,21 -11,25 0,17 11,25 13,21" fill="#0B0F1E" />
    </g>
    {/* Left plane — in close, W shape, moved up */}
    <g transform="translate(68, 70) rotate(-20) scale(0.36)">
      <ellipse cx="0" cy="0" rx="4" ry="20" fill="#0B0F1E" />
      <polygon points="0,-4 -26,7 -22,13 0,3 22,13 26,7" fill="#0B0F1E" />
      <polygon points="0,11 -11,18 -9,22 0,15 9,22 11,18" fill="#0B0F1E" />
    </g>
    {/* Right plane — in close, W shape, moved up */}
    <g transform="translate(132, 70) rotate(20) scale(0.36)">
      <ellipse cx="0" cy="0" rx="4" ry="20" fill="#0B0F1E" />
      <polygon points="0,-4 -26,7 -22,13 0,3 22,13 26,7" fill="#0B0F1E" />
      <polygon points="0,11 -11,18 -9,22 0,15 9,22 11,18" fill="#0B0F1E" />
    </g>

    {/* Navy ribbon — taller to show AIRCRAFT MUSEUM, points centered */}
    <rect x="22" y="90" width="156" height="50" fill="#0B0F1E" />
    {/* Left point — tip centered at y=115 */}
    <polygon points="22,90 22,140 4,115" fill="#0B0F1E" />
    {/* Right point */}
    <polygon points="178,90 178,140 196,115" fill="#0B0F1E" />
    {/* Darker wing accents */}
    <polygon points="22,90 22,115 4,115" fill="#1B2B4B" />
    <polygon points="178,90 178,115 196,115" fill="#1B2B4B" />

    {/* FAISON */}
    <text x="100" y="112" textAnchor="middle" fill="#C9A84C" fontSize="22" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif" letterSpacing="4">FAISON</text>
    {/* Divider */}
    <line x1="32" y1="116" x2="168" y2="116" stroke="#C9A84C" strokeWidth="0.6" opacity="0.5" />
    {/* FAMILY */}
    <text x="100" y="126" textAnchor="middle" fill="#C9A84C" fontSize="9.5" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="4">FAMILY</text>
    {/* Divider */}
    <line x1="32" y1="129" x2="168" y2="129" stroke="#C9A84C" strokeWidth="0.5" opacity="0.4" />
    {/* AIRCRAFT MUSEUM */}
    <text x="100" y="137" textAnchor="middle" fill="#C9A84C" fontSize="6.5" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="2">AIRCRAFT MUSEUM</text>

    {/* Star — centered between ribbon bottom and bottom text */}
    <circle cx="100" cy="160" r="9" fill="#C9A84C" stroke="#0B0F1E" strokeWidth="1.8" />
    <polygon points="100,153 101.7,158 107,158 102.8,161 104.3,166 100,163 95.7,166 97.2,161 93,158 98.3,158" fill="#0B0F1E" />

    {/* Bottom arc text — in the band between inner ring (r=78) and outer ring (r=95), midpoint r=86 */}
    <path id="bArcFull" d="M 14 100 A 86 86 0 0 0 186 100" fill="none" />
    <text fontFamily="Arial, sans-serif" fontSize="6.5" fill="#0B0F1E" fontWeight="bold" letterSpacing="1">
      <textPath href="#bArcFull" startOffset="50%" textAnchor="middle">BUILT WITH PASSION  ✦  DISPLAYED WITH PRIDE</textPath>
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
