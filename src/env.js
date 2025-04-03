import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_URL: z.string(),
    // AUTH_REDIRECT_PROXY_URL: z.string(),
    AUTH_YANDEX_ID: z.string(),
    AUTH_YANDEX_SECRET: z.string(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    DB_HOST: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_PORT: z.coerce.number(),
    DATABASE_URL: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    IS_VERCEL: z
      .enum(["true", "false"])
      .default("true")
      .optional(),
    CONTROL_KEY: z.string(),
    CRON_SECRET: z.string(),
    S3_ENDPOINT: z.string(),
    S3_PORT: z.coerce.number(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_BUCKET_NAME: z.string(),
    S3_USE_SSL: z.string(),
    SENTRY_URL: z.string(),
    SENTRY_DSN: z.string(),
    SENTRY_ORG: z.string(),
    SENTRY_PROJECT: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_URL: z.string(),
    NEXT_PUBLIC_S3_PATH: z.string().optional(),
    NEXT_PUBLIC_IS_VERCEL: z
    .enum(["true", "false"])
    .default("true")
    .optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    // AUTH_REDIRECT_PROXY_URL: process.env.AUTH_REDIRECT_PROXY_URL,
    AUTH_YANDEX_ID: process.env.AUTH_YANDEX_ID,
    AUTH_YANDEX_SECRET: process.env.AUTH_YANDEX_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    IS_VERCEL: process.env.IS_VERCEL,
    CONTROL_KEY: process.env.CONTROL_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_PORT: process.env.S3_PORT,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_USE_SSL: process.env.S3_USE_SSL,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_S3_PATH: process.env.NEXT_PUBLIC_S3_PATH,
    NEXT_PUBLIC_IS_VERCEL: process.env.NEXT_PUBLIC_IS_VERCEL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    SENTRY_URL: process.env.SENTRY_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_PROJECT,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
