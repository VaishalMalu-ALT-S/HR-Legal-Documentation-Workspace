const fs = require('fs');
let content = fs.readFileSync('src/components/SignatureCenter.tsx', 'utf8');

const handleDownloadRegex = /\/\* "?"? Export to PDF "?"? \*\/\s+const handleDownload = async \(\) => \{\s+if \(!canvasRef\.current\) return;\s+const pdf = new jsPDF\('p', 'mm', 'a4'\);\s+const c = await html2canvas\(canvasRef\.current, \{ scale: 2, useCORS: true \}\);\s+pdf\.addImage\(c\.toDataURL\('image\/png'\), 'PNG', 0, 0, 210, 297\);\s+pdf\.save\(`Signed_\$\{docName\.replace\(\/\\\\.\[\^\/\.\]\+\$\/, ""\)\}\.pdf`\);\s+onSignatureSuccess\?\.\(\{\}\);\s+\};/m;

const newHandlers = `/* "?"? Export to PDF "?"? */
    const handleDownload = async () => {
      if (!canvasRef.current) return;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const c = await html2canvas(canvasRef.current, { scale: 2, useCORS: true });
      pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      pdf.save(\`Signed_\${docName.replace(/\\.[^/.]+$/, "")}.pdf\`);
      onSignatureSuccess?.({});
    };

    const handlePreview = async () => {
      if (!canvasRef.current) return;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const c = await html2canvas(canvasRef.current, { scale: 2, useCORS: true });
      pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      window.open(pdf.output('bloburl'), '_blank');
    };`;

content = content.replace(handleDownloadRegex, newHandlers);

const topBarRegex = /(<button\s+onClick=\{handleDownload\}\s+className="bg-\[#0052cc\] hover:bg-\[#0065ff\] text-white text-\[12px\] font-semibold px-4 py-1\.5 rounded \nshadow-xs flex items-center gap-1\.5 transition-colors ml-1"\s+>\s+<Download size=\{14\} \/>\s+<span>Finish & Save<\/span>\s+<\/button>)/m;

const topBarNew = `<button
                onClick={handlePreview}
                className="bg-white hover:bg-slate-50 text-[#172b4d] border border-slate-200 text-[12px] font-semibold px-4 py-1.5 rounded shadow-xs flex items-center gap-1.5 transition-colors"
                title="Preview PDF"
              >
                <Maximize2 size={14} />
                <span>Preview</span>
              </button>
              $1`;

content = content.replace(topBarRegex, topBarNew);


const bottomBarRegex = /(<button\s+onClick=\{handleDownload\}\s+className="bg-\[#0052cc\] hover:bg-\[#0065ff\] active:bg-\[#0747a6\] text-white font-bold text-\[11\.5px\] \npx-3\.5 py-1\.5 rounded-lg flex items-center gap-1\.5 shadow-sm active:scale-95 transition-all"\s+title="Finish & Save Document"\s+>\s+<Download size=\{14\} \/>\s+<span>Finish & Save<\/span>\s+<\/button>)/m;

const bottomBarNew = `<button
                  onClick={handlePreview}
                  className="bg-white hover:bg-[#ebecf0] text-[#172b4d] font-bold text-[11.5px] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border border-[#dfe1e6]"
                  title="Preview Document PDF"
                >
                  <Maximize2 size={14} />
                  <span>Preview</span>
                </button>
                $1`;

content = content.replace(bottomBarRegex, bottomBarNew);

// Add Eye icon to imports if not there. Let's just use Maximize2 since it's already imported.

fs.writeFileSync('src/components/SignatureCenter.tsx', content);
console.log("Added preview options");
