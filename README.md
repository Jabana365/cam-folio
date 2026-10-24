# cam-folio
A single-page nature photography portfolio, rebuilt with **React, Vite and Tailwind CSS**. Week 2 assignment by Abdalla Elhassan, evolved from the Week 1 plain HTML/CSS site (see [Assignment 1](#assignment-1-plain-html-and-css)).

## Features
- **Gallery** of 12 photos in four categories (Mountains, Desert, Waterfalls & Rivers, Coast), loaded from the API
- **Category filter**, **search** (title or place) and **sort** (title, location, rating), all combinable
- **Sign up / sign in**: real accounts and sessions. The header shows "Sign in" or "Hi, name · Sign out", and the session survives a page refresh
- **Star rating**: signed-in users rate photos 1-5. Ratings are saved per user in the database and added to the community score
- **Lightbox** with previous/next buttons, arrow keys and Esc
- **Comments**: signed-in users can comment on a photo from the lightbox and delete their own comments. Anyone can read them
- **My ratings filter**: signed-in users can switch the gallery to only the photos they have rated, and back to all photos
- **Contact form**: submissions are stored in the database. The documentary subject list only appears when "Yes" is picked
- **Responsive, mobile-first** with a hamburger menu below 900px

## Tech
- **Client:** [Vite](https://vite.dev) + [React](https://react.dev) + [Tailwind CSS](https://tailwindcss.com) v4 (plain JavaScript, no TypeScript)
- **Server:** [Express](https://expressjs.com) (Node.js)
- **Database:** Postgres on [Neon](https://neon.tech), accessed with [Drizzle ORM](https://orm.drizzle.team)
- **Auth:** [Better Auth](https://www.better-auth.com) (email + password, sessions stored in Postgres, httpOnly cookie)
- **Hosting:** Render (API; moved from Railway, which paused deployments) and Vercel (client)

## Project structure
```
client/                  React app (Vite)
  src/components/        Header, Gallery, PhotoCard, StarRating, Lightbox, Contact, AuthModal ...
  src/lib/api.js         fetch wrapper that sends the session cookie
  src/lib/auth-client.js Better Auth client (useSession, signIn, signUp, signOut)
  vercel.json            rewrites /api/* to the Render server
server/                  Express API
  src/index.js           app setup: CORS, auth handler, routes
  src/auth.js            Better Auth config
  src/db/schema.js       database tables (Drizzle)
  src/db/seed.js         fills the photos table (data in seedData.js)
  src/routes/            photos.js (list + ratings), contact.js
```

## How it fits together
The browser only ever talks to `/api/...` on its own site. In development, Vite forwards `/api` to the Express server on port 3000. In production, Vercel forwards `/api` to the Render server. Because the browser sees one origin, the login cookie works without cross-site cookie settings.

## Database schema (in plain English)
- **user, session, account, verification**: created for Better Auth. `user` is a person with a name and email. `account` holds their hashed password. `session` is one row per logged-in browser, which is how you stay signed in after a refresh.
- **photos**: one row per gallery photo (image path, title, location, description, category, optional size). `base_rating_total` and `base_rating_count` hold the original sample community votes from Week 2.
- **ratings**: one row per (user, photo) with a value from 1 to 5. A user can rate a photo once, and can change or remove it. Deleting a user or photo deletes their ratings.
- **comments**: one row per comment (user, photo, text up to 500 characters, time). Only the author can delete a comment. Deleting a user or photo deletes their comments.
- **contact_messages**: one row per contact form submission.

A photo's displayed score is `(base_rating_total + sum of ratings) / (base_rating_count + number of ratings)`.

## API
| Method | Route | Auth | What it does |
|---|---|---|---|
| GET | `/api/health` | no | `{ ok: true }` |
| GET | `/api/photos` | optional | All photos with rating totals, plus `myRating` if signed in |
| PUT | `/api/photos/:id/rating` | yes | Save your 1-5 rating `{ value }` |
| DELETE | `/api/photos/:id/rating` | yes | Remove your rating |
| GET | `/api/photos/:id/comments` | optional | Comments on a photo, newest first (`mine` is true for your own) |
| POST | `/api/photos/:id/comments` | yes | Add a comment `{ body }` (1-500 characters) |
| DELETE | `/api/comments/:id` | yes | Delete your own comment |
| POST | `/api/contact` | no | Store a contact message |
| * | `/api/auth/*` | - | Sign up, sign in, sign out, get session (Better Auth) |

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
- **API (Render):** New > Blueprint from this repo (uses `render.yaml`: root directory `server`, start command `npm start`, health check `/api/health`). Set `DATABASE_URL`, `BETTER_AUTH_URL` and `CLIENT_ORIGIN` (both set to the Vercel URL, since the browser reaches the API through it). `BETTER_AUTH_SECRET` is generated automatically.
- **Client (Vercel):** root directory `client`. Put the Render URL in `client/vercel.json`.

Live site: _add URL here after deploying_

## Assignment 1: plain HTML and CSS
The first version (Week 1) was built with plain HTML5 and CSS3, no frameworks and no JavaScript: a CSS Grid gallery, a pop-up viewer using the `popover` attribute, and a contact form that revealed the documentary subject list with the CSS `:has()` selector. It is kept in git history under the tag `v1-html`.

## Credits
Photos are from [Unsplash](https://unsplash.com) (some via [Lorem Picsum](https://picsum.photos)). The three newest photos are by Steve Gribble ("Mesquite Flat" and "Storm Light") and Tim Arterbury ("Ridge of Fire"), used under the Unsplash License. Photo locations, descriptions and ratings are sample text.
