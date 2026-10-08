// Clipboard routing follows Concepts: image files only; ordinary text stays native.
export function bindCardImages(host,resolve,assign){
 let active=null;
 const locate=e=>e.target.closest?.('[data-card-id]');
 const activate=e=>{const row=locate(e);if(row)active=row.dataset.cardId;};
 const paste=e=>{if(document.querySelector('dialog[open]'))return;const file=[...(e.clipboardData?.items||[])].find(i=>i.kind==='file'&&i.type.startsWith('image/'))?.getAsFile();const card=resolve(locate(e)?.dataset.cardId||active);if(file&&card){e.preventDefault();assign(card,file);}};
 const over=e=>{if(![...(e.dataTransfer?.types||[])].includes('Files'))return;e.preventDefault();locate(e)?.classList.add('image-drop-target');};
 const leave=e=>{const row=locate(e);if(row&&!row.contains(e.relatedTarget))row.classList.remove('image-drop-target');};
 const drop=e=>{const file=[...(e.dataTransfer?.files||[])].find(f=>f.type.startsWith('image/'));if(!file)return;e.preventDefault();const row=locate(e);row?.classList.remove('image-drop-target');const card=resolve(row?.dataset.cardId);if(card){active=card.id;assign(card,file);}};
 host.addEventListener('focusin',activate);host.addEventListener('pointerdown',activate);document.addEventListener('paste',paste);host.addEventListener('dragover',over);host.addEventListener('dragleave',leave);host.addEventListener('drop',drop);
 return ()=>{host.removeEventListener('focusin',activate);host.removeEventListener('pointerdown',activate);document.removeEventListener('paste',paste);host.removeEventListener('dragover',over);host.removeEventListener('dragleave',leave);host.removeEventListener('drop',drop);};
}
