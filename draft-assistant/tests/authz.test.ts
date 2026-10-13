import { describe, expect, it } from "vitest";
import { canAccessRecord, evaluateAccess, normalizeEmail } from "@/lib/authz";

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Nick@A2O.Example ")).toBe("nick@a2o.example");
  });
  it("returns null for empty or missing values", () => {
    expect(normalizeEmail("")).toBeNull();
    expect(normalizeEmail("   ")).toBeNull();
    expect(normalizeEmail(undefined)).toBeNull();
  });
});

describe("evaluateAccess", () => {
  const allowlist = ["test.user@a2oarchitecture.example", "Second@Example.com"];

  it("allows an existing app user without consulting the allowlist", () => {
    expect(
      evaluateAccess({ hasExistingUser: true, email: null, allowlist: [] }),
    ).toEqual({ allowed: true, reason: "existing_user" });
  });

  it("allows an allowlisted email, case-insensitively", () => {
    expect(
      evaluateAccess({ hasExistingUser: false, email: "SECOND@example.com", allowlist }),
    ).toEqual({ allowed: true, reason: "allowlisted" });
  });

  it("rejects a signed-in user whose email is not allowlisted", () => {
    expect(
      evaluateAccess({ hasExistingUser: false, email: "stranger@example.com", allowlist }),
    ).toEqual({ allowed: false, reason: "not_allowlisted" });
  });

  it("rejects when no email is available", () => {
    expect(
      evaluateAccess({ hasExistingUser: false, email: undefined, allowlist }),
    ).toEqual({ allowed: false, reason: "no_email" });
  });
});

describe("canAccessRecord", () => {
  it("lets members touch only their own records", () => {
    const member = { id: "u1", role: "MEMBER" as const };
    expect(canAccessRecord(member, { userId: "u1" })).toBe(true);
    expect(canAccessRecord(member, { userId: "u2" })).toBe(false);
  });
  it("lets admins touch anyone's records", () => {
    expect(canAccessRecord({ id: "a", role: "ADMIN" }, { userId: "u2" })).toBe(true);
  });
});
