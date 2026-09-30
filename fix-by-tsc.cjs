
const { execSync } = require('child_process');
const fs = require('fs');

let iterations = 0;
let done = false;

while (!done && iterations < 50) {
  iterations++;
  try {
    execSync('npm run build', { stdio: 'pipe' });
    done = true;
    console.log('Build passed!');
  } catch (e) {
    const out = (e.stdout || '').toString() + (e.stderr || '').toString();
    const lines = out.split('\n');
    let fixedAny = false;
    
    // Track modifications per file to avoid offsetting columns in a single pass
    // Actually, just fix the FIRST error found and re-run.
    for (let l of lines) {
      const match = l.match(/([a-zA-Z0-9_\/\.\-]+)\((\d+),(\d+)\): error TS/);
      if (match) {
        const file = match[1];
        const lineNum = parseInt(match[2]) - 1;
        const col = parseInt(match[3]) - 1;
        
        if (fs.existsSync(file)) {
          let content = fs.readFileSync(file, 'utf-8');
          let fLines = content.split('\n');
          
          let brokenLine = fLines[lineNum];
          // We know a ? is missing near 'col'. Let's look backwards from 'col' for '  ' and replace with ' ? '
          let prefix = brokenLine.substring(0, col);
          let suffix = brokenLine.substring(col);
          
          if (prefix.endsWith('  ')) {
            fLines[lineNum] = prefix.substring(0, prefix.length - 2) + ' ? ' + suffix;
          } else if (prefix.endsWith(' ')) {
             fLines[lineNum] = prefix.substring(0, prefix.length - 1) + ' ? ' + suffix;
          } else {
             fLines[lineNum] = prefix + ' ? ' + suffix;
          }
          
          fs.writeFileSync(file, fLines.join('\n'));
          console.log('Fixed ' + file + ':' + (lineNum+1));
          fixedAny = true;
          break; // break the loop and re-run tsc to get updated line/cols
        }
      }
    }
    
    if (!fixedAny) {
      console.log('Could not fix any errors in this pass.');
      console.log(out);
      break;
    }
  }
}

