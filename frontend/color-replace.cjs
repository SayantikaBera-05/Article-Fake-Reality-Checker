const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds: dark colors to white/grey
  { regex: /bg-\[#0B1121\]/g, replacement: 'bg-white' },
  { regex: /bg-\[#12192B\]/g, replacement: 'bg-gray-50' },
  { regex: /bg-\[#0A0F1C\]/g, replacement: 'bg-gray-100' },
  { regex: /bg-\[#0F1423\]/g, replacement: 'bg-white' },
  { regex: /bg-slate-900/g, replacement: 'bg-white' },
  { regex: /bg-slate-800/g, replacement: 'bg-gray-100' },
  
  // Text: white/light grey to dark grey
  { regex: /text-white/g, replacement: 'text-gray-900' },
  { regex: /text-slate-200/g, replacement: 'text-gray-800' },
  { regex: /text-slate-300/g, replacement: 'text-gray-700' },
  { regex: /text-slate-400/g, replacement: 'text-gray-600' },
  { regex: /text-slate-500/g, replacement: 'text-gray-500' },
  
  // Accents: blue/cyan/purple to orange (saffron)
  { regex: /blue-400/g, replacement: 'orange-400' },
  { regex: /blue-500/g, replacement: 'orange-500' },
  { regex: /blue-600/g, replacement: 'orange-600' },
  { regex: /blue-900/g, replacement: 'orange-900' },
  { regex: /cyan-400/g, replacement: 'orange-400' },
  { regex: /cyan-500/g, replacement: 'orange-500' },
  { regex: /cyan-600/g, replacement: 'orange-600' },
  { regex: /purple-500/g, replacement: 'amber-500' },
  { regex: /purple-600/g, replacement: 'amber-600' },
  
  // Borders
  { regex: /border-slate-800/g, replacement: 'border-gray-200' },
  { regex: /border-slate-700/g, replacement: 'border-gray-300' },
  
  // Clean up explicit dark mode overrides
  { regex: /dark:bg-\[.*?\]/g, replacement: '' },
  { regex: /dark:border-slate-\d+/g, replacement: '' },
  { regex: /dark:text-white/g, replacement: '' },
  
  // specific class cleanups
  { regex: /bg-slate-900\/90/g, replacement: 'bg-white/90' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const r of replacements) {
        content = content.replace(r.regex, r.replacement);
      }
      
      // Clean up double spaces created by empty replacements
      content = content.replace(/\s+/g, ' ');
      // Fix cases where text-white was inside an orange button by replacing text-gray-900 inside bg-orange with text-white if needed.
      // Actually, for simplicity we might just leave text-gray-900 or fix it manually if buttons look bad. Let's fix button text color.
      content = content.replace(/bg-orange-500 hover:bg-orange-600 text-gray-900/g, 'bg-orange-500 hover:bg-orange-600 text-white');
      content = content.replace(/bg-orange-600 text-gray-900/g, 'bg-orange-600 text-white');
      
      // We messed up spaces in TSX with \s+ replace? YES. \s+ replace across the whole file destroys indentation and newlines!
      // Do NOT do the global \s+ replace!
      
      // Re-run safely
      content = originalContent;
      for (const r of replacements) {
        content = content.replace(r.regex, r.replacement);
      }
      content = content.replace(/bg-orange-500 hover:bg-orange-600 text-gray-900/g, 'bg-orange-500 hover:bg-orange-600 text-white');
      content = content.replace(/bg-orange-600 text-gray-900/g, 'bg-orange-600 text-white');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Color replacement complete.');
