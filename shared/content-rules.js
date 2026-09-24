export const MIN_SET_ITEMS=5;
export const imageTypes=['image/png','image/jpeg','image/webp'];
export function validateSet(set){
  if(set?.imageSource!==undefined&&!['emoji','url','upload','mixed'].includes(set.imageSource))throw Error('Invalid set image source.');
  if(!set||typeof set.id!=='string'||!set.id||set.id.length>120||typeof set.name!=='string'||!set.name.trim()||set.name.length>120)throw Error('Give your set a name (up to 120 characters).');
  if(!Array.isArray(set.items)||!set.items.length||set.items.length>500)throw Error('A set needs between 1 and 500 items.');
  const ids=new Set();let imageBytes=0;
  for(const [i,item] of set.items.entries()){
    if(!item||typeof item.id!=='string'||!item.id||item.id.length>120||ids.has(item.id))throw Error(`Item ${i+1}: invalid or duplicate ID.`);ids.add(item.id);
    if(typeof item.word!=='string'||!item.word.trim()||item.word.length>120)throw Error(`Item ${i+1}: enter a word (up to 120 characters).`);
    const image=item.image;
    if(!image||!['emoji','url','upload'].includes(image.type))throw Error(`Item ${i+1}: choose an image.`);
    if(image.type==='emoji'&&(typeof image.value!=='string'||!image.value.trim()||image.value.length>40))throw Error(`Item ${i+1}: enter an emoji.`);
    if(image.type==='url'){
      try{const url=new URL(image.value);if(url.protocol!=='https:'||url.username||url.password||url.href.length>4096)throw Error();}catch{throw Error(`Item ${i+1}: use a valid HTTPS image URL.`);}
    }
    if(image.type==='upload'&&(!(image.blob instanceof Blob)||!imageTypes.includes(image.blob.type)||!image.blob.size||image.blob.size>3*1024*1024))throw Error(`Item ${i+1}: upload a PNG, JPEG or WEBP image (stored size up to 3 MB).`);
    if(image.type==='upload')imageBytes+=image.blob.size;
  }
  if(imageBytes>24*1024*1024)throw Error('Uploaded images in one set must total less than 24 MB. Use smaller images or split the set.');
  return set;
}
export function validConceptCount(set){const seen=new Set();let count=0;for(const item of set?.items||[]){try{validateSet({id:'validation',name:'Validation',items:[item]});if(!seen.has(item.id)){seen.add(item.id);count++;}}catch{}}return count;}
export function validatePlayableSet(set){validateSet(set);if(validConceptCount(set)<MIN_SET_ITEMS)throw Error('Minimum: 5 valid items. Add words and images before saving or playing.');return set;}
export function canPlaySet(set){try{validatePlayableSet(set);return true;}catch{return false;}}
export function hasUsableWord(item){return typeof item?.word==='string'&&!!item.word.trim()&&item.word.length<=120;}
export function hasUsableImage(item){try{validateSet({id:'image-validation',name:'Image validation',items:[{id:'image',word:'image',image:item?.image}]});return true;}catch{return false;}}
