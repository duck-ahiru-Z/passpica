# Passpica verification log

Keep this log so broad review work does not repeatedly spend time on the same already-passing pages. A page marked **passed** does not need another browser pass unless a relevant change, a serious bug report, or a reproducible contradiction gives a concrete reason to reopen it. Run focused automated tests for touched code; do not redo unrelated browser checks.

## Browser-checked pages

Checked on the Vercel preview `passpica-e9zuj16sv-duck-ahiru-zs-projects.vercel.app` on 2026-10-23:

| Page | Browser evidence | Automated check | Status |
| --- | --- | --- | --- |
| `/learn/physics/motion-calculation-drill` | Fixed spring restoring-force mode switched to a spring-only question. A 300 N/m, +0.2 m extension explained the signed answer −60 N; spring-energy answer 1.6 J was accepted. | `npm run test:physics-motion` (fixed patterns, 900 mixed questions, formulas, units, balance, adjacency) | Passed |
| `/learn/physics/spring-visual` | At x=+0.12 m, displayed F=−24.0 N and U=1.44 J for k=200 N/m; confirmed matching Hooke's law and energy behavior. | `npm run test:spring-visual` | Passed |
| `/learn/math/calculus3-curvature-visual` | Moved the point to x=1, x≈0.577, x=+0.6 and x=−0.6. f, f′, f″, concavity, and inflection-point message updated consistently; link to curve-analysis drill visible. | `npm run test:calculus3-curvature-visual` | Passed |
| `/learn/math/calculus3-integral-visual` | For b=1.5, exact area 1.1250; right sum fell from 1.2327 (n=16) to 1.1783 (n=32), with error falling from 0.1077 to 0.0533. Related drill link visible. | `npm run test:calculus3-integral-visual` | Passed |
| `/learn/math/calculus3-volume-visual` | For b=1.5, exact volume 4.7713 and n=8 right-disk sum 6.3864. At b=1, exact volume π/5≈0.6283; n=20 right-disk sum 0.7095 (overestimate decreases as slices increase). Related area/volume drill link visible. | `npm run test:calculus3-volume-visual` | Passed |
| `/learn/math/calculus3-area-volume-drill` | Random mode presented y=x on [0,4] around the y-axis; choosing shells and entering 134.041 was accepted with the correct derivation. Fixed shell-only mode then generated y=x on [0,5]; 261.799 was accepted. Individual modes and mix were visible; related visual link visible. | `npm run test:calculus3-geometry` (all six fixed patterns, 100,000 seeded mixed questions, 500 deterministic balance cases, no adjacent repeats, equivalent washer/shell methods) | Passed |
| `/learn/math/calculus3-parametric-visual` | Screenshot checked for layout. At t=π/2, point (0,1), tangent slope 0, speed 2; at t=0 and π, endpoints (±2,0) showed vertical tangent and speed 1. Differentiation drill link visible. | `npm run test:calculus3-parametric-visual` (20,001 samples) | Passed |
| `/learn/math/calculus3-differential-equation-drill` | Random mode offered four pattern choices. For dy/dx=9x², y(1)=5, chose initial-condition integration; y=3x³+2 was accepted with the matching explanation. Switching to fixed variable-separation mode generated dy/dx=5y, y(0)=2 and locked the practice to that pattern. | `npm run test:calculus3-differential-equations` (four fixed patterns, formulas and input forms, 100,000 seeded mixed questions, 400 deterministic balance cases) | Passed |
| `/drill` (Math III filter) | Browser filter exposed nine Math III entries: limit, differentiation, curve analysis, integration, area/volume, differential equations, and Math III overall mixed practice. | Browser check | Passed |
| `/learn/math/calculus3-mixed-drill` | Overall mode showed questions drawn from distinct Math III areas. Selected inverse-function differentiation for f(x)=x³+5x at g′(6), accepted as 1/8 with explanation; next squeeze-limit problem was accepted for x·sin(1/x). Six selectable scope choices visible. | `npm run test:calculus3-mixed` (all 38 lower-level patterns; six-area balance across 10,000 seeded questions; varied questions and balanced answer positions) | Passed |

Earlier work in this thread also reports browser and focused automated checks for the projectile-motion visual, RLC circuit drill/visual, chemistry organic-structure visual/drill, and Calculus III differentiation/integral/curve-analysis drills. When changing those areas, consult their existing focused verifier before considering a new browser pass; do not treat these notes as a full audit of every existing question.

## Reopen criteria

- A change touches the page, its generator/formula/answer checker, shared UI used by it, or its navigation/data dependencies.
- A user reports a serious or specific issue, or a new test/runtime observation contradicts this evidence.
- The preview/build under review is materially different and the change could affect the verified behavior.

Otherwise, spend the review time on unverified pages, missing patterns, generator coverage, usability/accessibility, and requested new content. Add a concise row here when a new page is actually browser-checked; do not add a page based only on a source inspection or a passing unit test.
