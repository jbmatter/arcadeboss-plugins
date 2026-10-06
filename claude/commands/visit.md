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
built-in browser logs in with one navigation: open `get_arcade`'s
`signedInUrl` — its one-time key signs that browser in to their account and
lands them standing in their own arcade, no separate browser needed. A key
works once and for an hour; call `get_arcade` again for a fresh one whenever
the built-in browser looks logged-out. Never paste that URL into chat or
anywhere public — navigate the browser to it directly.

If the arcade tools are missing from this session or every call errors, the
user isn't signed in: call the arcade server's `authenticate` tool (Claude Code
offers one while it's signed out — "arcade - authenticate"), give the user the
sign-in link it returns, and continue once they've pressed Allow. `/arcade:connect`
walks through the same thing.
