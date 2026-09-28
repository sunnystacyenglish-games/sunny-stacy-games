import {siteContent} from './site-content.js';
document.querySelector('#intro').textContent=siteContent.intro;document.querySelector('#aboutCopy').textContent=siteContent.about;
for(const social of siteContent.socials){let valid=false;try{valid=new URL(social.url).protocol==='https:';}catch{}const el=document.createElement(valid?'a':'span');el.textContent=social.name;if(valid){el.href=social.url;el.target='_blank';el.rel='noopener noreferrer';}else{el.setAttribute('aria-disabled','true');el.title='Link coming soon';}document.querySelector('#socialLinks').append(el);}
document.querySelector('#year').textContent=new Date().getFullYear();

document.querySelector('.social-note').hidden=siteContent.socials.some(s=>{try{return new URL(s.url).protocol==='https:';}catch{return false;}});
