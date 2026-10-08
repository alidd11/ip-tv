import test from "node:test";
import assert from "node:assert/strict";
import {filterWorldwide} from "../src/worldwide-catalog.mjs";
const channels = [
  {id:"sky-1",name:"Sky Sports Main Event",aliases:["Main Event"],network:"Sky",categories:["sports"],isClosed:false,isAdult:false},
  {id:"sky-2",name:"Sky Cinema",aliases:[],network:"Sky",categories:["movies"],isClosed:false,isAdult:false},
  {id:"s-3",name:"Sports USA",aliases:["Sports U"],network:"Sport",categories:["sports"],isClosed:false,isAdult:false},
  {id:"old",name:"Sports Old",aliases:[],network:"Sport",categories:["sports"],isClosed:true,isAdult:false},
  {id:"adult",name:"Sports Adult",aliases:[],network:"Sport",categories:["sports"],isClosed:false,isAdult:true},
];
test("default browsing hides closed and adult channels",()=>{
 const result=filterWorldwide(channels,{});
 assert.equal(result.total,3);
 assert.equal(result.channels.length,3);
});
test("exact aliases rank ahead of partial names",()=>{
 const result=filterWorldwide(channels,{query:"Main Event"});
 assert.equal(result.channels[0].id,"sky-1");
});
test("country category filtering and stable pagination",()=>{
 const result=filterWorldwide(channels,{category:"sports",limit:1,offset:1});
 assert.equal(result.total,2);
 assert.equal(result.channels[0].id,"s-3");
 assert.equal(result.hasMore,false);
});
test("invalid paging is rejected",()=>{
 assert.throws(()=>filterWorldwide(channels,{limit:1000}),/limit/);
 assert.throws(()=>filterWorldwide(channels,{offset:-1}),/offset/);
});
