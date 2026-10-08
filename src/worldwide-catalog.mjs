import fs from "node:fs";
import path from "node:path";

const defaultRoot = process.cwd();

export function listWorldwideCountries(root = defaultRoot) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "data/worldwide/manifest.json"), "utf8"));
  return manifest.countries
    .filter((c) => c.visible > 0)
    .sort((a, b) => b.visible - a.visible || a.name.localeCompare(b.name));
}

export function getWorldwideCountry(code, root = defaultRoot, { includeArchived = false } = {}) {
  const key = String(code ?? "").trim().toUpperCase().replace(/^UK$/, "GB");
  if (!/^[A-Z]{2}$/.test(key)) throw Error("Expected a two-letter ISO country code");
  const file = path.join(root, "data/worldwide/countries", key + ".json");
  if (!fs.existsSync(file)) return [];
  const channels = JSON.parse(fs.readFileSync(file, "utf8"));
  return includeArchived ? channels : channels.filter((c) => !c.isClosed && !c.isAdult);
}

export function filterWorldwide(channels, {
  query = "", category = "", limit = 50, offset = 0, includeArchived = false,
} = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 250) throw Error("limit must be 1..250");
  if (!Number.isInteger(offset) || offset < 0) throw Error("offset must be a nonnegative integer");

  const needle = String(query).trim().toLocaleLowerCase();
  const selectedCategory = String(category).trim().toLocaleLowerCase();
  const ranked = channels
    .filter((c) => includeArchived || (!c.isClosed && !c.isAdult))
    .filter((c) => !selectedCategory || c.categories?.includes(selectedCategory))
    .map((channel) => {
      if (!needle) return { channel, score: 1 };
      const name = channel.name.toLocaleLowerCase();
      const aliases = (channel.aliases || []).map((s) => s.toLocaleLowerCase());
      const network = (channel.network || "").toLocaleLowerCase();
      let score = name === needle ? 100 : name.startsWith(needle) ? 65 : name.includes(needle) ? 35 : 0;
      if (aliases.some((s) => s === needle)) score = Math.max(score, 90);
      else if (aliases.some((s) => s.includes(needle))) score = Math.max(score, 30);
      if (network.includes(needle)) score = Math.max(score, 10);
      return { channel, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score ||
      a.channel.name.localeCompare(b.channel.name) || a.channel.id.localeCompare(b.channel.id));

  return {
    total: ranked.length,
    limit,
    offset,
    hasMore: offset + limit < ranked.length,
    channels: ranked.slice(offset, offset + limit).map((x) => x.channel),
  };
}

export function searchWorldwideCountry(code, options = {}, root = defaultRoot) {
  const channels = getWorldwideCountry(code, root, {includeArchived: true});
  return filterWorldwide(channels, options);
}
