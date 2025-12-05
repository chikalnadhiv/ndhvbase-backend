import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Database file in the root directory
const dbPath = path.join(__dirname, '..', '..', '..', 'sqlite.db');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
