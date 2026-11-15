import React, { useEffect, useState } from 'react';
import { AboutSection } from './components/about/AboutSection';
import { HeroSection } from './components/hero/HeroSection';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { ProjectModal } from './components/projects/ProjectModal';
import { ProjectsSection } from './components/projects/ProjectsSection';
import { SkillsSection } from './components/skills/SkillsSection';
import { DEFAULT_SKILLS_DATA, fetchSkillsData } from './data/skillsData';
import type { SkillCategory } from './types/portfolio';

function isTyphoonUrlActive(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get('project') === 'typhoon' ||
    window.location.hash === '#projects/typhoon'
  );
}

export default function App() {
  const [skillsData, setSkillsData] =
    useState<SkillCategory[]>(DEFAULT_SKILLS_DATA);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(() =>
    isTyphoonUrlActive()
  );
  const [modalArticleUrl, setModalArticleUrl] = useState<string>(
    'projects/typhoon.html'
  );

  useEffect(() => {
    let active = true;
    fetchSkillsData().then((loaded) => {
      if (active) {
        setSkillsData(loaded);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      setIsProjectModalOpen(isTyphoonUrlActive());
    };
    window.addEventListener('hashchange', syncFromUrl);
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, []);

  const handleOpenProjectArticle = (articleUrl = 'projects/typhoon.html') => {
    setModalArticleUrl(articleUrl);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    let changed = false;
    if (url.searchParams.has('project')) {
      url.searchParams.delete('project');
      changed = true;
    }
    if (url.hash === '#projects/typhoon') {
      url.hash = '#projects';
      changed = true;
    }
    if (changed) {
      window.history.replaceState(
        null,
        '',
        `${url.pathname}${url.search}${url.hash}`
      );
    }
  };

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main">
        <HeroSection />

        <AboutSection />

        <ProjectsSection onOpenProjectArticle={handleOpenProjectArticle} />

        <SkillsSection skillsData={skillsData} />
      </main>

      <Footer />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        articleUrl={modalArticleUrl}
      />
    </>
  );
}
