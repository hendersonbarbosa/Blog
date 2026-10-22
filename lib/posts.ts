// Dados temporários de demonstração. Nenhuma conexão com banco é aberta.
type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Where = Partial<Pick<Post, "id" | "slug" | "published">>;
type PostInput = Omit<Post, "id" | "createdAt" | "updatedAt">;

const globalForPosts = globalThis as typeof globalThis & {
  demoPosts?: { posts: Post[]; nextId: number };
};
const state = globalForPosts.demoPosts ??= { posts: [], nextId: 1 };

function matches(post: Post, where: Where = {}) {
  return Object.entries(where).every(([key, value]) => post[key as keyof Where] === value);
}

export const postsStore = {
  async findMany({ where, orderBy }: { where?: Where; orderBy?: { createdAt: "desc" | "asc" } } = {}) {
    const posts = state.posts.filter((post) => matches(post, where));
    if (orderBy) posts.sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime()) * (orderBy.createdAt === "desc" ? -1 : 1));
    return posts;
  },
  async findUnique({ where }: { where: Where }) {
    return state.posts.find((post) => matches(post, where)) ?? null;
  },
  async findFirst({ where }: { where: Where }) {
    return state.posts.find((post) => matches(post, where)) ?? null;
  },
  async create({ data }: { data: PostInput }) {
    const now = new Date();
    const post = { ...data, id: state.nextId++, createdAt: now, updatedAt: now };
    state.posts.push(post);
    return post;
  },
  async update({ where, data }: { where: Where; data: Record<string, string | boolean | null> }) {
    const post = state.posts.find((post) => matches(post, where));
    if (!post) throw new Error("Post não encontrado.");
    for (const key of ["title", "excerpt", "content", "coverImage"] as const) {
      if (typeof data[key] === "string") post[key] = data[key];
    }
    if (data.coverImage === null) post.coverImage = null;
    if (typeof data.published === "boolean") post.published = data.published;
    post.updatedAt = new Date();
    return post;
  },
  async delete({ where }: { where: Where }) {
    const index = state.posts.findIndex((post) => matches(post, where));
    if (index === -1) throw new Error("Post não encontrado.");
    return state.posts.splice(index, 1)[0];
  },
};
