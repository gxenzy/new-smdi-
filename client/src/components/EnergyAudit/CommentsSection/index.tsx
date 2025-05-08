import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Link as MuiLink,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { Comment } from '../../../types/energy-audit';
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
  comments: Comment[];
  onAddComment: (text: string, attachments?: Comment['attachments']) => void;
  onEditComment: (id: string, text: string, attachments?: Comment['attachments']) => void;
  onDeleteComment: (id: string) => void;
  currentUser: string;
  users: string[];
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
  users,
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Mention autocomplete logic
  const handleInputChange = (value: string, isEdit = false) => {
    if (isEdit) setEditText(value);
    else setNewComment(value);
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
    const value = isEdit ? editText : newComment;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment, attachments);
      setNewComment('');
      setAttachments([]);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
    setEditAttachments(comment.attachments || []);
  };

  const handleSaveEdit = (id: string) => {
    if (editText.trim()) {
      onEditComment(id, editText, editAttachments);
      setEditingId(null);
      setEditText('');
      setEditAttachments([]);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
    setEditAttachments([]);
  };

  // Filter users for mention dropdown
  const getMentionOptions = (value: string) => {
    if (mentionStart === null) return [];
    const match = value.slice(mentionStart + 1).match(/^(\w*)/);
    const prefix = match ? match[1].toLowerCase() : '';
    return users.map(name => ({ id: name, name }));
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
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>
      <List>
        {comments.map(comment => (
          <ListItem
            key={comment.id}
            alignItems="flex-start"
            secondaryAction={
              comment.author === currentUser && (
                <Box>
                  <IconButton edge="end" onClick={() => handleEdit(comment)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => onDeleteComment(comment.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )
            }
          >
            <ListItemAvatar>
              <Avatar>{comment.author[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography component="span" variant="subtitle2">
                    {comment.author}
                  </Typography>
                  <Typography component="span" variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              }
              secondary={
                editingId === comment.id ? (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      value={editText}
                      onChange={(e) => handleInputChange(e.target.value, true)}
                      size="small"
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSaveEdit(comment.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={handleEditCancel}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography component="div" variant="body2">
                      {renderWithMentionsAndMarkdown(comment.text, getMentionOptions(comment.text))}
                    </Typography>
                    {comment.attachments && comment.attachments.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {renderAttachments(comment.attachments)}
                      </Box>
                    )}
                  </Box>
                )
              }
            />
          </ListItem>
        ))}
      </List>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            type="submit"
            disabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CommentsSection; 