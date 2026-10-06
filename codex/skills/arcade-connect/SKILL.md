---
name: arcade-connect
description: Sign Codex or ChatGPT in to the user's Arcade Boss account — the OAuth sign-in each host runs, the plugin-key fallback for a machine with no browser, and how to prove the connection with get_arcade. Use when the arcade tools are missing, every arcade call answers 401, or the user says "connect my arcade".
---

# Connecting the arcade

The arcade MCP server (`https://arcadeboss.io/mcp`) signs in with **OAuth**:
the host opens the Arcade Boss sign-in page in a browser, the user signs in
(email code or Google — a new email makes a new account and its arcade) and
presses **Allow**, and the host keeps the sign-in. Nothing is pasted and no
key is stored. The sign-in can see the user's arcade and its games, start
projects and publish drafts to their Builds — never spend their energy,
change their account or ship to the floor.

## 1. Sign in, per host

**Codex app (ChatGPT.app's Codex):** installing the plugin from the Plugins
page runs the sign-in. If it was skipped, remove and re-add the plugin, or
use the Terminal line below.

**Codex CLI:** add the server by URL — Codex detects the OAuth support and
opens the sign-in itself:

```bash
codex mcp add arcade --url "https://arcadeboss.io/mcp?via=codex"
```

(`codex mcp login arcade` signs in again later; `--no-browser` prints the
link for a machine whose browser is elsewhere — open it anywhere, then paste
the address the browser lands on back into Codex.) `?via=codex` stamps the
versions built here as Codex's; leave it on.

**ChatGPT (hosted chat):** with Developer mode on, Plugins → Add → Create MCP
App → Server URL `https://arcadeboss.io/mcp`, authentication **OAuth** →
Create. ChatGPT opens the Arcade Boss sign-in; the user presses Allow. (The
older private capability URL, `/mcp/k/<token>`, is retired in favour of
this — see the arcade's docs if a server still offers it.)

## 2. No browser at all? A plugin key

On a machine that can't open a sign-in page at all (CI, a container with no
way to forward the link), a **plugin key** is the fallback: a `pt_mcp_…`
token from the arcade's 🗃 Builds → 🔌 Connect → Codex → **In Terminal** →
"No browser? Use a key", which copies the whole line:

```bash
echo 'export ARCADE_PLAYER_TOKEN=<key>' >> ~/.zshrc && codex mcp add arcade-key --url "https://arcadeboss.io/mcp?via=codex" --bearer-token-env-var ARCADE_PLAYER_TOKEN
```

The key is a password: never echo it back in full, never put it in chat
text, never write it anywhere but that profile line. Open a new terminal so
Codex reads it. For a local development server, use that stack's origin +
`/mcp?via=codex`.

## 3. Prove it

Call the arcade's `get_arcade` tool and report the arcade's name and visit
link. A sign-in error means the sign-in didn't finish (run the host's step
again) or was revoked — signed-in apps and keys are listed under 🔌 Connect →
**Connected** in the arcade, each with Revoke, and 👤 Profile → Sign out
everywhere ends them all. An unreachable server means the URL — say which,
from the error text.
