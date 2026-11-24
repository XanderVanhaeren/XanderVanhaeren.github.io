export const VALID_PROJECT_SLUGS = ['typhoon', 'bikeysens', 'rcxd', 'team-214'] as const;

export type ProjectSlug = (typeof VALID_PROJECT_SLUGS)[number];

export function isProjectSlug(value: string | null | undefined): value is ProjectSlug {
  return Boolean(value && (VALID_PROJECT_SLUGS as readonly string[]).includes(value));
}

export function getPreviewSlugFromSearch(search: string): ProjectSlug | null {
  const params = new URLSearchParams(search);
  const candidate = params.get('preview')?.trim();
  return isProjectSlug(candidate) ? candidate : null;
}

export function buildPreviewUrl(pathname: string, search: string, slug: ProjectSlug | null): string {
  const params = new URLSearchParams(search);
  if (slug) {
    params.set('preview', slug);
  } else {
    params.delete('preview');
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function stepProjectSlug(
  current: ProjectSlug,
  direction: 'prev' | 'next',
  orderedSlugs: readonly ProjectSlug[] = VALID_PROJECT_SLUGS
): ProjectSlug {
  const idx = orderedSlugs.indexOf(current);
  if (idx === -1 || orderedSlugs.length === 0) {
    return orderedSlugs[0] ?? current;
  }
  const delta = direction === 'next' ? 1 : -1;
  const nextIdx = (idx + delta + orderedSlugs.length) % orderedSlugs.length;
  return orderedSlugs[nextIdx];
}
