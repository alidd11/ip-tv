import test from 'node:test';
import assert from 'node:assert/strict';
import { getChannelFeeds, getPlaybackSources, listChannels, listCountries, loadCatalog, searchChannels } from '../src/catalog.mjs';

const catalog = loadCatalog();

test('only curated launch countries are enabled', () => {
  assert.deepEqual(listCountries(catalog).map((country) => country.code), ['GB', 'TR', 'US']);
});

test('country channel lists are populated', () => {
  assert.ok(listChannels(catalog, 'GB').length >= 15);
  assert.ok(listChannels(catalog, 'TR').length >= 10);
  assert.ok(listChannels(catalog, 'US').length >= 10);
});

test('aliases participate in search', () => {
  const results = searchChannels(catalog, 'MSNBC');
  assert.equal(results[0]?.id, 'us-ms-now');
});

test('every enabled launch channel has a main feed', () => {
  for (const channel of catalog.channels.filter((channel) => channel.enabled)) {
    const feeds = getChannelFeeds(catalog, channel.id);
    assert.ok(feeds.some((feed) => feed.isMain), `${channel.id} is missing a main feed`);
  }
});

test('public channel metadata never contains stream URLs', () => {
  for (const channel of catalog.channels) {
    assert.equal(Object.hasOwn(channel, 'sources'), false, `${channel.id} leaked sources into catalogue metadata`);
  }
});

test('premium UK channels are catalogued without unverified media URLs', () => {
  const premium = searchChannels(catalog, 'Sky Sports', { country: 'GB', accessModel: 'subscription' });
  assert.ok(premium.length >= 8);
  assert.ok(premium.every((channel) => channel.access.model === 'subscription'));
});

test('approved playback sources are provenance-gated', () => {
  for (const source of catalog.playbackSources) {
    assert.ok(['verified-official', 'verified-public-authorized', 'subscription-provider'].includes(source.authorization));
    assert.ok(source.evidenceUrls.length > 0);
  }
});

test('subscription channels use official provider handoff when no public media feed is approved', () => {
  const sources = getPlaybackSources(catalog, 'gb-tnt-sports-1');
  assert.ok(sources.length > 0);
  assert.equal(sources[0].authorization, 'subscription-provider');
  assert.equal(sources[0].playbackMode, 'handoff');
  assert.equal(sources[0].requiresAuth, true);
});
