import { Router } from 'express';
import { db } from '../db';
import { contacts } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// Public route - create contact
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await db.insert(contacts).values({
      name,
      email,
      message,
    }).returning();

    res.json({ success: true, contact: result[0] });
  } catch (error) {
    console.error('Failed to create contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Protected route - get all contacts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const allContacts = await db.select().from(contacts).orderBy(contacts.createdAt);
    res.json(allContacts);
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Protected route - delete contact
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await db.delete(contacts).where(eq(contacts.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router;
