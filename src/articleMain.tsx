import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
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

  rootElement.removeAttribute('data-article');

  if (project) {
    document.title = `${project.title} — Xander Vanhaeren`;
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ArticlePage project={project} slug={slug} />
    </React.StrictMode>
  );
}
