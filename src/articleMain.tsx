import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tokens.css';
import './styles/article.css';
import ArticlePage from './components/ArticlePage';
import { getProjectBySlug } from './data/projects';

export function resolveArticleSlug(rootElement: Element | null, pathname: string): string {
  const attrSlug = rootElement?.getAttribute('data-article')?.trim();
  if (attrSlug) {
    return attrSlug;
  }

  const match = pathname.match(/\/projects\/([^/?#]+?)(?:\.html)?\/?$/i);
  return match ? match[1] : '';
}

const rootElement = typeof document !== 'undefined' ? document.getElementById('root') : null;
if (rootElement) {
  const slug = resolveArticleSlug(rootElement, window.location.pathname);
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (project) {
    if (!rootElement.getAttribute('data-article')) {
      rootElement.setAttribute('data-article', project.slug);
    }
    document.title = `${project.title} — Xander Vanhaeren`;
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ArticlePage project={project} slug={slug} />
    </React.StrictMode>
  );
}
