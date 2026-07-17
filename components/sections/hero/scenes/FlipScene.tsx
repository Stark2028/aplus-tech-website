/** CH·04 — interactive whiteboard (Flip) sketching a growth plan in a
 *  boardroom. Decorative set-dressing inside the aria-hidden stage. */
export default function FlipScene() {
  return (
    <>
      <div className="stg-flip">
        <div className="stg-screen">
          <div className="stg-board">
            <div className="stg-btitle">
              <u>Q3 Growth Plan</u> ↗
            </div>
            <div className="stg-note n1">Retail +32%</div>
            <div className="stg-note n2">New cities!</div>
            <div className="stg-note n3">Hire AV team</div>
            <div className="stg-axes" />
            <svg
              viewBox="0 0 200 110"
              preserveAspectRatio="xMidYMid meet"
              style={{ position: "absolute", inset: "12% 6% 14%", width: "88%", height: "74%" }}
            >
              <path
                className="stg-drawline stg-drawline-slow"
                d="M18,88 C40,86 44,60 66,62 C88,64 92,40 114,44 C136,48 142,22 170,18"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength="100"
              />
              <path
                className="stg-drawline stg-drawline-slow stg-drawline-delayed"
                d="M168,10 L178,16 L168,24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="100"
              />
            </svg>
            <div className="stg-capdark">INTERACTIVE · BOARDROOM</div>
            <div className="stg-palette">
              <i style={{ background: "#1e293b" }} />
              <i style={{ background: "#2563eb" }} />
              <i style={{ background: "#dc2626" }} />
              <i style={{ background: "#16a34a" }} />
            </div>
          </div>
        </div>
      </div>
      <div className="stg-legs"><i /><i /></div>
      <div className="stg-wheels"><i /><i /></div>
    </>
  );
}
