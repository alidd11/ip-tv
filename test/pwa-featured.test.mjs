import test from "node:test";
import assert from "node:assert/strict";
import {approvedSource,chooseFeatured,sourceAction} from "../web-pwa/featured.mjs";
const channels=[
{id:"premium",name:"Provider Only",enabled:true,sortOrder:1},
{id:"web",name:"Official Site",enabled:true,sortOrder:2},
{id:"native",name:"Direct",enabled:true,sortOrder:3},
{id:"missing",name:"Unknown",enabled:true,sortOrder:0}
];
const sources=[
{feedId:"premium-main",enabled:true,priority:1,url:"https://provider.example",authorization:"subscription-provider",playbackMode:"handoff"},
{feedId:"web-main",enabled:true,priority:1,url:"https://official.example/live",authorization:"verified-official",playbackMode:"external"},
{feedId:"native-main",enabled:true,priority:1,url:"https://official.example/hls.m3u8",authorization:"verified-official",type:"hls",playbackMode:"native"}
];
test("prefer direct approved viewing to subscription landing page",()=>{
 assert.equal(chooseFeatured(channels,sources).id,"native");
 assert.equal(chooseFeatured(channels.filter(c=>c.id!=="native"),sources).id,"web");
});
test("missing/inactive/unapproved source never beats an approved one",()=>{
 assert.equal(approvedSource([{...sources[0],enabled:false}],"premium"),null);
 assert.equal(approvedSource([{...sources[0],url:"http://unsafe.example"}],"premium"),null);
 assert.equal(approvedSource([{...sources[0],authorization:"unknown"}],"premium"),null);
 assert.equal(chooseFeatured(channels,[]).id,"missing");
});
test("labels correctly distinguish website, stream and provider",()=>{
 assert.equal(sourceAction(sources[0]),"View subscription");
 assert.equal(sourceAction(sources[1]),"Watch on official site");
 assert.equal(sourceAction(sources[2]),"Watch channel");
 assert.equal(sourceAction(null),"Explore channels");
});
