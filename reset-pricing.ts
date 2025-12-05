import { db } from './src/db';
import { pricing } from './src/db/schema';

const resetPricing = async () => {
  try {
    await db.delete(pricing);
    console.log('✅ Pricing table cleared!');
  } catch (error) {
    console.error('❌ Failed to clear pricing table:', error);
  }
  process.exit(0);
};

resetPricing();
