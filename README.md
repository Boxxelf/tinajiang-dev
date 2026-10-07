# Tina Jiang · Creative Space

The published frontend is a lightweight static portfolio. It uses real images from Tina’s existing website and the supplied résumé. It does not need a database, Node dependencies, or a framework runtime in production.

## Preview and edit

Use Node 22.18+ (Node 24 is recommended):

```sh
npm run dev
```

Open http://127.0.0.1:6183/. No `npm install` is needed. After editing source, run `npm run build` and refresh the browser. The preview server serves the current files without restarting.

- `web/motion.js`: the homepage’s projected 3D gallery, drag inertia, entry choreography, and Cloud / Orbit / Index controls.
- `web/space.css`: homepage appearance and shared navigation refinements.
- `web/site.js`: navigation, theme, reveal effects, and email copy.
- `scripts/build-static.mjs`: generates the homepage, work, 13 design/product/research case studies, six artwork detail pages, about, contact, and 404 pages into `dist/`.
- `lib/projects.ts`: project content, artwork details, galleries, and resource links.
- `app/globals.css`: shared case-study and interior-page styling.
- `public/`: website résumé, optimized portfolio images, and self-hosted font.

The older React prototype remains in `app/` and `components/` for reference. It is not the deployed frontend. The static version replaces the unstable Vinext / Cloudflare development runtime while retaining the portfolio’s content and navigation.

## Homepage motion

Reference: the supplied `CleanShot 2026-10-04 at 10.39.16 AM.mp4`.

The viewport is a white, centered creative space with 19 camera-facing image planes covering all 19 projects and artworks. An introductory ring expands, contracts, and unfolds into a spatial cloud. Dragging rotates its projected 3D coordinates; release preserves decaying momentum. Depth changes image scale and overlap while faces remain parallel to the screen. Wheel and arrow keys also rotate the scene. Three numbered controls select cloud, orbit, or a labelled index.

Pointer movement is separated from clicks. Keyboard focus reveals the index. Reduced-motion preference skips the intro and uses a stationary index. Rendering pauses when the tab is hidden. Mobile supports touch dragging and tap-through to projects.

## Publishing

`.openai/hosting.json` retains the existing Site identity and declares `dist/` as the static output. Build the output before packaging and publish with the Sites workflow. The retired domain is not linked anywhere in the published pages. The independent Site retains owner-only access.

## Vercel handoff

In Vercel, import `Boxxelf/tinajiang-dev` and leave **Root Directory** at the repository root (`./`). Select Node 24.x. `vercel.json` selects the static output, skips package installation, and uses the dependency-free build script. No secrets, database, or old domain are required. Add the new domain in Vercel after development is complete. Vercel deployment has not been initiated.

The current STEM project links to https://boxxelf.github.io/STEM-Math-Connections-Explorer/. Its optional live embed loads only after the visitor presses the button; older project screenshots are removed. New portrait sizes and gallery thumbnails are pre-generated, so deployment requires no image tooling.

## About portrait

The About page uses `scripts/about-content.mjs`, `web/about.css`, and `web/about-flow.css` for its editorial scroll layout. `web/about-flow.js` measures visual text lines and bends each around the centered portrait while scrolling. Narrow screens use a static reading layout. `web/about-avatar.js` renders the closed reference-contour model in `public/assets/tina-avatar-reference-v2.bin`. The supplied gold image provides the silhouette and front color; continuous rounded depth joins the face and hair without disconnected pieces. An orthographic camera preserves the reference proportions. The unseen depth and back are inferred from the front image, rather than a full 360-degree scan. Pointer motion rotates the volume, moves the eye region, and gently shifts broad reflected illumination while retaining the approved image's brightness. `scripts/build-avatar-model.py` creates the runtime mesh and a portable `tina-avatar-reference-v2.glb`; its development-only dependencies are NumPy, Pillow, and Blender. `scripts/relax-avatar-surface.py` voxel-remeshes and subdivides the surface to remove the pinched silhouette ridges. Set `TINA_BLENDER` if Blender is installed elsewhere. Assets are committed prebuilt, so deployment does not need Python. The GLB uses the supplied photograph as an unlit front texture to preserve its color in external viewers. The sides and back use smooth champagne vertex colors with baked studio reflections and an unlit material, keeping the gold finish consistent even in viewers without environment lighting. Both surfaces share a closed, smoothed mesh; rear vertex colors blend into the front edge. It needs no external library. Motion stops when settled or offscreen, respects reduced motion, and can be paused. A static image remains visible when WebGL is unavailable. The original photograph is retained in `public/assets/tina-portrait.webp`; the silver and gold reference artwork and generation details are in `design/avatar-options/`.
