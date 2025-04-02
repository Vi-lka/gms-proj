/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { env } from "~/env";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export async function POST(req: Request) {
  try {
    if (!req.body) {
      return Response.json(
        { error: "Error can't be tunneled because the body is empty." },
        { status: 400 }
      );
    }

    const envelope = await req.text();

    const piece = envelope.split("\n")[0];
    if (!piece) {
      return Response.json(
        { error: "Error can't be tunneled because the envelope text is empty." },
        { status: 400 }
      );
    }

    const header = JSON.parse(piece);

    const dsn = new URL(header.dsn);
    const dns_env = new URL(env.NEXT_PUBLIC_SENTRY_DSN);
    if (dsn.hostname !== dns_env.hostname) {
      const error = `Invalid Sentry host: ${dsn.hostname}`
      console.error(error)
      return Response.json(
        { error },
        { status: 400 }
      );
    }

    const project_id = dsn.pathname.substring(1);
    const project_id_env = dns_env.pathname.substring(1);
    if (project_id !== project_id_env) {
      const error = `Invalid Project ID: ${project_id}`
      console.error(error)
      return Response.json(
        { error },
        { status: 400 }
      );
    }

    const url = `https://${dns_env.hostname}/api/${project_id}/envelope/`;
    await fetch(url, {
      method: "POST",
      body: envelope,
      headers: {
        "Content-Type": "application/x-sentry-envelope",
      },
    });
  } catch (e) {
    return Response.json(
      {
        error: "Could not tunnel Sentry error correctly.",
        data: (e as Error).message,
      },
      { status: 500 }
    );
  }

  return Response.json({ message: "Error sent." }, { status: 200 });
}