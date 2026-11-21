# Vireilo Ventures: design system

The visual system of vireilo.com as built in the November 2026 redesign. Tokens live in `site.css` under `:root`.

## Character

A holding company's front door. Bold plain statements on a deep navy-to-green gradient, one copper band of warmth, and the wordmark as the single ornament. Simple, reserved, and unmistakably Vireilo. No company diagrams, no icon cards, no small labels above headings.

## Colour

| Token | Value | Role |
|---|---|---|
| `--navy-deep` | `#06111A` | Page ground, footer, dark buttons |
| `--navy` | `#0B1C2C` | Gradient end |
| `--green-deep` | `#0F2E25` | Gradient middle |
| `--green` | `#1B4D3E` | Brand-meaning section field |
| `--green-light` | `#2A6B56` | Glow inside the hero gradient |
| `--ivory` | `#F7F3EB` | Text on dark; light section ground |
| `--ivory-dark` | `#EDE6D9` | Second light section |
| `--copper` | `#B87333` | Start of the copper band; small headings on light |
| `--copper-light` | `#D4A574` | Leaf, accents, large verbs, rules, primary button on dark |
| `--ink` | `#14110B` | Text on copper and ivory |

The gradient is the brand's ground: `linear-gradient(165deg, navy-deep, green-deep 48%, navy)` with soft green glows. Colour is used as whole fields (gradient, green, ivory, copper), never as scattered accents. Copper fields carry dark ink text.

## Type

- **Archivo** (variable, self-hosted) for everything read: display at weight 800 and width 110 to 112%, tight tracking; body at 400 to 500.
- **Cormorant Garamond** 500 for the wordmark, the Latin *virere*, and the closing quotation only.
- Display tops out at 6rem. Body is 1.0625rem at 1.6 line height.

## The wordmark

VIREILO in Cormorant capitals, letterspaced .24em, with the copper leaf standing over the second I. This is the logo; the leaf does not appear alone or boxed. Markup is the `.wm` component.

## Components

- **Buttons**: square corners. Dark (`.btn-dark`) on copper fields, copper-light (`.btn-primary`) on dark. Secondary actions are underlined text links.
- **Lists, not cards**: content groups are ruled rows or columns with a top rule. Copper-light 2px rule for emphasis, hairline otherwise.
- **Section head**: heading left, lead paragraph right, on a 6/5 grid.
- **Forms**: full 1px border, square, dark translucent fill, copper-light focus ring.

## Motion

The page is meant to be scrolled as one continuous piece, with each section arriving in its own way.

- **First screen**: the headline rises, the leaf's stem draws and its blades grow, the wordmark's letters spread outward from the I, VENTURES tracks open, and the copper band wipes in. The glow in the gradient drifts slowly. On scroll the first screen eases back and fades.
- **Positioning**: Own, Operate, Scale and Steward sit dim and light to copper one at a time as each crosses the middle of the screen.
- **Meaning**: the Latin word is set letter by letter and drifts slightly sideways with the scroll.
- **Mission and Vision**: the centre line draws downward between the two statements.
- **Lists**: rules draw from the left and rows follow in sequence.
- **Close**: the copper field wipes in from the left, echoing the first screen.
- **Navigation**: the section being read is underlined in copper; a copper hairline at the top shows progress.

All easing is one exponential ease-out (`--ease`). Everything is switched off under `prefers-reduced-motion`, and all content is visible without JavaScript. A revealed element gets the class `seen`.

## Type scale

`--t-h2` section headings and the four verbs · `--t-h3` item headings · `--t-lead` lead paragraphs and statements · `--t-body` running text · `--t-small` notes. Use these tokens; do not set one-off sizes.

## Layout

Max content width 82rem; side padding `clamp(1.25rem, 4vw, 3.5rem)`. Below 60rem everything stacks to one column and the navigation collapses behind a Menu button.

## The founder figure

An illustrated figure of the founder (suit, red tie, red sneakers) appears once, in the home page scroll scene between the wordmark hero and the platform section. The page pins and scrolling plays his performance: the door opens, he walks out spinning a basketball, and the ball becomes a house, while "Own.", "Operate." and "Scale." pass beside him. It is reversible and shows a still under `prefers-reduced-motion`.

Frames live in `assets/char/` (entrance and trick sets, 24 fps, WebP, keyed off a blue backdrop). Player: `character.js`.

### Acts

Seven short performances further down the home page, one per section, each matched to what the section says. Each plays once when it is well inside the screen, is decorative (`aria-hidden`), stands about 6 to 9rem tall, and never overlaps text. Under `prefers-reduced-motion` or without JavaScript each shows a still.

- **Platform**: he bounce-passes the basketball; it leaves his frame and rolls along the top rule of the Own / Operate / Scale / Steward list.
- **Brand Meaning**: a wide-set VIREILO is missing its leaf; he takes a sprig from his jacket and sets it over the I, and the real leaf grows there.
- **Mission & Vision**: he shades his eyes, looks toward Vision, and points.
- **Values**: a closing rule under the left column hangs crooked; he nudges it level and dusts his hands.
- **Own what endures**: he sets the little house down on the rule.
- **Legacy**: standing on the footer's edge, he tosses the keys forward.
- **Footer**: a two-finger salute, then he walks off the right edge.

Each act is an animated WebP that plays once (`assets/char/cameo/<name>.webp`, with `-first` and `-last` stills), swapped in by `site.js` (`img[data-play]`). They were generated on a blue backdrop and keyed with the same pipeline as the main scene. Keep to one act per section.
