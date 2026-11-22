export type ProjectSlug = 'typhoon' | 'bikeysens' | 'rcxd' | 'team-214';

export interface ProjectSpec {
  label: string;
  value: string;
  note?: string;
}

export interface ProjectFigure {
  src: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
  /** Surface hint for transparent or dark-line assets rendered on dark UI */
  surface?: 'dark' | 'neutral' | 'light';
}

export interface ProjectVideo {
  src: string;
  title: string;
  caption: string;
  poster?: string;
}

export interface ArticleBullet {
  lead: string;
  body: string;
}

export interface ArticleCallout {
  label: string;
  content: string;
}

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly ArticleBullet[];
  orderedList?: readonly ArticleBullet[];
  callout?: ArticleCallout;
  specs?: readonly ProjectSpec[];
  figures?: readonly ProjectFigure[];
}

export interface ProjectData {
  slug: ProjectSlug;
  title: string;
  subtitle: string;
  route: `/projects/${ProjectSlug}.html`;
  period: string;
  context: string;
  role: string;
  team?: string;
  status: 'completed' | 'in-progress';
  statusLabel?: string;
  tileImage: string;
  tileAlt: string;
  tileWidth: number;
  tileHeight: number;
  overlaySummary: string;
  highlights: readonly string[];
  tags: readonly string[];
  heroFigure: ProjectFigure;
  video?: ProjectVideo;
  specs: readonly ProjectSpec[];
  sections: readonly ArticleSection[];
  sourcesNote: string;
}
