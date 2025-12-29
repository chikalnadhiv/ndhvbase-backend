import { db } from './src/db';
import { socialLinks } from './src/db/schema';

async function check() {
  try {
    const links = await db.select().from(socialLinks);
    console.log('Links in DB:', links.length);
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

check();
