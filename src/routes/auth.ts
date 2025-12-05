import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { admins } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // Find user in database
    const [admin] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: admin.id, username: admin.username }, process.env.JWT_SECRET!, {
      expiresIn: '24h',
    });

    res.json({ token, username: admin.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update credentials endpoint
router.put('/credentials', authMiddleware, async (req, res) => {
  const { username, password, newPassword } = req.body;
  // @ts-ignore
  const userId = req.user.userId;

  if (!username && !newPassword) {
    return res.status(400).json({ error: 'Username or new password required' });
  }

  try {
    const [admin] = await db.select().from(admins).where(eq(admins.id, userId)).limit(1);

    if (!admin) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: any = {};

    if (username) {
      updates.username = username;
    }

    if (newPassword) {
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    await db.update(admins).set(updates).where(eq(admins.id, userId));

    res.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ error: 'Failed to update credentials' });
  }
});

export default router;
