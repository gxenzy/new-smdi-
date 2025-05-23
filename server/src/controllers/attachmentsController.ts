import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

// Define custom interface for multer request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadAttachment = async (req: MulterRequest, res: Response) => {
  try {
    console.log('Upload request received:', {
      file: req.file,
      params: req.params,
      user: req.user
    });

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { findingId } = req.params;
    const userId = req.user?.id;

    // Check if finding exists
    console.log('Checking if finding exists:', findingId);
    const [findings] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM findings WHERE id = ?',
      [findingId]
    );

    if (findings.length === 0) {
      console.log('Finding not found:', findingId);
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Finding not found' });
    }

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const uniqueFilename = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const newPath = path.join(UPLOAD_DIR, uniqueFilename);

    console.log('Moving file:', {
      originalPath: req.file.path,
      newPath,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Move file to permanent location
    fs.renameSync(req.file.path, newPath);

    // Save file info to database
    console.log('Saving file info to database');
    const [result] = await pool.query(
      'INSERT INTO attachments (finding_id, filename, original_filename, mime_type, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [
        findingId,
        uniqueFilename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        userId
      ]
    );

    // Create notification
    console.log('Creating notification for upload');
    await pool.query(
      'INSERT INTO notifications (user_id, finding_id, type, message) VALUES (?, ?, ?, ?)',
      [
        userId,
        findingId,
        'UPDATED',
        `New attachment added: ${req.file.originalname}`
      ]
    );

    console.log('File upload successful:', {
      attachmentId: (result as any).insertId,
      filename: uniqueFilename,
      originalFilename: req.file.originalname
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      attachmentId: (result as any).insertId,
      filename: uniqueFilename,
      originalFilename: req.file.originalname
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
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        console.log('Cleaning up temporary file:', req.file.path);
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    return res.status(500).json({
      message: 'Error uploading file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const downloadAttachment = async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    console.log('Download request received for attachment:', attachmentId);

    // Get file info from database
    console.log('Fetching file info from database');
    const [attachments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM attachments WHERE id = ?',
      [attachmentId]
    );

    if (attachments.length === 0) {
      console.log('Attachment not found:', attachmentId);
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const attachment = attachments[0];
    const filePath = path.join(UPLOAD_DIR, attachment.filename);

    if (!fs.existsSync(filePath)) {
      console.log('File not found on server:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }

    console.log('Sending file to client:', {
      filename: attachment.original_filename,
      mimeType: attachment.mime_type,
      size: attachment.size
    });

    // Set headers for file download
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${attachment.original_filename}"`
    );

    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  } catch (error) {
    console.error('Error downloading file:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({
      message: 'Error downloading file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user?.id;
    console.log('Delete request received for attachment:', attachmentId);

    // Get file info from database
    console.log('Fetching file info from database');
    const [attachments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM attachments WHERE id = ?',
      [attachmentId]
    );

    if (attachments.length === 0) {
      console.log('Attachment not found:', attachmentId);
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const attachment = attachments[0];

    // Delete file from filesystem
    const filePath = path.join(UPLOAD_DIR, attachment.filename);
    if (fs.existsSync(filePath)) {
      console.log('Deleting file from filesystem:', filePath);
      fs.unlinkSync(filePath);
    }

    // Delete from database
    console.log('Deleting attachment record from database');
    await pool.query('DELETE FROM attachments WHERE id = ?', [attachmentId]);

    // Create notification
    console.log('Creating notification for deletion');
    await pool.query(
      'INSERT INTO notifications (user_id, finding_id, type, message) VALUES (?, ?, ?, ?)',
      [
        userId,
        attachment.finding_id,
        'UPDATED',
        `Attachment deleted: ${attachment.original_filename}`
      ]
    );

    console.log('Attachment deleted successfully:', attachmentId);
    return res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({
      message: 'Error deleting file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 