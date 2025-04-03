import { isRedirectError } from "next/dist/client/components/redirect-error"
import { z } from "zod"
import { errorToast } from "~/components/ui/special/error-toast"

export function getErrorMessage(err: unknown) {
  const unknownError = "Что-то пошло не так, повторите попытку позже."

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message
    })
    return errors.join("\n")
  } else if (err instanceof Error) {
    return err.message
  } else if (isRedirectError(err)) {
    throw err
  } else {
    return unknownError
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err)
  return errorToast(errorMessage)
}