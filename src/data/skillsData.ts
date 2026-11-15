import type { SkillCategory, SkillLevel } from '../types/portfolio';

export const SKILLS_FALLBACK_CSV = `category;skill;level
Programming;Python;advanced
Programming;C/C++;intermediate
Programming;MATLAB;advanced
Programming;JavaScript;beginner
Electronics & Embedded Systems;Arduino / ESP32;intermediate
Electronics & Embedded Systems;Raspberry Pi;intermediate
Electronics & Embedded Systems;Circuit Design;beginner
CAD & Mechanical Design;Fusion 360;advanced
CAD & Mechanical Design;SolidWorks;intermediate
CAD & Mechanical Design;3D Printing (FDM/SLA);intermediate
Data Analysis & Simulation;CFD / Aerodynamics;advanced
Data Analysis & Simulation;MATLAB Simulink;beginner
Data Analysis & Simulation;Python (NumPy, SciPy);intermediate
Tools & Technologies;Git / GitHub;intermediate
Tools & Technologies;LaTeX;beginner
Tools & Technologies;Linux;beginner`;

export function normalizeSkillLevel(rawLevel: string): SkillLevel {
  const cleaned = (rawLevel || '').trim().toLowerCase();
  if (cleaned === 'advanced') return 'advanced';
  if (cleaned === 'intermediate') return 'intermediate';
  return 'beginner';
}

export function parseSkillsCsv(csv: string): SkillCategory[] {
  if (!csv || !csv.trim()) {
    return [];
  }

  const categories = new Map<string, SkillCategory['skills']>();
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/);
  const firstNonEmpty = lines.find((l) => l.trim());
  const delimiter = firstNonEmpty?.includes(';') ? ';' : ',';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const parts = line.split(delimiter).map((part) => part.trim());
    if (parts.length < 3) continue;

    const [category, name, rawLevel = ''] = parts;

    if (
      categories.size === 0 &&
      category.toLowerCase() === 'category' &&
      name.toLowerCase() === 'skill'
    ) {
      continue;
    }

    if (!category || !name) continue;

    if (!categories.has(category)) {
      categories.set(category, []);
    }

    categories.get(category)!.push({
      name,
      level: normalizeSkillLevel(rawLevel),
    });
  }

  return [...categories.entries()].map(([category, skills]) => ({
    category,
    skills,
  }));
}

export const DEFAULT_SKILLS_DATA: SkillCategory[] =
  parseSkillsCsv(SKILLS_FALLBACK_CSV);

export const FALLBACK_SKILLS_DATA: SkillCategory[] = DEFAULT_SKILLS_DATA;

export async function fetchSkillsData(
  url = 'assets/data/skills.csv'
): Promise<SkillCategory[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    const parsed = parseSkillsCsv(text);
    return parsed.length > 0 ? parsed : DEFAULT_SKILLS_DATA;
  } catch {
    return DEFAULT_SKILLS_DATA;
  }
}
