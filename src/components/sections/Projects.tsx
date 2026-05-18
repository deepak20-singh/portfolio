import { SectionHead } from '../common/SectionHead';
import { ProjectCard } from '../common/ProjectCard';
import projectsData from '../../data/projects.json';

export function Projects() {
  return (
    <section id="work">
      <div className="container">
        <SectionHead
          num="03"
          label="Work"
          title="Selected projects"
          extra={<div className="section-num reveal">03 of many · 2022 — now</div>}
        />
        <div className="projects-list">
          {projectsData.map((p, i) => (
            <ProjectCard key={p.id} p={p} idx={i} total={projectsData.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
