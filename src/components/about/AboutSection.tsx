import React from 'react';
import { Glass } from 'glisse';
import { PORTFOLIO_DATA } from '../../data/portfolioData';

export function AboutSection() {
  const { about } = PORTFOLIO_DATA;

  return (
    <section id="about" className="section" aria-labelledby="about-heading">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-kicker">{about.kicker}</p>
            <h2 id="about-heading" className="section-title">
              {about.name}
            </h2>
          </div>
        </div>

        <div className="about-grid">
          <div className="about-main">
            <p id="bio-text" className="bio-text">
              {about.bio}
            </p>
            <div className="approach-grid" aria-label="Engineering workflow">
              {about.approach.map((item) => (
                <Glass
                  key={item.step}
                  className="approach-card"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                >
                  <span className="approach-step">{item.step}</span>
                  <h3 className="approach-title">{item.title}</h3>
                  <p className="approach-detail">{item.detail}</p>
                </Glass>
              ))}
            </div>
          </div>

          <div className="about-sidebar">
            <div id="education-list" className="education-list">
              {about.education.map((edu) => (
                <Glass
                  key={edu.degree}
                  className="education-item"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                >
                  <span className="education-type">{edu.type}</span>
                  <h3 className="education-degree">{edu.degree}</h3>
                  <p className="education-institution">
                    {edu.institution} · {edu.year}
                  </p>
                  {edu.description && (
                    <p className="education-description">{edu.description}</p>
                  )}
                </Glass>
              ))}
            </div>

            <Glass
              className="interests-card"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <p className="section-kicker">{about.interestsKicker}</p>
              <h3 className="interests-title">{about.interestsTitle}</h3>
              <ul id="interests-list" className="interest-list">
                {about.interests.map((interest) => (
                  <li key={interest} className="interest-tag">
                    {interest}
                  </li>
                ))}
              </ul>
            </Glass>
          </div>
        </div>
      </div>
    </section>
  );
}
