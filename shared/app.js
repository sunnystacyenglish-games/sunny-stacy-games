import {APP_VERSION} from './version.js';
if(APP_VERSION){
 const make=()=>{const node=document.createElement('span');node.className='app-version';node.textContent='Sunny & Stacy Games · v'+APP_VERSION;return node;};
 const slots=document.querySelectorAll('[data-app-version]');
 if(slots.length){for(const slot of slots)slot.append(make());}else{document.body.classList.add('has-app-version');document.body.append(make());}
 const attach=()=>{for(const dialog of document.querySelectorAll('dialog'))if(!dialog.querySelector('.app-version'))dialog.append(make());};
 attach();new MutationObserver(attach).observe(document.body,{childList:true,subtree:true});
}
