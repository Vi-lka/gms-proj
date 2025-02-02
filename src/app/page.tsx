import React from "react";
import { getMap, getMapItems } from "~/server/queries/map";
import Map from "./Map";
import { auth } from "~/server/auth";
import { providerMap } from "~/server/auth/config";
import SignInForm from "~/components/auth/sign-in";
import { restrictUser } from "~/lib/utils";
import { Ban } from "lucide-react";

type SearchParams = Promise<{ callbackUrl: string | undefined, code: string | undefined }>

export default async function HomePage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams

  const session = await auth()

  const providers = Object.values(providerMap)

  if (!session?.user) return <SignInForm providers={providers} callbackUrl={searchParams.callbackUrl} />

  if (!restrictUser(session.user.role, "content")) {
    const promises = Promise.all([
      getMap(),
      getMapItems(),
    ])

    return (
      <main className="min-h-screen flex flex-col overflow-hidden">
        <div className="flex flex-col flex-grow">
          <React.Suspense
            fallback={"Loading..."}
          >
            <Map promises={promises} />
          </React.Suspense>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-muted">
      <div className="p-8 bg-background rounded-lg shadow-md max-w-md w-full">
        <div className="flex items-center justify-center text-yellow mb-4">
          <Ban size={48} />
        </div>
        <h1 className="text-2xl text-foreground font-bold text-center mb-4">Доступ запрещен</h1>
        <p className="text-foreground/70 text-center mb-6">
          Обратитесь к администратору для предоставления доступа к ресурсу
        </p>
      </div>
    </div>
  )
}
