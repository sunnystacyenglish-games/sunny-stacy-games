// Overlay-only navigation; never touches game state or board geometry.
export function setupGameShell(shell){
 const handle=shell.querySelector('.drawer-handle'),panel=shell.querySelector('.drawer-panel');let timer,hover=false,pressedOpen=false;
 const cancel=()=>clearTimeout(timer);
 const open=()=>{cancel();shell.dataset.open='true';handle.setAttribute('aria-expanded','true');panel.inert=false;};
 const close=()=>{cancel();shell.dataset.open='false';handle.setAttribute('aria-expanded','false');panel.inert=true;};
 const later=()=>{cancel();timer=setTimeout(()=>{if(!hover&&!shell.contains(document.activeElement))close();},400);};
 shell.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;open();}});
 shell.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hover=false;later();}});
 handle.addEventListener('pointerdown',()=>{pressedOpen=shell.dataset.open==='true';});
 handle.addEventListener('click',e=>{if(e.detail===0?shell.dataset.open==='true':pressedOpen)close();else open();});
 shell.addEventListener('focusin',open);shell.addEventListener('focusout',later);
 document.addEventListener('pointerdown',e=>{if(!shell.contains(e.target)){if(shell.contains(document.activeElement))document.activeElement.blur();close();}});
 shell.addEventListener('keydown',e=>{if(e.key==='Escape'){handle.focus();close();e.preventDefault();}});
 panel.addEventListener('click',e=>{if(e.target.closest('a,button')){document.activeElement?.blur();close();}});
 close();
}
for(const shell of document.querySelectorAll('[data-game-shell]'))setupGameShell(shell);
