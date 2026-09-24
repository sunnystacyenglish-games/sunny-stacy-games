export function newTarget(body,random=Math.random) {
  const angle=random()*Math.PI*2;
  body.target={x:body.x+Math.cos(angle),y:body.y+Math.sin(angle)};
}
export function createBody(position,representation,random=Math.random) {
  const body={x:position.x,y:position.y,halfWidth:.08,halfHeight:.08,speed:.75+random()*.5,wait:random()*.6,target:null};
  newTarget(body,random);return body;
}
// Small swept steps prevent tunnelling, including after a background-tab pause.
// AABBs follow the measured, rotated visual. Card bounds check all four corners.
export function outsideCard(body,x=body.x,y=body.y){return Math.hypot(Math.abs(x-.5)+body.halfWidth,Math.abs(y-.5)+body.halfHeight)>.497;}
export function overlaps(a,b,x=a.x,y=a.y){return Math.abs(x-b.x)<a.halfWidth+b.halfWidth&&Math.abs(y-b.y)<a.halfHeight+b.halfHeight;}
export function stepBodies(bodies,elapsed,speed,random=Math.random) {
  const steps=Math.max(1,Math.ceil(Math.min(elapsed,.05)/.008));
  const dt=Math.min(elapsed,.05)/steps;
  for(let step=0;step<steps;step++)for(const body of bodies){
    if(body.wait>0){body.wait-=dt;continue;}
    const dx=body.target.x-body.x,dy=body.target.y-body.y,distance=Math.hypot(dx,dy);
    if(distance<.012){newTarget(body,random);body.wait=random()*.18;continue;}
    const travel=Math.min(distance,speed*body.speed*dt);
    const x=body.x+dx/distance*travel,y=body.y+dy/distance*travel;
    const other=bodies.find(other=>other!==body&&overlaps(body,other,x,y));
    const wall=outsideCard(body,x,y);
    if(wall||other){
      const horizontal=other&&Math.abs(body.x-other.x)/(body.halfWidth+other.halfWidth)>Math.abs(body.y-other.y)/(body.halfHeight+other.halfHeight);
      const nx=wall?Math.sign(body.x-.5)*(Math.abs(body.x-.5)+body.halfWidth):horizontal?Math.sign(body.x-other.x):0;
      const ny=wall?Math.sign(body.y-.5)*(Math.abs(body.y-.5)+body.halfHeight):horizontal?0:Math.sign(body.y-other.y);
      const length=Math.hypot(nx,ny),normalX=nx/length,normalY=ny/length;
      const vx=dx/distance,vy=dy/distance,dot=vx*normalX+vy*normalY;
      body.target={x:body.x+vx-2*dot*normalX,y:body.y+vy-2*dot*normalY};
      continue;
    }
    body.x=x;body.y=y;
  }
}
