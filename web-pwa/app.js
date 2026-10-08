const state = {
  countries: [],
  channels: new Map(),
  sources: [],
  country: "GB",
  selected: null,
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

  state.sources = await json("../config/playback-sources.verified.json");
  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  }
}

function sourceFor(channel) {
  return state.sources
    .filter((source) => source.enabled && source.feedId === channel.id + "-main")
    .sort((a, b) => a.priority - b.priority)[0] || null;
}

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
      render();
    };
    return button;
  }));
}

function heroChannel() {
  const list = channels();
  return list.find((channel) => channel.id === "gb-sky-sports-main-event") || list[0] || null;
}

function renderHero() {
  const channel = heroChannel();
  if (!channel) return;

  const premium = ["subscription", "ppv"].includes(channel.access.model);
  $("heroTitle").textContent = channel.name;
  $("heroMeta").textContent = [channel.network, ...channel.categories].filter(Boolean).join("  •  ");
  $("heroBadges").innerHTML = '<span class="badge live">LIVE</span>' + (premium ? '<span class="badge premium">PREMIUM</span>' : "");
  $("heroPrimary").textContent = premium ? "Open provider" : "Watch live";
  $("heroPrimary").onclick = () => openChannel(channel);
}

function renderSections() {
  const list = channels();
  const sections = [
    ["LIVE", "Live now", list.filter((channel) => channel.access.model !== "subscription").slice(0, 12)],
    ["SPORT", "Premium sport", list.filter((channel) => channel.categories.includes("sports"))],
    ["CINEMA", "Movie channels", list.filter((channel) => channel.categories.includes("movies"))],
  ];

  $("content").replaceChildren(...sections.filter((section) => section[2].length).map((section) => {
    const eyebrow = section[0];
    const title = section[1];
    const rows = section[2];
    const wrapper = document.createElement("section");
    const head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML = '<div><div class="eyebrow">' + eyebrow + '</div><h2>' + title + '</h2></div><small>' + rows.length + ' channels</small>';

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
      '<span class="badge ' + (premium ? "premium" : "live") + '">' + (premium ? "PREMIUM" : "LIVE") + '</span>' +
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
  $("sheetEyebrow").textContent = premium ? "PREMIUM CHANNEL" : "LIVE CHANNEL";
  $("sheetTitle").textContent = channel.name;
  $("sheetMeta").textContent = [
    channel.network,
    channel.categories.map(capitalize).join(" · "),
    source && source.requiresAuth ? "Subscription required" : source ? "Source available" : "Source not yet available",
  ].filter(Boolean).join("  •  ");
  $("sheetAction").textContent = premium ? "Open provider" : "Watch live";
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
      "&source=" + encodeURIComponent(source.url) +
      "&name=" + encodeURIComponent(channel.name);
    return;
  }

  window.open(source.url, "_blank", "noopener,noreferrer");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

document.querySelectorAll("[data-close-sheet]").forEach((node) => node.addEventListener("click", closeSheet));
$("guideButton").onclick = () => alert("Guide parity is the next shared feature.");
$("searchButton").onclick = () => alert("Search parity is the next shared feature.");

load().catch((error) => {
  console.error(error);
  $("heroTitle").textContent = "Catalogue unavailable";
  $("heroMeta").textContent = "Reload when the connection is restored.";
});
