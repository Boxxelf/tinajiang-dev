import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
const root=resolve('dist');let pages=0,refs=0;const errors=[];
function walk(dir){for(const name of readdirSync(dir)){const p=join(dir,name);if(statSync(p).isDirectory())walk(p);else if(name.endsWith('.html')){pages++;const html=readFileSync(p,'utf8');if(html.includes('tinajiang.xyz'))errors.push(`${p}: retired domain reference`);if(/(?:math-[345]|about-2)\.webp/.test(html))errors.push(`${p}: retired image reference`);for(const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){const url=match[1];if(!url.startsWith('/'))continue;refs++;let file=resolve(root,'.'+url.split('#')[0]);if(existsSync(file)&&statSync(file).isDirectory())file=join(file,'index.html');if(!existsSync(file))errors.push(`${p}: ${url}`);if(url.includes('#')&&existsSync(file)&&file.endsWith('.html')){const id=url.split('#')[1];if(id&&!readFileSync(file,'utf8').includes(`id="${id}"`))errors.push(`${p}: missing anchor ${url}`);}}}}}
walk(root);const home=readFileSync(join(root,'index.html'),'utf8');if((home.match(/class="space-card"/g)||[]).length!==18)errors.push('Home must contain 18 project images');if(!readFileSync(join(root,'about/index.html'),'utf8').includes('Ahmanson Lab'))errors.push('Missing Ahmanson Lab');const migration=JSON.parse(readFileSync('lib/migration-map.json','utf8'));
const gallery=JSON.parse(readFileSync(join(root,'gallery.json'),'utf8'));
const work=readFileSync(join(root,'work/index.html'),'utf8');
const practice=readFileSync(join(root,'creative-practice/index.html'),'utf8');
for(const {destination} of migration){
 if(!existsSync(join(root,destination,'index.html')))errors.push(`Missing migrated detail: ${destination}`);
 if(!gallery.some(x=>x.href===destination))errors.push(`Missing Creative Space entry: ${destination}`);
 const index=destination.startsWith('/creative-practice/')?practice:work;
 if(!index.includes(`href="${destination}"`))errors.push(`Missing project index entry: ${destination}`);
}
if(/href="\/creative-practice\/[^"]+/.test(work))errors.push('Artwork detail links must stay out of Work');
if(new Set(gallery.map(x=>x.href)).size!==18)errors.push('Expected 18 distinct project destinations');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log(`${pages} HTML files, ${refs} local links/assets: all valid.`);
