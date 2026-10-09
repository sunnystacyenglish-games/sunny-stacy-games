// An inert rendering of the live scene: no duplicate IDs, focus or game state.
export function mountMagnifier(scene, {enabled, confirm}) {
  let point = null, radius = 80, gesture = null, suppressClick = false, frame = 0;
  const lens = document.createElement('div'), clip = document.createElement('div'), copy = document.createElement('div');
  lens.className = 'spy-lens'; clip.className = 'spy-lens-clip'; copy.className = 'spy-lens-copy';
  lens.setAttribute('aria-hidden','true'); lens.inert = true; clip.append(copy); lens.append(clip); scene.append(lens);
  const sync = (rebuild = true) => {
    lens.hidden = !point;
    if (!point) {copy.replaceChildren();return;}
    const w = scene.clientWidth, h = scene.clientHeight;
    radius = Math.min(100, w * .24, h * .24);
    const x = point.x*w, y = point.y*h;
    Object.assign(lens.style,{left:x+'px',top:y+'px',width:radius*2+'px',height:radius*2+'px'});
    Object.assign(copy.style,{width:w+'px',height:h+'px',transform:`translate(${radius-x*2}px,${radius-y*2}px) scale(2)`});
    if(rebuild)copy.replaceChildren(...[...scene.children].filter(n=>n!==lens&&n.id!=='targetSuccess').map(n=>{
      const clone=n.cloneNode(true);
      for(const el of [clone,...clone.querySelectorAll('*')]) {el.removeAttribute('id');el.removeAttribute('data-object-id');el.removeAttribute('tabindex');el.removeAttribute('aria-pressed');if(el.tagName==='BUTTON')el.tabIndex=-1;}
      return clone;
    }));
  };
  const inspect = (event, button) => {
    if(suppressClick&&event.detail!==0){suppressClick=false;return;}
    if(!enabled())return;
    const r=scene.getBoundingClientRect(),b=button?.getBoundingClientRect();
    const x=(event.detail===0&&b?b.left+b.width/2:event.clientX)-r.left;
    const y=(event.detail===0&&b?b.top+b.height/2:event.clientY)-r.top;
    if(x<0||y<0||x>r.width||y>r.height)return;
    if(point&&Math.hypot(x-point.x*r.width,y-point.y*r.height)<=radius){confirm({...point,radius,width:r.width,height:r.height,magnification:2},button);sync();}
    else {point={x:x/r.width,y:y/r.height};sync();}
  };
  const down = e => {
    suppressClick=false;
    if(e.button!==0||e.isPrimary===false||!enabled()||!point)return;
    const r=scene.getBoundingClientRect();
    if(Math.hypot(e.clientX-r.left-point.x*r.width,e.clientY-r.top-point.y*r.height)>radius)return;
    gesture={id:e.pointerId,x:e.clientX,y:e.clientY,point:{...point},moved:false};
    scene.setPointerCapture(e.pointerId);
  };
  const move = e => {
    if(!gesture||gesture.id!==e.pointerId)return;
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
    if(!gesture.moved&&Math.hypot(dx,dy)<4)return;
    gesture.moved=true;e.preventDefault();
    const r=scene.getBoundingClientRect();
    point={x:Math.max(0,Math.min(1,gesture.point.x+dx/r.width)),y:Math.max(0,Math.min(1,gesture.point.y+dy/r.height))};
    if(!frame)frame=requestAnimationFrame(()=>{frame=0;sync(false);});
  };
  const up = e => {
    if(!gesture||gesture.id!==e.pointerId)return;
    suppressClick=gesture.moved||e.type==='pointercancel';gesture=null;
    if(scene.hasPointerCapture(e.pointerId))scene.releasePointerCapture(e.pointerId);
    if(frame){cancelAnimationFrame(frame);frame=0;}sync(false);
  };
  scene.addEventListener('pointerdown',down);
  scene.addEventListener('pointermove',move);
  scene.addEventListener('pointerup',up);
  scene.addEventListener('pointercancel',up);
  const observer=new MutationObserver(records=>{if(records.some(r=>!lens.contains(r.target)))sync();});
  observer.observe(scene,{subtree:true,attributes:true,attributeFilter:['class','src'],childList:true});
  return {inspect,sync,reset(){point=null;gesture=null;suppressClick=false;sync();},destroy(){observer.disconnect();cancelAnimationFrame(frame);for(const [name,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up]])scene.removeEventListener(name,fn);lens.remove();}};
}

