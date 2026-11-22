import { useRef, useState } from 'react';
import { PROJECTS, getProjectBySlug } from './data/projects';
import type { ProjectData, ProjectSlug } from './types/project';
import { ProjectGrid } from './components/ProjectGrid';
import { ProjectOverlay } from './components/ProjectOverlay';

export default function App() {
  const [activeSlug, setActiveSlug] = useState<ProjectSlug | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const activeProject = activeSlug ? getProjectBySlug(activeSlug) ?? null : null;

  const handleSelectProject = (project: ProjectData, triggerElement: HTMLButtonElement) => {
    triggerRef.current = triggerElement;
    setActiveSlug(project.slug);
  };

  return (
    <>
      <ProjectGrid projects={PROJECTS} onSelectProject={handleSelectProject} />
      <ProjectOverlay
        project={activeProject}
        onClose={() => setActiveSlug(null)}
        triggerRef={triggerRef}
      />
    </>
  );
}
