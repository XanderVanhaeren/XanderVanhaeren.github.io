import type { ProjectData } from '../types/project';

export interface ProjectGridProps {
  projects: readonly ProjectData[];
  onSelectProject: (project: ProjectData, triggerElement: HTMLButtonElement) => void;
}

export function ProjectGrid({ projects, onSelectProject }: ProjectGridProps) {
  return (
    <main className="home-shell">
      <aside className="home-sidebar" aria-label="Identity">
        <h1 className="home-title">
          Xander
          <br />
          Vanhaeren.
        </h1>
        <p className="home-subtitle">
          Engineering Student
          <br />
          KU Leuven
        </p>
      </aside>

      <section className="project-grid" aria-label="Engineering projects">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            className="project-tile"
            data-project={project.slug}
            aria-label={`Open ${project.title} overview`}
            onClick={(event) => onSelectProject(project, event.currentTarget)}
          >
            <img
              className="project-tile__img"
              src={project.tileImage}
              alt={project.tileAlt}
              width={project.tileWidth}
              height={project.tileHeight}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : undefined}
            />
          </button>
        ))}
      </section>
    </main>
  );
}
