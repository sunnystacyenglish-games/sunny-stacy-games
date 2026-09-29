// Transaction for safe visual preferences only. Persistence belongs to the caller.
export function createSettingsPreview(settings,keys,render){let snapshot=null;return {
 begin(){snapshot=Object.fromEntries(keys.map(key=>[key,settings[key]]));},
 update(values){if(!snapshot)return;for(const key of keys)if(Object.hasOwn(values,key))settings[key]=values[key];render();},
 commit(){snapshot=null;},
 cancel(){if(!snapshot)return;Object.assign(settings,snapshot);snapshot=null;render();}
};}
