import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload attachment
router.post('/findings/:findingId/attachments', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log('Upload attachment request received:', {
      file: req.file,
      params: req.params,
      user: req.user
    });

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { findingId } = req.params;
    const userId = req.user?.id;

    console.log('Saving attachment to database');
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO attachments (finding_id, filename, original_filename, mime_type, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [
        findingId,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        userId
      ]
    );

    console.log('Attachment saved successfully:', {
      id: result.insertId,
      filename: req.file.filename
    });

    return res.status(201).json({
      id: result.insertId,
      filename: req.file.filename,
      original_filename: req.file.originalname
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Download attachment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Download attachment request received:', {
      params: req.params,
      user: req.user
    });

    const { id } = req.params;
    console.log('Fetching attachment info:', id);
    const [attachments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM attachments WHERE id = ?',
      [id]
    );

    const attachment = attachments[0];
    if (!attachment) {
      console.log('Attachment not found:', id);
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', attachment.filename);
    console.log('Sending file:', filePath);
    return res.download(filePath, attachment.original_filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete attachment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete attachment request received:', {
      params: req.params,
      user: req.user
    });

    const { id } = req.params;
    console.log('Fetching attachment info:', id);
    const [attachments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM attachments WHERE id = ?',
      [id]
    );

    const attachment = attachments[0];
    if (!attachment) {
      console.log('Attachment not found:', id);
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', attachment.filename);
    if (fs.existsSync(filePath)) {
      console.log('Deleting file from filesystem:', filePath);
      fs.unlinkSync(filePath);
    }

    // Delete record from database
    console.log('Deleting attachment record from database');
    await pool.query('DELETE FROM attachments WHERE id = ?', [id]);

    console.log('Attachment deleted successfully:', id);
    return res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 