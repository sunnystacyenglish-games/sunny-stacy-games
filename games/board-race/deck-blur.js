export const DECK_BLUR_MODES=['word-blur','picture-blur','none'];
export const normalizeDeckBlur=value=>DECK_BLUR_MODES.includes(value)?value:'none';
export function normalizeDeckBlurMap(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 return Object.fromEntries(Object.entries(value).filter(([key])=>{try{const id=JSON.parse(key);return Array.isArray(id)&&id.length===2&&id.every(v=>typeof v==='string'&&v.length>0);}catch{return false;}}).map(([key,mode])=>[key,normalizeDeckBlur(mode)]));
}
export function concealedCardPart(card,mode){return mode==='word-blur'&&card.text?.trim()?'text':mode==='picture-blur'&&card.image?'image':null;}
