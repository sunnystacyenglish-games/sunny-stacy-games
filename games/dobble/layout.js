import {itemScales} from './sizing.js';
export function createLayout(count,random=Math.random) {
  const scales=itemScales(count,random);
  if(count===1)return [{x:.5,y:.5,rotation:0,scale:scales[0]}];
  if(count>4){const slots=[[.38,.19],[.62,.19],[.22,.395],[.5,.395],[.78,.395],[.22,.605],[.5,.605],[.78,.605],[.38,.81],[.62,.81]];return slots.filter((_,i)=>count===10||!([3,6,9,0,4].slice(0,10-count).includes(i))).map(([x,y],i)=>({x,y,rotation:(random()-.5)*8,scale:scales[i]}));}
  const phase=random()*Math.PI*2;
  return Array.from({length:count},(_,i)=>{const angle=phase+i*Math.PI*2/count;return {x:.5+Math.cos(angle)*.265,y:.5+Math.sin(angle)*.265,rotation:(random()-.5)*18,scale:scales[i]};});
}
