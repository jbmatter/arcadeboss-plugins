---
name: arcade-visit
description: Show the user's arcade at a glance — what's live on the floor, what's waiting on the workbench, and the link to walk in. Use when they ask what's in their arcade, what's on the bench, or for the arcade link.
---

# Visiting the arcade

Call the arcade's `get_arcade` and `list_games` tools and give a short
status: the arcade's name, what's live on the floor, what's waiting on the
workbench (drafts they haven't shipped yet), and the visit link. If there
are bench drafts, remind them shipping happens in the arcade — walk up to
the dev whose bench holds it, play it, then Ship 🚀. That is the fun part,
and it is deliberately not a tool here.

In ChatGPT, `get_arcade` renders its own card with a Walk in button; add a
line or two and stop. In Codex, give the visit link as text.

If the arcade tools are missing from this session, or every call answers
401, the account isn't connected — follow the `arcade-connect` skill.
