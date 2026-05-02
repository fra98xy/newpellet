const fs = require('fs');
const glob = require('glob');

const files = glob.sync('netlify/functions/*.{ts,mts}');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Update port logic and secure logic
  content = content.replace(
    /port:\s*Number\(process\.env\["SMTP_PORT"\]\s*\|\|\s*465\),/,
    `port: Number(process.env["SMTP_PORT"] || 587),`
  );
  
  content = content.replace(
    /secure:\s*true,/,
    `secure: Number(process.env["SMTP_PORT"] || 587) === 465,`
  );

  fs.writeFileSync(file, content);
}
