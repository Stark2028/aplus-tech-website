/** CH·03 — hotel TV home screen (guest room). Decorative set-dressing inside
 *  the aria-hidden stage; hotel name/guest are fictional. */
export default function HotelScene() {
  return (
    <>
      <div className="stg-tv">
        <div className="stg-screen">
          <div className="stg-kb">
            <div className="stg-hotel">
              <div className="stg-hbrand">
                THE GRAND MERIDIAN&nbsp;<small>★★★★★</small>
              </div>
              <div className="stg-hgreet">
                GOOD EVENING
                <span className="stg-htype">Welcome, Mr. Kapoor</span>
              </div>
              <div className="stg-tiles">
                <div className="stg-tile">Live TV</div>
                <div className="stg-tile">Movies</div>
                <div className="stg-tile">Dining</div>
                <div className="stg-tile">Spa</div>
                <div className="stg-tile">My Bill</div>
              </div>
              <div className="stg-hinfo">8:42 PM&nbsp;·&nbsp;28°C MUMBAI&nbsp;·&nbsp;WIFI: MERIDIAN-GUEST</div>
            </div>
          </div>
          {/* Lifted above the scene's info line (mockup had them colliding). */}
          <div className="stg-cap" style={{ bottom: "16%" }}>HOSPITALITY TV · GUEST ROOM</div>
        </div>
      </div>
      <div className="stg-neck" />
      <div className="stg-base" />
    </>
  );
}
