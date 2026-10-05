---
name: visit
description: Show your arcade's status and the link to walk in
---

Call the arcade's `get_arcade` and `list_games` tools and give the user a
short status: the arcade's name, what's live on the floor, what's waiting
on the workbench (drafts they haven't shipped yet), and the visit link.
If there are bench drafts, remind them shipping happens in the arcade —
that's the fun part.

**In the Claude Code app, offer to open the arcade right here.** The
built-in browser logs in with one navigation: open
`<origin>/claim-player/$ARCADE_PLAYER_TOKEN` (origin = `ARCADE_MCP_URL`
minus `/mcp`; both are in the session env) — that binds the browser to
their account, resolves their arcade's owner key, and lands them standing
in their own arcade, no separate browser needed. It's idempotent, so do it
whenever the built-in browser looks logged-out. Never paste that URL into
chat or anywhere public — it carries the account master key; navigate the
browser to it directly.

If the arcade tools are missing from this session or every call errors, the
account isn't connected yet: tell the user to run `/arcade:connect` — in the
arcade, the ☰ menu on the top-left card → 👤 Profile → 🪪 Account link
(advanced)… puts their account link in a prompt, and OK copies it — and to
restart Claude Code after.
