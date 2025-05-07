import express from 'express';
import { 
  getComments, 
  createComment, 
  updateComment, 
  deleteComment 
} from '../controllers/commentsController';
import { authenticateToken } from '../middleware/auth';

const commentsRouter = express.Router();

// Apply authentication middleware to all routes
commentsRouter.use(authenticateToken);

// Get comments for a finding
commentsRouter.get('/:findingId', getComments);

// Create comment
commentsRouter.post('/:findingId', createComment);

// Update comment
commentsRouter.put('/:commentId', updateComment);

// Delete comment
commentsRouter.delete('/:commentId', deleteComment);

export default commentsRouter; 