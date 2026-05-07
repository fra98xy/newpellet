const fs = require('fs');
const { execSync } = require('child_process');

try {
  fs.rmSync('netlify/database/migrations/20260507074748_add_orders_customer_phone', { recursive: true, force: true });
  console.log('Deleted old migration');
} catch (e) {
  console.log('No old migration to delete or error:', e.message);
}

// Generate new migration. We need to pass the environment variable or auto-accept prompts.
// Wait, Drizzle doesn't have a --yes flag, but we can just use `yes` or pipe it.
// Actually, `npx drizzle-kit generate` might just work if we provide default values.
// Let's modify db/schema.ts temporarily if needed? No, let's try to just generate it.
try {
  execSync('npx drizzle-kit generate', { stdio: 'inherit' });
} catch (e) {
  console.log('Error generating migration:', e.message);
}
