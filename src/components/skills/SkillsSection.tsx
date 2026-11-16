import React, { useMemo, useState } from 'react';
import { Button, Glass, SearchField, SegmentedControl } from 'glisse';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import type { SkillCategory, SkillLevel } from '../../types/portfolio';

function getSkillDotCount(level: SkillLevel): number {
  if (level === 'advanced') return 3;
  if (level === 'intermediate') return 2;
  return 1;
}

export interface SkillsSectionProps {
  skillsData: SkillCategory[];
}

export function SkillsSection({ skillsData }: SkillsSectionProps) {
  const { skillsSection } = PORTFOLIO_DATA;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryItems = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...skillsData.map((category) => ({
        value: category.category,
        label: category.category,
      })),
    ],
    [skillsData]
  );

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return skillsData
      .filter(
        (category) =>
          selectedCategory === 'all' || category.category === selectedCategory
      )
      .map((category) => {
        if (!query) return category;
        const categoryMatches = category.category.toLowerCase().includes(query);
        const matchingSkills = categoryMatches
          ? category.skills
          : category.skills.filter(
              (skill) =>
                skill.name.toLowerCase().includes(query) ||
                skill.level.toLowerCase().includes(query)
            );
        return {
          ...category,
          skills: matchingSkills,
        };
      })
      .filter((category) => category.skills.length > 0);
  }, [skillsData, selectedCategory, searchQuery]);

  return (
    <section
      id="skills"
      className="section"
      aria-labelledby="skills-heading"
    >
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-kicker">{skillsSection.kicker}</p>
            <h2 id="skills-heading" className="section-title">
              {skillsSection.title}
            </h2>
          </div>
        </div>

        <div className="section-toolbar">
          <SegmentedControl
            className="skills-segmented"
            items={categoryItems}
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            aria-label="Filter skills by category"
          />
          <SearchField
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search skills..."
            aria-label="Search skills"
          />
        </div>

        <div id="skills-grid" className="skills-grid">
          {filteredCategories.length === 0 ? (
            <Glass
              className="filter-empty"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <p>No skills match &ldquo;{searchQuery.trim()}&rdquo;.</p>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Button
                  type="button"
                  variant="glass"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Glass>
          ) : (
            filteredCategories.map((category) => (
              <Glass
                key={category.category}
                className="skill-category"
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                <div className="skill-category-header">
                  <h3>{category.category}</h3>
                  <span className="skill-count">{category.skills.length}</span>
                </div>
                <ul className="skill-list">
                  {category.skills.map((skill) => {
                    const activeDots = getSkillDotCount(skill.level);
                    return (
                      <li key={skill.name} className="skill-item">
                        <span className="skill-name">{skill.name}</span>{' '}
                        <div className="skill-meta">
                          <span
                            className={`skill-level-badge ${skill.level}`}
                            title={`Proficiency: ${skill.level}`}
                          >
                            {skill.level}
                          </span>
                          <span
                            className={`skill-dots ${skill.level}`}
                            aria-hidden="true"
                          >
                            {[1, 2, 3].map((dot) => (
                              <span
                                key={dot}
                                className={`skill-dot${
                                  dot <= activeDots ? ' is-active' : ''
                                }`}
                                data-active={dot <= activeDots ? 'true' : 'false'}
                              />
                            ))}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Glass>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
