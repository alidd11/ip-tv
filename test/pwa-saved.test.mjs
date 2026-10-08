import assert from "node:assert/strict";
import test from "node:test";
import {parseSaved,readSaved,toggleSaved,toSavedChannel,writeSaved,SAVED_KEY} from "../web-pwa/saved.mjs";
const record={id:"TRT1.tr",name:"TRT 1",country:"TR",network:"TRT",website:"https://trt.net.tr",
 categories:["general"],feeds:[{id:"main"}],guides:[]};
test("Saved record preserves identity only, not live stream data",()=>{
 const item=toSavedChannel({...record,streams:["http://bad.example"],accessModel:"premium"});
 assert.equal(item.id,"TRT1.tr"); assert.equal(item.feedsCount,1);
 assert.equal("streams" in item,false);assert.equal("accessModel" in item,false);
});
test("toggle add/remove and cross-country list remains stable",()=>{
 const first=toggleSaved([],record);
 assert.equal(first[0].country,"TR");
 const second=toggleSaved(first,{...record,id:"BBCOne.uk",name:"BBC One",country:"GB"});
 assert.deepEqual(second.map(x=>x.country),["GB","TR"]);
 assert.deepEqual(toggleSaved(second,record).map(x=>x.id),["BBCOne.uk"]);
});
test("corrupt storage is ignored and duplicates are removed",()=>{
 assert.deepEqual(parseSaved("not-json"),[]);
 const v=JSON.stringify([toSavedChannel(record),toSavedChannel(record),{id:"!!",name:"Bad",country:"TR",network:"",categories:[]}]);
 assert.equal(parseSaved(v).length,1);
});
test("persistence gracefully handles denied storage",()=>{
 const db=new Map();
 const ok={getItem:key=>db.get(key),setItem:(key,value)=>db.set(key,value)};
 assert.equal(writeSaved(ok,toggleSaved([],record)),true);
 assert.equal(readSaved(ok).length,1);assert.ok(db.has(SAVED_KEY));
 assert.equal(writeSaved({setItem(){throw Error("Denied")}},[]),false);
 assert.deepEqual(readSaved({getItem(){throw Error("Denied")}}),[]);
});
