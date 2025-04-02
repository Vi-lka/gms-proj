import { notInArray, isNotNull, and, inArray } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { restrictUser } from "~/lib/utils";
import { searchClustersApiLoader } from "~/lib/validations/search-params";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { clusters, mapItems } from "~/server/db/schema";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    const error = new Error("No access")
    Sentry.captureException(new Error(`No access: GET (clusters), userId: ${session?.user.id}`));
    return Response.json({ message: 'No access', error }, { status: 403 })
  }

  try {
    const search = searchClustersApiLoader(request)

    const where = and(
      search.hasMapItem === true ? inArray(
        clusters.id,
        db
          .select({ clusterId: mapItems.clusterId })
          .from(mapItems)
          .where(isNotNull(mapItems.clusterId))
      ) : undefined,
      search.hasMapItem === false ? notInArray(
        clusters.id,
        db
          .select({ clusterId: mapItems.clusterId })
          .from(mapItems)
          .where(isNotNull(mapItems.clusterId))
      ) : undefined,
    )

    const data = await db.query.clusters.findMany({
      where,
      orderBy: (clusters, { asc }) => [asc(clusters.name)]
    })

    return Response.json(data)
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return Response.json({ message: 'Internal Server Error', error }, { status: 500 })
  }
}