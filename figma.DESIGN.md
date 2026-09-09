---
name: Figma
colors:
  primary: "#000000"
  secondary: "#7C3AED"
  surface: "#FFFFFF"
  on-surface: "#000000"
typography:
  body-md:
    fontFamily: Inter Tight
    fontSize: 16px
    fontWeight: 400
rounded:
  md: 8px
---

# Design System Inspired by Figma

## 1. Visual Theme & Atmosphere

Figma's design system embodies a minimalist, modern creative workspace aesthetic—clean, purposeful, and focused on enabling boundless collaboration. The visual language prioritizes clarity and functionality, using a restrained palette anchored in pure blacks and whites with subtle warm accents that punctuate key interactions. Marketing surfaces may use a restricted set of pastel fills plus one brand purple, always as illustration or card fill — never as primary UI. This is a system designed for creative professionals who value precision, speed, and elegance. The typography breathing room, generous whitespace, and intentional use of color create an environment that feels both inviting and powerful, allowing the user's creative work to take center stage rather than the interface itself.

**Key Characteristics**
- Monochromatic foundation with selective warm accents for highlights
- Single grotesk type stack (Inter Tight) with medium-weight display headlines
- Lucide icons only; the logo is a bare lucide `Box` with no container
- Generous whitespace and breathing room throughout layouts
- High contrast for accessibility and visual clarity
- Minimalist component styling with subtle refinements
- Marketing-only pastels plus brand purple, strictly illustration and card-fill only
- Dark footer and warm-gradient hero reserved for marketing pages
- Emphasis on usability over ornamentation

## 2. Color Palette & Roles

### Primary
- **Black** (`#000000`): Primary text, dark backgrounds, borders, and dominant UI elements; the foundation of the system
- **White** (`#FFFFFF`): Primary background, text on dark surfaces, card backgrounds, and light surfaces

### Accent Colors
- **Warm Accent** (`#FFB3B3`): Highlight accents for featured content, visual emphasis, and call-to-action highlights; used sparingly for visual interest
- **Deep Accent** (`#972121`): Secondary accent for deeper emphasis, interactive states, and status indicators; provides contrast against light backgrounds

### Marketing Accents (restricted — illustration and card fill only, never primary UI)
- **Brand Purple** (`#7C3AED`): Secondary marketing CTA (hero only), `POPULAR` pills, illustration strokes; tint (`#EDE9FE`) for active-step and badge fills
- **Tint Peach** (`#FDE8D8`), **Tint Blue** (`#DDEAF6`), **Tint Lavender** (`#E8DFF7`), **Tint Mint** (`#DFF2E0`): Pastel card fills and illustration panels on marketing surfaces; never behind body text

### Interactive
- **Button Primary** (`#000000`): Primary action buttons everywhere, including marketing pages; high contrast against white backgrounds
- **Button Brand** (`#7C3AED`): Secondary marketing-hero CTA only; never inside the app
- **Button Danger** (`#972121`): Destructive actions; white text
- **Button Text** (`#FFFFFF`): Text on primary buttons and dark surfaces
- **Link Default** (`#000000`): Default link color; matches body text for seamless integration
- **Link Hover** (`#972121`): Hover state for links; provides visual feedback using secondary accent

### Neutral Scale
- **Text Primary** (`#000000`): All body text, labels, and primary content
- **Text Secondary** (`#666666`): Secondary text, descriptions, and metadata (inferred from usage patterns)
- **Divider** (`#E0E0E0`): Subtle borders and dividers (inferred for component separation)
- **Background Tertiary** (`#F5F5F5`): Subtle backgrounds for grouped content (inferred for surface variation)

### Surface & Borders
- **Surface Default** (`#FFFFFF`): Primary surface for cards and containers
- **Surface Overlay** (`#000000`): Dark overlays with opacity for modals and full-screen interactions
- **Surface Dark** (`#111111`): Marketing footer background only
- **Border Card** (`1px solid #E0E0E0`): Cards, dividers, and container edges
- **Border Strong** (`1px solid #000000`): Buttons and primary interactive edges
- **Border Subtle** (`1px solid #CCCCCC`): Inputs and grouped sections

## 3. Typography Rules

### Font Family

**Primary:** figmaSans (custom proprietary typeface)
Fallback stack: `"Inter Tight", "Inter", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif`

**Single family only:** there is no secondary or monospace typeface. Every role — display, headings, body, labels, badges, code-like text — uses the Inter stack above.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / H1 | figmaSans | 56px | 500 | 56px | -0.03em | Page headlines; maximum impact (36px on mobile) |
| Heading / H2 | figmaSans | 14px | 400 | 18.2px | 0px | Eyebrow labels and technical headings |
| Section Title | figmaSans | 32–40px | 500 | 36–44px | -0.03em | Interior page and section titles |
| Subheading / H3 | figmaSans | 16px | 500 | 22.4px | -0.02em | Subsection titles; card headers |
| Body / Paragraph | figmaSans | 16px | 400 | 23.2px | 0px | Base UI text; hero descriptions use 18px / 25.2px |
| Button Text | figmaSans | 16px | 400 | 18.4px | 0px | Call-to-action buttons (compact variant: 14px) |
| Navigation | figmaSans | 16px | 400 | 23.2px | 0px | Menu items; navigation links |
| Small / Caption | figmaSans | 14px | 400 | 20px | 0px | Metadata; timestamps; secondary info |
| Code / Technical | figmaSans | 12px | 400 | 16px | 0px | Code blocks; technical text (same Inter stack, no monospace) |

### Principles
- **Weight Variation:** Body and UI text at `400`; display headlines, card titles, and eyebrows at `500` with `-0.02em` to `-0.03em` tracking
- **Generous Line Height:** Line heights exceed font size to ensure breathing room and readability in dense layouts
- **Proportional Scaling:** Typography scale follows a predictable progression for visual hierarchy
- **Single Family:** one grotesk stack for everything; hierarchy comes from size, weight, and color — never from a second typeface
- **Accessibility First:** High contrast and sufficient sizing ensure legibility for all users

## 4. Component Stylings

### Buttons

**Primary Button**
- Background: `#000000`
- Text Color: `#FFFFFF`
- Padding: `12px 22px`
- Border Radius: `8px`
- Border: None
- Font Size: `16px`
- Font Weight: `400`
- Line Height: `18.4px`
- Height: `46px` (minimum touch target)
- Hover State: Opacity `0.85` on background; text remains `#FFFFFF`
- Active State: Background `#1A1A1A`; text `#FFFFFF`
- Disabled State: Background `#CCCCCC`; text `#999999`; cursor `not-allowed`

**Secondary Button**
- Background: Transparent (`rgba(0, 0, 0, 0)`)
- Text Color: `#000000`
- Padding: `12px 22px`
- Border Radius: `8px`
- Border: `1px solid #000000`
- Font Size: `16px`
- Font Weight: `400`
- Line Height: `18.4px`
- Height: `46px`
- Hover State: Background `#F5F5F5`; text `#000000`; border `#000000`
- Active State: Background `#E0E0E0`; border `#1A1A1A`
- Disabled State: Border `#CCCCCC`; text `#999999`

**Ghost Button**
- Background: Transparent (`rgba(0, 0, 0, 0)`)
- Text Color: `#000000`
- Padding: `0px 4px`
- Border Radius: `0px`
- Border: None
- Font Size: `16px`
- Font Weight: `400`
- Line Height: `22.4px`
- Height: `auto`
- Hover State: Text `#972121`; underline `1px solid #972121` (optional)
- Active State: Text `#972121`
- Disabled State: Text `#CCCCCC`; cursor `not-allowed`

**Small Button / Icon Button**
- Background: Transparent (`rgba(0, 0, 0, 0)`)
- Text Color: `#FFFFFF`
- Padding: `0px 4px`
- Border Radius: `0px`
- Border: None
- Font Size: `16px`
- Font Weight: `400`
- Line Height: `22.4px`
- Size: `20px × 20px` (icon buttons)
- Hover State: Opacity `0.7`
- Active State: Opacity `0.9`

**Compact Button (`sm`)**
- Same variants as above at `40px` minimum height, `16px` horizontal padding, `14px` font; used for nav bars and dense headers

**Brand Button (marketing hero only)**
- Background: `#7C3AED`; text `#FFFFFF`; same sizing as Primary; hover opacity `0.85`; never used inside the app

**Danger Button**
- Background: `#972121`; text `#FFFFFF`; same sizing as Primary; hover opacity `0.85`

**Button Motion Rule**
- Hover feedback is opacity, wash fill, or a sliding arrow — never translate-plus-hard-shadow

### Cards & Containers

**Content Card**
- Background: `#FFFFFF`
- Border: `1px solid #E0E0E0` (inferred)
- Border Radius: `8px`
- Padding: `24px`
- Box Shadow: None (flat design)
- Text Color: `#000000`
- Font Size: `16px`
- Font Weight: `400`
- Line Height: `23.2px`
- Hover State: Border `#CCCCCC`; background remains `#FFFFFF`

**Large Feature Card**
- Background: `#FFFFFF`
- Border: `1px solid #E0E0E0`
- Border Radius: `12px`
- Padding: `24px`
- Box Shadow: None (flat default)
- Title: `18px` weight `500` tracking `-0.02em`; body `14px #666666`
- Icon Tile: `32px` bordered tile with a lucide icon; arrow slides right on hover
- Hover State: Shadow elevation to `0px 4px 12px rgba(0, 0, 0, 0.08)`

**Pill / Badge**
- Fully rounded (`9999px`); announcement pills white with subtle shadow; `POPULAR` pills `#EDE9FE` fill with `#7C3AED` text; status pills use the single grotesk stack at medium weight — never monospace

**Stat Card (marketing only)**
- Pastel fill (peach, blue, lavender, or mint); `12px` radius; value at `32px` weight `500` tracking `-0.03em`; label `14px`; footer row with logo and arrow

**App Pattern Card (marketing only)**
- Background `#F5F5F5`; `12px` radius; tinted icon circle; title `16px` weight `500`; arrow slides right on hover

**Container Background**
- Background: `#F5F5F5` (inferred light background)
- Padding: `40px 32px`
- Border Radius: `0px` (full-width sections)

### Inputs & Forms

**Text Input**
- Background: `#FFFFFF`
- Border: `1px solid #CCCCCC`
- Border Radius: `8px`
- Padding: `12px 16px`
- Font Family: figmaSans
- Font Size: `16px`
- Font Weight: `400`
- Line Height: `22.4px`
- Text Color: `#000000`
- Placeholder Color: `#999999`
- Height: `44px` (minimum touch target)
- Hover State: Border `#999999`
- Focus State: Border `#000000`; no ring, shadow, or outline on form fields — focus is shown by border color only
- Disabled State: Background `#F5F5F5`; border `#E0E0E0`; text `#CCCCCC`

**Text Area**
- Background: `#FFFFFF`
- Border: `1px solid #CCCCCC`
- Border Radius: `8px`
- Padding: `12px 16px`
- Font Family: figmaSans
- Font Size: `14px`
- Font Weight: `400`
- Line Height: `20px`
- Minimum Height: `120px`
- Focus State: Border `#000000`; no ring, shadow, or outline on form fields — focus is shown by border color only

### Navigation

**Navigation Bar**
- Background: `#FFFFFF`
- Height: `64px` (inferred standard height)
- Padding: `0px 32px`
- Border Bottom: `1px solid #E0E0E0`
- Display: Flex; align-items center; justify-content space-between
- Box Shadow: `0px 1px 0px 0px rgba(0, 0, 0, 0.16)` (sm elevation from tokens)
- Z-Index: `20`

**Navigation Item**
- Font Size: `16px`
- Font Weight: `400`
- Line Height: `23.2px`
- Text Color: `#000000`
- Padding: `8px 16px`
- Border Radius: `4px`
- Hover State: Background `#F5F5F5`; text `#000000`
- Active State: Text `#972121`; border-bottom `2px solid #972121`

**Dropdown Menu**
- Background: `#FFFFFF`
- Border: `1px solid #E0E0E0`
- Border Radius: `8px`
- Padding: `8px 0px`
- Box Shadow: `0px 4px 12px rgba(0, 0, 0, 0.15)` (inferred dropdown shadow)
- Z-Index: `30`
- Item Padding: `12px 16px`
- Item Hover: Background `#F5F5F5`

### Links

**Text Link**
- Text Color: `#000000`
- Font Size: `16px`
- Font Weight: `400`
- Line Height: `23.2px`
- Text Decoration: None (default)
- Hover State: Text `#972121`; text-decoration `underline`; text-underline-offset `4px`
- Visited State: Text `#666666`
- Disabled State: Text `#CCCCCC`; cursor `not-allowed`

**Large Link / CTA Link**
- Text Color: `#000000`
- Font Size: `18px`
- Font Weight: `330`
- Line Height: `25.2px`
- Hover State: Text `#972121`
- Padding: `4px 0px` (clickable area)

**Icon Link**
- Background: Transparent
- Size: `20px × 20px`
- Color: `#000000`
- Hover State: Opacity `0.7`; color `#972121`

### Icons & Logo
- **Library:** `lucide-react` exclusively — verify export names against the installed version before use (renames happen between releases)
- **Sizes:** `h-4 w-4` in tiles, pills, and inline links; `h-7 w-7` for the logo; `h-10 w-10` for resource illustrations
- **Rules:** No emoji, unicode symbols, or geometric glyphs as icons anywhere; arrows that indicate movement slide on hover (`translate-x`)
- **Logo:** Bare lucide `Box` (`h-7 w-7`, current text color) with no surrounding box, tile, or border — black on light surfaces, white on dark

### Marketing Sections
- **Hero:** Photo background (`public/hero-bg.webp`) under a white readability veil with dotted texture; announcement pill; grotesk display headline with warm-accent highlight phrase; dual CTA (black primary + brand secondary); grayscale proof strip
- **Interactive Steps:** Numbered step buttons with `aria-pressed`; active step uses brand-tint fill; preview panel keeps a fixed minimum height so switching steps never resizes the layout; panel content cross-fades (honor `prefers-reduced-motion`)
- **CTA Band:** Black `12px` panel with white headline, white solid primary button, and white-outline secondary button
- **Dark Footer:** `#111111` background; four link columns with hairline dividers; white solid plus white-outline CTAs; micro legal line

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Spacing Scale & Usage:**
- `4px`: Small internal padding, micro-spacing between inline elements
- `8px`: Tight grouping, gap between small components
- `12px`: Form input padding, compact spacing
- `16px`: Standard padding for buttons and inputs, comfortable spacing
- `24px`: Card internal padding, section padding
- `28px`: Medium section spacing
- `32px`: Large section padding, container padding
- `36px`: Extra-large padding for prominent sections
- `40px`: Section margins, major spacing between sections
- `48px`: Large vertical spacing between major sections
- `52px`: Extra-large vertical spacing
- `56px`: Maximum spacing for hero sections and dramatic separation

**Context Application:**
- **Compact Areas:** 8px–12px (navigation, dense lists)
- **Standard Content:** 16px–24px (cards, form groups, normal spacing)
- **Section Separation:** 40px–56px (between major content blocks)
- **Padding Consistency:** 24px for cards; 32px for containers; 16px for inputs

### Grid & Container

- **Max Width:** 1200px (standard container width for large screens)
- **Gutter/Gap:** 16px–24px between grid columns
- **Column Strategy:** 12-column grid system (inferred standard); responsive reflow at breakpoints
- **Container Padding:** 32px on desktop; 20px on tablet; 16px on mobile
- **Section Pattern:** Full-width sections with internal containers aligned to grid
- **Centered Content:** Sections centered with auto margins on sides

### Whitespace Philosophy

Figma's design system embraces negative space as a core design principle. Whitespace is not empty—it provides visual rest, improves focus, and creates hierarchy. Layouts intentionally use generous margins and padding to prevent visual clutter and allow content to breathe. Each section maintains clear separation through whitespace rather than borders or heavy rules, creating a calm, organized interface that prioritizes clarity over density.

### Border Radius Scale

- **Sharp/None:** `0px` – Full-width sections and large structural elements
- **Minimal:** `4px` – Navigation items only
- **Standard:** `8px` – Buttons, app cards, inputs, and most interactive components
- **Marketing:** `12px` – Feature, stat, app-pattern, and auth cards
- **Pill:** `9999px` – Pills, badges, avatars, and fully rounded elements

### Border Widths

- **Thin / Subtle:** `1px` – Primary use for borders, dividers, and container edges
- **No Border:** `0px` – Most components; borders used minimally and intentionally

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow; `box-shadow: none` | Base content, cards in neutral state, body elements |
| Raised (sm) | `0px 1px 0px 0px rgba(0, 0, 0, 0.16)` | Navigation bars, subtle elevation for distinction |
| Lifted | `0px 4px 12px rgba(0, 0, 0, 0.08)` | Marketing and app cards on hover; floating preview panels |
| Elevated | `0px 8px 20px rgba(0, 0, 0, 0.12)` | Modal overlays, floating panels, prominent features |
| Floating | `0px 16px 32px rgba(0, 0, 0, 0.15)` | Popovers, tooltips, highest prominence elements |

**Shadow Philosophy**

Figma uses subtle, sophisticated shadow treatment to create layering and depth without visual heaviness. Shadows are employed sparingly—primarily for interactive states and overlays—maintaining the clean, minimalist aesthetic. The shadow color remains pure black with varying opacity to suggest elevation naturally. This approach prevents shadow accumulation and keeps the interface feeling light and modern.

### Opacity Levels

- **Full Opacity:** `1` – Primary text, interactive elements, solid backgrounds
- **High Opacity:** `0.9` – Active/focused states, primary content
- **Medium-High Opacity:** `0.7` – Hover states on some elements, secondary prominence
- **Medium Opacity:** `0.5` – Disabled elements, secondary layers, subtle backgrounds (inferred)
- **Low Opacity:** `0.16` – Shadows, subtle overlays, minimal visual weight
- **Extra-Low Opacity:** `0.08` – Very subtle overlays (no focus rings exist in this system)

### Z-index / Layering

- **Base Content:** `1` – Standard page content, cards, default elements
- **Sticky/Fixed:** `10` – Sticky navigation, fixed headers (inferred)
- **Dropdown:** `20` – Navigation dropdowns, select menus
- **Dropdown Elevated:** `25` – Nested dropdowns, secondary overlays
- **Dropdown Higher:** `30` – Tooltips, popovers above standard dropdowns
- **Dropdown Highest:** `40` – Modal overlays, lightbox, full-screen overlays
- **Top-Most:** `50` – Toast notifications, notifications above modals (inferred)

## 7. Do's and Don'ts

### Do

- **Use pure black and white as the foundation** – Maintain contrast and clarity; reserve colored accents for intentional emphasis
- **Embrace whitespace** – Allow breathing room between sections; whitespace is a design element, not wasted space
- **Apply borders sparingly** – Use borders only for functional division; prefer whitespace and shadow for visual separation
- **Maintain consistent padding** – Use the spacing scale (4px base unit) for all margins and padding to ensure visual harmony
- **Prioritize typography hierarchy** – Use the established font sizes and weights to guide user attention naturally
- **Use rounded corners consistently** – `8px` for interactive components and app cards; `12px` for marketing and auth cards; `9999px` for pills and badges; `0px` for structural elements
- **Scale shadows subtly** – Employ shadows to indicate elevation; avoid heavy shadows that flatten or obscure content
- **Ensure sufficient contrast** – All text and interactive elements must meet WCAG AA standards (`4.5:1` for body text minimum); pastels are fills only, never behind body text
- **Apply color accents intentionally** – Reserve `#FFB3B3` and `#972121` for highlights, CTAs, and status indicators; `#7C3AED` and pastels are marketing-only fills, never primary UI
- **Use lucide icons only** – Never emoji, unicode symbols, or geometric glyphs as icons; verify export names against the installed `lucide-react` version
- **Never ring form fields** – Focus on inputs is border color only; no ring, shadow, or outline on any input, textarea, or select
- **Test responsive behavior** – Verify layouts collapse gracefully and remain usable on all screen sizes

### Don't

- **Avoid excessive color variation** – Don't introduce new colors outside the palette; the system relies on black, white, two accents, plus restricted marketing pastels and brand purple
- **Don't override the font family** – the single Inter stack (figmaSans first) is core to the brand; never introduce a monospace or second family
- **Avoid deep shadows** – Don't stack multiple shadows or use heavy drop shadows; keep elevation subtle and refined
- **Don't crowd whitespace** – Avoid cramming content without breathing room; respect margin and padding minimums
- **Don't use blurred or excessive opacity** – Keep overlays and backgrounds clear; avoid heavy blur effects that obscure content
- **Don't mix border styles** – Stick to solid `1px` borders; avoid dashed, dotted, or double borders unless specifically required
- **Don't create visual noise** – Avoid patterns, textures, or decorative elements that distract from content
- **Avoid inconsistent border radius** – Don't randomly apply different radius values; use the established scale
- **Don't disable hover states** – Always provide visual feedback on interactive elements; hover states are essential for usability
- **Avoid semantic color confusion** – Don't use accent colors for primary text or backgrounds; reserve them for highlights and CTAs

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | 320px–639px | Single-column layouts; `16px` padding; `16px` body text; center nav links hidden, CTAs condensed |
| Tablet | 640px–1023px | Two-column layouts; `20px` padding; `16px` body text; horizontal navigation with condensed items |
| Desktop | 1024px+ | Full multi-column layouts; `32px` padding; `16px` body text (`18px` hero descriptions); expanded navigation with dropdowns |
| Wide | 1440px+ | Max-width containers (`1200px`); centered with side margins; enhanced spacing |

### Touch Targets

- **Minimum Size:** `44px × 44px` for all interactive elements (buttons, links, inputs); compact nav buttons may use `40px` height
- **Comfortable Spacing:** `16px` minimum gap between adjacent touch targets to prevent mis-taps
- **Button Padding:** `12px 22px` on desktop; `14px 24px` on mobile for larger touch areas
- **Icon Size:** `20px × 20px` minimum for icon-only buttons; `24px × 24px` preferred for mobile
- **Link Padding:** `8px` vertical; `4px` horizontal for inline links to create adequate tap zones

### Collapsing Strategy

- **Navigation:** Center nav links hide below `1024px` (no hamburger); brand, sign-in, and primary CTA remain visible
- **Grid Layouts:** 3-column layouts on desktop → 2-column on tablet → 1-column on mobile; maintain `8px–16px` gap between columns
- **Padding Reduction:** `32px` desktop → `20px` tablet → `16px` mobile to preserve content prominence
- **Typography Scaling:** Font sizes decrease by `2px–4px` on mobile; line heights adjust proportionally
- **Images:** Responsive images scale with container; max-width `100%`; aspect ratio preserved
- **Spacing Compression:** Large margins (`40px–56px`) reduce to `24px–32px` on tablet; `16px–24px` on mobile
- **Component Stacking:** Multi-column forms collapse to single column; cards reflow in grid below breakpoints
- **Hero Sections:** Background images scale; headline size reduces from `56px` → `36px` on mobile; content centers

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** Black (`#000000`)
- **CTA Text:** White (`#FFFFFF`)
- **Link Text:** Black (`#000000`), hover to Deep Accent (`#972121`)
- **Heading Text:** Black (`#000000`)
- **Body Text:** Black (`#000000`)
- **Background:** White (`#FFFFFF`)
- **Secondary Background:** Light Gray (`#F5F5F5`)
- **Border:** Black (`#000000`)
- **Subtle Border:** Medium Gray (`#E0E0E0`)
- **Accent / Highlight:** Warm Accent (`#FFB3B3`)
- **Secondary Accent:** Deep Accent (`#972121`)
- **Brand (marketing only):** Purple (`#7C3AED`), tint (`#EDE9FE`)
- **Pastels (marketing fill only):** Peach (`#FDE8D8`), Blue (`#DDEAF6`), Lavender (`#E8DFF7`), Mint (`#DFF2E0`)
- **Disabled Text:** Light Gray (`#CCCCCC`)
- **Placeholder Text:** Medium Gray (`#999999`)

### Iteration Guide

1. **Start with monochromatic foundation** – All text is `#000000`; all backgrounds are `#FFFFFF` or `#F5F5F5`; reserve accent colors (`#FFB3B3`, `#972121`) for specific CTAs, highlights, and hover states only; brand purple and pastels are marketing-only fills, never primary UI.

2. **Apply the spacing scale religiously** – Use `4px` multiples exclusively (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `56px`); never introduce arbitrary spacing values.

3. **Typography is hierarchy** – Base text is `16px weight 400` (Inter Tight stack); display headlines are `56px weight 500` with `-0.03em` tracking (`36px` on mobile); eyebrows, pills, and badges use the same grotesk stack — never monospace; all other sizes follow the hierarchy table.

4. **Button styling is consistent** – Primary buttons are always `#000000` background with `#FFFFFF` text, `12px 22px` padding, `8px` radius, `46px` height (compact `sm` at `40px` for navs); secondary buttons are transparent with `1px solid #000000` border; ghost buttons are transparent text-only links; brand purple and danger variants follow the same sizing; hover is opacity, wash, or sliding arrow — never translate-plus-shadow.

5. **Cards and containers use minimal styling** – App cards: background `#FFFFFF`, border `1px solid #E0E0E0`, radius `8px`, padding `24px`, flat; marketing cards: `12px` radius with `0px 4px 12px rgba(0, 0, 0, 0.08)` hover; pills are fully rounded; auth cards are `12px`; never use heavy shadows on default cards.

6. **Navigation bar is fixed at `64px` height** – Padding `0px 32px`, border-bottom `1px solid #E0E0E0`, z-index `20`; menu items are `16px` weight 400; dropdowns appear with z-index `30` and subtle shadow (`0px 4px 12px rgba(0, 0, 0, 0.15)`).

7. **Forms use standard input styling** – All inputs: `#FFFFFF` background, `1px solid #CCCCCC` border, `8px` radius, `12px 16px` padding, `16px` font, `44px` height; focus only changes the border to `#000000` — never add a ring, shadow, or outline to any input, textarea, or select.

8. **Responsive design follows breakpoint rules** – Mobile: single column, `16px` padding, `16px` body text, `36px` hero headline; Tablet: two columns, `20px` padding; Desktop: full layout, `32px` padding in `1200px` containers; never hardcode widths—use max-width containers and flex/grid layouts.

9. **Opacity and layering are intentional** – Shadows use pure black with opacity (`rgba(0, 0, 0, 0.16)` for nav hairline; `rgba(0, 0, 0, 0.08)` for card hover); hover states reduce opacity (`0.85` on buttons), add subtle background (`#F5F5F5`), or slide an arrow; disabled states use `#CCCCCC` text on `#F5F5F5` background.

10. **Always test touch targets and accessibility** – Buttons minimum `44px × 44px` (`40px` compact nav exception); gap between interactive elements minimum `16px`; color contrast minimum `4.5:1` for text; form fields never get a ring, shadow, or outline — focus is border color only; buttons and links keep the `:focus-visible` outline; honor `prefers-reduced-motion`; use semantic HTML and ARIA labels for screen readers.

11. **Icons and logo** – `lucide-react` only (verify export names against the installed version); `h-4 w-4` in tiles and links, `h-7 w-7` logo, `h-10 w-10` illustrations; logo is a bare `Box` with no container; never emoji or unicode glyphs as icons.