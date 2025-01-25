import NextAuth from "next-auth";
import { cache } from "react";

import { db } from "~/server/db";
import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
      authenticatorsTable: authenticators
    }),
    session: { strategy: "database" },
    ...authConfig
});

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
