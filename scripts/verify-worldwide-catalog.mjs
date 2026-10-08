import fs from "node:fs";
import path from "node:path";
const directory=path.resolve(process.argv[2]||"data/worldwide");
const manifest=JSON.parse(fs.readFileSync(path.join(directory,"manifest.json"),"utf8"));
if(manifest.containsStreams!==false) throw Error("Metadata-only invariant violated");
const seen=new Set(), totals={channels:0,visible:0,closed:0,adult:0,feeds:0,guides:0,logoCandidates:0};
for(const country of manifest.countries){
  const rows=JSON.parse(fs.readFileSync(path.join(directory,"countries",country.code+".json"),"utf8"));
  if(rows.length!==country.total) throw Error(country.code+" count mismatch");
  for(const item of rows){
    if(!item.id||!item.name||item.country!==country.code||seen.has(item.id)) throw Error("Invalid or duplicate "+item.id);
    seen.add(item.id);
    totals.channels++;
    totals.visible+=!item.isClosed&&!item.isAdult?1:0;
    totals.closed+=item.isClosed?1:0;
    totals.adult+=item.isAdult?1:0;
    totals.feeds+=item.feeds.length;
    totals.guides+=item.guides.length;
    totals.logoCandidates+=item.logoCandidate?1:0;
    if("streams" in item||"playbackSources" in item||"streamUrl" in item) throw Error(item.id+" unexpected stream data");
  }
}
for(const key of Object.keys(totals)) if(totals[key]!==manifest.totals[key]) throw Error(key+" mismatch");
console.log("WORLDWIDE_VERIFIED "+JSON.stringify(totals));
