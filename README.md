# cam-folio
A full-stack nature photography portfolio by Abdalla Elhassan. It started as a plain HTML/CSS site (Week 1), became a React + Tailwind single-page app (Week 2), and in Week 3 got a real backend: a Postgres database, a JSON API, real accounts and sessions, and a public deployment. In Assignment 4 it became a small shop: visitors can order fine-art prints of the photos and pay with Stripe Checkout (test mode).

- **Live site:** https://cam-folio-pi.vercel.app
- **API:** https://cam-folio-production.up.railway.app (hosted on Railway; try `/api/health` and `/api/photos`)

## Contents
- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Week 3 requirements checklist](#week-3-requirements-checklist)
- [Beyond the assignment](#beyond-the-assignment)
- [Print shop and payments (Assignment 4)](#print-shop-and-payments-assignment-4)
- [Project structure](#project-structure)
- [How it fits together](#how-it-fits-together)
- [Database schema (in plain English)](#database-schema-in-plain-english)
- [Drizzle ORM in this project](#drizzle-orm-in-this-project)
- [API](#api)
- [Authentication and sessions](#authentication-and-sessions)
- [Run it locally](#run-it-locally)
- [Deploy](#deploy)
- [Security notes](#security-notes)
- [Assignment 1: plain HTML and CSS](#assignment-1-plain-html-and-css)
- [Credits](#credits)

## What it does
- **Gallery** of 12 photos in four categories (Mountains, Desert, Waterfalls & Rivers, Coast), loaded from the API
- **Category filter**, **search** (title or place) and **sort** (title, location, rating), all combinable
- **Sign up / sign in**: real accounts and sessions. The header shows "Sign in" or "Hi, name · Sign out", and the session survives a page refresh
- **Star rating**: signed-in users rate photos 1-5. Ratings are saved per user in the database and added to the community score
- **Comments**: signed-in users comment on a photo from the lightbox and delete their own comments. Anyone can read them
- **My ratings filter**: signed-in users switch the gallery to only the photos they rated, and back to all photos
- **Sign-in prompt**: a signed-out visitor who tries to rate or comment gets a popup inviting them to sign in or sign up
- **Print shop**: every photo has a product page where you pick a size, a frame (none, black wood, natural wood, glass front, acrylic, table stand), a finish and a quantity, with a live preview and price
- **Stripe Checkout (test mode)**: sign in, pay on Stripe's hosted page, and see your order confirmed. **My orders** lists past orders
- **Lightbox** with previous/next buttons, arrow keys and Esc
- **Contact form**: submissions are stored in the database. The documentary subject list only appears when "Yes" is picked
- **Responsive, mobile-first** with a hamburger menu below 900px

## Tech stack
| Layer | Technology | Why |
|---|---|---|
| Client | [React](https://react.dev) 19 + [Vite](https://vite.dev) 8 | Component UI with a fast dev server and build |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 (via `@tailwindcss/vite`) | Utility classes, mobile-first breakpoints |
| Language | Plain JavaScript (ES modules) | No TypeScript, as the assignment requires |
| Server | [Node.js](https://nodejs.org) + [Express](https://expressjs.com) 5 | Small REST API |
| Database | [Postgres](https://www.postgresql.org) on [Neon](https://neon.tech) (free tier) | Real relational database with foreign keys and constraints |
| ORM | [Drizzle ORM](https://orm.drizzle.team) + `drizzle-kit`, `pg` driver | Schema in JavaScript, typed-style queries close to SQL, schema push |
| Auth | [Better Auth](https://www.better-auth.com) | Email + password, hashed passwords, sessions in Postgres, httpOnly cookie |
| CORS | `cors` | Locks the API to the site's origin |
| Payments | [Stripe Checkout](https://stripe.com/docs/payments/checkout) (test mode) + `stripe` Node SDK | Card details never touch this server; a signed webhook confirms payment |
| Routing | [React Router](https://reactrouter.com) | Separate pages for the print shop and orders |
| Hosting | [Railway](https://railway.com) (API) and [Vercel](https://vercel.com) (client) | Both publicly reachable; Vercel proxies `/api` to Railway |
| Config | `.env` files, `server/railway.json` | Secrets stay out of git; the API deploy settings live in the repo |
| Linting | [oxlint](https://oxc.rs) | Fast JS linter for the client |

## Week 3 requirements checklist
| Requirement | How it is met |
|---|---|
| Split into client and server | `client/` (React) and `server/` (Express) are separate packages |
| Free Postgres database with a schema | Neon Postgres; tables for users (Better Auth) and the photos data, defined in `server/src/db/schema.js` |
| Secrets in `.env`, never committed | `DATABASE_URL`, `BETTER_AUTH_SECRET` and the rest live in `server/.env`, ignored by `.gitignore`. Only `server/.env.example` (no real values) is tracked |
| Backend connected to the real database; Week 2 data moved in with a seed script | `server/src/db/index.js` connects through Drizzle; `npm run seed` inserts the 12 photos from `seedData.js` |
| A real API with at least one JSON route | `GET /api/photos` and the other routes in the [API table](#api) |
| Real authentication: signup, login, sessions; UI shows signed-in state | Better Auth under `/api/auth/*`; header shows "Sign in" or "Hi, name · Sign out" |
| React reads from the real API | `client/src/lib/api.js` fetches `/api/...`; nothing is hardcoded in the client |
| Backend and frontend live and talking to each other | Vercel (client) and Railway (API), see [Deploy](#deploy) |
| Sessions survive a page refresh | Session stored in Postgres, sent as an httpOnly cookie, read again by `useSession()` on load |
| `.env` excluded from git | `git ls-files` lists only `server/.env.example` |
| No TypeScript; keep working on the existing project | Plain JavaScript, same repository since Week 1 |

## Beyond the assignment
The brief asked for a database, one JSON route, and sign-in. These parts go further:

**Features**
- **Per-user ratings** with community scores: one rating per user per photo (a unique constraint plus a 1-5 check constraint in the database), changeable and removable. The community score blends the original Week 2 sample votes with real ones.
- **Comments** with author-only delete, a 500-character limit, a 5-second per-user cooldown against spam, and only the newest 100 returned per photo.
- **"My ratings" filter** in the gallery, with the choice to switch back to all photos.
- **Sign-in prompt popup** when a signed-out visitor tries to rate or comment, with "Create a free account" and "I already have an account" paths.
- **Contact form stored in the database**, with server-side validation.
- **Search, sort and lightbox** with keyboard navigation, carried over and extended from Week 2.

**Engineering**
- **Server-side validation everywhere**: strict id parsing (digits only, within the integer range, so bad ids return 400 instead of a database error), length checks on text, and ownership checks on deletes.
- **Race-safe cooldown**: the comment cooldown runs inside a transaction with a per-user Postgres advisory lock, and compares times inside Postgres so server and database timezones cannot skew it. Six simultaneous posts create exactly one comment.
- **Cascading deletes** (`onDelete: cascade`): removing a user or photo removes their ratings and comments.
- **Normalised origins**: `BETTER_AUTH_URL` and `CLIENT_ORIGIN` are reduced to clean origins (no trailing slash, comma lists allowed) so a typo in a dashboard cannot break CORS or sign-up.
- **One-origin cookies**: Vercel rewrites `/api/*` to the API so the browser only ever talks to its own site, which avoids cross-site cookie problems.
- **Deploy settings in the repo**: `server/railway.json` sets the start command and a health check at `/api/health`.
- **Hosting moves**: the API was first on Railway, was moved to Render for a while, and is now back on Railway. Only config changed each time (the database stayed on Neon), which shows the app does not depend on one host.
- **Responsive checks** of the new UI at phone, tablet and desktop widths, and a code review pass whose findings (stale responses, keyboard handling, id validation, race condition) were all fixed.
- **Tested against a throwaway local Postgres** so test users and comments never touched the production database.

## Print shop and payments (Assignment 4)
The product is a fine-art print of a photo. The buyer chooses a **size**, a **frame** and a **finish**; the unit price is `size + frame + finish`.

**The flow**
1. On `/print/:id` the buyer picks options. The page shows a price, but it is only for display.
2. **Buy now** calls `POST /api/checkout` with only ids (`photoId`, `sizeId`, `frameId`, `finishId`) and a quantity. If the visitor is signed out, the sign-in popup opens first and checkout continues automatically after they sign in.
3. The server (behind the `requireUser` middleware, which returns 401 when nobody is signed in) looks up every price **in the database**, works out the total, saves a `pending` order and its item, and creates a Stripe Checkout Session. It returns Stripe's hosted page URL and the browser goes there.
4. The buyer pays on Stripe's page with the test card `4242 4242 4242 4242`, any future date and any CVC. Stripe also collects the shipping address.
5. Stripe calls `POST /api/stripe/webhook`. The server checks Stripe's signature and **only then** marks the order `paid`. Nothing else in the code can set `paid`: not the checkout route and not the success page.
6. Stripe sends the buyer to `/order/:id`. The page asks `GET /api/orders/:id` and checks again every 1.5 seconds (up to 8 times) while the order is still `pending`, because the webhook can arrive a moment after the redirect. Then it shows "Payment confirmed".

**Why it is built this way**
- **The price never comes from the browser.** The checkout route accepts ids only and reads the prices from `print_sizes`, `print_frames` and `print_finishes`. Sending a fake `price` field changes nothing.
- **The webhook is the only thing that marks an order paid.** It needs the raw request body to verify Stripe's signature, so it is mounted before `express.json()`. An unsigned or forged request gets a 400. The update is idempotent (`status <> 'paid'`) and matches the Stripe session id, so a repeated or mismatched event is harmless.
- **Orders are private.** `GET /api/orders` and `GET /api/orders/:id` only return the signed-in user's own orders. Someone else's order id returns 404.
- **Order history stays correct.** `order_items` copies the unit price and the size, frame and finish names at purchase time, so changing shop prices later never rewrites old orders.

**Test it locally**
```
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook   # prints the whsec_... secret
```
Put that secret in `STRIPE_WEBHOOK_SECRET` and your test key (`sk_test_...`) in `STRIPE_SECRET_KEY`, restart the API, open a print page, and pay with the test card.

## Project structure
```
client/                  React app (Vite)
  src/pages/             Home, PrintPage (product page), OrderPage (status), OrdersPage (history)
  src/components/        Header, Gallery, PhotoCard, StarRating, Lightbox, Comments,
                         AuthModal, OrderItems, StatusBadge, Contact, Hero, About, Footer ...
  src/lib/api.js         fetch wrapper that sends the session cookie
  src/lib/auth-client.js Better Auth client (useSession, signIn, signUp, signOut)
  src/utils/money.js     formats cents as dollars
  vercel.json            rewrites /api/* to the Railway server, and everything else to index.html
server/                  Express API
  src/index.js           app setup: CORS, auth handler, Stripe webhook, routes
  src/auth.js            Better Auth config (base path, trusted origins)
  src/lib/               getUser.js (signed-in user), stripe.js (Stripe client), parseId.js
  src/middleware/        requireUser.js (blocks signed-out requests)
  src/db/index.js        pg pool + Drizzle connection
  src/db/schema.js       database tables (Drizzle)
  src/db/seed.js         fills photos and the print options (data in seedData.js)
  src/routes/            photos.js, comments.js, contact.js, shop.js, checkout.js,
                         orders.js, stripeWebhook.js
  drizzle.config.js      drizzle-kit settings (dialect, schema path, DATABASE_URL)
  railway.json           Railway deploy settings (start command, health check)
```

## How it fits together
The browser only ever talks to `/api/...` on its own site. In development, Vite forwards `/api` to the Express server on port 3000. In production, Vercel forwards `/api` to the Railway server. Because the browser sees one origin, the login cookie works without cross-site cookie settings. The one exception is Stripe's webhook: it is server to server, so Stripe calls the Railway URL directly.

```
Browser  ->  Vercel (React app, /api rewrite)  ->  Railway (Express API)  ->  Neon (Postgres)
Browser  ->  Stripe hosted checkout  ->  (webhook)  ->  Railway (Express API)
```

## Database schema (in plain English)
- **user, session, account, verification**: created for Better Auth. `user` is a person with a name and email. `account` holds their hashed password. `session` is one row per logged-in browser, which is how you stay signed in after a refresh.
- **photos**: one row per gallery photo (image path, title, location, description, category, optional size). `base_rating_total` and `base_rating_count` hold the original sample community votes from Week 2.
- **ratings**: one row per (user, photo) with a value from 1 to 5. A user can rate a photo once, and can change or remove it. Deleting a user or photo deletes their ratings.
- **comments**: one row per comment (user, photo, text up to 500 characters, time). Only the author can delete a comment. Deleting a user or photo deletes their comments.
- **contact_messages**: one row per contact form submission.
- **print_sizes, print_frames, print_finishes**: the options a print can be ordered in. Each has a price in cents (`base_price_cents` for sizes, `price_cents` add-ons for frames and finishes), a sort order and an `active` flag.
- **orders**: one row per purchase: the user, a `status` (`pending`, `paid` or `cancelled`, enforced by a check constraint), the total in cents, the Stripe session and payment ids, the shipping name and address, and `paid_at`. Only the webhook sets `paid`.
- **order_items**: what was bought in an order: the photo, quantity, the unit price in cents, and the size, frame and finish names, all copied at purchase time. Deleting an order deletes its items.

A photo's displayed score is `(base_rating_total + sum of ratings) / (base_rating_count + number of ratings)`.

## Drizzle ORM in this project
[Drizzle](https://orm.drizzle.team) is an ORM: it lets the code describe tables and run queries in JavaScript instead of hand-written SQL strings, while staying close to SQL.

- **Schema as code:** `server/src/db/schema.js` defines every table with `pgTable(...)`, including primary keys, foreign keys, `onDelete: 'cascade'`, a `unique()` on (user, photo) for ratings, and a `check()` that keeps rating values between 1 and 5.
- **Connection:** `server/src/db/index.js` creates a `pg` connection pool from `DATABASE_URL` and wraps it with `drizzle(pool, { schema })`. Every route imports that single `db`.
- **Queries:** routes use `db.select().from(photos)`, `db.insert(ratings).values(...).onConflictDoUpdate(...)` (so rating the same photo twice updates instead of duplicating), and `db.delete(...).where(and(eq(...), eq(...)))`. The `sql` helper adds the few raw expressions needed, such as the community totals and the comment cooldown.
- **Transactions:** the comment route uses `db.transaction(...)` so the cooldown check and the insert happen together.
- **Better Auth adapter:** `drizzleAdapter(db, { provider: 'pg', schema })` lets Better Auth store users, sessions and accounts in the same database through the same schema.
- **Migrations without files:** `drizzle-kit push` (`npm run db:push`) compares `schema.js` with the live database and creates or updates the tables. The seed script then fills `photos`.

## API
| Method | Route | Auth | What it does |
|---|---|---|---|
| GET | `/api/health` | no | `{ ok: true }` |
| GET | `/api/photos` | optional | All photos with rating totals, plus `myRating` if signed in |
| PUT | `/api/photos/:id/rating` | yes | Save your 1-5 rating `{ value }` |
| DELETE | `/api/photos/:id/rating` | yes | Remove your rating |
| GET | `/api/photos/:id/comments` | optional | Newest 100 comments on a photo (`mine` is true for your own) |
| POST | `/api/photos/:id/comments` | yes | Add a comment `{ body }` (1-500 characters, 5-second cooldown) |
| DELETE | `/api/comments/:id` | yes | Delete your own comment |
| POST | `/api/contact` | no | Store a contact message |
| GET | `/api/shop/options` | no | Active sizes, frames and finishes with prices |
| POST | `/api/checkout` | yes | `{ photoId, sizeId, frameId, finishId, quantity }`: creates a pending order and a Stripe session, returns `{ url, orderId }` |
| GET | `/api/orders` | yes | Your orders, newest first, with their items |
| GET | `/api/orders/:id` | yes | One of your orders (404 if it is not yours) |
| POST | `/api/stripe/webhook` | Stripe signature | Marks the order paid after a verified `checkout.session.completed`; cancels it on `checkout.session.expired` |
| * | `/api/auth/*` | - | Sign up, sign in, sign out, get session (Better Auth) |

Errors come back as JSON `{ error: "..." }` with a fitting status: 400 bad input, 401 not signed in, 404 not found (also used for "not your comment"), 429 posting too fast (with a `Retry-After` header).

## Authentication and sessions
- Passwords are hashed by Better Auth and stored in the `account` table. They are never stored in plain text.
- Signing in creates a row in `session` and sets an **httpOnly** cookie, so page JavaScript cannot read it.
- On every page load the client calls `useSession()`, which asks `/api/auth/get-session`. That is why you stay signed in after a refresh.
- The server only accepts auth requests from `CLIENT_ORIGIN` (Better Auth's trusted origins) and CORS is limited to the same origin list.

## Run it locally
1. Create a free Postgres database on Neon and copy its pooled connection string.
2. Create `server/.env` from `server/.env.example` and fill in the values:

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `BETTER_AUTH_SECRET` | random secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | public URL of the API (`http://localhost:3000` locally) |
| `CLIENT_ORIGIN` | where the React app runs (`http://localhost:5173` locally) |
| `STRIPE_SECRET_KEY` | Stripe **test-mode** secret key (`sk_test_...`) from Dashboard > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | webhook signing secret (`whsec_...`): printed by `stripe listen` locally, or shown on the Dashboard webhook endpoint in production |
| `PORT` | optional, defaults to 3000 |

`.env` files are listed in `.gitignore` and are never committed. The API will not start without `STRIPE_SECRET_KEY`.

3. Install, create the tables, and seed:
```
cd server
npm install
npm run db:push    # create tables in Neon
npm run seed       # insert the 12 photos and the print options
npm run dev        # API on http://localhost:3000
```
To test payments, also run `stripe listen --forward-to localhost:3000/api/stripe/webhook` in a third terminal (see [Print shop and payments](#print-shop-and-payments-assignment-4)).
4. In another terminal:
```
cd client
npm install
npm run dev        # http://localhost:5173
```

## Deploy
- **API (Railway):** New project > Deploy from this GitHub repo, and set the service's **Root Directory** to `server`. `server/railway.json` provides the start command (`npm start`) and the health check (`/api/health`). Under Variables set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and `CLIENT_ORIGIN` (both set to the Vercel URL, since the browser reaches the API through it), plus `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Generate a public domain under Settings > Networking, and make sure its target port matches the port in the deploy log (`API listening on port 8080`), because Railway sets `PORT` itself. A mismatch shows as a 502 "Application failed to respond". Run `npm run db:push` and `npm run seed` once against the database so the tables and print options exist (they already do if the same Neon database is reused).
- **Stripe webhook (production):** in the Stripe Dashboard (Test mode) go to Developers > Webhooks > Add endpoint. Use `https://<your-railway-domain>/api/stripe/webhook` and select the events `checkout.session.completed` and `checkout.session.expired`. Copy that endpoint's signing secret into `STRIPE_WEBHOOK_SECRET` on Railway. It differs from the local `stripe listen` secret.
- **Client (Vercel):** root directory `client`. Put the Railway domain in the `/api` rewrite in `client/vercel.json`. The second rewrite sends every other path to `index.html`, so links like `/print/3` still work after a refresh.

## Security notes
- `.env` files are git-ignored; only `server/.env.example` (placeholders) is committed.
- Passwords are hashed, sessions are httpOnly cookies, and the API accepts only the site's origin.
- Every write route checks the signed-in user on the server, and users can only delete their own comments and ratings.
- User text is rendered by React as plain text (no raw HTML), and inputs are validated on the server.
- Card details are entered on Stripe's own page and never reach this server. Only test-mode keys are used, and `STRIPE_SECRET_KEY` stays in `.env` / Railway variables.
- Checkout needs a signed-in user, prices are read from the database (never from the browser), and the Stripe webhook verifies its signature before touching an order.

## Assignment 1: plain HTML and CSS
The first version (Week 1) was built with plain HTML5 and CSS3, no frameworks and no JavaScript: a CSS Grid gallery, a pop-up viewer using the `popover` attribute, and a contact form that revealed the documentary subject list with the CSS `:has()` selector. It is kept in git history under the tag `v1-html`.

## Credits
Photos are from [Unsplash](https://unsplash.com) (some via [Lorem Picsum](https://picsum.photos)). The three newest photos are by Steve Gribble ("Mesquite Flat" and "Storm Light") and Tim Arterbury ("Ridge of Fire"), used under the Unsplash License. Photo locations, descriptions and ratings are sample text.
