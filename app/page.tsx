import Link from "next/link";
import { postsStore } from "@/lib/posts";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function Home() {
  const posts = await postsStore.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">CA</span>
          <span>Caderno Aberto</span>
        </Link>
        <nav className="header-nav" aria-label="Navegação principal">
          <a href="#arquivo">Arquivo</a>
          <Link className="admin-link" href="/admin">Painel editorial <span>↗</span></Link>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <p className="eyebrow">Notas para uma vida com mais intenção</p>
          <h1>Ideias que merecem<br /><em>ficar por perto.</em></h1>
          <p className="hero-copy">Ensaios, conversas e descobertas sobre trabalho, cultura e os pequenos movimentos que mudam a direção.</p>
          <a className="scroll-cue" href="#arquivo">Leia o arquivo <span>↓</span></a>
        </section>

        <section className="archive-section" id="arquivo">
          <div className="section-heading">
            <div>
              <p className="eyebrow">O arquivo</p>
              <h2>Leituras recentes</h2>
            </div>
            <span className="post-count">{posts.length.toString().padStart(2, "0")} textos</span>
          </div>

          {posts.length > 0 ? (
            <div className="post-grid">
              {posts.map((post, index) => (
                <Link className={`post-card ${index === 0 ? "featured-post" : ""}`} href={`/posts/${post.slug}`} key={post.id}>
                  <div className="post-image" style={post.coverImage ? { backgroundImage: `url(${post.coverImage})` } : undefined}>
                    {!post.coverImage && <span>{String(index + 1).padStart(2, "0")}</span>}
                  </div>
                  <div className="post-meta"><span>{formatDate(post.createdAt)}</span><span>•</span><span>Ensaio</span></div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className="read-link">Ler texto <span>→</span></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-public">
              <span className="empty-number">01</span>
              <div><h3>O primeiro texto está chegando.</h3><p>Enquanto isso, o arquivo permanece aberto. Volte em breve.</p></div>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Caderno Aberto</span>
        <span>Feito para ideias que ficam.</span>
      </footer>
    </div>
  );
}
