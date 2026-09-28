import {normalizeSettings} from '../../shared/storage.js';
import {canPlaySet,validConceptCount,hasUsableImage,hasUsableWord,MIN_SET_ITEMS} from '../../shared/content-rules.js';
import {maxItemsPerCard} from './engine.js';
export const CARD_OPTIONS=[1,2,3,4];
export const MAX_CARD_DENSITY=6; // Readable hierarchy and bounded rotated-footprint packing.
export const MODE_OPTIONS=[['images','Image ↔ Image'],['words','Word ↔ Word'],['mixed','Word ↔ Image']];
export const MOVEMENT_OPTIONS=[['off','Off'],['slow','Slow'],['medium','Medium'],['fast','Fast']];
function nearest(values,previous){return values.filter(value=>value<=previous).at(-1)||values[0];}
export function resolveConfiguration(set,raw){
 const settings=normalizeSettings(raw),items=set?.items||[],size=validConceptCount(set),playable=canPlaySet(set);
 const images=items.length>0&&items.every(hasUsableImage),words=items.length>0&&items.every(hasUsableWord);
 const modes={images,words,mixed:images&&words};
 if(!modes[settings.mode])settings.mode=MODE_OPTIONS.find(([mode])=>modes[mode])?.[0]||settings.mode;
 const counts=CARD_OPTIONS.filter(count=>playable&&(settings.mode!=='mixed'||count<=2)&&(count!==1||images&&words)&&maxItemsPerCard(size,count)>=2);
 settings.count=nearest(counts,settings.count)||settings.count;
 const maximum=playable?maxItemsPerCard(size,settings.count):0;
 settings.per=playable?Math.min(MAX_CARD_DENSITY,maximum):2;
 settings.set=set?.id||settings.set;
 return {settings,size,maximum,modes,counts,playable:playable&&!!counts.length&&modes[settings.mode],note:!playable?'Minimum: '+MIN_SET_ITEMS+' valid items. This set has '+size+'.':size+' concepts · all concepts rotate through play.'};
}
export function gameURL(set,settings){const url=new URL('./',new URL(import.meta.url));url.searchParams.set('set',set.id);for(const key of ['mode','count','movement','theme','sound','autoNext','delay'])url.searchParams.set(key,String(settings[key]));return url.href;}
export function settingsFromURL(search,saved){const p=new URLSearchParams(search),raw={...saved};for(const key of ['mode','movement','theme'])if(p.has(key))raw[key]=p.get(key);for(const key of ['count','delay'])if(p.has(key))raw[key]=Number(p.get(key));for(const key of ['sound','autoNext'])if(['true','false'].includes(p.get(key)))raw[key]=p.get(key)==='true';return normalizeSettings(raw);}
