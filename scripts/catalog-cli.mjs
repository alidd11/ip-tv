#!/usr/bin/env node
import { loadCatalog, listChannels, listCountries, searchChannels } from '../src/catalog.mjs';

const catalog = loadCatalog();
const [command = 'help', ...rest] = process.argv.slice(2);
const getArg = (name) => rest.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=') ?? null;

if (command === 'countries') {
  for (const country of listCountries(catalog)) console.log(`${country.flag} ${country.code}  ${country.name}`);
  process.exit(0);
}

if (command === 'channels') {
  const country = (getArg('country') ?? rest[0] ?? '').toUpperCase();
  if (!country) throw new Error('Usage: npm run catalog -- channels --country=GB');
  for (const channel of listChannels(catalog, country)) console.log(`${channel.id}\t${channel.name}\t${channel.categories.join(',')}`);
  process.exit(0);
}

if (command === 'search') {
  const query = getArg('query') ?? rest.filter((item) => !item.startsWith('--')).join(' ');
  const country = getArg('country');
  const category = getArg('category');
  if (!query) throw new Error('Usage: npm run catalog -- search BBC');
  for (const channel of searchChannels(catalog, query, { country, category })) console.log(`${channel.country}\t${channel.id}\t${channel.name}`);
  process.exit(0);
}

console.log(`Commands:\n  countries\n  channels --country=GB\n  search BBC [--country=GB] [--category=news]`);
