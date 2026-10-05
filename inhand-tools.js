import * as THREE from './vendor/three.module.js';

// Import the exact bench URL already selected by the page so a cache-busting
// revision does not create a second independent equipment-bench instance.
const benchScript=document.querySelector('script[src*="equipment-bench.js"]');
const {createDeviceModel,disposeDeviceModel,CanvasDeviceRenderer}=await import(benchScript?.src||new URL('./equipment-bench.js',import.meta.url).href);

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const wires=new Set(['wire','hydrophilic','microwire']);
const vials=new Set(['particles','evoh','nbca','oil']);
const catheters=new Set(['pigtail','cobra','simmons','vertebral','microcatheter','uterine','renal','liquidMicro','aspiration','sheath']);
const defaultState={holding:0,torque:0,delivering:false,contrast:false,shielded:false,role:'resident',position:0,catheterPosition:0};
let canvas,context,renderer,scene,camera,wrapper,device,tool='',state={...defaultState};
let lastDraw=-Infinity,lastTick=0,phase=0,plunger=0,wasInjecting=false,motionUntil=0,dirty=true,hiddenCleared=false;
let gripLayout={left:{x:648/1536,y:272/1024},right:{x:927/1536,y:328/1024},scale:.45};
const gloves=new Image();
gloves.onload=()=>{dirty=true;draw(performance.now(),true);};
gloves.src=new URL('./assets/neutral-gloved-hands.png',import.meta.url).href;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

function profile(id){
  if(vials.has(id))return {width:112,height:156,x:421,y:150,left:[396,170],right:[450,113],tilt:.1};
  if(id==='syringe')return {width:406,height:128,x:428,y:151,left:[335,150],right:[542,153],tilt:.12};
  if(wires.has(id))return {width:445,height:160,x:425,y:151,left:[330,154],right:[507,151],tilt:.67};
  if(id==='y90'||id==='chemo')return {width:302,height:166,x:426,y:147,left:[367,169],right:[516,155],tilt:.12};
  if(id==='ultrasound')return {width:248,height:172,x:425,y:149,left:[380,153],right:[464,151],tilt:.13};
  if(id==='port')return {width:288,height:124,x:430,y:151,left:[364,161],right:[490,150],tilt:.18};
  return {width:448,height:151,x:430,y:151,left:[334,154],right:[507,153],tilt:.32};
}

function mount(target=document.getElementById('handsCanvas')){
  if(!target)return false;
  if(canvas===target&&renderer)return true;
  dispose();canvas=target;context=canvas.getContext('2d');
  canvas.width=800;canvas.height=310;
  renderer=new CanvasDeviceRenderer({transparent:true,frameRate:24});
  renderer.setPixelRatio(1);renderer.setSize(800,310);
  scene=new THREE.Scene();camera=new THREE.OrthographicCamera(0,800,310,0,.01,3000);
  camera.position.set(0,0,1000);camera.lookAt(0,0,0);camera.updateProjectionMatrix();
  canvas.dataset.handRenderer='selected-device-geometry';
  dirty=true;return true;
}

function releaseModel(){
  if(wrapper)scene?.remove(wrapper);
  disposeDeviceModel(device);
  renderer?.dispose();
  if(renderer)renderer.modelRoot=null;
  device=null;wrapper=null;
}

function setTool(id){
  if(id===tool&&device)return true;
  if(!renderer&&!mount())return false;
  const next=createDeviceModel(id);if(!next)return false;
  releaseModel();tool=id;device=next;phase=0;plunger=0;wasInjecting=false;
  const layout=profile(id);
  wrapper=new THREE.Group();wrapper.add(device.root);scene.add(wrapper);
  device.animate((wires.has(id)||catheters.has(id)) ? .5 : 0);
  wrapper.rotation.set(layout.tilt,-.12,-.025);
  wrapper.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(wrapper),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  // Center before scaling. The transform is outside the device's own moving parts.
  const inverse=wrapper.quaternion.clone().invert();
  device.root.position.sub(center.clone().applyQuaternion(inverse));
  const scale=Math.min(layout.width/Math.max(size.x,.1),layout.height/Math.max(size.y,.1));
  wrapper.scale.setScalar(scale);wrapper.position.set(layout.x,310-layout.y,0);
  renderer.modelRoot=wrapper;renderer.lastFrame=-Infinity;
  canvas.dataset.handDevice=id;dirty=true;draw(performance.now(),true);return true;
}

function setState(next={}){
  const previous=state;
  state={...state,...next};
  state.torque=clamp(Number(state.torque)||0,-180,180);
  const positionChanged=state.position!==previous.position||state.catheterPosition!==previous.catheterPosition;
  if(positionChanged)motionUntil=performance.now()+420;
  for(const key of Object.keys(next))if(previous[key]!==state[key]){dirty=true;break;}
  if(next.tool&&next.tool!==tool)setTool(next.tool);
  draw(performance.now());
}

function paintGlove(which,target,motion){
  if(!gloves.complete||!gloves.naturalWidth)return;
  const iw=gloves.naturalWidth,ih=gloves.naturalHeight,anchor=gripLayout[which],scale=gripLayout.scale;
  const cropX=which==='left'?0:iw/2,cropW=iw/2;
  const x=target[0]+motion-(anchor.x*iw-cropX)*scale,y=target[1]-anchor.y*ih*scale;
  context.drawImage(gloves,cropX,0,cropW,ih,x,y,cropW*scale,ih*scale);
}

function draw(now=performance.now(),force=false){
  if(!canvas||!renderer||!device)return;
  if(state.shielded){
    if(!hiddenCleared){context.clearRect(0,0,800,310);hiddenCleared=true;}
    lastTick=now;dirty=true;return;
  }
  if(document.hidden||canvas.closest?.('[hidden]')){lastTick=now;return;}
  if(!force&&now-lastDraw<1000/24)return;
  const injecting=Boolean(state.delivering||state.contrast);
  const active=Boolean(state.holding)||now<motionUntil||injecting;
  if(!force&&!dirty&&!active&&!hiddenCleared){lastTick=now;return;}
  const dt=lastTick?Math.min((now-lastTick)/1000,.08):0;
  lastTick=now;lastDraw=now;dirty=false;hiddenCleared=false;
  const layout=profile(tool),direction=typeof state.holding==='number'?Math.sign(state.holding)||1:1;
  if(active)phase+=dt;
  if(injecting&&!wasInjecting)plunger=0;
  if(injecting)plunger=clamp(plunger+dt*.34,0,1);
  wasInjecting=injecting;
  const gripMotion=active&&!reducedMotion.matches?Math.sin(phase*4.6)*5*direction:0;
  const advancement=(Boolean(state.holding)||now<motionUntil)&&!reducedMotion.matches?Math.sin(phase*4.6)*9*direction:0;
  const mechanical=tool==='syringe' ? plunger : (wires.has(tool)||catheters.has(tool)) ? .5 : 0;
  device.animate(mechanical);
  if(device.setTorque)device.setTorque(state.torque);
  // Held devices travel with the grip, while torque rotates the distal segment
  // and hub around the shaft, not the entire camera or pair of hands.
  wrapper.position.set(layout.x+advancement,310-layout.y,0);
  wrapper.rotation.z=-.025+(injecting&&!reducedMotion.matches?Math.sin(phase*2)*.009:0);
  renderer.lastFrame=-Infinity;renderer.render(scene,camera);
  context.clearRect(0,0,800,310);
  // Fingers occlude the actual selected geometry, creating a grasp instead of
  // putting a product photograph on top of a photograph of a different tool.
  context.drawImage(renderer.domElement,0,0,800,310);
  paintGlove('left',layout.left,gripMotion*.45);
  paintGlove('right',layout.right,gripMotion);
  canvas.dataset.handAction=injecting?'delivery':state.holding?'advance':state.torque?'torque':'hold';
}

function setHandLayout(layout){
  gripLayout={...gripLayout,...layout,left:{...gripLayout.left,...layout.left},right:{...gripLayout.right,...layout.right}};
  dirty=true;draw(performance.now(),true);
}

function dispose(){
  releaseModel();renderer=null;scene=null;camera=null;wrapper=null;device=null;tool='';
  if(context&&canvas)context.clearRect(0,0,canvas.width,canvas.height);
  canvas=null;context=null;state={...defaultState};lastTick=0;lastDraw=-Infinity;dirty=true;hiddenCleared=false;
}

window.IRInHand={mount,setTool,setState,draw,setHandLayout,dispose,getState:()=>({tool,...state,glovesReady:gloves.complete&&gloves.naturalWidth>0})};
if(mount())setTool(window.IRNavigation?.get()?.tool||'wire');
export {mount,setTool,setState,draw,dispose};
