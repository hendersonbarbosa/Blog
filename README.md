This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Banco de dados

O projeto usa Prisma 7 com MySQL. Para configurar a conexão:

```bash
copy .env.example .env
```

Depois, ajuste `DATABASE_URL` no arquivo `.env`:

```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/NOME_DO_BANCO"
```

Com a URL configurada, use os comandos abaixo:

```bash
npm run db:generate
npm run db:push
```

O cliente reutilizável está disponível em `@/lib/prisma`. Para criar migrations versionadas, use `npm run db:migrate`.

As imagens de capa são informadas como URLs externas no painel administrativo e armazenadas no campo `coverImage` do post.

Para enviar arquivos diretamente pelo painel, configure no `.env` um **Cloud Name** e um **Upload Preset unsigned** do Cloudinary:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="seu-upload-preset"
```

O upload preset deve aceitar upload sem assinatura e limitar o tamanho/tipos de arquivo no painel do Cloudinary. A chave secreta do Cloudinary não deve ser colocada no frontend.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
