export interface Project {
  id: string;
  thumb?: string;
  year: string;
  role: string;
  badge: string;
  title: string;
  desc: string;
  stack: string[];
  bullets: { strong: string; rest: string }[];
}

interface Props { p: Project; idx: number; total: number; }

export function ProjectCard({ p, idx, total }: Props) {
  return (
    <article className="project reveal" data-d={String((idx % 3) + 1)}>
      <div className="project-thumb">
        {p.thumb && (
          <img
            src={p.thumb}
            alt={`${p.title} thumbnail`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
          />
        )}
        <span className="badge">{p.badge}</span>
      </div>
      <div>
        <div className="project-meta">
          <span className="y">{p.year}</span>
          <span>·</span>
          <span>{p.role}</span>
          <span>·</span>
          <span>0{idx + 1} / 0{total}</span>
        </div>
        <h3 className="project-title">{p.title}</h3>
        <p className="project-desc">{p.desc}</p>
        <div className="project-stack">
          {p.stack.map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
        <ul className="project-bullets">
          {p.bullets.map((b, i) => (
            <li key={i}><span><strong>{b.strong}</strong> — {b.rest}</span></li>
          ))}
        </ul>
      </div>
    </article>
  );
}
