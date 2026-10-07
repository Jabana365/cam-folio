# cam-folio
A single-page nature photography portfolio built with plain HTML5 and CSS3, no frameworks. Week 1 assignment.

## Sections
- **Hero**: full-width background photo with the page's only `h1`
- **Gallery**: the centerpiece. A CSS Grid of photos using `object-fit: cover` so every image fills its tile without stretching. Click a photo to open it in a pop-up viewer (HTML `popover` attribute, no JavaScript)
- **About**: short bio with a photo
- **Book a shoot**: contact details plus a booking form (replaces a shop button). Includes a documentary coverage question; the subject list (hunting trip, wildlife behaviour, expedition...) appears only when "Yes" is picked, using CSS `:has()`
- **Footer**: nav links, contact info and copyright

## How it's built
- `box-sizing: border-box` set globally
- Colours, fonts and spacing stored in CSS variables in `:root`
- **Flexbox**: header/nav, hero, form fields, footer
- **Grid**: gallery (`auto-fill` + `minmax`, with `dense` packing for wide/tall tiles) and the about/contact layouts
- Mobile-first, with breakpoints at 640px (tablet) and 900px (desktop)
- Wide/tall gallery tiles only span at 640px and up, so phones never scroll sideways

## Run it
Open `index.html` in a browser.

## Credits
Photos from [Unsplash](https://unsplash.com) via [Lorem Picsum](https://picsum.photos).
