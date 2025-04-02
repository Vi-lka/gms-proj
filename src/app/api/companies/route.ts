import { and, inArray, notInArray } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { restrictUser } from "~/lib/utils";
import { searchCompaniesApiLoader } from "~/lib/validations/search-params";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { companies, companiesToMapItems } from "~/server/db/schema";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    const error = new Error("No access")
    Sentry.captureException(new Error(`No access: GET (companies), userId: ${session?.user.id}`));
    return Response.json({ message: 'No access', error }, { status: 403 })
  }

  try {
    const search = searchCompaniesApiLoader(request)

    const where = and(
      search.hasMapItem === true ? inArray(
        companies.id,
        db
          .select({ companyId: companiesToMapItems.companyId })
          .from(companiesToMapItems)
      ) : undefined,
      search.hasMapItem === false ? notInArray(
        companies.id,
        db
          .select({ companyId: companiesToMapItems.companyId })
          .from(companiesToMapItems)
      ) : undefined,
    )

    const data = await db.query.companies.findMany({
      where,
      orderBy: (companies, { asc }) => [asc(companies.name)]
    })
    return Response.json(data)
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return Response.json({ message: 'Internal Server Error', error }, { status: 500 })
  }
}