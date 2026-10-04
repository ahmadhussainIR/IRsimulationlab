/* An explorable, deliberately simplified vessel graph. Not a clinical navigation model. */
(() => {
const N=(name,region,points,children=[],angle=0,blush=0)=>({name,region,points,children,angle,blush});
const nodes={
 brachial:N('Brachial artery','chest',[[870,710],[814,540],[758,393]],['axillary']),
 axillary:N('Axillary artery','chest',[[758,393],[702,290],[653,240]],['subclavian']),
 subclavian:N('Subclavian artery','chest',[[653,240],[586,210],[523,246]],['arch']),
 arch:N('Aortic arch','chest',[[523,246],[469,229],[455,299],[480,385]],['descending']),
 descending:N('Descending thoracic aorta','chest',[[480,385],[492,582],[496,914]],['aorta']),
 aorta:N('Abdominal aorta','abdomen',[[502,100],[510,360],[510,568]],['iliac']),
 iliac:N('Common iliac artery','abdomen',[[510,568],[571,665],[603,752]],['external']),
 external:N('External iliac artery','abdomen',[[603,752],[645,850],[660,903]],['femoral']),
 femoral:N('Common femoral artery','abdomen',[[660,903],[673,938],[681,981]],['sfa','profunda']),
 profunda:N('Profunda femoris · exploration','thigh',[[485,80],[355,249],[312,439]],[], -65),
 sfa:N('Superficial femoral artery','thigh',[[485,80],[491,266],[513,523],[521,684]],['distalsfa']),
 distalsfa:N('Distal superficial femoral artery','thigh',[[521,684],[536,813],[525,970]],['dga','popliteal']),
 dga:N('DGA · Descending genicular','knee',[[508,55],[455,202],[411,343],[386,470]],[], -50,.35),
 popliteal:N('Proximal popliteal artery','knee',[[508,55],[507,250],[518,401]],['slga','smga','mga','distalpop']),
 slga:N('SLGA · Superior lateral genicular','knee',[[518,401],[573,425],[625,462],[657,507]],[],55,.95),
 smga:N('SMGA · Superior medial genicular','knee',[[518,401],[468,425],[422,465],[385,507]],[],-55,.68),
 mga:N('MGA · Middle genicular · exploration','knee',[[518,401],[535,438],[544,481]],[],20),
 distalpop:N('Distal popliteal artery','knee',[[518,401],[523,510],[525,573]],['ilga','imga','ata','tpt']),
 ilga:N('ILGA · Inferior lateral genicular','knee',[[525,573],[580,577],[620,560],[649,550]],[],65,0),
 imga:N('IMGA · Inferior medial genicular','knee',[[525,573],[477,580],[430,562],[404,552]],[],-65,.52),
 ata:N('Anterior tibial artery','knee',[[525,573],[560,663],[587,737]],['atra','distalata'],35),
 atra:N('ATRA · Anterior tibial recurrent','knee',[[587,737],[617,697],[629,651],[621,604]],[],125,.78),
 distalata:N('Distal anterior tibial · exploration','knee',[[587,737],[602,850],[619,985]],[],0),
 tpt:N('Tibioperoneal trunk','knee',[[525,573],[517,684],[504,765]],['posterior','peroneal'],-25),
 posterior:N('Posterior tibial · exploration','knee',[[504,765],[467,871],[450,984]],[],-35),
 peroneal:N('Peroneal · exploration','knee',[[504,765],[536,870],[547,984]],[],30)
};
// Pelvic example: bilateral internal iliac divisions and selectable prostate origins.
nodes.pa_access=N('Common femoral artery · retrograde','pelvis',[[800,990],[761,848],[738,740]],['pa_external']);
nodes.pa_external=N('External iliac artery · retrograde','pelvis',[[738,740],[720,538],[673,349]],['pa_common']);
nodes.pa_common=N('Common iliac artery · access side','pelvis',[[673,349],[653,311],[640,275]],['r_internal','pa_bifurcation']);
nodes.pa_bifurcation=N('Aortic bifurcation','pelvis',[[640,275],[575,185],[512,103]],['r_common','l_common']);
for(const side of ['r','l']){const flip=side==='l',P=pts=>pts.map(([x,y])=>[flip?1024-x:x,y]),prefix=flip?'Left':'Right';
 nodes[side+'_common']=N(prefix+' common iliac','pelvis',P([[512,103],[590,209],[640,275]]),[side+'_internal',side+'_external'],flip?-35:35);
 nodes[side+'_external']=N(prefix+' external iliac · exploration','pelvis',P([[640,275],[720,538],[738,740]]),[],flip?-15:15);
 nodes[side+'_internal']=N(prefix+' internal iliac','pelvis',P([[640,275],[607,374],[591,442]]),[side+'_posterior',side+'_anterior'],flip?55:-55);
 nodes[side+'_posterior']=N(prefix+' posterior division','pelvis',P([[591,442],[686,451],[723,425]]),[side+'_superiorgluteal',side+'_iliolumbar'],flip?-65:65);
 nodes[side+'_superiorgluteal']=N(prefix+' superior gluteal · non-target','pelvis',P([[723,425],[778,445],[819,489]]),[],35);
 nodes[side+'_iliolumbar']=N(prefix+' iliolumbar · non-target','pelvis',P([[723,425],[703,360],[675,303]]),[],-55);
 nodes[side+'_anterior']=N(prefix+' anterior division','pelvis',P([[591,442],[571,500],[570,548]]),[side+'_vesical',side+'_obturator',side+'_rectal',side+'_pudendal',side+'_inferiorgluteal',side+'_prostate'],0);
 nodes[side+'_vesical']=N(prefix+' superior vesical · bladder','pelvis',P([[570,548],[541,563],[525,610]]),[],-50);
 nodes[side+'_obturator']=N(prefix+' obturator · non-target','pelvis',P([[570,548],[680,625],[706,741]]),[],60);
 nodes[side+'_rectal']=N(prefix+' middle rectal · non-target','pelvis',P([[570,548],[550,680],[536,784]]),[],-20);
 nodes[side+'_pudendal']=N(prefix+' internal pudendal','pelvis',P([[570,548],[643,643],[654,759],[605,839]]),[],40);
 nodes[side+'_inferiorgluteal']=N(prefix+' inferior gluteal · non-target','pelvis',P([[570,548],[703,630],[761,667]]),[],75);
 nodes[side+'_prostate']=N(prefix+' prostatic artery','pelvis',P([[570,548],[581,611],[548,655],[543,703]]),[side+'_central',side+'_capsular'],-45);
 nodes[side+'_central']=N(prefix+' central prostatic territory','pelvis',P([[543,703],[527,741],[520,776]]),[],-20,.9);
 nodes[side+'_capsular']=N(prefix+' capsular prostatic territory','pelvis',P([[543,703],[572,763],[553,804]]),[],40,.62);
}
const setPelvicVariant=(variant)=>{for(const side of ['r','l']){for(const k of ['anterior','vesical','obturator','pudendal'])nodes[side+'_'+k].children=nodes[side+'_'+k].children.filter(x=>x!==side+'_prostate');const parent={direct:'anterior',vesical:'vesical',obturator:'obturator',pudendal:'pudendal'}[variant]||'anterior';nodes[side+'_'+parent].children.push(side+'_prostate');const pts=nodes[side+'_prostate'].points;pts[0]=nodes[side+'_'+parent].points.at(-1).slice();}};
const targets=['dga','slga','smga','ilga','imga','atra','r_central','r_capsular','l_central','l_capsular'];
let s; const reset=(access='Femoral',scenario='gae',variant='direct')=>{setPelvicVariant(variant);nodes.aorta.children=scenario==='pae'?['pa_bifurcation']:['iliac'];s={access,scenario,variant,path:[access==='Brachial'?'brachial':scenario==='pae'?'pa_access':'femoral'],position:0,torque:0,tool:'wire',catheter:null,contrastUntil:0,assessed:{},treated:{},delivering:false,roadmap:false,follow:true,message:'Advance the wire through the access vessel.',lastTime:0,holding:0};return s};reset();
const current=()=>nodes[s.path.at(-1)];
const id=()=>s.path.at(-1);
const ready=()=>s.catheter===id()&&s.position>=.95;
const emit=()=>window.dispatchEvent(new CustomEvent('ir:navigation'));
function status(text){s.message=text;emit();return false}
function move(amount){if(s.delivering)return status('Stop delivery before moving the wire.');if(window.IRExposure?.get().shielded)return status('Return the operator to the table before navigating.');if(!['wire','hydrophilic','microwire'].includes(s.tool))return status('Select a guidewire or microwire to navigate.');if(amount>0&&s.position>=.99&&current().children.length){const branches=current().children.slice().sort((a,b)=>Math.abs(s.torque-nodes[a].angle)-Math.abs(s.torque-nodes[b].angle));if(Math.abs(s.torque-nodes[branches[0]].angle)<=25)return enter(branches[0]);return status('Tip is not aligned with an available branch. Rotate torque, then advance.');}s.position=Math.min(1,Math.max(0,s.position+amount));if(s.position===0&&amount<0&&s.path.length>1){s.path.pop();s.position=1;s.catheter=null;}s.message=s.position>=1?(current().children.length?'At a junction: steer the tip with torque, then advance into the aligned branch.':'At the end of this modeled branch. Retract to explore another route.'):'Advancing through '+current().name;emit();return true}
function enter(next){if(!current().children.includes(next))return false;if(s.position<.99)return status('Advance to the junction before choosing a branch.');if(s.delivering)return false;if(Math.abs(s.torque-nodes[next].angle)>25)return status('Align the torque control with the selected branch’s training angle.');s.path.push(next);s.position=0;s.catheter=null;s.message='Entered '+current().name;emit();return true}
function seat(){if(window.IRExposure?.get().shielded)return status('Return the operator to the table first.');if(s.tool!=='microcatheter')return status('Select the microcatheter first.');if(s.position<.95)return status('Advance the wire to the distal marker before tracking the microcatheter.');s.catheter=id();s.message='Microcatheter tracked over the wire. Run contrast to inspect this territory.';emit();return true}
function inject(){if(window.IRExposure&&!window.IRExposure.active())return status('Turn on fluoroscopy or start a DSA run to assess contrast.');s.contrastUntil=performance.now()+5000;if(ready()){s.assessed[id()]=true;s.message=current().blush>0?(s.treated[id()]>=1?'Post-treatment run: modeled blush resolved; parent artery remains patent.':'Selective run: simulated synovial blush is visible.'):'No abnormal blush in this modeled territory. Embolization is unavailable.'}else s.message='Overview contrast run. Track the microcatheter for selective assessment.';emit()}
function start(){if(window.IRExposure&&!window.IRExposure.active())return status('Turn on fluoroscopy before simulated delivery.');if(window.IRExposure?.get().shielded)return status('Return the operator to the table before delivery.');if(!ready())return status('Position the microcatheter in the selected branch first.');if(!s.assessed[id()])return status('Run selective contrast before assessing embolization.');if(!current().blush)return status('This territory has no abnormal blush in the teaching case.');if(s.tool!=='particles')return status('Select embolic particles from this GAE tray.');if(s.treated[id()]>=1)return status('Modeled blush endpoint already reached. Delivery remains stopped.');s.delivering=true;s.message='Simulated delivery active. Stop at any time; the model stops when blush resolves.';emit();return true}
function stop(){s.delivering=false;s.holding=0;s.message='Delivery stopped. Run contrast to review the selected territory.';emit()}
function tick(ms){const dt=s.lastTime?Math.min(.08,(ms-s.lastTime)/1000):0;s.lastTime=ms;if(document.hidden)return;if(s.holding)move(s.holding*dt*.32);if(s.delivering&&window.IRExposure&&!window.IRExposure.active()){stop();return;}if(s.delivering){s.treated[id()]=Math.min(1,(s.treated[id()]||0)+dt*.115);if(s.treated[id()]>=1){s.delivering=false;s.message='Teaching endpoint reached: abnormal blush resolved. Delivery stopped; parent artery flow preserved.';}emit()}}
function point(points,p){let z=p*(points.length-1),i=Math.min(points.length-2,Math.floor(z)),t=z-i;const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];return [0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t))}
function path(ctx,pts,width,color,amount=1){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<=40;i++)ctx.lineTo(...point(pts,amount*i/40));ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.stroke()}
function draw(ctx,clock){const node=current(),region=node.region,tip=point(node.points,s.position),active=s.contrastUntil>performance.now(),alpha=active?.68:s.roadmap?.22:.035;ctx.save();if(s.follow){const zoom=1.13;ctx.translate(512,512);ctx.scale(zoom,zoom);ctx.translate(-512,-Math.max(385,Math.min(635,tip[1])))}
 for(const [key,n] of Object.entries(nodes)){if(n.region!==region)continue;path(ctx,n.points,targets.includes(key)?5.5:12,`rgba(13,15,17,${alpha})`);if(n.blush&&active){const end=n.points.at(-1),residual=n.blush*(1-(s.treated[key]||0));for(let i=0;i<34;i++){const a=i*2.4,r=8+(i%7)*5;ctx.beginPath();ctx.arc(end[0]+Math.cos(a)*r,end[1]+Math.sin(a)*r,5+(i%4)*2,0,Math.PI*2);ctx.fillStyle=`rgba(17,18,19,${residual*.065})`;ctx.fill();}for(let j=0;j<7;j++)path(ctx,[n.points.at(-2),end,[end[0]+Math.cos(j)*30,end[1]+Math.sin(j)*24]],1,`rgba(17,18,19,${residual*alpha*.5})`);}}
 for(const key of s.path){const n=nodes[key];if(n.region!==region)continue;const amt=key===id()?s.position:1;path(ctx,n.points,3.2,'rgba(238,238,238,.22)',amt);path(ctx,n.points,2.5,'#1d1d1d',amt);if(s.catheter===key)path(ctx,n.points,3.8,'rgba(22,22,22,.72)',amt)}
 ctx.beginPath();ctx.moveTo(tip[0],tip[1]);const a=(s.torque-90)*Math.PI/180;ctx.quadraticCurveTo(tip[0]+Math.cos(a)*13,tip[1]+Math.sin(a)*13,tip[0]+Math.cos(a)*27,tip[1]+Math.sin(a)*27);ctx.strokeStyle='#181818';ctx.lineWidth=2.8;ctx.stroke();ctx.restore();ctx.fillStyle='#eef3ed';ctx.font='16px monospace';ctx.textAlign='left';ctx.fillText('LIVE POSITION: '+node.name.toUpperCase(),35,110);ctx.fillText('WIRE '+Math.round(s.position*100)+'%  |  TORQUE '+s.torque+'°',35,137);ctx.fillText('SIMPLIFIED VESSEL GRAPH • NOT PATIENT ANATOMY',35,163);
}
window.IRNavigation={nodes,targets,current,id,get:()=>s,reset(access,scenario,variant){reset(access,scenario,variant);emit()},move,enter,seat,inject,start,stop,tick,draw,setTool(t){s.tool=t;if(s.delivering&&t!=='particles')stop();emit()},setTorque(v){s.torque=Number(v);emit()},hold(v){s.holding=v},setRoadmap(v){s.roadmap=v;emit()},setFollow(v){s.follow=v;emit()}};
})();
