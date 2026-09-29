// Card-relative ranks: ~13.5%–24.3%, with a stable 1.8:1 hierarchy.
export function itemScales(count,random=Math.random){
 const small=.135+(random()-.5)*.006,large=small*1.8;
 const values=Array.from({length:count},(_,i)=>count===1?large:small+(large-small)*i/(count-1));
 for(let i=values.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}return values;
}
export function sizeProfile(count,scale){return {image:scale,font:scale*.38,wordWidth:scale};}
