import assert from 'node:assert/strict';
import {adaptiveBoard} from '../games/board-race/adaptive-geometry.js';
import {colorOrder,spacePaint} from '../games/board-race/track-palette.js';
import {themes} from '../shared/themes.js';
let cases=0;
for(const mode of ['race','endless'])for(const size of [12,16,20,25,27,29,32,35,40])for(const [width,height] of [[1000,600],[370,540],[600,282]]){
 const g=adaptiveBoard({mode,size,width,height});assert.equal(g.tiles.length,size);assert.equal(g.points.length,size+(mode==='race'?2:0));assert(g.trackWidth>=24);assert(g.validated);assert(!['oval','perimeter'].includes(g.layout));if(mode==='endless')assert.notEqual(g.layout,'spiral');
 if(mode==='race'){assert.notDeepEqual(g.tiles.at(-1),g.finish);assert.notDeepEqual(g.tiles[0],g.start);}
 for(const s of g.segments)for(const p of s.polygon)assert(p.x>=0&&p.x<=width&&p.y>=0&&p.y<=height);
 cases++;
}
for(let count=12;count<=40;count++)for(const length of [5,8]){const order=colorOrder(count,length),uses=Array(length).fill(0);for(let i=0;i<count;i++){uses[order[i]]++;assert.notEqual(order[i],order[(i+1)%count]);assert.notEqual(order[i],order[(i+2)%count]);}assert(Math.max(...uses)-Math.min(...uses)<=2);assert.deepEqual(colorOrder(count,length),order);}
for(const theme of themes)for(let count=12;count<=40;count++){const original=Array.from({length:count},(_,i)=>spacePaint(theme.id,i,count));assert.deepEqual(Array.from({length:count},(_,i)=>spacePaint(theme.id,i,count)),original);}
console.log(`PASS ${cases} adaptive count/orientation cases, separate terminals, min width, bounds, cyclic balanced stable colours`);
