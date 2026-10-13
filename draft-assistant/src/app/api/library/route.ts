import { authErrorResponse, getSessionUser } from "@/lib/auth";
import { createSavedOutput, listSavedOutputs } from "@/lib/library";
import { formatZodError, librarySearchSchema, savedOutputCreateSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    const url = new URL(request.url);
    const parsed = librarySearchSchema.safeParse({
      q: url.searchParams.get("q") ?? "",
      type: url.searchParams.get("type") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) return Response.json({ error: formatZodError(parsed.error) }, { status: 400 });
    const items = await listSavedOutputs(user, parsed.data);
    return Response.json({ items });
  } catch (err) {
    return authErrorResponse(err) ?? Response.json({ error: "Request failed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return Response.json({ error: "Request body must be JSON." }, { status: 400 });
    }
    const parsed = savedOutputCreateSchema.safeParse(raw);
    if (!parsed.success) return Response.json({ error: formatZodError(parsed.error) }, { status: 400 });
    const row = await createSavedOutput(user, parsed.data);
    return Response.json({ id: row.id }, { status: 201 });
  } catch (err) {
    return authErrorResponse(err) ?? Response.json({ error: "Request failed." }, { status: 500 });
  }
}
