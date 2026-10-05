#!/usr/bin/env node
// PostToolUse hook on publish_game: real enforcement, not a polite request.
// If the publish's verify failed, the model gets a system message it cannot
// gloss over in its summary — the quality test showed a clean-looking handoff
// is exactly how an unverified game reaches a player.
//
// Reads the PostToolUse JSON on stdin; the MCP tool's result rides
// tool_response as content blocks whose text is the JSON the server returned.
// Defensive parsing on purpose: a hook that throws on an unexpected shape
// silently stops enforcing.
let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let verdict = null;
  try {
    const event = JSON.parse(raw);
    const blocks = event.tool_response?.content ?? event.tool_response ?? [];
    for (const b of Array.isArray(blocks) ? blocks : [blocks]) {
      const text = typeof b === "string" ? b : b?.text;
      if (!text) continue;
      try {
        const r = JSON.parse(text);
        if (typeof r.ok === "boolean") verdict = r;
      } catch {}
    }
  } catch {}
  if (verdict && verdict.ok === false) {
    const list = (verdict.defects ?? [])
      .slice(0, 6)
      .map((d) => `- [${d.tier}] ${d.message}`)
      .join("\n");
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          systemMessage: `⛔ PUBLISH VERIFY FAILED — the draft landed but is NOT done. Do not tell the user it's ready. Fix these and publish again:\n${list}`,
        },
      })
    );
  } else if (verdict && verdict.ok === true && Array.isArray(verdict.findings) && verdict.findings.length) {
    // FINDINGS: the publish verified, and the verifier MEASURED a defect in
    // the game anyway (a z-fight in an ASSETS builder, steering that moves
    // the player left under D). Softer than a failed verify — the draft is
    // real and playable — but not something a clean-looking summary may
    // omit: the user is told, or the fix is made and published again.
    const list = verdict.findings
      .slice(0, 4)
      .map((f) => `- ${f.message}`)
      .join("\n");
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          systemMessage: `⚠️ PUBLISHED, WITH FINDINGS — the verifier measured these in the game (they do not fail a publish, and they are exact). Fix them and publish again, or tell the user about each one by name; never leave them out of the summary:\n${list}`,
        },
      })
    );
  }
  process.exit(0);
});
