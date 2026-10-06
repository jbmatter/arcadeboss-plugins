---
name: connect
description: Sign in to your Arcade Boss account so the arcade MCP server works in this session (or, on a machine with no browser, connect with a plugin key)
---

Get the user signed in to their Arcade Boss account. The plugin's MCP server
is `https://arcadeboss.io/mcp`, and it signs in with OAuth: nothing to paste,
no key to store.

Arguments the user may have passed: $ARGUMENTS (an older Connect sheet copied
`/arcade:connect <url> <key>` — see step 3 if a `pt_mcp_…` key arrived).

1. **Sign in.** Tell the user to run `/mcp`, pick **arcade** (listed under the
   plugin), and choose **Authenticate**. Their browser opens the Arcade Boss
   sign-in page: they sign in (email code or Google — a new email makes a new
   account and its arcade) and press **Allow**. Claude Code keeps the sign-in
   and refreshes it; there is nothing to restart.
2. **Prove it.** Call the arcade's `get_arcade` tool and report the arcade's
   name and visit link. If it still answers with a sign-in error, the
   authentication didn't finish — have them run `/mcp` → arcade →
   Authenticate again.
3. **No browser on this machine?** (SSH, a container.) Then a plugin key is
   the fallback. The key is a `pt_mcp_…` token from the arcade's 🗃 Builds →
   🔌 Connect → Claude Code → **In Terminal** → "No browser? Use a key", which
   copies the whole command. If the user handed you a key instead, run it for
   them — it adds a second, key-authenticated server beside the plugin's:

   ```bash
   claude mcp add --transport http arcade-key https://arcadeboss.io/mcp --header "Authorization: Bearer <key>"
   ```

   The key is a password: never echo it back in full, never write it anywhere
   else. For a local development server, use that stack's origin + `/mcp`.
   Restart Claude Code (or `/reload-plugins`) and call `get_arcade` through
   the new server.

Signed-in apps and keys are listed under 🔌 Connect → **Connected** in the
arcade, each with Revoke; 👤 Profile → Sign out everywhere ends them all.
