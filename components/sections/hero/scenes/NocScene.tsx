/** CH·02 — network operations dashboard playing across a 2×2 video wall.
 *  All figures are decorative set-dressing inside the aria-hidden stage. */
export default function NocScene() {
  return (
    <div className="stg-vwall">
      <div className="stg-screen">
        <div className="stg-ctrl">
          <div className="stg-noc-head">
            <span>NETWORK OPERATIONS CENTER</span>
            <span className="stg-noc-live">LIVE</span>
          </div>
          <div className="stg-noc-chart">
            <svg
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              style={{ position: "absolute", inset: "8% 5%", width: "90%", height: "84%" }}
            >
              <polyline
                className="stg-drawline"
                points="0,34 14,26 28,30 42,16 56,22 70,9 84,14 100,4"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="1.6"
                pathLength="100"
              />
            </svg>
          </div>
          <div className="stg-kpis">
            <div className="stg-kpi"><b>99.98%</b><span>UPTIME</span></div>
            <div className="stg-kpi"><b>1,248</b><span>SCREENS</span></div>
            <div className="stg-kpi"><b>17ms</b><span>LATENCY</span></div>
          </div>
          <div className="stg-map">
            <div className="stg-mdot" style={{ left: "28%", top: "30%" }} />
            <div className="stg-mdot m2" style={{ left: "52%", top: "55%" }} />
            <div className="stg-mdot m3" style={{ left: "70%", top: "26%" }} />
          </div>
          <div className="stg-bars"><i /><i /><i /><i /><i /></div>
          <div className="stg-ticker">
            <div>
              ▲ BKC MALL WALL 4×4 ONLINE&nbsp;&nbsp;·&nbsp;&nbsp;✓ PUNE AIRPORT SIGNAGE
              SYNCED&nbsp;&nbsp;·&nbsp;&nbsp;▲ FIRMWARE V2.4 DEPLOYED — 214
              SCREENS&nbsp;&nbsp;·&nbsp;&nbsp;✓ ALL ZONES NOMINAL
            </div>
          </div>
          <div className="stg-seamv" />
          <div className="stg-seamh" />
        </div>
        <div className="stg-cap" style={{ bottom: "16%" }}>
          VIDEO WALL 2×2 · CONTROL ROOM
        </div>
      </div>
    </div>
  );
}
