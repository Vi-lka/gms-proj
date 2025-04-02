import { eq } from "drizzle-orm"
import { type NextRequest } from "next/server"
import { env } from "~/env"
import { db } from "~/server/db"
import { roleEnum, users } from "~/server/db/schema"
import { takeFirstOrThrow } from "~/server/db/utils"
import * as Sentry from "@sentry/nextjs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ user: string }> }
) {
  const headerKey = request.headers.get("Control-Key")
  
  if (headerKey !== env.CONTROL_KEY) {
    Sentry.captureException(new Error("Unauthorized: Control-Key header is missing or incorrect (protected-users/[user])"));
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = (await params).user

  try {
    const formData = await request.formData()
    const role = formData.get("role")

    const correctRole = roleEnum.enumValues.find((el) => el === role?.toString())

    if (!correctRole) return new Response('Incorrect formData', { status: 400 })

    const data = await db
      .update(users)
      .set({
        role: correctRole
      })
      .where(eq(users.id, userId))
      .returning()
      .then(takeFirstOrThrow)
    
    return Response.json({ data }) 
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return Response.json({ message: 'Internal Server Error', error: error }, { status: 500 })
  }

}