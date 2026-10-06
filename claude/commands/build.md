---
name: build
description: Build a new game for your arcade (interview → contract → verify loop → publish to the workbench)
---

Build a new game for the user's arcade. Their idea (may be empty): $ARGUMENTS

Builds run INLINE in this session by default (owner, 2026-08-26 — keeps
the context window under the session's own control, with the main
session's auto-compaction as the long-run safety valve). Follow the
arcade skill (`arcade:arcade`) workflow exactly: interview for a
real brief if the idea is thin (one sharp either/or, two rounds at most),
`create_project`, write the game to the returned contract, iterate
against `verify_game` until clean, then — with the game done — write the
cabinet's demo and check it (the skill's "The cabinet's demo"), and
`publish_game` once with a changelog and the demo as `attract`.

**The delivery card**: when an inline-widget tool is available in this
session (e.g. a `show_widget`/visualize tool), render the delivery as a
compact card — the game's title and tagline (split on the em dash) up
top, a verified-clean badge with the boot time, chips for
version/declarations, 2–4 delivery bullets, and two buttons that are REAL
LINKS: "Walk in" → `walkInUrl`, "Playtest on the bench" → `benchUrl`
(`stagedBenchUrl` when what you want them on is staged, not published).
A click opens the host's "Open external link" dialog and lands them in
the game. With no widget tool, deliver as text — report, walk-in link,
bench link — and offer the built-in-browser open as a question with
options instead.

⚠️ **The card's buttons must never be wired to `sendPrompt`** (measured
2026-08-26, and it cost a session to find). In Claude Code's desktop app
`sendPrompt` IS present — `typeof` returns `"function"` and calling it
throws nothing — but it posts NOTHING to chat: every button wired to it
renders as a dead control that looks perfectly correct in review, and no
inspection of the markup finds it. The terminal has no widget tool at
all, so the prompt-button path works on no Claude Code surface. What DOES
work in the widget sandbox: `<a href>` (clicks are intercepted into the
link dialog), `openLink(url)`, and both inline `onclick` and
`addEventListener` for in-card state. Links only for anything that leaves
the card.

The bench link carries the ARCADE key, which is the same key the skill
already tells you to show the player and the same one every unshipped
in-world iframe URL rides — so it may sit in the card, but never in
anything that leaves this session, and remember a card is something the
player screenshots. A SIGN-IN link (`signedInUrl` from `get_arcade`, the
publish's `libraryUrl`) is different and NEVER appears in a card or
anywhere public: it carries a one-time key to their account.

The built-in-browser open, offered as a question when they'd rather stay
in the app than leave for a browser tab: navigate the browser to the
publish's `libraryUrl` (or `get_arcade`'s `signedInUrl`) — its one-time key
signs that browser in to their account and lands in their arcade; then go
wherever they asked (the arcade, or the benchUrl). Each key works once and
for an hour, so call `get_arcade` again for a fresh one whenever the
browser looks logged out.

If the arcade tools are missing from this session or every call errors, the
user isn't signed in: call the arcade server's `authenticate` tool (Claude Code
offers one while it's signed out — "arcade - authenticate"), give the user the
sign-in link it returns, and continue once they've pressed Allow. `/arcade:connect`
walks through the same thing.
