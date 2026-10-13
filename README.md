# cam-folio
A single-page nature photography portfolio, rebuilt with **React, Vite and Tailwind CSS**. Week 2 assignment by Abdalla Elhassan, evolved from the Week 1 plain HTML/CSS site (see [Assignment 1](#assignment-1-plain-html-and-css)).

## Features
- **Gallery** of 12 photos in four categories (Mountains, Desert, Waterfalls & Rivers, Coast), all rendered from one data file
- **Category filter**: chip buttons built with `useState`
- **Search and sort**: search by title or place, and sort by title, location or rating. All of it combines with the category filter
- **Star rating**: a reusable, controlled `StarRating` on every photo. Each card shows a hardcoded community score and your own click adds to it
- **Lightbox**: click a photo to see it larger, with previous/next buttons, arrow keys, Esc to close, and the photo's category
- **Contact form**: the "documentary coverage" question is a controlled radio group, and the subject list only appears when "Yes" is picked
- **Responsive, mobile-first**: Tailwind classes go from unprefixed (phone) to `sm:` (640px) and `md:` (900px). The header turns into a hamburger menu below 900px, and there is no horizontal scroll at any width

## Tech
- [Vite](https://vite.dev) + [React](https://react.dev) (plain JavaScript, no TypeScript)
- [Tailwind CSS](https://tailwindcss.com) v4, wired in with the Vite plugin. Colours and fonts are theme tokens in `src/index.css`
- No other libraries. All data is hardcoded for now (a backend is planned for Week 3)

## Project structure
```
src/
  data/
    photos.js        the 12 photos (title, location, category, rating numbers...)
    navLinks.js      nav links shared by Header and Footer
  components/
    Header.jsx  Hero.jsx  Gallery.jsx  About.jsx  Contact.jsx  Footer.jsx
    PhotoCard.jsx    one gallery card, used for every photo
    StarRating.jsx   the reusable controlled component
    Lightbox.jsx     full-size viewer
    Logo.jsx  NavList.jsx
  utils/
    ratings.js       combines community votes with your own
  App.jsx            puts the sections together
  index.css          Tailwind import, theme tokens, shared utilities (field, btn-primary, section-title, px-page)
```

## How the state works
- **`Gallery`** owns the state: `category`, `search`, `sortBy`, `ratings` and `openIndex` (which photo the lightbox shows). The list of visible photos is *derived* from that state on every render with `.filter()` and `.sort()`, never stored separately.
- **`StarRating` is a controlled component.** It has no state of its own: it receives `value` and `onChange` as props and only reports clicks. The parent decides what the rating is. Clicking the current rating again clears it. Ratings live in `Gallery`, so they survive filtering.
- **`Header`** has one piece of state, `menuOpen`, for the mobile menu. **`Contact`** has `documentary` (which radio is checked) and `sent`.

## Run it
```
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
```

## Backend note
Ratings are kept in browser memory and reset on refresh, and the contact form only shows a thank-you message. The places that will change when a backend exists are marked with `BACKEND:` comments in `photos.js`, `Gallery.jsx`, `ratings.js` and `Contact.jsx`.

## Assignment 1: plain HTML and CSS
The first version (Week 1) was built with plain HTML5 and CSS3, no frameworks and no JavaScript: a CSS Grid gallery, a pop-up viewer using the `popover` attribute, and a contact form that revealed the documentary subject list with the CSS `:has()` selector. It is kept in git history under the tag `v1-html`.

## Credits
Photos are from [Unsplash](https://unsplash.com) (some via [Lorem Picsum](https://picsum.photos)). The three newest photos are by Steve Gribble ("Mesquite Flat" and "Storm Light") and Tim Arterbury ("Ridge of Fire"), used under the Unsplash License. Photo locations, descriptions and ratings are sample text.
