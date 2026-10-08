// Geometry only: no players, content, special effects or game-state mutation.
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function sample(points,count,closed){const src=closed?[...points,points[0]]:points,lens=[0];for(let i=1;i<src.length;i++)lens[i]=lens[i-1]+distance(src[i-1],src[i]);const length=lens.at(-1);return Array.from({length:count},(_,i)=>{const at=length*i/(closed?count:count-1);let j=1;while(j<lens.length-1&&lens[j]<at)j++;const t=(at-lens[j-1])/(lens[j]-lens[j-1]||1);return {x:src[j-1].x+(src[j].x-src[j-1].x)*t,y:src[j-1].y+(src[j].y-src[j-1].y)*t};});}
function snake(count,w,h,closed){let rows=Math.max(2,Math.round(Math.sqrt(count*h/w)));if(closed&&rows%2)rows++;const cols=Math.max(3,Math.ceil(count/rows));const p=[];for(let r=0;r<rows;r++){const first=closed?1:0;for(let j=first;j<cols;j++){const c=r%2?cols-1-(j-first):j;p.push({x:c/(cols-1),y:r/(rows-1)});}}if(closed)for(let r=rows-1;r>=0;r--)p.push({x:0,y:r/(rows-1)});return p;}
function winding(count,w,h,closed,random){if(closed)return Array.from({length:500},(_,i)=>{const t=i/500*Math.PI*2,r=.43+.04*Math.sin(3*t);return {x:.5+r*Math.cos(t),y:.5+r*Math.sin(t)};});const rows=Math.max(2,Math.round(Math.sqrt(count*h/w)*.85)),p=[],variation=(random()-.5)*.025;for(let r=0;r<rows;r++){for(let j=0;j<=100;j++){const t=j/100,x=r%2?1-t:t;p.push({x:.06+.88*x,y:(r+.22*Math.sin(t*Math.PI*2)+variation*Math.sin(t*Math.PI))/(rows-1)});}if(r<rows-1){const edge=r%2?.06:.94;for(let j=1;j<30;j++){const t=j/30;p.push({x:edge+(r%2?-.06:.06)*Math.sin(t*Math.PI),y:(r+t)/(rows-1)});}}}return p;}
function spiral(closed){if(!closed)return Array.from({length:600},(_,i)=>{const t=i/599,r=.08+.42*t,a=t*Math.PI*4;return {x:.5+r*Math.cos(a),y:.5+r*Math.sin(a)};});const p=[];for(let i=0;i<=400;i++){const t=i/400,r=.48-.40*t,a=t*Math.PI*2;p.push({x:.5+r*Math.cos(a),y:.5+r*Math.sin(a)});}for(let i=400;i>=0;i--){const t=i/400,r=.48-.40*t,a=t*Math.PI*2+Math.PI;p.push({x:.5+r*Math.cos(a),y:.5+r*Math.sin(a)});}p.push({x:.5-.68,y:.5});for(let i=1;i<=100;i++){const a=Math.PI+i/100*Math.PI;p.push({x:.5+.68*Math.cos(a),y:.5+.68*Math.sin(a)});}return p;}
export function generateBoard({size=24,layout='winding',mode='race',width=900,height=550,random=Math.random}={}){size=Math.min(40,Math.max(12,Math.round(size)));const closed=mode==='endless',requested=layout==='random'?['winding','snake','spiral'][Math.floor(random()*3)%3]:layout;const total=size+(closed?0:1),margin=Math.max(24,Math.min(width,height)*.07),w=Math.max(20,width-margin*2),h=Math.max(20,height-margin*2);let used=requested;
 function build(kind){let raw=kind==='snake'?snake(total,w,h,closed):kind==='spiral'?spiral(closed):winding(total,w,h,closed,random);const xs=raw.map(p=>p.x),ys=raw.map(p=>p.y),x0=Math.min(...xs),y0=Math.min(...ys),dx=Math.max(...xs)-x0,dy=Math.max(...ys)-y0;raw=raw.map(p=>({x:margin+(p.x-x0)/dx*w,y:margin+(p.y-y0)/dy*h}));const points=sample(raw,total,closed);let min=Infinity;for(let i=0;i<points.length;i++)for(let j=0;j<i;j++)min=Math.min(min,distance(points[i],points[j]));return {points,diameter:Math.min(66,margin*1.7,min*.74),curve:raw};}
 let result=build(used);if(!Number.isFinite(result.diameter)||result.diameter<Math.min(18,Math.min(width,height)*.06)){used='snake';result=build(used);}return {...result,layout:used,closed,tiles:closed?result.points:result.points.slice(1),start:closed?null:result.points[0],width,height};}
// Compact automatic routes start with the largest practical cell size.
// Legacy curve generators remain exported above for future internal use.
export function compactBoard({size=24,mode='race',style='tiles',width=900,height=550,keepCapacity=false}={}){
 const closed=mode==='endless',count=size+(closed?0:1),gap=style==='circles'?.5:.12,pad=18;let best;
 for(let rows=1;rows<=count;rows++)for(let cols=2;cols<=count;cols++){
  const capacity=rows*cols;if(capacity<count||capacity>count+Math.max(3,Math.floor(count*.15)))continue;
  if(closed&&(rows<2||rows%2))continue;
  const d=Math.min((width-2*pad)/(cols+(cols-1)*gap),(height-2*pad)/(rows+(rows-1)*gap));
  if(!best||d>best.d)best={rows,cols,d};
 }
 const {rows,cols,d}=best,diameter=Math.max(8,d),step=diameter*(1+gap),left=(width-(cols-1)*step)/2,top=(height-(rows-1)*step)/2;
 let cells=[];
 if(closed){for(let r=0;r<rows;r++)for(let j=1;j<cols;j++)cells.push([r,r%2?cols-j:j]);for(let r=rows-1;r>=0;r--)cells.push([r,0]);
  while(!keepCapacity&&cells.length>count){let removed=false;for(let i=0;i<cells.length;i++){const a=cells[(i+cells.length-1)%cells.length],b=cells[i],c=cells[(i+1)%cells.length];if(a[0]!==c[0]&&a[1]!==c[1]){cells.splice(i,1);removed=true;break;}}if(!removed)cells.pop();}
 }else{for(let r=0;r<rows;r++)for(let j=0;j<cols;j++)cells.push([r,r%2?cols-1-j:j]);if(!keepCapacity)cells=cells.slice(0,count);}
 const points=cells.map(([r,c])=>({x:left+c*step,y:top+r*step}));
 return {points,tiles:closed?points:points.slice(1),start:closed?null:points[0],curve:points,diameter,width,height,closed,layout:'compact',style,gap};
}

// Round the compact route with circular fillets, then divide its offset ribbon
// by arc length. Adjacent spaces share the very same boundary coordinates.
export function continuousTrack(options={}){
 const route=compactBoard({...options,style:'tiles',keepCapacity:true}),src=route.points,closed=route.closed;
 const count=(options.size||24)+(closed?0:1),half=route.diameter*.42,parts=[];
 const unit=(a,b)=>{const d=distance(a,b);return {x:(b.x-a.x)/d,y:(b.y-a.y)/d};};
 const corners=src.map((p,i)=>{
  if(!closed&&(i===0||i===src.length-1))return {entry:p,exit:p};
  const a=src[(i+src.length-1)%src.length],b=src[(i+1)%src.length],u=unit(a,p),v=unit(p,b),cross=u.x*v.y-u.y*v.x;
  if(Math.abs(cross)<1e-6)return {entry:p,exit:p};
  const theta=Math.acos(Math.max(-1,Math.min(1,u.x*v.x+u.y*v.y))),trim=Math.min(distance(a,p),distance(p,b))*.48,radius=trim/Math.tan(theta/2),sign=Math.sign(cross);
  const entry={x:p.x-u.x*trim,y:p.y-u.y*trim},exit={x:p.x+v.x*trim,y:p.y+v.y*trim},center={x:entry.x-u.y*radius*sign,y:entry.y+u.x*radius*sign};
  return {entry,exit,center,radius,angle:Math.atan2(entry.y-center.y,entry.x-center.x),sweep:theta*sign};
 });
 function line(a,b){const length=distance(a,b);if(length<1e-6)return;const u=unit(a,b);parts.push({length,at:t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,nx:-u.y,ny:u.x})});}
 for(let i=0;i<src.length;i++){
  const c=corners[i];if(c.center)parts.push({length:Math.abs(c.sweep)*c.radius,at:t=>{const a=c.angle+c.sweep*t,sign=Math.sign(c.sweep);return {x:c.center.x+Math.cos(a)*c.radius,y:c.center.y+Math.sin(a)*c.radius,nx:-Math.cos(a)*sign,ny:-Math.sin(a)*sign};}});
  if(i<src.length-1||closed)line(c.exit,corners[(i+1)%src.length].entry);
 }
 const total=parts.reduce((sum,p)=>sum+p.length,0);
 function at(d){let rest=Math.max(0,Math.min(total,d));for(const part of parts){if(rest<=part.length+1e-7)return part.at(Math.min(1,rest/part.length));rest-=part.length;}return parts.at(-1).at(1);}
 const boundary=d=>{const p=at(d);return {left:{x:p.x+p.nx*half,y:p.y+p.ny*half},right:{x:p.x-p.nx*half,y:p.y-p.ny*half}};};
 const ends=Array.from({length:count+1},(_,i)=>boundary(total*i/count));if(closed)ends[count]=ends[0];
 const segments=Array.from({length:count},(_,i)=>{const steps=Math.max(12,Math.ceil(total/count/3)),samples=Array.from({length:steps+1},(_,j)=>j===0?ends[i]:j===steps?ends[i+1]:boundary(total*(i+j/steps)/count));const polygon=[...samples.map(p=>p.left),...samples.map(p=>p.right).reverse()];return {polygon,path:'M'+polygon.map(p=>p.x.toFixed(3)+','+p.y.toFixed(3)).join('L')+'Z',start:ends[i],end:ends[i+1]};});
 const points=Array.from({length:count},(_,i)=>at(total*(i+.5)/count));
 return {...route,points,tiles:closed?points:points.slice(1),start:closed?null:points[0],diameter:Math.min(half*2,total/count*.95),segments,trackWidth:half*2,curve:points,layout:'continuous'};
}

// Adaptive fitting retains the ordered centerline / offset / sampling contract.
import {adaptiveBoard,PATH_FAMILIES} from './adaptive-geometry.js';
export const ROUTE_LAYOUTS=PATH_FAMILIES;
export function chooseRoute(mode='race',random=Math.random){const families=mode==='endless'?PATH_FAMILIES.filter(x=>x!=='spiral'):PATH_FAMILIES;return families[Math.min(families.length-1,Math.floor(random()*families.length))];}
export const windingBoard=adaptiveBoard;
