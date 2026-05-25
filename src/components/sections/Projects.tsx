import { SectionHead }   from '../common/SectionHead';
import { FeaturedCard, MiniCard } from '../common/ProjectCard';
import type { Project }   from '../common/ProjectCard';
import projectsData       from '../../data/projects.json';

export function Projects() {
  const all      = projectsData as Project[];
  const featured = all.find(p => p.featured)!;
  const secondary = all.filter(p => !p.featured);

  return (
    <section id="work">
      <div className="container">
        <SectionHead
          num="03"
          label="Work"
          title="Selected projects"
          extra={<div className="section-num reveal">03 of many · 2022 — now</div>}
        />

        <div className="projects-asymmetric">
          {/* 70% — flagship */}
          <FeaturedCard p={featured} />

          {/* 30% — secondary stack */}
          <div className="projects-secondary">
            {secondary.map((p, i) => (
              <MiniCard key={p.id} p={p} idx={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
