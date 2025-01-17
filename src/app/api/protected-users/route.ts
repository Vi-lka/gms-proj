import { type NextRequest } from "next/server"
import { env } from "~/env"
import { db } from "~/server/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const headerKey = request.headers.get("Control-Key")
  
  if (headerKey !== env.CONTROL_KEY) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const data = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        role: true
      }
    })
    
    return Response.json({ data }) 
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error }, { status: 500 })
  }
}