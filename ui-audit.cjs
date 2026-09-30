const fs = require('fs');
const path = require('path');
const dir = 'd:/Vaishal Workspace/SignHR/src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // 1. Convert any remaining bloated padding (p-8 -> p-6)
  content = content.replace(/\bp-8\b/g, 'p-6');
  
  // 2. Remove emojis entirely
  content = content.replace(/[????????????????]/g, '');

  // 3. Fix generic AI badge colors. Convert bg-blue-100 text-blue-800 to subtle border-based badges
  content = content.replace(/bg-blue-50 text-blue-700/g, 'bg-slate-50 text-slate-700 border border-slate-200');
  content = content.replace(/bg-purple-50 text-purple-700/g, 'bg-slate-50 text-slate-700 border border-slate-200');
  content = content.replace(/bg-emerald-50 text-emerald-700/g, 'bg-slate-50 text-slate-700 border border-slate-200');
  content = content.replace(/bg-indigo-50 text-indigo-700/g, 'bg-slate-50 text-slate-700 border border-slate-200');
  content = content.replace(/bg-rose-50 text-rose-700/g, 'bg-slate-50 text-slate-700 border border-slate-200');
  
  // 4. Primary buttons to black/slate-900 (enterprise look)
  // Find standard button classes and make them slate-900
  content = content.replace(/bg-indigo-600 hover:bg-indigo-700/g, 'bg-slate-900 hover:bg-slate-800');
  content = content.replace(/bg-blue-600 hover:bg-blue-700/g, 'bg-slate-900 hover:bg-slate-800');
  content = content.replace(/text-indigo-600/g, 'text-slate-900');
  content = content.replace(/text-blue-600/g, 'text-slate-900');

  // 5. Light subtle neutral surfaces instead of bright colored surfaces
  content = content.replace(/bg-indigo-50\/50/g, 'bg-slate-50');
  content = content.replace(/bg-blue-50\/50/g, 'bg-slate-50');
  content = content.replace(/bg-slate-50\/50/g, 'bg-slate-50');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed patterns: ' + path.basename(filePath));
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      processFile(full);
    }
  }
}

walk(dir);
console.log('Audit Step 2 Done.');
