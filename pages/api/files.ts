// pages/api/files.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initDb, ALLOWED_TYPES } from '../../lib/db';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'uploaded_files');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// In pages/api/files.ts, add this before the handler:
console.log('Database path:', path.join(process.cwd(), 'database.sqlite'));
console.log('Upload directory:', uploadDir);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await initDb();

  if (req.method === 'POST') {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
      multiples: false, // Add this line to prevent array of files
    });

    try {
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error('Form parse error:', err);
            reject(err);
          }
          console.log('Parsed fields:', fields);
          console.log('Parsed files:', files);
          resolve([fields, files]);
        });
      });

      // Handle the file upload
      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!uploadedFile) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check if file type is allowed
      if (!ALLOWED_TYPES.includes(uploadedFile.mimetype || '')) {
        console.error('File type not allowed:', uploadedFile.mimetype);
        fs.unlinkSync(uploadedFile.filepath);
        return res.status(400).json({ error: 'File type not allowed' });
      }

      // Get the title and description from fields
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;

      // Insert into database
      const result = await db.run(
        `INSERT INTO files (title, description, filename, originalName, mimeType, size) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          path.basename(uploadedFile.filepath),
          uploadedFile.originalFilename,
          uploadedFile.mimetype,
          uploadedFile.size,
        ]
      );

      console.log('Database insert result:', result);
      res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Error uploading file' });
    }
  }
  else if (req.method === 'GET') {
    try {
      const files = await db.all('SELECT * FROM files ORDER BY createdAt DESC');
      console.log('Files from database:', files);
      res.status(200).json(files);
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Error fetching files' });
    }
  }
  else if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      const file = await db.get('SELECT filename FROM files WHERE id = ?', id);
      if (file) {
        const filepath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        await db.run('DELETE FROM files WHERE id = ?', id);
        res.status(200).json({ message: 'File deleted successfully' });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Error deleting file' });
    }
  }
}