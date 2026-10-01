import {hasUsableImage} from '../../shared/content-rules.js';
export const LENGTHS=['any',3,4,5,6,7,8];
export const normalizeLength=value=>LENGTHS.includes(Number(value))?Number(value):'any';
export const eligibleWord=word=>typeof word==='string'&&/^[a-z]{3,8}$/i.test(word);
export function eligiblePool(set,length='any'){return (set?.items||[]).filter(item=>eligibleWord(item.word)&&hasUsableImage(item)&&(length==='any'||item.word.length===Number(length)));}
