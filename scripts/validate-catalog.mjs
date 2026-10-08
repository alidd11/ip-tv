import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const countries = readJson('data/countries.json');
const categories = readJson('data/categories.json');
const countryCodes = new Set();
const categoryIds = new Set(categories.map((category) => category.id));
const channelIds = new Set();
const feedIds = new Set();
const providerIds = new Set();
const packageIds = new Set();
const errors = [];
let channelCount = 0;
let feedCount = 0;
let providerCount = 0;
let packageCount = 0;

for (const country of countries) {
  if (!/^[A-Z]{2}$/.test(country.code)) errors.push(`Invalid country code: ${country.code}`);
  if (countryCodes.has(country.code)) errors.push(`Duplicate country code: ${country.code}`);
  countryCodes.add(country.code);

  const channelPath = path.join(root, 'data', 'channels', `${country.code}.json`);
  const feedPath = path.join(root, 'data', 'feeds', `${country.code}.json`);
  if (country.enabled && !fs.existsSync(channelPath)) errors.push(`${country.code}: enabled but channel file is missing`);
  if (country.enabled && !fs.existsSync(feedPath)) errors.push(`${country.code}: enabled but feed file is missing`);
  if (!fs.existsSync(channelPath)) continue;

  const channels = JSON.parse(fs.readFileSync(channelPath, 'utf8'));
  for (const channel of channels) {
    channelCount += 1;
    if (!channel.id || !channel.name || !channel.country) errors.push(`${country.code}: malformed channel`);
    if (channel.country !== country.code) errors.push(`${channel.id}: country ${channel.country} does not match ${country.code}`);
    if (channelIds.has(channel.id)) errors.push(`Duplicate channel id: ${channel.id}`);
    channelIds.add(channel.id);
    if (!Array.isArray(channel.languages) || channel.languages.length === 0) errors.push(`${channel.id}: languages required`);
    if (!Array.isArray(channel.categories) || channel.categories.length === 0) errors.push(`${channel.id}: categories required`);
    for (const category of channel.categories ?? []) if (!categoryIds.has(category)) errors.push(`${channel.id}: unknown category ${category}`);
    if ('sources' in channel) errors.push(`${channel.id}: playback sources must not be stored in channel metadata`);
    if (channel.isAdult) errors.push(`${channel.id}: adult channels are not permitted in the default catalogue`);
    if (!channel.access || !['free-to-air', 'free-stream', 'subscription', 'ppv', 'mixed'].includes(channel.access.model)) {
      errors.push(`${channel.id}: valid access metadata is required`);
    }
  }

  if (!fs.existsSync(feedPath)) continue;
  const feeds = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
  for (const feed of feeds) {
    feedCount += 1;
    if (feedIds.has(feed.id)) errors.push(`Duplicate feed id: ${feed.id}`);
    feedIds.add(feed.id);
    if (!channelIds.has(feed.channelId)) errors.push(`${feed.id}: unknown channel ${feed.channelId}`);
  }
}

for (const country of countries) {
  const providerPath = path.join(root, 'data', 'providers', `${country.code}.json`);
  if (!fs.existsSync(providerPath)) continue;
  for (const provider of JSON.parse(fs.readFileSync(providerPath, 'utf8'))) {
    providerCount += 1;
    if (providerIds.has(provider.id)) errors.push(`Duplicate provider id: ${provider.id}`);
    providerIds.add(provider.id);
    if (provider.country !== country.code) errors.push(`${provider.id}: provider country mismatch`);
  }
}

for (const country of countries) {
  const packagePath = path.join(root, 'data', 'packages', `${country.code}.json`);
  if (!fs.existsSync(packagePath)) continue;
  for (const pkg of JSON.parse(fs.readFileSync(packagePath, 'utf8'))) {
    packageCount += 1;
    if (packageIds.has(pkg.id)) errors.push(`Duplicate package id: ${pkg.id}`);
    packageIds.add(pkg.id);
    if (!providerIds.has(pkg.providerId)) errors.push(`${pkg.id}: unknown provider ${pkg.providerId}`);
    for (const channelId of pkg.channelIds ?? []) if (!channelIds.has(channelId)) errors.push(`${pkg.id}: unknown channel ${channelId}`);
  }
}

for (const country of countries) {
  const channelPath = path.join(root, 'data', 'channels', `${country.code}.json`);
  if (!fs.existsSync(channelPath)) continue;
  for (const channel of JSON.parse(fs.readFileSync(channelPath, 'utf8'))) {
    for (const providerId of channel.access?.providerIds ?? []) if (!providerIds.has(providerId)) errors.push(`${channel.id}: unknown access provider ${providerId}`);
    for (const packageId of channel.access?.packageIds ?? []) if (!packageIds.has(packageId)) errors.push(`${channel.id}: unknown access package ${packageId}`);
  }
}

const sourcePath = path.join(root, 'config', 'playback-sources.verified.json');
let sourceCount = 0;
if (!fs.existsSync(sourcePath)) {
  errors.push('config/playback-sources.verified.json is missing');
} else {
  const sourceIds = new Set();
  for (const source of JSON.parse(fs.readFileSync(sourcePath, 'utf8'))) {
    sourceCount += 1;
    if (sourceIds.has(source.id)) errors.push(`Duplicate playback source id: ${source.id}`);
    sourceIds.add(source.id);
    if (!feedIds.has(source.feedId)) errors.push(`${source.id}: unknown feed ${source.feedId}`);
    if (!['verified-official', 'verified-public-authorized', 'subscription-provider'].includes(source.authorization)) errors.push(`${source.id}: source is not approved for activation`);
    if (!['native', 'external', 'handoff'].includes(source.playbackMode)) errors.push(`${source.id}: invalid playbackMode`);
    if (!Array.isArray(source.evidenceUrls) || source.evidenceUrls.length === 0) errors.push(`${source.id}: evidenceUrls required`);
    if (source.authorization === 'subscription-provider' && source.accessModel !== 'subscription' && source.accessModel !== 'ppv') errors.push(`${source.id}: subscription-provider must require subscription or PPV`);
  }
}

const auditPath = path.join(root, 'data', 'source-audit.json');
if (!fs.existsSync(auditPath)) errors.push('data/source-audit.json is missing');
else {
  for (const audit of JSON.parse(fs.readFileSync(auditPath, 'utf8'))) {
    if (['rejected-unverified', 'unknown-quarantined'].includes(audit.status) && audit.urlStored !== false) {
      errors.push(`${audit.channelId}: rejected/unknown audit entries must not retain candidate URLs`);
    }
  }
}

const indexPath = path.join(root, 'data', 'channels', 'index.json');
if (!fs.existsSync(indexPath)) errors.push('data/channels/index.json is missing; run npm run build:index');

if (errors.length) {
  console.error('Catalogue validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Catalogue OK: ${countries.length} countries, ${channelCount} channels, ${feedCount} feeds, ${categories.length} categories, ${providerCount} providers, ${packageCount} packages, ${sourceCount} approved sources.`);
