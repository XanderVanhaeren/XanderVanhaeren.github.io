import React from 'react';
import { Glass } from 'glisse';
import { TYPHOON_ARTICLE_DATA } from '../../data/portfolioData';

export function resolveAssetPath(src: string): string {
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('/')
  ) {
    return src;
  }
  return `/${src.replace(/^\.\.\//, '')}`;
}

export function TyphoonArticle() {
  const article = TYPHOON_ARTICLE_DATA;

  return (
    <article className="project-article">
      <header className="article-header">
        <p className="project-category">{article.category}</p>
        <h1>{article.title}</h1>
        <p className="article-subtitle">{article.subtitle}</p>
        <ul className="project-tags" aria-label="Technologies">
          {article.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
      </header>

      <figure className="article-hero-figure">
        <img
          src={resolveAssetPath(article.heroFigure.src)}
          width={article.heroFigure.width}
          height={article.heroFigure.height}
          alt={article.heroFigure.alt}
        />
        {article.heroFigure.caption && (
          <figcaption>{article.heroFigure.caption}</figcaption>
        )}
      </figure>

      <Glass
        className="article-specs"
        style={{ borderRadius: 'var(--radius-lg)' }}
      >
        <dl
          aria-label="Key technical specifications"
          style={{ display: 'contents' }}
        >
          {article.specs.map((spec) => (
            <div key={spec.label}>
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      </Glass>

      {article.sections.map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={`${section.id}-p-${index}`}>{paragraph}</p>
          ))}
          {section.gallery && (
            <div className="article-gallery">
              {section.gallery.map((item) => (
                <figure key={item.src}>
                  <img
                    src={resolveAssetPath(item.src)}
                    width={item.width}
                    height={item.height}
                    alt={item.alt}
                    loading="lazy"
                  />
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
          {section.figure && (
            <figure className="article-figure">
              <img
                src={resolveAssetPath(section.figure.src)}
                width={section.figure.width}
                height={section.figure.height}
                alt={section.figure.alt}
                loading="lazy"
              />
              {section.figure.caption && (
                <figcaption>{section.figure.caption}</figcaption>
              )}
            </figure>
          )}
          {section.bullets && (
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet.lead}>
                  <strong>{bullet.lead}</strong> {bullet.body}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
