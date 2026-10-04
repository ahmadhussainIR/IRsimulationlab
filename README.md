# IR Lab — GitHub edition

Latest IR suite website, packaged with index.html at the repository root.
Plain HTML, CSS and JavaScript. No npm installation or build step required.

## Upload

1. Extract IR-Lab-GitHub.zip.
2. Open https://github.com/ahmadhussainIR/IR-suite-simulation-lab
3. Click “uploading an existing file” if the repository is empty, or Add file → Upload files.
4. Drag all extracted files and folders into the upload area. Upload the contents, not the ZIP or its enclosing folder. Keep assets/ and vendor/ intact. index.html must appear at the top level.
5. Commit changes to main.

## Optional: publish on GitHub Pages

Repository Settings → Pages → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save.
The usual website address will be https://ahmadhussainIR.github.io/IR-suite-simulation-lab/ after deployment succeeds.
GitHub Pages publishes a website to the internet; uploading the source alone does not enable Pages.
Pages availability for private repositories depends on your GitHub plan.

.nojekyll disables Jekyll processing when included. If Finder hides that file during upload, the visible _config.yml also includes the vendor directory required by the site.

## Scope

Generated synthetic images and photographic character sprites, curated vessel graphs, simplified device mechanics and synthetic vital signs. This is an educational prototype, not a clinically validated simulator. GAE and PAE support manual navigation; other procedures retain guided animations. No patient data is included. Image prompts are documented in IMAGE-PROMPTS.txt. Third-party Three.js licensing is included under vendor/.
