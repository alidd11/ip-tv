import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const channelDir = path.join(root, 'data', 'channels');
const feedDir = path.join(root, 'data', 'feeds');
const countries = JSON.parse(fs.readFileSync(path.join(root, 'data', 'countries.json'), 'utf8'));
const enabledCountries = countries.filter((country) => country.enabled).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
const index = { version: 1, countries: [], totalChannels: 0, totalFeeds: 0 };

for (const country of enabledCountries) {
  const channelPath = path.join(channelDir, `${country.code}.json`);
  const feedPath = path.join(feedDir, `${country.code}.json`);
  const channels = fs.existsSync(channelPath) ? JSON.parse(fs.readFileSync(channelPath, 'utf8')) : [];
  const feeds = fs.existsSync(feedPath) ? JSON.parse(fs.readFileSync(feedPath, 'utf8')) : [];
  index.countries.push({ code: country.code, channelFile: `data/channels/${country.code}.json`, feedFile: `data/feeds/${country.code}.json`, channelCount: channels.length, feedCount: feeds.length });
  index.totalChannels += channels.length;
  index.totalFeeds += feeds.length;
}

fs.writeFileSync(path.join(channelDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`Built index: ${index.countries.length} enabled countries, ${index.totalChannels} channels, ${index.totalFeeds} feeds.`);
