import React from 'react';
import { Button, Glass } from 'glisse';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import { TopoCanvas } from './TopoCanvas';

export interface HeroSectionProps {
  pauseContours?: boolean;
}

function scrollToSection(sectionId: string): void {
  const target = document.getElementById(sectionId);
  if (!target || typeof target.scrollIntoView !== 'function') return;
  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}

export function HeroSection({ pauseContours = false }: HeroSectionProps) {
  const { personal, fieldnotes } = PORTFOLIO_DATA;

  return (
    <section
      id="home"
      className="hero"
      aria-labelledby="hero-heading"
      data-glisse-backdrop
    >
      <TopoCanvas paused={pauseContours} />
      <div className="container hero-inner">
        <div className="hero-grid">
          <div className="hero-content">
            <p className="hero-eyebrow">
              <span className="eyebrow-dot" aria-hidden="true"></span>
              <span>{personal.eyebrow}</span>
            </p>
            <h1 id="hero-heading" className="hero-name">
              {personal.name}
            </h1>
            <p className="hero-title">{personal.title}</p>
            <p className="hero-description">{personal.description}</p>
            <div className="hero-buttons">
              <Button
                type="button"
                variant="filled"
                className="btn btn-primary"
                onClick={() => scrollToSection('projects')}
              >
                Explore Projects
              </Button>
              <Button
                type="button"
                variant="glass"
                className="btn btn-secondary"
                onClick={() => scrollToSection('about')}
              >
                About &amp; Workbench
              </Button>
            </div>
          </div>

          <aside aria-label="Engineering field notes">
            <Glass
              className="hero-fieldnotes"
              aria-label="Engineering profile summary"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <div className="fieldnotes-header">
                <span className="fieldnotes-title">{fieldnotes.title}</span>
                <span className="fieldnotes-coord">{fieldnotes.coord}</span>
              </div>
              <dl className="fieldnotes-list">
                {fieldnotes.rows.map((row) => (
                  <div key={row.label} className="fieldnotes-row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Glass>
          </aside>
        </div>
      </div>
    </section>
  );
}
