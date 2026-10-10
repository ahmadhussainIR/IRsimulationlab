const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function model(){const c={window:{dispatchEvent(){}},CustomEvent:class{},document:{hidden:false},performance:{now:()=>0}};vm.createContext(c);vm.runInContext(fs.readFileSync('navigation.js','utf8'),c);c.window.IRNavigation.testTime=t=>c.performance.now=()=>t;return c.window.IRNavigation}
function reach(n,path){n.setTool('wire');for(const id of path){n.move(1);n.setTorque(n.nodes[id].angle);assert.equal(n.enter(id),true,'Can enter '+id)}n.move(1)}
test('GAE femoral entry, branch junction gating and treatment only after catheter + contrast',()=>{const n=model();assert.equal(n.id(),'femoral');assert.equal(n.enter('sfa'),false);reach(n,['sfa','distalsfa','popliteal','slga','slga_articular']);assert.equal(n.start(),false);n.setTool('microcatheter');assert.equal(n.seat(),true);n.setTool('particles');assert.equal(n.start(),false);n.inject();assert.equal(n.start(),true);for(let t=1;t<12000;t+=80)n.tick(t);assert.equal(n.get().treated.slga_articular,1);assert.equal(n.get().delivering,false);assert.equal(n.get().treated.smga,undefined);assert.equal(n.start(),false)});
test('Brachial route passes through arch, aorta and iliac vessels before ATRA',()=>{const n=model();n.reset('Brachial','gae');reach(n,['axillary','subclavian','arch','descending','aorta','iliac','external','femoral','sfa','distalsfa','popliteal','distalpop','ata','atra']);assert.equal(n.id(),'atra');n.move(-2);assert.equal(n.id(),'ata')});
for(const origin of ['direct','vesical','obturator','pudendal'])test('PAE bilateral access and origin variant '+origin,()=>{const n=model();n.reset('Femoral','pae',origin);let tail=origin==='direct'?[]:['l_'+origin];reach(n,['pa_external','pa_common','pa_bifurcation','l_common','l_internal','l_anterior',...tail,'l_prostate','l_central']);assert.equal(n.id(),'l_central');assert.equal(n.get().variant,origin);n.reset('Brachial','pae',origin);let rightTail=origin==='direct'?[]:['r_'+origin];reach(n,['axillary','subclavian','arch','descending','aorta','pa_bifurcation','r_common','r_internal','r_anterior',...rightTail,'r_prostate','r_capsular']);assert.equal(n.id(),'r_capsular')});
test('Non-target branch has no embolization; reset clears treatment; stop preserves partial result',()=>{const n=model();reach(n,['sfa','distalsfa','popliteal','distalpop','ilga']);n.setTool('microcatheter');n.seat();n.inject();n.setTool('particles');assert.equal(n.start(),false);n.reset('Femoral','gae');reach(n,['sfa','distalsfa','dga','dga_articular']);n.setTool('microcatheter');n.seat();n.inject();n.setTool('particles');n.start();for(let t=1;t<2000;t+=80)n.tick(t);n.stop();const before=n.get().treated.dga_articular;n.tick(3000);assert.equal(n.get().treated.dga_articular,before);assert(before>0&&before<1);n.reset();assert.equal(Object.keys(n.get().treated).length,0)});

test('Torque determines which branch further wire advancement enters',()=>{const n=model();n.move(1);n.setTorque(-65);n.move(.1);assert.equal(n.id(),'profunda');n.move(-.2);assert.equal(n.id(),'femoral');n.setTorque(0);n.move(.1);assert.equal(n.id(),'sfa')});

test('Access contrast follows the entry territory; SLGA contrast excludes sibling genicular arteries',()=>{
 const n=model();reach(n,['sfa','distalsfa','popliteal','slga']);n.inject();
 assert.equal(n.get().contrastRoot,'femoral');assert(n.get().contrastTerritory.includes('profunda'));assert(n.get().contrastTerritory.includes('smga'));assert(!n.get().contrastTerritory.includes('aorta'));
 n.setTool('microcatheter');n.seat();n.inject();
 assert.equal(n.get().contrastRoot,'slga');assert.deepEqual(Array.from(n.get().contrastTerritory),['slga','slga_articular','slga_cutaneous']);assert.equal(n.get().assessed.smga,undefined);
 const acquired=n.get().contrastAcquisition;n.move(-.2);assert.equal(acquired.position,1);assert.equal(n.get().contrastRoot,'slga');assert.equal(n.get().contrastPosition,1);
});

test('PAE selective injection fills only downstream branches of the actual catheter tip',()=>{
 const n=model();n.reset('Femoral','pae');reach(n,['pa_external','pa_common','r_internal','r_anterior','r_prostate']);n.setTool('microcatheter');n.seat();n.inject();
 assert.deepEqual(Array.from(n.get().contrastTerritory),['r_prostate','r_central','r_capsular']);assert(!n.get().contrastTerritory.includes('r_vesical'));assert(!n.get().contrastTerritory.includes('l_central'));
});

test('Wire can explore onward while the microcatheter keeps its independent tip, then catheter tracks through the knee branches',()=>{
 const n=model();reach(n,['sfa','distalsfa','popliteal']);n.setTool('microcatheter');n.seat();
 n.setTool('wire');for(const next of ['distalpop','ata','atra']){n.setTorque(n.nodes[next].angle);assert(n.enter(next));n.move(1)}
 assert.equal(n.id(),'atra');assert.equal(n.get().catheter,'popliteal');assert.equal(n.get().catheterPosition,1);
 n.setTool('microcatheter');assert.equal(n.display().id,'popliteal');
 for(const next of ['distalpop','ata','atra']){assert(n.move(.1));assert.equal(n.get().catheter,next);assert(n.move(1));}
 assert.equal(n.get().catheter,'atra');assert.equal(n.get().catheterPosition,1);assert.equal(n.move(.1),false);assert.equal(n.get().position,1);
});

test('Microcatheter follows only the established wire route and never passes its tip',()=>{
 const n=model();reach(n,['sfa']);n.move(-.4);n.setTool('liquidMicro');
 assert.equal(n.enter('distalsfa'),false);n.move(1);n.move(.1);assert.equal(n.get().catheter,'sfa');n.move(1);
 assert.equal(n.get().catheterPosition,n.get().position);assert.equal(n.move(.5),false);assert.equal(n.id(),'sfa');
 n.move(-.2);assert(Math.abs(n.get().catheterPosition-.4)<1e-8);assert.equal(n.get().position,.6);
});

test('Wire withdrawal stops at the catheter until catheter retracts; another genicular branch can then be selected',()=>{
 const n=model();reach(n,['sfa','distalsfa','popliteal','slga']);n.setTool('microcatheter');n.seat();n.setTool('wire');
 assert.equal(n.move(-2),false);assert.equal(n.id(),'slga');assert.equal(n.get().position,1);
 n.setTool('microcatheter');n.move(-2);assert.equal(n.get().catheter,'popliteal');n.setTool('wire');n.move(-2);assert.equal(n.id(),'popliteal');
 n.setTorque(n.nodes.smga.angle);assert(n.enter('smga'));n.move(1);n.setTool('microcatheter');n.move(.1);assert.equal(n.get().catheter,'smga');n.move(1);n.inject();
 assert.deepEqual(Array.from(n.get().contrastTerritory),['smga','smga_articular','smga_cutaneous']);
});

test('Contrast and embolic tools display the catheter field even when the wire is farther ahead',()=>{
 const n=model();reach(n,['sfa','distalsfa']);n.setTool('microcatheter');n.seat();n.setTool('wire');n.setTorque(0);n.enter('popliteal');n.move(.4);
 for(const tool of ['syringe','particles','evoh','nbca','oil']){n.setTool(tool);assert.equal(n.display().node.region,'thigh');assert.equal(n.display().device,'catheter');assert.equal(n.display().position,1)}
 n.setTool('wire');assert.equal(n.display().node.region,'knee');assert.equal(n.display().position,.4);
});

test('Selective image shows connected perfusion without sibling-vessel contrast',()=>{
 const n=model();reach(n,['sfa','distalsfa','popliteal','slga','slga_articular']);n.setTool('microcatheter');n.seat();n.inject();n.testTime(1500);
 const strokes=[],arcs=[];const context={save(){},restore(){},translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},fillText(){},stroke(){strokes.push(this.strokeStyle)},arc(...args){arcs.push(args)},fill(){}};
 n.draw(context,1.5);assert.equal(n.get().contrastTerritory.join(','),'slga_articular');assert(arcs.length>30);assert.equal(n.contrastAt('smga',1500).density,0);n.reset();assert.equal(n.get().contrastRoot,null);
});
test('Named DGA branches distinguish articular from skin and muscle territories',()=>{
 const n=model();assert.deepEqual(Array.from(n.nodes.dga.children),['dga_articular','dga_saphenous','dga_muscular']);
 reach(n,['sfa','distalsfa','dga','dga_saphenous']);n.setTool('microcatheter');n.seat();n.inject();n.setTool('particles');assert.equal(n.start(),false);assert.equal(n.nodes.dga_saphenous.blush,0);
});
test('Contrast propagates from its captured tip, reaches tissue and washes out',()=>{
 const n=model();reach(n,['sfa','distalsfa','popliteal','slga']);n.setTool('microcatheter');n.seat();n.move(-.8);n.inject();
 assert.equal(n.contrastAt('slga_articular',0).density,0);assert(n.contrastAt('slga',100).front>0);assert(n.contrastAt('slga_articular',3000).blush>0);assert(n.contrastAt('slga_articular',5800).density<n.contrastAt('slga_articular',3000).density);assert.equal(n.contrastAt('slga_articular',6600).density,0);
});
test('Dual PAE origin keeps central and peripheral supplies separate and resets cleanly',()=>{
 const n=model();n.reset('Femoral','pae','dual');reach(n,['pa_external','pa_common','r_internal','r_anterior','r_vesical','r_prostate','r_central']);n.setTool('microcatheter');n.seat();n.inject();assert.equal(n.get().contrastTerritory.join(','),'r_central');assert(!n.nodes.r_prostate.children.includes('r_capsular'));assert(n.nodes.r_pudendal.children.includes('r_capsular'));
 n.reset('Femoral','pae','direct');assert(n.nodes.r_prostate.children.includes('r_capsular'));assert(!n.nodes.r_pudendal.children.includes('r_capsular'));assert.deepEqual(Array.from(n.nodes.r_capsular.points[0]),Array.from(n.nodes.r_prostate.points.at(-1)));
});
test('Every branch is finite, connected and reachable from a supported access route',()=>{
 const n=model();for(const node of Object.values(n.nodes)){assert(node.points.length>=2);for(const p of node.points)assert(p.every(Number.isFinite));for(const child of node.children)assert(n.nodes[child]);}
 for(const k of ['slga_articular','imga_cutaneous','dga_muscular','descending_lcfa'])assert(n.downstream('femoral').includes(k));n.reset('Femoral','pae');for(const k of ['r_bladder','l_perineal','r_lateral_sacral'])assert(n.downstream('pa_access').includes(k));
});
