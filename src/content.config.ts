import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const specSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  note: z.string().optional(),
});

const figureSchema = z.object({
  src: z.string().startsWith('/assets/'),
  alt: z.string().min(1),
  caption: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  surface: z.enum(['dark', 'neutral', 'light']).default('neutral'),
});

const videoSchema = z.object({
  src: z.string().startsWith('/assets/'),
  title: z.string().min(1),
  caption: z.string().min(1),
  poster: z.string().startsWith('/assets/').optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    order: z.number().int().positive(),
    slug: z.enum(['typhoon', 'bikeysens', 'rcxd', 'team-214']),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    period: z.string().min(1),
    domain: z.string().min(1),
    context: z.string().min(1),
    role: z.string().min(1),
    team: z.string().optional(),
    status: z.enum(['completed', 'in-progress']),
    statusLabel: z.string().optional(),
    tileImage: z.string().startsWith('/assets/'),
    tileAlt: z.string().min(1),
    tileWidth: z.number().int().positive(),
    tileHeight: z.number().int().positive(),
    overlaySummary: z.string().min(1),
    highlights: z.array(z.string().min(1)).min(3),
    tags: z.array(z.string().min(1)).min(3),
    heroFigure: figureSchema,
    video: videoSchema.optional(),
    specs: z.array(specSchema).min(4),
    sourcesNote: z.string().min(1),
  }),
});

export const collections = { projects };
