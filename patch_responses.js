const fs = require('fs');
const glob = require('glob');

const files = [
  'netlify/functions/orders.mts',
  'netlify/functions/assistenza.mts',
  'netlify/functions/newsletter.mts',
  'netlify/functions/send-newsletter.mts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Make sure we define emailSent and emailError outside try-catch
  content = content.replace(/try {\s*const transporter = nodemailer\.createTransport/g, `let emailSent = false;\n    let emailError: string | null = null;\n    try {\n      const transporter = nodemailer.createTransport`);
  
  // Mark email as sent
  content = content.replace(/await transporter\.sendMail\(([^)]*)\);/g, `await transporter.sendMail($1);\n        emailSent = true;`);
  
  // Handle empty SMTP_PASS error
  content = content.replace(/console\.log\("SMTP_PASS not set[^"]*"\);/g, `emailError = "SMTP_PASS non configurato nelle variabili d'ambiente di Netlify.";\n        $&`);
  
  // Handle catch error
  content = content.replace(/} catch\s*\(([^)]+)\)\s*{/g, `} catch ($1: any) {\n      emailError = $1.message || String($1);`);
  
  // Return email status
  content = content.replace(/return Response\.json\({ success: true([^}]*)}\);/g, `return Response.json({ success: true$1, emailSent, emailError });`);
  
  fs.writeFileSync(file, content);
}
