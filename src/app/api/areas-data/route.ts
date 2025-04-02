import { type NextRequest } from "next/server";
import { getValidFilters } from "~/lib/data-table-func";
import { restrictUser } from "~/lib/utils";
import { searchAreasDataApiLoader } from "~/lib/validations/search-params";
import { auth } from "~/server/auth";
import { getAreasData } from "~/server/queries/area-data";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    const error = new Error("No access")
    Sentry.captureException(new Error(`No access: GET (areas-data), userId: ${session?.user.id}`));
    return Response.json({ message: 'No access', error }, { status: 403 })
  }

  try {
    const search = searchAreasDataApiLoader(request)
  
    const validFilters = getValidFilters(search.filters)

    const data = await getAreasData({ ...search, filters: validFilters })
    if (data.error !== null) throw new Error(data.error)
    return Response.json(data)
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return Response.json({ message: 'Internal Server Error', error }, { status: 500 })
  }
}