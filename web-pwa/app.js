import {approvedSource,chooseFeatured,sourceAction} from "./featured.mjs";
import {readSaved,writeSaved,toggleSaved} from "./saved.mjs";
import {filterDiscovery,visibleCount,directoryCountryOptions} from "./discovery.mjs";
const state = {
  countries: [],
  channels: new Map(),
  sources: [],
  country: "GB",
  selected: null,
  worldwideManifest: null,
  worldwideCache: new Map(),
  worldwideCountry: 'GB',
  worldwideCategory: '',
  worldwideQuery: '',
  worldwideOffset: 0,
  worldwideRequest: 0,
  saved: [],
};

const $ = (id) => document.getElementById(id);

async function json(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(path + ": " + response.status);
  return response.json();
}

async function load() {
  const countries = await json("../data/countries.json");
  state.countries = countries.filter((country) => country.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  await Promise.all(state.countries.map(async (country) => {
    state.channels.set(country.code, await json("../data/channels/" + country.code + ".json"));
  }));

  state.saved = readSaved(window.localStorage);
  state.sources = await json("../config/playback-sources.verified.json");
  state.worldwideManifest = await json("../data/worldwide/manifest.json");
  render();
  initialiseDiscovery();
  renderSaved();
  await renderDirectory();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  }
}

function sourceFor(channel) { return approvedSource(state.sources, channel.id); }

function channels() {
  return (state.channels.get(state.country) || []).filter((channel) => channel.enabled);
}

function render() {
  renderCountries();
  renderHero();
  renderSections();
}

function renderCountries() {
  $("countryRow").replaceChildren(...state.countries.map((country) => {
    const button = document.createElement("button");
    button.className = "chip" + (country.code === state.country ? " active" : "");
    button.textContent = country.flag + " " + country.name;
    button.onclick = () => {
      state.country = country.code;
      state.worldwideCountry = country.code;
      render();
      $("directoryCountry").value = country.code;
      renderDirectory();
    };
    return button;
  }));
}

function heroChannel() {
  const list = channels();
  return chooseFeatured(list,state.sources);
}

function renderHero() {
  const channel = heroChannel();
  if (!channel) return;

  const premium = ["subscription", "ppv"].includes(channel.access.model);
  $("heroEyebrow").textContent = sourceRankLabel(sourceFor(channel));
  $("heroArtNetwork").textContent = channel.network || channel.shortName || "IP TV";
  $("heroTitle").textContent = channel.name;
  $("heroMeta").textContent = [channel.network, ...channel.categories].filter(Boolean).join("  •  ");
  const source=sourceFor(channel);
  $("heroBadges").innerHTML = (source && source.authorization!=="subscription-provider" ?
    '<span class="badge live">WATCH OPTION</span>' : "")+
    (premium ? '<span class="badge premium">SUBSCRIPTION</span>' : "");
  $("heroPrimary").textContent = sourceAction(source);
  $("heroPrimary").onclick = () => source ? openChannel(channel) : openSection("explore");
}

function renderSections() {
  const list = channels();
  const sections = [
    ["WATCH", "Official viewing options", list.filter(channel=>{
      const s=sourceFor(channel);
      return s && s.authorization!=="subscription-provider";
    })],
    ["SPORT", "Premium sports providers", list.filter((channel) => channel.categories.includes("sports") && channel.access.model==="subscription")],
    ["EXPLORE", "More channels to discover", list.filter(channel=>!sourceFor(channel)).slice(0,12)]
  ];

  $("content").replaceChildren(...sections.filter((section) => section[2].length).map((section) => {
    const eyebrow = section[0];
    const title = section[1];
    const rows = section[2];
    const wrapper = document.createElement("section");
    const head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML = '<div><div class="eyebrow">' + eyebrow + '</div><h2>' + title + '</h2></div><small>' + rows.length + (rows.length===1?' channel':' channels') + '</small>';

    const rail = document.createElement("div");
    rail.className = "rail";
    rail.append(...rows.map(card));

    wrapper.append(head, rail);
    return wrapper;
  }));
}

function card(channel) {
  const premium = ["subscription", "ppv"].includes(channel.access.model);
  const button = document.createElement("button");
  button.className = "channel-card" + (premium ? " premium" : "");
  button.innerHTML =
    '<div class="card-top">' +
      '<span class="network">' + (channel.network || channel.country).toUpperCase() + '</span>' +
      '<span class="badge ' + (premium ? "premium" : "live") + '">' +
        (premium ? "SUBSCRIPTION" : sourceFor(channel) ? "OFFICIAL" : "LISTED") + '</span>' +
    '</div>' +
    '<div><div class="card-title">' + channel.shortName + '</div>' +
    '<div class="card-category">' + (channel.categories[0] || "Live TV") + '</div></div>';
  button.onclick = () => openSheet(channel);
  return button;
}

function openSheet(channel) {
  state.selected = channel;
  const source = sourceFor(channel);
  const premium = ["subscription", "ppv"].includes(channel.access.model);
  $("sheetSave").hidden = true;
  $("sheetEyebrow").textContent = premium ? "PREMIUM CHANNEL" : "LIVE CHANNEL";
  $("sheetTitle").textContent = channel.name;
  $("sheetMeta").textContent = [
    channel.network,
    channel.categories.map(capitalize).join(" · "),
    source && source.requiresAuth ? "Subscription required" : source ? "Source available" : "Source not yet available",
  ].filter(Boolean).join("  •  ");
  $("sheetAction").textContent = source ? (premium ? "Open provider" : "Watch live") : "Unavailable";
  $("sheetAction").disabled = !source;
  $("sheetAction").onclick = () => openChannel(channel);
  $("sheet").classList.remove("hidden");
}

function closeSheet() {
  $("sheet").classList.add("hidden");
  state.selected = null;
}

function openChannel(channel) {
  const source = sourceFor(channel);
  if (!source) {
    openSheet(channel);
    $("sheetMeta").textContent = "This channel is catalogued, but there is no approved playback source yet.";
    return;
  }

  if (source.playbackMode === "native" && source.type === "hls") {
    location.href = "./player.html?channel=" + encodeURIComponent(channel.id) +
      "&name=" + encodeURIComponent(channel.name);
    return;
  }

  window.open(source.url, "_blank", "noopener,noreferrer");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

document.querySelectorAll("[data-close-sheet]").forEach((node) => node.addEventListener("click", closeSheet));
$("guideButton").onclick = () => openSection("explore");
document.querySelectorAll(".tab[data-section]").forEach((button)=>{
  button.onclick=()=>openSection(button.dataset.section);
});
function openSection(name) {
  const target=name==="home"?document.body:
    name==="live"?$("content"):name==="saved"?$("saved"):$("directory");
  target.scrollIntoView({behavior:"smooth",block:"start"});
  document.querySelectorAll(".tab[data-section]").forEach(button=>{
    const active=button.dataset.section===name;
    button.classList.toggle("active",active);
    if(active)button.setAttribute("aria-current","page");
    else button.removeAttribute("aria-current");
  });
}
$("searchButton").onclick = () => alert("Search parity is the next shared feature.");

load().catch((error) => {
  console.error(error);
  $("heroTitle").textContent = "Catalogue unavailable";
  $("heroMeta").textContent = "Reload when the connection is restored.";
});


function initialiseDiscovery() {
  const entries=directoryCountryOptions(state.worldwideManifest);
  const selector=$("directoryCountry");
  selector.replaceChildren(...entries.map(country=>{
    const opt=document.createElement("option");
    opt.value=country.code;
    opt.textContent=country.name+" · "+country.visible.toLocaleString();
    return opt;
  }));
  selector.value=state.worldwideCountry;
  $("globalCount").textContent=state.worldwideManifest.totals.visible.toLocaleString()+" listings";

  selector.onchange=()=>{
    state.worldwideCountry=selector.value;
    state.worldwideCategory="";
    $("directoryCategory").value="";
    renderDirectory();
  };
  $("directorySearch").oninput=()=>{
    state.worldwideQuery=$("directorySearch").value;
    state.worldwideOffset=0;
    renderDirectory();
  };
  $("directoryCategory").onchange=()=>{
    state.worldwideCategory=$("directoryCategory").value;
    state.worldwideOffset=0;
    renderDirectory();
  };
  $("directoryMore").onclick=()=>{
    state.worldwideOffset+=48;
    renderDirectory({append:true});
  };
  $("searchButton").onclick=()=>{
    $("directory").scrollIntoView({behavior:"smooth"});
    $("directorySearch").focus();
  };
}
async function worldwideChannels(country) {
  if(state.worldwideCache.has(country))return state.worldwideCache.get(country);
  const rows=await json("../data/worldwide/countries/"+country+".json");
  state.worldwideCache.set(country,rows);
  return rows;
}
async function renderDirectory({append=false}={}) {
  const request=++state.worldwideRequest;
  const country=state.worldwideCountry;
  const query=state.worldwideQuery;
  const category=state.worldwideCategory;
  const offset=state.worldwideOffset;
  $("directoryStatus").textContent="Loading channel directory…";
  if(!append)$("directoryResults").replaceChildren();

  try {
    const rows=await worldwideChannels(country);
    if(request!==state.worldwideRequest)return;

    const categories=new Set(rows.filter(x=>!x.isClosed&&!x.isAdult).flatMap(x=>x.categories||[]));
    const select=$("directoryCategory");
    const previous=select.value;
    select.replaceChildren(new Option("All categories",""),...[...categories].sort().map(c=>new Option(c[0].toUpperCase()+c.slice(1),c)));
    select.value=previous&&categories.has(previous)?previous:"";
    if(select.value!==category) state.worldwideCategory=select.value;

    const options={query,category:state.worldwideCategory,offset,limit:48};
    const total=visibleCount(rows,options);
    const matches=filterDiscovery(rows,options);
    const nodes=matches.map(directoryCard);
    if(append)$("directoryResults").append(...nodes);
    else $("directoryResults").replaceChildren(...nodes);

    const name=state.worldwideManifest.countries.find(c=>c.code===country)?.name||country;
    $("directoryStatus").textContent=total.toLocaleString()+" "+(total===1?"channel":"channels")+" in "+name+
      (query?" matching “"+query+"”":"");
    $("directoryMore").classList.toggle("hidden",offset+matches.length>=total||matches.length===0);
    if(total===0)$("directoryResults").textContent="No matching channels in this country.";
  } catch(error) {
    if(request===state.worldwideRequest){
      $("directoryStatus").textContent="Channel data unavailable. Please try another country or reload.";
      $("directoryMore").classList.add("hidden");
      console.error(error);
    }
  }
}
function directoryCard(record) {
  const button=document.createElement("button");
  button.className="directory-card";
  const upper=document.createElement("span");
  upper.className="directory-card-top";
  upper.textContent=(record.network||record.country).toUpperCase();
  const title=document.createElement("span");
  title.className="directory-card-name";
  title.textContent=record.name;
  const detail=document.createElement("span");
  detail.className="directory-card-meta";
  detail.textContent=(record.categories||[]).slice(0,2).join(" · ")+" · "+
    (record.feeds?.length||0)+" "+((record.feeds?.length||0)===1?"feed":"feeds");
  if(state.saved.some(x=>x.id===record.id)) {
    const star=document.createElement("span");
    star.textContent="★"; star.className="saved-indicator";
    upper.append(star);
  }
  button.append(upper,title,detail);
  button.onclick=()=>openDirectorySheet(record);
  return button;
}
function openDirectorySheet(record) {
  state.selected = record;
  const saveButton=$("sheetSave");
  saveButton.hidden=false;
  const refreshSaveLabel=()=>{saveButton.textContent=state.saved.some(x=>x.id===record.id)?"★ Remove from saved":"☆ Save channel";};
  refreshSaveLabel();
  saveButton.onclick=()=>{
    state.saved=toggleSaved(state.saved,record);
    if(!writeSaved(window.localStorage,state.saved)) {
      $("directoryStatus").textContent="Unable to save permanently in this browser.";
    }
    refreshSaveLabel();
    renderSaved();
    renderDirectory();
  };
  $("sheetEyebrow").textContent="CHANNEL DIRECTORY";
  $("sheetTitle").textContent=record.name;
  $("sheetMeta").textContent=[
    record.network,
    "Country: "+record.country,
    (record.categories||[]).join(" · "),
    (record.feeds?.length||0)+" broadcast feed variants",
    (record.guides?.length||0)+" guide references",
    "Playback availability not verified"
  ].filter(Boolean).join("  •  ");
  const button=$("sheetAction");
  button.textContent=record.website?"Visit broadcaster website":"No verified stream";
  button.disabled=!record.website;
  button.onclick=()=>{
    if(record.website&&/^https:\/\//i.test(record.website))
      window.open(record.website,"_blank","noopener,noreferrer");
  };
  $("sheet").classList.remove("hidden");
}

function renderSaved() {
  $("savedCount").textContent=state.saved.length+" saved";
  $("savedEmpty").hidden=state.saved.length>0;
  $("savedResults").replaceChildren(...state.saved.map(saved=>{
    const button=document.createElement("button");
    button.className="directory-card saved-card";
    const country=document.createElement("span");
    country.className="directory-card-top";
    country.textContent=saved.country+" · SAVED";
    const name=document.createElement("span");
    name.className="directory-card-name";
    name.textContent=saved.name;
    const subtitle=document.createElement("span");
    subtitle.className="directory-card-meta";
    subtitle.textContent=saved.network||"Channel directory";
    button.append(country,name,subtitle);
    button.onclick=()=>openDirectorySheet({
      ...saved, feeds:Array.from({length:saved.feedsCount||0},()=>({})),
      guides:Array.from({length:saved.guidesCount||0},()=>({}))
    });
    return button;
  }));
}

function sourceRankLabel(source) {
  if(!source)return "CHANNEL DIRECTORY";
  if(source.authorization==="subscription-provider")return "PREMIUM NETWORK";
  if(source.playbackMode==="external")return "WATCH ON THE OFFICIAL SITE";
  return "LIVE TV · OFFICIAL STREAM";
}
