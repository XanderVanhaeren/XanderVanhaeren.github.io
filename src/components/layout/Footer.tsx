import React from 'react';
import { PORTFOLIO_DATA } from '../../data/portfolioData';

const JUMP_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
];

export function Footer() {
  const { personal } = PORTFOLIO_DATA;

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>{personal.footerCopyright}</p>
        <nav className="footer-links" aria-label="Footer navigation">
          {JUMP_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <p className="footer-coords">{personal.footerCoords}</p>
      </div>
    </footer>
  );
}
