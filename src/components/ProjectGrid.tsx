import { useEffect, useRef, useState } from 'react';
import type { ProjectData, ProjectSlug } from '../types/project';

export interface ProjectGridProps {
  projects: readonly ProjectData[];
  onSelectProject: (project: ProjectData, triggerElement: HTMLButtonElement) => void;
}

const MOBILE_MEDIA_QUERY = '(max-width: 639px)';
const CENTER_SWITCH_HYSTERESIS_PX = 12;

export function ProjectGrid({ projects, onSelectProject }: ProjectGridProps) {
  const [centeredSlug, setCenteredSlug] = useState<ProjectSlug | null>(null);
  const tileRefs = useRef(new Map<ProjectSlug, HTMLButtonElement>());
  const centeredSlugRef = useRef<ProjectSlug | null>(null);

  useEffect(() => {
    centeredSlugRef.current = centeredSlug;
  }, [centeredSlug]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mobileMql = window.matchMedia(MOBILE_MEDIA_QUERY);
    let rafId = 0;

    const updateCenteredTile = () => {
      rafId = 0;
      if (!mobileMql.matches) {
        if (centeredSlugRef.current !== null) {
          centeredSlugRef.current = null;
          setCenteredSlug(null);
        }
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      let bestSlug: ProjectSlug | null = null;
      let bestDist = Infinity;
      let currentDist = Infinity;

      for (const project of projects) {
        const el = tileRefs.current.get(project.slug);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.height <= 0) continue;
        const dist = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        if (project.slug === centeredSlugRef.current) {
          currentDist = dist;
        }
        if (dist < bestDist) {
          bestDist = dist;
          bestSlug = project.slug;
        }
      }

      if (
        centeredSlugRef.current !== null &&
        bestSlug !== centeredSlugRef.current &&
        currentDist - bestDist < CENTER_SWITCH_HYSTERESIS_PX
      ) {
        return;
      }

      if (bestSlug !== centeredSlugRef.current) {
        centeredSlugRef.current = bestSlug;
        setCenteredSlug(bestSlug);
      }
    };

    const scheduleUpdate = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(updateCenteredTile);
    };

    updateCenteredTile();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    mobileMql.addEventListener('change', scheduleUpdate);

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      mobileMql.removeEventListener('change', scheduleUpdate);
    };
  }, [projects]);

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
            ref={(el) => {
              if (el) {
                tileRefs.current.set(project.slug, el);
              } else {
                tileRefs.current.delete(project.slug);
              }
            }}
            type="button"
            className="project-tile"
            data-project={project.slug}
            data-mobile-centered={centeredSlug === project.slug ? 'true' : undefined}
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
