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
const setPelvicVariant=(variant)=>{for(const side of ['r','l']){for(const k of ['anterior','vesical','obturator','pudendal'])nodes[side+'_'+k].children=nodes[side+'_'+k].children.filter(x=>x!==side+'_prostate');for(const k of ['prostate','pudendal'])nodes[side+'_'+k].children=nodes[side+'_'+k].children.filter(x=>x!==side+'_capsular');const capsularParent=variant==='dual'?'pudendal':'prostate';nodes[side+'_'+capsularParent].children.push(side+'_capsular');nodes[side+'_capsular'].points[0]=nodes[side+'_'+capsularParent].points.at(-1).slice();const parent={direct:'anterior',vesical:'vesical',dual:'vesical',obturator:'obturator',pudendal:'pudendal'}[variant]||'anterior';nodes[side+'_'+parent].children.push(side+'_prostate');const pts=nodes[side+'_prostate'].points;pts[0]=nodes[side+'_'+parent].points.at(-1).slice();}};
// Named branch families are literature-informed; coordinates and angles are illustrative.
function addBranch(parent,key,name,pts,angle,blush,territory){nodes[key]=N(name,nodes[parent].region,[nodes[parent].points.at(-1).slice(),...pts],[],angle,blush);nodes[key].territory=territory;nodes[key].caliber=2.8;nodes[parent].children.push(key);}
addBranch('dga','dga_articular','DGA · Osteoarticular branch',[[364,481],[401,496],[415,514]],-30,.35,'Medial periarticular / synovial territory');
addBranch('dga','dga_saphenous','DGA · Saphenous branch',[[331,520],[292,591],[280,677]],-85,0,'Medial skin and soft tissue · non-target in this case');
addBranch('dga','dga_muscular','DGA · Muscular branch',[[353,424],[326,378],[307,338]],70,0,'Vastus medialis / muscle · non-target in this case');
for(const [key,sign] of [['slga',1],['smga',-1],['ilga',1],['imga',-1],['atra',1]]){const end=nodes[key].points.at(-1),blush=nodes[key].blush;
 addBranch(key,key+'_articular',key.toUpperCase()+' · Articular branch',[[end[0]-sign*23,end[1]+12],[end[0]-sign*36,end[1]+33],[end[0]-sign*15,end[1]+52]],-25,blush,'Periarticular synovial territory');
 addBranch(key,key+'_cutaneous',key.toUpperCase()+' · Cutaneous branch',[[end[0]+sign*25,end[1]+9],[end[0]+sign*46,end[1]+37],[end[0]+sign*68,end[1]+58]],65,0,'Skin / superficial soft tissue · non-target in this case');
 nodes[key].blush=0;nodes[key].territory='Branching genicular pedicle · articular and cutaneous supply';nodes[key].caliber=5.2;
}
nodes.dga.blush=0;nodes.dga.territory='Descending genicular pedicle · osteoarticular, saphenous and muscular branches';
addBranch('profunda','medial_circumflex','Medial circumflex femoral · exploration',[[351,478],[418,470],[451,438]],50,0,'Hip / proximal thigh');
addBranch('profunda','lateral_circumflex','Lateral circumflex femoral · exploration',[[284,477],[229,501],[196,542]],-55,0,'Lateral thigh');
addBranch('lateral_circumflex','descending_lcfa','Descending lateral circumflex branch',[[222,653],[263,807],[303,971]],15,0,'Anterior thigh; potential contribution to the knee network');
for(const side of ['r','l']){const flip=side==='l',P=pts=>pts.map(([x,y])=>[flip?1024-x:x,y]),label=flip?'Left':'Right';
 nodes[side+'_central'].name=label+' anteromedial / central gland branch';nodes[side+'_central'].territory='Central gland territory';
 nodes[side+'_capsular'].name=label+' posterolateral / peripheral gland branch';nodes[side+'_capsular'].territory='Peripheral and caudal gland territory';
 addBranch(side+'_vesical',side+'_bladder',label+' bladder-wall branches',P([[517,633],[508,658],[496,681]]),-20,0,'Bladder wall · non-target in this case');
 addBranch(side+'_pudendal',side+'_perineal',label+' perineal branch',P([[638,862],[672,900],[701,918]]),55,0,'Perineum · non-target in this case');
 addBranch(side+'_pudendal',side+'_penile',label+' distal penile supply',P([[572,868],[547,927],[519,979]]),-40,0,'Penile territory · non-target in this case');
 addBranch(side+'_posterior',side+'_lateral_sacral',label+' lateral sacral branch',P([[675,476],[634,505],[623,571]]),-40,0,'Sacral territory · non-target in this case');
}
const targets=Object.keys(nodes).filter(k=>nodes[k].blush>0);
for(const [key,n] of Object.entries(nodes)){n.caliber??=key.includes('central')||key.includes('capsular')?3.5:key.includes('prostate')?5:targets.includes(key)?4.5:n.region==='knee'?8:12;n.territory??=n.blush?'Modeled tissue perfusion territory':n.children.length?'Parent artery / downstream branches':'Exploration territory; no target blush in this case';}

let s; const reset=(access='Femoral',scenario='gae',variant='direct')=>{setPelvicVariant(variant);nodes.aorta.children=scenario==='pae'?['pa_bifurcation']:['iliac'];s={access,scenario,variant,path:[access==='Brachial'?'brachial':scenario==='pae'?'pa_access':'femoral'],position:0,torque:0,tool:'wire',catheter:null,catheterPath:[],catheterPosition:0,contrastUntil:0,contrastRoot:null,contrastPosition:0,contrastTerritory:[],contrastAcquisition:null,contrastTransit:{},anatomyLabels:false,assessed:{},treated:{},delivering:false,deliveryTarget:null,roadmap:false,follow:true,message:'Advance the wire through the access vessel.',lastTime:0,holding:0};return s};reset();
const current=()=>nodes[s.path.at(-1)];
const id=()=>s.path.at(-1);
const wireTools=['wire','hydrophilic','microwire'],catheterTools=['microcatheter','liquidMicro'];
const ready=()=>!!s.catheter&&s.catheterPosition>=.95;
// The guidewire establishes the route. The microcatheter has its own tip on that route.
function display(){const catheter=catheterTools.includes(s.tool)||(!!s.catheter&&['syringe','particles','evoh','nbca','y90','chemo','oil'].includes(s.tool));const route=catheter?(s.catheterPath.length?s.catheterPath:[s.path[0]]):s.path;const key=route.at(-1);return {id:key,node:nodes[key],position:catheter?s.catheterPosition:s.position,path:route.slice(),device:catheter?'catheter':'wire'};}
function downstream(root){const seen=new Set(),queue=[root];while(queue.length){const key=queue.shift();if(!nodes[key]||seen.has(key))continue;seen.add(key);queue.push(...nodes[key].children)}return [...seen];}
const emit=()=>window.dispatchEvent(new CustomEvent('ir:navigation'));
function status(text){s.message=text;emit();return false}
function moveCatheter(amount){
 if(!s.catheterPath.length){s.catheterPath=[s.path[0]];s.catheter=s.path[0];s.catheterPosition=0;}
 const depth=s.catheterPath.length-1,wireDepth=s.path.length-1;
 if(amount>0&&s.catheterPosition>=.99&&depth<wireDepth){s.catheterPath.push(s.path[depth+1]);s.catheter=s.catheterPath.at(-1);s.catheterPosition=0;s.message='Microcatheter entered '+nodes[s.catheter].name+' along the guidewire route.';emit();return true;}
 const previous=s.catheterPosition,limit=depth===wireDepth?s.position:1;
 s.catheterPosition=Math.max(0,Math.min(limit,s.catheterPosition+amount));
 if(amount<0&&s.catheterPosition===0&&depth>0){s.catheterPath.pop();s.catheter=s.catheterPath.at(-1);s.catheterPosition=1;}
 if(amount>0&&depth===wireDepth&&s.catheterPosition===previous)return status('Microcatheter is at the wire tip. Advance the guidewire before tracking farther.');
 s.message=(amount<0?'Retracting':'Tracking')+' microcatheter through '+nodes[s.catheter].name+(depth===wireDepth&&s.catheterPosition>=s.position?' · at the wire tip.':'.');emit();return true;
}
function move(amount){
 if(!Number.isFinite(amount)||!amount)return false;
 if(s.delivering)return status('Stop delivery before moving a device.');
 if(window.IRExposure?.get().shielded)return status('Return the operator to the table before navigating.');
 if(catheterTools.includes(s.tool))return moveCatheter(amount);
 if(!wireTools.includes(s.tool))return status('Select a guidewire, microwire or microcatheter to navigate.');
 if(amount>0&&s.position>=.99&&current().children.length){const branches=current().children.slice().sort((a,b)=>Math.abs(s.torque-nodes[a].angle)-Math.abs(s.torque-nodes[b].angle));if(Math.abs(s.torque-nodes[branches[0]].angle)<=25)return enter(branches[0]);return status('Wire tip is not aligned with an available branch. Rotate torque, then advance.');}
 let position=Math.min(1,Math.max(0,s.position+amount)),depth=s.path.length-1;
 if(position===0&&amount<0&&depth>0){depth--;position=1;}
 if(s.catheterPath.length&&(depth<s.catheterPath.length-1||(depth===s.catheterPath.length-1&&position<s.catheterPosition))){s.position=s.catheterPosition;s.message='Wire reached the microcatheter tip. Retract the microcatheter before withdrawing the wire farther.';emit();return false;}
 if(depth<s.path.length-1)s.path.pop();s.position=position;
 s.message=s.position>=1?(current().children.length?'At a junction: steer the wire tip with torque, then advance into the aligned branch.':'Wire is at the end of this modeled branch. Retract to explore another route.'):(amount<0?'Retracting wire through ':'Advancing wire through ')+current().name;emit();return true;
}
function enter(next){
 if(!wireTools.includes(s.tool))return status('Advance the guidewire into a branch first, then track the microcatheter along it.');
 if(window.IRExposure?.get().shielded)return status('Return the operator to the table before navigating.');
 if(!current().children.includes(next))return false;if(s.position<.99)return status('Advance the wire to the junction before choosing a branch.');if(s.delivering)return false;
 if(Math.abs(s.torque-nodes[next].angle)>25)return status('Align the torque control with the selected branch’s training angle.');
 s.path.push(next);s.position=0;s.message='Wire entered '+current().name+'. The microcatheter stays at its own tip position.';emit();return true;
}
function seat(){if(window.IRExposure?.get().shielded)return status('Return the operator to the table first.');if(!catheterTools.includes(s.tool))return status('Select the microcatheter first.');if(s.delivering)return status('Stop delivery before tracking the microcatheter.');if(s.position<.95)return status('Advance the wire to the distal marker before tracking the microcatheter.');s.catheterPath=s.path.slice();s.catheter=id();s.catheterPosition=s.position;s.message='Microcatheter tracked to the wire tip in '+nodes[s.catheter].name+'. Run contrast to inspect its downstream territory.';emit();return true;}
function inject({preview=false}={}){
 if(!preview&&window.IRExposure&&!window.IRExposure.active())return status('Turn on fluoroscopy or start a DSA run to assess contrast.');
 const root=s.catheter||s.path[0],position=s.catheter?s.catheterPosition:0,territory=downstream(root),time=performance.now();
 s.contrastUntil=time+6500;const travel={},queue=[[root,0]],length=n=>n.points.slice(1).reduce((v,p,i)=>v+Math.hypot(p[0]-n.points[i][0],p[1]-n.points[i][1]),0);while(queue.length){const [key,arrival]=queue.shift();if(travel[key])continue;const duration=Math.max(35,length(nodes[key])*(key===root?1-position:1));travel[key]={arrival,duration};for(const child of nodes[key].children)queue.push([child,arrival+duration]);}const longest=Math.max(...Object.values(travel).map(v=>v.arrival+v.duration),650);s.contrastTransit=Object.fromEntries(Object.entries(travel).map(([k,v])=>[k,{arrival:v.arrival/longest*2.4,duration:Math.max(.12,v.duration/longest*2.4)}]));s.contrastRoot=root;s.contrastPosition=position;s.contrastTerritory=territory;
 s.contrastAcquisition={root,position,path:s.catheter?s.catheterPath.slice():[s.path[0]],territory:territory.slice(),source:s.catheter?'microcatheter':'access',treated:{...s.treated},time};
 if(ready()){s.assessed[s.catheter]=true;s.message=nodes[s.catheter].blush>0?(s.treated[s.catheter]>=1?'Post-treatment run: modeled blush resolved; parent artery remains patent.':'Selective run from '+nodes[s.catheter].name+': only its downstream territory fills.'):'Contrast fills downstream of '+nodes[s.catheter].name+'. This catheter tip is not in a modeled abnormal-blush target.';}
 else s.message=(s.catheter?'Microcatheter':'Access')+' contrast run from '+nodes[root].name+' · downstream vessels only.';
 emit();window.dispatchEvent(new CustomEvent('ir:contrast',{detail:s.contrastAcquisition}));return true;
}
function start(){if(window.IRExposure&&!window.IRExposure.active())return status('Turn on fluoroscopy before simulated delivery.');if(window.IRExposure?.get().shielded)return status('Return the operator to the table before delivery.');if(!ready())return status('Position the microcatheter in the selected branch first.');if(!s.assessed[s.catheter])return status('Run selective contrast before assessing embolization.');if(!nodes[s.catheter].blush)return status(nodes[s.catheter].children.length?'This is a branching pedicle. Explore the distal tissue branches in this teaching case.':'This territory has no target blush in the teaching case.');if(s.tool!=='particles')return status('Select embolic particles from this procedure tray.');if(s.treated[s.catheter]>=1)return status('Modeled blush endpoint already reached. Delivery remains stopped.');s.delivering=true;s.deliveryTarget=s.catheter;s.message='Simulated delivery active. Stop at any time; the model stops when blush resolves.';emit();return true}
function stop(){s.delivering=false;s.deliveryTarget=null;s.holding=0;s.message='Delivery stopped. Run contrast to review the selected territory.';emit()}
function tick(ms){const dt=s.lastTime?Math.min(.08,(ms-s.lastTime)/1000):0;s.lastTime=ms;if(document.hidden)return;if(s.holding)move(s.holding*dt*.32);if(s.delivering&&window.IRExposure&&!window.IRExposure.active()){stop();return;}if(s.delivering){const target=s.deliveryTarget;s.treated[target]=Math.min(1,(s.treated[target]||0)+dt*.115);if(s.treated[target]>=1){s.delivering=false;s.deliveryTarget=null;s.message='Teaching endpoint reached: abnormal blush resolved. Delivery stopped; parent artery flow preserved.';}emit()}}
function point(points,p){let z=p*(points.length-1),i=Math.min(points.length-2,Math.floor(z)),t=z-i;const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];return [0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t))}
function path(ctx,pts,width,color,amount=1,start=0){ctx.beginPath();ctx.moveTo(...point(pts,start));for(let i=1;i<=40;i++)ctx.lineTo(...point(pts,start+(amount-start)*i/40));ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.stroke()}
function contrastAt(key,now=performance.now()){const a=s.contrastAcquisition,t=s.contrastTransit[key];if(!a||!t||now>=s.contrastUntil)return {front:0,density:0,blush:0};const elapsed=(now-a.time)/1000-t.arrival;const front=Math.max(0,Math.min(1,elapsed/t.duration));const density=elapsed<0?0:Math.min(1,elapsed/.25)*Math.max(0,Math.min(1,(6.2-elapsed)/2.5));const tissue=Math.max(0,Math.min(1,(elapsed-t.duration)/.7))*Math.max(0,Math.min(1,(6.5-elapsed)/2));return {front,density,blush:tissue};}
function draw(ctx,clock){const view=display(),node=view.node,region=node.region,tip=point(node.points,view.position),active=s.contrastUntil>performance.now(),territory=new Set(s.contrastTerritory);ctx.save();if(s.follow){const zoom=1.13;ctx.translate(512,512);ctx.scale(zoom,zoom);ctx.translate(-512,-Math.max(385,Math.min(635,tip[1])))}
 for(const [key,n] of Object.entries(nodes)){
  if(n.region!==region)continue;
  if(s.roadmap)path(ctx,n.points,n.caliber,'rgba(13,15,17,.16)');
  if(!active||!territory.has(key))continue;
  const bolus=contrastAt(key),start=key===s.contrastRoot?s.contrastPosition:0,front=start+(1-start)*bolus.front;
  if(bolus.density>0&&front>start){ctx.save();ctx.shadowColor='rgba(15,15,18,.18)';ctx.shadowBlur=2;path(ctx,n.points,n.caliber,`rgba(13,15,17,${bolus.density*.7})`,front,start);ctx.restore();}
  if(n.blush&&bolus.blush>0){const end=n.points.at(-1),residual=n.blush*(1-(s.treated[key]||0))*bolus.blush;ctx.save();ctx.shadowColor=`rgba(20,20,20,${residual*.2})`;ctx.shadowBlur=8;for(let i=0;i<42;i++){const a=i*2.39996,r=7+Math.sqrt(i)*5;ctx.beginPath();ctx.arc(end[0]+Math.cos(a)*r,end[1]+Math.sin(a)*r*.72,4+(i%4)*2,0,Math.PI*2);ctx.fillStyle=`rgba(17,18,19,${residual*.055})`;ctx.fill();}ctx.restore();for(let j=0;j<9;j++)path(ctx,[n.points.at(-2),end,[end[0]+Math.cos(j)*34,end[1]+Math.sin(j)*23]],.8,`rgba(17,18,19,${residual*.3})`);}
 }
 if(s.anatomyLabels){ctx.font='13px monospace';ctx.fillStyle='#e6eee2';for(const key of [view.id,...node.children]){const n=nodes[key];if(n.region===region){const p=point(n.points,.6);ctx.fillText(n.name,p[0]+12,p[1]-12);}}}
 for(const key of s.catheterPath){const n=nodes[key];if(n.region!==region)continue;const amount=key===s.catheter?s.catheterPosition:1;path(ctx,n.points,5,'rgba(235,235,235,.2)',amount);path(ctx,n.points,4,'rgba(25,25,25,.78)',amount);}
 for(const key of s.path){const n=nodes[key];if(n.region!==region)continue;const amount=key===id()?s.position:1;path(ctx,n.points,3.2,'rgba(238,238,238,.22)',amount);path(ctx,n.points,2.5,'#1d1d1d',amount);}
 if(current().region===region){const wireTip=point(current().points,s.position);ctx.beginPath();ctx.moveTo(...wireTip);const a=(s.torque-90)*Math.PI/180;ctx.quadraticCurveTo(wireTip[0]+Math.cos(a)*13,wireTip[1]+Math.sin(a)*13,wireTip[0]+Math.cos(a)*27,wireTip[1]+Math.sin(a)*27);ctx.strokeStyle='#181818';ctx.lineWidth=2.8;ctx.stroke();}
 if(s.catheter&&nodes[s.catheter].region===region){const catheterTip=point(nodes[s.catheter].points,s.catheterPosition);ctx.beginPath();ctx.arc(...catheterTip,4,0,Math.PI*2);ctx.fillStyle='#151515';ctx.fill();}
 ctx.restore();ctx.fillStyle='#eef3ed';ctx.font='16px monospace';ctx.textAlign='left';ctx.fillText(view.device.toUpperCase()+' POSITION: '+node.name.toUpperCase(),35,110);ctx.fillText(view.device.toUpperCase()+' '+Math.round(view.position*100)+'%  |  WIRE TORQUE '+s.torque+'°',35,137);ctx.fillText('ILLUSTRATIVE ANATOMY • NOT PATIENT-SPECIFIC',35,163);
 if(active)ctx.fillText('CONTRAST FROM '+nodes[s.contrastRoot].name.toUpperCase(),35,189);
}
window.IRNavigation={nodes,targets,current,id,display,downstream,contrastAt,point,get:()=>s,reset(access,scenario,variant){reset(access,scenario,variant);emit()},move,enter,seat,inject,start,stop,tick,draw,setTool(t){s.tool=t;s.holding=0;if(s.delivering&&t!=='particles')stop();emit()},setTorque(v){s.torque=Number(v);emit()},hold(v){s.holding=v},setRoadmap(v){s.roadmap=v;emit()},setFollow(v){s.follow=v;emit()},setAnatomyLabels(v){s.anatomyLabels=v;emit()}};
})();
