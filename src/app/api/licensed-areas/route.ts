import { and, eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { restrictUser } from "~/lib/utils";
import { searchLicensedAreasApiLoader } from "~/lib/validations/search-params";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { type LicensedAreaExtend, licensedAreas } from "~/server/db/schema";

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
      with: {
        field: {
          with: { company: true }
        }
      },
      orderBy: (licensedAreas, { asc }) => [asc(licensedAreas.name)]
    })
    const transformData: LicensedAreaExtend[] = data.map((item) => ({
      ...item,
      fieldName: item.field.name,
      companyId: item.field.company.id,
      companyName: item.field.company.name,
    }))
    return Response.json(transformData)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error }, { status: 500 })
  }
}