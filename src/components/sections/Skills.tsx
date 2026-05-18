import { SectionHead } from '../common/SectionHead';
import skillsData from '../../data/skills.json';
import techMarqueeData from '../../data/techMarquee.json';

export function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <SectionHead
          num="02"
          label="Stack"
          title="What I build with"
          extra={<div className="section-num reveal">07 categories · 30+ tools</div>}
        />

        <div className="skills-grid">
          {skillsData.map((cat, i) => (
            <div
              key={cat.title}
              className={`skill-cat reveal${cat.span ? ` ${cat.span}` : ''}`}
              data-d={String((i % 3) + 1)}
            >
              <h4>
                <span className="idx">0{i + 1}</span>
                <span>{cat.title}</span>
              </h4>
              <div className="skill-chips">
                {cat.items.map((it) => <span key={it} className="chip">{it}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tech-strip" style={{ marginTop: 64 }}>
        <div className="tech-track">
          {[...techMarqueeData, ...techMarqueeData].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
    </section>
  );
}
