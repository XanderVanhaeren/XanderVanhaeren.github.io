import 'react';

declare module 'react' {
  interface CSSProperties {
    '--lg-blur'?: string | number;
    '--lg-glass-bend'?: string | number;
    '--lg-glass-dispersion'?: string | number;
    '--lg-rim-shine'?: string | number;
    '--lg-tab-width'?: string | number;
    '--lg-tab-height'?: string | number;
    '--lg-glass'?: string;
    '--lg-glass-active'?: string;
    '--lg-fill'?: string;
    '--lg-foreground'?: string;
    '--lg-muted'?: string;
  }
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SkillItem {
  name: string;
  level: SkillLevel;
}

export interface SkillCategory {
  category: string;
  skills: SkillItem[];
}

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface ProjectGalleryItem {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  filterGroup: 'aerospace' | 'robotics' | 'telemetry' | 'software';
  featured?: boolean;
  description: string;
  technologies: string[];
  specs: ProjectSpec[];
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  diagram?: 'rover' | 'telemetry' | 'pdf';
  gallery?: ProjectGalleryItem[];
  articleUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
}

export interface GlassOpticsSettings {
  blur: number;        // --lg-blur in px (default 14)
  bend: number;        // --lg-glass-bend (default 1.6)
  dispersion: number;  // --lg-glass-dispersion (default 0.6)
  pauseContours: boolean;
}

export interface PersonalInfo {
  name: string;
  title: string;
  description: string;
  location: string;
  eyebrow: string;
  coordinates: string;
  footerCopyright: string;
  footerCoords: string;
}

export interface FieldnotesRow {
  label: string;
  value: string;
}

export interface HeroFieldnotes {
  title: string;
  coord: string;
  rows: FieldnotesRow[];
}

export interface ApproachStep {
  step: string;
  title: string;
  detail: string;
}

export interface EducationItem {
  type: string;
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

export interface AboutData {
  kicker: string;
  name: string;
  subtitle: string;
  bio: string;
  approach: ApproachStep[];
  education: EducationItem[];
  interestsKicker: string;
  interestsTitle: string;
  interests: string[];
}

export interface ProofOfWorkItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  slotLabel: string;
  width: number;
  height: number;
}

export interface TyphoonArticleBullet {
  lead: string;
  body: string;
}

export interface TyphoonArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: TyphoonArticleBullet[];
  gallery?: ProjectGalleryItem[];
  figure?: ProjectGalleryItem;
}

export interface TyphoonArticleData {
  category: string;
  title: string;
  subtitle: string;
  tags: string[];
  heroFigure: ProjectGalleryItem;
  specs: ProjectSpec[];
  sections: TyphoonArticleSection[];
}

export interface PortfolioData {
  personal: PersonalInfo;
  fieldnotes: HeroFieldnotes;
  about: AboutData;
  projectsSection: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  projects: ProjectItem[];
  proofOfWork: ProofOfWorkItem[];
  skillsSection: {
    kicker: string;
    title: string;
  };
  typhoonArticle: TyphoonArticleData;
}
