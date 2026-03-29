import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/** Satisfies config load during `prisma generate` / Docker build when no DB is available. Runtime uses real `DATABASE_URL` from env. */
const DATABASE_URL_FALLBACK =
  'postgresql://prisma:prisma@127.0.0.1:5432/prisma?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? DATABASE_URL_FALLBACK,
  },
});
