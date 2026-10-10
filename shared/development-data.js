export const issueStatuses = ['Known','In Progress','Fix Pending Verification','Fixed'];
export function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const date=new Date(value+'T00:00:00Z');return Number.isFinite(+date)&&date.toISOString().slice(0,10)===value;}
export function publishedUpdates(data){return (data.updates||[]).filter(x=>x&&x.published===true&&x.verified===true).slice().sort((a,b)=>(validDate(b.date)?b.date:'').localeCompare(validDate(a.date)?a.date:''));}
export function activeIssues(data){return (data.knownIssues||[]).filter(x=>x&&issueStatuses.includes(x.status)&&x.status!=='Fixed');}
export function roadmapItems(data,status){return (data.roadmap||[]).filter(x=>x&&x.status===status);}

// This is a manually curated publication file, not an inferred release feed.
export function normalizeFeed(source){
 if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Invalid updates document.');
 const statuses={known:'Known',in_progress:'In Progress','in-progress':'In Progress','In Progress':'In Progress',fix_pending_verification:'Fix Pending Verification','fix-pending-verification':'Fix Pending Verification','Fix Pending Verification':'Fix Pending Verification',fixed:'Fixed',Known:'Known',Fixed:'Fixed',planned:'Coming Next','Coming Next':'Coming Next'};
 const types={new:'New',improved:'Improved',fixed:'Fixed',New:'New',Improved:'Improved',Fixed:'Fixed'};
 const result={};
 for(const key of ['updates','knownIssues','roadmap']){
  if(source[key]!==undefined&&!Array.isArray(source[key]))throw Error('Invalid '+key+' list.');
  const ids=new Set();result[key]=(source[key]||[]).map(item=>{
   if(!item||typeof item.id!=='string'||!item.id.trim()||ids.has(item.id)||typeof item.title!=='string'||!item.title.trim())throw Error('Each '+key+' entry needs a unique ID and title.');ids.add(item.id);
   for(const field of ['description','area','date','version'])if(item[field]!==undefined&&typeof item[field]!=='string')throw Error('Invalid '+field+'.');
   for(const field of ['published','verified'])if(item[field]!==undefined&&typeof item[field]!=='boolean')throw Error('Invalid '+field+'.');
   if(key==='updates'){if(!types[item.type])throw Error('Use new, improved or fixed for update type.');return {...item,type:types[item.type],published:item.published!==false,verified:item.verified!==false};}
   const status=statuses[item.status];if(!(key==='knownIssues'?issueStatuses:['In Progress','Coming Next']).includes(status))throw Error('Invalid '+key+' status.');return {...item,status};
  });
 }
 return result;
}
export async function loadDevelopmentFeed(){const response=await fetch(new URL('../updates.json',import.meta.url),{cache:'no-cache'});if(!response.ok)throw Error('Updates unavailable.');return normalizeFeed(await response.json());}
