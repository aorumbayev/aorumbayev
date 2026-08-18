// Renders the stats card with the upstream github-readme-stats code, straight
// to a file. The options below mirror the query string of the hosted URL this
// replaced: show_icons=true&theme=nord&include_all_commits=true

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const SRC = process.env.GRS_SRC ?? ".stats-src";
const OUT = process.env.OUT ?? "assets/stats.svg";
const USERNAME = process.env.STATS_USERNAME ?? "aorumbayev";

const { fetchStats } = await import(resolve(SRC, "src/fetchers/stats.js"));
const { renderStatsCard } = await import(resolve(SRC, "src/cards/stats.js"));

const stats = await fetchStats(USERNAME, true, [], false, false, false, NaN);

const svg = renderStatsCard(stats, {
  show_icons: true,
  theme: "nord",
  include_all_commits: true,
});

if (/Something went wrong/i.test(svg)) {
  throw new Error(`renderer returned an error card:\n${svg}`);
}
if (!stats.totalCommits && !stats.totalStars) {
  throw new Error("stats came back empty - check the PAT_1 secret");
}

await mkdir(dirname(resolve(OUT)), { recursive: true });
await writeFile(resolve(OUT), svg);
console.log(
  `wrote ${OUT}: rank ${stats.rank.level}, ${stats.totalCommits} commits, ${stats.totalStars} stars`,
);
