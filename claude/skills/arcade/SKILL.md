---
name: arcade
description: Build or revise an arcade game for the user's Arcade Boss arcade — a single self-contained HTML file that runs in the arcade's sandboxed cabinet iframe. Use whenever the user wants to make a game, fix a game, or iterate on a game for their arcade.
---

# Building a game for the arcade

You are building a real arcade game that will stand in the user's 3D arcade,
where visitors walk up to a cabinet and play it. The arcade's verifier is the
gate: a game ships only when it boots clean in a real browser.

## Workflow

The arcade MCP server's tools (`get_arcade`, `list_games`,
`get_game_source`, `verify_game`, `create_project`, `publish_game` —
whatever prefix this session gives them) are how games reach the arcade.
The loop:

1. **Get a real brief first.** Before writing any code, know what the player
   DOES moment to moment — the core verb, what makes it hard, what makes it
   fun in the first minute. If the user's ask is one vague sentence, ask ONE
   sharp question (an either/or between two real directions beats an open
   question). Don't interrogate; one round, two at most, then build.
   (`create_project` refuses a thin brief anyway — write one that says
   what the player does.)
2. **New game**: `create_project` with the title and brief — it returns the
   gameId and the authoritative house contract. **Revision**: `list_games`
   to find it, then `get_game_source` — it returns the files, the game's
   own contract, and a `baseVersion` you MUST pass back when publishing.
3. **Write the whole game as ONE self-contained index.html** following every
   rule under House rules below (and the contract the tools return — for an
   existing game that contract is authoritative, e.g. its multiplayer or
   orientation declarations). The rules are strict because each one is a
   defect class the arcade has actually shipped. One file is right for
   almost every game; a game genuinely too big for one may be a PROJECT —
   index.html plus its own relative modules (`<script type="module"
   src="./main.js">`), staged file by file, ASSETS/TUNING/`__PROBE` set
   on `window` — and `get_game_source` hands an existing project the
   project rules in its contract.
4. **Iterate against `verify_game`** after every draft — it runs the
   arcade's real verifier (contract lint, then a boot in a real browser,
   desktop and phone) and returns defects to fix. Keep going until `ok`.
   It may ALSO return `findings` — measured defects in a game that boots
   (two faces z-fighting on one plane in an ASSETS builder, steering that
   moves the player LEFT under D or under a right push of the stick, a HUD
   label cut off past the phone's edge, two HUD elements overlapping, a
   panel painted over the middle of the playfield during play, a touch
   control smaller than a thumb), each naming the element, the viewport it
   was measured at, and the fix. They do not move `ok`, and they are
   exact: fix them before you publish, or tell the user why you didn't.
   Never weaken the game to dodge a defect you don't understand — say so
   instead. A clean verify proves the game BOOTS; it does not prove it's
   good — play a full round through its own DEBUG/__PROBE hooks when you
   can, and sanity-check the tuning math (can the win actually happen?).
   For a MULTIPLAYER game, playtest the staged files at
   `stagedBenchUrl` (Playtesting below) before you publish at all — the
   match itself is the one thing only the real shell can show you (an
   ASYNC game is the exception: see Playtesting).
5. **Then, with the game done: write your cabinet's demo, verify it, send
   it** — a separate step after the game, never part of building it (The
   cabinet's demo, below).
6. **`publish_game` once, when verify is clean** — it writes the game into
   the arcade as a draft on the workbench and verifies again in the same
   call. Include a one-line `changelog`, the demo as `attract` and, for
   revisions, the `baseVersion` from step 2.
7. **End with the playtest link** (`libraryUrl`) the publish result
   returns — the arcade opened straight into this draft's playtest, signed
   in by a one-time key (any browser, no sign-in step; show it to the player
   only). Playtesting and shipping to the arcade floor happen IN the arcade
   — that moment belongs to the player, not to this chat.

**Never type a big file into a tool call — STAGE it.** A tool argument is
freshly generated text (a model has no copy-paste), so inlining a 100KB
game into `verify_game`/`publish_game` costs thousands of expensive
output tokens PER CALL — measured on a real build, the publish relay cost
more than writing the game did. Upload each file raw from disk instead,
with the `staging` block that `get_arcade`, `create_project` and
`get_game_source` return (`url` and `bearer` — a key that opens this
upload and nothing else, good for three hours; call `get_arcade` again for
a fresh one, and never put it anywhere but this header):

    curl -sf -X PUT --data-binary @index.html \
      -H "Authorization: Bearer <staging.bearer>" \
      -H "Content-Type: application/octet-stream" \
      "<staging.url>?path=index.html"

then call the tools with `files: "staged"` — zero model tokens for the
content. Re-upload a file after every local edit; the slot lives 30
minutes (refreshed on every use), and verify-then-publish off ONE upload
guarantees the published bytes are the verified bytes, no transcription
or diff ritual needed. If the stage endpoint 404s (an older server), fall
back to inlining the files. A file the PLAYER brought — an image, sound or
model — stages the same way, as its raw bytes, and is never inlined or
retyped: `get_game_source` lists one as `{ binary, bytes, sha256 }`,
every publish KEEPS the ones you don't resend, and `drop` removes one (an
arcade that hasn't switched asset files on answers the upload with 415 —
draw it in code instead).

**Token discipline — the transcript is append-only and you pay rent on
it.** Everything a tool returns is re-read on every later step, so waste
compounds for the whole session. NEVER trade correctness for tokens —
when in doubt, look, read, screenshot — but cut the reflexive waste
(every item below was measured on a real build):
- Don't re-read your own game wholesale. Read the region you're about to
  work on (offset/limit, or grep for the function); prefer `Edit` over
  Bash-side rewrites of the file so the harness's file tracking stays
  warm — after a Bash mutation it will demand a fresh Read before the
  next edit, so make that one targeted, not the whole file.
- Screenshots are for JUDGING HOW IT LOOKS — keep taking those; that is
  how real visual defects get caught. But answer STATE questions
  (score, phase, positions, "did it start?") with `__PROBE`/text reads,
  not a picture.
- Long command output goes to a FILE; print a summary (counts, the
  failing case, head/tail) — never cat a whole game into the transcript.
- Publish ONCE per ask. A multiplayer bug that only the real shell can
  show you used to be the one legitimate exception — it is not one any
  more: stage the files and open `stagedBenchUrl` (see Playtesting),
  which is the same shell and the same lobby with no version minted and
  no verify boot spent. Fix, restage, reload the tab. Republish once,
  when it is actually fixed, and say what changed in the changelog.

**Multiplayer and persistence are DECLARED at `create_project`, never
improvised.** Online play: pass `multiplayer` — `{ recipe: "turns" |
"realtime" | "combat" | "coop" | "arena", min, max }` plus `optional`/`dropIn`
flags where they fit (`arena` is the .io-style always-on room: no lobby,
the arcade's own house hosts it, and the game is two halves of callbacks
handed to ONE `party.arena({ … })` call — the shim runs the loops, the
roster, the inputs, the per-peer views and the easing; on the bench you play
it as a peer, exactly as every player will) — and saves or player-published levels: pass
`storage` (`{ save: true }` and/or `{ publish: ["level"] }`). The
contract the tool returns then carries the exact party-shim recipe or
storage protocol to follow — the arcade shell runs the lobby and owns all
persistence; the game only speaks the protocol. **Friends playing one
match over hours or days** ("chess with my friends over a few days", "take
my turn later", back and forth) is `turns` with `async: true`, never a
live `turns` game: the arcade stores the match, tells each player it's
their move and owns the match list, invites and Rematch, and the game is
MENU-FIRST — "Play a friend" posts `{ type: "open-match" }`, and a "Play
live" entry posts `{ type: "open-lobby" }` only when the design wants
everyone at once. **Racing friends' best runs** on a solo score game (a
racer, a runner, a time trial) is `storage: { publish: ["ghost"] }`, with
no multiplayer field; a two-player ghost RIVALRY taken in turns is an async
match with the ghost in the move instead. **A system can be ADDED to
an existing project** — never tell the player they need a new project for
saves, online play or achievements: pass the same `multiplayer` /
`storage` / `achievements` field to `get_game_source` (it returns the
contract WITH the change, so you code against the real protocol), then the
same value to `verify_game` and `publish_game`. It rides the new version
and its changelog; the shipped cabinet keeps its old declaration until the
player ships that version. A storage field you leave out keeps its value,
and an achievement id the lineage already used must keep its meaning. The
verifier's lint holds shim and declaration together in both directions. Never hand-roll networking or storage APIs —
the verifier refuses them, declared or not. Local two-player sharing one
keyboard/screen needs no declaration at all. Every game plays in portrait
AND landscape unless declared otherwise; landscape-only games (the player
asked, or the design can't fit a tall screen) declare
`orientation: "landscape"`. Orientation can change on a revision too —
pass `orientation` to `publish_game` ONLY when the player
asked for the change, rework every screen for it, and tell them it changed;
otherwise omit it and the version keeps the project's. A three.js game declares `render: "3d"` (2D
canvas is the default and needs none). ⚠️ A multiplayer MATCH can only be exercised
remotely — `verify_game`'s harness plays the shell's role — so local
playtesting of a multiplayer game covers everything except the match
itself, per Playtesting below.

**Player avatars are the PLAYER'S call — ask, never decide.** In a 3D game
where somebody's body is on screen (third-person, or first-person
multiplayer where players see each other), the arcade can show each player
as their own avatar — the outfit and hat they earned — instead of the
game's own characters. Ask it once in the interview, as its own question
after your design question: "Should players be able to play as their own
avatars?" — with a multiple-choice tool where the harness has one (Claude
Code's `AskUserQuestion` — header "Avatars", options "Yes" / "No"),
otherwise as that one line. Never for a 2D game or a
first-person SOLO game (nobody's body is on screen); on an `arena` only
when they ask for it or the concept leans on it. Before `create_project`,
read the contract back in one line — "3D · landscape · players appear as
their own avatar" — then pass `avatar: true` beside `render: "3d"` (the
arcade refuses it on anything else). The contract that comes back carries
the PLAYER AVATARS rules — the same text as the house rule below. An
EXISTING 3D game can add them on a revision when the player asks ("let me
play as my avatar"): pass `avatar: true` to `get_game_source` (a preview
whose contract carries the rules), then the same to `verify_game` and
`publish_game` — no new project needed, and the high scores, matches and
history stay. The avatar must then move exactly like the game's own hero.
To SEE a real avatar in your own local playtest, never build a stand-in
body: fetch the sample `https://arcadeboss.io/api/avatar-sample/lit` (or
`/unlit`; your connected arcade's origin if it isn't arcadeboss.io) — a
real export, `{rig, headTop, height, radius, model}` — and post it into
your page as the shell would: `{ type: "avatar", id: "me", name: "ACE",
...sample }`. `verify_game` and `look_game` send the same body.

**If the arcade tools are missing or every call fails**, the user isn't
signed in. If you have an `authenticate` tool for the arcade server (Claude
Code offers one while a server is signed out), call it and give the user the
sign-in link it returns — they sign in and press Allow, and the tools appear.
Otherwise ask them to sign in from this app: Claude Code's `/mcp` → arcade →
Authenticate; in Codex, installing the plugin signs in (or `codex mcp add
arcade --url "https://arcadeboss.io/mcp?via=codex"`). The arcade's 🗃 Builds →
🔌 Connect walks them through it. Don't build "for later"; the
whole point is the game landing in their arcade.

(Working inside the game-dev-sim repo without the MCP connected? The same
verifier is `node scripts/verify-game.mjs <file>` — identical checks.)

## Playtesting

Local is for feel and debugging; `verify_game` is for truth. Neither
substitutes for the other:

- **The local loop** (fast, deep): write the game in a scratch directory,
  serve it with any static server (`python3 -m http.server`), and play it
  in a browser you can drive. Locally the game is the TOP window, so you can
  call `window.__PROBE()` and its DEBUG hooks directly, click without any
  iframe plumbing, and reload instantly. Read a `?seed=` param into your
  terrain/spawn generation so a run can be replayed exactly. ⚠️ Hidden or
  backgrounded tabs freeze requestAnimationFrame entirely — a game that
  looks dead in an automated tab is your tab, not a bug; keep the tab
  fronted or pump the loop yourself.
- **A 3D game needs ONE local file, never an install.** The contract's
  script tag resolves to `/libs/three-0.185.1.min.js` on the arcade —
  locally, fetch THAT EXACT FILE from your connected arcade's own origin
  (the `visitUrl` host `get_arcade` returns) into a `libs/` folder
  beside your index.html. Never a CDN copy and never npm: only the arcade's
  own bytes guarantee you playtest the renderer the cabinet will run. 2D
  games (the default) need nothing.
- **High-score display is testable locally**, because the shell protocol is
  plain postMessage and `parent === window` in a top-level page: listen
  for your own outgoing `{ type: "highscore" }`, and post yourself a
  synthetic `{ type: "highscores", scores: [...] }` to see the best-score
  line render on the title and game-over screens.
- **Multiplayer wiring is remote-only.** Locally there is no shell to answer
  the party shim — do NOT fake a lobby; `verify_game`'s harness plays the
  shell's role for real.
- **`look_game` is the arcade's own camera.** It boots the game through
  the arcade's rig and returns a screenshot per viewport, each driven to
  PLAY first — the fastest way to SEE a draft (HUD collisions, layout, art
  that reads wrong small) with no local serving at all — and under each
  shot it prints what the rig MEASURED there (a clipped or overlapping
  element, named), so you don't have to eyeball what it already knows. It shares
  `verify_game`'s hourly browser budget, so lean on the local loop for
  rapid iteration and `look_game` for the checks that need the arcade's
  eyes.
- **After a publish, `benchUrl` opens the draft in the REAL player page**
  — the arcade's shell around the iframe: highscore board, party lobby,
  the exact serving path a player gets. Playtest there before telling the
  player it's done. An ARENA draft gets a house of its own on the bench, so
  you play it as a PEER exactly as every player will — the host half runs
  on the server; a second tab on the same link joins the same room.
  ⚠️ The link carries their arcade's key: use it, show
  it to the player, but never paste it anywhere public — the clean share
  link is `shareUrlWhenShipped`, live once they ship.
- **BEFORE any publish, `stagedBenchUrl` opens the STAGED files in that
  same page** — every tool that knows a gameId returns it
  (`create_project`, `get_game_source`, `verify_game`,
  `publish_game`). Stage, open it, play, fix, restage, reload the tab:
  the slot is served no-store, so a reload IS the iteration step, and
  nothing is written to the arcade — no version record, no files, no
  high scores, even when you are revising a game that is already live on
  the floor. It is served through exactly the same hardening, CSP and
  sandbox a player gets, so what you are testing is the real
  environment. An empty or expired slot says so in the frame instead of
  going blank — stage again. Same warning as `benchUrl`, doubled: it
  carries the arcade key AND points at a 30-minute in-memory slot, so it
  is for YOUR tabs only and it is never worth showing to anyone.
- **A multiplayer draft IS playable for real, two tabs, one browser**:
  open `stagedBenchUrl` (or `benchUrl` for a published draft), copy the
  lobby's invite link — it carries `?t=` so the second tab can open the
  draft, and `staged=1` so both tabs play the same staged bytes — open
  it in a second tab, start the match. Each tab is its own tagged player,
  so you can drive a genuine networked match yourself: take a turn in one
  tab, verify it lands in the other. These invites are for YOUR tabs and
  devices only (they carry the arcade key); friends get the clean link
  after shipping. ⚠️ **Not an ASYNC game** (`async: true`): a bench never
  opens a stored match — its tabs are one account, and a match seats
  accounts. `verify_game`'s fake match is the check before publishing;
  to play it for real, the player ships it and opens it from two
  signed-in accounts (Play a friend, or the match link).

Then `verify_game`, after every draft. Local play can NEVER catch what the
real environment imposes: the cabinet sandbox (where storage APIs throw for
real), the serving CSP, the injected hardening, the phone-viewport
tap-only-boot check, the shell's highscore/party wiring. A game that is
perfect locally can still fail all of these — which is why `publish_game`
re-verifies and nothing unverified reaches the arcade.

## The cabinet's demo

When the game is DONE and verify is clean — never while building it, and
never by changing the game — write its demo: the few seconds of play the
arcade records and shows on your cabinet when a stranger walks up. It is a
PATCH, not part of the game: search/replace blocks against your finished
files, applied only to a private copy the arcade records from.

    <<<<<<< SEARCH
    lines copied exactly from the file
    =======
    the same lines, with the demo code added
    >>>>>>> REPLACE

1. **Skip it when the arcade already holds one that fits**:
   `get_game_source`, and `verify_game` with a gameId and no
   `attract`, answer `demo: "fits"`. On `"stale"` or `"none"`, write one.
2. **Verify it**: `verify_game` with the same files and the patch as
   `attract`. Its `attract` answer says whether the demo `started`,
   `reachedPlay` and `pictureMoved` — the launch recording's own gates.
   Fix the patch until `ok`; never touch the game for it.
3. **Send it**: the same text as `publish_game`'s `attract`. A demo that
   doesn't apply is refused with the reason, and the game publishes anyway;
   with no demo, the arcade writes one itself when the player ships.

What the demo must do — the arcade's own brief:

> ATTRACT MODE. Your game is finished and launching. The arcade records ~6 seconds of a demo loop — what a real arcade cabinet plays when nobody is at it — and shows that clip on your cabinet's screen when a player walks up, and on the game's store page. It is how strangers decide whether to play your game. Your edit is applied ONLY to a private copy used for that recording; players never run it, so change nothing else about the game.
>
> Declare `window.ATTRACT = function () { ... }` at top level (on window explicitly, even in a module). The recorder calls it once, about half a second after load, with nobody at the controls and `?seed=attract` on the URL. It must:
> - start a round IMMEDIATELY — skip the title screen, "press start", menus, countdowns and any intro;
> - put a simple built-in AUTOPILOT at the controls that plays like a decent player: moving, aiming, scoring, the core action of the game visibly happening on screen within the first second. Drive the game through the same state your input handlers write (the same held-key flags, the same aim/target variables) so it plays the real game, not a separate animation;
> - keep it alive and busy for at least 10 seconds: make the autopilot competent, or quietly invulnerable; if the round ends anyway, start a new one at once. `__PROBE().screen` must read "playing" the whole time;
> - hide tutorial hints, "press X to…" prompts, control legends and any debug text (keep the score and the HUD a player normally sees);
> - for an online multiplayer game, play a local round against bots or alone — never touch `party`.
>
> A game of SEVERAL FILES: put a line `FILE: <path>` (the path exactly as the project lists it, e.g. `FILE: js/main.js`) before the search/replace blocks for that file; it holds until the next FILE line, and blocks before any FILE line edit index.html. FILE lines are the only thing allowed between blocks. A one-file game needs none.
>
> Keep it small — a few dozen lines next to your game loop.

## House rules

<!-- GENERATED from gameRequirements() in server/agent.js by
     scripts/export-skill.mjs — do not edit this section by hand;
     re-run the script instead. -->

Game requirements (strict):
- The game is ONE complete, self-contained HTML document. All CSS and JS inline, in plain <script> tags (NEVER type="module" — module scripts don't run in the game iframe). No external resources of any kind (no CDNs, fonts, images, fetch/XHR) — with TWO exceptions: a 3D game may load the arcade's vendored three.js with exactly <script src="/libs/three-0.185.1.min.js"></script> as the first script tag, and any game may load the arcade's input kit with exactly <script src="/libs/kit-3.js"></script> (INPUT KIT below). Nothing else. **This includes FONTS**: no Google Fonts, no @font-face pointing at a URL, no new FontFace() — they fail silently in the sandbox and you will then have to strip the family name out of every place you used it. Use the system stack (monospace, sans-serif, system-ui) or draw letterforms yourself.
- If 3D: the vendored script defines the global THREE (r185) — use it directly (new THREE.Scene(), THREE.WebGLRenderer, ...). Addons/examples (OrbitControls, GLTFLoader, etc.) are NOT available; write controls and geometry by hand from primitives. No imports.
  - CAMERA NEAR/FAR: `near` at least 0.1, `far` no more than about 20,000× near (0.1 → 2000 covers nearly every game). `near: 0.01, far: 10000` spends the whole depth buffer on the first centimetre, and everything past the foreground shimmers and z-fights however carefully it was modelled — a defect no geometry fix reaches. A level that genuinely needs a longer draw distance sets `logarithmicDepthBuffer: true` on the renderer instead of stretching the planes.
- If 3D, the BUDGET is what matters, not a fixed recipe: 60fps on a mid-range phone, which in practice means keeping draw calls and per-frame allocations low. Always set renderer.setPixelRatio(Math.min(devicePixelRatio, 2)). Reuse and merge geometry, and never allocate in the frame loop. Beyond that, spend the budget wherever the game actually gains: a custom ShaderMaterial, a post-processing pass, real lights or shadow maps are all fair game IF the look needs them and you stay inside the budget — and cheap tricks (a dark transparent circle for a shadow, fog to hide draw distance, MeshLambert over MeshStandard) are good defaults precisely because they leave budget for the parts that matter. Pick deliberately rather than reaching for the cheapest option by reflex.
- The game runs inside a sandboxed iframe with NO storage access: never use localStorage, sessionStorage, cookies, or indexedDB (they throw). Keep all state in JS variables.
- High scores: the arcade shell around your iframe keeps a persistent high-score board for this game, and it already knows who is playing — a run that makes the board is signed with the player's arcade name automatically. So never build your own leaderboard persistence, and NEVER ask for a name or initials: no ENTER YOUR INITIALS screen, no three-letter entry, no "who set this?" prompt. There is nothing to ask; the shell handles it. Talk to it with postMessage:
  - When a run ends (game over or win), report the final score exactly once: parent.postMessage({ type: "highscore", score: theScore }, "*"). The score must be a non-negative finite number where HIGHER is better — if your design is lower-is-better (e.g. fastest time), convert it to points first and use that same points value on screen.
  - The shell posts the board into your window on load and whenever it changes: { type: "highscores", scores: [{ name, score }, ...] } (best first, possibly empty). Listen with window.addEventListener("message", ...) and show the record on the title screen and/or the game-over screen — e.g. "BEST: 4,210 — ABE" — with a friendly nudge when the board is empty ("no records yet — set the first!").
- Telemetry (optional, one-way — game → shell): the shell keeps a per-sitting record of how play went. When a run ends, and again at quit if you can, send ONE small summary: parent.postMessage({ type: "telemetry", level: <number or short level name>, deaths: <count>, duration_s: <seconds actually played>, result: "win" | "lose" | "quit", place: <finishing position in an online match, 1 = won>, counters: { <up to 16 short keys>: <numbers> } }, "*"). Every field is optional and the whole message is capped at 1 KB — unknown keys and oversized values are dropped, and only the LAST message of a sitting is kept — so send it at game over and once more on quit, never on a timer and never every frame. A game that never sends it is not wrong.
- Achievements (only when this game's contract carries an ACHIEVEMENTS block — the arcade's players earn gamerscore from them, the shell keeps the record): two kinds. An EVENT achievement is a moment only the game can see (a hole in one, finishing 1st, a boss beaten without a hit): the instant it happens, post parent.postMessage({ type: "achievement", id: "<its id>" }, "*") — the id written as a string LITERAL at that spot (or passed as a literal to one small helper that posts it), because the studio checks the source for every declared id; posting one twice is harmless, but never at boot, on a timer, or to test it. A STAT achievement is decided by the arcade, which adds up the Telemetry summaries across sittings: make sure that summary carries the stat — a `counters` key named EXACTLY like the stat, holding this sitting's running total (`counters: { kills: 37 }`), or the built-in level / deaths / duration_s / result field. NEVER draw an unlock popup, toast, banner or sound of your own for either kind — the shell draws the pop, and a second one from the game reads as a bug. A game whose contract declares no achievements posts none.
- Render on a <canvas> that scales to fill the iframe viewport. SIZE IT FROM A ResizeObserver, never from a one-off read at startup: `const fit = () => { const w = innerWidth, h = innerHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }; new ResizeObserver(fit).observe(document.documentElement); addEventListener("resize", fit);` ⚠️ NEVER pass a third argument to renderer.setSize — `setSize(w, h, false)` means "do not set the canvas CSS size", and a <canvas> is a REPLACED element, so `position:fixed; inset:0` will NOT stretch it: with no CSS size it falls back to its intrinsic size, which is the drawing buffer, i.e. w×devicePixelRatio. On a Retina screen (dpr 2) that makes the canvas TWICE the viewport and the player sees only its top-left quarter — the level shoved into a corner, the character never on screen, a stretched view where walking forward looks like drifting sideways. It looks perfect at dpr 1, so you will not catch it by looking. Never bake the aspect into the camera constructor (`new THREE.PerspectiveCamera(70, 1, ...)` then call fit()); at startup innerWidth/innerHeight may still be 0, and 0/0 is NaN.
- MOVE BY TIME, NOT BY FRAME: every position, velocity, timer and animation advances by the frame delta (dt = seconds since the last frame), never by a fixed per-frame constant — `x += speed * dt`, never `x += 2`. Clamp dt to about 0.05 so a hitch, a slow phone, or a backgrounded tab can never teleport anything through a wall.
- NO TILT OR SENSOR CONTROLS, EVER: deviceorientation, devicemotion and the accelerometer/gyroscope are BLOCKED by the arcade's sandbox on every surface the game runs — those events can never fire, so a tilt scheme is dead code plus a permissions-policy violation in the console, and no user-gesture or permission-request dance changes that. Steer with touch (drag, tap zones, an on-screen stick) and keys instead, and never register those listeners.
- MOUSE LOOK is available for first-person and third-person games: call `canvas.requestPointerLock?.()` from a click handler (the optional-call `?.` is REQUIRED — the automated playtest environment has no pointer lock, and a plain call throws there and fails your build). Read look input from `e.movementX`/`e.movementY` in a mousemove listener, only while `document.pointerLockElement` is set; listen to "pointerlockchange" and pause into a "click to resume" state when it drops, since Escape releases the cursor. Clamp pitch to just under ±90°. On touch there is no pointer lock: drag on the right half of the screen to look while the left half runs the move stick — build both, they share one camera.
- KEEP THE HORIZON LEVEL (3D first/third-person): drive the camera from explicit angles, not `lookAt` — set `camera.rotation.order = "YXZ"` once at setup, then every frame assign yaw to `camera.rotation.y`, pitch to `camera.rotation.x`, AND `camera.rotation.z = 0`. Zeroing roll is not optional. Any `camera.lookAt(...)` you use elsewhere — an orbiting title screen, a results-screen flyaround, a vehicle chase cam — leaves a residual z rotation on that same camera, and the moment you switch back to first-person without clearing it the entire world stays tilted for the rest of the match.
- ONE ORIENTATION CONVENTION (3D — this is the single most common defect in games from this studio: the player presses A and the car turns RIGHT). It happens when a game hand-rolls a +Z-forward trig convention for its physics while three.js rotates meshes from its own -Z forward, so heading and picture disagree by a sign. You cannot see your own screen, so you cannot catch this by looking — you avoid it by deriving EVERYTHING from one convention and never re-deriving trig ad hoc:
  - Forward is -Z, matching three.js: `forward = (-sin(yaw), 0, -cos(yaw))`. Right is `(cos(yaw), 0, -sin(yaw))`. Orient the mesh with `mesh.rotation.y = yaw` and nothing else.
  - Therefore yaw INCREASING turns LEFT. Steering left (KeyA / ArrowLeft / stick pushed left) does `yaw += rate * dt`; steering right does `yaw -= rate * dt`.
  - A chase camera sits BEHIND, which is the opposite of forward: `camPos = pos - forward * dist`, i.e. `(x + sin(yaw)*dist, y + height, z + cos(yaw)*dist)`.
  - 3D ASSETS builders must model every entity facing -Z, so `rotation.y = yaw` points it where it is actually going. A model built facing +Z drives backwards.
  - SPINNING PARTS TURN THE WAY THEY WOULD IN LIFE, AND THE SIGN IS DERIVED, NEVER GUESSED. A wheel's spin comes from the distance it rolled (`spin += forwardDist / radius`), never from a speed with a sign you assumed — and the sign follows from the axle: a positive rotation about +X carries the top of a tyre toward +Z, which on a vehicle driving toward -Z is BACKWARDS, so a wheel whose axle is local X rolls forward with `wheel.rotation.x -= forwardDist / radius` (an X axle is what `CylinderGeometry` gives you after `rotateZ(Math.PI / 2)`). Same discipline for rotors, propellers, drills, rolling balls and turrets: write down which axis the part spins about and which way its leading edge must move, then derive the sign. A wheel spinning backwards is invisible in a screenshot and the first thing a player sees.
  - If you ever write `Math.sin(yaw)` and `Math.cos(yaw)` WITHOUT leading minus signs as a forward vector, you have just introduced this bug. There is one forward vector in the game; compute it in one helper and call that helper everywhere — movement, aiming, trails, camera, AI.
  - Collapse every input source onto ONE signed steering axis (keyboard, touch stick, and any AI all write the same `steer` variable, negative = left) so the schemes can never disagree with each other.
  - The studio MEASURES this on every `check`: it holds D, then A, and reads `pos`/`fwd` off your probe (the MOVEMENT fields under INSPECTABLE below) — a player that went left under D is reported back to you as inverted steering, with the line to fix. Report those fields so you can prove your controls to yourself the same way: hold a key in a `run` drive and return the probe before and after. A game with no left/right movement has nothing to report here and nothing is measured — NEVER add movement, keys or a stick to a design to satisfy a check.
  - 2D games have the mirrored trap: canvas Y grows DOWNWARD, so positive angles rotate CLOCKWISE on screen. Pick the convention once, and make "up on screen" consistently negative Y everywhere.
- Start with a title screen showing the game name and controls, and begin on click, tap, or key press.
- KEYBOARD (get this exactly right — "the keys don't do anything" is the single most common way a build comes back rejected):
  - Attach keydown/keyup to window (or document) — never to the canvas. The canvas is never focused, so canvas-level key handlers miss every key.
  - Identify keys by e.code — "KeyW", "KeyA", "ArrowUp", "Space", "ShiftLeft" — never by e.key and never by the deprecated e.keyCode. e.code is the physical key; e.key is "W" with CapsLock on, changes under a non-US layout, and is " " (not "Space") for the space bar.
  - Accept WASD *and* the arrow keys for movement. Always both, in every mode — on foot, in a vehicle, in menus.
  - Track held keys in a map (keys[e.code] = true on keydown, false on keyup) and read that map in your update loop. Never move anything straight from the keydown handler — that fires at the OS key-repeat rate, so the first step lands, then it stalls for half a second.
  - Movement must NEVER be gated on pointer lock, on a prior click, or on any "click here to focus" step. The moment play begins, WASD works. Pointer lock is for mouse look ONLY: losing it may pause into a resume prompt, but it must never be a precondition for reading movement keys, and entering a vehicle or a cutscene must not leave input in a state where nothing responds.
- ALWAYS teach the player how to play — this is non-negotiable:
  - The title screen lists every control and the goal in one glance ("ARROWS to move · SPACE to jump · reach the exit").
  - The first moments of play include contextual hints at the moment each mechanic is first needed (e.g. "HOLD CLICK to charge" floating near the player), fading out once performed. For anything non-obvious, prefer a short guided intro (first obstacle is a safe practice one) over a wall of text.
  - Keep a small persistent control reminder on screen during play, or show controls again on the game-over screen.
- The game MUST be fully playable on BOTH desktop (keyboard/mouse) and mobile (touch). This is non-negotiable — half the players are on phones:
  - Prefer unified pointer events (pointerdown/pointermove/pointerup) — one code path covers mouse and touch.
  - If the design needs directional or multi-button input, draw on-screen touch controls (buttons or tap zones rendered on the canvas) sized for thumbs (≥64px), shown when touch is available ('ontouchstart' in window). Screen-half tap zones ("tap left/right side") beat tiny buttons.
  - The best designs need no separate schemes at all: one-pointer mechanics (tap, hold, drag, release) work identically everywhere. Prefer them when the idea allows. A hold-to-charge, tap, flick, drag or aim-and-shoot game IS a one-pointer game: hold anywhere to charge, release to fire, drag to aim — it gets NO on-screen stick and NO on-screen buttons, from you or from any helper. A stick on a shooting or timing game is a gamepad glued to a phone.
  - INPUT KIT — only for a design that ALREADY HAS a stick. If, and only if, the game's core verb is continuous movement (driving, flying, walking, a twin-stick shooter) and you were going to draw a floating stick anyway, don't hand-roll it: load <script src="/libs/kit-3.js"></script> (after the three.js/party tags if present) and call `const input = KIT.input({ stick: true, buttons: [{ id: "jump", label: "JUMP", key: "Space" }] })`. It tracks WASD + arrows by e.code on window, draws the stick (left zone) and the thumb buttons you list (right, ≥64px) on its own pointer-transparent overlay when touch is available, and folds every source onto ONE signed axis: `input.axis.x` (+1 = RIGHT), `input.axis.y` (+1 = UP / FORWARD), `input.held(code)`, `input.pressed(code)` (once per press), `input.button(id)`, `input.ownsPointer(id)` (skip that pointer in your own tap/aim handling), `input.tick()` once at the END of every frame, and `input.stickRect()` — report it in your probe as `stick`. Without `stick: true` the kit draws NOTHING and decides nothing about your controls; its keyboard tracking and its math helpers work the same either way, and the math IS the conventions in this document as functions — 3D: `KIT.forward(yaw)`, `KIT.right(yaw)`, `KIT.turn(yaw, input.axis.x, rate, dt)`, `KIT.rollWheel(wheel, forwardDist, radius)`, `KIT.chaseCam(camera, pos, yaw, { dist, height, lerp, dt })`; 2D: `KIT.heading2d(angle)`, `KIT.turn2d(angle, input.axis.x, rate, dt)`. A game that uses the kit still keeps the title-screen control hints and the touch-action/gesture rules below.
  - Title screen shows the controls for the scheme the player is actually on (detect touch), or both.
  - Set CSS touch-action: none on the canvas, and call e.preventDefault() on touch events and on arrow/space keys so the page never scrolls or zooms.
  - Suppress every stray mobile browser gesture: include <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">, and CSS user-select: none + -webkit-touch-callout: none + -webkit-tap-highlight-color: transparent on everything, plus touch-action: manipulation on html/body. A long-press must never pop the copy/select callout and a double-tap must never zoom.
- Include: a score or progress indicator, a lose/win state with a game-over screen, and restart with the R key or a click.
- A player should be enjoying themselves quickly — for an arcade game that means fun inside the first minute, but a game built to be deeper (a sim, a builder, a run-based game with progression) is allowed to take longer to open up, so pace it to the game the brief actually describes. Tune difficulty so a first attempt is survivable but not trivial.
- NAME IT SHORT, AND PUT A TAGLINE AFTER A DASH IF YOU WANT ONE. The <title> tag is the game's name everywhere in the arcade — on the cabinet marquee, in the walk-up prompt, in every list — and most of those are one narrow line, so the NAME has to work alone: 1–3 words, ideally under about 20 characters ("BOOMTOWN", "Click Comet", "Tongue Launch Frog"). If the game deserves a tagline, write it AFTER an em dash and keep it under about 40 characters — "BOOMTOWN — Toy City Rocket Deathmatch". The shell splits on that dash by itself: the name goes on the marquee and the prompt, the tagline becomes a subtitle line on the roomier surfaces (the GameNet storefront card, the arcade manager). Don't repeat the name inside the tagline, don't put the tagline in front, and don't reach for one when the name already says it.
  - ⚠️ NEVER TYPE THE NAME TWICE. Wherever the GAME ITSELF shows its own name — the title screen, a pause screen, the game-over card, the COVER art — read it from `window.GAME_NAME`, never from a string literal you typed: `const NAME = window.GAME_NAME || "BOOMTOWN";` once at the top, then draw `NAME`. The shell sets that global fresh on every load from what the project is called RIGHT NOW, so a boss who renames the game later sees the new name on the title screen immediately — while a hardcoded string sits there saying the old one until somebody pays for another build. Keep the literal as the fallback (it is what runs if the game is ever opened outside the shell) and keep the <title> tag exactly as it is: that tag is what the studio reads the name OUT of when the build lands. This applies to the name only — every other word on the title screen is yours to write.
- Make it feel good: responsive controls, visual feedback on every interaction (hit flashes, particles, tweens), and a cohesive color palette. Use canvas-drawn shapes and juice instead of asset fidelity.
- ASSET REGISTRY (strict — the arcade shell reads it to power an asset picker in the studio chat): declare a global object ASSETS at top level, before the game logic — write it as var ASSETS = { ... } or window.ASSETS = { ... }, NEVER const/let (those don't create the window global the shell reads) — with a named entry for every distinct visual entity a player could point at — the player, each enemy/vehicle/pickup/obstacle type. Short descriptive camelCase names (playerShip, lavaBat, goldCoin). Backgrounds, UI text, and particle effects do NOT belong in it.
  - 2D game: ASSETS.name = (ctx, w, h, t) => { ... } draws that one entity alone, scaled to fit a w×h box on the given 2d context (t = animation time in seconds; t=0 must be a good static pose). Center it either around the origin (0,0) or at (w/2, h/2) — just be consistent with how the game's render code places entities. The game MUST draw each entity through its entry — ctx.save(), translate/rotate/scale to place it, ASSETS.name(ctx, w, h, t), ctx.restore() — so editing the entry restyles the game.
  - 3D game: ASSETS.name = () => group builds and returns a fresh THREE.Group/Mesh for that entity, and the game MUST construct entity meshes by calling these builders.
  - NO TWO FACES ON ONE PLANE (3D): no two differently-coloured parts of a builder may have same-facing faces on exactly the same plane — a trim strip laid flush ON a panel, a cap ending exactly where the part under it ends, a hub whose end plane is the tyre's, concentric parts sharing a lid. The depth buffer cannot order coincident faces, so they shimmer as the camera moves (z-fighting), and a screenshot will not show it to you. Overlap or stand proud, never touch: sink the inner part into the outer one, or stand a trim piece off the surface it trims by at least 1% of the part's size — in the numbers, never with polygonOffset. The studio's `check` audits every 3D builder for this and reports each coincident pair with where it is.
  - Entries are self-contained functions of their arguments only — no reads of game state, no side effects outside their box.
  - The shell renders picker thumbnails itself. NEVER write thumbnail, screenshot, or postMessage code for assets.
- TUNING KNOBS (the numbers the boss can turn without asking you): declare a global object TUNING at top level, next to ASSETS — `window.TUNING = { ... }` or `var TUNING = { ... }`, NEVER const/let — holding the handful of values that decide how the game FEELS, and read every one of them through the registry at the point of use, every frame:
  ```
  window.TUNING = {
    walkSpeed:  { label: "Walk speed",  group: "Movement", value: 6.2, min: 2.5, max: 12, step: 0.1 },
    jumpHeight: { label: "Jump height", group: "Movement", value: 4.4, min: 1, max: 8, step: 0.1 },
    enemies:    { label: "Enemy count", group: "Difficulty", value: 4, min: 0, max: 12, step: 1 },
    trail:      { label: "Motion trail", group: "Look", value: true },
    sky:        { label: "Sky", group: "Look", value: "dusk", options: ["dawn", "noon", "dusk", "night"] },
  };
  // and at the point of use — NOT copied into a local at boot:
  player.x += dir * TUNING.walkSpeed.value * dt;
  ```
  - EVERY VALUE MUST BE A PLAIN LITERAL — a number, true/false, or a quoted string. No expressions, no computed values, no functions, nothing referring to another variable. The studio edits this block as data; a value it cannot read as data is a knob the boss cannot turn.
  - `value` is required. `label`/`group` are what the boss reads (group related knobs together — Movement, Difficulty, Look, Feel). `min`/`max`/`step` size the slider for a number; `options` makes a string a set of choices. A `note` explains a unit ("ms of grace after leaving a ledge").
  - READ IT AT THE POINT OF USE. `const SPEED = TUNING.walkSpeed.value` at the top of the file breaks the whole feature — the boss drags the slider and nothing happens. Read `TUNING.x.value` inside the loop, every frame; it is a property read and it is free.
  - 5–15 knobs, the ones that would change how the game feels to play. Speeds, gravity, jump, spawn rates, counts, timers, lives, damage, key colours. NOT structural constants (canvas size, array lengths, tile counts), and not every number in the file — a wall of forty knobs is worse than eight good ones.
  - The boss changes these directly, with the game running, for free. So put a knob on anything a brief hedges about ("maybe a bit faster", "not too hard") rather than guessing at a number and waiting to be told it was wrong.
- DEBUG MENU (the states that are slow to reach by playing): if this game has levels, waves, currency, upgrades, or a win/lose state more than about thirty seconds of play away, declare a global DEBUG object at top level beside TUNING — `window.DEBUG = { ... }` or `var DEBUG = { ... }`, NEVER const/let — with 3–8 entries that jump straight to those states:
  ```
  window.DEBUG = {
    skipLevel: { label: "Skip level", group: "Progress", run: () => loadLevel(level + 1) },
    goToLevel: { label: "Go to level", group: "Progress", value: 1, min: 1, max: 12, step: 1, run: (v) => loadLevel(v) },
    giveGold:  { label: "Give gold", group: "Economy", value: 500, run: (v) => { player.gold += v } },
    godMode:   { label: "God mode", group: "Player", value: false, run: (v) => { player.invuln = v } },
    killAll:   { label: "Kill all enemies", group: "World", run: () => { enemies.length = 0 } },
  };
  ```
  - THREE KINDS, told apart by their SHAPE — there is no `kind` field to set. `run` and no `value` is a BUTTON (one-shot: skip, kill, restart). `run` plus `true`/`false` is a TOGGLE (god mode, show hitboxes, freeze the AI). `run` plus a number or string is a VALUE the boss sets (go to level 7, set gold to 500) — `min`/`max`/`step` size its slider, `options` makes a string a set of choices.
  - `run` is called with the new value for a toggle or a value, and with nothing for a button. It must do the whole job itself: "go to level 7" has to load level 7, not just set a counter.
  - THE STUDIO DRAWS THIS MENU — YOU DO NOT. Never add a debug overlay, a key binding, a console command, a URL parameter or an on-screen button for any of it. Declare the object and stop; the boss gets a panel for it in the studio, and a player never sees one. A debug UI you build yourself ships to whoever plays the game.
  - This is the ONLY sanctioned way to add a hook for reaching a state. Everything else — `window.__FORCE_WIN`, a secret key combo, a `?cheat=1` — is a cheat handed to players and a bug factory in a multiplayer game. Put it here or leave it out.
  - It is for TESTING, not for playing: it never has to be balanced, and turning something on may make the game trivial. That's the point.
  - Your own playtests can call these directly — `DEBUG.goToLevel.run(10)` in a drive script reaches the boss fight without playing nine levels first, so you can prove the ending works instead of hoping.
  - What does NOT belong here: anything the boss would want while genuinely playing (that's a TUNING knob or a real feature), and anything that only re-states a knob. TUNING changes what the game IS and is saved into the file; DEBUG changes what this run currently is and is never saved.
  - A small game with one screen and no progression needs none of this. Leave it out rather than inventing states to skip to.
- COVER ART (one function — it becomes the picture on your game's arcade cabinet and its store card): declare `window.COVER = function (ctx, w, h) { ... }` at top level, next to ASSETS. It paints this game's key art filling a w×h 2d context — think the poster on the side of an arcade machine, or a Steam capsule: the game's name, its palette, and one clear image of what you do in it.
  - Draw it out of the game's OWN art, so the cover looks like the game rather than like a logo someone else made. 2D game: call your ASSETS entries for the player, the enemy, the thing you collect. 3D game: your ASSETS return THREE meshes, which cannot draw on a 2d context — hand-draw the cover in 2D instead: same palette, same shapes, a 2D portrait of the game's key actors. Never try to render THREE objects onto the cover context, and never spin up a renderer for it. Either way, fill the whole box; no letterboxing, no transparent background.
  - NO interface in it: no score, no HUD, no control legend, no "press space", no tutorial text. This is a picture of the game, not a screenshot of it. It is seen small — on a cabinet screen across a room — so favour a few big readable shapes and strong contrast over fine detail.
  - Keep the title and the subject near the CENTRE: the same picture is cropped to a tall 4:3 screen and to a wide card, so anything near an edge will be cut off on one of them.
  - It must be synchronous, must never throw, and must never read or change game state — it is called once, before play, and gets only what you pass it. Do not postMessage anything, and do not call it from your own render loop.
  - There is no fallback and nothing else draws one: leave it out and your game stands on the arcade floor with a blank screen and sits in the store with no art. It is a handful of lines and it is the first thing anyone sees of your game — write it.
- COVER BRIEF (one sentence of scene direction — the studio may commission a painted version of your key art, and this is what the artist paints from): declare `window.COVER_BRIEF = "..."` at top level, next to COVER — one vivid sentence describing the cover PICTURE: the subject mid-action, the setting, and the EXACT colours the game actually uses (e.g. "a glossy white ball rolls along a red-and-white striped ribbon road twisting through a near-black void, passing translucent glass checkpoint gates"). The artist has never seen your game and gets only this sentence plus your ASSETS sprites — so describe the WORLD and its palette, which are exactly what the ASSETS entries don't carry.
  - No title and no mention of text or logos (the arcade adds those), no HUD. A plain static double-quoted string: no template literals, no reads of game state.
- Sound is optional; if you add it, synthesize it with the Web Audio API (oscillators, noise, envelopes), create the AudioContext only after the first user gesture, and keep volumes low. NEVER embed base64 data-URI audio or images — they bloat the file and come out corrupted.
- INSPECTABLE (this is how your own playtests can see the game — get it right and you can look at your work instead of guessing):
  - SEED: read `?seed=` off the URL (`new URLSearchParams(location.search).get("seed")`) and, when present, use it to seed EVERY random choice the game makes — level layout, spawns, shuffles. Write a tiny seeded PRNG (e.g. mulberry32) and route all gameplay randomness through it instead of Math.random(). The same seed must produce the same game twice, exactly. With no seed, pick a random one so normal play still varies. Purely cosmetic jitter (particle sparkle) may stay on Math.random().
  - PROBE: declare a global function `window.__PROBE` that returns a small plain object describing the CURRENT state of play. Write it as `window.__PROBE = () => ({ ... })` at top level. It must be safe to call at any moment, must never throw, and must never change the game — it only reports.
    - Required key: `screen` — one of "loading", "title", "playing", "paused", "gameover", "win". This is the single most important field: it is what lets a playtest know it is looking at the game rather than at the title card.
    - Include `score` whenever the game has one, and add whatever else describes progress in a word or two: `level`, `lives`, `wave`, `depth`, `timeLeft`. Numbers and short strings only — no DOM nodes, no functions, no huge arrays.
    - Keep it honest and cheap. It is read between frames, so it must not allocate heavily or do work the game wouldn't otherwise do.
    - MOVEMENT (whenever the player controls something that moves or turns — required then, omitted otherwise): `pos` — the controlled thing's position, `{ x, y }` in canvas pixels for a 2D game (screen space: x grows to the RIGHT, y grows DOWN) or `{ x, y, z }` in world units for 3D. If it TURNS (a car, a ship, anything with a facing), also `fwd` — the direction it faces, a unit vector in the SAME axes as pos, from the game's one forward helper. A 3D game also reports `right` — the world direction that is RIGHT ON SCREEN right now, i.e. the camera's local +X: `const r = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)` → `right: { x: r.x, y: r.y, z: r.z }`. If — and only if — the game draws a touch stick, `stick: { x, y, r }` — its centre and radius in CSS pixels (for a floating stick, the resting spot a thumb lands on); most games have none and omit it. The studio's `check` HOLDS D then A, the phone pass PUSHES the stick right then left, and both read these back: a player that goes LEFT is reported to you as inverted steering. Report them honestly — they are how your own playtests can prove the controls, not just the boot.

RENDER — 2D or 3D: 2D canvas is the default — pick 3D (three.js) only when the idea genuinely gains from depth (driving, flying, first/third-person, spatial puzzles), and only if the brief doesn't say otherwise.

ORIENTATION — BOTH WAYS (this game's contract): players hold their phone whichever way they like, so EVERY screen — title, play, pause, game over — must lay out correctly in portrait AND in landscape, live: a mid-game rotation arrives as a resize, and the game reflows without losing state. Prefer centre-anchored, aspect-independent layouts (HUD pinned to corners and edges, playfield scaled to fit the short side) over fixed compositions, and keep touch controls reachable by thumbs in both shapes. NEVER draw a rotate prompt or refuse an orientation — supporting both is the contract.

WORD LIST — only for a WORD GAME (the player makes, finds, guesses or types English words: Scrabble- and Boggle-likes, anagrams, hangman, crosswords, typing games): load <script src="/libs/words-1.js"></script> as its own script tag (after the three.js / party tags if the game has them) — this one extra script is allowed for a word game on top of the exceptions above. It defines the global `WORDS`: ~172,000 lowercase a–z English words of 2+ letters (the public-domain ENABLE list, slurs stripped, no proper nouns). `await WORDS.ready` once before play — behind the title screen is the natural spot; it takes a few tens of milliseconds — then `WORDS.has(w)` (case-insensitive) to accept a word, `WORDS.hasPrefix(p)` to prune a board search (a Boggle-style solver, "is any word left on this board?"), and `WORDS.random(len, seed)` for a word of exactly `len` letters: the same seed (a number or a string) gives the same word on every device, so two players seeded with one match id get one puzzle; with no seed it is random. It holds every LEGAL word, obscure ones included (qaid, zax) — right for judging a play, but a word you SHOW as a target (a hangman answer, the daily word) should be one a player knows, so draw a few and keep a familiar one. NEVER embed a word list or dictionary array of your own, never fetch one, and never shadow the global — call your own list `found`, not `WORDS`.

PLAYER AVATARS — only when this game's contract declares `avatar: true` (a 3D game whose creator chose to show players as their own arcade avatar): the arcade builds each player's own avatar — the outfit and hat they earned — and posts it into your frame as a finished three.js body on a standard skeleton, carrying a few stock clips (idle, walk, run, sit, wave, jump). Those clips are the BASICS, not your game's animation: the avatar must move exactly as your own hero does. You never build, embed or fetch avatar code; you build FOR it:
- YOUR OWN HERO FIRST, on the rig-1 joint names: a root (on y = 0, facing +z; the body's LEFT is +x) holding `hips`; under hips `torso`, `hipL`/`hipR`; under torso `head`, `shoulderL`/`shoulderR`; shoulder › `elbowL`/`elbowR` › `handL`/`handR`; hip › `kneeL`/`kneeR` › `footL`/`footR`. Groups are fine — only the NAMES matter — and every joint at rest is identity: standing, arms hanging straight down. Play it the moment the game starts, and write ALL of its animation (your clips and your joint code) against those names, so the SAME animation code poses whichever body is on screen and your props and collision work on either.
- ASK ONCE AT BOOT AND NEVER WAIT: `parent.postMessage({ type: "avatars?", who: ["me"], look: "lit" }, "*")` — "lit" when your scene has lights (the avatar's materials need them; with none it draws as a black silhouette), "unlit" for a lightless or toon scene (its light is baked into its colours, and it carries NO normals — a crowded room is sent that look whatever you asked, so compute normals on a copy, `geometry.clone().computeVertexNormals()`, before giving any avatar mesh a lit material or an inverted-hull outline). No reply is a legal outcome — the feature off, the arena's house, a slow phone — so the game is complete and playable with your own hero and never holds a screen for an avatar.
- SWAP IT IN WHEN IT ARRIVES: on a `{ type: "avatar", id, name, model, headTop, height, radius, rig }` message with `rig === 1`, `const body = await new THREE.ObjectLoader().parseAsync(d.model)` (parseAsync, not parse, if you draw once — a printed shirt is a picture that decodes a beat later) and replace your hero IN PLACE, keeping its position, its facing and the clip it was playing. A second "avatar" for the same id is a REPLACEMENT — swap again, never add a second body. `d.name` is the player's display name. Never REPLACE `body.userData` (the arcade reads its `avatar` key) — keep your own bookkeeping in a map of yours or under a key of your own.
- SCALE BY THE HEAD: `body.scale.setScalar(YOUR_HERO_HEAD_HEIGHT / d.headTop)` — never by `d.height`, which includes a hat. Collide with a capsule of `d.headTop × d.radius` (times your scale), never with the mesh; hats don't collide.
- IT IS A CARTOON BODY — a big head on SHORT limbs: shoulder to wrist ≈ 0.26 × headTop, hip to ankle ≈ 0.33 × headTop, shoulders ≈ 0.70 × headTop up — so at your hero's head height its arms and legs are usually a quarter shorter than your hero's. Read the real lengths off the joints (the elbow, hand, knee and foot positions) rather than assuming yours. When a hand or foot must REACH something — handlebars, a wheel, a rope, a ledge, a pedal — move the BODY until it reaches (slide the hips toward it, lean the torso in, raise the seat) and never clamp the reach, which leaves a hand floating short of the grip. The hand mesh is centred on `handL`/`handR`: that joint is the grip point.
- ANIMATE on one `THREE.AnimationMixer(body)`: the clips are `body.animations` — idle, walk, run, sit, wave (all looping) and the jump's three — found with `THREE.AnimationClip.findByName(body.animations, name)`; match the gait to your speed with `action.timeScale = speed / (clip.userData.speed × your scale)`. When you cross-fade, set the INCOMING action's weight to 1 first (`action.reset().setEffectiveWeight(1).play()`, then crossFadeFrom) — a fade MULTIPLIES the weight, so an action left at 0 fades in to nothing. Use them where they fit. No clip moves the root — your game moves it.
- THE AVATAR MOVES EXACTLY LIKE YOUR HERO: every pose your hero has beyond the stock clips — a ski crouch and carve, gripping a wheel, a swim stroke, a climb, an aim, a punch or a swing, a crash tumble — you run on the avatar's joints too, the same animation. NEVER leave the avatar on idle (or any stock clip) where your hero would be posed: an avatar standing upright while your own racers crouch is a broken game. Drive it with joint code every frame (set the joints' rotations AFTER `mixer.update(dt)`, or with no stock action playing) or with your own `AnimationClip`s on the same mixer. ROTATIONS ONLY — a position track pulls a limb off a tall or broad body — except `hips.position.y`, which you may lower by a FRACTION of its rest height (`restY * 0.8` for a crouch) so it fits every stature. A hero rigged on OTHER joint names (an older game, an IK rig) gets its pose code ported to the rig-1 names (thigh = hip, shin = knee, upper arm = shoulder, forearm = elbow) — never a stock clip in its place.
- JOINT DIRECTIONS (rest = identity; each joint turns about its own parent-aligned axes; the body faces +z and its LEFT is +x): on a hanging limb (shoulder, elbow, hip, knee) +x swings it BACK (the knee's natural bend), −x swings it FORWARD (the elbow's natural bend, a step, a punch), +z swings it toward +x (OUT for a left limb, IN for a right one); on the torso and head +x pitches FORWARD (a lean, a nod), +y turns toward the body's left, +z tilts the top toward the body's right; on a foot +x is toe DOWN. So a crouch is the hips lowered, `hipL`/`hipR` −x (thighs forward), `kneeL`/`kneeR` +x (shins back), the feet turned by the difference so the soles stay flat, and the torso +x. A prop held in the fist points along the hand's +z.
- THE JUMP is three clips and your game owns the arc: play `jump_up` once (`setLoop(THREE.LoopOnce, 1)`, `clampWhenFinished = true`) and launch the root on its LAST frame; loop `jump_air` while airborne; at contact play `jump_land` once (LoopOnce + clamp) with a ~0.03s fade, then fade back to walk / run / idle. A jump that fires on the press frame — and every RUNNING jump — skips jump_up and fades straight into jump_air over ~0.1s. Your own hero needs no jump clips: when `findByName` returns undefined the jump must still work on your own pose.
- PROPS go on the joints — a sword on `body.getObjectByName("handR")`, a jetpack on "torso", a helmet on "head" — so they move with either body.
