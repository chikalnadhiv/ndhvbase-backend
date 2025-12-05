import { Router } from 'express';
import { db } from '../db';
import { projects } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Public route - get all projects
router.get('/', async (req, res) => {
  try {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    res.json(allProjects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Protected route - get metadata
router.get('/metadata', authMiddleware, async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Simple regex to find og:image
    const match = html.match(/<meta property="og:image" content="([^"]+)"/i) || 
                  html.match(/<meta name="twitter:image" content="([^"]+)"/i);
    
    const imageUrl = match ? match[1] : null;

    res.json({ imageUrl });
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Protected route - create project
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, imageUrl, link } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const result = await db.insert(projects).values({
      title,
      description,
      imageUrl,
      link,
    }).returning();

    res.json({ success: true, project: result[0] });
  } catch (error) {
    console.error('Failed to create project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Protected route - update project
router.put('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, imageUrl, link } = req.body;

  try {
    const result = await db.update(projects)
      .set({
        title,
        description,
        imageUrl,
        link,
      })
      .where(eq(projects.id, id))
      .returning();

    res.json({ success: true, project: result[0] });
  } catch (error) {
    console.error('Failed to update project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Protected route - delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await db.delete(projects).where(eq(projects.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
