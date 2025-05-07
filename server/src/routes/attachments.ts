import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
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
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { findingId } = req.params;
    const userId = req.user?.id;

    const [result] = await pool.query(
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

    res.status(201).json({
      id: result.insertId,
      filename: req.file.filename,
      original_filename: req.file.originalname
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download attachment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [attachments] = await pool.query(
      'SELECT * FROM attachments WHERE id = ?',
      [id]
    );

    const attachment = attachments[0];
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', attachment.filename);
    res.download(filePath, attachment.original_filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete attachment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [attachments] = await pool.query(
      'SELECT * FROM attachments WHERE id = ?',
      [id]
    );

    const attachment = attachments[0];
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record from database
    await pool.query('DELETE FROM attachments WHERE id = ?', [id]);

    res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 