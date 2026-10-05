/* One paired synthetic acquisition, retained independently of the live monitor. */
(() => {
const $=id=>document.getElementById(id),empty=document.createElement('canvas');empty.width=empty.height=384;const e=empty.getContext('2d');e.fillStyle='#080e11';e.fillRect(0,0,384,384);e.textAlign='center';e.fillStyle='#a4bcc6';e.font='15px monospace';e.fillText('DSA / REFERENCE',192,170);e.font='12px monospace';e.fillText('Run DSA to acquire a study',192,198);
let frames=[],recording=false,playing=false,index=0,lastSample=-Infinity,lastReplay=0,territory='';
function notify(){const has=frames.length>0;$('dsaReplay').disabled=!has||recording;$('dsaReplay').textContent=playing?'Pause replay':'Replay DSA';$('dsaScrub').disabled=!has||recording;$('dsaScrub').max=Math.max(0,frames.length-1);$('dsaScrub').value=index;$('dsaStatus').textContent=recording?`Acquiring · ${frames.length} frames`:has?`Saved run · ${index+1}/${frames.length} · ${territory}`:'No saved DSA run';}
function clear(){frames=[];recording=playing=false;index=0;notify();}
function copy(source){const frame=document.createElement('canvas');frame.width=frame.height=384;frame.getContext('2d').drawImage(source,0,0,384,384);return frame;}
function update(raw,sub,t,on){if(on&&!recording){frames=[];index=0;playing=false;recording=true;lastSample=-Infinity;const n=window.IRNavigation?.get();territory=n?.contrastRoot?window.IRNavigation.nodes[n.contrastRoot]?.name||'Selected territory':'Synthetic study';}
 if(recording&&on&&raw&&t-lastSample>=200){lastSample=t;if(frames.length<42){frames.push({fluoro:copy(raw),dsa:copy(sub)});index=frames.length-1;}notify();}
 if(recording&&!on){recording=false;index=Math.min(10,frames.length-1);notify();}
}
$('dsaReplay').onclick=()=>{playing=!playing;lastReplay=performance.now();notify();};$('dsaScrub').oninput=e=>{index=Number(e.target.value);playing=false;notify();};
$('mainImageMode').onchange=e=>window.RadiologyViewer.configure('mode',e.target.value);
window.addEventListener('ir:procedure',()=>{clear();$('mainImageMode').value='fluoro'});$('suiteReset').addEventListener('click',clear);
function tick(t){requestAnimationFrame(tick);if(document.hidden)return;if(playing&&!recording&&frames.length&&t-lastReplay>=200){lastReplay=t;index=(index+1)%frames.length;notify();}}
window.IRAcquisition={update,getFrame:()=>frames[index]?.[$('referenceMode').value]||empty,get:()=>({recording,playing,index,count:frames.length,territory}),clear};notify();requestAnimationFrame(tick);
})();
