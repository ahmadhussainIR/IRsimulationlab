/* Expanded conceptual curriculum. Source links accompany every module. */
const extraProcedures=[
['gae','Genicular artery embolization','Vascular','gae','KNEE ARTERIES','Reduce abnormal synovial perfusion in selected knee-pain patients.','Microcatheter|Microwire|Embolic particles','https://www.uclahealth.org/medical-services/radiology/interventional-radiology/treatments-procedures/genicular-artery-embolization-gae','Map knee vessels|Select genicular branch|Assess target blush|Deliver particles|Review perfusion','GAE targets vessels supplying the synovium; selection and outcomes require specialist assessment.'],
['y90','Y-90 radioembolization','Oncology','y90','HEPATIC ARTERIES','Deliver radioactive microspheres to a selected liver territory.','Selective catheter|Microcatheter|Y-90 delivery system','https://www.radiologyinfo.org/en/info/radioembol','Review planning|Map liver supply|Select territory|Simulate delivery|Plan follow-up','Mapping, shunt assessment, dosimetry, and radiation-safety processes are essential and are not reproduced by this model.'],
['tace','TACE','Oncology','tace','HEPATIC ARTERIES','Explore selective intra-arterial treatment of a liver tumor.','Selective catheter|Microcatheter|Treatment delivery system','https://www.radiologyinfo.org/en/info/chemoembol','Review target|Map tumor supply|Select branch|Simulate treatment|Assess distribution','Treatment agents, dosing and embolization endpoints are patient-specific and omitted.'],
['pae','Prostatic artery embolization','Vascular','pae','PELVIC ARTERIES','Explore selective reduction of prostatic arterial supply.','Microcatheter|Microwire|Embolic particles','https://www.uclahealth.org/medical-services/radiology/prostate-imaging/treatments-procedures/prostate-artery-embolization','Map pelvis|Identify supply|Select branch|Deliver particles|Review territory','Pelvic collateral vessels can cause non-target injury; this is a simplified unilateral model.'],
['thrombectomy','Venous thrombectomy','Vascular','thrombectomy','VENOUS OUTFLOW','Explore removal of a conceptual obstructing clot.','Guidewire|Aspiration catheter|Collection system','https://www.radiologyinfo.org/en/info/thrombo','Locate thrombus|Access vein|Position catheter|Simulate aspiration|Reassess flow','Mechanical devices and eligibility differ. The model does not simulate force, clot fragmentation, or anticoagulation.'],
['dialysis','Dialysis access intervention','Access','dialysis','FISTULA / OUTFLOW','Explore imaging and treatment of narrowed dialysis access.','Guidewire|Balloon catheter|Imaging catheter','https://www.radiologyinfo.org/en/info/dialysisfistulagraft','Assess circuit|Map narrowing|Position balloon|Expand balloon|Reassess access','The model omits access flow measurement, thrombus management and decisions about revision.'],
['thoracentesis','Thoracentesis','Drainage','thoracentesis','PLEURAL SPACE','Explore removal of fluid from the pleural space.','Ultrasound probe|Drainage needle|Drainage tubing','https://www.radiologyinfo.org/en/info/thoracentesis','Locate fluid|Plan route|Access pleural space|Remove fluid|Reassess','This mannequin does not define a safe puncture location or drainage volume.'],
['paracentesis','Paracentesis','Drainage','paracentesis','PERITONEAL SPACE','Explore drainage of abdominal ascites.','Ultrasound probe|Drainage catheter|Collection bag','https://www.guysandstthomas.nhs.uk/health-information/paracentesis-draining-fluid-tummy','Locate ascites|Plan route|Position drain|Drain fluid|Reassess','Fluid removal, observation and replacement therapy are determined clinically, not by this animation.'],
['cholecystostomy','Cholecystostomy','Drainage','cholecystostomy','GALLBLADDER','Explore image-guided gallbladder drainage.','Ultrasound probe|Guidewire|Pigtail drain','https://www.radiologyinfo.org/en/info/biliary','Locate gallbladder|Plan access|Position catheter|Drain bile|Follow response','The model omits adjacent bowel, access-route selection and infection management.'],
['gastrostomy','Radiologic gastrostomy','Access','gastrostomy','STOMACH','Explore image-guided placement of a feeding tube.','Access needle|Guidewire|Gastrostomy tube','https://www.cirse.org/wp-content/uploads/2025/03/cirse_PIB_2025_english_stamped_print.pdf','Define stomach|Plan access|Establish tract|Position tube|Confirm location','The model does not simulate gastropexy, tract formation, feeding protocols or complication management.'],
['cvc','Central venous catheter','Access','cvc','CENTRAL VEINS','Explore a catheter route into the central venous system.','Ultrasound probe|Guidewire|Central venous catheter','https://www.radiologyinfo.org/en/info/vasc_access','Identify vein|Establish access|Guide catheter|Position tip|Confirm','Vessel identity and tip position require real-time clinical confirmation.'],
['varicocele','Varicocele embolization','Vascular','varicocele','GONADAL VEIN','Explore occlusion of an abnormal venous pathway.','Selective catheter|Microcatheter|Coils','https://www.radiologyinfo.org/en/info/varicocele','Map venous route|Select vein|Assess reflux|Deliver coils|Review outflow','This simplified model omits collaterals, reflux testing and individual venous anatomy.']
];
for(const [id,name,category,type,view,objective,toolText,url,stageText,caution] of extraProcedures){const names=stageText.split('|');procedures.push({id,name,category,type,view,icon:category==='Drainage'?'◌':'⌁',modality:['thoracentesis','paracentesis'].includes(type)?'ULTRASOUND':'FLUOROSCOPY',description:objective,objective,tools:toolText.split('|'),caution,source:url,steps:names.map((n,i)=>[n,[`Review the intended target for ${name.toLowerCase()}.`,'Use the simulated image to relate the device to the target.',`Observe the ${toolText.split('|')[0].toLowerCase()} and access pathway.`,'The animation illustrates the treatment concept, without clinical settings.', 'Review the conceptual result. Real treatment requires clinical and imaging follow-up.'][i]]),question:'What does this simulation demonstrate?',answers:[objective,'A complete clinical protocol','A validated patient-specific treatment plan'],correct:0,explanation:'This is a conceptual procedure model, not a clinical protocol.'})}
const equipmentCatalog={
 filter:{name:'IVC filter',group:'Treatment',icon:'⋀',description:'Retrievable filter concept. Indication and retrieval planning are not simulated.'},
 central:{name:'Central venous catheter',group:'Catheters',icon:'↝',description:'A venous catheter model with a central tip concept.'},
 port:{name:'Implanted port',group:'Catheters',icon:'⊙',description:'A reservoir and central catheter concept.'},
 needle:{name:'Access needle',group:'Needles',icon:'╱',description:'Straight access needle model. Choose a device to visualize its role, not its clinical size.'},
 micropuncture:{name:'Micropuncture needle',group:'Needles',icon:'╱',description:'Small access-set concept. No gauge or device compatibility is prescribed.'},
 biopsy:{name:'Core biopsy needle',group:'Needles',icon:'━',description:'Sampling device for biopsy modules.'},
 wire:{name:'J-tip guidewire',group:'Wires',icon:'⌁',description:'A curved-tip wire model that defines an access path.'},
 hydrophilic:{name:'Hydrophilic guidewire',group:'Wires',icon:'∿',description:'Guidewire selection concept; coating and force behavior are not simulated.'},
 microwire:{name:'Microwire',group:'Wires',icon:'∽',description:'Wire model used with a microcatheter concept.'},
 sheath:{name:'Introducer sheath',group:'Catheters',icon:'╞',description:'Access sheath with a short external hub.'},
 pigtail:{name:'Pigtail catheter',group:'Catheters',icon:'↝',description:'Curved catheter tip used here as an imaging or drainage model.'},
 cobra:{name:'Cobra catheter',group:'Catheters',icon:'ʃ',description:'Selective catheter shape. Real vessel and device selection is individualized.'},
 simmons:{name:'Simmons catheter',group:'Catheters',icon:'∽',description:'Reverse-curve selective catheter shape concept.'},
 vertebral:{name:'Vertebral catheter',group:'Catheters',icon:'⌝',description:'Angled catheter shape for selective catheterization concepts.'},
 microcatheter:{name:'Microcatheter',group:'Catheters',icon:'⌁',description:'Small catheter model for selective treatment delivery.'},
 balloon:{name:'Angioplasty balloon',group:'Treatment',icon:'◈',description:'A temporary expanding balloon model.'},
 stent:{name:'Vascular stent',group:'Treatment',icon:'▥',description:'A mesh scaffold model.'},
 coils:{name:'Embolization coils',group:'Treatment',icon:'◎',description:'Radiopaque coil model for selected embolization concepts.'},
 particles:{name:'Embolic particles',group:'Treatment',icon:'⁙',description:'Particle delivery concept; particles themselves are not individually visible on routine fluoroscopy.'},
 y90:{name:'Y-90 delivery set',group:'Treatment',icon:'☢',description:'Radioembolization delivery-system concept; no activity or dosimetry is calculated.'},
 aspiration:{name:'Aspiration catheter',group:'Treatment',icon:'⇥',description:'Clot-removal catheter concept.'},
 probe:{name:'Ablation probe',group:'Treatment',icon:'✳',description:'Image-guided probe concept without treatment settings.'},
 drain:{name:'Pigtail drain',group:'Drainage',icon:'↝',description:'Drain model with a retaining loop and external collection system.'},
 feeding:{name:'Gastrostomy tube',group:'Drainage',icon:'⊙',description:'Feeding-tube placement concept.'},
 syringe:{name:'Contrast syringe',group:'Support',icon:'⊣',description:'Triggers a simulated contrast run. No concentration, volume or pressure is prescribed.'},
 ultrasound:{name:'Ultrasound probe',group:'Support',icon:'◒',description:'Surface-imaging probe model.'}
};

// Explicit educational trays; these are device families, not compatibility prescriptions.
Object.assign(equipmentCatalog,{
 uterine:{name:'Uterine artery catheter',group:'Catheters',icon:'ʃ',description:'Angled selective catheter model for uterine artery work.'},
 renal:{name:'Renal selective catheter',group:'Catheters',icon:'⌝',description:'Selective renal catheter shape concept.'},
 biliaryDrain:{name:'Internal–external biliary drain',group:'Drainage',icon:'↝',description:'Biliary drainage catheter with side-hole and retaining-loop concepts.'},
 pleural:{name:'Pleural drainage catheter',group:'Drainage',icon:'↝',description:'Small drainage catheter with collection tubing for the pleural fluid module.'},
 ascites:{name:'Ascites drainage catheter',group:'Drainage',icon:'↝',description:'Peritoneal drainage catheter and collection tubing concept.'},
 tipsNeedle:{name:'TIPS access needle set',group:'Needles',icon:'╱',description:'Dedicated transjugular intrahepatic access-set concept; puncture planning is not simulated.'},
 coveredStent:{name:'Covered TIPS stent',group:'Treatment',icon:'▥',description:'Covered stent-graft concept for the intrahepatic shunt.'},
 picc:{name:'PICC catheter',group:'Catheters',icon:'↝',description:'Peripherally inserted central catheter model.'},
 chemo:{name:'TACE delivery system',group:'Treatment',icon:'⁙',description:'Chemoembolization delivery concept. Agent, dose and preparation are omitted.'},
 liquidMicro:{name:'Liquid-embolic microcatheter',group:'Catheters',icon:'⌁',description:'Dedicated compatible delivery catheter concept. Compatibility must be confirmed for the specific embolic and device.'},
 evoh:{name:'EVOH liquid embolic',group:'Embolics',icon:'◕',description:'Radiopaque liquid-cast concept. Requires a compatible delivery system; indications vary by product and jurisdiction. No injection technique is modeled.'},
 nbca:{name:'n-BCA liquid embolic',group:'Embolics',icon:'◒',description:'Adhesive liquid-embolic concept shown as an illustrative radiopaque cast. Product indications and compatible devices vary. This material-family comparison is not a product recommendation; preparation and delivery parameters are omitted.'}
});
const procedureKits={
 angioplasty:['micropuncture','wire','sheath','vertebral','hydrophilic','balloon','syringe'],
 angiography:['micropuncture','wire','sheath','pigtail','cobra','syringe'],
 stent:['micropuncture','wire','sheath','vertebral','balloon','stent','syringe'],
 embolization:['micropuncture','wire','sheath','renal','microcatheter','microwire','coils','particles','liquidMicro','evoh','nbca','syringe'],
 picc:['ultrasound','micropuncture','wire','sheath','picc'],
 port:['ultrasound','micropuncture','wire','sheath','port','syringe'],
 abscess:['needle','wire','drain','syringe'],
 nephrostomy:['ultrasound','needle','wire','drain','syringe'],
 biliary:['ultrasound','needle','hydrophilic','wire','biliaryDrain','syringe'],
 biopsy:['needle','biopsy'],ablation:['needle','probe'],
 ufe:['micropuncture','wire','sheath','uterine','microcatheter','microwire','particles','syringe'],
 ivc:['ultrasound','micropuncture','wire','sheath','pigtail','filter','syringe'],
 tips:['ultrasound','micropuncture','wire','sheath','tipsNeedle','balloon','coveredStent','syringe'],
 gae:['micropuncture','wire','sheath','vertebral','microcatheter','microwire','particles','syringe'],
 y90:['micropuncture','wire','sheath','cobra','microcatheter','microwire','y90','syringe'],
 tace:['micropuncture','wire','sheath','cobra','microcatheter','microwire','chemo','syringe'],
 pae:['micropuncture','wire','sheath','simmons','microcatheter','microwire','particles','syringe'],
 thrombectomy:['ultrasound','micropuncture','wire','sheath','aspiration','syringe'],
 dialysis:['ultrasound','micropuncture','wire','sheath','vertebral','balloon','syringe'],
 thoracentesis:['ultrasound','needle','pleural'],paracentesis:['ultrasound','needle','wire','ascites'],
 cholecystostomy:['ultrasound','needle','wire','drain','syringe'],
 gastrostomy:['needle','wire','feeding','syringe'],
 cvc:['ultrasound','micropuncture','wire','sheath','central'],
 varicocele:['micropuncture','wire','sheath','cobra','microcatheter','coils','syringe']
};
const procedureExchanges={
 angioplasty:['micropuncture','wire','balloon','balloon','syringe'],angiography:['micropuncture','wire','pigtail','syringe','pigtail'],stent:['micropuncture','wire','balloon','stent','syringe'],
 embolization:['micropuncture','renal','microcatheter','coils','syringe'],picc:['ultrasound','micropuncture','wire','picc','picc'],port:['ultrasound','wire','sheath','port','port'],
 abscess:['needle','needle','wire','drain','drain'],nephrostomy:['ultrasound','needle','wire','drain','syringe'],biliary:['ultrasound','needle','hydrophilic','biliaryDrain','syringe'],
 biopsy:['needle','needle','biopsy','biopsy','biopsy'],ablation:['needle','needle','probe','probe','probe'],ufe:['micropuncture','uterine','microcatheter','particles','syringe'],
 ivc:['ultrasound','wire','pigtail','filter','syringe'],tips:['ultrasound','wire','tipsNeedle','coveredStent','syringe'],
 gae:['vertebral','microcatheter','syringe','particles','syringe'],y90:['cobra','syringe','microcatheter','y90','microcatheter'],tace:['cobra','syringe','microcatheter','chemo','syringe'],pae:['simmons','syringe','microcatheter','particles','syringe'],
 thrombectomy:['ultrasound','micropuncture','aspiration','aspiration','syringe'],dialysis:['ultrasound','syringe','balloon','balloon','syringe'],thoracentesis:['ultrasound','ultrasound','needle','pleural','ultrasound'],paracentesis:['ultrasound','needle','ascites','ascites','ultrasound'],
 cholecystostomy:['ultrasound','needle','wire','drain','syringe'],gastrostomy:['syringe','needle','wire','feeding','syringe'],cvc:['ultrasound','micropuncture','wire','central','central'],varicocele:['cobra','microcatheter','syringe','coils','syringe']
};
function suiteConfiguration(p){
 const direct=['abscess','nephrostomy','biliary','biopsy','ablation','thoracentesis','paracentesis','cholecystostomy','gastrostomy'].includes(p.id);
 const access=direct?['Percutaneous']:p.id==='tips'?['Jugular (venous)']:p.id==='picc'?['Brachial (venous)']:p.id==='port'?['Jugular (venous)']:p.id==='cvc'?['Jugular (venous)','Femoral (venous)']:p.id==='dialysis'?['Dialysis access']:['ivc','thrombectomy','varicocele'].includes(p.id)?['Femoral (venous)','Jugular (venous)']:['Femoral (arterial)','Brachial (arterial)'];
 return {access,kit:procedureKits[p.id],stageTools:procedureExchanges[p.id],treatment:procedureExchanges[p.id][3],modality:['abscess','biopsy','ablation'].includes(p.id)?'CT':['thoracentesis','paracentesis'].includes(p.id)?'Ultrasound':'C-arm',target:p.view,role:'Resident + attending supervision',note:'Illustrative device families and access alternatives. Patient anatomy, product compatibility and supervised clinical decisions determine the actual setup.'};
}

equipmentCatalog.oil={name:'Iodized oil contrast (Lipiodol family)',group:'Support',icon:'◕',description:'Radiopaque oil depiction for the TACE model. Shown as persistent contrast deposition, not individual embolic particles. No dose or preparation is modeled.'};procedureKits.tace.push('oil');procedureExchanges.gae[0]='wire';procedureExchanges.pae[0]='wire';
