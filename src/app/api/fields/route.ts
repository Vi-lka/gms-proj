import { and, eq, inArray, isNotNull, isNull, notInArray, or } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { restrictUser } from "~/lib/utils";
import { searchFieldsApiLoader } from "~/lib/validations/search-params";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { type FieldExtend, fields, fieldsMaps } from "~/server/db/schema";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    const error = new Error("No access")
    Sentry.captureException(new Error(`No access: GET (fields), userId: ${session?.user.id}`));
    return Response.json({ message: 'No access', error }, { status: 403 })
  }

  try {
    const search = searchFieldsApiLoader(request)

    const where = or(
      and(
        search.hasMapItem === true ? isNotNull(fields.mapItemId) : undefined,
        search.hasMapItem === false ? isNull(fields.mapItemId) : undefined,
        search.mapItemId ? eq(fields.mapItemId, search.mapItemId) : undefined,
        search.companyId ? eq(fields.companyId, search.companyId) : undefined,
        search.hasFieldMap === true ? inArray(
          fields.id,
          db
            .select({ fieldId: fieldsMaps.fieldId })
            .from(fieldsMaps)
        ) : undefined,
        search.hasFieldMap === false ? notInArray(
          fields.id,
          db
            .select({ fieldId: fieldsMaps.fieldId })
            .from(fieldsMaps)
        ) : undefined,
      ),
      search.fieldsIds ? inArray(fields.id, search.fieldsIds) : undefined,
    )

    const data = await db.query.fields.findMany({
      where,
      with: {
        userUpdated: {
          columns: { name: true }
        },
        userCreated: {
          columns: { name: true }
        },
        company: true,
      },
      orderBy: (fields, { asc }) => [asc(fields.name)]
    })
    const transformData: FieldExtend[] = data.map(({ userCreated, userUpdated, ...item }) => ({
      ...item,
      createUserName: userCreated ? userCreated.name : null,
      updateUserName: userUpdated ? userUpdated.name : null,
      companyName: item.company.name
    }))
    return Response.json(transformData)
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return Response.json({ message: 'Internal Server Error', error }, { status: 500 })
  }
}