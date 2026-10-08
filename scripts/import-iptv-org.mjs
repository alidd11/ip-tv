import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://iptv-org.github.io/api';
const DEFAULT_COUNTRIES = ['GB', 'TR', 'US'];
const countryArgs = process.argv.find((arg) => arg.startsWith('--countries='));
const requested = (countryArgs ? countryArgs.split('=')[1].split(',') : DEFAULT_COUNTRIES)
  .map((code) => code.trim().toUpperCase())
  .filter(Boolean);

// iptv-org uses UK for the United Kingdom; our catalogue uses ISO alpha-2 GB.
const upstreamCountry = (code) => (code === 'GB' ? 'UK' : code);
const localCountry = (code) => (code === 'UK' ? 'GB' : code);

async function getJson(name) {
  const response = await fetch(`${API}/${name}.json`, { headers: { 'user-agent': 'ip-tv-metadata-sync/0.1' } });
  if (!response.ok) throw new Error(`${name}: ${response.status} ${response.statusText}`);
  return response.json();
}

const [channels, feeds, logos] = await Promise.all([
  getJson('channels'),
  getJson('feeds'),
  getJson('logos')
]);

const upstream = new Set(requested.map(upstreamCountry));
const selectedChannels = channels.filter((channel) =>
  upstream.has(channel.country) && !channel.is_nsfw && !channel.closed
);
const selectedIds = new Set(selectedChannels.map((channel) => channel.id));
const selectedFeeds = feeds.filter((feed) => selectedIds.has(feed.channel));
const selectedLogos = logos.filter((logo) => selectedIds.has(logo.channel) && logo.in_use);

const outDir = path.resolve('data/imports/iptv-org');
await fs.mkdir(outDir, { recursive: true });

for (const code of requested) {
  const sourceCode = upstreamCountry(code);
  const channelRows = selectedChannels.filter((channel) => channel.country === sourceCode).map((channel) => ({
    ...channel,
    country: localCountry(channel.country)
  }));
  const ids = new Set(channelRows.map((channel) => channel.id));
  const feedRows = selectedFeeds.filter((feed) => ids.has(feed.channel));
  const logoRows = selectedLogos.filter((logo) => ids.has(logo.channel));
  await fs.writeFile(path.join(outDir, `${code}.json`), JSON.stringify({ channels: channelRows, feeds: feedRows, logos: logoRows }, null, 2) + '\n');
}

await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify({
  source: 'iptv-org/database via iptv-org/api',
  license: 'The Unlicense',
  includesStreams: false,
  countries: requested
}, null, 2) + '\n');

console.log(`Imported metadata for ${selectedChannels.length} active non-adult channels across ${requested.join(', ')}.`);
