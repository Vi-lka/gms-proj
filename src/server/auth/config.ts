/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import { type Provider } from "next-auth/providers";
import Yandex from "next-auth/providers/yandex";
import { env } from "~/env";
import { type UserRole } from "~/lib/types";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      role: UserRole
    } & DefaultSession["user"];
  }
}

const providers: Provider[] = [
  Yandex({
    profile(profile) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      return { ...profile, name: profile.real_name, email: profile.default_email, role: (profile as any).role ?? 'unknown' }
    }
  }),
]

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider()
    return { id: providerData.id, name: providerData.name }
  } else {
    return { id: provider.id, name: provider.name }
  }
})
.filter((provider) => provider.id !== "credentials")

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  secret: env.AUTH_SECRET,
  providers,
  trustHost: true,
  // pages: {
    // signIn: "/sign-in"
  // },
  callbacks: {
    // async jwt({ token, user }) {
    //   if (user) {
    //     token.role = (user as any).role
    //     token.id = user.id
    //   }
    //   return token
    // },
    // async session({ session, token }) {
    //   session.user.role = token.role as "admin" | "user"
    //   session.user.id = token.id as string
    //   return session
    // },
    async session({ session, user }) {
      session.user.role = (user as any).role
      return ({
        ...session,
        user: {
          id: user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: session.user.role,
        },
      })
    },
    // async signIn(params) {
      // return (params.user as any).role === "admin"
    // }
  }
} satisfies NextAuthConfig;
