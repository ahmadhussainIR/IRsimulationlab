/* Room choreography only; this does not model puncture technique or establish clinical access. */
(function(root){
const sites={Femoral:[48,55],Brachial:[42,53],Jugular:[37,49],Dialysis:[42,53],Percutaneous:[47,54]};
function anchor(access,travel=0){const p=sites[access]||sites.Percutaneous;return [p[0]+travel*.14,p[1]+travel*.035];}
function family(tool){if(['syringe','particles','evoh','nbca','oil','chemo','y90'].includes(tool))return 'syringe';if(['needle','micropuncture','biopsy','tipsNeedle','probe'].includes(tool))return 'needle';if(tool==='ultrasound')return 'probe';if(['wire','hydrophilic','microwire'].includes(tool))return 'wire';return 'catheter';}
function action(s,t){
 if(s.shielded||s.traveling)return {kind:'away',resident:s.traveling?(s.shielded?'Walking to control room':'Returning to the access site'):'Reviewing from control room',nurse:s.traveling?'Moving with the procedure team':'Monitoring from control room',moving:false};
 if(t<s.accessUntil){const phase=Math.floor((6000-(s.accessUntil-t))/2000);return {kind:['prepare','position','access'][Math.max(0,Math.min(2,phase))],resident:['Positioning at selected access','Aligning hands at access','Stabilizing access hub'][Math.max(0,Math.min(2,phase))],nurse:['Preparing the access set','Passing the access set','Supporting the sterile field'][Math.max(0,Math.min(2,phase))],moving:true};}
 if(s.injecting||s.delivering)return {kind:'inject',resident:'Holding the catheter hub',nurse:s.delivering?'Assisting simulated delivery':'Operating the contrast syringe',moving:true};
 if(t<s.exchangeUntil)return {kind:'exchange',resident:'Receiving selected instrument',nurse:'Passing selected instrument',moving:true};
 if(t<s.torqueUntil)return {kind:'torque',resident:'Rotating the torque device',nurse:'Supporting the external wire',moving:true};
 if(s.holding||t<s.moveUntil||s.playing){const type=family(s.tool),back=s.direction<0;return {kind:type,resident:type==='wire'?(back?'Retracting the wire':'Feeding the wire'):type==='catheter'?(back?'Retracting the catheter':'Tracking the catheter'):type==='probe'?'Positioning the probe':'Handling the access device',nurse:'Managing the external device',moving:true};}
 return {kind:'ready',resident:'Steady at the access hub',nurse:'Ready to assist',moving:false};
}
function frame(t,moving,reduced=false){return moving&&!reduced?[0,1,2,3,2,1][Math.floor(t/150)%6]:2;}
const api={anchor,family,action,frame};if(typeof module!=='undefined')module.exports=api;else root.IRStaffMotion=api;
})(typeof window==='undefined'?globalThis:window);
