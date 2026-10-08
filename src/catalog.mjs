import fs from 'node:fs';
import path from 'node:path';

const defaultRoot = process.cwd();

function readJson(root, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readJsonIfExists(root, relativePath, fallback = []) {
  const target = path.join(root, relativePath);
  return fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : fallback;
}

export function loadCatalog(root = defaultRoot) {
  const countries = readJson(root, 'data/countries.json');
  const categories = readJson(root, 'data/categories.json');
  const index = readJson(root, 'data/channels/index.json');
  const channels = [];
  const feeds = [];
  const providers = [];
  const packages = [];

  for (const entry of index.countries) {
    channels.push(...readJson(root, entry.channelFile));
    feeds.push(...readJson(root, entry.feedFile));
    providers.push(...readJsonIfExists(root, `data/providers/${entry.code}.json`));
    packages.push(...readJsonIfExists(root, `data/packages/${entry.code}.json`));
  }

  const playbackSources = readJsonIfExists(root, 'config/playback-sources.verified.json');
  return { countries, categories, index, channels, feeds, providers, packages, playbackSources };
}

export function listCountries(catalog, { enabledOnly = true } = {}) {
  return catalog.countries
    .filter((country) => !enabledOnly || country.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function listChannels(catalog, countryCode) {
  const code = countryCode?.toUpperCase();
  return catalog.channels
    .filter((channel) => !code || channel.country === code)
    .filter((channel) => channel.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function listPackages(catalog, countryCode = null) {
  const code = countryCode?.toUpperCase();
  return catalog.packages.filter((pkg) => !code || pkg.country === code);
}

export function getChannel(catalog, id) {
  return catalog.channels.find((channel) => channel.id === id) ?? null;
}

export function getChannelFeeds(catalog, channelId) {
  return catalog.feeds.filter((feed) => feed.channelId === channelId && feed.enabled);
}

export function getPlaybackSources(catalog, channelId) {
  const feedIds = new Set(getChannelFeeds(catalog, channelId).map((feed) => feed.id));
  return catalog.playbackSources
    .filter((source) => source.enabled && feedIds.has(source.feedId))
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
}

function searchableText(channel) {
  return [channel.name, channel.shortName, ...channel.aliases, channel.network, ...channel.tags]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();
}

export function searchChannels(catalog, query, { country = null, category = null, accessModel = null, limit = 50 } = {}) {
  const needle = String(query ?? '').trim().toLocaleLowerCase();
  if (!needle) return [];

  return catalog.channels
    .filter((channel) => channel.enabled)
    .filter((channel) => !country || channel.country === country.toUpperCase())
    .filter((channel) => !category || channel.categories.includes(category))
    .filter((channel) => !accessModel || channel.access?.model === accessModel)
    .map((channel) => {
      const text = searchableText(channel);
      let score = 0;
      if (channel.name.toLocaleLowerCase() === needle) score += 100;
      if (channel.shortName.toLocaleLowerCase() === needle) score += 90;
      if (channel.aliases.some((alias) => alias.toLocaleLowerCase() === needle)) score += 85;
      if (text.startsWith(needle)) score += 50;
      if (text.includes(needle)) score += 25;
      return { channel, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.channel.sortOrder - b.channel.sortOrder || a.channel.name.localeCompare(b.channel.name))
    .slice(0, limit)
    .map((item) => item.channel);
}
