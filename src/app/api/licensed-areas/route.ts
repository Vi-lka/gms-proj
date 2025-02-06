import { and, eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { restrictUser } from "~/lib/utils";
import { searchLicensedAreasApiLoader } from "~/lib/validations/search-params";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { licensedAreas } from "~/server/db/schema";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    const error = new Error("No access")
    return Response.json({ message: 'No access', error }, { status: 403 })
  }

  const search = searchLicensedAreasApiLoader(request)

  const where = and(
    search.fieldId ? eq(licensedAreas.fieldId, search.fieldId) : undefined,
  )

  try {
    const data = await db.query.licensedAreas.findMany({
      where,
      orderBy: (licensedAreas, { asc }) => [asc(licensedAreas.name)]
    })
    return Response.json(data)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error }, { status: 500 })
  }
}