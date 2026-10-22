import { NextResponse } from "next/server";
import { postsStore } from "@/lib/posts";

function normalizePostInput(body: unknown) {
  if (!body || typeof body !== "object") {
    return { error: "Dados inválidos." };
  }

  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const excerpt = typeof input.excerpt === "string" ? input.excerpt.trim() : "";
  const content = typeof input.content === "string" ? input.content.trim() : "";
  const coverImage = typeof input.coverImage === "string" ? input.coverImage.trim() : null;
  const published = input.published === true;

  if (!title || !excerpt || !content) {
    return { error: "Título, resumo e conteúdo são obrigatórios." };
  }

  if (excerpt.length > 280) {
    return { error: "O resumo deve ter no máximo 280 caracteres." };
  }

  return { title, excerpt, content, coverImage: coverImage || null, published };
}

function createSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "post";
}

async function uniqueSlug(title: string) {
  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let suffix = 2;

  while (await postsStore.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function GET() {
  const posts = await postsStore.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const input = normalizePostInput(await request.json());

    if ("error" in input) {
      return NextResponse.json(input, { status: 400 });
    }

    const post = await postsStore.create({
      data: {
        ...input,
        slug: await uniqueSlug(input.title),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o post." }, { status: 500 });
  }
}