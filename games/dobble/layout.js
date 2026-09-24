import {itemScales} from './sizing.js';
import {outsideCard,overlaps} from './motion.js';
// Visual properties are sampled once; measurement/resize never resamples them.
export function createLayout(count,random=Math.random,representations=[]){
 const scales=itemScales(count,random);
 return scales.map((scale,i)=>({x:.5,y:.5,scale,rotation:(random()-.5)*(representations[i]==='word'?40:80)}));
}
// Largest footprints first. Multiple candidates compete for coverage; failed
// arrangements restart without changing any element's size or rotation.
export function placeBodies(bodies,random=Math.random){
 const ordered=[...bodies].sort((a,b)=>b.halfWidth*b.halfHeight-a.halfWidth*a.halfHeight);
 for(let attempt=0;attempt<160;attempt++){
  const placed=[];
  for(const body of ordered){
   let best=null,score=-Infinity;
   for(let i=0;i<(attempt<12?180:600);i++){
    const angle=random()*Math.PI*2,radius=Math.sqrt(random())*.46;
    const x=.5+Math.cos(angle)*radius,y=.5+Math.sin(angle)*radius;
    if(outsideCard(body,x,y)||placed.some(other=>overlaps(body,other,x,y)))continue;
    const separation=placed.length?Math.min(...placed.map(p=>Math.hypot(x-p.x,y-p.y))):0;
    const cx=(placed.reduce((sum,p)=>sum+p.x-.5,0)+x-.5)/(placed.length+1);
    const cy=(placed.reduce((sum,p)=>sum+p.y-.5,0)+y-.5)/(placed.length+1);
    const value=placed.length?separation-.35*Math.hypot(cx,cy)+random()*.025:-Math.abs(radius-.22)+random()*.025;
    if(value>score){score=value;best={x,y};}
   }
   if(!best)break;
   Object.assign(body,best);placed.push(body);
  }
  if(placed.length===bodies.length)return;
 }
 throw Error('Unable to fit the measured card elements.');
}
