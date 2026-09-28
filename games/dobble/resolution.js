// undefined means no explicit request; an empty/missing explicit ID never falls back.
export function resolveSetReference(sets,requestedId,rememberedId){
 if(requestedId!==undefined)return sets.find(set=>set.id===requestedId)||null;
 return sets.find(set=>set.id===rememberedId)||sets.find(set=>set.id==='animals-1')||sets[0]||null;
}
