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
    return {
      id: `${String(i + 1).padStart(3, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: NAMES[i],
      rank: RANKS[Math.floor(Math.random() * RANKS.length)],
      readiness,
      status,
      unit: `${Math.floor(Math.random() * 3 + 1)}-${["INF","CAV","FA","EN","MI"][Math.floor(Math.random()*5)]}`,
      mos: ["11B","12B","13F","25U","35F","68W","91A","42A"][Math.floor(Math.random()*8)],
    };
  });
}

const SOLDIERS = genSoldiers();

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  GO:      { border: "#22c55e", badge: "#166534", badgeBg: "#dcfce7", glow: "0 0 12px rgba(34,197,94,0.4)",  dot: "#22c55e" },
  CAUTION: { border: "#eab308", badge: "#713f12", badgeBg: "#fef9c3", glow: "0 0 12px rgba(234,179,8,0.4)",  dot: "#eab308" },
  "NO-GO": { border: "#ef4444", badge: "#7f1d1d", badgeBg: "#fee2e2", glow: "0 0 12px rgba(239,68,68,0.4)",  dot: "#ef4444" },
};

// ── SoldierCard ──────────────────────────────────────────────────────────────
function SoldierCard({ soldier }) {
  const cfg = STATUS_CONFIG[soldier.status];
  const pct = soldier.readiness;

  return (
    <div style={{
      background: "linear-gradient(145deg, #1a1f2e, #141824)",
      border: `1.5px solid ${cfg.border}`,
      boxShadow: cfg.glow,
      borderRadius: 8,
      padding: "14px 16px",
      fontFamily: "'Share Tech Mono', monospace",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.15s, box-shadow 0.15s",
      cursor: "default",
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
        width: 0, height: 0,
        borderStyle: "solid",
        borderWidth: "0 28px 28px 0",
        borderColor: `transparent ${cfg.border} transparent transparent`,
        opacity: 0.6,
      }} />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ color: "#94a3b8", fontSize: 9, letterSpacing: 2, marginBottom: 2 }}>SOLDIER ID</div>
          <div style={{ color: "#e2e8f0", fontSize: 11, letterSpacing: 1 }}>{soldier.id}</div>
        </div>
        <span style={{
          background: cfg.badgeBg,
          color: cfg.badge,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          padding: "3px 8px",
          borderRadius: 3,
          border: `1px solid ${cfg.border}`,
        }}>
          {soldier.status}
        </span>
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
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${cfg.border}88, ${cfg.border})`,
            borderRadius: 2,
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Stat Badge ───────────────────────────────────────────────────────────────
function StatBadge({ label, count, color, total }) {
  return (
    <div style={{
      background: "rgba(15,23,42,0.8)",
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: "12px 20px",
      textAlign: "center",
      fontFamily: "'Share Tech Mono', monospace",
      minWidth: 110,
    }}>
      <div style={{ color, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{count}</div>
      <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 2, marginTop: 4 }}>{label}</div>
      <div style={{ color: `${color}88`, fontSize: 9, marginTop: 2 }}>
        {((count / total) * 100).toFixed(0)}%
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function CRISDashboard() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => ({
    GO: SOLDIERS.filter(s => s.status === "GO").length,
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
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 44, height: 44,
                background: "linear-gradient(135deg, #1e3a5f, #0f2a4a)",
                border: "1px solid #22d3ee44",
                borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>⬡</div>
              <div>
                <div style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: 6,
                  color: "#f1f5f9",
                  textShadow: "0 0 20px rgba(34,211,238,0.3)",
                }}>CRIS DASHBOARD</div>
                <div style={{ color: "#475569", fontSize: 9, letterSpacing: 4 }}>
                  COMBAT READINESS INFORMATION SYSTEM · CLASSIFIED
                </div>
              </div>
            </div>

            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px #22c55e",
                animation: "pulse 2s infinite",
              }} />
              <span style={{ color: "#22c55e", fontSize: 9, letterSpacing: 3 }}>LIVE</span>
              <span style={{ color: "#334155", fontSize: 9, letterSpacing: 2, marginLeft: 8 }}>
                {new Date().toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" }).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <StatBadge label="TOTAL SOLDIERS" count={SOLDIERS.length} color="#94a3b8" total={SOLDIERS.length} />
            <StatBadge label="GO" count={counts.GO} color="#22c55e" total={SOLDIERS.length} />
            <StatBadge label="CAUTION" count={counts.CAUTION} color="#eab308" total={SOLDIERS.length} />
            <StatBadge label="NO-GO" count={counts["NO-GO"]} color="#ef4444" total={SOLDIERS.length} />
            <div style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid #1e3a5f",
              borderRadius: 6,
              padding: "12px 20px",
              textAlign: "center",
              minWidth: 110,
            }}>
              <div style={{ color: "#22d3ee", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{avgReadiness}%</div>
              <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 2, marginTop: 4 }}>AVG READINESS</div>
            </div>
          </div>

          {/* Filter + Search */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {["ALL", "GO", "CAUTION", "NO-GO"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? STATUS_CONFIG[f === "ALL" ? "GO" : f]?.border ?? "#475569" : "transparent",
                color: filter === f ? "#000" : "#64748b",
                border: `1px solid ${filter === f ? "transparent" : "#1e3a5f"}`,
                padding: "5px 14px",
                borderRadius: 3,
                fontSize: 9,
                letterSpacing: 2,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}>
                {f} {f !== "ALL" && `(${counts[f] ?? 0})`}
              </button>
            ))}
            <input
              placeholder="SEARCH ID / NAME / RANK..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: "#0f172a",
                border: "1px solid #1e3a5f",
                color: "#94a3b8",
                padding: "5px 12px",
                borderRadius: 3,
                fontSize: 9,
                letterSpacing: 1.5,
                fontFamily: "inherit",
                outline: "none",
                width: 220,
              }}
            />
          </div>
        </div>
      </header>

      {/* ── Grid ── */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        <div style={{ color: "#334155", fontSize: 9, letterSpacing: 3, marginBottom: 16 }}>
          SHOWING {filtered.length} OF {SOLDIERS.length} PERSONNEL
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: 12,
        }}>
          {filtered.map(s => <SoldierCard key={s.id} soldier={s} />)}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#334155", padding: "60px 0", letterSpacing: 4, fontSize: 12 }}>
            NO PERSONNEL MATCH CRITERIA
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0b0f1a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
      `}</style>
    </div>
  );
}
