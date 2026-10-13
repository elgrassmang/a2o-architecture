/**
 * Pure authorization rules. No framework or database imports so they are
 * trivially testable; `auth.ts` wires them to Clerk and Prisma.
 */

export type Role = "ADMIN" | "MEMBER";

export type AccessDecision =
  | { allowed: true; reason: "existing_user" | "allowlisted" }
  | { allowed: false; reason: "no_email" | "not_allowlisted" };

export function normalizeEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim().toLowerCase() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * A signed-in person may use the app if they already have an AppUser row or
 * if their primary email is on the allowlist. Authentication alone is never enough.
 */
export function evaluateAccess(input: {
  hasExistingUser: boolean;
  email: string | null | undefined;
  allowlist: readonly string[];
}): AccessDecision {
  if (input.hasExistingUser) return { allowed: true, reason: "existing_user" };
  const email = normalizeEmail(input.email);
  if (!email) return { allowed: false, reason: "no_email" };
  const allowed = input.allowlist.some((a) => normalizeEmail(a) === email);
  return allowed
    ? { allowed: true, reason: "allowlisted" }
    : { allowed: false, reason: "not_allowlisted" };
}

/** Members may only touch their own records; admins may touch anyone's. */
export function canAccessRecord(
  actor: { id: string; role: Role },
  record: { userId: string },
): boolean {
  return actor.role === "ADMIN" || actor.id === record.userId;
}
