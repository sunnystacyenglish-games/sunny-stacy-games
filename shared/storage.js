import {THEME_IDS,normalizeTheme} from './themes.js';
const KEY='sunny-stacy.dobble.settings.v1';
export const defaults={set:'animals-1',mode:'images',count:2,per:4,movement:'off',theme:'notebook',sound:true,autoNext:true,delay:600};
const choices={mode:['images','words','mixed'],count:[1,2,3,4],per:[2,3,4,5,6,7,8,9,10],movement:['off','slow','medium','fast'],theme:THEME_IDS,delay:[350,600,1000]};
export function normalizeSettings(raw={}) {
  raw={...raw,theme:normalizeTheme(raw?.theme)};
  const result={...defaults};
  for (const [key,values] of Object.entries(choices)) if(values.includes(raw?.[key])) result[key]=raw[key];
  for(const key of ['sound','autoNext']) if(typeof raw?.[key]==='boolean') result[key]=raw[key];
  if(typeof raw?.set==='string') result.set=raw.set;
  if(result.mode==='mixed') result.count=Math.min(result.count,2);
  return result;
}
export function loadSettings() {try{return normalizeSettings(JSON.parse(localStorage.getItem(KEY)));}catch{return {...defaults};}}
export function saveSettings(settings) {try{localStorage.setItem(KEY,JSON.stringify(settings));return true;}catch{return false;}}
