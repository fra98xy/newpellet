const fs = require('fs');

const files = [
  'netlify/functions/orders.mts',
  'netlify/functions/assistenza.mts',
  'netlify/functions/newsletter.mts',
  'netlify/functions/send-newsletter.mts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\} catch \(error: any\) {\n\s*emailError = error\.message \|\| String\(error\);\n\s*console\.error\(error\);/g, `} catch (error: any) {\n    console.error(error);`);
  fs.writeFileSync(file, content);
}
