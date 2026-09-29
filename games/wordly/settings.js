import {normalizeTheme} from '../../shared/themes.js';
import {normalizeLength} from './eligibility.js';
const KEY='sunny-stacy.wordly.settings.v1';
export function loadPreferences(){let raw={};try{raw=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}const params=new URLSearchParams(location.search);return {set:typeof raw.set==='string'?raw.set:'animals-1',length:normalizeLength(params.get('length')??raw.length),theme:normalizeTheme(params.get('theme')||raw.theme||'notebook'),sound:params.has('sound')?!['false','off'].includes(params.get('sound')):raw.sound!==false};}
export function savePreferences(settings){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}}
export function gameURL(settings){const url=new URL('./',import.meta.url);url.search=new URLSearchParams({set:settings.set,length:settings.length,theme:settings.theme,sound:String(settings.sound)});return url.href;}
