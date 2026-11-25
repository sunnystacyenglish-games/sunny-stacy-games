// Pixel-space placement only: authored hotspot geometry is never changed.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
export function placeAnswer({bounds,target,obstacles=[],size,image=bounds,gap=12}){
 const w=Math.min(size.width,bounds.width),h=size.height;if(h>bounds.height)return null;
 const fit=(x,y)=>({x:clamp(x,bounds.x,bounds.x+bounds.width-w),y:clamp(y,bounds.y,bounds.y+bounds.height-h),width:w,height:h});
 const cx=target.x+target.width/2,cy=target.y+target.height/2;
 const candidates=[];
 for(const shift of [0,-w/2,w/2,-w,w])candidates.push(fit(cx-w/2+shift,target.y-h-gap));
 for(const shift of [0,-w/2,w/2,-w,w])candidates.push(fit(cx-w/2+shift,target.y+target.height+gap));
 for(const shift of [0,-h/2,h/2]){candidates.push(fit(target.x-w-gap,cy-h/2+shift));candidates.push(fit(target.x+target.width+gap,cy-h/2+shift));}
 const clear=r=>!overlap(r,target)&&obstacles.every(o=>!overlap(r,o));const nearby=candidates.find(clear);if(nearby)return {...nearby,fallback:false};
 const edges=[];for(let n=0;n<=8;n++){const t=n/8;edges.push(fit(image.x+(image.width-w)*t,image.y-h-gap),fit(image.x+(image.width-w)*t,image.y+image.height+gap),fit(bounds.x,bounds.y+(bounds.height-h)*t),fit(bounds.x+bounds.width-w,bounds.y+(bounds.height-h)*t));}
 const safe=edges.filter(clear).sort((a,b)=>Math.hypot(a.x+w/2-cx,a.y+h/2-cy)-Math.hypot(b.x+w/2-cx,b.y+h/2-cy));return safe.length?{...safe[0],fallback:true}:null;
}
export function connector(target,box){const center={x:target.x+target.width/2,y:target.y+target.height/2};const end={x:clamp(center.x,box.x,box.x+box.width),y:clamp(center.y,box.y,box.y+box.height)};return {x1:clamp(end.x,target.x,target.x+target.width),y1:clamp(end.y,target.y,target.y+target.height),x2:end.x,y2:end.y};}
