import assert from "node:assert/strict";
import test from "node:test";
import { approvedHlsSource, playableQueue, nextPlayableIndex } from "../web-pwa/playback-queue.mjs";
const channels=[
  {id:"tr-direct-1",name:"Direct 1",enabled:true,sortOrder:2},
  {id:"tr-provider",name:"Subscription",enabled:true,sortOrder:0},
  {id:"tr-direct-2",name:"Direct 2",enabled:true,sortOrder:1},
  {id:"tr-disabled",name:"Hidden",enabled:false,sortOrder:3}
];
const sources=[
  {feedId:"tr-direct-1-main",enabled:true,requiresAuth:false,authorization:"verified-official",
    playbackMode:"native",type:"hls",url:"https://example.test/1.m3u8",priority:10},
  {feedId:"tr-provider-main",enabled:true,requiresAuth:true,authorization:"subscription-provider",
    playbackMode:"handoff",type:"provider",url:"https://example.test/login",priority:1},
  {feedId:"tr-direct-2-main",enabled:true,requiresAuth:false,authorization:"verified-official",
    playbackMode:"native",type:"hls",url:"https://example.test/2.m3u8",priority:5},
  {feedId:"tr-disabled-main",enabled:true,requiresAuth:false,authorization:"verified-official",
    playbackMode:"native",type:"hls",url:"https://example.test/hidden.m3u8",priority:5},
];
test("only permitted direct HLS is playable",()=>{
  assert.equal(approvedHlsSource(sources,"tr-provider"),null);
  assert.equal(approvedHlsSource(sources,"tr-direct-2")?.type,"hls");
  assert.equal(approvedHlsSource([{...sources[0],url:"http://unsafe.test"}],"tr-direct-1"),null);
  assert.equal(approvedHlsSource([{...sources[0],requiresAuth:true}],"tr-direct-1"),null);
});
test("queue is sorted and excludes providers or hidden channels",()=>{
 const queue=playableQueue(channels,sources);
 assert.deepEqual(queue.map(x=>x.id),["tr-direct-2","tr-direct-1"]);
});
test("forward and back cycle within a country's approved queue",()=>{
 const q=playableQueue(channels,sources);
 assert.equal(nextPlayableIndex(q,"tr-direct-1",1),0);
 assert.equal(nextPlayableIndex(q,"tr-direct-2",-1),1);
 assert.equal(nextPlayableIndex(q,"missing",1),0);
 assert.equal(nextPlayableIndex([], "missing",1),-1);
});
