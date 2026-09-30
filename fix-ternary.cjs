const fs = require('fs');
const path = require('path');
const dir = 'd:/Vaishal Workspace/SignHR/src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // fix ternary: === 'foo'  'bar' -> === 'foo' ? 'bar'
  content = content.replace(/=== ([a-zA-Z0-9_'\"]+)  /g, '===  ? ');
  // fix ternary: !== 'foo'  'bar' -> !== 'foo' ? 'bar'
  content = content.replace(/!== ([a-zA-Z0-9_'\"]+)  /g, '!==  ? ');
  // fix optional chaining: foo .bar -> foo?.bar
  // actually in diff it was e.clientX - r.left - ox, r.width - (sig .w || 0) -> sig?.w
  content = content.replace(/([a-zA-Z0-9_]+) \.([a-zA-Z0-9_]+)/g, '.');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed ternary: ' + path.basename(filePath));
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
