# cam-folio
A full-stack nature photography portfolio by Abdalla Elhassan. It started as a plain HTML/CSS site (Week 1), became a React + Tailwind single-page app (Week 2), and in Week 3 got a real backend: a Postgres database, a JSON API, real accounts and sessions, and a public deployment.

- **Live site:** https://cam-folio-pi.vercel.app
- **API:** https://cam-folio-api.onrender.com (try `/api/health` and `/api/photos`)

## Contents
- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Week 3 requirements checklist](#week-3-requirements-checklist)
- [Beyond the assignment](#beyond-the-assignment)
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
| Hosting | [Render](https://render.com) (API) and [Vercel](https://vercel.com) (client) | Both publicly reachable; Vercel proxies `/api` to Render |
| Config | `.env` files, `render.yaml` Blueprint | Secrets stay out of git; the API deploy is reproducible |
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
| Backend and frontend live and talking to each other | Vercel (client) and Render (API), see [Deploy](#deploy) |
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
- **Infrastructure as code**: `render.yaml` describes the API service, including a health check at `/api/health`, so it can be recreated in one click.
- **Hosting migration**: the API was first deployed on Railway. When Railway paused deployments, it was moved to Render with only a config change (the database stayed on Neon), which shows the app does not depend on one host.
- **Responsive checks** of the new UI at phone, tablet and desktop widths, and a code review pass whose findings (stale responses, keyboard handling, id validation, race condition) were all fixed.
- **Tested against a throwaway local Postgres** so test users and comments never touched the production database.

## Project structure
```
client/                  React app (Vite)
  src/components/        Header, Gallery, PhotoCard, StarRating, Lightbox, Comments,
                         AuthModal, Contact, Hero, About, Footer ...
  src/lib/api.js         fetch wrapper that sends the session cookie
  src/lib/auth-client.js Better Auth client (useSession, signIn, signUp, signOut)
  vercel.json            rewrites /api/* to the Render server
server/                  Express API
  src/index.js           app setup: CORS, auth handler, routes
  src/auth.js            Better Auth config (base path, trusted origins)
  src/lib/getUser.js     reads the signed-in user from the request
  src/db/index.js        pg pool + Drizzle connection
  src/db/schema.js       database tables (Drizzle)
  src/db/seed.js         fills the photos table (data in seedData.js)
  src/routes/            photos.js (list + ratings), comments.js, contact.js
  drizzle.config.js      drizzle-kit settings (dialect, schema path, DATABASE_URL)
render.yaml              Render Blueprint for the API
```

## How it fits together
The browser only ever talks to `/api/...` on its own site. In development, Vite forwards `/api` to the Express server on port 3000. In production, Vercel forwards `/api` to the Render server. Because the browser sees one origin, the login cookie works without cross-site cookie settings.

```
Browser  ->  Vercel (React app, /api rewrite)  ->  Render (Express API)  ->  Neon (Postgres)
```

## Database schema (in plain English)
- **user, session, account, verification**: created for Better Auth. `user` is a person with a name and email. `account` holds their hashed password. `session` is one row per logged-in browser, which is how you stay signed in after a refresh.
- **photos**: one row per gallery photo (image path, title, location, description, category, optional size). `base_rating_total` and `base_rating_count` hold the original sample community votes from Week 2.
- **ratings**: one row per (user, photo) with a value from 1 to 5. A user can rate a photo once, and can change or remove it. Deleting a user or photo deletes their ratings.
- **comments**: one row per comment (user, photo, text up to 500 characters, time). Only the author can delete a comment. Deleting a user or photo deletes their comments.
- **contact_messages**: one row per contact form submission.

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
| `PORT` | optional, defaults to 3000 |

`.env` files are listed in `.gitignore` and are never committed.

3. Install, create the tables, and seed:
```
cd server
npm install
npm run db:push    # create tables in Neon
npm run seed       # insert the 12 photos
npm run dev        # API on http://localhost:3000
```
4. In another terminal:
```
cd client
npm install
npm run dev        # http://localhost:5173
```

## Deploy
- **API (Render):** New > Blueprint from this repo (uses `render.yaml`: root directory `server`, start command `npm start`, health check `/api/health`). Set `DATABASE_URL`, `BETTER_AUTH_URL` and `CLIENT_ORIGIN` (both set to the Vercel URL, since the browser reaches the API through it). `BETTER_AUTH_SECRET` is generated automatically. Run `npm run db:push` once against the database so the tables exist.
- **Client (Vercel):** root directory `client`. Put the Render URL in `client/vercel.json`.
- **Note:** on Render's free plan the API sleeps after about 15 minutes idle, so the first request after a quiet spell can take 30-60 seconds.

## Security notes
- `.env` files are git-ignored; only `server/.env.example` (placeholders) is committed.
- Passwords are hashed, sessions are httpOnly cookies, and the API accepts only the site's origin.
- Every write route checks the signed-in user on the server, and users can only delete their own comments and ratings.
- User text is rendered by React as plain text (no raw HTML), and inputs are validated on the server.

## Assignment 1: plain HTML and CSS
The first version (Week 1) was built with plain HTML5 and CSS3, no frameworks and no JavaScript: a CSS Grid gallery, a pop-up viewer using the `popover` attribute, and a contact form that revealed the documentary subject list with the CSS `:has()` selector. It is kept in git history under the tag `v1-html`.

## Credits
Photos are from [Unsplash](https://unsplash.com) (some via [Lorem Picsum](https://picsum.photos)). The three newest photos are by Steve Gribble ("Mesquite Flat" and "Storm Light") and Tim Arterbury ("Ridge of Fire"), used under the Unsplash License. Photo locations, descriptions and ratings are sample text.
