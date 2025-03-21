import { type NextRequest } from "next/server";
import { getValidFilters } from "~/lib/data-table-func";
import { restrictUser } from "~/lib/utils";
import { searchFilesApiLoader } from "~/lib/validations/search-params";
import { auth } from "~/server/auth";
import { getFiles } from "~/server/queries/files";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    const error = new Error("No access")
    return Response.json({ message: 'No access', error }, { status: 403 })
  }

  const search = searchFilesApiLoader(request)
  
  const validFilters = getValidFilters(search.filters)

  try {
    const result = await getFiles({ ...search, filters: validFilters })
    if (result.error !== null) throw new Error(result.error)
    return Response.json(result)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error }, { status: 500 })
  }
}