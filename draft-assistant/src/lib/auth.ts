import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { env } from "@/env";
import { evaluateAccess, normalizeEmail, type Role } from "@/lib/authz";

export type SessionUser = { id: string; email: string; role: Role };

export class ForbiddenError extends Error {
  constructor(message = "You are signed in but not authorized to use this app.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("Sign in required.");
    this.name = "UnauthenticatedError";
  }
}

/**
 * Data-access-layer entry point for every protected page and route.
 * 1. Clerk verifies the session cookie server-side.
 * 2. We check authorization: an AppUser row, or an allowlisted email on first visit.
 * Returns the narrow user record; throws otherwise.
 */
export async function getSessionUser(): Promise<SessionUser> {
  const { userId } = await auth();
  if (!userId) throw new UnauthenticatedError();

  const existing = await db.appUser.findUnique({ where: { id: userId } });
  if (existing) return { id: existing.id, email: existing.email, role: existing.role };

  const clerkUser = await currentUser();
  const email = normalizeEmail(
    clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses[0]?.emailAddress,
  );
  const decision = evaluateAccess({
    hasExistingUser: false,
    email,
    allowlist: env().ALLOWED_EMAILS,
  });
  if (!decision.allowed || !email) throw new ForbiddenError();

  const isFirstUser = (await db.appUser.count()) === 0;
  const created = await db.appUser.create({
    data: { id: userId, email, role: isFirstUser ? "ADMIN" : "MEMBER" },
  });
  return { id: created.id, email: created.email, role: created.role };
}

/** For server components: redirect instead of throwing. */
export async function requireUserOrRedirect(): Promise<SessionUser> {
  try {
    return await getSessionUser();
  } catch (err) {
    if (err instanceof UnauthenticatedError) redirect("/sign-in");
    if (err instanceof ForbiddenError) redirect("/not-authorized");
    throw err;
  }
}

/** For route handlers: map auth failures to HTTP responses. */
export function authErrorResponse(err: unknown): Response | null {
  if (err instanceof UnauthenticatedError)
    return Response.json({ error: err.message }, { status: 401 });
  if (err instanceof ForbiddenError)
    return Response.json({ error: err.message }, { status: 403 });
  return null;
}
