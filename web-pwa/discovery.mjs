export function filterDiscovery(records, {query="",category="",limit=48,offset=0}={}) {
  const needle=query.trim().toLocaleLowerCase();
  return records
    .filter(r=>!r.isAdult&&!r.isClosed)
    .filter(r=>!category||r.categories?.includes(category))
    .map(r=>{
      if(!needle)return {record:r,score:1};
      const name=r.name.toLocaleLowerCase();
      const aliases=(r.aliases||[]).map(x=>x.toLocaleLowerCase());
      const network=(r.network||"").toLocaleLowerCase();
      const score=name===needle?100:aliases.includes(needle)?90:name.startsWith(needle)?65:
        name.includes(needle)?35:aliases.some(x=>x.includes(needle))?30:network.includes(needle)?10:0;
      return {record:r,score};
    })
    .filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score||a.record.name.localeCompare(b.record.name)||a.record.id.localeCompare(b.record.id))
    .slice(offset,offset+limit)
    .map(x=>x.record);
}
export function visibleCount(records,{query="",category=""}={}) {
  const needle=query.trim().toLocaleLowerCase();
  return records.filter(r=>!r.isClosed&&!r.isAdult)
    .filter(r=>!category||r.categories?.includes(category))
    .filter(r=>!needle||[r.name,r.network,...(r.aliases||[])].some(x=>x?.toLocaleLowerCase().includes(needle))).length;
}
export function directoryCountryOptions(manifest) {
  return (manifest.countries||[]).filter(c=>c.visible>0).sort((a,b)=>b.visible-a.visible||a.name.localeCompare(b.name));
}
