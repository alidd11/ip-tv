import fs from "node:fs/promises";
import path from "node:path";

const output=path.resolve("dist");
await fs.rm(output,{recursive:true,force:true});
await fs.mkdir(path.join(output,"data"),{recursive:true});
await fs.mkdir(path.join(output,"config"),{recursive:true});

await fs.cp("web-pwa",path.join(output,"web-pwa"),{recursive:true});
await fs.cp("data/channels",path.join(output,"data/channels"),{recursive:true});
await fs.copyFile("data/countries.json",path.join(output,"data/countries.json"));
await fs.cp("data/worldwide",path.join(output,"data/worldwide"),{recursive:true});
await fs.copyFile("config/playback-sources.verified.json",
  path.join(output,"config/playback-sources.verified.json"));

await fs.writeFile(path.join(output,"index.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta http-equiv="refresh" content="0;url=./web-pwa/">'+
  '<title>IP TV</title></head><body>'+
  '<a href="./web-pwa/">Open IP TV</a></body></html>\n');

const manifest=JSON.parse(await fs.readFile(path.join(output,"data/worldwide/manifest.json"),"utf8"));
if(manifest.totals.channels<30000)throw Error("Worldwide catalogue missing from PWA build");
const files=await fs.readdir(path.join(output,"data/worldwide/countries"));
if(files.length<200)throw Error("Not enough worldwide country shards");
console.log("PWA bundle ready: "+files.length+" worldwide shards, "+
  manifest.totals.channels+" channel records; only public runtime data copied.");
