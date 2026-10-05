---
name: connect
description: Connect this machine to your Game Dev Sim arcade account (stores your player token and server URL for the arcade MCP server)
---

Connect the user's arcade account. The arcade MCP server reads two
environment variables: `ARCADE_MCP_URL` (the server's `/mcp` endpoint) and
`ARCADE_PLAYER_TOKEN` (a **plugin key** — `pt_mcp_…`, made in the arcade
under 🗃 Builds → 🔌 Connect, or 👤 Profile → 🔌 Plugin key…; it can build and publish, never
manage the account, and the user can revoke it from that same popup).

Arguments the user may have passed: $ARGUMENTS (may contain a URL and/or a
token, in either order).

1. Determine both values. If either is missing, ask the user for it:
   - The token: in the arcade, 🗃 **Builds** → 🔌 **Connect** (the button at
     the top of the tab) → **Mint a token** (or ☰ menu on the top-left HUD
     card → 👤 Profile → 🔌 **Plugin key…**, which opens the same sheet) — it is copied and shown once
     (shaped `pt_mcp_…`). The sheet only works once the account exists, i.e.
     after the arcade has loaded once in that browser. It is shown once; a lost
     one is simply revoked there and a new one minted. Treat it like a
     password: never echo it back in full, never write it anywhere except
     the settings step below.
   - The URL is their arcade server's origin plus `/mcp`
     (`https://arcadeboss.io/mcp`; for local development
     `http://localhost:<api-port>/mcp`).
   - LEGACY: an older connect used the 🪪 Account link (advanced)… row
     (`https://<server>/claim-player/<token>`) — the account MASTER key. If
     the user pastes one, extract the token from the path (the segment after
     `/claim-player/`) and the origin from the same URL; a bare token is
     accepted too. It still works for now (the server logs a deprecation
     line naming the account), but tell them it is the key to the whole
     account and offer to swap it for a plugin token from the 🔌 row before
     storing anything.
2. Merge into the user-level `~/.claude/settings.json` (create it or the
   `env` key if absent, preserving everything else):
   ```json
   { "env": { "ARCADE_MCP_URL": "<url>", "ARCADE_PLAYER_TOKEN": "<token>" } }
   ```
3. Tell the user to restart Claude Code (or run `/reload-plugins`) so the
   plugin's MCP server picks the values up, then verify the connection by
   calling the arcade's `get_arcade` tool and reporting the arcade's name
   and visit link. (Before the restart, `curl -s -H "X-Player-Token: <token>"
   <origin>/api/players/whoami` answers `{scope: "mcp"}` for a good plugin
   token without exposing anything.)

If `get_arcade` returns an auth error after this, the token is wrong or the
server unreachable — say which (the error text tells you) and re-ask.
