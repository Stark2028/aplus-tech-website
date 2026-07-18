/** CH·01 — retail campaign playing on a slim-bezel signage panel.
 *  Scene content is decorative set-dressing (inside the stage's aria-hidden
 *  wrapper); prices/claims are illustrative, not live copy. */
export default function RetailScene() {
  return (
    <div className="stg-sign">
      <div className="stg-screen">
        <div className="stg-kb">
          <div className="stg-retail">
            <div className="stg-ret-eyebrow">FESTIVE SEASON · LIMITED TIME</div>
            <div className="stg-ret-big">
              UP TO <em>40% OFF</em>
              <small>Neo QLED · Soundbars · Bespoke</small>
            </div>
            <div className="stg-ret-shop">SHOP NOW →</div>
            <div className="stg-minitv">
              <div className="scr">
                <div />
              </div>
              <div className="neck" />
              <div className="base" />
              <div className="price">NEO QLED 55&quot; · ₹74,990</div>
            </div>
          </div>
        </div>
        <div className="stg-cap">SMART SIGNAGE · RETAIL</div>
      </div>
    </div>
  );
}
