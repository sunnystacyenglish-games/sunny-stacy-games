// A landing event adapter; future deck events can implement the same next() contract.
export function conceptEvents(items,random=Math.random){let bag=[];return {type:'conceptSet',next(){if(!bag.length){bag=[...items];for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}return {type:'concept',concept:bag.pop()};}};}
export const futureEventTypes=Object.freeze(['cardDecks']);

