# BurnGuard — Image Art-Direction Kit ("Ember")

A reusable pattern for generating landing-page imagery that matches the app's
styling and brand. Paste the **Universal style block** + a **subject** + the
**Negative prompt** into any image generator (Midjourney, Flux, Ideogram,
DALL·E, SDXL). Works for 3D renders, flat vector illustrations, and spot icons.

> One rule above all: **one accent only — ember orange. Everything else is warm
> greyscale.** More than one bright hue and it stops looking like BurnGuard.

---

## 1. Brand snapshot (exact values)

| Token | Hex | Use in imagery |
|---|---|---|
| Ember accent | `#FF5A1F` | The one brand color — emissive/hero highlight, the "protected/blocked" energy |
| Ember hover | `#FF7040` | Lighter accent highlight |
| Deep ember | `#D93D0A` | Accent shadow / darker molten tone |
| Ink on accent | `#1A0A03` | Text/detail sitting on an ember surface |
| Dark background | `#0C0A09` | Warm espresso near-black (dark theme base) |
| Dark surface | `#15110E` / `#1E1813` | Cards/panels on dark |
| Light background | `#F3EDE4` | Warm ivory/bone (light theme base) |
| Light surface | `#FBF7F0` / `#EBE2D5` | Cards/panels on light |
| Warm text (dark) | `#F6EFE7` | Off-white, never pure `#fff` |
| Warm text (light) | `#1B1411` | Near-black, never pure `#000` |
| Danger red | `#E5484D` | ONLY for the "surprise bill / blocked" alarm moment |
| Warm gold | `#D99A3C` | Rare, understated "success" accent (never green) |

**Type feel** (for any lettering in an image): Bricolage Grotesque — a
characterful modern grotesk, tight tracking, confident. Numbers/mono:
JetBrains Mono.

**Mood keywords:** warm, bougie, editorial, premium, minimal, tactile, matte,
quiet-luxury, confident — Stripe / Linear / Vercel-grade, not playful-startup.

---

## 2. Universal style block (paste this first, every time)

```
Premium editorial product illustration for a developer tool called BurnGuard.
Warm, bougie, minimal aesthetic — quiet luxury, like Stripe or Linear marketing art.
Strictly ONE accent color: molten ember orange (#FF5A1F, highlights #FF7040,
shadows #D93D0A). Everything else is warm greyscale — espresso near-blacks
(#0C0A09, #15110E) on dark, or warm ivory (#F3EDE4, #FBF7F0) on light.
Matte, soft-touch materials. Soft studio global illumination with a single
gentle ember rim-light. Subtle contact shadows, shallow depth of field.
Clean composition, generous negative space, one clear focal subject.
No clutter. Cohesive, expensive, understated.
```

## 3. Negative prompt (paste this every time)

```
no green, no cyan, no teal, no blue accent, no purple, no rainbow, no multi-color,
no neon overload, no rgb gradients, no mesh gradients, no wireframe grid,
no floating particles, no bokeh confetti, no lens flare, no glossy plastic,
no stock photo realism, no busy background, no text artifacts, no watermark,
no logos of real companies, no ui screenshot, low detail clutter
```

## 4. Two style modes (pick per slot)

**Mode A — 3D / isometric render** (hero, problem, big banners)
Add to the universal block:
```
Isometric or 3/4 3D render, matte clay and soft-touch anodized surfaces,
warm neutral seamless studio backdrop, ember used as the single emissive glow,
tasteful rim light, soft realistic shadows, slight film grain.
```

**Mode B — flat vector / spot illustration** (feature tiles, small spots)
Add to the universal block:
```
Flat geometric vector illustration, thick rounded shapes, solid duotone fills
(two warm-neutral tones + ember accent), no outlines or minimal 2px squared
strokes, subtle paper grain, matches a solid-duotone icon system.
```

> Mode B intentionally matches the app's **solid-duotone icons**: a low-opacity
> filled silhouette under a bold squared-cap outline. Keep spot art in that
> language so illustrations and UI icons feel like one family.

## 5. Technical / export rules

- **Background:** prefer a **transparent PNG**, OR a solid fill that exactly
  matches the theme base (`#0C0A09` dark / `#F3EDE4` light). Never a random color.
- **Dual-theme:** every asset must read on both themes. Either export transparent,
  or export two versions (one on espresso, one on ivory).
- **Format:** SVG for flat/vector and icons; WebP (or PNG) at **2× resolution**
  for 3D renders; lazy-load. Keep an ~8% empty safe margin around the subject.
- **Restraint:** ember should cover **≤ ~15%** of the frame. It's a highlight,
  not a fill.

---

## 6. Ready-to-paste prompts (the actual landing-page slots)

Each = Universal block + Mode add-on + the subject below + Negative prompt.
Dimensions match the `<ImagePlaceholder>` slots in the code.

**Hero — 1200×800 (3:2), Mode A**
```
Subject: a glowing ember-orange shield / force-field barrier standing between a
matte code editor on the left and three floating provider chips (abstract, not
real logos) on the right; thin streams of light pass through the shield and are
metered; the shield is the only ember-lit element; deep espresso backdrop, soft
depth-of-field on the background chips.
```

**Problem — 800×600 (4:3), Mode A**
```
Subject: a billing invoice / receipt spiraling out of control, an alarmingly
large total "$30,141" in monospace, a cost line shooting vertically off the top
of the frame; heat ramp from ember orange into alarm red (#E5484D) as it climbs;
optional hairline cracks in the paper; tense and expensive-looking, still minimal.
```

**How it works — 1400×400 (7:2 wide banner), Mode A**
```
Subject: three connected stages left-to-right — (1) a code editor card with a
single highlighted line, (2) a glowing ember BurnGuard proxy node in the center,
(3) three abstract provider endpoint chips; smooth connection lines with a few
data pulses flowing along them; the center node is the only ember-lit element;
warm espresso backdrop, NO grid, NO particles.
```

**Feature spot icons — 200×200 (1:1), Mode B** (one per feature)
```
Subject (real-time tracking): a small ascending line-chart card, duotone warm
neutral with an ember trend line.
Subject (budget enforcement): a shield with a check, ember accent detail.
Subject (multi-provider): three abstract provider chips orbiting a center dot.
Subject (SSE streaming): a horizontal data-stream of ember dashes.
Subject (alerts): a duotone bell with a single ember notification dot.
```

**Testimonial avatars — 48×48 (1:1), Mode B**
```
Subject: abstract warm-clay bust or a monogram tile on warm neutral; ember only
as a tiny accent; no faces, no photo realism.
```

**OG / social image — 1200×630 (1.91:1), Mode A**
```
Subject: BurnGuard brand lockup — an ember shield mark and confident grotesk
wordmark — centered on warm espresso, a single soft ember glow, lots of negative
space, quiet-luxury.
```

---

## 7. Fill-in template (for any new image)

```
[UNIVERSAL STYLE BLOCK]
[MODE A or MODE B add-on]
Subject: <describe the one focal subject in plain words>.
Palette: ember accent #FF5A1F only; warm greyscale otherwise; base <#0C0A09 dark | #F3EDE4 light>.
Aspect ratio: <W:H>. Background: transparent (or exact base hex).
[NEGATIVE PROMPT]
```

**Midjourney tail example:** `--ar 3:2 --style raw --no green,cyan,blue,purple,grid,particles,text`

---

*Keep this in sync with `src/app/globals.css` (the `--accent` / background tokens)
and the solid-duotone icon system in `src/components/icons/`.*
