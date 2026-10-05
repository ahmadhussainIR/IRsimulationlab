/* Synthetic image viewer. No patient data, calibrated imaging or device physics. */
(() => {
 const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
 const state={procedure:null,p:0,playing:false,mode:'fluoro',window:100,zoom:1,grain:true,labels:true,inject:0,access:'Femoral',tool:'needle',tableOffset:0,projection:0,roomModality:null,originalType:null};
 const canvas=document.createElement('canvas');canvas.id='radiologyCanvas';canvas.width=1024;canvas.height=1024;
 const displayCtx=canvas.getContext('2d');let ctx=displayCtx;const paired={};for(const mode of ['fluoro','dsa']){const c=document.createElement('canvas');c.width=c.height=1024;paired[mode]=c;}
 const images={};for(const name of ['abdomen','chest','ct','thigh','knee','ultrasound']){const im=new Image();im.src=`assets/${name}.png`;images[name]=im;}
 const noise=document.createElement('canvas');noise.width=256;noise.height=256;const ng=noise.getContext('2d'),noiseData=ng.createImageData(256,256);
 let mounted=false,lastDraw=0,clock=0;
 const routes={
 aorta:[[502,120],[500,260],[508,380],[510,490],[503,572],[455,662],[410,740],[379,835],[353,970]],
 iliac:[[503,572],[557,660],[603,756],[645,855],[670,980]],
 renal:[[508,377],[571,378],[640,359],[704,370],[755,350]],
 renalLeft:[[508,384],[452,399],[397,374],[326,390],[285,365]],
 hepatic:[[507,320],[456,315],[414,338],[386,319],[354,307],[317,292],[275,282]],
 pelvic:[[560,665],[542,709],[513,747],[541,780],[573,787]],
 venous:[[670,973],[643,820],[588,713],[543,622],[532,486],[536,322],[537,142]],
 chest:[[112,615],[218,534],[311,415],[413,299],[489,286],[557,315],[562,417],[566,507]],
 port:[[422,188],[504,249],[557,313],[562,418],[566,507]],
 tips:[[556,140],[548,283],[610,365],[654,392],[614,440],[576,488],[529,542]],
 drain:[[153,688],[262,633],[373,580],[478,524],[589,471],[691,420]]
 };
 function smooth(points){const out=[];for(let i=0;i<points.length-1;i++){let p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];for(let j=0;j<18;j++){let t=j/18,t2=t*t,t3=t2*t;out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)])}}out.push(points.at(-1));return out}
 const sampled=Object.fromEntries(Object.entries(routes).map(([k,v])=>[k,smooth(v)]));
 function line(points,width,color,amount=1){if(amount<=0)return;let n=Math.max(2,Math.ceil(points.length*clamp(amount)));ctx.beginPath();points.slice(0,n).forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.lineWidth=width;ctx.strokeStyle=color;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
 function branch(points,w,alpha){line(smooth(points),w,`rgba(16,17,19,${alpha})`)}
 function dot(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
 function phase(a,b){return clamp((state.p-a)/(b-a))}
 function caption(text,x,y,align='left',color='#f1f4ef'){ctx.fillStyle=color;ctx.font='17px ui-monospace,monospace';ctx.textAlign=align;ctx.fillText(text,x,y)}
 function toolIs(...ids){return ids.includes(state.tool)}
 function materialIs(...ids){return ids.includes(state.deployed)||toolIs(...ids)}
 function wire(points,amount,width=2){
  if(toolIs('ultrasound'))return;
  amount=Math.max(.07,amount);const needle=toolIs('needle','micropuncture','tipsNeedle','biopsy','probe');
  const thin=toolIs('wire','hydrophilic','microwire');
  if(needle){const a=points[0],b=points[Math.min(points.length-1,Math.max(1,Math.floor(points.length*.16)))];line([a,b],2.8,'#202124',Math.max(.25,amount));return;}
  if(toolIs('sheath')){line(points.slice(0,Math.max(3,Math.floor(points.length*.17))),6,'#242424',1);return;}
  const w=thin?(state.tool==='microwire'?1.1:1.6):toolIs('microcatheter','liquidMicro')?2:Math.max(3,width);
  line(points,w+2,'rgba(240,240,235,.30)',amount);line(points,w,'rgba(18,18,19,.88)',amount);
  let end=points[Math.min(points.length-1,Math.floor((points.length-1)*amount))];if(!end)return;
  ctx.beginPath();ctx.moveTo(...end);const t=state.tool;
  if(t==='wire')ctx.arc(end[0]+4,end[1],8,Math.PI*.7,Math.PI*1.8);
  else if(['pigtail','drain','biliaryDrain','pleural','ascites'].includes(t))ctx.ellipse(end[0]+7,end[1]-2,10,8,0,.4,Math.PI*2.1);
  else if(t==='simmons'){ctx.bezierCurveTo(end[0]+17,end[1]-8,end[0]+17,end[1]-26,end[0]+3,end[1]-24);ctx.quadraticCurveTo(end[0]-10,end[1]-23,end[0]-8,end[1]-10)}
  else if(['cobra','uterine','renal'].includes(t))ctx.quadraticCurveTo(end[0]+15,end[1]-17,end[0]+24,end[1]-5);
  else if(t==='vertebral')ctx.lineTo(end[0]+14,end[1]-15);
  ctx.lineWidth=w;ctx.strokeStyle='#202020';ctx.stroke();
  if(!thin){dot(end[0],end[1],2.2,'#111')}
 }
 function liquidCast(x,y,amount){if(!materialIs('evoh','nbca')||amount<=0)return;ctx.save();ctx.globalAlpha=.85;tree(x,y,-.25,30*amount,5,4,.92,31);tree(x,y,.85,25*amount,4,3,.95,44);ctx.restore()}
 function vesselMap(alpha){const p=state.procedure,t=p.type;const vascular=!['drain','kidney','biliary','biopsy','ablation'].includes(t);if(!vascular)return;
 if(['access','port'].includes(t)){line(sampled[t==='port'?'port':'chest'],15,`rgba(38,40,43,${alpha*.35})`);return}
 if(t==='filter'){line(sampled.venous,35,`rgba(25,25,25,${alpha*.3})`);return}
 if(t==='tips'){branch([[310,604],[409,587],[529,542],[640,520],[732,550]],22,alpha);branch([[529,542],[503,475],[472,417]],13,alpha*.8);branch([[556,140],[548,283],[610,365],[654,392],[730,411]],24,alpha);return}
 let treated=state.deployed?phase(.62,.84):0,emb=['embolization','ufe'].includes(t);if(['balloon','stent'].includes(t)){for(let i=1;i<sampled.aorta.length;i++){const q=sampled.aorta[i],dist=Math.abs(q[1]-675),base=q[1]>580?18:28,narrow=(1-treated)*clamp(1-dist/33)*14;line([sampled.aorta[i-1],q],base-narrow,`rgba(19,20,22,${alpha})`)}}else line(sampled.aorta,28,`rgba(19,20,22,${alpha})`);line(sampled.iliac,19,`rgba(20,21,23,${alpha})`);line(sampled.renal,14,`rgba(20,21,23,${alpha*(emb&&t==='embolization'?1-treated*.92:1)})`);line(sampled.renalLeft,13,`rgba(20,21,23,${alpha*.85})`);line(sampled.hepatic,12,`rgba(20,21,23,${alpha*.83})`);
 const renalAlpha=alpha*(emb&&t==='embolization'?1-treated*.94:.65);
 tree(724,362,-.1,38,6,4,renalAlpha,17);tree(707,373,1.1,34,5,4,renalAlpha,39);
 tree(297,380,2.8,32,4.5,4,alpha*.5,57);tree(280,281,3.6,31,4,4,alpha*.5,81);

 line(sampled.pelvic,9,`rgba(18,19,21,${alpha*(t==='ufe'?1-treated*.95:.7)})`);

 }
 function tree(x,y,angle,len,w,depth,alpha,seed){if(depth<0)return;const wobble=Math.sin(seed*3.17)*.18;let ex=x+Math.cos(angle+wobble)*len,ey=y+Math.sin(angle+wobble)*len;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(angle-.15)*len*.6,y+Math.sin(angle-.15)*len*.6,ex,ey);ctx.strokeStyle=`rgba(18,19,21,${alpha})`;ctx.lineWidth=w;ctx.stroke();tree(ex,ey,angle-.35-Math.abs(Math.sin(seed))*.2,len*.74,w*.64,depth-1,alpha*.83,seed+2);tree(ex,ey,angle+.42+Math.sin(seed)*.12,len*.72,w*.63,depth-1,alpha*.8,seed+7)}
 function devices(){const t=state.procedure.type,p=state.p;let route=sampled.aorta.slice().reverse(),amt=phase(.14,.42),delivery=phase(.4,.62),treat=phase(.62,.84),remove=phase(.86,1);
 if(['access','port'].includes(t)){route=sampled[t==='port'?'port':'chest'];wire(route,phase(.2,.8),t==='port'?4:3);if(t==='port'&&p>.42&&toolIs('port')){ctx.save();ctx.translate(422,188);ctx.rotate(-.22);ctx.fillStyle='#303030';ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,28,36,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,16,23,0,0,7);ctx.strokeStyle='#909090';ctx.lineWidth=4;ctx.stroke();ctx.restore()}return}
 if(t==='filter'){wire(sampled.venous,phase(.2,.55),3);if(treat>0&&materialIs('filter')){ctx.strokeStyle='#181818';ctx.lineWidth=2;for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(534,413);ctx.quadraticCurveTo(534+(i-3)*5*treat,462,534+(i-3)*14*treat,500);ctx.stroke()}}return}
 if(t==='tips'){wire(sampled.tips,phase(.2,.7),3);if(treat>0&&materialIs('coveredStent')){let a=[654,392],b=[529,542];line(smooth([a,b]),21,'rgba(25,25,25,.25)',treat);for(let i=0;i<15*treat;i++){let f=i/15;branch([[a[0]+(b[0]-a[0])*f-8,a[1]+(b[1]-a[1])*f-6],[a[0]+(b[0]-a[0])*f+8,a[1]+(b[1]-a[1])*f+6]],1.5,.9)}}return}
 if(['drain','kidney','biliary','biopsy','ablation'].includes(t)){renderTargetDevice();return}
 if(t==='embolization')route=smooth([...routes.aorta.slice(0,6).reverse(),...routes.renal.slice(1)]);if(t==='ufe')route=smooth([...routes.iliac.slice().reverse(),...routes.pelvic.slice(1)]);if(t==='angiography')route=sampled.aorta.slice().reverse();
 if(state.access==='Brachial')route=smooth([[160,40],[270,115],[416,187],[502,205],...routes.aorta.slice(2,6)]);wire(route,amt*(1-(['balloon','stent'].includes(t)?remove:0)),1.7);if(delivery>0&&!toolIs('needle','micropuncture','wire','hydrophilic','microwire','sheath','ultrasound'))line(route,4,'rgba(24,25,26,.66)',Math.min(amt,delivery*.72)*(1-remove));
 if(['balloon','stent'].includes(t)&&toolIs('balloon','stent')&&delivery>0){ctx.save();ctx.translate(448,675);ctx.rotate(.43);let expansion=4+11*treat;let width=state.tool==='balloon'?expansion*(1-remove):expansion;ctx.globalAlpha=state.tool==='balloon'?(1-remove):1;ctx.beginPath();ctx.ellipse(0,0,width,45,0,0,Math.PI*2);ctx.fillStyle='rgba(40,40,40,.13)';ctx.fill();ctx.strokeStyle='rgba(15,15,15,.6)';ctx.lineWidth=1;ctx.stroke();if(state.tool==='stent'){for(let i=-40;i<45;i+=8){ctx.beginPath();ctx.moveTo(-width,i);ctx.lineTo(width,i+9);ctx.moveTo(width,i);ctx.lineTo(-width,i+9);ctx.stroke()}}ctx.fillStyle='#080808';ctx.fillRect(-3,-47,6,3);ctx.fillRect(-3,44,6,3);ctx.restore()}
 if(t==='embolization'&&treat>0&&materialIs('coils')){for(let i=0;i<12*treat;i++){ctx.beginPath();ctx.ellipse(700+i*1.5,365+Math.sin(i)*4,8,3,i*.43,0,Math.PI*2);ctx.strokeStyle='#171717';ctx.lineWidth=1.8;ctx.stroke()}}
 }
 function renderTargetDevice(){const t=state.procedure.type,p=state.p,enter=phase(.2,.6),treat=phase(.6,.9);let endpoint=t==='kidney'?[682,525]:t==='biliary'?[410,377]:[353,380];let start=t==='kidney'?[910,720]:t==='biliary'?[190,670]:[130,300];let linePts=smooth([start,[(start[0]+endpoint[0])/2,(start[1]+endpoint[1])/2],endpoint]);
 if(t==='biliary'){branch([[411,375],[352,321],[300,255]],6,.6);branch([[411,375],[470,310],[555,266]],7,.6);branch([[411,375],[462,465],[490,514]],9,.7)}
 if(t==='kidney'){branch([[684,525],[716,490],[735,471]],7,.65);branch([[684,525],[719,544],[734,568]],7,.65);branch([[684,525],[656,584],[648,646],[617,727]],9,.55)}
 if(['drain','biopsy','ablation'].includes(t)){dot(endpoint[0],endpoint[1],t==='drain'?44-18*treat:24,'rgba(20,22,24,.35)')}
 if(enter>0&&!toolIs('ultrasound')){if(['drain','biopsy','ablation'].includes(t)){line(linePts,6,'rgba(240,240,240,.25)',enter);line(linePts,2.5,'rgba(255,255,255,.95)',enter)}else wire(linePts,enter,2);}if(t==='biopsy'&&treat>0&&toolIs('biopsy')){line(linePts,3.5,'#fff',enter*(1-phase(.86,1)))}
 if(['drain','kidney','biliary'].includes(t)&&treat>0&&toolIs('drain','biliaryDrain')){ctx.save();ctx.translate(...endpoint);ctx.beginPath();ctx.arc(8,8,17,Math.PI*.9,Math.PI*2.85);ctx.lineWidth=4;ctx.strokeStyle=t==='drain'?'rgba(250,250,250,.95)':'rgba(24,24,24,.85)';ctx.stroke();ctx.restore()}
 if(t==='ablation'&&treat>0&&toolIs('probe')){const g=ctx.createRadialGradient(...endpoint,3,...endpoint,42*treat+4);g.addColorStop(0,'rgba(225,225,225,.16)');g.addColorStop(1,'rgba(225,225,225,0)');ctx.fillStyle=g;ctx.fillRect(endpoint[0]-60,endpoint[1]-60,120,120)}
 }
 function specialized(alpha){let type=state.procedure.type,advance=phase(.18,.62),treat=state.deployed?phase(.62,.85):0;ctx.filter='blur(.6px)';
 if(type==='gae'){const main=smooth([[508,35],[504,235],[520,402],[525,570],[548,760],[568,994]]);line(main,12,`rgba(20,20,20,${alpha})`);branch([[520,402],[450,446],[394,503],[356,545]],6,alpha*(1-treat*.8));branch([[520,402],[576,441],[620,486],[652,522]],6,alpha*.8);branch([[525,570],[455,574],[406,552]],5,alpha*.7);branch([[525,570],[586,580],[634,554]],5,alpha*.7);tree(358,543,2.5,22,3,3,alpha*(1-treat*.9),4);ctx.filter='none';const route=smooth([[503,30],[504,235],[520,402],[450,446],[394,503]]);wire(route,advance,2);return}
 if(type==='hepatic'){line(sampled.aorta,26,`rgba(20,20,20,${alpha*.3})`);line(sampled.hepatic,13,`rgba(20,20,20,${alpha})`);tree(275,282,3.4,38,6,5,alpha*(state.originalType==='tace'?1-treat*.65:1),81);ctx.filter='none';const route=state.access==='Brachial'?smooth([[140,20],[330,140],[504,200],[507,320],...routes.hepatic.slice(1)]):smooth([...routes.aorta.slice(0,5).reverse(),...routes.hepatic]);wire(route,advance,2);if(state.originalType==='tace'&&state.deployed==='oil'&&treat>0){ctx.save();ctx.filter='blur(6px)';for(let i=0;i<40;i++){const x=247+Math.sin(i*2.31)*34,y=273+Math.cos(i*1.7)*27;dot(x,y,5+(i%5),'rgba(24,24,24,'+(.06*treat)+')')}ctx.restore();caption('IODIZED OIL · SIMULATED RADIOPAQUE DEPOSITION',512,885,'center')}if(state.originalType==='y90'&&treat>0&&toolIs('y90'))caption('DELIVERY CONCEPT · MICROSPHERES NOT VISIBLE',512,885,'center');return}
 if(type==='thrombectomy'){line(sampled.venous,37,`rgba(28,28,28,${alpha*.45})`);const clot=1-treat;ctx.fillStyle=`rgba(195,195,190,${clot})`;ctx.beginPath();ctx.ellipse(543,616,15,47,-.24,0,7);ctx.fill();ctx.filter='none';wire(sampled.venous,advance,5);return}
 if(type==='dialysis'){const r=smooth([[150,850],[280,737],[405,587],[530,518],[664,375],[757,197]]);line(r,20,`rgba(20,20,20,${alpha})`);ctx.filter='none';wire(r,advance,2);if(treat>0&&toolIs('balloon')){ctx.save();ctx.translate(520,525);ctx.rotate(.77);ctx.beginPath();ctx.ellipse(0,0,4+10*treat,42,0,0,7);ctx.fillStyle='rgba(18,18,18,.13)';ctx.fill();ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.stroke();ctx.restore()}caption('DIALYSIS ACCESS · SYNTHETIC VESSEL PROJECTION',512,885,'center');return}
 if(type==='gonadal'){const r=smooth([[533,170],[531,330],[470,377],[420,423],[398,550],[404,689],[376,817]]);line(r,9,`rgba(20,20,20,${alpha})`);ctx.filter='none';wire(r,advance,2);if(treat>0&&materialIs('coils'))for(let i=0;i<14*treat;i++){ctx.beginPath();ctx.ellipse(400,580+i*5,7,3,.2,0,7);ctx.strokeStyle='#151515';ctx.lineWidth=1.4;ctx.stroke()}return}
 if(type==='gastrostomy'){ctx.beginPath();ctx.ellipse(648,373,118,64,-.45,0,7);ctx.fillStyle='rgba(230,230,230,.42)';ctx.fill();ctx.filter='none';const r=smooth([[735,782],[695,591],[650,409],[658,376],[685,360]]);wire(r,advance,4);if(treat>0&&toolIs('feeding'))dot(652,383,10,'rgba(20,20,20,.4)');return}
 }
 function ultrasoundScene(){if(state.procedure.type==='thoracentesis'&&images.ultrasound.complete&&images.ultrasound.naturalWidth){ctx.filter='grayscale(1)';ctx.drawImage(images.ultrasound,0,0,1024,1024);ctx.filter='none';if(!toolIs('ultrasound')){const r=smooth([[150,320],[310,375],[475,475],[560,540]]);line(r,toolIs('pleural')?4:2.5,'#eee',Math.max(.1,phase(.2,.6)))}caption('PLEURAL FLUID / SYNTHETIC B-MODE',512,850,'center');return;}ctx.filter='none';ctx.fillStyle='#060708';ctx.fillRect(0,0,1024,1024);ctx.save();ctx.beginPath();ctx.moveTo(235,90);ctx.lineTo(790,90);ctx.lineTo(960,900);ctx.lineTo(60,900);ctx.closePath();ctx.clip();ctx.fillStyle='#6d6d6d';ctx.fillRect(0,90,1024,810);for(let i=0;i<12000;i++){const x=(Math.sin(i*73.31)*43758.5453)%1*1024,y=100+Math.abs(Math.sin(i*13.7))*810;ctx.fillStyle=`rgba(235,235,235,${.035+Math.abs(Math.sin(i))*.08})`;ctx.fillRect(Math.abs(x),y,2,1)}const pleural=state.procedure.type==='thoracentesis';ctx.beginPath();ctx.ellipse(540,pleural?530:555,250,160-65*phase(.6,.9),-.12,0,7);ctx.fillStyle='#121416';ctx.fill();ctx.beginPath();ctx.ellipse(580,pleural?620:715,225,90,.1,0,7);ctx.fillStyle='#7c7c7c';ctx.fill();branch([[120,290],[320,312],[560,304],[850,316]],6,.8);const r=smooth([[180,310],[330,365],[455,417],[530,455]]);if(!toolIs('ultrasound'))line(r,toolIs('ascites')?4:3,'#ededed',Math.max(.1,phase(.2,.6)));ctx.restore();caption(pleural?'PLEURAL FLUID / SYNTHETIC B-MODE':'ASCITES / SYNTHETIC B-MODE',512,850,'center');
 }
 function imageKind(){const t=state.procedure.type;if(['gae','pae'].includes(state.originalType)){const region=(window.IRNavigation.display?.().node||window.IRNavigation.current()).region;return region==='pelvis'?'abdomen':region;}return ['access','port'].includes(t)?'chest':['drain','biopsy','ablation'].includes(t)?'ct':'abdomen'}
 function draw(timestamp){requestAnimationFrame(draw);if(document.hidden||!state.procedure||timestamp-lastDraw<1000/24)return;lastDraw=timestamp;clock=timestamp/1000;if(!mounted){const host=document.getElementById('diagram');if(!host)return;host.replaceChildren(canvas);mounted=true;}
 const exposure=window.IRExposure,gated=state.roomModality==='C-arm'&&!document.getElementById('suite').hidden,on=exposure?.active(),dsaOn=gated&&on&&exposure.mode()==='dsa';
 if(gated&&!on&&state.frameDrawn){window.IRAcquisition?.update(null,null,timestamp,false);return;}state.frameDrawn=true;
 for(const mode of ['fluoro','dsa']){ctx=paired[mode].getContext('2d');renderFrame(timestamp,mode);}
 ctx=displayCtx;displayCtx.drawImage(paired[state.mode==='dsa'?'dsa':'fluoro'],0,0);window.IRAcquisition?.update(paired.fluoro,paired.dsa,timestamp,dsaOn);
 }
 function renderFrame(timestamp,mode){const manual=['gae','pae'].includes(state.originalType),exposure=window.IRExposure,gated=state.roomModality==='C-arm'&&!document.getElementById('suite').hidden;
 const isCT=imageKind()==='ct',kind=imageKind(),im=images[kind];const subtraction=mode==='dsa'&&!isCT;ctx.clearRect(0,0,1024,1024);ctx.fillStyle=subtraction?'#b0b0ad':'#555655';ctx.fillRect(0,0,1024,1024);
 ctx.save();ctx.translate(512,512);ctx.scale(state.zoom,state.zoom);ctx.translate(-512,-512);
 let breathe=state.grain&&!subtraction?Math.sin(clock*.9)*1.2:0;ctx.translate(state.projection*30,breathe+state.tableOffset*90);ctx.translate(512,512);ctx.transform(1,0,Math.sin(state.projection)*.12,1,0,0);ctx.translate(-512,-512);
 if(im.complete&&im.naturalWidth&&!subtraction){ctx.filter=`grayscale(1) ${isCT?'':'invert(1)'} contrast(${state.window}%) brightness(${isCT?100:95}%)`;if(manual&&(window.IRNavigation.display?.().node||window.IRNavigation.current()).region==='pelvis')ctx.drawImage(im,im.naturalWidth*.13,im.naturalHeight*.35,im.naturalWidth*.74,im.naturalHeight*.65,0,0,1024,1024);else ctx.drawImage(im,0,0,1024,1024);ctx.filter='none'}
 if(!im.complete||!im.naturalWidth){caption('Preparing radiographic background…',512,495,'center');caption('SYNTHETIC TRAINING STUDY',512,530,'center','#bbb')}
 const elapsed=state.inject?(timestamp-state.inject)/1000:99;const bolus=elapsed<4?Math.sin(clamp(elapsed/4)*Math.PI):0;
 let alpha=state.procedure.type==='angiography'?(.2+.55*phase(.55,.78)):.34;
 if(state.p<.18)alpha=.6;if(state.p>.85)alpha=.62;alpha=Math.max(alpha,bolus*.8);if(subtraction)alpha=Math.max(.65,alpha);
 ctx.filter=subtraction?'blur(.55px)':'blur(.85px)';if(manual){ctx.filter='none';window.IRNavigation.draw(ctx,clock)}else if(['gae','hepatic','thrombectomy','dialysis','gonadal','gastrostomy'].includes(state.procedure.type)){specialized(alpha)}else if(['thoracentesis','paracentesis'].includes(state.procedure.type)){ultrasoundScene()}else{vesselMap(alpha);ctx.filter='none';devices();}ctx.filter='none';if(state.procedure.type==='embolization')liquidCast(700,365,phase(.58,.85));ctx.restore();
 if(state.grain){for(let i=0;i<noiseData.data.length;i+=4){const v=Math.random()*255;noiseData.data[i]=noiseData.data[i+1]=noiseData.data[i+2]=v;noiseData.data[i+3]=isCT?11:22}ng.putImageData(noiseData,0,0);ctx.drawImage(noise,0,0,1024,1024)}
 let vignette=ctx.createRadialGradient(512,512,340,512,512,740);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'rgba(0,0,0,.4)');ctx.fillStyle=vignette;ctx.fillRect(0,0,1024,1024);
 caption('IR LAB  /  SYNTHETIC STUDY',35,42);caption(['thoracentesis','paracentesis'].includes(state.procedure.type)?'US · SYNTHETIC B-MODE':isCT?'CT · ILLUSTRATIVE SLICE':subtraction?'DSA · SIMULATED SUBTRACTION':'FLUORO · SIMULATED ACQUISITION',35,69);caption('NOT FOR DIAGNOSIS',989,42,'right','#fff');caption((state.playing||(gated&&exposure.active()))?'CINE ▶':'CINE II',989,69,'right');caption(isCT?'AXIAL':Math.abs(state.projection)>.001?`ILLUSTRATIVE OBLIQUE ${Math.round(state.projection*180/Math.PI)}°`:'AP',35,976);caption(`${Math.round(state.p*100)}%  ·  ${state.zoom.toFixed(1)}×`,989,976,'right');caption('R',35,515);
 if(state.labels){caption(state.procedure.name.toUpperCase(),35,944);const stage=state.procedure.steps[Math.min(4,Math.floor(state.p*5))][0];caption(stage,35,920);caption(`${state.toolName||state.tool} · ${state.access} access`,35,895)}
 }
 window.RadiologyViewer={set(p,progress,playing){const mapping={gae:'gae',y90:'hepatic',tace:'hepatic',pae:'ufe',thrombectomy:'thrombectomy',dialysis:'dialysis',thoracentesis:'thoracentesis',paracentesis:'paracentesis',cholecystostomy:'biliary',gastrostomy:'gastrostomy',cvc:'access',varicocele:'gonadal'};if(state.procedure?.id!==p.id){state.frameDrawn=false;state.deployed=null;state.inject=0;const cfg=suiteConfiguration(p);state.tool=cfg.stageTools[0];state.toolName=equipmentCatalog[state.tool].name;state.access=cfg.access[0].split(' ')[0]}state.originalType=p.type;state.procedure={...p,type:mapping[p.type]||p.type};state.p=progress;state.playing=playing;if(progress<.58)state.deployed=null;else if(suiteConfiguration(p).kit.includes(state.tool)&&['balloon','stent','coveredStent','filter','coils','particles','evoh','nbca','chemo','y90','aspiration','probe','drain','biliaryDrain','pleural','ascites','feeding','port','oil'].includes(state.tool))state.deployed=state.tool},configure(key,value){state[key]=value;if(key==='mode'&&state.frameDrawn)displayCtx.drawImage(paired[value==='dsa'?'dsa':'fluoro'],0,0)},inject(){state.inject=performance.now()},kind:imageKind,getFrame:mode=>paired[mode]||paired.fluoro};requestAnimationFrame(draw);
})();
