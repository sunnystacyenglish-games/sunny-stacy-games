import assert from 'node:assert/strict';
import {windingBoard} from '../games/board-race/geometry.js';
import {spacePaint} from '../games/board-race/track-palette.js';
import {themes} from '../shared/themes.js';
const luminance=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
for(const t of themes)for(let i=-1;i<40;i++){const p=spacePaint(t.id,i,40,i===39),a=luminance(p.fill),b=luminance(p.ink);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'label contrast');}
for(const layout of ['winding','spiral'])for(const size of [12,20,30,40]){const g=windingBoard({layout,size});for(const s of g.segments){assert.ok(Math.abs(Math.hypot(s.start.left.x-s.start.right.x,s.start.left.y-s.start.right.y)-g.trackWidth)<1e-6);assert.ok(Math.abs(Math.hypot(s.end.left.x-s.end.right.x,s.end.left.y-s.end.right.y)-g.trackWidth)<1e-6);}}
console.log('PASS all theme label contrast >=4.5:1 and constant segment width');
