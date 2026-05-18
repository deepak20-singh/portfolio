export function Footer() {
  return (
    <footer>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, width: '100%' }}>
        <div>© 2026 Deepak Singh · Designed &amp; built with care</div>
        <div style={{ display: 'flex', gap: 18 }}>
          <span>Bengaluru, IN</span>
          <span>·</span>
          <span>v1.0.0</span>
          <span>·</span>
          <span>last commit: today</span>
        </div>
      </div>
    </footer>
  );
}
