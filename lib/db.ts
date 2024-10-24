// lib/db.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Allowed file types
export const ALLOWED_TYPES = [
  'video/mp4',
  'video/quicktime', // MOV
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
];

const dbPath = path.join(process.cwd(), 'database.sqlite');
console.log('Database path:', dbPath);

// Initialize database
export async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// Initialize the database schema
export async function initDb() {
  const db = await openDb();

  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        filename TEXT NOT NULL,
        originalName TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        size INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}