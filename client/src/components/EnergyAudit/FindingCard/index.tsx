import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Tooltip,
  Alert,
  Menu,
} from '@mui/material';
import { Delete as DeleteIcon, PhotoCamera, Save as SaveIcon } from '@mui/icons-material';
import { Finding, Severity, Status } from '../../../pages/EnergyAudit/EnergyAuditContext';
import { UserRole } from '../../../types';
import { useHotkeys } from 'react-hotkeys-hook';
import CommentsSection from '../CommentsSection';
import ActivityLog from '../ActivityLog';

interface FindingCardProps {
  finding: Finding;
  section: 'lighting' | 'hvac' | 'envelope';
  users: Array<{ id: string; name: string; role: UserRole }>;
  currentUser: { name: string; role: UserRole };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (field: keyof Omit<Finding, 'id' | 'section' | 'createdAt' | 'comments'>, value: any) => void;
  onRemove: () => void;
  onPhotoUpload: (file: File) => void;
  onAddComment: (text: string) => void;
  onSetApprovalStatus: (status: string) => void;
  commentInput: string;
  onCommentInputChange: (value: string) => void;
}

const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  section,
  users,
  currentUser,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onPhotoUpload,
  onAddComment,
  onSetApprovalStatus,
  commentInput,
  onCommentInputChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Keyboard shortcuts
  useHotkeys('ctrl+s', (e) => {
    e.preventDefault();
    handleSave();
  });

  useHotkeys('delete', (e) => {
    if (isSelected) {
      e.preventDefault();
      onRemove();
    }
  });

  const handleUpdate = useCallback((field: keyof Omit<Finding, 'id' | 'section' | 'createdAt' | 'comments'>, value: any) => {
    setIsDirty(true);
    onUpdate(field, value);
  }, [onUpdate]);

  const handleSave = async () => {
    if (!isDirty) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsDirty(false);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size should be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await onPhotoUpload(file);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle general file upload (attachments)
  const handleAttachmentUpload = async (files: FileList | null) => {
    if (!files) return;
    const newAttachments: { name: string; url: string; type: string }[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Attachment size should be less than 10MB');
        continue;
      }
      const url = URL.createObjectURL(file);
      newAttachments.push({ name: file.name, url, type: file.type });
    }
    onUpdate('attachments', [...(finding.attachments || []), ...newAttachments]);
  };

  // New: Handlers for editing and deleting comments
  const handleAddComment = (text: string, attachments?: { name: string; url: string; type: string }[]) => {
    const newComment = {
      id: Date.now().toString() + Math.random(),
      author: currentUser.name,
      text,
      createdAt: new Date().toISOString(),
      attachments: attachments || [],
    };
    onUpdate('comments', [...finding.comments, newComment]);
  };

  const handleEditComment = (id: string, text: string, attachments?: { name: string; url: string; type: string }[]) => {
    const updatedComments = finding.comments.map(c =>
      c.id === id ? { ...c, text, attachments: attachments || [] } : c
    );
    onUpdate('comments', updatedComments);
  };

  const handleDeleteComment = (id: string) => {
    const updatedComments = finding.comments.filter(c => c.id !== id);
    onUpdate('comments', updatedComments);
  };

  const canEdit = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;
  const canApprove = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;
  const canDelete = currentUser.role === UserRole.ADMIN;

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    // Implement edit logic
  };

  const handleApprove = () => {
    onSetApprovalStatus('Approved');
  };

  const handleReject = () => {
    onSetApprovalStatus('Rejected');
  };

  const handleDelete = () => {
    onRemove();
  };

  return (
    <Paper 
      sx={{ 
        mb: 2, 
        p: 2, 
        border: isSelected ? '2px solid #1976d2' : undefined,
        position: 'relative',
      }}
    >
      {isLoading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1,
        }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={1}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(finding.id)}
            style={{ transform: 'scale(1.3)' }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Finding Description"
            value={finding.description}
            onChange={(e) => handleUpdate('description', e.target.value)}
            fullWidth
            multiline
            minRows={2}
            error={!finding.description.trim()}
            helperText={!finding.description.trim() ? 'Description is required' : ''}
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={finding.severity}
              label="Severity"
              onChange={(e) => handleUpdate('severity', e.target.value)}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Estimated Cost (₱)"
            type="number"
            value={finding.estimatedCost}
            onChange={(e) => handleUpdate('estimatedCost', parseFloat(e.target.value) || 0)}
            fullWidth
            sx={{ mt: 1 }}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Tooltip title="Upload photo (max 5MB)">
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{ mb: 1 }}
              fullWidth
              disabled={isLoading}
            >
              Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePhotoUpload(e.target.files[0]);
                  }
                }}
              />
            </Button>
          </Tooltip>
          {finding.photo && (
            <img
              src={finding.photo}
              alt="Finding"
              style={{ width: '100%', maxHeight: 80, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          {/* General attachments upload */}
          <Tooltip title="Upload attachments (max 10MB each)">
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 1 }}
              fullWidth
              disabled={isLoading}
            >
              Attach Files
              <input
                type="file"
                multiple
                hidden
                onChange={(e) => handleAttachmentUpload(e.target.files)}
              />
            </Button>
          </Tooltip>
          {/* Display attachments */}
          {finding.attachments && finding.attachments.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {finding.attachments.map(att => (
                <Box key={att.url} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {att.type.startsWith('image/') ? (
                    <img src={att.url} alt={att.name} style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4 }} />
                  ) : (
                    <a href={att.url} target="_blank" rel="noopener noreferrer" download={att.name} style={{ textDecoration: 'none' }}>
                      <Button size="small" variant="outlined">{att.name}</Button>
                    </a>
                  )}
                </Box>
              ))}
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Tooltip title="Delete finding (Delete key)">
              <IconButton
                color="error"
                onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
                disabled={isLoading}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save changes (Ctrl+S)">
              <IconButton
                color="primary"
                onClick={handleSave}
                disabled={!isDirty || isLoading}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Approval Status & Actions */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Approval Status: <b>{finding.approvalStatus}</b></Typography>
            {finding.approvalStatus === 'Draft' && currentUser.role === UserRole.AUDITOR && (
              <Button size="small" color="primary" variant="outlined" sx={{ mr: 1 }} onClick={() => onSetApprovalStatus('Pending Review')}>
                Submit for Review
              </Button>
            )}
            {finding.approvalStatus === 'Pending Review' && currentUser.role === UserRole.MANAGER && (
              <Button size="small" color="primary" variant="outlined" sx={{ mr: 1 }} onClick={() => onSetApprovalStatus('Manager Approval')}>
                Manager Approve
              </Button>
            )}
            {finding.approvalStatus === 'Manager Approval' && currentUser.role === UserRole.ADMIN && (
              <Button size="small" color="primary" variant="outlined" sx={{ mr: 1 }} onClick={() => onSetApprovalStatus('Final Approval')}>
                Final Approve
              </Button>
            )}
            {finding.approvalStatus === 'Final Approval' && currentUser.role === UserRole.ADMIN && (
              <Button size="small" color="success" variant="outlined" sx={{ mr: 1 }} onClick={() => onSetApprovalStatus('Approved')}>
                Approve
              </Button>
            )}
            {(['Pending Review', 'Manager Approval', 'Final Approval'] as string[]).includes(finding.approvalStatus) &&
              (currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.ADMIN) && (
                <Button size="small" color="error" variant="outlined" onClick={() => onSetApprovalStatus('Rejected')}>
                  Reject
                </Button>
            )}
          </Box>

          {/* Comments */}
          <Box sx={{ mt: 2 }}>
            <CommentsSection
              comments={finding.comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              currentUser={currentUser.name}
              users={users}
            />
          </Box>

          {/* Activity Log */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Activity Log</Typography>
            <ActivityLog activityLog={finding.activityLog || []} />
          </Box>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {canEdit && <MenuItem onClick={handleEdit}>Edit</MenuItem>}
        {canApprove && finding.approvalStatus !== 'Approved' && (
          <MenuItem onClick={handleApprove}>Approve</MenuItem>
        )}
        {canApprove && finding.approvalStatus !== 'Rejected' && (
          <MenuItem onClick={handleReject}>Reject</MenuItem>
        )}
        {canDelete && <MenuItem onClick={handleDelete}>Delete</MenuItem>}
      </Menu>
    </Paper>
  );
};

export default FindingCard; 