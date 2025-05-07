import express from 'express';
import multer from 'multer';
import { 
  uploadAttachment, 
  downloadAttachment, 
  deleteAttachment 
} from '../controllers/attachmentsController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';
import * as path from 'path';

const attachmentsRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Apply authentication middleware to all routes
attachmentsRouter.use(authenticateToken);

// Upload attachment (admin only)
attachmentsRouter.post(
  '/:findingId',
  authorizeRole([UserRole.ADMIN]),
  upload.single('file'),
  uploadAttachment
);

// Download attachment
attachmentsRouter.get('/:attachmentId', downloadAttachment);

// Delete attachment (admin only)
attachmentsRouter.delete(
  '/:attachmentId',
  authorizeRole([UserRole.ADMIN]),
  deleteAttachment
);

export default attachmentsRouter; 