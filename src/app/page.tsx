import React from "react";
import { getMap, getMapItems } from "~/server/queries/map";
import Map from "./Map";
import { auth } from "~/server/auth";
import { providerMap } from "~/server/auth/config";
import SignInForm from "~/components/auth/sign-in";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ callbackUrl: string | undefined, code: string | undefined }>

export default async function HomePage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams

  const session = await auth()

  const providers = Object.values(providerMap)

  if (!session?.user) return <SignInForm providers={providers} callbackUrl={searchParams.callbackUrl} />

  const promises = Promise.all([
    getMap(),
    getMapItems(),
  ])

  if (session.user.role === "admin") return (
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

  redirect("/sign-in")
}
