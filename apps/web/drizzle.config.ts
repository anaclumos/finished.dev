import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run Drizzle Kit')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  schemaFilter: ['finished'],
  migrations: {
    schema: 'finished',
    table: '__drizzle_migrations',
  },
})
