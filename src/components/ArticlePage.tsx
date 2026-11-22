import { useId } from 'react';
import { PROJECTS, getProjectBySlug } from '../data/projects';
import type { ProjectData, ProjectFigure, ProjectSpec } from '../types/project';

export interface ArticlePageProps {
  project?: ProjectData;
  slug?: string;
}

function FigureBlock({
  figure,
  priority,
}: {
  figure: ProjectFigure;
  priority?: 'high';
}) {
  const surface = figure.surface ?? 'neutral';

  return (
    <figure className={`article-figure surface-${surface}`} data-surface={surface}>
      <img
        src={figure.src}
        alt={figure.alt}
        width={figure.width}
        height={figure.height}
        fetchPriority={priority === 'high' ? 'high' : undefined}
        loading={priority === 'high' ? undefined : 'lazy'}
        decoding="async"
      />
      <figcaption>{figure.caption}</figcaption>
    </figure>
  );
}

function SpecsTable({
  specs,
  caption,
}: {
  specs: readonly ProjectSpec[];
  caption: string;
}) {
  const captionId = useId();

  return (
    <div
      className="table-wrapper"
      tabIndex={0}
      role="region"
      aria-labelledby={captionId}
    >
      <table className="specs-table">
        <caption id={captionId} className="visually-hidden">
          {caption}
        </caption>
        <thead>
          <tr>
            <th scope="col">Parameter</th>
            <th scope="col">Specification</th>
          </tr>
        </thead>
        <tbody>
          {specs.map((spec, index) => (
            <tr key={`${spec.label}-${index}`}>
              <th scope="row">{spec.label}</th>
              <td>
                <span>{spec.value}</span>
                {spec.note ? (
                  <span className="article-spec-note">{spec.note}</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ArticlePage({ project, slug }: ArticlePageProps) {
  const resolvedProject = project ?? (slug ? getProjectBySlug(slug) : undefined);

  if (!resolvedProject) {
    return (
      <div className="article-root">
        <header className="article-nav-wrap">
          <div className="article-nav-bar">
            <nav className="article-nav" aria-label="Primary">
              <a className="article-back-link" href="/">
                ← Back to projects
              </a>
            </nav>
          </div>
        </header>
        <main className="article-main">
          <div className="article-container article-not-found">
            <h1>Project not found</h1>
            <p className="article-prose">
              {slug
                ? `No project article matches "${slug}". Return to the portfolio index to select a project.`
                : 'No project identifier was provided. Return to the portfolio index to select a project.'}
            </p>
            <p>
              <a className="article-back-link" href="/">
                ← Back to projects
              </a>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const projectIndex = PROJECTS.findIndex((item) => item.slug === resolvedProject.slug);
  const prevProject = projectIndex > 0 ? PROJECTS[projectIndex - 1] : undefined;
  const nextProject =
    projectIndex >= 0 && projectIndex < PROJECTS.length - 1
      ? PROJECTS[projectIndex + 1]
      : undefined;

  return (
    <div className="article-root" data-article={resolvedProject.slug}>
      <header className="article-nav-wrap">
        <div className="article-nav-bar">
          <nav className="article-nav" aria-label="Primary">
            <a className="article-back-link" href="/">
              ← Back to projects
            </a>
            <span className="article-nav-title" aria-hidden="true">
              {resolvedProject.title}
            </span>
          </nav>
        </div>
      </header>

      <main className="article-main">
        <article className="article-container">
          <header className="article-header">
            {(resolvedProject.status === 'in-progress' || resolvedProject.statusLabel) && (
              <div className="article-status" data-status={resolvedProject.status}>
                <span className="article-status-dot" aria-hidden="true" />
                <span>
                  {resolvedProject.statusLabel ??
                    (resolvedProject.status === 'in-progress' ? 'In Progress' : 'Completed')}
                </span>
              </div>
            )}

            <h1>{resolvedProject.title}</h1>
            <p className="article-subtitle">{resolvedProject.subtitle}</p>

            <dl className="article-meta">
              <div>
                <dt>Period</dt>
                <dd>{resolvedProject.period}</dd>
              </div>
              <div>
                <dt>Context</dt>
                <dd>{resolvedProject.context}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{resolvedProject.role}</dd>
              </div>
              {resolvedProject.team ? (
                <div>
                  <dt>Team</dt>
                  <dd>{resolvedProject.team}</dd>
                </div>
              ) : null}
            </dl>

            <ul className="article-tags" aria-label="Technologies and methods">
              {resolvedProject.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </header>

          <FigureBlock figure={resolvedProject.heroFigure} priority="high" />

          {resolvedProject.video ? (
            <section className="article-section" aria-labelledby="video-heading">
              <h2 id="video-heading">{resolvedProject.video.title}</h2>
              <figure
                className="article-figure article-video-figure surface-dark"
                data-surface="dark"
              >
                <video
                  controls
                  playsInline
                  muted
                  loop
                  preload="none"
                  poster={resolvedProject.video.poster}
                  src={resolvedProject.video.src}
                  width={1500}
                  height={1000}
                  aria-label={resolvedProject.video.title}
                />
                <figcaption>{resolvedProject.video.caption}</figcaption>
              </figure>
            </section>
          ) : null}

          <section className="article-section" aria-labelledby="specs-heading">
            <h2 id="specs-heading">Key Specifications</h2>
            <SpecsTable
              specs={resolvedProject.specs}
              caption={`${resolvedProject.title} key specifications`}
            />
          </section>

          {resolvedProject.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="article-section"
              aria-labelledby={`${section.id}-heading`}
            >
              <h2 id={`${section.id}-heading`}>{section.heading}</h2>

              <div className="article-prose">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.id}-p-${index}`}>{paragraph}</p>
                ))}

                {section.callout ? (
                  <aside className="article-callout">
                    <p className="article-callout__label">{section.callout.label}</p>
                    <p className="article-callout__content">{section.callout.content}</p>
                  </aside>
                ) : null}

                {section.bullets && section.bullets.length > 0 ? (
                  <ul>
                    {section.bullets.map((bullet, index) => (
                      <li key={`${section.id}-b-${index}`}>
                        <strong>{bullet.lead}:</strong> {bullet.body}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.orderedList && section.orderedList.length > 0 ? (
                  <ol>
                    {section.orderedList.map((item, index) => (
                      <li key={`${section.id}-o-${index}`}>
                        <strong>{item.lead}:</strong> {item.body}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>

              {section.specs && section.specs.length > 0 ? (
                <div className="article-section-specs">
                  <SpecsTable
                    specs={section.specs}
                    caption={`${section.heading} specifications`}
                  />
                </div>
              ) : null}

              {section.figures && section.figures.length > 0 ? (
                <div className="article-figures">
                  {section.figures.map((figure) => (
                    <FigureBlock key={figure.src} figure={figure} />
                  ))}
                </div>
              ) : null}
            </section>
          ))}

          <aside className="article-sources" aria-label="Verification sources">
            <p>{resolvedProject.sourcesNote}</p>
          </aside>

          <footer className="article-footer">
            {(prevProject || nextProject) && (
              <nav className="article-siblings" aria-label="Adjacent projects">
                {prevProject ? (
                  <a className="article-sibling-link" href={prevProject.route}>
                    <span className="article-sibling-dir">← Previous</span>
                    <span className="article-sibling-title">{prevProject.title}</span>
                  </a>
                ) : null}
                {nextProject ? (
                  <a
                    className="article-sibling-link article-sibling-link--next"
                    href={nextProject.route}
                  >
                    <span className="article-sibling-dir">Next →</span>
                    <span className="article-sibling-title">{nextProject.title}</span>
                  </a>
                ) : null}
              </nav>
            )}

            <div>
              <a className="article-back-link" href="/">
                ← Back to projects
              </a>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
