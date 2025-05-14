import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Divider, 
  Paper, 
  TextField, 
  Typography, 
  Alert,
  Collapse
} from '@mui/material';
import { Comment } from './Comment';
import { ReportComment } from '../../../types/reports';
import commentService from '../../../services/commentService';

interface CommentListProps {
  reportId: number;
  contentIndex?: number;
  canEdit: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({ 
  reportId, 
  contentIndex,
  canEdit 
}) => {
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const commentsData = await commentService.getComments(reportId);
        
        // Filter by content index if provided
        const filteredComments = contentIndex !== undefined
          ? commentsData.filter(comment => comment.content_index === contentIndex)
          : commentsData;
          
        // Organize comments into threads (parent comments and their replies)
        const organizedComments = organizeComments(filteredComments);
        setComments(organizedComments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [reportId, contentIndex]);
  
  // Organize comments into threads
  const organizeComments = (flatComments: ReportComment[]): ReportComment[] => {
    // First, separate parent comments and replies
    const parentComments: ReportComment[] = [];
    const replies: { [key: number]: ReportComment[] } = {};
    
    flatComments.forEach(comment => {
      if (comment.parent_id) {
        // This is a reply
        if (!replies[comment.parent_id]) {
          replies[comment.parent_id] = [];
        }
        replies[comment.parent_id].push(comment);
      } else {
        // This is a parent comment
        parentComments.push({...comment, replies: []});
      }
    });
    
    // Then, attach replies to their parent comments
    parentComments.forEach(parent => {
      if (replies[parent.id]) {
        parent.replies = replies[parent.id];
      }
    });
    
    // Sort parent comments by created_at (newest first)
    return parentComments.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };
  
  // Add new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await commentService.addComment(reportId, {
        content: newComment,
        content_index: contentIndex
      });
      
      setNewComment('');
      setSuccess('Comment added successfully');
      
      // Refresh comments
      const commentsData = await commentService.getComments(reportId);
      const filteredComments = contentIndex !== undefined
        ? commentsData.filter(comment => comment.content_index === contentIndex)
        : commentsData;
      const organizedComments = organizeComments(filteredComments);
      setComments(organizedComments);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Refresh comments after update
  const handleCommentUpdate = async () => {
    try {
      const commentsData = await commentService.getComments(reportId);
      const filteredComments = contentIndex !== undefined
        ? commentsData.filter(comment => comment.content_index === contentIndex)
        : commentsData;
      const organizedComments = organizeComments(filteredComments);
      setComments(organizedComments);
    } catch (err) {
      console.error('Error refreshing comments:', err);
    }
  };
  
  // Reset messages
  const handleMessageReset = () => {
    setError(null);
    setSuccess(null);
  };
  
  return (
    <Paper 
      elevation={0} 
      variant="outlined" 
      sx={{ p: 2, mb: 3 }} 
      role="region"
      aria-label="Comments section"
    >
      <Typography variant="h6" gutterBottom id="comments-section-heading">
        Comments
      </Typography>
      
      {/* Add comment form */}
      <Box component="form" onSubmit={handleAddComment} sx={{ mb: 3 }} role="form" aria-labelledby="comments-section-heading">
        <TextField
          fullWidth
          multiline
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          variant="outlined"
          disabled={isSubmitting}
          sx={{ mb: 1 }}
          aria-label="New comment text"
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="text"
            color="primary"
            onClick={() => setShowResolved(!showResolved)}
            aria-pressed={showResolved}
          >
            {showResolved ? 'Hide Resolved' : 'Show Resolved'}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!newComment.trim() || isSubmitting}
            aria-label="Add comment"
          >
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </Button>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Success/Error messages */}
      <Collapse in={!!success || !!error}>
        {success && (
          <Alert 
            severity="success" 
            onClose={handleMessageReset}
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        )}
        {error && (
          <Alert 
            severity="error" 
            onClose={handleMessageReset}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
      </Collapse>
      
      {/* Comments list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} aria-label="Loading comments" />
        </Box>
      ) : comments.length > 0 ? (
        <Box role="log" aria-label="Comment thread">
          {comments
            .filter(comment => showResolved || !comment.is_resolved)
            .map(comment => (
              <Comment
                key={comment.id}
                comment={comment}
                reportId={reportId}
                onCommentUpdate={handleCommentUpdate}
                canEdit={canEdit}
              />
            ))}
        </Box>
      ) : (
        <Typography color="textSecondary" align="center" sx={{ p: 2 }}>
          No comments yet. Be the first to comment!
        </Typography>
      )}
    </Paper>
  );
}; 