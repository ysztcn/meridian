import MailerLite from '@mailerlite/mailerlite-nodejs';
import { getDb } from '@meridian/database';
import { $newsletter } from '@meridian/database';
import { z } from 'zod';

export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event);

  // Parse the request body to get the email
  const body = await readBody(event);
  const bodyContent = z.object({ email: z.string().email() }).safeParse(body);
  if (bodyContent.success === false) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email format' });
  }

  try {
    // Insert email into the newsletter table
    await Promise.all([
      getDb(config.DATABASE_URL).insert($newsletter).values({ email: bodyContent.data.email }).onConflictDoNothing(),
      (async () => {
        if (config.mailerlite.api_key === undefined) {
          return; // nothing if the API key is not set
        }
        const mailerlite = new MailerLite({ api_key: config.mailerlite.api_key });
        try {
          await mailerlite.subscribers.createOrUpdate({
            email: bodyContent.data.email,
            status: 'active',
            opted_in_at: new Date().toISOString(),
            subscribed_at: new Date().toISOString(),
            groups: config.mailerlite.group_id ? [config.mailerlite.group_id] : [],
          });
        } catch (error) {
          console.error('MailerLite error:', error);
          throw createError({ statusCode: 500, statusMessage: 'MailerLite error' });
        }
      })(),
    ]);

    return { success: true, message: 'Successfully subscribed' };
  } catch (error: any) {
    console.error('Database error:', error);
    throw createError({ statusCode: 500, statusMessage: 'Database error' });
  }
});
