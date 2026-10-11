/* Reference atlas only. These coordinates are authored illustrations, not device routes. */
(() => {
const branch=(name,parent,points,territory,caliber=7)=>({name,parent,points,territory,caliber,children:[]});
const hepatic={
 h_aorta:branch('Abdominal aorta',null,[[540,900],[535,650],[535,455],[535,200]],'Systemic arterial inflow',18),
 h_celiac:branch('Celiac trunk','h_aorta',[[535,455],[505,410],[454,385]],'Common hepatic, splenic and left gastric branches',13),
 h_common:branch('Common hepatic artery','h_celiac',[[454,385],[401,430],[346,461]],'Hepatic and gastroduodenal branch family',11),
 h_gda:branch('Gastroduodenal artery','h_common',[[346,461],[362,566],[411,649]],'Duodenal / pancreatic and gastroepiploic supply; extrahepatic territory',7),
 h_proper:branch('Proper hepatic artery','h_common',[[346,461],[302,407],[308,339]],'Right and left hepatic branch family',9),
 h_right:branch('Right hepatic artery','h_proper',[[308,339],[250,292],[193,273]],'Right liver branch family',8),
 h_right_ant:branch('Right anterior sectoral branch','h_right',[[193,273],[226,202],[255,153]],'Illustrative anterior-sector distribution',5),
 h_right_post:branch('Right posterior sectoral branch','h_right',[[193,273],[151,211],[100,190]],'Illustrative posterior-sector distribution',5),
 h_cystic:branch('Cystic artery · example origin','h_right',[[193,273],[226,370],[244,449]],'Gallbladder; origin and course vary',3),
 h_left:branch('Left hepatic artery','h_proper',[[308,339],[421,300],[514,286]],'Left liver branch family',7),
 h_left_medial:branch('Medial hepatic branch · example','h_left',[[514,286],[434,225],[383,190]],'Medial liver territory; branching varies',4),
 h_left_lateral:branch('Lateral hepatic branch · example','h_left',[[514,286],[577,244],[626,228]],'Lateral left-liver territory',4),
 h_gastric:branch('Left gastric artery','h_celiac',[[454,385],[510,338],[601,362]],'Gastric supply; potential origin of a variant left hepatic artery',6),
 h_splenic:branch('Splenic artery','h_celiac',[[454,385],[587,440],[630,400],[708,455],[817,390]],'Splenic branch family',9),
 h_sma:branch('Superior mesenteric artery','h_aorta',[[535,520],[584,599],[601,738]],'Mesenteric supply; potential origin of a variant right hepatic artery',12)
};
function liver(variant='typical') {const n=JSON.parse(JSON.stringify(hepatic));if(variant==='rha-sma'){n.h_right.parent='h_sma';n.h_right.points=[[584,599],[469,546],[394,347],[193,273]];n.h_right.name='Replaced right hepatic · from SMA';}if(variant==='lha-gastric'){n.h_left.parent='h_gastric';n.h_left.points=[[560,347],[589,310],[514,286]];n.h_left.name='Replaced left hepatic · from left gastric';}return connect(n);}
function connect(n){for(const b of Object.values(n))b.children=[];for(const [id,b] of Object.entries(n))if(b.parent&&n[b.parent])n[b.parent].children.push(id);return n;}
function renal(){const n={k_aorta:branch('Abdominal aorta',null,[[512,150],[512,440],[512,875]],'Renal arteries arise from the abdominal aorta',18)};for(const [side,sign] of [['r',-1],['l',1]]){const P=p=>p.map(([x,y])=>[512+sign*x,y]),label=side==='r'?'Right':'Left';n[side+'_renal']=branch(label+' renal artery','k_aorta',P([[0,440],[110,430],[167,460]]),'Renal hilar inflow',11);n[side+'_renal_anterior']=branch(label+' anterior division',side+'_renal',P([[167,460],[204,462],[224,470]]),'Anterior segmental branch family',8);n[side+'_renal_posterior']=branch(label+' posterior segmental branch',side+'_renal',P([[167,460],[241,392],[290,360]]),'Posterior renal territory',6);for(const [key,name,pts] of [['apical','Apical',[[224,470],[231,317],[254,271]]],['upper','Upper',[[224,470],[290,383],[332,351]]],['middle','Middle',[[224,470],[297,484],[338,499]]],['lower','Lower',[[224,470],[261,620],[292,674]]]])n[side+'_renal_'+key]=branch(label+' '+name.toLowerCase()+' segmental branch',side+'_renal_anterior',P(pts),name+' renal territory · one illustrative pattern',4.5);}return connect(n);}
const regions={
 knee:{title:'Knee & genicular network',subtitle:'Articular branches, skin territories and osseous landmarks',image:'knee',mirror:true,source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12325466/',sourceName:'Angiographic study of genicular branching and anastomoses',landmarks:[[500,270,'Distal femur'],[518,428,'Patella'],[510,665,'Proximal tibia'],[750,738,'Fibular head']]},
 pelvis:{title:'Pelvis & prostate',subtitle:'Internal iliac divisions and neighboring organ territories',image:'abdomen',source:'https://pubmed.ncbi.nlm.nih.gov/24325930/',sourceName:'Cadaveric study of prostatic arterial anatomy',landmarks:[[510,560,'Bladder'],[510,760,'Prostate'],[380,850,'Rectal neighborhood']]},
 hepatic:{title:'Liver & celiac branches',subtitle:'Hepatic inflow, extrahepatic supply and example origin variants',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8415139/',sourceName:'Hepatic arterial variants in 5,625 patients',landmarks:[[200,180,'Right liver'],[550,225,'Left liver'],[660,550,'Stomach'],[834,343,'Spleen'],[230,454,'Gallbladder']]},
 renal:{title:'Kidneys & segmental supply',subtitle:'Bilateral renal arteries and an illustrative segmental pattern',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10439307/',sourceName:'Anatomical study of renal segmental branching',landmarks:[[205,270,'Right kidney'],[820,270,'Left kidney'],[375,508,'Renal hilum'],[646,508,'Renal hilum']]},
 thigh:{title:'Thigh & femoral branches',subtitle:'Superficial and deep femoral pathways',image:'thigh',source:'https://pubmed.ncbi.nlm.nih.gov/34657976/',sourceName:'Genicular anatomy and embolization review',landmarks:[[600,490,'Femoral shaft'],[310,260,'Deep femoral territory']]},
 abdomen:{title:'Aortoiliac access',subtitle:'Aortic bifurcation, iliac inflow and femoral access',image:'abdomen',source:'https://pubmed.ncbi.nlm.nih.gov/23244724/',sourceName:'Pelvic arterial anatomy reference',landmarks:[[450,250,'Lumbar spine'],[510,580,'Aortic bifurcation'],[680,850,'Inguinal region']]},
 chest:{title:'Upper-limb access route',subtitle:'Brachial, axillary, subclavian and aortic arch pathway',image:'chest',source:'https://pubmed.ncbi.nlm.nih.gov/39745868/',sourceName:'CT angiography of upper-extremity arteries',landmarks:[[850,730,'Upper arm'],[700,300,'Axillary region'],[440,210,'Aortic arch']]}
};
function recommended(p){if(['y90','tace','biliary','cholecystostomy','tips'].includes(p))return 'hepatic';if(['nephrostomy','biopsy','ablation'].includes(p))return 'renal';if(['pae','ufe','varicocele'].includes(p))return 'pelvis';if(p==='gae')return 'knee';if(['picc','port','cvc'].includes(p))return 'chest';if(['angioplasty','stent','thrombectomy','dialysis'].includes(p))return 'thigh';return 'abdomen';}
function graph(region,nav,variant='typical'){if(region==='hepatic')return liver(variant);if(region==='renal')return renal();const n={};for(const [id,b] of Object.entries(nav.nodes))if(b.region===region){n[id]={...b,points:b.points.map(p=>p.slice()),children:b.children.filter(k=>nav.nodes[k]?.region===region)};}for(const [id,b] of Object.entries(n))for(const child of b.children)n[child].parent=id;return n;}
function route(n,id){const seen=new Set(),out=[];while(n[id]&&!seen.has(id)){seen.add(id);out.unshift(id);id=n[id].parent;}return out;}
window.IRAnatomyData={regions,graph,route,recommended,liver,renal};
})();
