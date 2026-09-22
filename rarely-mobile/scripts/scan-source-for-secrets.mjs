import fs from "node:fs";
import path from "node:path";
const roots=["app","components","lib","server","constants","shared"];
const patterns=[
  /(?:api[_-]?key|secret|token)\\s*[:=]\\s*["'][A-Za-z0-9_./:+-]{16,}["']/gi,
  /sk_(?:live|test)_[A-Za-z0-9]{12,}/g,
  /appl_[A-Za-z0-9]{12,}/g,
];
const findings=[];
function walk(dir){ if(!fs.existsSync(dir))return; for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name); if(e.isDirectory())walk(f); else if(/\\.(ts|tsx|js|mjs)$/.test(e.name)){const t=fs.readFileSync(f,"utf8"); for(const r of patterns){ if(r.test(t)) findings.push(f); r.lastIndex=0; }}}}
roots.forEach(walk);
const unique=[...new Set(findings)];
if(unique.length){ console.error("Potential secrets:"); unique.forEach((x)=>console.error(x)); process.exit(1); }
console.log("Source secret scan passed.");
