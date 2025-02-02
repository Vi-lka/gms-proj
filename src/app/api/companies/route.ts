import { and, inArray, notInArray } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { restrictUser } from "~/lib/utils";
import { searchCompaniesApiLoader } from "~/lib/validations/search-params";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { companies, companiesToMapItems } from "~/server/db/schema";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    const error = new Error("No access")
    return Response.json({ message: 'No access', error }, { status: 403 })
  }

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

  try {
    const data = await db.query.companies.findMany({
      where
    })
    return Response.json(data)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error }, { status: 500 })
  }
}