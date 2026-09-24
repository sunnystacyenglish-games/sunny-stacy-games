// package.json is the single source of truth for the project version.
export const APP_VERSION = await fetch(new URL('../package.json',import.meta.url),{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Version unavailable');return r.json();}).then(p=>{if(!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(p.version))throw Error('Invalid version');return p.version;}).catch(()=>null);
