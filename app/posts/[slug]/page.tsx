import Link from "next/link";
import { notFound } from "next/navigation";
import { postsStore } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await postsStore.findFirst({
    where: { slug: (await params).slug, published: true },
  });

  if (!post) notFound();

  return (
    <div className="site-shell article-shell">
      <header className="site-header">
        <Link className="brand" href="/"><span className="brand-mark">CA</span><span>Caderno Aberto</span></Link>
        <Link className="back-link" href="/">← Voltar ao arquivo</Link>
      </header>
      <main className="article-page">
        <p className="eyebrow">Ensaio · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(post.createdAt)}</p>
        <h1>{post.title}</h1>
        <p className="article-lede">{post.excerpt}</p>
        {post.coverImage && <div className="article-cover" style={{ backgroundImage: `url(${post.coverImage})` }} />}
        <div className="article-content">{post.content}</div>
      </main>
    </div>
  );
}