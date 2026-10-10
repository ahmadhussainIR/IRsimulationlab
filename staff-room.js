(() => {
const $=id=>document.getElementById(id),room=$('clinicalRoom'),motion=window.IRStaffMotion;
const canvas=document.createElement('canvas');canvas.className='staff-action-layer';canvas.setAttribute('aria-label','Resident and scrub nurse participating at the selected access site');room.append(canvas);const ctx=canvas.getContext('2d');
const sheet=new Image();sheet.src='assets/staff-actions.png';
const people=[room.querySelector('.clinician-resident'),room.querySelector('.clinician-nurse')];people.forEach(p=>p.hidden=true);
const walk=['resident','nurse'].map(name=>{const im=new Image();im.src=`assets/${name}-walk.png`;return im});
const bar=document.createElement('div');bar.className='staff-activity';bar.innerHTML='<div><strong id="staffAccess">Femoral access</strong><span id="residentAction"></span><span id="nurseAction"></span></div><button id="rehearseAccess">Replay access scene</button>';room.after(bar);
const s={access:'Femoral',tool:'wire',accessUntil:0,exchangeUntil:0,moveUntil:0,torqueUntil:0,injectUntil:0,shielded:false,traveling:false,direction:1};
let journey=null,last=0,previous=null,previousPose=null;
function setup(access){s.access=access;s.accessUntil=performance.now()+6000;s.exchangeUntil=s.moveUntil=s.torqueUntil=s.injectUntil=0;previous=window.IRNavigation.get().position+window.IRNavigation.get().catheterPosition;}
window.addEventListener('ir:access',e=>setup(e.detail.access));
$('rehearseAccess').onclick=()=>setup(s.access);
window.addEventListener('ir:tool-selected',e=>{if(s.tool!==e.detail){s.tool=e.detail;s.exchangeUntil=performance.now()+1600;s.accessUntil=0;}});
window.addEventListener('ir:torque',()=>{s.torqueUntil=performance.now()+750;s.accessUntil=s.exchangeUntil=0;});
window.addEventListener('ir:navigation',()=>{const n=window.IRNavigation.get(),value=n.position+n.catheterPosition;if(previous!==null&&value!==previous){s.direction=Math.sign(value-previous);s.moveUntil=performance.now()+1100;s.accessUntil=s.exchangeUntil=0;}previous=value;});
window.addEventListener('ir:contrast',()=>{s.injectUntil=performance.now()+2100;s.accessUntil=s.exchangeUntil=0;});
window.addEventListener('ir:shield',e=>{s.shielded=e.detail;s.traveling=true;s.accessUntil=s.exchangeUntil=s.moveUntil=s.injectUntil=s.torqueUntil=0;journey={start:performance.now(),out:s.shielded,origins:s.shielded?(previousPose||poses(performance.now())):poses(performance.now())};room.classList.remove('team-shielded');});
window.addEventListener('ir:procedure',()=>{s.accessUntil=0;s.exchangeUntil=0;});
$('suiteReset').addEventListener('click',()=>setup(s.access));
function poses(t){const a=motion.anchor(s.access,Number($('tableTravel').value));
 // Both hands meet at the hub; the scrub nurse stands slightly behind the operator.
 const assist=t<s.exchangeUntil||t<s.accessUntil||t<s.injectUntil||window.IRNavigation.get().delivering;
 const nurse=assist?[a[0]-5.5,a[1]+.7]:[a[0]-11,a[1]+3];
 return [{hand:a,width:24},{hand:nurse,width:22}];
}
const fingertips=[[[.94,.392],[.918,.399],[.918,.398],[.918,.399]],[[.946,.374],[.918,.385],[.918,.387],[.918,.388]]];
function bounds(p,i,f){const [x,y]=fingertips[i][f],h=p.width*2;return [p.hand[0]-p.width*x,p.hand[1]-h*y,p.width,h];}
function drawPerson(p,i,f){if(!sheet.complete||!sheet.naturalWidth)return;const b=bounds(p,i,f);ctx.drawImage(sheet,f*sheet.width/4,i*sheet.height/2,sheet.width/4,sheet.height/2,...b);}
function drawWalk(i,loc,t,flip){const im=walk[i];if(!im.complete||!im.naturalWidth)return;const f=Math.floor(t/130)%8;ctx.save();ctx.translate(loc[0]+(flip?loc[2]:0),loc[1]);ctx.scale(flip?-1:1,1);ctx.drawImage(im,(f%4)*im.width/4,Math.floor(f/4)*im.height/2,im.width/4,im.height/2,0,0,loc[2],loc[2]*2.25);ctx.restore();}
function drawDevice(a,kind,t,active){const f=motion.family(s.tool),pulse=active?(Math.sin(t/170)+1)/2:0;ctx.save();ctx.translate(a[0],a[1]);ctx.lineCap='round';
 // The external device ends at the same hub as the resident's stabilizing hand.
 ctx.fillStyle='#56adc4';ctx.fillRect(-.75,-.3,1.05,.6);ctx.strokeStyle='#a8d5df';ctx.lineWidth=.15;ctx.beginPath();ctx.moveTo(.3,0);ctx.lineTo(.85,.35);ctx.stroke();
 if(kind==='inject'||f==='syringe'){ctx.strokeStyle='#afd2dc';ctx.lineWidth=.18;ctx.beginPath();ctx.moveTo(-.6,0);ctx.bezierCurveTo(-3,-2,-4,2,-5,1);ctx.stroke();ctx.translate(-5,1);ctx.rotate(-.2);const g=ctx.createLinearGradient(0,-.6,0,.6);g.addColorStop(0,'#dfeaf3');g.addColorStop(.5,'#91b7cd');g.addColorStop(1,'#c4e3eb');ctx.fillStyle=g;ctx.fillRect(-3.3,-.48,3.3,.96);ctx.strokeStyle='#485e73';ctx.lineWidth=.08;for(let x=-3;x<0;x+=.5){ctx.beginPath();ctx.moveTo(x,-.45);ctx.lineTo(x,-.13);ctx.stroke();}ctx.fillStyle='#d4e6ed';ctx.fillRect(-5+pulse,-.13,2,.26);ctx.fillRect(-5+pulse,-.55,.18,1.1);
 }else if(f==='probe'){ctx.fillStyle='#e3e8e9';ctx.beginPath();ctx.ellipse(-1,-.3,1.1,.7,-.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#596a7b';ctx.lineWidth=.3;ctx.beginPath();ctx.moveTo(-1.8,-.5);ctx.quadraticCurveTo(-6,-5,-10,0);ctx.stroke();
 }else{ctx.strokeStyle=f==='wire'?'#ced5dc':'#efe2bb';ctx.lineWidth=f==='wire'?.12:.22;ctx.beginPath();ctx.moveTo(-.5,0);ctx.bezierCurveTo(-3, -.7-pulse*.25,-6, .4,-8,3+pulse*.5);ctx.stroke();if(kind==='torque'){ctx.save();ctx.translate(-2.8,-.3);ctx.rotate(Number($('wireTorque').value)*Math.PI/180);ctx.fillStyle='#529ecd';ctx.fillRect(-.65,-.35,1.3,.7);ctx.restore();}if(f==='needle'||kind==='access'){ctx.strokeStyle='#f1f6f6';ctx.lineWidth=.14;ctx.beginPath();ctx.moveTo(-3,-1);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle='#68b5d9';ctx.fillRect(-3.5,-1.25,.7,.5);}}
 ctx.restore();}
function render(t){requestAnimationFrame(render);if(document.hidden||$('suite').hidden||t-last<1000/24)return;last=t;
if(journey&&t-journey.start>=4800){journey=null;s.traveling=false;previousPose=poses(t);}
const n=window.IRNavigation.get();s.holding=n.holding;s.delivering=n.delivering;s.injecting=t<s.injectUntil;s.playing=window.IRLab.isPlaying();const act=motion.action(s,t);room.dataset.staffAction=act.kind;room.dataset.staffAccess=s.access;
$('staffAccess').textContent=s.access+' · '+(s.shielded?'Control room':'Procedure team');$('residentAction').textContent='Resident · '+act.resident;$('nurseAction').textContent='Scrub nurse · '+act.nurse;$('rehearseAccess').disabled=s.shielded||s.traveling;
const r=room.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*d),h=Math.round(r.height*d);if(!w||!h)return;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.setTransform(w/100,0,0,h/100,0,0);ctx.clearRect(0,0,100,100);
if(!$('showTeam').checked)return;
const target=poses(t);if(!previousPose)previousPose=target;const reduced=$('reduceMotion').checked||matchMedia('(prefers-reduced-motion: reduce)').matches;
if(journey){const p=Math.min(1,(t-journey.start)/4800),q=journey.out?p:1-p;for(let i=0;i<2;i++){const start=bounds(journey.origins[i],i,2),route=[start,[12+i*6,40,22],[18+i*5,26,14],[30+i*7,27,8]],seg=Math.min(2,Math.floor(q*3)),f=q*3-seg,a=route[seg],b=route[seg+1],loc=a.map((v,j)=>v+(b[j]-v)*f);drawWalk(i,loc,reduced?0:t-journey.start,journey.out?b[0]<a[0]:b[0]>a[0]);}if(p===1){journey=null;s.traveling=false;previousPose=target;}return;}
if(s.shielded){people.forEach((im,i)=>{if(im.complete&&im.naturalWidth)ctx.drawImage(im,30+i*7,27,8,18)});return;}
// Smooth repositioning keeps the staff attached to a moving table without snapping.
previousPose=target.map((p,i)=>({width:p.width,hand:p.hand.map((v,j)=>previousPose[i].hand[j]+(v-previousPose[i].hand[j])*.25)}));
const f=motion.frame(t,act.moving,reduced);drawPerson(previousPose[1],1,f);drawPerson(previousPose[0],0,f);drawDevice(previousPose[0].hand,act.kind,t,act.moving&&!reduced);
}
requestAnimationFrame(render);
})();
