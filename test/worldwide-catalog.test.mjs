import test from "node:test";
import assert from "node:assert/strict";
import {buildSnapshot,normaliseCountry} from "../scripts/sync-worldwide-catalog.mjs";
const dataset={
  countries:[{code:"UK",name:"United Kingdom"},{code:"US",name:"United States"},{code:"TR",name:"Turkey"}],
  channels:[
    {id:"BBCOne.uk",name:"BBC One",country:"UK",categories:["general"],alt_names:["BBC 1"]},
    {id:"BBCOne.uk",name:"Duplicate",country:"UK"},
    {id:"Premium.us",name:"Premium Sports",country:"US"},
    {id:"Old.uk",name:"Closed",country:"UK",closed:"2023-01-01"},
    {id:"Adult.tr",name:"Adult",country:"TR",is_nsfw:true},
    {id:"Global",name:"International",country:null}
  ],
  feeds:[{channel:"BBCOne.uk",id:"main",is_main:true,languages:["eng"]},{channel:"BBCOne.uk",id:"main"},{channel:"missing",id:"main"}],
  logos:[{channel:"BBCOne.uk",url:"https://example.org/old.svg",in_use:false},{channel:"BBCOne.uk",url:"https://example.org/current.svg",in_use:true}],
  guides:[{channel:"BBCOne.uk",site:"bbc.co.uk",site_id:"bbcone",lang:"en",sources:[{url:"https://example.org/guide.xml"}]}]
};
const snapshot=buildSnapshot(dataset,{generatedAt:"2026-10-08T09:00:00Z"});
test("maps UK to GB and preserves unknown countries",()=>{
 assert.equal(normaliseCountry("UK",new Set(["GB"])),"GB");
 assert.equal(snapshot.shards.get("GB").length,2);
 assert.equal(snapshot.shards.get("ZZ").length,1);
});
test("deduplicates channels while keeping premium identities unclassified",()=>{
 assert.equal(snapshot.manifest.totals.channels,5);
 assert.equal(snapshot.manifest.omitted.duplicates,1);
 assert.equal(snapshot.shards.get("US")[0].accessModel,"unclassified");
});
test("archives adult and closed entries but excludes both from browseable count",()=>{
 assert.equal(snapshot.manifest.totals.visible,3);
 assert.equal(snapshot.manifest.totals.closed,1);
 assert.equal(snapshot.manifest.totals.adult,1);
});
test("preserves feed, guide and logo metadata but no stream or guide endpoints",()=>{
 const channel=snapshot.shards.get("GB").find(x=>x.id==="BBCOne.uk");
 assert.equal(channel.feeds.length,1);
 assert.equal(channel.guides.length,1);
 assert.equal(channel.logoCandidate,"https://example.org/current.svg");
 assert.equal(channel.logoApproved,false);
 assert.ok(!JSON.stringify(channel).includes("guide.xml"));
 assert.equal(snapshot.manifest.containsStreams,false);
});
