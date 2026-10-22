import { NextResponse } from "next/server";
import { postsStore } from "@/lib/posts";

type RouteParams = { params: Promise<{ id: string }> };

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const id = parseId((await params).id);

  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const post = await postsStore.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const id = parseId((await params).id);

  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const data: Record<string, string | boolean | null> = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.excerpt === "string") data.excerpt = body.excerpt.trim();
    if (typeof body.content === "string") data.content = body.content.trim();
    if (typeof body.coverImage === "string") data.coverImage = body.coverImage.trim() || null;
    if (typeof body.published === "boolean") data.published = body.published;

    if (data.title === "" || data.excerpt === "" || data.content === "") {
      return NextResponse.json({ error: "Os campos de texto não podem ficar vazios." }, { status: 400 });
    }

    if (typeof data.excerpt === "string" && data.excerpt.length > 280) {
      return NextResponse.json({ error: "O resumo deve ter no máximo 280 caracteres." }, { status: 400 });
    }

    const post = await postsStore.update({ where: { id }, data });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar o post." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const id = parseId((await params).id);

  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    await postsStore.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Não foi possível excluir o post." }, { status: 404 });
  }
}