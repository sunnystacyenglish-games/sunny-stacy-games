// Relative sizes are sampled once per card, then reused through viewport changes.
export function itemScales(count,random=Math.random){
  const scales=Array.from({length:count},()=>.76+(random()+random()+random())*.16);
  if(count>1&&Math.max(...scales)-Math.min(...scales)<.18){const a=Math.floor(random()*count),b=(a+1+Math.floor(random()*(count-1)))%count;scales[a]=.82+random()*.06;scales[b]=1.08+random()*.08;}
  return scales;
}
export function sizeProfile(count,scale){
  const imageBase=count<=3?.175:count<=6?.16:count<=8?.145:.135;
  // Leave the small half unchanged; amplify only above-baseline sizes.
  const enlarged=scale<=1?scale:1+(scale-1)*3;
  const imageMax=count>4?.19:.20;
  return {image:Math.max(.05,Math.min(imageMax,imageBase*enlarged)),font:(count<=4?.085:.065)*enlarged,wordWidth:Math.min(.20,.18*enlarged)};
}
