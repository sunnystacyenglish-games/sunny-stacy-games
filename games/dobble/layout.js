import {itemScales} from './sizing.js';
import {outsideCard,overlaps} from './motion.js';
// Visual properties are sampled once; measurement/resize never resamples them.
export function createLayout(count,random=Math.random,representations=[]){
 const scales=itemScales(count,random);
 return scales.map((scale,i)=>({x:.5,y:.5,scale,rotation:(random()-.5)*(representations[i]==='word'?44:90)}));
}
// Largest footprints first. Multiple candidates compete for coverage; failed
// arrangements restart without changing any element's size or rotation.
function tryPlacement(bodies,random){
 const ordered=[...bodies].sort((a,b)=>b.halfWidth*b.halfHeight-a.halfWidth*a.halfHeight);
 for(let attempt=0;attempt<18;attempt++){
  const placed=[];
  for(const body of ordered){
   let best=null,score=-Infinity;
   for(let i=0;i<220;i++){
    const angle=random()*Math.PI*2,radius=Math.sqrt(random())*.46;
    const x=.5+Math.cos(angle)*radius,y=.5+Math.sin(angle)*radius;
    if(outsideCard(body,x,y)||placed.some(other=>overlaps(body,other,x,y)))continue;
    const separation=placed.length?Math.min(...placed.map(p=>Math.hypot(x-p.x,y-p.y))):0;
    const cx=(placed.reduce((sum,p)=>sum+p.x-.5,0)+x-.5)/(placed.length+1);
    const cy=(placed.reduce((sum,p)=>sum+p.y-.5,0)+y-.5)/(placed.length+1);
    const value=placed.length?separation-.35*Math.hypot(cx,cy)+random()*.025:-Math.abs(radius-.10)+random()*.025;
    if(value>score){score=value;best={x,y};}
   }
   if(!best)break;
   Object.assign(body,best);placed.push(body);
  }
  if(placed.length===bodies.length)return true;
 }
 return false;
}

// Bounded fallback: uniformly reduce the complete hierarchy, never a single rank.
// Last resort uses separated centres; fitting is guaranteed and no retry loop is unbounded.
export function placeBodies(bodies,random=Math.random){
 const original=bodies.map(b=>({w:b.halfWidth,h:b.halfHeight}));
 const scale=factor=>bodies.forEach((b,i)=>{b.halfWidth=original[i].w*factor;b.halfHeight=original[i].h*factor;});
 for(const factor of [1,.94,.88,.82,.76,.70]){scale(factor);if(tryPlacement(bodies,random))return factor;}
 const n=bodies.length,phase=random()*Math.PI*2,radius=n===1?0:.29;
 const available=n===1?.3:Math.min(.19,radius*Math.sin(Math.PI/n)*.92);
 const factor=Math.min(.70,...original.map(b=>available/Math.hypot(b.w,b.h)));
 scale(factor);bodies.forEach((body,i)=>{const a=phase+i*2*Math.PI/n;body.x=.5+radius*Math.cos(a);body.y=.5+radius*Math.sin(a);});return factor;
}
