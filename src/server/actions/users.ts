"use server"

import { revalidateTag, unstable_noStore as noStore } from "next/cache"
import { db } from "../db"
import { sessions, users } from "../db/schema"
import { eq, inArray } from "drizzle-orm"
import { takeFirstOrThrow } from "../db/utils"
import { getErrorMessage } from "~/lib/handle-error"
import { auth } from "../auth"
import { restrictUser } from "~/lib/utils"
import { type UpdateUserSchema } from "~/lib/validations/forms"
import * as Sentry from "@sentry/nextjs";

export async function updateUser(input: UpdateUserSchema & { id: string }) {
  noStore();

  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel-users')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: updateUser, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }
  
  try {
    const guestUntilGMT = input.role === "guest" ? new Date(input.guestUntil) : null

    const data = await db
      .update(users)
      .set({
        role: input.role,
        guestUntil: guestUntilGMT,
      })
      .where(eq(users.id, input.id))
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("users")
    if (data.role === input.role) {
      revalidateTag("users-role-counts")
    }

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    Sentry.captureException(err);
    console.error(err);
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteUsers(ids: string[]) {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel-users')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: deleteUsers, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    await db
      .delete(users)
      .where(inArray(users.id, ids))

    revalidateTag("users")
    revalidateTag("users-role-counts")

    return {
      data: null,
      error: null
    }
  } catch (err) {
    Sentry.captureException(err);
    console.error(err);
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteSessions(ids: string[]) {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel-users')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: deleteSessions, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    await db
      .delete(sessions)
      .where(inArray(sessions.userId, ids))

    revalidateTag("users")
    revalidateTag("users-role-counts")

    return {
      data: null,
      error: null
    }
  } catch (err) {
    Sentry.captureException(err);
    console.error(err);
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}