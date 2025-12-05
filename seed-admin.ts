import { db } from './src/db';
import { admins } from './src/db/schema';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  console.log('Seeding admin user...');

  const username = 'admin';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.insert(admins).values({
      username,
      password: hashedPassword,
    }).onConflictDoUpdate({
      target: admins.username,
      set: { password: hashedPassword },
    });

    console.log(`Admin user seeded successfully.`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

seedAdmin();
