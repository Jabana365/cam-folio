import { pgTable, text, integer, serial, boolean, timestamp, unique, check, jsonb } from 'drizzle-orm/pg-core'
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

// Comments left on a photo by signed-in users.
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  photoId: integer('photo_id').notNull().references(() => photos.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ---- Print shop ----
// Prices live in the database (in cents) so the server is the only place a
// total is ever calculated. Unit price = size base + frame add-on + finish add-on.
export const printSizes = pgTable('print_sizes', {
  id: serial('id').primaryKey(),
  label: text('label').notNull().unique(),
  basePriceCents: integer('base_price_cents').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
})

export const printFrames = pgTable('print_frames', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull().default(''),
  priceCents: integer('price_cents').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
})

export const printFinishes = pgTable('print_finishes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull().default(''),
  priceCents: integer('price_cents').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
})

// One row per purchase. Only the Stripe webhook may set status to 'paid'.
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // pending | paid | cancelled
  totalCents: integer('total_cents').notNull(),
  currency: text('currency').notNull().default('usd'),
  stripeSessionId: text('stripe_session_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  shippingName: text('shipping_name'),
  shippingAddress: jsonb('shipping_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  paidAt: timestamp('paid_at'),
}, (t) => [check('order_status_valid', sql`${t.status} in ('pending', 'paid', 'cancelled')`)])

// What was bought and at what price. The price and option names are copied
// here at purchase time so old orders stay correct if the shop prices change.
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  photoId: integer('photo_id').notNull().references(() => photos.id),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  sizeLabel: text('size_label').notNull(),
  frameName: text('frame_name').notNull(),
  finishName: text('finish_name').notNull(),
})

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
