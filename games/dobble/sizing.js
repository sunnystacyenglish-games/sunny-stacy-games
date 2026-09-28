// Rank-based hierarchy, independently shuffled on each card. Values are diameter fractions.
export function itemScales(count,random=Math.random){
 const density=Math.min(1,Math.sqrt(6/count)),small=(.17+random()*.01)*density,large=small*2.15;
 const values=Array.from({length:count},(_,i)=>count===1?large:i===0?small:i===count-1?large:small+(large-small)*(i/(count-1))**1.35+(random()-.5)*.008*density);
 for(let i=values.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}return values;
}
export function sizeProfile(count,scale){return {image:scale,font:scale*.38,wordWidth:scale};}
