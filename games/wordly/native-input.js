// WebViews and mobile IMEs can deliver input without a useful keyboard keydown.
export function bindNativeInput(element,send,allowed){
 let composing=false;const reset=()=>{element.value=' ';element.setSelectionRange(1,1);};
 function consume(event){if(composing||event.isComposing)return;if(!allowed()){reset();return;}const text=element.value.replace(/ /g,'');if(event.inputType?.startsWith('delete'))send('Backspace','native');else for(const letter of text)if(/^[a-z]$/i.test(letter))send(letter.toUpperCase(),'native');reset();}
 element.addEventListener('input',consume);
 element.addEventListener('compositionstart',()=>{composing=true;});
 element.addEventListener('compositionend',()=>{composing=false;consume({});});
 element.addEventListener('beforeinput',event=>{if(event.inputType==='insertLineBreak'||event.inputType==='insertParagraph'){event.preventDefault();if(allowed())send('Enter','native');reset();}});
 element.addEventListener('keydown',event=>{if(event.isComposing||composing||event.ctrlKey||event.metaKey||event.altKey)return;if(event.key==='Enter'){event.preventDefault();if(!event.repeat&&allowed())send('Enter','native');}else if(event.key==='Backspace'){event.preventDefault();if(!event.repeat&&allowed())send('Backspace','native');}else if(event.repeat&&/^[a-z]$/i.test(event.key))event.preventDefault();});
 element.addEventListener('focus',reset);reset();return reset;
}
