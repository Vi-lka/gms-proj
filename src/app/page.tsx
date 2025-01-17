import Link from "next/link";

export default async function HomePage() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/dashboard"
          >
            <h3 className="text-2xl font-bold">Dashboard →</h3>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/api/auth/signout"
          >
            <h3 className="text-2xl font-bold">Sign Out →</h3>
          </Link>
        </div>
      </div>
    </main>
  );
}
