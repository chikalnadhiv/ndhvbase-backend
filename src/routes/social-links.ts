import { Router } from 'express';
import { db } from '../db';
import { socialLinks } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all social links
router.get('/', async (req, res) => {
  try {
    const links = await db.select().from(socialLinks);
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch social links' });
  }
});

// Update a social link
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, icon, url } = req.body;

  try {
    const updated = await db.update(socialLinks)
      .set({ name, icon, url, updatedAt: new Date() })
      .where(eq(socialLinks.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update social link' });
  }
});

// Add a new social link
router.post('/', authMiddleware, async (req, res) => {
  const { name, icon, url } = req.body;

  try {
    const [newLink] = await db.insert(socialLinks)
      .values({ name, icon, url })
      .returning();
    res.status(201).json(newLink);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create social link' });
  }
});

// Delete a social link
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(socialLinks)
      .where(eq(socialLinks.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete social link' });
  }
});

export default router;
