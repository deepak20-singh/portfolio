export function Stats() {
  return (
    <section id="stats" style={{ paddingTop: 0, paddingBottom: 80 }}>
      <div className="container">
        <div className="stats-strip reveal">
          <div className="stat">
            <span className="meta">[01]</span>
            <div className="num">40<span className="unit">%</span></div>
            <div className="lbl">P95 latency reduction via Redis Pub/Sub redesign</div>
          </div>
          <div className="stat">
            <span className="meta">[02]</span>
            <div className="num">10k<span className="unit">/hr</span></div>
            <div className="lbl">Messages handled with sub-150ms latency</div>
          </div>
          <div className="stat">
            <span className="meta">[03]</span>
            <div className="num">99.9<span className="unit">%</span></div>
            <div className="lbl">Uptime SLA across containerised services</div>
          </div>
          <div className="stat">
            <span className="meta">[04]</span>
            <div className="num">3<span className="unit">+ yrs</span></div>
            <div className="lbl">Shipping AI &amp; backend at Openstream.ai</div>
          </div>
        </div>
      </div>
    </section>
  );
}
