import assert from 'node:assert/strict';
import {windingBoard} from '../games/board-race/geometry.js';
import {PAWN_COLORS} from '../games/board-race/activity.js';
assert.equal(PAWN_COLORS.length,10);assert.equal(new Set(PAWN_COLORS.map(c=>c.hex)).size,10);
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const intersect=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<-1e-6&&cross(c,d,a)*cross(c,d,b)<-1e-6;
let cases=0;for(const mode of ['race','endless'])for(const size of [12,24,40])for(const [width,height] of [[1100,500],[370,470],[800,190]]){
 const g=windingBoard({mode,size,width,height});assert.equal(g.tiles.length,size);assert.equal(g.segments.length,size+(mode==='race'?1:0));
 for(let i=0;i<g.segments.length;i++){const s=g.segments[i];if(i)assert.deepEqual(s.start,g.segments[i-1].end);for(const p of s.polygon){assert.ok(p.x>=0&&p.x<=width&&p.y>=0&&p.y<=height,'ribbon bounds');}
 for(let j=0;j<i;j++){const b=g.segments[j].polygon;for(let k=0;k<s.polygon.length;k++)for(let l=0;l<b.length;l++)assert.ok(!intersect(s.polygon[k],s.polygon[(k+1)%s.polygon.length],b[l],b[(l+1)%b.length]),'segment intersections');}}
 if(g.closed)assert.deepEqual(g.segments.at(-1).end,g.segments[0].start);cases++;
}console.log('PASS ribbon: '+cases+' configurations, shared boundaries, no segment intersections, bounds; 10 colours; winding route');
