import { type NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    const error = new Error("No access")
    return Response.json({ message: 'No access', error }, { status: 403 })
  }

  try {
    const data = await db.query.licensedAreas.findMany()
    return Response.json(data)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error }, { status: 500 })
  }
}