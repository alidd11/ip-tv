// Device-local saved channel references. Deliberately NOT account-synchronised.
export const SAVED_KEY = "iptv.savedChannels.v1";
export function toSavedChannel(channel) {
  return {
    id:String(channel.id), name:String(channel.name), country:String(channel.country),
    network: typeof channel.network==="string" ? channel.network : "",
    website:typeof channel.website==="string" && channel.website.startsWith("https://") ? channel.website : "",
    categories:Array.isArray(channel.categories)?channel.categories.filter(x=>typeof x==="string").slice(0,5):[],
    feedsCount:Array.isArray(channel.feeds)?channel.feeds.length:Number(channel.feedsCount)||0,
    guidesCount:Array.isArray(channel.guides)?channel.guides.length:Number(channel.guidesCount)||0
  };
}
function valid(saved) {
  return saved && typeof saved.id==="string" && /^[a-zA-Z0-9_.-]{1,120}$/.test(saved.id) &&
    typeof saved.name==="string" && saved.name.length>0 && saved.name.length<200 &&
    typeof saved.country==="string" && /^[A-Z]{2}$/.test(saved.country) &&
    typeof saved.network==="string" &&
    Array.isArray(saved.categories) && saved.categories.every(x=>typeof x==="string");
}
export function parseSaved(input) {
  try {
    const data=JSON.parse(input);
    if(!Array.isArray(data)) return [];
    const seen=new Set();
    return data.filter(item=>{
      if(!valid(item)||seen.has(item.id))return false;
      seen.add(item.id); return true;
    }).slice(0,500);
  } catch { return []; }
}
export function toggleSaved(items,channel) {
  const record=toSavedChannel(channel);
  if(!valid(record))return items;
  return items.some(x=>x.id===record.id)
    ? items.filter(x=>x.id!==record.id)
    : [record,...items].slice(0,500);
}
export function readSaved(storage) {
  try {return parseSaved(storage.getItem(SAVED_KEY)||"[]");}
  catch {return [];}
}
export function writeSaved(storage,items) {
  try {storage.setItem(SAVED_KEY,JSON.stringify(items));return true;}
  catch {return false;}
}
