const fs = require('fs');
const { execSync } = require('child_process');

try {
  fs.rmSync('netlify/database/migrations/20260507075121_majestic_franklin_storm', { recursive: true, force: true });
  console.log('Deleted old migration');
} catch (e) {
  console.log('No old migration to delete or error:', e.message);
}

try {
  execSync('npx drizzle-kit generate', { stdio: 'inherit' });
} catch (e) {
  console.log('Error generating migration:', e.message);
}
