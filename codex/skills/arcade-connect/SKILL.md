---
name: arcade-connect
description: Connect Codex or ChatGPT to the user's Arcade Boss account — where the account link comes from, where the player token goes, and how to prove the connection with get_arcade. Use when the arcade tools are missing, every arcade call answers 401, or the user says "connect my arcade".
---

# Connecting the arcade

The arcade MCP server authenticates with the user's **plugin key** — a
`pt_mcp_…` token that can build and publish games in their arcade and
nothing else. It is a password: never echo it back in full, never put it in
chat text, never write it anywhere but the one place below.

## 1. Get the key

In the arcade (https://arcadeboss.io — the account is created the first
time the page loads): the **☰ menu** on the top-left card → **👤 Profile**
→ **🔌 Plugin key…**. A popup shows the key with a Copy button; picking
**Codex** under it shows the exact two lines from step 2 with the key and
the server filled in, so the user may hand you those instead. The MCP
endpoint is the arcade's origin plus `/mcp`. A key is shown once; a lost
one is revoked in that popup and a new one made there.

LEGACY: an older connect used the 🪪 Account link (advanced)… row
(`https://<server>/claim-player/<token>`) — the account MASTER key. If the
user pastes one, the token is the path segment after `/claim-player/` and
the origin is the same URL's; a bare token is accepted too. It still works
(the server logs a deprecation line), but tell them it is the key to the
whole account and offer to swap it for a plugin key from the 🔌 row before
storing anything.

## 2. Put it where this harness reads it

**Codex (CLI, IDE extension, cloud):** the plugin's bundled server reads the
Bearer from the environment variable `ARCADE_PLAYER_TOKEN`. Set it in the
shell profile the user starts Codex from (`export ARCADE_PLAYER_TOKEN=…`),
then restart Codex so the plugin's MCP server picks it up. For a local
development server, add the server by hand instead, pointing at that
stack's origin:

```bash
codex mcp add arcade --url "http://localhost:<api-port>/mcp?via=codex" --bearer-token-env-var ARCADE_PLAYER_TOKEN
```

(`?via=codex` is what stamps versions built here as Codex's; leave it on.)
Also export `ARCADE_MCP_URL` as the BARE endpoint — origin + `/mcp`, no
`?via=` — because the build skill's staging recipe appends `/stage?path=…`
to it, and a query string in the middle breaks the URL (measured on the
first dogfood: the curl landed on `/mcp?via=codex/stage…`).

**ChatGPT (hosted):** ChatGPT's connector form takes OAuth or no
authentication, and the arcade's OAuth sign-in is not live yet. Until it
is, ChatGPT connects through a **private connector on a capability URL**,
which the arcade server offers only when its operator has enabled it:
Settings → Security and login → Developer mode, then ChatGPT Plugins →
**+** → name it, and under Connection enter

```
https://arcadeboss.io/mcp/k/<token>
```

with no authentication. The token is the URL. Treat that connector entry
like the password it holds: it is the user's own private registration, and
it must never be shared or submitted anywhere. If the server answers 404
on that path, the operator has not enabled it — say so, and offer Codex.

## 3. Prove it

Call the arcade's `get_arcade` tool and report the arcade's name and visit
link. A 401 means the key is wrong or the environment variable was not
picked up (Codex restarts read the profile; a key pasted into the wrong
shell is the usual cause). An unreachable server means the URL — say
which, from the error text, and re-ask.
