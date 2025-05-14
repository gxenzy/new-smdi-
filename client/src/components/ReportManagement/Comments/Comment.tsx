import React, { useState, useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  CheckCircle as ResolvedIcon,
  RadioButtonUnchecked as UnresolvedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ReportComment } from '../../../types/reports';
import commentService from '../../../services/commentService';

interface CommentProps {
  comment: ReportComment;
  reportId: number;
  onCommentUpdate: () => void;
  canEdit: boolean;
  indent?: number;
}

export const Comment: React.FC<CommentProps> = ({ 
  comment, 
  reportId, 
  onCommentUpdate, 
  canEdit,
  indent = 0,
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for focus management
  const editFormRef = useRef<HTMLFormElement>(null);
  const replyFormRef = useRef<HTMLFormElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  // Format date to relative time
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
  
  // Handle editing a comment
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await commentService.updateComment(reportId, comment.id, {
        content: editContent
      });
      
      setIsEditing(false);
      onCommentUpdate();
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle replying to a comment
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await commentService.replyToComment(reportId, comment.id, replyContent);
      
      setReplyContent('');
      setIsReplying(false);
      onCommentUpdate();
    } catch (error) {
      console.error('Error replying to comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle deleting a comment
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await commentService.deleteComment(reportId, comment.id);
      onCommentUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  // Handle toggling resolved status
  const handleToggleResolved = async () => {
    try {
      await commentService.resolveComment(reportId, comment.id, !comment.is_resolved);
      onCommentUpdate();
    } catch (error) {
      console.error('Error toggling resolved status:', error);
    }
  };
  
  // Handle keyboard accessible comment actions
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };
  
  // Focus input when editing or replying
  React.useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
    if (isReplying && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [isEditing, isReplying]);
  
  return (
    <Box 
      sx={{ 
        ml: indent * 3, 
        mb: 2,
        position: 'relative'
      }}
      role="article"
      aria-label={`Comment from ${comment.user?.name || 'Anonymous'}`}
    >
      <Card 
        variant="outlined" 
        sx={{ 
          borderColor: comment.is_resolved ? 'success.light' : 'grey.300',
          borderLeftWidth: 3,
          position: 'relative',
          backgroundColor: comment.is_resolved ? alpha(theme.palette.success.light, 0.05) : 'inherit'
        }}
      >
        {comment.is_resolved && (
          <Box sx={{ 
            position: 'absolute', 
            top: -8, 
            right: -8, 
            zIndex: 1,
            backgroundColor: 'white',
            borderRadius: '50%'
          }}>
            <ResolvedIcon color="success" aria-hidden="true" />
          </Box>
        )}
        
        <CardHeader
          avatar={
            <Avatar 
              alt={comment.user?.name || 'User'} 
              src={comment.user?.avatar}
              aria-label={`${comment.user?.name || 'User'}'s avatar`}
            >
              {comment.user?.name?.charAt(0) || 'U'}
            </Avatar>
          }
          title={comment.user?.name || 'Anonymous'}
          subheader={
            <Typography variant="caption" component="span">
              <span aria-label="Posted">{formattedDate}</span>
              {comment.is_resolved && (
                <Typography 
                  component="span" 
                  variant="caption" 
                  sx={{ ml: 1, color: 'success.main' }}
                  aria-label="Comment is resolved"
                >
                  • Resolved
                </Typography>
              )}
            </Typography>
          }
          titleTypographyProps={{ variant: 'subtitle2' }}
          action={
            canEdit && (
              <Box>
                <Tooltip title={comment.is_resolved ? 'Mark as unresolved' : 'Mark as resolved'}>
                  <IconButton 
                    onClick={handleToggleResolved}
                    size="small"
                    aria-label={comment.is_resolved ? 'Mark as unresolved' : 'Mark as resolved'}
                    aria-pressed={comment.is_resolved}
                    onKeyDown={(e) => handleKeyDown(e, handleToggleResolved)}
                  >
                    {comment.is_resolved ? 
                      <ResolvedIcon fontSize="small" color="success" aria-hidden="true" /> : 
                      <UnresolvedIcon fontSize="small" aria-hidden="true" />
                    }
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Edit">
                  <IconButton 
                    onClick={() => setIsEditing(true)} 
                    size="small"
                    aria-label="Edit comment"
                    onKeyDown={(e) => handleKeyDown(e, () => setIsEditing(true))}
                    disabled={isEditing}
                  >
                    <EditIcon fontSize="small" aria-hidden="true" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete">
                  <IconButton 
                    onClick={handleDelete} 
                    size="small"
                    aria-label="Delete comment"
                    onKeyDown={(e) => handleKeyDown(e, handleDelete)}
                  >
                    <DeleteIcon fontSize="small" aria-hidden="true" />
                  </IconButton>
                </Tooltip>
              </Box>
            )
          }
        />
        
        <CardContent sx={{ pt: 0 }}>
          {isEditing ? (
            <Box 
              component="form" 
              onSubmit={handleEditSubmit} 
              ref={editFormRef}
              role="form"
              aria-label="Edit comment form"
            >
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                variant="outlined"
                disabled={isSubmitting}
                size="small"
                placeholder="Edit your comment..."
                inputRef={editInputRef}
                InputProps={{
                  'aria-label': 'Edit comment text'
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  aria-label="Cancel editing"
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  type="submit"
                  disabled={!editContent.trim() || isSubmitting}
                  startIcon={isSubmitting ? null : <DoneIcon aria-hidden="true" />}
                  aria-label="Save comment changes"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography 
              variant="body2" 
              component="div" 
              sx={{ whiteSpace: 'pre-wrap' }}
              aria-label="Comment content"
            >
              {comment.content}
            </Typography>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              size="small"
              startIcon={<ReplyIcon aria-hidden="true" />}
              onClick={() => setIsReplying(!isReplying)}
              aria-expanded={isReplying}
              aria-label="Reply to comment"
            >
              Reply
            </Button>
            
            {hasReplies && (
              <Button
                size="small"
                endIcon={showReplies ? <ExpandLessIcon aria-hidden="true" /> : <ExpandMoreIcon aria-hidden="true" />}
                onClick={() => setShowReplies(!showReplies)}
                aria-expanded={showReplies}
                aria-controls={`replies-${comment.id}`}
                aria-label={`${showReplies ? 'Hide' : 'Show'} ${comment.replies?.length || 0} replies`}
              >
                {showReplies ? 'Hide' : 'Show'} Replies ({comment.replies?.length || 0})
              </Button>
            )}
          </Box>
          
          {isReplying && (
            <Box 
              sx={{ mt: 2 }} 
              component="form" 
              onSubmit={handleReplySubmit} 
              ref={replyFormRef}
              role="form"
              aria-label="Reply to comment form"
            >
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={2}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                variant="outlined"
                size="small"
                placeholder="Write a reply..."
                disabled={isSubmitting}
                inputRef={replyInputRef}
                InputProps={{
                  'aria-label': 'Reply text'
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setIsReplying(false)}
                  disabled={isSubmitting}
                  aria-label="Cancel reply"
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  type="submit"
                  disabled={!replyContent.trim() || isSubmitting}
                  aria-label="Post reply"
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Render replies */}
      {hasReplies && showReplies && (
        <Box id={`replies-${comment.id}`} role="region" aria-label="Replies">
          {comment.replies?.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              reportId={reportId}
              onCommentUpdate={onCommentUpdate}
              canEdit={canEdit}
              indent={indent + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Helper function to create semi-transparent color
function alpha(color: string, opacity: number): string {
  // Simple implementation for demo purposes
  return color;
} 