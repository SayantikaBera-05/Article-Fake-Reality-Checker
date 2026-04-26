const fs = require('fs');
const config = fs.readFileSync('tailwind.config.js', 'utf8');
const colorMatch = config.match(/colors:\s*\{([\s\S]*?)\},\s*borderRadius/);
if (colorMatch) {
  let colorsStr = '{' + colorMatch[1] + '}';
  colorsStr = colorsStr.replace(/'/g, '"').replace(/([a-zA-Z0-9-]+):/g, '"$1":').replace(/,\s*\}/g, '}');
  try {
    const colors = JSON.parse(colorsStr);
    const cssVars = [];
    const tailwindConfig = [];
    for (const [name, value] of Object.entries(colors)) {
      cssVars.push(`  --color-${name}: ${value};`);
      tailwindConfig.push(`        "${name}": "var(--color-${name})",`);
    }
    console.log("CSS VARS:\n" + cssVars.join('\n'));
    console.log("\nTAILWIND CONFIG:\n" + tailwindConfig.join('\n'));
  } catch (e) {
    console.error(e, colorsStr);
  }
}
