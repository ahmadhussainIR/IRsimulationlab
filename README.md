# IR Lab — GitHub edition

Latest IR suite website, packaged with index.html at the repository root.
Plain HTML, CSS and JavaScript. No npm installation or build step required.

## Upload

1. Extract IR-Lab-GitHub.zip.
2. Open https://github.com/ahmadhussainIR/IRsimulationlab
3. Click “uploading an existing file” if the repository is empty, or Add file → Upload files.
4. Drag all extracted files and folders into the upload area. Upload the contents, not the ZIP or its enclosing folder. Keep assets/ and vendor/ intact. index.html must appear at the top level.
5. Commit changes to main.

## Optional: publish on GitHub Pages

Repository Settings → Pages → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save.
The usual website address will be https://ahmadhussainIR.github.io/IRsimulationlab/ after deployment succeeds.
GitHub Pages publishes a website to the internet; uploading the source alone does not enable Pages.
Pages availability for private repositories depends on your GitHub plan.

.nojekyll disables Jekyll processing when included. If Finder hides that file during upload, the visible _config.yml also includes the vendor directory required by the site.

## Scope

Generated synthetic images and photographic character sprites, curated vessel graphs, simplified device mechanics and synthetic vital signs. This is an educational prototype, not a clinically validated simulator. GAE and PAE support manual navigation; other procedures retain guided animations. No patient data is included. Image prompts are documented in IMAGE-PROMPTS.txt. Third-party Three.js licensing is included under vendor/.

## Equipment redesign

The procedure tray uses 39 distinct generated equipment illustrations with a synchronized selected-device inspector. Category filters apply to the catalog while the in-room trolley retains the full procedure kit. Every kit item is available in the navigation equipment selector.

Use **Explore device in 3D** to rotate and zoom the selected model, play or pause its illustrative mechanical motion, or scrub to a particular position. Examples include syringe plunger travel, guidewire torque, catheter-tip articulation, balloon expansion and stent expansion. The viewer uses WebGL where available and software Canvas projection of the same models when it is unavailable. These visual demonstrations are separate from patient treatment and do not simulate calibrated device physics.

Motion respects the operating system’s reduced-motion preference and the lab’s Reduce ambient motion setting on opening the viewer. All generated equipment sheets are under `assets/equipment/`; exact prompts are in `IMAGE-PROMPTS.txt`.

The hand view uses the selected device’s own geometric model with neutral gloved hands. Device selection changes the rendered instrument; navigation, torque and injection animate that model.

Validation: `node --test tests/*.test.cjs`.

## Selective imaging and positioning

GAE/PAE wire and microcatheter tips have independent positions. Advance the wire into a modeled branch, then select the microcatheter and advance along that route; the catheter cannot pass the wire. Retract both as needed to explore a different branch. Contrast originates from the catheter tip (or access origin when no catheter is tracked) and fills only connected downstream territory.

The reference monitor captures a paired synthetic DSA/unsubtracted sequence during a DSA run. Replay or scrub the saved sequence independently from live imaging. Table and C-arm controls move separate photographic room layers and adjust the illustrative imaging field. The room uses 2D compositing; angulation is not a patient-specific 3D reconstruction.

Navigation regression checks: `node --test tests/navigation.test.cjs`.

## Phone workstation

At phone widths, use Room / Live / DSA / Vitals / Hands tabs. The selected monitor stays visible while navigating. Image zoom buttons and drag-to-pan inspect the same live or saved acquisition; this is display magnification, not a different acquisition. Touch controls, selectors, device dialogs and the procedure chooser fit portrait and landscape screens. Monitor copying is limited to 12.5 fps on phones and suspended on desktop or when the page is hidden.

## Expanded anatomy and angiographic timing

The GAE graph includes distal articular/cutaneous branches, DGA osteoarticular/saphenous/muscular branches and circumflex femoral exploration. Pelvic exploration adds bladder-wall, perineal, penile and lateral sacral branches. A selectable dual-origin PAE teaching example separates central-gland and peripheral-gland supply. The companion atlas highlights the currently viewed vessel and downstream territory without moving the wire.

Contrast propagates from the acquired catheter tip with delayed tissue blush and washout; vessel widths vary by branch family. These are visual timings and illustrated paths, not calibrated hemodynamics or a patient-specific anatomical reconstruction. Collateral circulation is discussed but not exhaustively simulated. Synthetic treatment targets are now distal articular branches; skin and muscle branches have no target blush.

Anatomical references: [Cadaveric and angiographic genicular study](https://pubmed.ncbi.nlm.nih.gov/34657976/), [Radiological anatomy of prostatic arteries](https://pubmed.ncbi.nlm.nih.gov/23244724/). Their findings inform branch families; numeric geometry and control angles are authored for this simulator.


### Procedure-team animation (October 10)
The clinical room now uses a photographic four-frame action sheet for the resident and scrub nurse. Hands align with the selected illustrative access point and follow table translation. Wire/catheter movement, torque, tool exchange and contrast trigger distinct room actions, with a replayable access scene and walking transitions to/from the control room. Navigation controls are unavailable while the team is away or walking. These are composited 2D animations; they do not simulate needle puncture mechanics or verify successful vascular access.

Run `node --test tests/*.test.cjs` for navigation, equipment and team-action checks.
