import React, { useMemo, useState } from 'react';
import { Button, Glass, SearchField } from 'glisse';
import {
  PORTFOLIO_DATA,
  PROJECTS_DATA,
  PROOF_OF_WORK_ITEMS,
} from '../../data/portfolioData';
import type { ProjectItem } from '../../types/portfolio';
import { FilterBar } from '../common/FilterBar';
import { ProjectDiagram } from './ProjectDiagrams';
import { resolveAssetPath } from './TyphoonArticle';

type ProjectFilter = 'all' | ProjectItem['filterGroup'];

const PROJECT_FILTER_ITEMS: Array<{ value: ProjectFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'aerospace', label: 'Aerospace' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'telemetry', label: 'Telemetry' },
  { value: 'software', label: 'Software' },
];

export interface ProjectsSectionProps {
  onOpenProjectArticle: (articleUrl?: string) => void;
}

export function ProjectsSection({
  onOpenProjectArticle,
}: ProjectsSectionProps) {
  const { projectsSection } = PORTFOLIO_DATA;
  const [filterGroup, setFilterGroup] = useState<ProjectFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tokenStartRegex = query
      ? new RegExp(`(?:^|[^a-z0-9])${escapedQuery}`, 'i')
      : null;

    return PROJECTS_DATA.filter((project) => {
      if (filterGroup !== 'all' && project.filterGroup !== filterGroup) {
        return false;
      }
      if (!tokenStartRegex) return true;

      const fields = [
        project.title,
        project.category,
        project.description,
        ...project.technologies,
        ...project.specs.flatMap((s) => [s.label, s.value]),
      ];

      return fields.some((field) => tokenStartRegex.test(field));
    });
  }, [filterGroup, searchQuery]);

  return (
    <section
      id="projects"
      className="section"
      aria-labelledby="projects-heading"
    >
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-kicker">{projectsSection.kicker}</p>
            <h2 id="projects-heading" className="section-title">
              {projectsSection.title}
            </h2>
          </div>
        </div>

        <div className="section-toolbar">
          <FilterBar
            items={PROJECT_FILTER_ITEMS}
            value={filterGroup}
            onValueChange={(value) => setFilterGroup(value as ProjectFilter)}
            aria-label="Filter projects by category"
          />
          <SearchField
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search projects..."
            aria-label="Search projects"
          />
        </div>

        <div id="projects-grid" className="projects-grid">
          {filteredProjects.length === 0 ? (
            <Glass
              className="filter-empty"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <p>No projects match &ldquo;{searchQuery.trim()}&rdquo;.</p>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Button
                  type="button"
                  variant="glass"
                  onClick={() => {
                    setFilterGroup('all');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Glass>
          ) : (
            filteredProjects.map((project) => {
              const isClickable = Boolean(project.articleUrl);
              return (
                <Glass
                  key={project.id}
                  className={`project-card${
                    project.featured ? ' is-featured' : ''
                  }${isClickable ? ' is-clickable' : ''}`}
                  style={{ borderRadius: 'var(--radius-lg)' }}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  aria-label={
                    isClickable
                      ? `Open ${project.title} engineering article`
                      : undefined
                  }
                  onClick={
                    isClickable
                      ? () => onOpenProjectArticle(project.articleUrl)
                      : undefined
                  }
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (
                            e.target instanceof HTMLElement &&
                            e.target.closest('a, button')
                          ) {
                            return;
                          }
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenProjectArticle(project.articleUrl);
                          }
                        }
                      : undefined
                  }
                >
                  <div className="project-showcase">
                    <div
                      className={`project-image${
                        project.image ? '' : ' is-placeholder'
                      }`}
                    >
                      {project.image ? (
                        <img
                          src={resolveAssetPath(project.image)}
                          width={project.imageWidth}
                          height={project.imageHeight}
                          alt={project.imageAlt || project.title}
                          loading="lazy"
                        />
                      ) : (
                        project.diagram && (
                          <ProjectDiagram kind={project.diagram} />
                        )
                      )}
                    </div>
                    {project.gallery && project.gallery.length > 0 && (
                      <div className="project-subgallery">
                        {project.gallery.map((item) => (
                          <figure key={item.src} className="subgallery-item">
                            <img
                              src={resolveAssetPath(item.src)}
                              width={item.width}
                              height={item.height}
                              alt={item.alt}
                              loading="lazy"
                            />
                            {item.caption && (
                              <figcaption>{item.caption}</figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="project-info">
                    <span className="project-category">{project.category}</span>
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    {project.specs.length > 0 && (
                      <dl className="project-specs">
                        {project.specs.map((spec) => (
                          <div key={spec.label} className="project-spec-item">
                            <dt>{spec.label}</dt>
                            <dd>{spec.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <ul className="project-tags" aria-label="Technologies">
                      {project.technologies.map((tech) => (
                        <li key={tech} className="tag">
                          {tech}
                        </li>
                      ))}
                    </ul>
                    {(project.articleUrl || project.demoUrl || project.githubUrl) && (
                      <div className="project-links">
                        {project.articleUrl && (
                          <a
                            href={project.articleUrl}
                            className="project-link project-read-more"
                            onClick={(e) => {
                              if (
                                e.metaKey ||
                                e.ctrlKey ||
                                e.shiftKey ||
                                e.altKey ||
                                e.button !== 0
                              ) {
                                e.stopPropagation();
                                return;
                              }
                              e.preventDefault();
                              e.stopPropagation();
                              onOpenProjectArticle(project.articleUrl);
                            }}
                          >
                            Read full engineering article →
                          </a>
                        )}
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open {project.title} ↗
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            GitHub ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Glass>
              );
            })
          )}
        </div>

        <div className="proof-grid" aria-label="Hardware and CFD media slots">
          {PROOF_OF_WORK_ITEMS.map((item) => (
            <Glass
              key={item.id}
              className="proof-slot"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <div className="proof-media">
                <img
                  src={resolveAssetPath(item.src)}
                  width={item.width}
                  height={item.height}
                  alt={item.alt}
                  loading="lazy"
                />
              </div>
              <figcaption>{item.caption}</figcaption>
            </Glass>
          ))}
        </div>
      </div>
    </section>
  );
}
