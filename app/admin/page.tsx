"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Post = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  createdAt: string;
};

type FormState = Omit<Post, "id" | "createdAt">;

const blankForm: FormState = { title: "", excerpt: "", content: "", coverImage: "", published: false };

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<FormState>(blankForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadPosts() {
    const response = await fetch("/api/posts", { cache: "no-store" });
    if (response.ok) setPosts(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/posts", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((data: Post[]) => {
        if (active) {
          setPosts(data);
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  function changeField(field: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editPost(post: Post) {
    setEditingId(post.id);
    setForm({ title: post.title, excerpt: post.excerpt, content: post.content, coverImage: post.coverImage ?? "", published: post.published });
    setImagePreview(post.coverImage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(blankForm);
    setSelectedFile(null);
    setImagePreview(null);
    setMessage("");
  }

  function clearImage() {
    setSelectedFile(null);
    setImagePreview(null);
    setForm((current) => ({ ...current, coverImage: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Escolha um arquivo de imagem.");
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("A imagem deve ter no máximo 10 MB.");
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
    setImagePreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setMessage("");
  }

  async function uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME e NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET no .env.");
    }

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body,
    });

    if (!response.ok) throw new Error("O Cloudinary recusou o upload.");
    const data = await response.json() as { secure_url?: string };
    if (!data.secure_url) throw new Error("O Cloudinary não retornou uma URL.");
    return data.secure_url;
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    let coverImage = form.coverImage;
    try {
      if (selectedFile) coverImage = await uploadToCloudinary(selectedFile);
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
      return;
    }

    const response = await fetch(editingId ? `/api/posts/${editingId}` : "/api/posts", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, coverImage }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error ?? "Não foi possível salvar.");
      return;
    }

    resetForm();
    setMessage(editingId ? "Texto atualizado." : "Texto criado.");
    await loadPosts();
  }

  async function removePost(id: number) {
    if (!window.confirm("Excluir este texto permanentemente?")) return;
    const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (response.ok) {
      setPosts((current) => current.filter((post) => post.id !== id));
      if (editingId === id) resetForm();
      setMessage("Texto excluído.");
    }
  }

  async function togglePublished(post: Post) {
    const response = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    if (response.ok) await loadPosts();
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div><Link className="brand" href="/"><span className="brand-mark">CA</span><span>Caderno Aberto</span></Link><span className="admin-label">/ editorial</span></div>
        <Link className="view-site" href="/">Ver site ↗</Link>
      </header>
      <main className="admin-main">
        <div className="admin-intro"><p className="eyebrow">Área restrita</p><h1>Seu arquivo,<br /><em>em movimento.</em></h1><p>Crie e organize os textos que aparecem no Caderno Aberto.</p></div>
        <section className="editor-layout">
          <form className="editor-form" onSubmit={savePost}>
            <div className="form-topline"><p className="eyebrow">{editingId ? "Editando texto" : "Novo texto"}</p>{editingId && <button className="text-button" type="button" onClick={resetForm}>Cancelar edição</button>}</div>
            <label>Título<input required value={form.title} onChange={(event) => changeField("title", event.target.value)} placeholder="Um título que abre uma conversa" /></label>
            <label>Resumo <span className="field-hint">{form.excerpt.length}/280</span><textarea required maxLength={280} rows={3} value={form.excerpt} onChange={(event) => changeField("excerpt", event.target.value)} placeholder="Uma entrada curta para convidar à leitura" /></label>
            <label>Conteúdo<textarea required rows={11} value={form.content} onChange={(event) => changeField("content", event.target.value)} placeholder="Escreva o texto aqui..." /></label>
            <label>Imagem de capa <span className="field-hint">Cloudinary · máximo 10 MB</span><input ref={fileInputRef} type="file" accept="image/*" onChange={selectImage} />{selectedFile && <small className="file-name">{selectedFile.name} será enviada ao salvar.</small>}{imagePreview && <span className="image-preview" style={{ backgroundImage: `url(${imagePreview})` }}><button className="remove-image" type="button" onClick={clearImage} aria-label="Remover imagem">×</button></span>}</label>
            <label className="checkbox-label"><input type="checkbox" checked={form.published} onChange={(event) => changeField("published", event.target.checked)} /><span>Publicar imediatamente</span></label>
            <button className="primary-button" disabled={saving} type="submit">{saving ? selectedFile ? "Enviando e salvando..." : "Salvando..." : editingId ? "Salvar alterações" : "Adicionar ao arquivo"}<span>→</span></button>
            {message && <p className="form-message">{message}</p>}
          </form>
          <section className="posts-manager"><div className="list-heading"><div><p className="eyebrow">Conteúdo</p><h2>Todos os textos</h2></div><span>{posts.length.toString().padStart(2, "0")}</span></div>
            {loading ? <p className="list-placeholder">Carregando arquivo...</p> : posts.length === 0 ? <p className="list-placeholder">Nenhum texto cadastrado ainda.</p> : <div className="admin-post-list">{posts.map((post) => <article className="admin-post" key={post.id}><div className="admin-post-info"><span className={`status-dot ${post.published ? "is-live" : ""}`}>{post.published ? "Publicado" : "Rascunho"}</span><h3>{post.title}</h3><p>{post.excerpt}</p></div><div className="admin-actions"><button type="button" onClick={() => togglePublished(post)}>{post.published ? "Despublicar" : "Publicar"}</button><button type="button" onClick={() => editPost(post)}>Editar</button><button className="delete-action" type="button" onClick={() => removePost(post.id)}>Excluir</button></div></article>)}</div>}
          </section>
        </section>
      </main>
    </div>
  );
}