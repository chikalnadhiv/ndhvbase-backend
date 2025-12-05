import { db } from './src/db';
import { projects } from './src/db/schema';

async function checkProjects() {
  const allProjects = await db.select().from(projects);
  console.log('Projects in database:');
  console.log(JSON.stringify(allProjects, null, 2));
}

checkProjects();
