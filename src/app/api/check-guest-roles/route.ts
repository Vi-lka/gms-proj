import { NextResponse } from 'next/server';
import { createLogger, format, transports } from 'winston';
import { env } from '~/env';
import { db } from '~/server/db';
import { and, eq, lte } from "drizzle-orm";
import { users } from '~/server/db/schema';
import * as Sentry from "@sentry/nextjs";

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console()
  ],
});

export async function GET(request: Request) {
  // Protected route
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    Sentry.captureException(new Error("Unauthorized: authorization header is missing or incorrect (check-guest-roles)"));
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const currentDate = new Date();

    await db.transaction(async (tx) => {
      const guestUsers = await tx
        .select()
        .from(users)
        .where(
          and(
            eq(users.role, 'guest'),
            lte(users.guestUntil, currentDate)
          )
        );

      for (const user of guestUsers) {
        await tx
          .update(users)
          .set({ role: 'unknown' })
          .where(eq(users.id, user.id));
        logger.info(`Updated role to 'unknown' for user ID: ${user.id}, name: ${user.name}, email: ${user.email}`);
      }

      logger.info(`Checked ${guestUsers.length} guest users`);
    });

    return NextResponse.json({ message: 'Guest roles checked successfully' });
  } catch (error) {
    logger.error('Error checking guest roles', { error });
    Sentry.captureException(error);
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}