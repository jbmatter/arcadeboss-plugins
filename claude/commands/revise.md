---
name: revise
description: Revise an existing game in your arcade (reads the source, applies the change, verifies, publishes the next draft)
---

Revise an existing game in the user's arcade. Their request: $ARGUMENTS

Like builds, revisions run INLINE in this session. Follow the arcade
skill (`arcade:arcade`) revision workflow: `list_games` to resolve which game they mean (ask if
ambiguous), `get_game_source` for the files, that game's OWN contract,
and the `baseVersion`, apply the change with targeted edits (never a
rewrite — preserve everything the request didn't touch: the highscore
wiring, ASSETS/TUNING/DEBUG/COVER/__PROBE, the seed determinism), iterate
against `verify_game` with the gameId, then — unless `verify_game` still
answers `demo: "fits"` — write and check a new cabinet demo (the skill's
"The cabinet's demo"), and `publish_game` once with the `baseVersion`, a
one-line changelog and any new demo as `attract`.

Deliver with the same card the build command describes — chips say vN and
what changed, its buttons are REAL LINKS (`walkInUrl` and `benchUrl` /
`stagedBenchUrl`, never `sendPrompt` — see build.md for why that renders
dead) — and say that the live cabinet keeps serving the shipped version
until they ship the new draft in the arcade.

If the arcade tools are missing from this session or every call errors, the
user isn't signed in: call the arcade server's `authenticate` tool (Claude Code
offers one while it's signed out — "arcade - authenticate"), give the user the
sign-in link it returns, and continue once they've pressed Allow. `/arcade:connect`
walks through the same thing.
