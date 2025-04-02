import { and, eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { restrictUser } from "~/lib/utils";
import { searchLicensedAreasApiLoader } from "~/lib/validations/search-params";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { type LicensedAreaExtend, licensedAreas } from "~/server/db/schema";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    const error = new Error("No access")
    Sentry.captureException(new Error(`No access: GET (licensed-areas), userId: ${session?.user.id}`));
    return Response.json({ message: 'No access',  error }, { status: 403 })
  }

  try {
    const search = searchLicensedAreasApiLoader(request)

    const where = and(
      search.fieldId ? eq(licensedAreas.fieldId, search.fieldId) : undefined,
    )

    const data = await db.query.licensedAreas.findMany({
      where,
      with: {
        userUpdated: {
          columns: { name: true }
        },
        userCreated: {
          columns: { name: true }
        },
        field: {
          with: { company: true }
        }
      },
      orderBy: (licensedAreas, { asc }) => [asc(licensedAreas.name)]
    })
    const transformData: LicensedAreaExtend[] = data.map(({ userCreated, userUpdated, ...item }) => ({
      ...item,
      createUserName: userCreated ? userCreated.name : null,
      updateUserName: userUpdated ? userUpdated.name : null,
      fieldName: item.field.name,
      companyId: item.field.company.id,
      companyName: item.field.company.name,
    }))
    return Response.json(transformData)
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return Response.json({ message: 'Internal Server Error', error }, { status: 500 })
  }
}