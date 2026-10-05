import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

// A device inspection bench. Device motion is deliberately separate from case mechanics.
const V = (x, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const TAU = Math.PI * 2;
let current = null;

function materials() {
  const physical = (color, options = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: .27, ...options });
  return {
    steel: physical('#b8c4cd', { metalness: .93, roughness: .2 }),
    platinum: physical('#e1e4e9', { metalness: 1, roughness: .16 }),
    blue: physical('#1789b9', { clearcoat: .7, roughness: .23 }),
    navy: physical('#235a7b', { clearcoat: .4 }),
    teal: physical('#26a9a5', { clearcoat: .55 }),
    violet: physical('#8670b7', { clearcoat: .55 }),
    white: physical('#e9eee9', { clearcoat: .35, roughness: .35 }),
    charcoal: physical('#263947', { roughness: .46 }),
    rubber: physical('#37414b', { roughness: .8 }),
    glass: physical('#eaf8fc', { transmission: .91, thickness: .045, ior: 1.46, roughness: .1, transparent: true, opacity: .84, depthWrite: false, side: THREE.DoubleSide }),
    tubing: physical('#dae9f1', { transmission: .65, thickness: .05, ior: 1.45, roughness: .23, transparent: true, opacity: .74 }),
    liquid: physical('#b6d3df', { transmission: .65, thickness: .5, roughness: .08, transparent: true, opacity: .66 }),
    amber: physical('#e4bb52', { transmission: .52, thickness: .3, roughness: .1, transparent: true, opacity: .8 }),
    darkLiquid: physical('#536477', { transmission: .3, thickness: .3, roughness: .16, transparent: true, opacity: .88 }),
  };
}

function mesh(parent, geometry, material, position = V()) {
  const object = new THREE.Mesh(geometry, material);
  object.position.copy(position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
function cylinder(parent, x1, x2, radius, material, y = 0, z = 0, endRadius = radius, open = false) {
  const object = mesh(parent, new THREE.CylinderGeometry(endRadius, radius, Math.abs(x2 - x1), 40, 1, open), material, V((x1 + x2) / 2, y, z));
  object.rotation.z = -Math.PI / 2;
  return object;
}
function tube(parent, points, radius, material, segments = 100) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => Array.isArray(point) ? V(...point) : point), false, 'centripetal');
  return mesh(parent, new THREE.TubeGeometry(curve, segments, radius, 10, false), material);
}
function ring(parent, x, radius, thickness, material, y = 0, z = 0) {
  const object = mesh(parent, new THREE.TorusGeometry(radius, thickness, 10, 48), material, V(x, y, z));
  object.rotation.y = Math.PI / 2;
  return object;
}
function box(parent, width, height, depth, material, x = 0, y = 0, z = 0, bevel = .08) {
  const shape = new THREE.Shape();
  const w = width / 2, h = height / 2, r = Math.min(bevel, w, h);
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h); shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r); shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h); shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r); shape.quadraticCurveTo(-w, -h, -w + r, -h);
  const object = mesh(parent, new THREE.ExtrudeGeometry(shape, { depth: Math.max(.02, depth - r * 2), bevelEnabled: true, bevelSize: r * .45, bevelThickness: r, bevelSegments: 3, steps: 1, curveSegments: 7 }), material, V(x, y, z - depth / 2));
  return object;
}
function hub(parent, x, m, color = m.blue, size = 1) {
  const group = new THREE.Group(); group.position.x = x; group.scale.setScalar(size); parent.add(group);
  cylinder(group, -.24, .21, .14, color, 0, 0, .2);
  cylinder(group, .18, .28, .21, color);
  cylinder(group, -.34, -.24, .08, m.steel);
  for (let n = 0; n < 12; n++) {
    const a = n / 12 * TAU;
    cylinder(group, -.08, .18, .019, color, Math.sin(a) * .195, Math.cos(a) * .195);
  }
  ring(group, .25, .19, .014, m.white);
  cylinder(group, .27, .282, .085, m.charcoal);
  return group;
}
function textTexture(text, { color = '#254759', bg = 'transparent', size = 512, height = 160 } = {}) {
  const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (bg !== 'transparent') { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, height); }
  ctx.fillStyle = color; ctx.font = '600 44px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, height / 2);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function label(parent, text, x, y, z, w = 1, h = .28, color) {
  return mesh(parent, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: textTexture(text, { color }), transparent: true, depthWrite: false, side: THREE.DoubleSide }), V(x, y, z));
}
function result(root, animate, motion, detail, cameraScale = 1) { return { root, animate, motion, detail, cameraScale }; }

function syringe(m, id) {
  const root = new THREE.Group();
  cylinder(root, -1.4, 1.25, .36, m.glass, 0, 0, .36, true);
  ring(root, -1.4, .343, .027, m.glass); ring(root, 1.25, .352, .032, m.glass);
  cylinder(root, -1.59, -1.39, .07, m.glass, 0, 0, .35);
  hub(root, -1.83, m, m.blue, .65).rotation.z = Math.PI;
  box(root, .1, 1.03, .19, m.white, 1.28);
  for (let i = 0; i < 25; i++) {
    const x = -1.19 + i * .091;
    box(root, .015, i % 5 === 0 ? .15 : .07, .006, m.charcoal, x, .13, .327, .002);
  }
  label(root, 'CONTRAST', -.12, -.07, .365, 1.05, .22);
  const plunger = new THREE.Group(); root.add(plunger);
  cylinder(plunger, .81, 1.02, .323, m.rubber);
  for (const x of [.84, .97]) ring(plunger, x, .321, .016, m.charcoal);
  box(plunger, 1.4, .105, .105, m.white, 1.62, 0, 0);
  const fin = box(plunger, 1.4, .105, .105, m.white, 1.62, 0, 0); fin.rotation.x = Math.PI / 2;
  cylinder(plunger, 2.27, 2.4, .42, m.white);
  cylinder(plunger, 2.4, 2.425, .31, m.blue);
  const liquid = cylinder(root, -1.32, .77, .29, id === 'chemo' ? m.amber : m.liquid);
  return result(root, p => {
    plunger.position.x = -1.3 * p;
    const end = .77 - p * 1.3;
    liquid.scale.y = (end + 1.32) / 2.09;
    liquid.position.x = (-1.32 + end) / 2;
  }, 'Plunger travel', 'Clear barrel · moving rubber stopper · luer hub');
}

function wire(m, id) {
  const root = new THREE.Group(), wireMat = id === 'hydrophilic' ? m.charcoal : m.steel;
  const radius = id === 'microwire' ? .014 : .026;
  const coilPoints = [];
  for (let n = 0; n <= 260; n++) {
    const t = n / 260, a = t * TAU * 2.45;
    coilPoints.push(V(-.88 + Math.sin(a) * .94, -.28 + t * .12, Math.cos(a) * .94));
  }
  tube(root, coilPoints, radius, wireMat, 260);
  const last = coilPoints[coilPoints.length - 1];
  tube(root, [last, V(.04, -.12, -.68), V(.55, -.02, -.35), V(1.25, 0, 0), V(1.55, 0, 0)], radius, wireMat);
  const tip = new THREE.Group(); tip.position.set(1.55, 0, 0); root.add(tip);
  const points = [V(0), V(.35), V(.56, .03), V(.69, .15), V(.65, .32), V(.5, .38), V(.39, .3)];
  tube(tip, points, radius * .93, m.platinum, 80);
  for (let i = 0; i < 18; i++) ring(tip, .08 + i * .011, radius * 1.03, .0035, m.steel);
  const torquer = new THREE.Group(); torquer.position.set(.62, -.01, -.28); torquer.rotation.y = -.33; root.add(torquer);
  cylinder(torquer, -.25, .2, .16, m.blue);
  cylinder(torquer, .2, .37, .11, m.navy);
  cylinder(torquer, -.35, -.25, .09, m.steel);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU;
    cylinder(torquer, -.22, .17, .016, m.navy, Math.sin(a) * .155, Math.cos(a) * .155);
  }
  const device=result(root, p => { tip.rotation.x = (p - .5) * Math.PI * 1.35; torquer.rotation.x = (p - .5) * Math.PI * 1.35; }, 'Turn the torque device', 'Coiled shaft · torque grip · flexible distal tip');
  device.setTorque=degrees=>{tip.rotation.x=torquer.rotation.x=degrees*Math.PI/180;};
  return device;
}

const catheterTips = {
  pigtail: [[.05,0,0],[.5,0,0],[.86,.12,0],[.98,.44,0],[.79,.68,0],[.45,.63,0],[.37,.35,0],[.59,.23,0]],
  cobra: [[.05,0,0],[.4,0,0],[.63,.2,0],[.61,.6,0],[.87,.76,0],[1.13,.67,0]],
  simmons: [[.05,0,0],[.44,.06,0],[.66,.48,0],[.38,.79,0],[.03,.51,0],[.15,.18,0],[.43,.1,0]],
  vertebral: [[.05,0,0],[.49,0,0],[.79,.28,0],[.99,.49,0]],
  microcatheter: [[.05,0,0],[.48,0,0],[.84,.08,0],[1,.22,0]],
  uterine: [[.05,0,0],[.55,0,0],[.67,.4,0],[.92,.44,0]],
  renal: [[.05,0,0],[.49,0,0],[.6,.4,0],[.45,.7,0]],
  liquidMicro: [[.05,0,0],[.45,0,0],[.87,.08,0],[1.06,.25,0]],
  aspiration: [[.05,0,0],[.55,0,0],[.92,.09,0]],
  sheath: [[.05,0,0],[.5,0,0],[.78,.015,0]],
};
function catheter(m, id) {
  const root = new THREE.Group(), fine = ['microcatheter', 'liquidMicro'].includes(id);
  const shaftMat = fine ? (id === 'liquidMicro' ? m.violet : m.navy) : id === 'aspiration' ? m.charcoal : m.white;
  const r = fine ? .027 : id === 'aspiration' ? .084 : id === 'sheath' ? .09 : .047;
  const hubGroup = hub(root, -1.81, m, fine ? m.teal : m.blue, fine ? .83 : 1);
  hubGroup.rotation.z = Math.PI;
  tube(root, [V(-1.48), V(-1.15, -.06, .1), V(-.55, -.1, .2), V(.02)], r, shaftMat);
  const tip = new THREE.Group(); root.add(tip);
  tube(tip, catheterTips[id], r * .87, shaftMat, 100);
  const pts = catheterTips[id], end = V(...pts[pts.length - 1]), before = V(...pts[pts.length - 2]);
  const tangent = end.clone().sub(before).normalize();
  const marker = mesh(tip, new THREE.CylinderGeometry(r * .94, r * .94, .055, 20), m.platinum, end.clone().addScaledVector(tangent, -.07));
  marker.quaternion.setFromUnitVectors(V(0, 1, 0), tangent);
  mesh(tip, new THREE.SphereGeometry(r * .55, 12, 8), m.charcoal, end.clone());
  if (id === 'pigtail') {
    for (let i = 0; i < 5; i++) mesh(tip, new THREE.SphereGeometry(.016, 8, 6), m.charcoal, V(.18 + .06 * i, .005, .045));
  }
  if (id === 'sheath') {
    tube(root, [V(-1.64,.08), V(-1.47,.38), V(-1.68,.8), V(-2,.9)], .057, m.tubing);
    const tap = hub(root, -2, m, m.blue, .65); tap.position.y = .9;
    box(root, .32, .065, .24, m.blue, -2, 1.06);
  }
  const device=result(root, p => { tip.rotation.x = (p - .5) * .85; hubGroup.rotation.x = (p - .5) * .85; }, 'Rotate catheter tip', 'Shaped distal segment · marker band · molded hub');
  device.setTorque=degrees=>{tip.rotation.x=hubGroup.rotation.x=degrees*Math.PI/180;};
  return device;
}

function balloon(m) {
  const root = new THREE.Group();
  cylinder(root, -2.15, 2.08, .031, m.navy);
  hub(root, -2, m, m.blue, .82).rotation.z = Math.PI;
  const envelope = new THREE.Group(); root.add(envelope);
  const outline = [V(.027,-.88), V(.08,-.74), V(.23,-.62), V(.32,-.48), V(.34,-.32), V(.34,.32), V(.32,.48), V(.23,.62), V(.08,.74), V(.027,.88)].map(v=>new THREE.Vector2(v.x,v.y));
  const shell = mesh(envelope, new THREE.LatheGeometry(outline, 56), new THREE.MeshPhysicalMaterial({ color:'#d9b477', transmission:.73, transparent:true, opacity:.65, roughness:.13, thickness:.025, side:THREE.DoubleSide, depthWrite:false }));
  shell.rotation.z = Math.PI / 2;
  for (const x of [-.53, .53]) cylinder(root, x-.025,x+.025,.048,m.platinum);
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU;
    tube(envelope,[V(-.68,Math.sin(a)*.12,Math.cos(a)*.12),V(0,Math.sin(a)*.34,Math.cos(a)*.34),V(.68,Math.sin(a)*.12,Math.cos(a)*.12)],.004,m.white);
  }
  return result(root, p=>{ envelope.scale.set(1,.26+p*.74,.26+p*.74); },'Inflate / deflate balloon','Translucent envelope · catheter shaft · marker bands');
}

function stent(m, id) {
  const root = new THREE.Group(), scaffold = new THREE.Group(); root.add(scaffold);
  const length = 2.75, radius = .45;
  for (const handedness of [-1, 1]) for (let k = 0; k < 12; k++) {
    const points=[];
    for(let i=0;i<=100;i++){const t=i/100,a=t*TAU*1.9*handedness+k/12*TAU;points.push(V((t-.5)*length,Math.sin(a)*radius,Math.cos(a)*radius));}
    tube(scaffold,points,.014,m.platinum,100);
  }
  for(const x of [-length/2,length/2]) ring(scaffold,x,radius,.027,m.steel);
  if(id==='coveredStent') cylinder(scaffold,-length/2+.03,length/2-.03,radius*.955,new THREE.MeshPhysicalMaterial({color:'#f3ebe0',roughness:.47,transparent:true,opacity:.74,side:THREE.DoubleSide}),0,0,radius*.955,true);
  cylinder(root,-2.25,2.25,.027,m.navy);
  return result(root,p=>{scaffold.scale.set(1+.1*(1-p),.35+.65*p,.35+.65*p);},'Expand / recover scaffold',id==='coveredStent'?'Woven frame · translucent graft sleeve':'Interlaced metallic struts · open vessel scaffold');
}

function coils(m) {
  const root = new THREE.Group(), coil = new THREE.Group(); root.add(coil);
  const points=[];
  for(let i=0;i<=400;i++){
    const t=i/400,a=t*TAU*5.8;
    points.push(V((t-.5)*2.3,Math.cos(a)*(.38+.08*Math.sin(t*Math.PI)),Math.sin(a)*(.38+.08*Math.sin(t*Math.PI))));
  }
  tube(coil,points,.039,m.platinum,400);
  tube(root,[V(-2.2),V(-1.8),V(-1.3,.1),points[0]],.019,m.steel);
  return result(root,p=>{coil.scale.x=.4+.6*p;coil.rotation.x=p*.4;},'Open / gather coil','Radiopaque coil form · connected delivery wire');
}
function filter(m) {
  const root = new THREE.Group(), cage = new THREE.Group(); root.add(cage);
  for(let i=0;i<8;i++){
    const a=i/8*TAU, r=.76;
    tube(cage,[V(-1.1),V(-.5,Math.sin(a)*.23,Math.cos(a)*.23),V(.35,Math.sin(a)*.63,Math.cos(a)*.63),V(1.05,Math.sin(a)*r,Math.cos(a)*r),V(1.17,Math.sin(a)*r*.93,Math.cos(a)*r*.93)],.022,m.platinum);
  }
  cylinder(root,-1.23,-1.05,.07,m.steel);
  tube(root,[V(-1.23),V(-1.4),V(-1.5,.13),V(-1.38,.22),V(-1.31,.13)],.023,m.steel);
  return result(root,p=>{cage.scale.y=cage.scale.z=.22+.78*p;},'Open / recover struts','Retrieval hook · radially arranged support struts');
}

function needle(m, id) {
  const root = new THREE.Group(), moving = new THREE.Group(); root.add(moving);
  const biopsy = id==='biopsy', probe=id==='probe';
  const radius=id==='micropuncture'?.028:.041;
  if(biopsy){
    box(root,1.65,.52,.45,m.white,-1.05,0,0,.15);
    box(root,.96,.32,.47,m.navy,-1.18,-.05,0,.1);
    const trigger=box(moving,.27,.22,.28,m.blue,-.55,.33,0,.045);
    cylinder(root,-.26,.1,.13,m.blue);
    cylinder(moving,.04,2.17,radius,m.steel);
    cylinder(root,.03,1.87,radius*1.34,m.steel);
    box(moving,.32,.006,.03,m.charcoal,1.88,.04,0,.002);
    return result(root,p=>{moving.position.x=p*.12;trigger.position.y=.33-p*.08;},'Cycle sampling handle','Molded handle · trigger · coaxial metal shaft');
  }
  if(probe){
    cylinder(root,-1.8,-.48,.18,m.white);cylinder(root,-1.78,-1.39,.195,m.blue);
    for(let i=0;i<7;i++)ring(root,-1.35+i*.1,.179,.014,m.navy);
    tube(root,[V(-1.8),V(-2.1,.06),V(-2.25,-.3),V(-1.95,-.65),V(-1.25,-.8)],.043,m.charcoal);
  } else {
    hub(root,-1.43,m,id==='micropuncture'?m.teal:m.blue,id==='micropuncture'?.85:1);
    cylinder(moving,-1.99,-1.48,.055,m.steel);
    cylinder(moving,-2.07,-1.96,.14,m.white);
  }
  if(id==='tipsNeedle') tube(root,[V(-1.13),V(-.3),V(.72,.1),V(1.55,.45),V(1.91,.73)],radius*1.75,m.steel);
  else {
    cylinder(root,probe?-.48:-1.13,1.91,radius,m.steel);
    const tip=mesh(root,new THREE.ConeGeometry(radius,.18,16),m.steel,V(2,0,0));tip.rotation.z=-Math.PI/2;
  }
  for(let i=0;i<10;i++) cylinder(root,-.5+i*.19,-.48+i*.19,radius*1.035,m.charcoal);
  return result(root,p=>{moving.position.x=-p*.45;root.rotation.x=(p-.5)*.15;},probe?'Rotate probe':'Withdraw / replace stylet',probe?'Insulated handpiece · metal probe · flexible cable':'Metal shaft · molded hub · removable stylet');
}

function drain(m, id) {
  if(id==='feeding'){
    const root=new THREE.Group();
    tube(root,[V(-1.9),V(-1.4),V(-.7,.05,.2),V(.4),V(1.5)],.09,m.tubing);
    const balloon=mesh(root,new THREE.SphereGeometry(.33,32,24),m.glass,V(1.27));balloon.scale.x=.65;
    cylinder(root,-.8,-.68,.46,m.white);hub(root,-1.92,m,m.violet,1.1);
    tube(root,[V(-1.55),V(-1.5,.3),V(-1.85,.55)],.063,m.tubing);
    const port=hub(root,-1.85,m,m.violet,.7);port.position.y=.55;
    return result(root,p=>{balloon.scale.y=balloon.scale.z=.5+p*.5;},'Expand retention balloon','Flexible tube · external bolster · retention balloon');
  }
  const root=new THREE.Group(), tip=new THREE.Group();root.add(tip);
  tube(root,[V(-1.9),V(-1.5,-.06),V(-.65,-.04,.08),V(.28)],.067,m.white);
  const points=[V(.28),V(.9),V(1.33,.2),V(1.36,.64),V(.97,.85),V(.66,.56),V(.9,.33),V(1.09,.44)];
  tube(tip,points,.065,id==='biliaryDrain'?m.blue:m.white,130);
  const curve=new THREE.CatmullRomCurve3(points);
  for(let i=0;i<11;i++){const p=curve.getPoint(.12+i*.066);mesh(tip,new THREE.SphereGeometry(.023,12,8),m.charcoal,p.add(V(0,0,.059)));}
  hub(root,-1.98,m,m.blue,1.08).rotation.z=Math.PI;
  tube(root,[V(-2.25),V(-2.55,-.12),V(-2.5,-.55),V(-1.84,-.66)],.074,m.tubing);
  const lock=box(root,.24,.34,.11,m.blue,-1.7,.06,.04,.035);
  return result(root,p=>{tip.rotation.x=(p-.5)*.55;lock.position.y=.06+p*.04;},'Rotate retaining loop','Fenestrated distal loop · locking hub · collection tubing');
}

function central(m, id) {
  const root=new THREE.Group();
  const colors=[m.blue,m.white,m.violet];
  tube(root,[V(.16),V(.73,.04,.05),V(1.37,.18,0),V(2.08,.21)],id==='picc'?.032:.055,m.white);
  for(let i=0;i<10;i++) cylinder(root,.42+i*.13,.43+i*.13,id==='picc'?.034:.057,m.charcoal,.04+i*.018);
  const junction=box(root,.38,.24,.18,m.white,.01,0,0,.065);
  for(let i=0;i<(id==='picc'?2:3);i++){
    const y=(i-1)*.45;
    tube(root,[V(-.08),V(-.55,y*.55,0),V(-1.15,y,0),V(-1.64,y,0)],.043,colors[i]);
    const h=hub(root,-1.83,m,colors[i],.73);h.position.y=y;h.rotation.z=Math.PI;
    box(root,.24,.17,.12,colors[i],-1.22,y,0,.04);
  }
  return result(root,p=>{junction.rotation.x=(p-.5)*.16;root.rotation.x=(p-.5)*.13;},'Inspect lumens','Independent extension limbs · clamps · catheter shaft');
}
function port(m) {
  const root=new THREE.Group(), reservoir=new THREE.Group();root.add(reservoir);
  box(reservoir,1.2,.68,.46,m.violet,-.75,0,0,.24);
  const septum=mesh(reservoir,new THREE.CylinderGeometry(.28,.28,.055,40),m.white,V(-.75,0,.27));septum.rotation.x=Math.PI/2;
  for(const x of [-1.12,-.38]) mesh(reservoir,new THREE.TorusGeometry(.066,.017,8,24),m.steel,V(x,-.18,.24));
  cylinder(root,-.2,.13,.073,m.steel);
  tube(root,[V(.05),V(.62,.01),V(1.1,.27,.05),V(1.54,.59),V(1.92,.43)],.065,m.white);
  return result(root,p=>{reservoir.rotation.x=(p-.5)*.3;},'Inspect reservoir','Polymer reservoir · silicone septum · attached catheter');
}
function ultrasound(m) {
  const root=new THREE.Group();
  box(root,1.33,.69,.43,m.white,0,0,0,.18);
  box(root,1.58,.18,.51,m.charcoal,0,-.44,0,.1);
  box(root,.85,.25,.455,m.blue,0,.43,0,.09);
  cylinder(root,-.12,.12,.13,m.charcoal,.74);
  tube(root,[V(0,.7),V(0,1.1),V(.6,1.34,.1),V(1.57,.94),V(1.75,.18),V(1.44,-.53)],.069,m.charcoal);
  label(root,'IR',0,.02,.248,.29,.17);
  return result(root,p=>{root.rotation.z=(p-.5)*.32;},'Rock probe','Acoustic face · sealed handpiece · strain-relieved cable');
}

function vial(m, id) {
  const root=new THREE.Group(), vessel=new THREE.Group();root.add(vessel);vessel.rotation.z=Math.PI/2;
  cylinder(vessel,-.72,.6,.42,m.glass,0,0,.42,true);
  cylinder(vessel,-.75,-.69,.418,m.glass);
  cylinder(vessel,.59,.76,.29,m.glass,0,0,.4);
  cylinder(vessel,.75,.96,.3,m.steel);
  cylinder(vessel,.95,.99,.24,id==='evoh'?m.violet:id==='nbca'?m.blue:m.teal);
  ring(vessel,.8,.31,.015,m.steel);ring(vessel,.88,.31,.015,m.steel);
  const liquidMat=id==='oil'?m.amber:id==='evoh'?m.darkLiquid:m.liquid;
  const liquid=cylinder(vessel,-.67,.2,.37,liquidMat);
  const contents=new THREE.Group();vessel.add(contents);
  if(id==='particles'){
    for(let i=0;i<65;i++){
      const a=i*2.39996,r=Math.sqrt((i+.5)/65)*.28;
      mesh(contents,new THREE.SphereGeometry(.018+(i%3)*.004,10,8),i%4===0?m.white:m.tubing,V(-.54+(i%9)*.065,Math.sin(a)*r,Math.cos(a)*r));
    }
  }
  label(root,id==='oil'?'IODIZED OIL':id==='evoh'?'EVOH':id==='nbca'?'n-BCA':id==='y90'?'Y-90':id==='chemo'?'DELIVERY':'PARTICLES',0,-.05,.435,1.08,.21);
  const pad=box(root,1.08,.14,.84,m.white,0,-1.08,0,.09);
  return result(root,p=>{contents.rotation.x=p*.55;vessel.rotation.x=Math.sin(p*Math.PI)*.035;liquid.rotation.x=Math.sin(p*Math.PI)*.012;pad.rotation.y=0;},'Inspect vial','Glass vial · sealed cap · illustrative material appearance',.78);
}
function delivery(m, id) {
  const root=new THREE.Group();
  const miniature=vial(m,id).root;miniature.scale.setScalar(.63);miniature.position.set(-.52,.15,0);root.add(miniature);
  if(id==='y90'){
    box(root,1.37,1.53,.21,m.charcoal,-.5,0,-.4,.09);
    box(root,.19,1.53,.93,m.charcoal,-1.15,0,.01,.06);
    box(root,.19,1.53,.93,m.charcoal,.15,0,.01,.06);
    box(root,1.37,.2,.93,m.charcoal,-.5,-.7,.01,.07);
    const front=box(root,1.03,1.19,.07,m.glass,-.5,.02,.43,.05);front.castShadow=false;
    label(root,'DELIVERY',-.5,-.55,.495,.7,.12,'#e4edf4');
  }
  tube(root,[V(-.57,.81),V(-.4,1.02),V(.14,1.07),V(.6,.72),V(.8,.1),V(1.44,-.27)],.035,m.tubing);
  tube(root,[V(-.38,.81),V(-.23,1.19),V(.65,1.36),V(1.41,.9),V(1.6,.39)],.035,m.tubing);
  const clamp=box(root,.24,.28,.11,m.blue,.77,.33,0,.04);
  hub(root,1.62,m,m.blue,.7).position.y=.38;
  return result(root,p=>{clamp.rotation.z=(p-.5)*.15;},'Inspect delivery assembly','Shielded / contained vial concept · delivery tubing · connectors');
}

const families = {
  syringe, wire, hydrophilic:wire, microwire:wire,
  pigtail:catheter,cobra:catheter,simmons:catheter,vertebral:catheter,microcatheter:catheter,uterine:catheter,renal:catheter,liquidMicro:catheter,aspiration:catheter,sheath:catheter,
  balloon,stent,coveredStent:stent,coils,filter,
  needle,micropuncture:needle,biopsy:needle,tipsNeedle:needle,probe:needle,
  drain,biliaryDrain:drain,pleural:drain,ascites:drain,feeding:drain,
  central,picc:central,port,ultrasound,
  particles:vial,evoh:vial,nbca:vial,oil:vial,y90:delivery,chemo:delivery,
};

function studioEnvironment(renderer) {
  const studio = new THREE.Scene(); studio.background = new THREE.Color('#99aabc');
  const basic = color => new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide});
  mesh(studio,new THREE.PlaneGeometry(8,8),basic('#ffffff'),V(0,5,1)).rotation.x=Math.PI/2;
  mesh(studio,new THREE.PlaneGeometry(3,8),basic('#e3f5ff'),V(-5,0,0)).rotation.y=Math.PI/2;
  mesh(studio,new THREE.PlaneGeometry(3,6),basic('#ffffff'),V(5,1,-1)).rotation.y=-Math.PI/2;
  mesh(studio,new THREE.PlaneGeometry(8,6),basic('#324960'),V(0,0,-5));
  const generator=new THREE.PMREMGenerator(renderer), target=generator.fromScene(studio,.1,.1,30);
  generator.dispose();
  studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  return target;
}

// Canvas rendering keeps the same device geometry and controls available in
// embedded browsers where GPU contexts are disabled. Topology is resampled,
// never rendered by dropping alternate faces, so small tubes remain closed.
class CanvasDeviceRenderer {
  constructor(options={}) {
    this.domElement=options.canvas||document.createElement('canvas');
    this.transparent=!!options.transparent;this.frameRate=options.frameRate||16;
    this.context=this.domElement.getContext('2d',{alpha:this.transparent});
    this.isSoftwareRenderer=true;
    this.shadowMap={};this.ratio=1;this.lastFrame=-Infinity;
    this.geometryCache=new Map();this.width=800;this.height=450;
    this.clipMatrix=new THREE.Matrix4();this.normalMatrix=new THREE.Matrix3();
    this.viewProjection=new THREE.Matrix4();
    this.light=V(-.5,.85,1).normalize();this.fill=V(.65,.3,-.7).normalize();
    this.eye=V();this.half=V();
  }
  setPixelRatio(ratio){this.ratio=Math.min(ratio,1.35);}
  setSize(width,height){
    const scale=Math.min(this.ratio,1100/width,700/height);
    this.width=Math.max(1,Math.round(width*scale));this.height=Math.max(1,Math.round(height*scale));
    this.domElement.width=this.width;this.domElement.height=this.height;
    this.domElement.style.width=`${width}px`;this.domElement.style.height=`${height}px`;
    this.lastFrame=-Infinity;
  }
  simplified(source){
    const p=source.parameters||{};
    if(source.type==='TubeGeometry')return new THREE.TubeGeometry(p.path,Math.min(p.tubularSegments,80),p.radius,p.radius<.025?5:7,p.closed);
    if(source.type==='CylinderGeometry')return new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,Math.min(p.radialSegments,20),p.heightSegments,p.openEnded,p.thetaStart,p.thetaLength);
    if(source.type==='TorusGeometry')return new THREE.TorusGeometry(p.radius,p.tube,6,Math.min(p.tubularSegments,28),p.arc);
    if(source.type==='SphereGeometry')return new THREE.SphereGeometry(p.radius,Math.min(p.widthSegments,14),Math.min(p.heightSegments,9),p.phiStart,p.phiLength,p.thetaStart,p.thetaLength);
    if(source.type==='LatheGeometry')return new THREE.LatheGeometry(p.points,24,p.phiStart,p.phiLength);
    return source;
  }
  cached(source){
    if(this.geometryCache.has(source))return this.geometryCache.get(source);
    const geometry=this.simplified(source),position=geometry.attributes.position.array,normal=geometry.attributes.normal?.array;
    const uv=geometry.attributes.uv?.array,index=geometry.index?.array;
    const faces=[],length=index?index.length:position.length/3;
    for(let i=0;i<length;i+=3){
      const a=index?index[i]:i,b=index?index[i+1]:i+1,c=index?index[i+2]:i+2;
      const nx=normal?(normal[a*3]+normal[b*3]+normal[c*3])/3:0;
      const ny=normal?(normal[a*3+1]+normal[b*3+1]+normal[c*3+1])/3:1;
      const nz=normal?(normal[a*3+2]+normal[b*3+2]+normal[c*3+2])/3:0;
      faces.push({a,b,c,nx,ny,nz});
    }
    const data={geometry,source,position,uv,faces,screen:new Float32Array(position.length),edgeScreen:null};
    this.geometryCache.set(source,data);return data;
  }
  projected(vector,camera){
    const p=vector.clone().project(camera);return [(p.x*.5+.5)*this.width,(-p.y*.5+.5)*this.height,p.z];
  }
  render(scene,camera){
    const now=performance.now();if(now-this.lastFrame<1000/this.frameRate)return;this.lastFrame=now;
    const ctx=this.context,w=this.width,h=this.height;
    if(this.transparent)ctx.clearRect(0,0,w,h);
    else{const gradient=ctx.createLinearGradient(0,0,0,h);gradient.addColorStop(0,'#dce7ef');gradient.addColorStop(.56,'#eaf0f4');gradient.addColorStop(1,'#cedee9');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);}
    if(!this.modelRoot)return;
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    this.viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    if(!this.transparent){const shadowPoint=this.projected(V(0,-.2,0),camera);
    const shadow=ctx.createRadialGradient(shadowPoint[0],shadowPoint[1],w*.02,shadowPoint[0],shadowPoint[1],w*.34);
    shadow.addColorStop(0,'rgba(58,86,108,.2)');shadow.addColorStop(1,'rgba(58,86,108,0)');
    ctx.save();ctx.translate(shadowPoint[0],shadowPoint[1]);ctx.scale(1,.22);ctx.translate(-shadowPoint[0],-shadowPoint[1]);ctx.fillStyle=shadow;ctx.fillRect(shadowPoint[0]-w*.4,shadowPoint[1]-w*.4,w*.8,w*.8);ctx.restore();}
    const drawList=[];
    this.modelRoot.traverse(object=>{
      if(!object.isMesh||!object.visible)return;
      const material=Array.isArray(object.material)?object.material[0]:object.material;
      if(!material?.visible)return;
      const data=this.cached(object.geometry),positions=data.position,screen=data.screen;
      this.clipMatrix.multiplyMatrices(this.viewProjection,object.matrixWorld);
      const e=this.clipMatrix.elements;
      for(let i=0;i<positions.length;i+=3){
        const x=positions[i],y=positions[i+1],z=positions[i+2],q=1/(e[3]*x+e[7]*y+e[11]*z+e[15]);
        screen[i]=((e[0]*x+e[4]*y+e[8]*z+e[12])*q*.5+.5)*w;
        screen[i+1]=(-(e[1]*x+e[5]*y+e[9]*z+e[13])*q*.5+.5)*h;
        screen[i+2]=(e[2]*x+e[6]*y+e[10]*z+e[14])*q;
      }
      this.normalMatrix.getNormalMatrix(object.matrixWorld);const n=this.normalMatrix.elements;
      const worldPos=V().setFromMatrixPosition(object.matrixWorld);
      this.eye.copy(camera.position).sub(worldPos).normalize();this.half.copy(this.eye).add(this.light).normalize();
      const col=(material.color||new THREE.Color('#dce7ef')).clone().convertLinearToSRGB();
      const metal=material.metalness||0,roughness=material.roughness??.6;
      const texture=material.map?.image,transmission=material.transmission||0;
      const alpha=transmission>.8?.2:transmission>.5?.39:Math.min(material.opacity??1,1);
      for(const face of data.faces){
        const a=face.a*3,b=face.b*3,c=face.c*3;
        const x1=screen[a],y1=screen[a+1],x2=screen[b],y2=screen[b+1],x3=screen[c],y3=screen[c+1];
        const area=(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1);
        if(Math.abs(area)<.015||(material.side===THREE.FrontSide&&area>=0)||(material.side===THREE.BackSide&&area<0))continue;
        const z=(screen[a+2]+screen[b+2]+screen[c+2])/3;if(z<-1||z>1)continue;
        let nx=n[0]*face.nx+n[3]*face.ny+n[6]*face.nz,ny=n[1]*face.nx+n[4]*face.ny+n[7]*face.nz,nz=n[2]*face.nx+n[5]*face.ny+n[8]*face.nz;
        const inverse=1/(Math.hypot(nx,ny,nz)||1)*(area>0?-1:1);nx*=inverse;ny*=inverse;nz*=inverse;
        const diffuse=Math.max(0,nx*this.light.x+ny*this.light.y+nz*this.light.z);
        const fill=Math.max(0,nx*this.fill.x+ny*this.fill.y+nz*this.fill.z);
        const spec=Math.pow(Math.max(0,nx*this.half.x+ny*this.half.y+nz*this.half.z),18+55*(1-roughness))*(.12+metal*.7);
        const light=.48+diffuse*.42+fill*.16+ny*.055;
        const r=Math.min(255,Math.round((col.r*light+spec)*255)),g=Math.min(255,Math.round((col.g*light+spec)*255)),bl=Math.min(255,Math.round((col.b*light+spec)*255));
        drawList.push({x1,y1,x2,y2,x3,y3,z,fill:`rgb(${r},${g},${bl})`,alpha,texture,uv:data.uv,a:face.a,b:face.b,c:face.c});
      }
    });
    drawList.sort((a,b)=>b.z-a.z);
    for(const face of drawList){
      ctx.globalAlpha=face.alpha;ctx.beginPath();ctx.moveTo(face.x1,face.y1);ctx.lineTo(face.x2,face.y2);ctx.lineTo(face.x3,face.y3);ctx.closePath();
      if(face.texture&&face.uv){
        const uv=face.uv,iw=face.texture.width,ih=face.texture.height;
        const u1=uv[face.a*2]*iw,v1=(1-uv[face.a*2+1])*ih,u2=uv[face.b*2]*iw,v2=(1-uv[face.b*2+1])*ih,u3=uv[face.c*2]*iw,v3=(1-uv[face.c*2+1])*ih;
        const det=u1*(v2-v3)+u2*(v3-v1)+u3*(v1-v2);
        if(Math.abs(det)>.0001){
          const a=(face.x1*(v2-v3)+face.x2*(v3-v1)+face.x3*(v1-v2))/det;
          const b=(face.y1*(v2-v3)+face.y2*(v3-v1)+face.y3*(v1-v2))/det;
          const c=(face.x1*(u3-u2)+face.x2*(u1-u3)+face.x3*(u2-u1))/det;
          const d=(face.y1*(u3-u2)+face.y2*(u1-u3)+face.y3*(u2-u1))/det;
          const e=(face.x1*(u2*v3-u3*v2)+face.x2*(u3*v1-u1*v3)+face.x3*(u1*v2-u2*v1))/det;
          const f=(face.y1*(u2*v3-u3*v2)+face.y2*(u3*v1-u1*v3)+face.y3*(u1*v2-u2*v1))/det;
          ctx.save();ctx.clip();ctx.transform(a,b,c,d,e,f);ctx.drawImage(face.texture,0,0);ctx.restore();
        }
      }else{
        ctx.fillStyle=face.fill;ctx.fill();
        // A fractional same-color edge seals raster seams between opaque faces.
        if(face.alpha>.95){ctx.strokeStyle=face.fill;ctx.lineWidth=.35;ctx.stroke();}
      }
    }
    ctx.globalAlpha=1;
  }
  dispose(){for(const data of this.geometryCache.values())if(data.geometry!==data.source)data.geometry.dispose();this.geometryCache.clear();}
  forceContextLoss(){}
}

function dispose() {
  if(!current)return;
  const instance=current;current=null;
  cancelAnimationFrame(instance.frame);
  instance.observer?.disconnect();instance.controls?.dispose();
  instance.media?.removeEventListener('change',instance.onMedia);
  instance.host.removeEventListener('keydown',instance.onKey);
  const geometries=new Set(),materialsSet=new Set(),textures=new Set();
  instance.scene?.traverse(object=>{
    if(object.geometry)geometries.add(object.geometry);
    const mats=Array.isArray(object.material)?object.material:[object.material];
    for(const material of mats){if(!material)continue;materialsSet.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}
  });
  for(const item of [...geometries,...materialsSet,...textures])item.dispose();
  instance.environment?.dispose();
  instance.renderer?.dispose();instance.renderer?.forceContextLoss();
  instance.host.replaceChildren();
}

function mount(host, toolId) {
  dispose();
  if(!host || !families[toolId])return false;
  host.classList.add('device-bench');
  host.innerHTML=`<div class="bench-stage"><div class="bench-topline"><span><i></i> INTERACTIVE DEVICE</span><span>Drag to orbit · scroll to zoom</span></div><div class="bench-canvas" role="img" tabindex="0" aria-label="Interactive three-dimensional equipment model. Use the rotate buttons or arrow keys to change the view."></div><div class="bench-motion-indicator" aria-hidden="true"><span></span><b>DEVICE MOTION</b></div></div><div class="bench-controls"><div class="bench-motion-copy"><span class="bench-kicker">MECHANICAL DETAIL</span><strong class="bench-motion-name"></strong><span class="bench-detail"></span></div><div class="bench-button-row"><button type="button" class="bench-rotate-left" aria-label="Rotate equipment left">↶</button><button type="button" class="bench-rotate-right" aria-label="Rotate equipment right">↷</button><button type="button" class="bench-reset">Reset view</button><button type="button" class="bench-play"></button></div><label class="bench-scrubber">Explore motion <input type="range" min="0" max="100" step="1" value="0" aria-label="Equipment mechanical motion position"><output>0%</output></label><p class="bench-disclaimer">Illustrative device motion · not device physics</p></div>`;
  const stage=host.querySelector('.bench-canvas');
  const instance={host,frame:0};current=instance;
  let renderer;
  try{
    const surface=document.createElement('canvas');
    const context=surface.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance'});
    renderer=context?new THREE.WebGLRenderer({canvas:surface,context,antialias:true,alpha:false,powerPreference:'high-performance'}):new CanvasDeviceRenderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  }catch(error){
    renderer=new CanvasDeviceRenderer();renderer.setPixelRatio(window.devicePixelRatio||1);
  }
  instance.renderer=renderer;stage.append(renderer.domElement);
  const scene=new THREE.Scene();instance.scene=scene;scene.background=new THREE.Color('#dae4ed');scene.fog=new THREE.Fog('#dae4ed',14,30);
  const camera=new THREE.PerspectiveCamera(37,1,.05,50);
  const device=families[toolId](materials(),toolId);
  const root=device.root;root.position.y=1.28;root.rotation.y=-.12;scene.add(root);
  if(renderer.isSoftwareRenderer){renderer.modelRoot=root;host.classList.add('bench-software');}
  else host.classList.remove('bench-software');
  const scale=device.cameraScale||1;
  const home=V(2.9*scale,3.2*scale,5.3*scale),target=V(0,1.22,0);camera.position.copy(home);
  const controls=new OrbitControls(camera,renderer.domElement);instance.controls=controls;
  controls.target.copy(target);controls.enableDamping=true;controls.dampingFactor=.085;controls.enablePan=false;controls.minDistance=2.7*scale;controls.maxDistance=10*scale;controls.maxPolarAngle=Math.PI*.8;
  controls.update();
  const floor=mesh(scene,new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:'#d6e0e9',roughness:.75}),V(0,-.22));floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  const pedestal=mesh(scene,new THREE.CylinderGeometry(3.2,3.25,.09,96),new THREE.MeshStandardMaterial({color:'#e4ecf2',roughness:.55}),V(0,-.16));pedestal.receiveShadow=true;
  scene.add(new THREE.HemisphereLight('#eff8ff','#66778a',2.5));
  const key=new THREE.DirectionalLight('#ffffff',4.6);key.position.set(-2,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.02;key.shadow.bias=-.00025;key.shadow.radius=4;scene.add(key);
  const fill=new THREE.DirectionalLight('#c9e9ff',2.1);fill.position.set(4,2,-4);scene.add(fill);
  const rim=new THREE.DirectionalLight('#fff5e7',1.7);rim.position.set(-4,1,-3);scene.add(rim);
  if(!renderer.isSoftwareRenderer)try{instance.environment=studioEnvironment(renderer);scene.environment=instance.environment.texture;}catch(error){ /* Direct lights remain a usable rendering fallback. */ }
  const play=host.querySelector('.bench-play'),range=host.querySelector('input'),output=host.querySelector('output');
  host.querySelector('.bench-motion-name').textContent=device.motion;host.querySelector('.bench-detail').textContent=device.detail;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');instance.media=media;
  let playing=!media.matches&&!document.getElementById('reduceMotion')?.checked,position=0,time=0,last=performance.now();
  const updatePlay=()=>{play.textContent=playing?'Pause motion':'Play motion';play.setAttribute('aria-pressed',String(playing));host.classList.toggle('bench-paused',!playing);};
  const onMedia=()=>{if(media.matches){playing=false;updatePlay();}};instance.onMedia=onMedia;media.addEventListener('change',onMedia);
  play.onclick=()=>{playing=!playing;updatePlay();};
  const rotate=amount=>{root.rotation.y+=amount;};
  host.querySelector('.bench-rotate-left').onclick=()=>rotate(-Math.PI/8);
  host.querySelector('.bench-rotate-right').onclick=()=>rotate(Math.PI/8);
  host.querySelector('.bench-reset').onclick=()=>{camera.position.copy(home);controls.target.copy(target);root.rotation.y=-.12;controls.update();};
  range.oninput=()=>{playing=false;position=Number(range.value)/100;time=Math.acos(1-2*position)/.85;updatePlay();device.animate(position);output.textContent=`${range.value}%`;};
  instance.onKey=event=>{
    if(event.target!==stage)return;
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();rotate(event.key==='ArrowLeft'?-Math.PI/12:Math.PI/12);}
  };host.addEventListener('keydown',instance.onKey);
  const resize=()=>{const rect=stage.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.render(scene,camera);};
  instance.observer=new ResizeObserver(resize);instance.observer.observe(stage);resize();updatePlay();device.animate(0);renderer.render(scene,camera);
  function frame(now){
    if(current!==instance)return;
    instance.frame=requestAnimationFrame(frame);
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(document.hidden||!host.isConnected||!host.getClientRects().length)return;
    if(playing){time+=dt;position=(1-Math.cos(time*.85))/2;device.animate(position);const value=Math.round(position*100);range.value=String(value);output.textContent=`${value}%`;}
    controls.update();renderer.render(scene,camera);
  }
  instance.frame=requestAnimationFrame(frame);
  return true;
}

function createDeviceModel(id){return families[id]?families[id](materials(),id):null;}
function disposeDeviceModel(model){
  const geometry=new Set(),material=new Set(),texture=new Set();
  model?.root?.traverse(object=>{if(object.geometry)geometry.add(object.geometry);for(const m of Array.isArray(object.material)?object.material:[object.material])if(m){material.add(m);for(const v of Object.values(m))if(v?.isTexture)texture.add(v);}});
  for(const item of [...geometry,...material,...texture])item.dispose();
}
window.IRDeviceBench={mount,dispose,supported:Object.keys(families)};
export { mount, dispose, createDeviceModel, disposeDeviceModel, CanvasDeviceRenderer };
