import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("config/parity.json", "utf8"));
const allowed = new Set(["implemented", "planned", "not-applicable"]);
const errors = [];

if (!Array.isArray(manifest.clients) || manifest.clients.length < 2) {
  errors.push("parity manifest must define at least two clients");
}

for (const capability of manifest.capabilities ?? []) {
  const states = [];
  for (const client of manifest.clients) {
    const status = capability.clients?.[client];
    if (!allowed.has(status)) {
      errors.push(`${capability.id}: ${client} has invalid or missing status "${status}"`);
      continue;
    }
    if (status !== "not-applicable") states.push(status);
  }

  if (capability.parityRequired) {
    if (states.length !== manifest.clients.length) {
      errors.push(`${capability.id}: parity-required capabilities cannot be not-applicable`);
    }
    if (new Set(states).size > 1) {
      errors.push(`${capability.id}: parity drift detected (${manifest.clients.map((c) => `${c}=${capability.clients[c]}`).join(", ")})`);
    }
  } else if (Object.values(capability.clients).includes("not-applicable") && !capability.reason) {
    errors.push(`${capability.id}: platform exception requires a reason`);
  }
}

if (errors.length) {
  console.error("Client parity validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const required = manifest.capabilities.filter((item) => item.parityRequired);
const implemented = required.filter((item) =>
  manifest.clients.every((client) => item.clients[client] === "implemented")
);
console.log(`Client parity OK: ${implemented.length}/${required.length} parity-required capabilities implemented across all ${manifest.clients.length} clients; remaining capabilities are aligned as planned.`);
