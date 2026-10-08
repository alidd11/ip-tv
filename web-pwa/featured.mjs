// A featured title must have an approved destination. Registry entries
// describe access paths, NOT a guarantee that a live stream is reachable.
export function approvedSource(sources, channelId) {
  return (sources||[])
    .filter(s=>s && s.enabled===true && s.feedId===channelId+"-main" &&
      typeof s.url==="string" && s.url.startsWith("https://") &&
      ["verified-official","verified-public-authorized","subscription-provider"].includes(s.authorization))
    .sort((a,b)=>a.priority-b.priority)[0]||null;
}
export function sourceRank(source) {
  if(!source)return 9;
  if(source.authorization==="subscription-provider"||source.playbackMode==="handoff")return 2;
  if(source.playbackMode==="native"&&source.type==="hls")return 0;
  if(source.playbackMode==="external")return 1;
  return 8;
}
export function chooseFeatured(channels, sources) {
  const enabled=(channels||[]).filter(c=>c.enabled!==false);
  return [...enabled].sort((a,b)=>{
    const rank=sourceRank(approvedSource(sources,a.id))-sourceRank(approvedSource(sources,b.id));
    return rank||((a.sortOrder??999)-(b.sortOrder??999));
  })[0]||null;
}
export function sourceAction(source) {
  if(!source)return "Explore channels";
  if(source.authorization==="subscription-provider"||source.playbackMode==="handoff")return "View subscription";
  if(source.playbackMode==="external")return "Watch on official site";
  if(source.playbackMode==="native"&&source.type==="hls")return "Watch channel";
  return "Explore channels";
}
