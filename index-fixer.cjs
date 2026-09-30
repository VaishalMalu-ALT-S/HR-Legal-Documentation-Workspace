const { execSync } = require('child_process');
const fs = require('fs');
let done = false;
let iterations = 0;
while(!done && iterations < 30) {
  iterations++;
  try {
    execSync('npm run build', { stdio: 'pipe' });
    done = true;
    console.log('Build passed!');
  } catch(e) {
    const out = e.stdout.toString() + e.stderr.toString();
    const match = out.match(/src\/components\/([a-zA-Z0-9_]+\.tsx)\((\d+),(\d+)\): error TS1005: ',' expected./) || 
                  out.match(/src\/components\/([a-zA-Z0-9_]+\.tsx)\((\d+),(\d+)\): error TS1381:/) ||
                  out.match(/src\/components\/([a-zA-Z0-9_]+\.tsx)\((\d+),(\d+)\): error TS17002:/) ||
                  out.match(/src\/components\/([a-zA-Z0-9_]+\.tsx)\((\d+),(\d+)\): error TS1005: '\)' expected./) ||
                  out.match(/src\/components\/([a-zA-Z0-9_]+\.tsx)\((\d+),(\d+)\): error TS17008:/) ||
                  out.match(/src\/components\/([a-zA-Z0-9_]+\.tsx)\((\d+),(\d+)\): error TS1109:/) ||
                  out.match(/src\/components\/([a-zA-Z0-9_]+\.tsx)\((\d+),(\d+)\): error TS1005: '}' expected./);

    if (match) {
       const file = 'src/components/' + match[1];
       const lineNum = parseInt(match[2]) - 1;
       const col = parseInt(match[3]);
       
       let text = fs.readFileSync(file, 'utf-8');
       let lines = text.split('\n');
       
       // Try replacing empty space with ' ? ' around the broken ternary
       // Actually it's easier to just find the line and look for the '  ' before the ':' or similar
       let l = lines[lineNum];
       if (l.includes('  \'')) l = l.replace('  \'', ' ? \'');
       else if (l.includes('  (')) l = l.replace('  (', ' ? (');
       else if (l.includes('  \')) l = l.replace('  \', ' ? \');
       else if (l.includes('  ')) l = l.replace('  ', ' ? '); // fallback
       
       lines[lineNum] = l;
       fs.writeFileSync(file, lines.join('\n'));
       console.log('Fixed ' + file + ':' + (lineNum+1));
    } else {
       console.log('Unhandled error format', out);
       break;
    }
  }
}
