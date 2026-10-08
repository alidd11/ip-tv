import {approvedHlsSource, playableQueue, nextPlayableIndex} from "./playback-queue.mjs";

const qs = new URLSearchParams(location.search);
const id = qs.get("channel") ?? "";
const video = document.querySelector("#video");
const message = document.querySelector("#message");
const title = document.querySelector("#title");
const name = document.querySelector("#channelName");
const count = document.querySelector("#channelCount");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
let queue = [], sources = [], current = null;

function failure(text) {
  message.hidden = false;
  message.textContent = text;
  video.hidden = true;
}

function playChannel(channel) {
  current = channel;
  title.textContent = channel.name + " · IP TV";
  name.textContent = channel.name;
  const index=queue.findIndex(x=>x.id===channel.id);
  count.textContent=(index+1) + " / " + queue.length;
  previous.disabled=queue.length<2;
  next.disabled=queue.length<2;
  const source=approvedHlsSource(sources,channel.id);
  video.pause();
  video.removeAttribute("src");
  video.load();
  if(!source) {
    failure("No approved in-app stream is available for this channel.");
    return;
  }
  if(!video.canPlayType("application/vnd.apple.mpegurl")) {
    failure("This browser cannot play live HLS video natively. Try IP TV on iPhone Safari or a supported device.");
    return;
  }
  message.hidden=true;
  video.hidden=false;
  video.src=source.url;
  video.play().catch(()=>{
    // Autoplay policies may require the viewer to tap Play using native controls.
  });
}

function changeChannel(direction) {
  if(queue.length<2 || !current)return;
  const index=nextPlayableIndex(queue,current.id,direction);
  if(index>=0)playChannel(queue[index]);
}

previous.addEventListener("click",()=>changeChannel(-1));
next.addEventListener("click",()=>changeChannel(1));
window.addEventListener("pagehide",()=>video.pause());
video.addEventListener("error",()=>{
  if(current)failure("Playback failed. This stream may be offline or unavailable in your region. Try another channel.");
});
window.addEventListener("keydown",(event)=>{
  if(["PageUp","ArrowUp"].includes(event.key)) {
    event.preventDefault();changeChannel(1);
  } else if(["PageDown","ArrowDown"].includes(event.key)) {
    event.preventDefault();changeChannel(-1);
  }
});

async function start() {
  if(!/^[a-z0-9-]{2,120}$/.test(id)){
    failure("Unknown channel.");
    return;
  }
  try {
    const response=await fetch("../config/playback-sources.verified.json");
    if(!response.ok)throw Error("Registry unavailable");
    sources=await response.json();
    // Only three small curated launch country files are read to resolve IDs.
    const countriesResponse=await fetch("../data/countries.json");
    if(!countriesResponse.ok)throw Error("Country catalogue unavailable");
    const countries=(await countriesResponse.json()).filter(c=>c.enabled);
    const countryLists=await Promise.all(countries.map(async country=>{
      const res=await fetch("../data/channels/"+country.code+".json");
      if(!res.ok)throw Error("Channel catalogue unavailable");
      return await res.json();
    }));
    const all=countryLists.flat();
    const requested=all.find(c=>c.id===id && c.enabled);
    if(!requested){failure("This channel isn't available in the curated live catalogue.");return;}
    queue=playableQueue(all.filter(c=>c.country===requested.country),sources);
    const selected=queue.find(c=>c.id===requested.id);
    if(!selected){failure("No approved direct stream is available. Open the broadcaster through its official service.");return;}
    playChannel(selected);
  }catch(error){
    console.error(error);
    failure("Unable to load the approved live TV catalogue. Please try again.");
  }
}

start();
