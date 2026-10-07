# cam-folio
A single-page nature photography portfolio built with plain HTML5 and CSS3, no frameworks and no JavaScript. Week 1 assignment.

## Features
- **Hero**: full-width background photo with the page's only `h1` and a "View the gallery" button
- **Gallery**: the centerpiece. A CSS Grid of nine photos using `object-fit: cover`, so every image fills its tile without stretching. Each photo has a caption (title, location, short description) in a see-through panel
- **Pop-up viewer**: click any photo to see it full size with its caption; close with the button, Esc, or a click outside
- **About**: short bio with a photo, on a lighter background band
- **Book a shoot**: centred booking form (replaces a shop button), with a "Do you need documentary coverage?" question. The subject list (hunting trip, wildlife behaviour, expedition...) only appears when "Yes" is picked
- **Footer**: three columns (brand, Explore links, Contact details) and a centred copyright line
- **Sticky header** with nav links that scroll smoothly to each section
- **Responsive**: phone, tablet and desktop layouts with no horizontal scroll

## How it's built
- `box-sizing: border-box` set globally
- Colours, fonts and spacing stored in CSS variables in `:root`
- **Flexbox**: header/nav, hero, form rows, caption panels, pop-up caption bar
- **Grid**: gallery (`auto-fill` + `minmax`), About, booking form and footer
- Mobile-first, with breakpoints at 640px (tablet) and 900px (desktop)
- Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`

## Extras beyond the brief
**HTML**
- `<section>`: each part of the page is its own section with an `id`, which the nav links jump to
- `<figure>` + `<figcaption>`: each gallery photo and its caption are grouped as one self-contained item
- `<address>`: the semantic tag for the contact details in the footer
- `aria-label`: names the two navs ("Main" and "Footer") so screen readers can tell them apart. The photo buttons have no label of their own, so screen readers read each photo's full `alt` text
- `popover` / `popovertarget`: opens and closes the pop-up viewer without JavaScript
- `<fieldset>` + `<legend>`: groups the documentary Yes/No question
- `loading="lazy"` on lower images and `<link rel="preload">` for the hero photo, so the page loads faster
- Descriptive `alt` text on every photo

**CSS**
- `:has()`: shows the documentary subject list only when "Yes" is checked
- `::backdrop` and `:popover-open`: style the dark overlay and layout of the pop-up viewer
- `grid-auto-flow: dense` with wide/tall tiles (only from 640px, so phones never scroll sideways)
- `max()` side padding: sections stretch full width for their background colour while content stays within 1200px
- `clamp()`: the hero heading scales with the screen size between a minimum and maximum
- `backdrop-filter` + see-through `rgba()` backgrounds: highlight behind the hero label and gallery captions
- `position: sticky` header with `scroll-margin-top` so section titles aren't hidden under it

## Run it
Open `index.html` in a browser.

## Credits
Photos from [Unsplash](https://unsplash.com) via [Lorem Picsum](https://picsum.photos). Photo locations and descriptions are sample text.
