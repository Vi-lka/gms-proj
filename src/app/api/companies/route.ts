import { type NextRequest } from "next/server";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  try {
    const data = await db.query.companies.findMany()
    return Response.json(data)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error }, { status: 500 })
  }
}