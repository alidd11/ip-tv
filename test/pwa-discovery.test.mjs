import test from "node:test";
import assert from "node:assert/strict";
import {filterDiscovery,visibleCount,directoryCountryOptions} from "../web-pwa/discovery.mjs";
const records=[
{id:"abc",name:"ABC World",aliases:["World News"],network:"Global",categories:["news"],isAdult:false,isClosed:false},
{id:"sports",name:"Sports Plus",aliases:["Stadium"],network:"A Sports",categories:["sports"],isAdult:false,isClosed:false},
{id:"defunct",name:"Old News",categories:["news"],isAdult:false,isClosed:true},
{id:"adult",name:"Restricted",categories:["news"],isAdult:true,isClosed:false}
];
test("discovery hides archived and restricted identities by default",()=>{
 assert.equal(visibleCount(records),2);
 assert.equal(filterDiscovery(records).length,2);
});
test("matches aliases and category without using streams",()=>{
 assert.deepEqual(filterDiscovery(records,{query:"stadium",category:"sports"}).map(x=>x.id),["sports"]);
 assert.equal(visibleCount(records,{category:"news"}),1);
});
test("supports safe paging and country listing",()=>{
 assert.deepEqual(filterDiscovery(records,{limit:1,offset:1}).map(x=>x.id),["sports"]);
 assert.deepEqual(directoryCountryOptions({countries:[{code:"AD",visible:0},{code:"GB",visible:2},{code:"TR",visible:1}]}).map(x=>x.code),["GB","TR"]);
});
