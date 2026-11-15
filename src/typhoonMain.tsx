import React from 'react';
import ReactDOM from 'react-dom/client';
import 'glisse/styles.css';
import './styles/styles.css';
import { TyphoonArticle } from './components/projects/TyphoonArticle';
import { PERSONAL_DATA } from './data/portfolioData';

document.documentElement.setAttribute('data-theme', 'dark');

export function TyphoonStandalonePage() {
  return (
    <>
      <header className="article-topbar">
        <div className="container article-topbar-inner">
          <a href="../index.html#projects" className="article-back">
            ← Back to Portfolio
          </a>
          <a href="../index.html" className="logo" aria-label="Xander Vanhaeren home">
            XV<span className="logo-accent">.</span>
          </a>
        </div>
      </header>

      <main className="container article-standalone">
        <TyphoonArticle />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <p>{PERSONAL_DATA.footerCopyright}</p>
          <p className="footer-coords">{PERSONAL_DATA.footerCoords}</p>
        </div>
      </footer>
    </>
  );
}

const rootElement =
  document.getElementById('root') || document.getElementById('typhoon-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <TyphoonStandalonePage />
    </React.StrictMode>
  );
}
