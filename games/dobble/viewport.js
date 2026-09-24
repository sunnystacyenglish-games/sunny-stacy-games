// Reads layout only on resize/content-size changes, never in the physics loop.
export function setupViewport(host){
  const main=host.parentElement,header=document.querySelector('header');let pending=0;
  const outerHeight=el=>{if(el.hidden||getComputedStyle(el).display==='none')return 0;const css=getComputedStyle(el);return el.getBoundingClientRect().height+parseFloat(css.marginTop||0)+parseFloat(css.marginBottom||0);};
  function fit(){pending=0;const count=+host.dataset.count||2;const css=getComputedStyle(host),columns=Math.min(count,+css.getPropertyValue('--columns')||2),rows=Math.ceil(count/columns),gap=parseFloat(css.gap)||12;const style=getComputedStyle(main);const padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);const other=[...main.children].filter(el=>el!==host).reduce((sum,el)=>sum+outerHeight(el),0);const availableHeight=window.innerHeight-outerHeight(header)-padding-other-12-parseFloat(getComputedStyle(document.body).paddingBottom||0);const availableWidth=host.clientWidth;const fromWidth=(availableWidth-gap*(columns-1))/columns;const fromHeight=(availableHeight-gap*(rows-1))/rows;const minimum=window.innerWidth<600?260:180;const size=Math.max(1,Math.min(fromWidth,Math.max(minimum,fromHeight),count>2?380:520));host.style.setProperty('--card-size',Math.floor(size)+'px');host.style.setProperty('--card-columns',columns);host.style.height=Math.ceil(rows*Math.floor(size)+(rows-1)*gap)+'px';}
  function schedule(){if(!pending)pending=requestAnimationFrame(fit);}
  const observer=new ResizeObserver(schedule);observer.observe(header);observer.observe(main);for(const el of main.children)if(el!==host)observer.observe(el);
  const mutation=new MutationObserver(schedule);mutation.observe(host,{attributes:true,attributeFilter:['data-count']});mutation.observe(document.body,{attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',schedule);document.addEventListener('fullscreenchange',schedule);schedule();
  return ()=>{observer.disconnect();mutation.disconnect();cancelAnimationFrame(pending);window.removeEventListener('resize',schedule);document.removeEventListener('fullscreenchange',schedule);};
}
