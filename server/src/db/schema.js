import { pgTable, text, integer, serial, boolean, timestamp, unique, check } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ---- Better Auth tables (users, login sessions, credentials) ----
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ---- App tables ----
// One row per gallery photo. base_rating_* are the original "community" votes
// from Week 2; real user ratings are added on top of them.
export const photos = pgTable('photos', {
  id: serial('id').primaryKey(),
  src: text('src').notNull(),
  alt: text('alt').notNull(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  size: text('size'),
  baseRatingTotal: integer('base_rating_total').notNull().default(0),
  baseRatingCount: integer('base_rating_count').notNull().default(0),
})

// One 1-5 star rating per signed-in user per photo.
export const ratings = pgTable(
  'ratings',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    photoId: integer('photo_id').notNull().references(() => photos.id, { onDelete: 'cascade' }),
    value: integer('value').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.photoId), check('value_1_to_5', sql`${t.value} between 1 and 5`)],
)

// Messages sent through the contact form.
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  shoot: text('shoot'),
  documentary: boolean('documentary').notNull().default(false),
  docType: text('doc_type'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
