// Match unchanged fragments first, then retain identities for edited fragments.
// This keeps gap references stable when lines are inserted, moved or edited.
export function reconcileLines(previous,text,createId){
 const lines=text.split('\n'),used=new Set(),result=lines.map(value=>{const match=previous.find((p,i)=>!used.has(i)&&p.text===value);if(!match)return null;used.add(previous.indexOf(match));return match;});
 const remaining=previous.filter((_,i)=>!used.has(i));let cursor=0;
 return result.map((item,i)=>item||{...(remaining[cursor++]||{id:createId()}),text:lines[i]});
}
