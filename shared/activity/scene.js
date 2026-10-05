// Scene v2 adds generic answers without changing content or entity identities.
export function upgradeScene(source){
 const d=structuredClone(source);d.hotspots??=[];
 for(const t of Array.isArray(d.targets)?d.targets:[]){if(!t||typeof t!=='object')continue;if(!Array.isArray(t.answers))t.answers=(Array.isArray(t.objectIds)?t.objectIds:Array.isArray(t.sceneObjectIds)?t.sceneObjectIds:[]).map(sceneObjectId=>({id:sceneObjectId,type:'object',sceneObjectId}));delete t.objectIds;delete t.sceneObjectIds;}
 return d;
}
export function objectRect(o){
 for(const k of ['x','y','width','height'])if(!Number.isFinite(o?.[k]))throw Error('Invalid object geometry.');
 if(o.width<=0||o.height<=0||o.width>1||o.height>1)throw Error('Object size must be between 0 and 100%.');
 const vx=Math.min(1,o.x+o.width)-Math.max(0,o.x),vy=Math.min(1,o.y+o.height)-Math.max(0,o.y);
 if(vx<Math.min(.025,o.width*.25)-1e-8||vy<Math.min(.025,o.height*.25)-1e-8)throw Error('Keep part of the object inside the scene so it remains selectable.');return o;
}
export function clampObject(o){o.width=Math.max(.025,Math.min(1,o.width));o.height=Math.max(.025,Math.min(1,o.height));o.x=Math.max(-o.width+Math.min(.025,o.width*.25),Math.min(1-Math.min(.025,o.width*.25),o.x));o.y=Math.max(-o.height+Math.min(.025,o.height*.25),Math.min(1-Math.min(.025,o.height*.25),o.y));return o;}
