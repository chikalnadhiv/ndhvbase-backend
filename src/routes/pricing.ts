import { Router } from 'express';
import { db } from '../db';
import { pricing } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// Public route - get all pricing plans
router.get('/', async (req, res) => {
  try {
    const plans = await db.select().from(pricing).orderBy(pricing.displayOrder);
    res.json(plans);
  } catch (error) {
    console.error('Failed to fetch pricing:', error);
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// Protected route - create pricing plan
router.post('/', authMiddleware, async (req, res) => {
  const { name, price, description, features, popular, displayOrder } = req.body;

  if (!name || !price || !description || !features) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await db.insert(pricing).values({
      name,
      price,
      description,
      features,
      popular: popular || false,
      displayOrder: displayOrder || 0,
    }).returning();

    res.json({ success: true, pricing: result[0] });
  } catch (error) {
    console.error('Failed to create pricing:', error);
    res.status(500).json({ error: 'Failed to create pricing' });
  }
});

// Protected route - update pricing plan
router.put('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, description, features, popular, displayOrder } = req.body;

  try {
    const result = await db.update(pricing)
      .set({
        name,
        price,
        description,
        features,
        popular,
        displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(pricing.id, id))
      .returning();

    res.json({ success: true, pricing: result[0] });
  } catch (error) {
    console.error('Failed to update pricing:', error);
    res.status(500).json({ error: 'Failed to update pricing' });
  }
});

// Protected route - delete pricing plan
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await db.delete(pricing).where(eq(pricing.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete pricing:', error);
    res.status(500).json({ error: 'Failed to delete pricing' });
  }
});

export default router;
