import { useState, useMemo } from "react";

// ── Generate 50 dummy soldiers ──────────────────────────────────────────────
const RANKS = ["PVT","PFC","SPC","CPL","SGT","SSG","SFC","MSG","1SG","WO1","CW2","2LT","1LT","CPT","MAJ"];
const NAMES = [
  "Arjun Sharma","Vikram Verma","Rajesh Singh","Amit Patel","Suresh Kumar",
  "Rohit Gupta","Sandeep Yadav","Pradeep Mishra","Nikhil Chauhan","Manoj Tiwari",
  "Deepak Pandey","Sanjay Joshi","Venkatesh Rao","Arun Nair","Sunil Pillai",
  "Anand Menon","Kiran Reddy","Ramesh Iyer","Sudhir Bhat","Prashanth Kulkarni",
  "Nitin Desai","Harsh Shah","Vivek Mehta","Subhash Chowdhury","Biplab Das",
  "Sourav Bose","Debashish Mukherjee","Arnab Banerjee","Suman Ghosh","Rahul Sen",
  "Ajay Thakur","Yogesh Rajput","Mahendra Rathore","Gaurav Bhatt","Alok Tripathi",
  "Shivam Dubey","Ashish Shukla","Manish Saxena","Piyush Agarwal","Rajan Malhotra",
  "Varun Kapoor","Akash Khanna","Ishaan Chopra","Tushar Sinha","Hemant Prasad",
  "Srikanth Naidu","Karthik Hegde","Omkar Patil","Sachin Pawar","Abhijit Jadhav"
];

function genSoldiers() {
  return Array.from({ length: 50 }, (_, i) => {
    const readiness = Math.floor(Math.random() * 100);
    const status = readiness > 75 ? "GO" : readiness >= 50 ? "CAUTION" : "NO-GO";
    const hr     = Math.floor(Math.random() * 40 + 60);   // 60–100
    const hrv    = Math.floor(Math.random() * 60 + 20);   // 20–80
    const sleep  = +(Math.random() * 4 + 4).toFixed(1);   // 4–8 hrs
    const stress = +(Math.random() * 8 + 1).toFixed(1);   // 1–9
    const anomaly = i === 1 || i === 3;                    // Soldier 2 & 4 have anomalies
    return {
      id: `${String(i + 1).padStart(3, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`,
      numericId: i + 1,
      name: NAMES[i],
      rank: RANKS[Math.floor(Math.random() * RANKS.length)],
      readiness,
      status,
      unit: `${Math.floor(Math.random() * 3 + 1)}-${["INF","CAV","FA","EN","MI"][Math.floor(Math.random()*5)]}`,
      mos: ["11B","12B","13F","25U","35F","68W","91A","42A"][Math.floor(Math.random()*8)],
      heart_rate:   hr,
      hrv:          hrv,
      sleep_hours:  sleep,
      stress_score: stress,
      anomaly_flag: anomaly,
      anomaly_reason: anomaly
        ? hr > 90  ? "Heart rate elevated — possible stress response"
        : hrv < 35 ? "HRV critically low — fatigue detected"
        : "Sleep deficit detected — below recovery threshold"
        : "",
      // History: 10 days of fake data
      history: Array.from({ length: 10 }, (_, d) => ({
        day: d + 1,
        heart_rate:   hr + Math.floor(Math.random() * 10 - 5),
        hrv:          hrv + Math.floor(Math.random() * 10 - 5),
        sleep_hours:  +(sleep + (Math.random() * 2 - 1)).toFixed(1),
        stress_score: +(stress + (Math.random() * 2 - 1)).toFixed(1),
        readiness_score: Math.max(10, readiness + Math.floor(Math.random() * 20 - 10)),
      })),
    };
  });
}

const SOLDIERS = genSoldiers();

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  GO:      { border: "#22c55e", badge: "#166534", badgeBg: "#dcfce7", glow: "0 0 12px rgba(34,197,94,0.4)",  dot: "#22c55e" },
  CAUTION: { border: "#eab308", badge: "#713f12", badgeBg: "#fef9c3", glow: "0 0 12px rgba(234,179,8,0.4)",  dot: "#eab308" },
  "NO-GO": { border: "#ef4444", badge: "#7f1d1d", badgeBg: "#fee2e2", glow: "0 0 12px rgba(239,68,68,0.4)",  dot: "#ef4444" },
};

// ── Metric Row (used in DetailPanel) ─────────────────────────────────────────
function MetricRow({ label, value, unit, normal, color = "#22d3ee" }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: "1px solid #1e2d40",
    }}>
      <div>
        <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 2 }}>{label}</div>
        <div style={{ color: "#475569", fontSize: 8, marginTop: 1 }}>NORMAL: {normal}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <span style={{ color, fontSize: 18, fontWeight: 700 }}>{value}</span>
        <span style={{ color: "#475569", fontSize: 9, marginLeft: 4 }}>{unit}</span>
      </div>
    </div>
  );
}

// ── Recovery Timeline ─────────────────────────────────────────────────────────
function RecoveryTimeline({ readiness }) {
  const steps = [
    { label: "NOW",   hours: 0,  score: readiness },
    { label: "+4H",   hours: 4,  score: Math.min(100, readiness + 8) },
    { label: "+8H",   hours: 8,  score: Math.min(100, readiness + 15) },
    { label: "+24H",  hours: 24, score: Math.min(100, readiness + 22) },
    { label: "+72H",  hours: 72, score: Math.min(100, readiness + 30) },
  ];
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 3, marginBottom: 10 }}>
        RECOVERY TIMELINE (PROJECTED)
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        {steps.map((s, i) => {
          const color = s.score > 75 ? "#22c55e" : s.score >= 50 ? "#eab308" : "#ef4444";
          return (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ color, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{s.score}%</div>
              <div style={{
                height: `${(s.score / 100) * 60}px`,
                background: `linear-gradient(180deg, ${color}44, ${color}22)`,
                border: `1px solid ${color}66`,
                borderRadius: "2px 2px 0 0",
                minHeight: 6,
              }} />
              <div style={{ color: "#475569", fontSize: 8, marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Day History Sparkline ─────────────────────────────────────────────────────
function Sparkline({ history }) {
  const max = Math.max(...history.map(h => h.readiness_score));
  const min = Math.min(...history.map(h => h.readiness_score));
  const H = 40, W = 200;
  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - ((h.readiness_score - min) / (max - min + 1)) * H;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 3, marginBottom: 8 }}>
        10-DAY READINESS TREND
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <polyline
          points={points}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {history.map((h, i) => {
          const x = (i / (history.length - 1)) * W;
          const y = H - ((h.readiness_score - min) / (max - min + 1)) * H;
          return (
            <circle key={i} cx={x} cy={y} r="2.5"
              fill={h.readiness_score > 75 ? "#22c55e" : h.readiness_score >= 50 ? "#eab308" : "#ef4444"}
            />
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ color: "#334155", fontSize: 8 }}>DAY 1</span>
        <span style={{ color: "#334155", fontSize: 8 }}>DAY 10</span>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({ soldier, onClose }) {
  if (!soldier) return null;
  const cfg = STATUS_CONFIG[soldier.status];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)",
        zIndex: 200,
      }} />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 95vw)",
        background: "linear-gradient(180deg, #0d1117 0%, #0b0f1a 100%)",
        borderLeft: `1px solid ${cfg.border}44`,
        boxShadow: `-8px 0 32px rgba(0,0,0,0.6)`,
        zIndex: 300,
        overflowY: "auto",
        fontFamily: "'Share Tech Mono', monospace",
        padding: "24px 20px",
        animation: "slideIn 0.25s ease",
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "transparent", border: "1px solid #1e3a5f",
          color: "#64748b", cursor: "pointer", borderRadius: 3,
          width: 28, height: 28, fontSize: 14, fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>

        {/* Header */}
        <div style={{ marginBottom: 20, paddingRight: 36 }}>
          <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 3, marginBottom: 6 }}>
            SOLDIER PROFILE · ID {soldier.id}
          </div>
          <div style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
            {soldier.rank} {soldier.name.toUpperCase()}
          </div>
          <div style={{ color: "#475569", fontSize: 9, letterSpacing: 2, marginTop: 2 }}>
            {soldier.unit} · MOS {soldier.mos}
          </div>
        </div>

        {/* Status + Readiness */}
        <div style={{
          background: `${cfg.border}11`,
          border: `1px solid ${cfg.border}44`,
          borderRadius: 6, padding: "14px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 20,
        }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 2 }}>COMBAT STATUS</div>
            <div style={{ color: cfg.border, fontSize: 22, fontWeight: 700, letterSpacing: 3, marginTop: 2 }}>
              {soldier.status}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 2 }}>READINESS</div>
            <div style={{ color: cfg.border, fontSize: 32, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>
              {soldier.readiness}%
            </div>
          </div>
        </div>

        {/* Anomaly Alert */}
        {soldier.anomaly_flag && (
          <div style={{
            background: "#7f1d1d22", border: "1px solid #ef444488",
            borderRadius: 6, padding: "10px 14px", marginBottom: 20,
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 16, marginTop: 1 }}>⚠️</span>
            <div>
              <div style={{ color: "#ef4444", fontSize: 9, letterSpacing: 2, fontWeight: 700 }}>
                ANOMALY DETECTED
              </div>
              <div style={{ color: "#fca5a5", fontSize: 10, marginTop: 3, lineHeight: 1.5 }}>
                {soldier.anomaly_reason}
              </div>
            </div>
          </div>
        )}

        {/* Biometrics */}
        <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>
          BIOMETRIC READINGS
        </div>
        <MetricRow
          label="HEART RATE" value={soldier.heart_rate} unit="BPM"
          normal="60–100 BPM"
          color={soldier.heart_rate > 95 ? "#ef4444" : soldier.heart_rate > 85 ? "#eab308" : "#22c55e"}
        />
        <MetricRow
          label="HEART RATE VARIABILITY (HRV)" value={soldier.hrv} unit="ms"
          normal="40–80 ms"
          color={soldier.hrv < 30 ? "#ef4444" : soldier.hrv < 45 ? "#eab308" : "#22c55e"}
        />
        <MetricRow
          label="SLEEP" value={soldier.sleep_hours} unit="hrs"
          normal="7–9 hrs"
          color={soldier.sleep_hours < 5 ? "#ef4444" : soldier.sleep_hours < 6.5 ? "#eab308" : "#22c55e"}
        />
        <MetricRow
          label="STRESS SCORE" value={soldier.stress_score} unit="/ 10"
          normal="1–4 (low)"
          color={soldier.stress_score > 7 ? "#ef4444" : soldier.stress_score > 5 ? "#eab308" : "#22c55e"}
        />

        {/* Sparkline */}
        <Sparkline history={soldier.history} />

        {/* Recovery Timeline */}
        <RecoveryTimeline readiness={soldier.readiness} />

        {/* Footer note */}
        <div style={{
          marginTop: 24, padding: "10px 14px",
          background: "#0f172a", border: "1px solid #1e2d40",
          borderRadius: 4, color: "#334155", fontSize: 8, letterSpacing: 1.5, lineHeight: 1.8,
        }}>
          ⚡ LIVE DATA VIA CRIS BIOMETRIC PIPELINE<br />
          🔒 CLASSIFIED — AUTHORIZED PERSONNEL ONLY<br />
          📡 BACKEND: CONNECTING TO localhost:8000
        </div>
      </div>
    </>
  );
}

// ── SoldierCard ───────────────────────────────────────────────────────────────
function SoldierCard({ soldier, onClick }) {
  const cfg = STATUS_CONFIG[soldier.status];
  const pct = soldier.readiness;

  return (
    <div
      onClick={() => onClick(soldier)}
      style={{
        background: "linear-gradient(145deg, #1a1f2e, #141824)",
        border: `1.5px solid ${cfg.border}`,
        boxShadow: cfg.glow,
        borderRadius: 8,
        padding: "14px 16px",
        fontFamily: "'Share Tech Mono', monospace",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.15s, box-shadow 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
        e.currentTarget.style.boxShadow = `${cfg.glow}, 0 8px 24px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = cfg.glow;
      }}
    >
      {/* Corner accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 0, height: 0, borderStyle: "solid",
        borderWidth: "0 28px 28px 0",
        borderColor: `transparent ${cfg.border} transparent transparent`,
        opacity: 0.6,
      }} />

      {/* Anomaly indicator */}
      {soldier.anomaly_flag && (
        <div style={{
          position: "absolute", top: 6, left: 6,
          background: "#ef444422", border: "1px solid #ef444466",
          borderRadius: 3, padding: "1px 5px",
          color: "#ef4444", fontSize: 7, letterSpacing: 1,
        }}>⚠ ANOMALY</div>
      )}

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, marginTop: soldier.anomaly_flag ? 14 : 0 }}>
        <div>
          <div style={{ color: "#94a3b8", fontSize: 9, letterSpacing: 2, marginBottom: 2 }}>SOLDIER ID</div>
          <div style={{ color: "#e2e8f0", fontSize: 11, letterSpacing: 1 }}>{soldier.id}</div>
        </div>
        <span style={{
          background: cfg.badgeBg, color: cfg.badge,
          fontSize: 9, fontWeight: 700, letterSpacing: 2,
          padding: "3px 8px", borderRadius: 3, border: `1px solid ${cfg.border}`,
        }}>{soldier.status}</span>
      </div>

      {/* Name + rank */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
          {soldier.rank} {soldier.name.toUpperCase()}
        </div>
        <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 1.5, marginTop: 2 }}>
          {soldier.unit} · MOS {soldier.mos}
        </div>
      </div>

      {/* Readiness bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "#94a3b8", fontSize: 9, letterSpacing: 2 }}>READINESS</span>
          <span style={{ color: cfg.border, fontSize: 11, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ background: "#0f172a", borderRadius: 2, height: 5, overflow: "hidden" }}>
          <div style={{
            width: `${pct}%`, height: "100%",
            background: `linear-gradient(90deg, ${cfg.border}88, ${cfg.border})`,
            borderRadius: 2, transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* Click hint */}
      <div style={{ color: "#1e3a5f", fontSize: 7, letterSpacing: 2, marginTop: 8, textAlign: "right" }}>
        CLICK FOR DETAILS ▶
      </div>
    </div>
  );
}

// ── Stat Badge ────────────────────────────────────────────────────────────────
function StatBadge({ label, count, color, total }) {
  return (
    <div style={{
      background: "rgba(15,23,42,0.8)", border: `1px solid ${color}44`,
      borderRadius: 6, padding: "12px 20px", textAlign: "center",
      fontFamily: "'Share Tech Mono', monospace", minWidth: 110,
    }}>
      <div style={{ color, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{count}</div>
      <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 2, marginTop: 4 }}>{label}</div>
      <div style={{ color: `${color}88`, fontSize: 9, marginTop: 2 }}>
        {((count / total) * 100).toFixed(0)}%
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function CRISDashboard() {
  const [filter, setFilter]     = useState("ALL");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);   // ← selected soldier for detail panel

  const counts = useMemo(() => ({
    GO:      SOLDIERS.filter(s => s.status === "GO").length,
    CAUTION: SOLDIERS.filter(s => s.status === "CAUTION").length,
    "NO-GO": SOLDIERS.filter(s => s.status === "NO-GO").length,
  }), []);

  const avgReadiness = useMemo(() =>
    Math.round(SOLDIERS.reduce((a, s) => a + s.readiness, 0) / SOLDIERS.length), []);

  const filtered = useMemo(() => SOLDIERS.filter(s => {
    const matchFilter = filter === "ALL" || s.status === filter;
    const matchSearch = search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search) ||
      s.rank.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [filter, search]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0f1a",
      backgroundImage: "radial-gradient(ellipse at 20% 0%, rgba(30,58,138,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(5,46,22,0.12) 0%, transparent 60%)",
      fontFamily: "'Share Tech Mono', monospace",
      color: "#e2e8f0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <header style={{
        background: "linear-gradient(180deg, #0d1117 0%, rgba(13,17,23,0.95) 100%)",
        borderBottom: "1px solid #1e3a5f",
        padding: "20px 32px",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 44, height: 44,
                background: "linear-gradient(135deg, #1e3a5f, #0f2a4a)",
                border: "1px solid #22d3ee44", borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>⬡</div>
              <div>
                <div style={{
                  fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900,
                  letterSpacing: 6, color: "#f1f5f9",
                  textShadow: "0 0 20px rgba(34,211,238,0.3)",
                }}>CRIS DASHBOARD</div>
                <div style={{ color: "#475569", fontSize: 9, letterSpacing: 4 }}>
                  COMBAT READINESS INFORMATION SYSTEM · CLASSIFIED
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#22c55e", boxShadow: "0 0 8px #22c55e",
                animation: "pulse 2s infinite",
              }} />
              <span style={{ color: "#22c55e", fontSize: 9, letterSpacing: 3 }}>LIVE</span>
              <span style={{ color: "#334155", fontSize: 9, letterSpacing: 2, marginLeft: 8 }}>
                {new Date().toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" }).toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <StatBadge label="TOTAL SOLDIERS" count={SOLDIERS.length} color="#94a3b8" total={SOLDIERS.length} />
            <StatBadge label="GO"      count={counts.GO}        color="#22c55e" total={SOLDIERS.length} />
            <StatBadge label="CAUTION" count={counts.CAUTION}   color="#eab308" total={SOLDIERS.length} />
            <StatBadge label="NO-GO"   count={counts["NO-GO"]}  color="#ef4444" total={SOLDIERS.length} />
            <div style={{
              background: "rgba(15,23,42,0.8)", border: "1px solid #1e3a5f",
              borderRadius: 6, padding: "12px 20px", textAlign: "center", minWidth: 110,
            }}>
              <div style={{ color: "#22d3ee", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{avgReadiness}%</div>
              <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 2, marginTop: 4 }}>AVG READINESS</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {["ALL","GO","CAUTION","NO-GO"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? (STATUS_CONFIG[f === "ALL" ? "GO" : f]?.border ?? "#475569") : "transparent",
                color: filter === f ? "#000" : "#64748b",
                border: `1px solid ${filter === f ? "transparent" : "#1e3a5f"}`,
                padding: "5px 14px", borderRadius: 3, fontSize: 9, letterSpacing: 2,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>{f} {f !== "ALL" && `(${counts[f] ?? 0})`}</button>
            ))}
            <input
              placeholder="SEARCH ID / NAME / RANK..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: "#0f172a", border: "1px solid #1e3a5f",
                color: "#94a3b8", padding: "5px 12px", borderRadius: 3,
                fontSize: 9, letterSpacing: 1.5, fontFamily: "inherit",
                outline: "none", width: 220,
              }}
            />
          </div>
        </div>
      </header>

      {/* ── Grid ── */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        <div style={{ color: "#334155", fontSize: 9, letterSpacing: 3, marginBottom: 16 }}>
          SHOWING {filtered.length} OF {SOLDIERS.length} PERSONNEL · CLICK ANY CARD FOR DETAILS
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: 12,
        }}>
          {filtered.map(s => (
            <SoldierCard key={s.id} soldier={s} onClick={setSelected} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#334155", padding: "60px 0", letterSpacing: 4, fontSize: 12 }}>
            NO PERSONNEL MATCH CRITERIA
          </div>
        )}
      </main>

      {/* ── Detail Panel ── */}
      <DetailPanel soldier={selected} onClose={() => setSelected(null)} />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0b0f1a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
      `}</style>
    </div>
  );
}