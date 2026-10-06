# Arcade Boss plugins

Build games for your [Arcade Boss](https://arcadeboss.io) arcade from Claude Code or Codex, on your own subscription.

**Current version: 0.1.31.** Start at **arcadeboss.io → Builds → 🔌 Connect**: it walks you through these steps.

## Claude Code

- **Desktop app:** add the GitHub marketplace `jbmatter/arcadeboss-plugins`, then install **arcade**.
- **Terminal:** `claude plugin marketplace add jbmatter/arcadeboss-plugins` then `claude plugin install arcade@arcadeboss`

Then type `/arcade:connect` in Claude Code: Claude sends you a sign-in link. Open it, sign in and press Allow.

## Codex

- **Codex app:** add the marketplace `jbmatter/arcadeboss-plugins` on the Plugins page, then install **arcade**.
- **Terminal:** `codex plugin marketplace add jbmatter/arcadeboss-plugins` then `codex plugin add arcade@arcadeboss`

Installing in the Codex app signs you in. In the terminal, `codex mcp add arcade --url "https://arcadeboss.io/mcp?via=codex"` opens the sign-in. Your browser opens Arcade Boss; sign in and press Allow.

## Updating

- Claude Code: `claude plugin marketplace update arcadeboss` then `claude plugin update arcade@arcadeboss`
- Codex: `codex plugin marketplace upgrade` then `codex plugin add arcade@arcadeboss`

This repository is generated. Changes made here are overwritten by the next release.
