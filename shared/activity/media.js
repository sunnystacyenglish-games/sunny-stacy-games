import {stableId} from './contracts.js';
// Asset IDs are provider-neutral. Do not persist object URLs or local file paths.
export function validateMediaRef(ref){if(ref?.type==='asset')return {type:'asset',assetId:stableId(ref.assetId)};if(ref?.type==='url'){const url=new URL(ref.url);if(url.protocol!=='https:'||url.username||url.password)throw Error('Use an HTTPS media URL.');return {type:'url',url:url.href};}throw Error('Invalid media reference.');}
export async function resolveMedia(ref,{assets}={}){ref=validateMediaRef(ref);if(ref.type==='url')return ref.url;if(!assets?.get)throw Error('Media provider unavailable.');const asset=await assets.get(ref.assetId);if(!asset)throw Error('Media asset unavailable.');return asset;}
