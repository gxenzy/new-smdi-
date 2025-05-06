import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Link as MuiLink,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { Comment } from '../../../pages/EnergyAudit/EnergyAuditContext';
import ReactMarkdown from 'react-markdown';

interface User {
  id: string;
  name: string;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface CommentsSectionProps {
  comments: (Comment & { attachments?: Attachment[] })[];
  onAddComment: (text: string, attachments?: Attachment[]) => void;
  onEditComment: (id: string, text: string, attachments?: Attachment[]) => void;
  onDeleteComment: (id: string) => void;
  currentUser: string;
  users?: User[];
}

function renderWithMentionsAndMarkdown(text: string, users: User[] = []) {
  // Highlight @mentions and render markdown
  // We'll use react-markdown for markdown, and custom renderer for mentions
  const mentionRegex = /@([\w\-]+)/g;
  const components = {
    text({ children }: any) {
      // children is a string
      const parts = String(children).split(mentionRegex);
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          // This is a username
          const user = users.find(u => u.name.toLowerCase() === part.toLowerCase());
          if (user) {
            return (
              <Chip
                key={i}
                label={`@${part}`}
                size="small"
                sx={{ mx: 0.2, bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}
              />
            );
          }
        }
        return <span key={i}>{part}</span>;
      });
    },
    a({ href, children }: any) {
      return <MuiLink href={href} target="_blank" rel="noopener noreferrer">{children}</MuiLink>;
    },
  };
  return <ReactMarkdown components={components}>{text}</ReactMarkdown>;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUser,
  users = [],
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Mention autocomplete logic
  const handleInputChange = (value: string, isEdit = false) => {
    if (isEdit) setEditInput(value);
    else setCommentInput(value);
    const cursor = (isEdit ? editInputRef.current : inputRef.current)?.selectionStart || value.length;
    const lastAt = value.lastIndexOf('@', cursor - 1);
    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(value[lastAt - 1]))) {
      setMentionStart(lastAt);
      setAnchorEl((isEdit ? editInputRef : inputRef).current);
    } else {
      setMentionStart(null);
      setAnchorEl(null);
    }
  };

  const handleMentionSelect = (user: User, isEdit = false) => {
    const value = isEdit ? editInput : commentInput;
    if (mentionStart === null) return;
    const before = value.slice(0, mentionStart);
    const after = value.slice((isEdit ? editInputRef.current : inputRef.current)?.selectionStart || value.length);
    const newValue = `${before}@${user.name} ${after}`;
    handleInputChange(newValue, isEdit);
    setMentionStart(null);
    setAnchorEl(null);
    setTimeout(() => {
      (isEdit ? editInputRef : inputRef).current?.focus();
    }, 0);
  };

  // Attachment logic
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      newAttachments.push({ name: file.name, url, type: file.type });
    });
    if (isEdit) setEditAttachments(prev => [...prev, ...newAttachments]);
    else setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleAddComment = () => {
    if (commentInput.trim()) {
      onAddComment(commentInput, attachments);
      setCommentInput('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, isEdit = false) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isEdit) handleEditSave(editingId!);
      else handleAddComment();
    }
  };

  const handleEdit = (id: string, text: string, attachments?: Attachment[]) => {
    setEditingId(id);
    setEditInput(text);
    setEditAttachments(attachments || []);
  };

  const handleEditSave = (id: string) => {
    if (editInput.trim()) {
      onEditComment(id, editInput, editAttachments);
      setEditingId(null);
      setEditInput('');
      setEditAttachments([]);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditInput('');
    setEditAttachments([]);
  };

  // Filter users for mention dropdown
  const getMentionOptions = (value: string) => {
    if (mentionStart === null) return [];
    const match = value.slice(mentionStart + 1).match(/^(\w*)/);
    const prefix = match ? match[1].toLowerCase() : '';
    return users.filter(u => u.name.toLowerCase().startsWith(prefix));
  };

  // Render attachments
  const renderAttachments = (attachments?: Attachment[]) => (
    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {attachments && attachments.map(att => (
        <Box key={att.url} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {att.type.startsWith('image/') ? (
            <img src={att.url} alt={att.name} style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4 }} />
          ) : (
            <AttachFileIcon fontSize="small" />
          )}
          <MuiLink href={att.url} target="_blank" rel="noopener noreferrer" download={att.name} sx={{ ml: 0.5 }}>
            {att.name}
          </MuiLink>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Comments
      </Typography>
      <List dense>
        {comments.length === 0 && (
          <ListItem>
            <ListItemText primary="No comments yet." />
          </ListItem>
        )}
        {comments.map((comment) => (
          <ListItem key={comment.id} alignItems="flex-start" secondaryAction={
            comment.author === currentUser && editingId !== comment.id && (
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(comment.id, comment.text, comment.attachments)} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => onDeleteComment(comment.id)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            )
          }>
            {editingId === comment.id ? (
              <>
                <TextField
                  inputRef={editInputRef}
                  value={editInput}
                  onChange={e => handleInputChange(e.target.value, true)}
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mr: 1 }}
                  onKeyPress={e => handleKeyPress(e, true)}
                  placeholder="Type @ to mention someone..."
                />
                <input
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  id={`edit-attachment-input-${comment.id}`}
                  onChange={e => handleAttachment(e, true)}
                />
                <label htmlFor={`edit-attachment-input-${comment.id}`}>
                  <IconButton component="span" size="small">
                    <AttachFileIcon fontSize="small" />
                  </IconButton>
                </label>
                <IconButton aria-label="save" onClick={() => handleEditSave(comment.id)} size="small">
                  <SaveIcon fontSize="small" />
                </IconButton>
                <IconButton aria-label="cancel" onClick={handleEditCancel} size="small">
                  <CancelIcon fontSize="small" />
                </IconButton>
                {renderAttachments(editAttachments)}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && mentionStart !== null}
                  onClose={() => { setMentionStart(null); setAnchorEl(null); }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                  {getMentionOptions(editInput).map(user => (
                    <MenuItem key={user.id} onClick={() => handleMentionSelect(user, true)}>
                      @{user.name}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <ListItemText
                primary={renderWithMentionsAndMarkdown(comment.text, users)}
                secondary={<>
                  {`By ${comment.author} on ${new Date(comment.createdAt).toLocaleString()}`}
                  {renderAttachments(comment.attachments)}
                </>}
              />
            )}
          </ListItem>
        ))}
      </List>
      <TextField
        inputRef={inputRef}
        label="Add Comment"
        value={commentInput}
        onChange={e => handleInputChange(e.target.value)}
        onKeyPress={e => handleKeyPress(e)}
        size="small"
        fullWidth
        multiline
        minRows={2}
        sx={{ mt: 1 }}
        placeholder="Type @ to mention someone..."
      />
      <input
        type="file"
        multiple
        style={{ display: 'none' }}
        id="attachment-input"
        onChange={e => handleAttachment(e)}
      />
      <label htmlFor="attachment-input">
        <IconButton component="span" size="small">
          <AttachFileIcon fontSize="small" />
        </IconButton>
      </label>
      {renderAttachments(attachments)}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && mentionStart !== null}
        onClose={() => { setMentionStart(null); setAnchorEl(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {getMentionOptions(commentInput).map(user => (
          <MenuItem key={user.id} onClick={() => handleMentionSelect(user)}>
            @{user.name}
          </MenuItem>
        ))}
      </Menu>
      <Button
        size="small"
        variant="outlined"
        sx={{ mt: 1 }}
        onClick={handleAddComment}
        disabled={!commentInput.trim()}
      >
        Add Comment
      </Button>
    </Box>
  );
};

export default CommentsSection; 