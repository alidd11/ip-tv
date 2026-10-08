import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const asText = (x) => typeof x === "string" ? x.trim() : "";
const asArray = (x) => Array.isArray(x) ? x : [];
const unique = (x) => [...new Set(x.filter(Boolean))];
export const normaliseCountry = (raw, allowed) => {
  const code = asText(raw).toUpperCase();
  const normal = code === "UK" ? "GB" : code;
  return /^[A-Z]{2}$/.test(normal) && allowed.has(normal) ? normal : "ZZ";
};

export function buildSnapshot(data, { generatedAt = new Date().toISOString(), localCountries = [] } = {}) {
  if (!Array.isArray(data.channels) || !data.channels.length) throw Error("Channel dataset empty");
  const allowed = new Set([...asArray(data.countries), ...localCountries].map(x => x.code));
  allowed.delete("UK"); allowed.add("GB");
  const byId = new Map(), groups = new Map();
  const omitted = { duplicates:0, invalid:0, orphanFeeds:0, orphanGuides:0, orphanLogos:0 };
  for (const item of data.channels) {
    if (!asText(item?.id) || !asText(item?.name)) { omitted.invalid++; continue; }
    if (byId.has(item.id)) { omitted.duplicates++; continue; }
    const country = normaliseCountry(item.country, allowed);
    const row = {
      id:item.id, name:item.name, aliases:unique(asArray(item.alt_names).map(asText)),
      country, categories:unique(asArray(item.categories).map(asText)),
      network:asText(item.network)||null, owners:unique(asArray(item.owners).map(asText)),
      website:asText(item.website)||null, launched:asText(item.launched)||null,
      closed:asText(item.closed)||null, replacedBy:asText(item.replaced_by)||null,
      isAdult:item.is_nsfw===true, isClosed:!!asText(item.closed),
      accessModel:"unclassified", upstream:"iptv-org/database",
      logoCandidate:null, logoApproved:false, feeds:[], guides:[]
    };
    byId.set(item.id,row);
    if (!groups.has(country)) groups.set(country,[]);
    groups.get(country).push(row);
  }
  const feedKeys = new Set();
  for (const feed of asArray(data.feeds)) {
    const row = byId.get(feed?.channel);
    if (!row) { omitted.orphanFeeds++; continue; }
    const id = asText(feed.id)||"main";
    const key=row.id+"::"+id;
    if (feedKeys.has(key)) continue;
    feedKeys.add(key);
    row.feeds.push({
      id,name:asText(feed.name)||"Main",aliases:unique(asArray(feed.alt_names).map(asText)),
      main:feed.is_main===true,areas:unique(asArray(feed.broadcast_area).map(asText)),
      timezones:unique(asArray(feed.timezones).map(asText)),
      languages:unique(asArray(feed.languages).map(asText)),format:asText(feed.format)||null
    });
  }
  for (const row of byId.values()) row.feeds.sort((a,b)=>Number(b.main)-Number(a.main)||a.id.localeCompare(b.id));
  const logoCandidates = new Map();
  for (const logo of asArray(data.logos)) {
    const row=byId.get(logo?.channel);
    if (!row) { omitted.orphanLogos++; continue; }
    const url=asText(logo.url);
    if (!/^https?:\/\//i.test(url)) continue;
    const score=(logo.in_use===true?100:0)+(!asText(logo.feed)?10:0)+(asArray(logo.tags).includes("horizontal")?1:0);
    if (!logoCandidates.has(row.id)||score>logoCandidates.get(row.id).score) logoCandidates.set(row.id,{url,score});
  }
  for (const [id,logo] of logoCandidates) byId.get(id).logoCandidate=logo.url;
  const guideKeys=new Set();
  for (const guide of asArray(data.guides)) {
    const row=byId.get(guide?.channel);
    if (!row) { omitted.orphanGuides++; continue; }
    const site=asText(guide.site),siteId=asText(guide.site_id);
    if (!site||!siteId) continue;
    const feed=asText(guide.feed)||null,language=asText(guide.lang)||null;
    const key=[row.id,feed,site,siteId,language].join("|");
    if (guideKeys.has(key)) continue;
    guideKeys.add(key);
    row.guides.push({site,siteId,feed,language});
  }
  const localNames = new Map([...asArray(data.countries),...localCountries].map(x=>[normaliseCountry(x.code,allowed),x.name]));
  localNames.set("ZZ","Unassigned / International");
  const stats=[], shards=new Map();
  const total={channels:0,visible:0,closed:0,adult:0,feeds:0,guides:0,logoCandidates:0};
  for (const [code,rows] of [...groups].sort((a,b)=>a[0].localeCompare(b[0]))) {
    rows.sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
    const count={code,name:localNames.get(code)||code,total:rows.length,visible:0,closed:0,adult:0,feeds:0,guides:0};
    for (const row of rows) {
      if (row.isClosed) count.closed++;
      if (row.isAdult) count.adult++;
      if (!row.isClosed && !row.isAdult) count.visible++;
      count.feeds+=row.feeds.length;
      count.guides+=row.guides.length;
      total.logoCandidates+=row.logoCandidate?1:0;
    }
    total.channels+=count.total;
    total.visible+=count.visible;
    total.closed+=count.closed;
    total.adult+=count.adult;
    total.feeds+=count.feeds;
    total.guides+=count.guides;
    shards.set(code,rows);
    stats.push(count);
  }
  return {
    manifest:{schema:1,source:"iptv-org/database",license:"Unlicense",generatedAt,
      containsStreams:false,streamAuthorisation:"none",totals:total,omitted,countries:stats},
    shards
  };
}

export async function writeSnapshot(snapshot, destination) {
  const temp=destination+"-"+process.pid+".tmp";
  await fs.rm(temp,{force:true,recursive:true});
  await fs.mkdir(path.join(temp,"countries"),{recursive:true});
  try {
    for (const [code,records] of snapshot.shards) {
      await fs.writeFile(path.join(temp,"countries",code+".json"),JSON.stringify(records)+"\n");
    }
    await fs.writeFile(path.join(temp,"manifest.json"),JSON.stringify(snapshot.manifest,null,2)+"\n");
    await fs.rm(destination,{force:true,recursive:true});
    await fs.rename(temp,destination);
  } catch (error) { await fs.rm(temp,{force:true,recursive:true}); throw error; }
}

async function main() {
  const option=(name,def)=>process.argv.find(x=>x.startsWith("--"+name+"="))?.slice(name.length+3)||def;
  const api=option("api","https://iptv-org.github.io/api").replace(/\/+$/,"");
  const destination=path.resolve(option("out","data/worldwide"));
  const minimum=Number(option("min","10000"));
  const endpoints=["channels","feeds","logos","guides","countries"];
  const result=await Promise.all(endpoints.map(async x=>{
    const response=await fetch(api+"/"+x+".json",{
      headers:{"Accept":"application/json","User-Agent":"ip-tv-worldwide-metadata/0.1"},
      signal:AbortSignal.timeout(120000)
    });
    if(!response.ok) throw Error(x+" HTTP "+response.status);
    const data=await response.json();
    if(!Array.isArray(data)) throw Error(x+" expected array");
    return data;
  }));
  const upstream=Object.fromEntries(endpoints.map((x,i)=>[x,result[i]]));
  if(upstream.channels.length<minimum) throw Error("Upstream count below safety minimum "+minimum);
  const local=JSON.parse(await fs.readFile("data/countries.json","utf8"));
  const snapshot=buildSnapshot(upstream,{localCountries:local});
  if(snapshot.manifest.totals.channels<minimum) throw Error("Deduplicated count below safety minimum");
  await writeSnapshot(snapshot,destination);
  console.log("WORLDWIDE_IMPORT "+JSON.stringify({
    totals:snapshot.manifest.totals,countries:snapshot.manifest.countries.length,omitted:snapshot.manifest.omitted
  }));
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  main().catch(e=>{console.error(e);process.exitCode=1;});
}
