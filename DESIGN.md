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

One authored entrance on the first screen: the headline rises, the leaf's stem draws and its blades grow, the letters of the wordmark spread outward from the I, VENTURES tracks open, and the copper band wipes in. The hero glow drifts slowly. Nothing else animates on scroll. All of it is switched off under `prefers-reduced-motion`.

## Layout

Max content width 82rem; side padding `clamp(1.25rem, 4vw, 3.5rem)`. Below 60rem everything stacks to one column and the navigation collapses behind a Menu button.
