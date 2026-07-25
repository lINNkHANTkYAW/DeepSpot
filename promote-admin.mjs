import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = process.argv[2] || path.join(process.cwd(), '.data', 'deepspot-store.json');

if (!fs.existsSync(STORE_PATH)) {
  console.error('Store file not found at', STORE_PATH);
  process.exit(1);
}

const store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));

const targetUsername = process.argv[3];
if (!targetUsername) {
  console.error('Usage: node promote-admin.mjs <store-path> <username>');
  console.error('Example: node promote-admin.mjs .data/deepspot-store.json linn_kyaw');
  process.exit(1);
}

const users = store.users || {};
const target = Object.values(users).find((u: any) => u.username === targetUsername);

if (!target) {
  console.error(`User "${targetUsername}" not found in store.`);
  console.error('Available users:', Object.values(users).map((u: any) => u.username).join(', '));
  process.exit(1);
}

target.role = 'ADMIN';
target.isModerator = true;

fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
console.log(`Promoted "${targetUsername}" (${target.id}) to ADMIN + MODERATOR.`);
