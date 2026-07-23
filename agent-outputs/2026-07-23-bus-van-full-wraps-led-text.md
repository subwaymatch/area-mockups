# Bus & van full-coverage wraps, driver's window, built-in LED text

Session goals, from the maintainer's three requests (plus two mid-session
additions):

1. **Bus model** — add the missing driver-side window; make the entire
   sides *and* back live mockup regions, with graphics running over the
   passenger windows like the supplied MTD reference photo (perforated-film
   transit wrap). Mid-session clarification: the driver's window must NOT
   be part of the wrap region — vinyl never covers the driver's view.
2. **LED text** — the common LED regions (bus destination sign, shelter
   RTPI arrivals) should accept plain text or an array of text and get a
   built-in scrolling-marquee/LED treatment, while still accepting a custom
   component.
3. **Van model** — a real-world-reference detail pass; mid-session
   addition: extend the mockup region to the entire side and back, like the
   bus.

## What shipped

### Bus (`packages/core/src/objects/bus`, `packages/react/src/objects/bus`)

- **Driver's window** (`BUS.driverWindow`): a 0.6 x 0.69-unit glass slab on
  the street side behind the A-pillar, taller than the passenger band with
  a lower sill — matching the Xcelsior-class reference. Rendered in both
  coverage modes.
- **`coverage="full"`**: the side DeviceScreens grow from the king-size
  panel to the whole side elevation (skirts→roofline, tail→nose, 6.4 x
  1.518 units), and the rear grows from the 21"x70" tail ad to the whole
  tail between bumper and roof dome (`BUS.rearFull`). CSS `clip-path`
  (computed from the same spec the shell extrusion uses) carves out: the
  body outline with its wheel-arch arcs, both curb-side door leaves, the
  street-side driver's window, the mirror mounts, and the rear taillight
  stacks. The passenger window band is NOT carved — the wrap covers it, and
  the band meshes are skipped on a side that carries a live full wrap (they
  would otherwise poke through the livery plane, which sits 8 mm off the
  shell). Louvers, rear window and route box sit behind the rear wrap plane
  and get covered, exactly like a real tail wrap.
- Default full-side resolution is 1920 CSS px (`BUS.fullResolution`) — the
  panel dpi (499 px/unit) would give a 3192-px DOM layer per side, which is
  compositor-hostile; 300 px/unit reads sharp at mockup scale.

### LED text (`core/src/screen/led-text.ts`, `react/src/led-text.tsx`)

- Core module: framework-agnostic style builders (`ledPanelStyle`,
  `ledMaskStyle`) and keyframe generators (`ledMarqueeKeyframes`,
  `ledCycleKeyframes`) — amber dot-matrix panel, glow via `color-mix`,
  container-query (`cqh`) font sizing so the same styles fit any panel.
- React `<LEDText>`: modes `auto | marquee | static | cycle | rows`.
  - Single string: static when it fits, seamless constant-speed marquee
    when it overflows (duration derived from measured text width via
    ResizeObserver).
  - Array + `cycle` (bus default): stepped page flip
    (`steps(n)` + `translateY(-n*100cqh)`), like real alternating signs.
  - Array + `rows` (shelter default): one board row per string, each row
    marquees independently on overflow. `white-space: pre` preserves
    run-of-spaces column alignment.
- `Bus.destinationSign` and `BusShelter.arrivals` now accept
  `ReactNode | string | string[]` — same prop, no new prop: strings get the
  built-in renderer (`isLedText` guard), nodes pass through untouched.
  `LEDText` is exported for direct/custom use.

### Van (`packages/core/src/objects/van`, `packages/react/src/objects/van`)

- **`coverage="full"` now covers the rear too** (`VAN.rearFull`, 1.8 x 1.72
  units): the whole barn-door face from above the bumper strip to under the
  third brake light, taillight clusters carved to the wrap edge.
- **Detail pass** (Transit/Sprinter references): parked windshield wipers,
  cab-door shut lines both sides (sunk beneath the full-wrap plane, so
  liveries cover them like real film), black entry step under the sliding
  door (below every wrap region, always visible), four pressed roof ribs,
  stub antenna on the front roof corner, fog-light recesses in the bumper
  corners, barn-door hinge knuckles (outside the rear wrap span), rear
  license recess + plate (below all wrap regions), and a six-lug ring on
  each wheel.

### Shared clip-path helper + a winding bug fix

- `clipRoundedRect` (hole) and `clipRoundedRectOutline` (outer boundary)
  moved to `core/src/geometry/clip-path.ts`; van and bus both consume them.
- Two orientation bugs found and fixed along the way:
  - The van's existing hole rects used an inverted arc sweep flag — winding
    was correct (holes worked) but every hole's corner arcs bowed concave
    instead of round (~6–11 px at default dpi). All arcs in one trace now
    share the mapping's single sweep flag.
  - First cut of the rear clips traced outline and holes in the SAME
    direction, so under the nonzero fill rule the taillight holes vanished
    (caught in the Playwright pass — rear wraps rendered hole-less).
    `clipRoundedRectOutline` traces the reverse direction and flips the
    corner-arc flag internally.

### Docs & harness

- `bus.mdx` rewritten (coverage table row, full-wrap example, LED string
  examples), `van.mdx` and `bus-shelter.mdx` and `objects.mdx` updated.
- New demos: `bus-full` (full wrap + cycling LED sign + tail livery);
  `bus-basic`/`bus-livery` now use string/array signs; `shelter-basic` uses
  a string-array arrivals board. `bus-rear` keeps a custom `<DestinationArt>`
  node to demo the escape hatch.
- Screenshot harness gained `device=bus | van | shelter` with `coverage`,
  `sign` and `arrivals` params (`|` splits pages/rows).

## Verification

- Typecheck green in core, react and docs; docs production build green.
- Playwright (headless Chromium, 1400x900@2x) against the built docs site,
  ~20 poses. Confirmed: driver's window present in both modes and carved
  out of the street-side full wrap; doors/mirrors/taillights visible
  through their carve-outs; passenger windows covered by the wrap; panel
  mode unchanged; LED sign cycling pages ("VIA 5TH AVE" frame captured),
  shelter board rendering three aligned amber rows; van details visible
  (lugs, hinges, plate, antenna, step). Reference-matched captures in
  `agent-outputs/images/2026-07-23-*.png`.

## Known estimates / flags

- The full-side wrap plane sits 8 mm off the shell; the front/rear bumper
  corner faces poke ~2 mm past it inside the wrap region. The DOM layer
  composites over WebGL, so the wrap simply covers those slivers (same
  accepted behavior as the van's pre-existing full wrap).
- Rear-face lamps sit ~10 mm behind the full-rear wrap plane and read
  slightly recessed through their carve-outs at grazing angles.
- `LEDText` relies on container-query units and `color-mix` (Chrome 105+/
  Safari 16+) — in line with the library's WebGL-era browser floor.
- Van roof ribs are deliberately subtle (body-color, 14 mm proud); they
  read at close/top-down angles only.
