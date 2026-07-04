// Renders the ryo-ma GitHub trophy to a static SVG so the profile depends on
// NO external trophy service. Run from inside a checkout of
// ryo-ma/github-profile-trophy (pinned to a commit in the workflow).
//
//   deno run --allow-net --allow-env --allow-read --allow-write --no-check \
//     trophy_render.ts USERNAME OUTPUT_PATH THEME
//
// Auth: GithubApiService reads GITHUB_TOKEN1 / GITHUB_TOKEN2 from the env.

import { GithubApiService } from "./src/Services/GithubApiService.ts";
import { Card } from "./src/card.ts";
import { COLORS } from "./src/theme.ts";

const username = Deno.args[0];
const outputPath = Deno.args[1] ?? "./trophy.svg";
const themeName = Deno.args[2] ?? "tokyonight";

if (!username) {
  console.error("Usage: deno run -A trophy_render.ts USERNAME [OUTPUT] [THEME]");
  Deno.exit(1);
}

const service = new GithubApiService();
const userInfo = await service.requestUserInfo(username);

// Bail loudly on any API/rate-limit failure so a bad run never overwrites a
// previously good SVG (the publish step only runs when this exits 0).
if (!userInfo || userInfo.totalCommits === undefined) {
  console.error("Failed to fetch user info (token / username / rate limit).");
  Deno.exit(2);
}

// Card(titles, ranks, maxColumn, maxRow, panelSize, marginW, marginH, noBackground, noFrame)
// Frameless + transparent + 7-wide to match the profile layout.
const card = new Card([], [], 7, 10, 115, 6, 6, true, true);
const theme = COLORS[themeName] ?? COLORS.default;
const svg = card.render(userInfo, theme);

if (!svg || svg.length < 1000) {
  console.error("Rendered SVG too small — refusing to write.");
  Deno.exit(3);
}

await Deno.writeTextFile(outputPath, svg);
console.log("Wrote " + outputPath + " (" + svg.length + " bytes)");
