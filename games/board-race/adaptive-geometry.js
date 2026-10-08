// Geometry only. Candidates are validated before constant-width offsets are built.
export const PATH_FAMILIES=['winding','spiral','horizontal-snake','vertical-snake','double-notch','opposing-notches','folded-rectangle'];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const intersects=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<-1e-7&&cross(c,d,a)*cross(c,d,b)<-1e-7;
function rounded(vertices,radius,closed){
 const parts=[],n=vertices.length;
 const corners=vertices.map((p,i)=>{if(!closed&&(i===0||i===n-1))return {entry:p,exit:p};const a=vertices[(i+n-1)%n],b=vertices[(i+1)%n],da=dist(a,p),db=dist(p,b),u={x:(p.x-a.x)/da,y:(p.y-a.y)/da},v={x:(b.x-p.x)/db,y:(b.y-p.y)/db},dot=Math.max(-1,Math.min(1,u.x*v.x+u.y*v.y)),theta=Math.acos(dot),sign=Math.sign(u.x*v.y-u.y*v.x);if(theta<1e-6)return {entry:p,exit:p};const trim=Math.min(radius*Math.tan(theta/2),da*.47,db*.47),r=trim/Math.tan(theta/2),entry={x:p.x-u.x*trim,y:p.y-u.y*trim},exit={x:p.x+v.x*trim,y:p.y+v.y*trim},center={x:entry.x-u.y*r*sign,y:entry.y+u.x*r*sign};return {entry,exit,center,r,sign,angle:Math.atan2(entry.y-center.y,entry.x-center.x),theta};});
 const line=(a,b)=>{const d=dist(a,b);if(d<1e-6)return;parts.push({length:d,at:t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,tx:(b.x-a.x)/d,ty:(b.y-a.y)/d,curvature:0})});};
 for(let i=0;i<n;i++){const c=corners[i];if(c.center)parts.push({length:c.r*c.theta,at:t=>{const a=c.angle+c.sign*c.theta*t;return {x:c.center.x+c.r*Math.cos(a),y:c.center.y+c.r*Math.sin(a),tx:-Math.sin(a)*c.sign,ty:Math.cos(a)*c.sign,curvature:1/c.r};}});if(i<n-1||closed)line(c.exit,corners[(i+1)%n].entry);}
 const length=parts.reduce((s,p)=>s+p.length,0),ends=[];let sum=0;for(const p of parts){sum+=p.length;ends.push(sum);}return {length,closed,at:d=>{d=closed?(d%length+length)%length:Math.max(0,Math.min(length,d));let i=0;while(i<parts.length-1&&ends[i]<d)i++;return parts[i].at((d-(i?ends[i-1]:0))/parts[i].length);}};
}
function sampled(points,closed){const p=closed?[...points,points[0]]:points,lens=[0];for(let i=1;i<p.length;i++)lens.push(lens.at(-1)+dist(p[i-1],p[i]));const frames=points.map((b,i)=>{const a=points[closed?(i+points.length-1)%points.length:Math.max(0,i-1)],c=points[closed?(i+1)%points.length:Math.min(points.length-1,i+1)],d=dist(a,c)||1,ab=dist(a,b),bc=dist(b,c);return {tx:(c.x-a.x)/d,ty:(c.y-a.y)/d,curvature:ab*bc>1e-8?Math.abs(cross(a,b,c))*2/(ab*bc*d):0};});const length=lens.at(-1);return {length,closed,at:d=>{d=closed?(d%length+length)%length:Math.max(0,Math.min(length,d));let lo=0,hi=lens.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(lens[m]<d)lo=m;else hi=m;}const t=(d-lens[lo])/(lens[hi]-lens[lo]||1),a=frames[lo%frames.length],b=frames[hi%frames.length],tx=a.tx+(b.tx-a.tx)*t,ty=a.ty+(b.ty-a.ty)*t,n=Math.hypot(tx,ty)||1;return {x:p[lo].x+(p[hi].x-p[lo].x)*t,y:p[lo].y+(p[hi].y-p[lo].y)*t,tx:tx/n,ty:ty/n,curvature:Math.max(a.curvature,b.curvature)};}};}
function snakeVertices(w,h,rows,closed,organic=false,variant=0,cell=30){const left=closed?Math.min(w*.45,cell*2.2):0,right=w,p=[];for(let row=0;row<rows;row++){const y=h*row/(rows-1),inset=organic?(Math.sin(row*2.1+variant)*.045+.05)*w:0;const a=left+(row%2?inset:inset*.3),b=right-inset;p.push({x:row%2?b:a,y},{x:row%2?a:b,y});}if(closed){p.push({x:0,y:h},{x:0,y:0});}return p;}
function familyRoute(family,w,h,rows,closed,width,variant){
 if(family==='spiral'){if(closed)return null;const turns=.72+variant*.18,inner=.20,points=Array.from({length:721},(_,i)=>{const t=i/720,a=t*Math.PI*2*turns+variant*.23,r=inner+(.49-inner)*t;return {x:w*(.5+r*Math.cos(a)),y:h*(.5+r*Math.sin(a))};});return sampled(points,false);}
 if(family==='double-notch'||family==='opposing-notches'){
  let v=family==='double-notch'?[[0,0],[.25,0],[.25,.5],[.43,.5],[.43,0],[.64,0],[.64,.5],[.82,.5],[.82,0],[1,0],[1,1],[0,1]]:[[0,0],[.28,0],[.28,.53],[.48,.53],[.48,0],[1,0],[1,1],[.78,1],[.78,.47],[.58,.47],[.58,1],[0,1]];
  return rounded(v.map(([x,y])=>({x:x*w,y:y*h})),width*.95,closed);
 }
 const vertical=family==='vertical-snake';let v=snakeVertices(vertical?h:w,vertical?w:h,rows,closed,family==='winding',variant,width);
 if(vertical)v=v.map(p=>({x:p.y,y:p.x}));
 // Folded Rectangle uses pairs of rounded right-angle corners, without diagonals.
 const radius=family==='folded-rectangle'?width*.85:Math.min((vertical?w:h)/(rows-1)*.48,width*1.6);
 return rounded(v,radius,closed);
}
export function validateCenterline(route,width,viewport){
 if(!route||!Number.isFinite(route.length)||route.length<1)return {valid:false,reason:'empty'};
 const n=Math.max(120,Math.ceil(route.length/Math.max(3,width*.12))),step=route.length/n,p=Array.from({length:n+(route.closed?0:1)},(_,i)=>route.at(i*step)),gap=width*.18;
 for(const a of p){if(a.curvature*width>1.4)return {valid:false,reason:'turn radius'};if(a.x<width/2||a.y<width/2||a.x>viewport.width-width/2||a.y>viewport.height-width/2)return {valid:false,reason:'bounds'};}
 for(let i=0;i<p.length;i++)for(let j=0;j<i;j++){let arc=(i-j)*step;if(route.closed)arc=Math.min(arc,route.length-arc);if(arc>width*2&&dist(p[i],p[j])<width+gap)return {valid:false,reason:'clearance'};if(i>j+1&&!(route.closed&&i===p.length-1&&j===0)&&i<p.length-1&&intersects(p[i],p[i+1],p[j],p[j+1]))return {valid:false,reason:'crossing'};}
 return {valid:true,samples:p,step};
}
function buildTrack(route,width,count,viewport,layout,validation){
 const step=route.length/count,boundary=d=>{const p=route.at(d),nx=-p.ty,ny=p.tx;return {left:{x:p.x+nx*width/2,y:p.y+ny*width/2},right:{x:p.x-nx*width/2,y:p.y-ny*width/2}};};
 const ends=Array.from({length:count+1},(_,i)=>boundary(i*step));if(route.closed)ends[count]=ends[0];
 const segments=Array.from({length:count},(_,i)=>{const n=Math.max(12,Math.ceil(step/2)),samples=Array.from({length:n+1},(_,j)=>j===0?ends[i]:j===n?ends[i+1]:boundary((i+j/n)*step)),polygon=[...samples.map(p=>p.left),...samples.map(p=>p.right).reverse()];return {start:ends[i],end:ends[i+1],polygon,path:'M'+polygon.map(p=>p.x.toFixed(3)+','+p.y.toFixed(3)).join('L')+'Z'};});
 const points=Array.from({length:count},(_,i)=>route.at((i+.5)*step)),curve=validation.samples,connector=route.closed?curve:Array.from({length:Math.max(100,curve.length)},(_,i)=>route.at(step*.5+(route.length-step)*i/(Math.max(100,curve.length)-1)));
 return {...viewport,layout,closed:route.closed,points,tiles:route.closed?points:points.slice(1,-1),start:route.closed?null:points[0],finish:route.closed?null:points.at(-1),curve,connector,diameter:width,trackWidth:width,segments,cellLength:step,length:route.length,validated:true};
}
export function validateTrackEdges(route,width){const n=Math.max(120,Math.ceil(route.length/3)),left=[],right=[];for(let i=0;i<=n;i++){const p=route.at(route.length*i/n);left.push({x:p.x-p.ty*width/2,y:p.y+p.tx*width/2});right.push({x:p.x+p.ty*width/2,y:p.y-p.tx*width/2});}const edges=[];for(const side of [left,right])for(let i=1;i<side.length;i++)edges.push([side[i-1],side[i]]);if(!route.closed){edges.push([left[0],right[0]],[left.at(-1),right.at(-1)]);}for(let i=0;i<edges.length;i++)for(let j=0;j<i;j++)if(intersects(...edges[i],...edges[j]))return false;return true;}
export function adaptiveBoard({size=24,mode='race',width=900,height=550,layout='winding'}={}){
 const closed=mode==='endless',count=size+(closed?0:2),preferred=layout==='snake'?'horizontal-snake':layout,minimum=24,target=Math.max(minimum,Math.min(110,Math.sqrt(width*height/count)*.65)),candidates=[];
 const families=PATH_FAMILIES.filter(f=>!(closed&&f==='spiral')&&!(f==='vertical-snake'&&height>width));
 for(const factor of [1,.88,.76,.60,.48,minimum/target]){if(factor<.76&&candidates.length)continue;const cell=Math.max(minimum,target*factor),margin=cell*.65+3,w=width-margin*2,h=height-margin*2;if(w<cell*2||h<cell*2)continue;
 for(const family of families)for(const rows of family==='spiral'?[1,2,3,4,5]:family.includes('notch')?[2]:[2,3,4,5,6,7,8]){if(closed&&!family.includes('notch')&&(rows<4||rows%2))continue;const usableWidth=closed&&size<20&&w/h>4?Math.min(w,h*2):w,raw=familyRoute(family,usableWidth,h,rows,closed,cell,rows),route=raw&&{...raw,at:d=>{const p=raw.at(d);return {...p,x:p.x+margin+(w-usableWidth)/2,y:p.y+margin};}},v=validateCenterline(route,cell,{width,height});if(!v.valid)continue;const length=route.length/count;if(length<cell*1.08||length>cell*2.5)continue;
 const anchors=Array.from({length:count},(_,i)=>route.at((i+.5)*length));let nearest=Infinity;for(let i=0;i<count;i++)for(let j=0;j<i;j++)nearest=Math.min(nearest,dist(anchors[i],anchors[j]));if(nearest<cell*1.06)continue;
 const utilization=route.length*cell/(width*height),ratio=length/cell,orientationBonus=size>=30&&height>width&&family==='horizontal-snake'?.08:0,score=cell/target+utilization*.7-Math.abs(ratio-1.25)*.2+(family===preferred?.32:0)+orientationBonus;
 candidates.push({route,cell,family,v,score});
 }

 }
 candidates.sort((a,b)=>b.score-a.score);
 if(!candidates.length)throw Error('The board area is too small for readable spaces. Enlarge the game window.');
 for(const best of candidates)if(validateTrackEdges(best.route,best.cell))return buildTrack(best.route,best.cell,count,{width,height},best.family,best.v);throw Error('No safe track fits this window. Enlarge the game window.');
}



// Cards mode intentionally reserves the middle; ordinary boards never use this family.
export function cardsBoard({size=24,mode='race',width=900,height=550}={}){
 const closed=mode==='endless',count=size+(closed?0:2),cell=Math.max(24,Math.min(76,width/7,height/7,(2*(width+height)-24)/(count+14)*.90)),margin=cell*.7+3,w=width-2*margin,h=height-2*margin;
 const raw=rounded([{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}],cell*1.8,true),length=raw.length*(closed?1:count/(count+1.5));
 const route={length,closed,at:d=>{const p=raw.at(d);return {...p,x:p.x+margin,y:p.y+margin};}},v=validateCenterline(route,cell,{width,height});
 if(!v.valid||!validateTrackEdges(route,cell)||length/count<cell*1.06)throw Error('Enlarge the window to fit the board and decks.');
 const result=buildTrack(route,cell,count,{width,height},'rounded-rectangle',v),inset=margin+cell*.85;
 return {...result,center:{x:inset,y:inset,width:width-2*inset,height:height-2*inset}};
}
