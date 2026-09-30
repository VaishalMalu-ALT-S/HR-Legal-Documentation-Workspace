const fs = require('fs');
let content = fs.readFileSync('src/components/SignatureCenter.tsx', 'utf8');

const targetStr = `          ) : (
            <>
              <div className="h-5 w-px bg-[#dfe1e6]" />
              <div className="px-3 py-1 flex items-center gap-2 text-rose-600">
                <Lock size={14} />
                <span className="text-xs font-bold">Signatures Locked: Awaiting Approval</span>
              </div>
            </>
          )}`;

content = content.replace(targetStr, "");
fs.writeFileSync('src/components/SignatureCenter.tsx', content);
console.log("Fixed again");
