import { $articles, $sources, and, gte, lte, isNotNull, eq, not, $reports, desc } from '@meridian/database';
import { Env } from './index';
import { getDb } from './lib/utils';
import { Context, Hono } from 'hono';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { z } from 'zod';

type HonoEnv = { Bindings: Env };

function hasValidAuthToken(c: Context<HonoEnv>) {
  const auth = c.req.header('Authorization');
  if (auth === undefined || auth !== `Bearer ${c.env.MERIDIAN_SECRET_KEY}`) {
    return false;
  }
  return true;
}

const app = new Hono<HonoEnv>()
  .use(trimTrailingSlash())
  .get('/favicon.ico', async c => c.notFound()) // disable favicon
  .get('/ping', async c => c.json({ pong: true }))
  .get('/events', async c => {
    // require bearer auth token
    const hasValidToken = hasValidAuthToken(c);
    if (!hasValidToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if a date query parameter was provided in yyyy-mm-dd format
    const dateParam = c.req.query('date');

    let endDate: Date;
    if (dateParam) {
      // Parse the date parameter explicitly with UTC
      // Append T07:00:00Z to ensure it's 7am UTC
      endDate = new Date(`${dateParam}T07:00:00Z`);
      // Check if date is valid
      if (isNaN(endDate.getTime())) {
        return c.json({ error: 'Invalid date format. Please use yyyy-mm-dd' }, 400);
      }
    } else {
      // Use current date if no date parameter was provided
      endDate = new Date();
      // Set to 7am UTC today
      endDate.setUTCHours(7, 0, 0, 0);
    }

    // Create a 30-hour window ending at 7am UTC on the specified date
    const startDate = new Date(endDate.getTime() - 30 * 60 * 60 * 1000);

    const db = getDb(c.env);

    const allSources = await db.select({ id: $sources.id, name: $sources.name }).from($sources);

    let events = await db
      .select({
        id: $articles.id,
        sourceId: $articles.sourceId,
        url: $articles.url,
        title: $articles.title,
        publishDate: $articles.publishDate,
        content: $articles.content,
        location: $articles.location,
        completeness: $articles.completeness,
        relevance: $articles.relevance,
        summary: $articles.summary,
        createdAt: $articles.createdAt,
      })
      .from($articles)
      .where(
        and(
          isNotNull($articles.location),
          gte($articles.publishDate, startDate),
          lte($articles.publishDate, endDate),
          eq($articles.relevance, 'RELEVANT'),
          not(eq($articles.completeness, 'PARTIAL_USELESS')),
          isNotNull($articles.summary)
        )
      );

    const response = {
      sources: allSources,
      events,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    return c.json(response);
  })
  .get('/last-report', async c => {
    // check auth token
    const hasValidToken = hasValidAuthToken(c);
    if (!hasValidToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const report = await getDb(c.env).query.$reports.findFirst({
        orderBy: desc($reports.createdAt),
      });
      if (report === undefined) {
        return c.json({ error: 'No report found' }, 404);
      }

      return c.json(report);
    } catch (error) {
      console.error('Error fetching last report', error);
      return c.json({ error: 'Failed to fetch last report' }, 500);
    }
  })
  .post('/report', async c => {
    // check auth token
    const hasValidToken = hasValidAuthToken(c);
    if (!hasValidToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const {
      title,
      content,
      totalArticles,
      totalSources,
      usedArticles,
      usedSources,
      tldr,
      createdAt,
      model_author,
      clustering_params,
    } = z
      .object({
        title: z.string(),
        content: z.string(),
        totalArticles: z.number(),
        totalSources: z.number(),
        usedArticles: z.number(),
        usedSources: z.number(),
        tldr: z.string(),
        createdAt: z.coerce.date(),
        model_author: z.string(),
        clustering_params: z.object({
          umap: z.object({
            n_neighbors: z.number(),
          }),
          hdbscan: z.object({
            min_cluster_size: z.number(),
            min_samples: z.number(),
            epsilon: z.number(),
          }),
        }),
      })
      .parse(body);

    try {
      await getDb(c.env).insert($reports).values({
        title,
        content,
        totalArticles,
        totalSources,
        usedArticles,
        usedSources,
        model_author,
        createdAt,
        tldr,
        clustering_params,
      });
    } catch (error) {
      console.error('Error inserting report', error);
      return c.json({ error: 'Failed to insert report' }, 500);
    }

    return c.json({ success: true });
  });

export default app;
