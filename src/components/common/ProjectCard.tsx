export interface Project {
  id:       string;
  featured?: boolean;
  thumb?:   string;
  year:     string;
  role:     string;
  badge:    string;
  title:    string;
  desc:     string;
  stack:    string[];
  bullets:  { strong: string; rest: string }[];
  link?:    string;   // optional live demo / repo URL
  warning?: string;   // optional caveat shown beneath the link (e.g. cold-start note)
}

// ── Featured card (70% / left) ────────────────────────────────────────────────
export function FeaturedCard({ p }: { p: Project }) {
  return (
    <article className="proj-featured reveal" data-d="1">

      {/* Left: screenshot preview */}
      <div className="proj-preview">
        <div className="proj-screenshot">
          {p.thumb
            ? <img src={p.thumb} alt={p.title} />
            : <div className="proj-screenshot--empty" />
          }
        </div>
        <span className="proj-preview-badge">{p.badge}</span>
      </div>

      {/* Right: content body */}
      <div className="proj-body">
        <div className="proj-meta">
          <span className="proj-year">{p.year}</span>
          <span className="proj-sep">·</span>
          <span className="proj-role">{p.role}</span>
        </div>

        <h3 className="proj-title">{p.title}</h3>
        <p  className="proj-desc">{p.desc}</p>

        <div className="proj-footer">
          <div className="proj-stack">
            {p.stack.map(s => <span key={s} className="chip">{s}</span>)}
          </div>
          <ul className="proj-bullets">
            {p.bullets.map((b, i) => (
              <li key={i}>
                <strong>{b.strong}</strong>
                <span>{b.rest}</span>
              </li>
            ))}
          </ul>
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="proj-live-link"
            >
              ↗ Live demo
            </a>
          )}
          {p.warning && (
            <p className="proj-warning">{p.warning}</p>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Mini card (30% / right) ───────────────────────────────────────────────────
export function MiniCard({ p, idx }: { p: Project; idx: number }) {
  return (
    <article className="proj-mini reveal" data-d={String(idx + 1)}>

      {/* Thumbnail */}
      <div className="proj-mini-thumb">
        {p.thumb
          ? <img src={p.thumb} alt={p.title} className="proj-mini-thumb-img" />
          : <div className="proj-mini-thumb-empty" />
        }
        <span className="proj-badge proj-badge--over">{p.badge}</span>
      </div>

      {/* Content */}
      <div className="proj-mini-body">
        <div className="proj-mini-top">
          <span className="proj-year">{p.year}</span>
          <span className="proj-sep">·</span>
          <span className="proj-role">{p.role}</span>
        </div>

        <h3 className="proj-mini-title">{p.title}</h3>
        <p  className="proj-mini-desc">{p.desc}</p>

        <div className="proj-stack proj-stack--mini">
          {p.stack.slice(0, 4).map(s => <span key={s} className="chip">{s}</span>)}
          {p.stack.length > 4 && <span className="chip chip--more">+{p.stack.length - 4}</span>}
        </div>

        <div className="proj-mini-metric">
          <strong>{p.bullets[0].strong}</strong>
          <span>{p.bullets[0].rest}</span>
        </div>

        {p.link && (
          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="proj-live-link proj-live-link--mini"
          >
            ↗ Live demo
          </a>
        )}
        {p.warning && (
          <p className="proj-warning">{p.warning}</p>
        )}
      </div>
    </article>
  );
}

// ── Compat default export ─────────────────────────────────────────────────────
export function ProjectCard({ p, idx }: { p: Project; idx: number; total?: number }) {
  return p.featured ? <FeaturedCard p={p} /> : <MiniCard p={p} idx={idx} />;
}
