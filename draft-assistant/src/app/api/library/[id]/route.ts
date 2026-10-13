import { authErrorResponse, getSessionUser } from "@/lib/auth";
import { NotFoundError, deleteSavedOutput, getSavedOutput, updateSavedOutput } from "@/lib/library";
import { formatZodError, savedOutputUpdateSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

function handleError(err: unknown): Response {
  if (err instanceof NotFoundError) return Response.json({ error: err.message }, { status: 404 });
  return authErrorResponse(err) ?? Response.json({ error: "Request failed." }, { status: 500 });
}

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const user = await getSessionUser();
    const { id } = await ctx.params;
    return Response.json(await getSavedOutput(user, id));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await getSessionUser();
    const { id } = await ctx.params;
    const parsed = savedOutputUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: formatZodError(parsed.error) }, { status: 400 });
    const row = await updateSavedOutput(user, id, parsed.data);
    return Response.json({ id: row.id, updatedAt: row.updatedAt });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const user = await getSessionUser();
    const { id } = await ctx.params;
    await deleteSavedOutput(user, id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
