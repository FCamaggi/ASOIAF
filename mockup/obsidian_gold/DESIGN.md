---
name: Obsidian & Gold
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#ffb4a8'
  on-secondary: '#690000'
  secondary-container: '#920703'
  on-secondary-container: '#ff9a8a'
  tertiary: '#cfcecd'
  on-tertiary: '#303030'
  tertiary-container: '#b4b2b2'
  on-tertiary-container: '#454545'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a8'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#920703'
  tertiary-fixed: '#e4e2e2'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  obsidian-black: '#0A0A0A'
  charcoal-haze: '#1A1A1A'
  targaryen-crimson: '#B22222'
  valyrian-steel: '#A8A8A8'
  dragon-gold: '#FFD700'
typography:
  headline-xl:
    fontFamily: Source Serif 4
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is a **Modern Medieval** interpretation that blends the gravitas of epic fantasy with the precision of a high-end luxury interface. It evokes a sense of "digital archaeology"—as if a ancient scroll were rendered on a modern flagship device.

The personality is **mysterious, premium, and authoritative**. The design follows a **Minimalist-Noir** approach: heavy use of dark space (Obsidian) allows the metallic accents (Gold) and blood-red highlights (Crimson) to feel precious and significant. Interaction patterns are intentional and rhythmic, avoiding the frantic pace of typical social apps in favor of a curated, cinematic experience.

Key principles:
- **Atmospheric Depth:** Use of subtle gradients to mimic low-light castle environments.
- **Chronicle Hierarchy:** Typography and layouts that mirror historical manuscripts.
- **Noble Restraint:** Decorative elements are used sparingly to ensure the "Obsidian" canvas remains clean and readable.

## Colors

The palette is strictly dark-mode by default to maintain the "mysterious" atmospheric quality. 

- **Primary (Dragon Gold):** Reserved for interactive elements, highlights, and status indicators of high importance.
- **Secondary (Targaryen Crimson):** Used specifically for "Matches," destructive actions, or spoiler warnings. It represents the bloodline and the danger of the lore.
- **Neutral (Obsidian & Charcoal):** The foundation of the UI. Backgrounds use `#0A0A0A`, while containers use `#1A1A1A` to create depth without relying on traditional shadows.
- **Valyrian Steel:** Used for secondary text and borders to provide a metallic, sharp contrast against the dark background.

## Typography

The typographic system contrasts **Source Serif 4** (a sturdy, authoritative serif) with **Hanken Grotesk** (a sharp, contemporary sans-serif). 

- **Headlines:** Use Source Serif 4 for all titles and category headings. In high-emphasis scenarios (App Title), use uppercase with increased letter spacing to mimic stone inscriptions.
- **Body:** Hanken Grotesk provides the necessary readability for lore descriptions and metadata.
- **Utility:** **JetBrains Mono** is used for progress indicators (e.g., "04 / 17") and technical metadata to evoke a "maester’s ledger" or systematic feel.
- **Spoiler Content:** Should be treated with a blurred state or high-contrast label-caps styling.

## Layout & Spacing

The system uses a **Fluid Vertical Stack** model, optimized for mobile-first consumption. 

- **Grid:** A 12-column grid is used for desktop, but most content is centered in a single column "Story" view (max-width: 600px) to maintain focus.
- **Rhythm:** A 4px baseline grid ensures tight alignment. Large vertical gaps (`stack-lg`) are used between categories to create a sense of "chapters."
- **Navigation:** Navigation is strictly docked to the bottom (Safe Area) to allow the content—portraits and house sigils—to occupy the prime visual real estate.
- **Comparison View:** On tablets and desktops, the layout reflows into a 2-column "VS" split with a central vertical divider in Gold.

## Elevation & Depth

In this design system, depth is achieved through **Tonal Layering** and **Atmospheric Gradients** rather than traditional drop shadows.

- **Surface Tiers:** The base background is the deepest black. Cards and containers sit on a slightly lighter "Charcoal" tier.
- **Atmospheric Gradients:** Containers feature a subtle radial gradient (e.g., top-left to bottom-right) that transitions from a faint gold-tinted charcoal to a deep black. This mimics the flicker of candlelight on dark stone.
- **Metallic Outlines:** Elevation is reinforced by 1px "Valyrian Steel" or "Dragon Gold" borders. Interactive elements use a subtle outer glow (0px blur, 1px spread) in Gold to indicate focus.
- **Backdrop Blurs:** When modals (like License info) appear, the background is obscured with a heavy (20px) blur and a 70% black tint, keeping the focus entirely on the "scroll" content.

## Shapes

The shape language is **geometric and architectural**. 

- **Corners:** We use a "Soft" setting (4px radius) for cards and buttons. This provides a modern touch while remaining sharp enough to feel "bladed" and serious. 
- **Sigils:** Circular shapes are reserved exclusively for user avatars and House Sigils to distinguish them from the rectangular "Entity" cards.
- **Dividers:** Horizontal rules use a "tapered" effect—thick in the center and fading at the edges—to look like parchment creases or sword edges.

## Components

- **Option Cards:** The central component. Rectangular, 1px Valyrian Steel border. When selected, the border transitions to Dragon Gold with a subtle inner crimson glow. Images should have a "Vignette" overlay to blend into the card's charcoal background.
- **Action Buttons:** Large, rectangular, with label-caps typography. The "Elegir" (Select) button uses a Gold stroke and no fill, filling with Gold on hover/press.
- **Progress Counter:** Monospaced text (JetBrains Mono) located at the top-right. It should be understated, appearing as a watermark.
- **Loading State ("Waking the Ravens"):** A full-screen overlay featuring a stylized raven icon in gold. The animation should be a slow "pulse" rather than a spin, maintaining the atmospheric tension.
- **Spoiler Shields:** A textured, frosted-glass overlay that hides card content until a "Reveal" action is triggered.
- **Status Chips:** Small, pill-shaped tags with Crimson backgrounds for "Match" or Charcoal backgrounds for "Category." Use label-caps typography for all chip text.