// All playback options resolve through the approved provider registry.
// An indexed broadcaster or subscription handoff does NOT join the zap queue.
export function approvedHlsSource(sources, channelId) {
  return (sources || []).filter(source =>
    source?.enabled === true && source.requiresAuth === false &&
    source.feedId === channelId + "-main" &&
    source.type === "hls" && source.playbackMode === "native" &&
    ["verified-official", "verified-public-authorized"].includes(source.authorization) &&
    typeof source.url === "string" && source.url.startsWith("https://")
  ).sort((a,b)=>a.priority-b.priority)[0] ?? null;
}

export function playableQueue(channels, sources) {
  return (channels || []).filter(channel =>
    channel?.enabled !== false && approvedHlsSource(sources, channel.id) !== null
  ).sort((a,b)=>(a.sortOrder??999)-(b.sortOrder??999)||
    a.name.localeCompare(b.name));
}

export function nextPlayableIndex(channels, currentId, direction) {
  if (!channels.length) return -1;
  const idx=channels.findIndex(x=>x.id===currentId);
  if (idx<0) return 0;
  return (idx+direction+channels.length)%channels.length;
}
