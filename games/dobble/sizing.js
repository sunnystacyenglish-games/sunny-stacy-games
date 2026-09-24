// Relative sizes are sampled once per card, then reused through viewport changes.
export function itemScales(count,random=Math.random){
  const scales=Array.from({length:count},()=>.76+(random()+random()+random())*.16);
  if(count>1&&Math.max(...scales)-Math.min(...scales)<.18){const a=Math.floor(random()*count),b=(a+1+Math.floor(random()*(count-1)))%count;scales[a]=.86;scales[b]=1.10;}
  return scales;
}
export function sizeProfile(count,scale){
  const imageBase=count<=3?.175:count<=6?.16:count<=8?.145:.135;
  const imageMax=count>4?.18:.20;
  return {image:Math.max(.05,Math.min(imageMax,imageBase*scale)),font:(count<=4?.085:.065)*scale,wordWidth:Math.min(.20,.18*scale)};
}
