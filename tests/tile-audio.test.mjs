import assert from 'node:assert/strict';
let starts=[],stops=0,nodes=[];
globalThis.fetch=async url=>{assert(String(url).endsWith('tile-clack.wav'));return {ok:true,arrayBuffer:async()=>new ArrayBuffer(10)};};
globalThis.AudioContext=class{state='running';destination={};resume(){return Promise.resolve();}decodeAudioData(){return Promise.resolve({duration:.234});}createBufferSource(){const n={connect(){},disconnect(){},start(...args){starts.push(args)},stop(){stops++;this.onended?.();}};nodes.push(n);return n;}};
const audio=await import('../shared/tile-audio.js');await audio.prepareTileClack(true);assert.equal(audio.playTileClack(false),null);
audio.playTileClack(true);audio.playTileClack(true);assert.equal(stops,1);assert.deepEqual(starts,[[],[]]);assert.equal(nodes[1].buffer.duration,.234);nodes[1].onended();await audio.finishTileClack();audio.stopTileClack();
console.log('PASS trimmed WAV decoded/preloaded, original unity connection, no source offset or artificial delay, one active clack, tail completion, Sound OFF');
