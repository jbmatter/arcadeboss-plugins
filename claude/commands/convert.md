---
name: convert
description: Convert a game made somewhere else (a vibe-coded HTML file, a folder, a built web project) into one that runs in your arcade — same game, fitted to the cabinet, verified and published to the workbench
---

Convert an existing game into one that runs in the user's arcade. What they
pointed at (a file, a folder, a URL — may be empty): $ARGUMENTS

A conversion is a build whose design is already done. It runs INLINE in this
session and follows the arcade skill (`arcade:arcade`) end to end — its
House rules are the target, `verify_game` is the gate, the demo and the
delivery card are the same. What differs is the job: **it is THEIR game.**
Keep its mechanics, its feel, its tuning numbers, its art style, its name.
Change only what the arcade needs, and never "improve" the design on the
way through — a player who converts a game wants to see that game on a
cabinet, not your take on it.

1. **Find the game.** A path → read it. A folder → find the entry
   (`index.html`, or the `package.json` scripts for a built project). A URL
   → fetch it (a raw HTML page, a GitHub repo, a shared artifact). Nothing
   given → look in the working directory and ask which one. **Never edit
   the original**: the arcade version goes in a new folder beside it
   (`<name>-arcade/`), and say where.

   A shipped game is public in the arcade and on the Play page, so convert
   what the user made or has the right to put up. If the source is plainly
   someone else's (a stranger's itch.io page, a commercial game), ask
   before going further; an open-source game keeps its license notice in
   a comment.

2. **Inventory it before changing anything.** Read the source (in regions
   for a big one) and note: the entry and every file it loads; the engine
   (plain canvas, DOM, three.js and which version, Phaser/p5/Pixi/Kaboom…);
   modules and imports; assets (images, audio, fonts, JSON); storage,
   network and its own leaderboard; input (keys, mouse, touch, tilt); how
   it sizes itself; whether it has a title, game over and restart. Play it
   once locally if you can (`python3 -m http.server`) so you know how it
   FEELS before you touch it.

3. **Tell the user the plan, then ask only what's theirs to decide.** In a
   few lines: what stays, what changes to fit the cabinet, and anything
   that can't come through (an online leaderboard server, a microphone
   feature). Then ask — with `AskUserQuestion` where it exists, otherwise
   one line each — only the questions the source can't answer: online play
   it had (map it to a `multiplayer` recipe, or keep it local?), saves it
   kept (declare `storage: { save: true }`, or drop them?), a wide-only
   layout (declare `orientation: "landscape"`, or rework it for portrait
   too?). A 3D game whose hero is on screen gets the skill's avatar
   question. Don't interrogate: everything else has a right answer below.

4. **`create_project`** with the game's own title (1–3 words, tagline after
   an em dash) and a brief written FROM the game — what the player does
   moment to moment, what makes it hard, what makes the first minute fun —
   ending with one line that it was converted from an existing game, so a
   later revision in the studio knows to keep it faithful. Declare
   `render: "3d"` for three.js, plus whatever step 3 settled.

5. **Keep the game's own shape, and let a script do the copying.** A tool
   argument is freshly generated text, so never retype a file you can copy
   — stage it from disk and spend your own writing on the changes.
   - **One HTML file stays one file.** A **folder of static files** (an
     `index.html` loading its own `.js`/`.css`, classic scripts or ES
     modules with relative imports and real extensions) stays a PROJECT:
     `index.html` at the root as the entry, every file staged under its
     own path (`?path=js/game.js`), loaded by relative path. Nothing may
     load from outside the folder (`../`, `/`, a CDN), and the arcade's
     contract globals must sit on `window` (`window.ASSETS = …`), since a
     module's `var` is invisible to the shell.
   - **Bare imports, JSX/TS or a build step** (`import … from "phaser"`, a
     Vite/webpack project): run its build, or bundle the game's own code
     with esbuild (`npx esbuild <entry> --bundle --format=esm
     --outfile=game.js`) and load that one module from `index.html`.
   - **A library from a CDN or npm** (Phaser, p5, Pixi, Kaboom, Howler…):
     copy its minified build from the copy the game already uses —
     `node_modules`, or curl the exact CDN URL — into the project (e.g.
     `lib/phaser.min.js`) and load it by relative path ahead of the game.
   - **three.js** is the exception: drop whatever copy it had and use the
     arcade's own `<script src="/libs/three-0.185.1.min.js"></script>` as
     the first script tag (global `THREE`; fetch that file from the arcade
     to playtest locally — the skill's Playtesting). Code that imports
     `three` bundles against it by aliasing the import to a one-line shim
     (`module.exports = window.THREE`, esbuild `--alias:three=./three-global.cjs`).
     An older game may need API fixes for r185 (no `Geometry`, the
     color-management defaults); an addon it used (`OrbitControls`) is
     bundled from `three@0.185.1` itself, never another version, or written
     by hand.
   - **Art, sound, models and fonts the game ships as files** (PNG/JPG/WebP,
     MP3/OGG/WAV, `.glb`, `.woff2`): stage each one AS IT IS, with the same
     curl, under its real extension, and load it by relative path — never
     paste or retype a binary file, and never a data-URI. Limits: 5 MB a
     file, 20 MB a game, 100 MB of asset files across the arcade, so
     re-encode anything bigger (WebP for images, OGG for sound) with a tool,
     never by hand. A `.glb` loads through
     `<script src="/libs/gltf-loader-0.185.1.js"></script>` placed right
     after the three.js tag (`new THREE.GLTFLoader()`); Draco/KTX2-compressed
     models can't load — re-export them uncompressed. SVG is text and stages
     like code.
   - **If the stage answers 415 "can't carry asset files"**, this arcade
     hasn't switched asset files on yet. Then: small pixel-art sprites →
     have a script turn each PNG into a palette + pixel string the game
     paints to an offscreen canvas at boot (keep the total small); anything
     larger or photographic → redraw it with code in the same style and
     colours; audio → close equivalents synthesized with Web Audio
     (oscillators, noise, envelopes, AudioContext on the first gesture);
     fonts → the nearest system stack. Tell the user what was redrawn.
   - **JSON** levels → inline as JS data, or a `.json` file loaded by
     relative path.

6. **Fit it to the cabinet** — targeted edits against the House rules, the
   same discipline as a revision. What vibe-coded games usually need:
   - **Storage** (`localStorage`, IndexedDB, cookies) throws in the
     sandbox: keep run state in variables; a personal best becomes the
     shell's high-score board; real saves use the `storage` protocol the
     contract returned.
   - **Revising later**: `get_game_source` lists each asset file as
     `{ binary, bytes, sha256 }`, and every publish KEEPS the assets you
     don't resend — pass `drop: [paths]` to remove one.
   - **Its own leaderboard or name entry** → removed. Report the score
     with `{ type: "highscore" }` once per run and show the board the shell
     posts (`highscores`) on the title and game-over screens.
   - **Network** (fetch, WebSocket, Firebase/Supabase) has no route out:
     inline what it loaded; online play goes through the declared recipe's
     party shim, or the game stays local.
   - **`alert`/`confirm`/`prompt`, `window.open`, forms** are silently
     blocked in the sandbox → in-game UI. **Tilt** never fires → touch and
     keys.
   - **Touch AND keyboard**: a desktop-only game gets touch controls, a
     phone-only one gets keys — both must fully play it (the input kit
     `/libs/kit-3.js` is allowed).
   - **Size and timing**: a fixed-size canvas fills the viewport from a
     ResizeObserver, in both orientations unless declared landscape;
     per-frame movement becomes per-second, with the constants scaled so
     it feels exactly as it did at 60fps.
   - **Missing pieces**, drawn in the game's own style: a title screen with
     the controls, a game-over screen, restart on R or a tap, the
     `<title>` and viewport meta.
   - **The house's hooks**: `ASSETS`, `TUNING` (lift the game's existing
     constants — don't invent new ones), `DEBUG` where states are slow to
     reach, `COVER` and `COVER_BRIEF` from the game's own look, the `?seed=`
     PRNG for gameplay randomness, and `window.__PROBE`.

7. **Verify, and prove it's still their game.** Iterate against
   `verify_game` (staged, per the skill) until `ok`, and fix its
   `findings`. Then play the converted copy beside the original — same
   speed, same jump, same difficulty, same look — and fix any drift in
   feel before anything else; `look_game` shows it through the arcade's
   own camera.

8. **Demo, publish, deliver** exactly as the build command does: write and
   check the cabinet's demo, `publish_game` once with the demo as `attract`
   and a changelog like "Converted from <source> — <what changed>", and
   deliver with the same card (its buttons REAL LINKS — `walkInUrl` and
   `benchUrl`, never `sendPrompt`; see build.md). In the report, list
   what changed and anything that didn't come through, and end on the
   playtest link — shipping it to the floor happens in the arcade.

If the arcade tools are missing from this session or every call errors, the
user isn't signed in: call the arcade server's `authenticate` tool (Claude Code
offers one while it's signed out — "arcade - authenticate"), give the user the
sign-in link it returns, and continue once they've pressed Allow. `/arcade:connect`
walks through the same thing.
