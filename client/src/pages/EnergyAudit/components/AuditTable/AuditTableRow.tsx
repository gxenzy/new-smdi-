import React from 'react';
import { TableRow, TableCell, Checkbox, TextField, Tooltip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Badge, Box, InputLabel, Select, OutlinedInput } from '@mui/material';
import { AuditRow, AuditRowMeta } from './types';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArchiveIcon from '@mui/icons-material/Archive';
import CommentIcon from '@mui/icons-material/Comment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface AuditTableRowProps {
  row: AuditRow;
  onChange: (row: AuditRow) => void;
  onDuplicateRow?: (row: AuditRow) => void;
  onArchiveRow?: (row: AuditRow) => void;
  onQuickComment?: (row: AuditRow, comment: string) => void;
  showActions?: boolean;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
}

const AuditTableRow: React.FC<AuditTableRowProps> = ({ row, onChange, onDuplicateRow, onArchiveRow, onQuickComment, showActions = true, selected = false, onSelect }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [commentDialogOpen, setCommentDialogOpen] = React.useState(false);
  const [editMetaDialogOpen, setEditMetaDialogOpen] = React.useState(false);
  const [comment, setComment] = React.useState(row.comments || '');
  const [tags, setTags] = React.useState<string[]>(row.tags || []);
  const [status, setStatus] = React.useState<AuditRowMeta['status']>(row.status || 'open');
  const [color, setColor] = React.useState<string>(row.color || '#1976d2');
  const [createdAt] = React.useState<string>(row.createdAt || '');
  const [updatedAt, setUpdatedAt] = React.useState<string>(row.updatedAt || '');
  const theme = useTheme();

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => { setAnchorEl(e.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleDuplicate = () => { onDuplicateRow?.(row); handleMenuClose(); };
  const handleArchive = () => { onArchiveRow?.(row); handleMenuClose(); };
  const handleQuickComment = () => { setCommentDialogOpen(true); handleMenuClose(); };
  const handleCommentSave = () => { onQuickComment?.(row, comment); setCommentDialogOpen(false); };
  const handleEditMeta = () => { setEditMetaDialogOpen(true); handleMenuClose(); };
  const handleMetaSave = () => {
    onChange({
      ...row,
      comments: comment,
      tags,
      status,
      color,
      updatedAt: new Date().toISOString(),
    });
    setUpdatedAt(new Date().toISOString());
    setEditMetaDialogOpen(false);
  };

  return (
    <TableRow hover tabIndex={0} aria-label={`Audit row for ${row.category}`}
      sx={{ '&:focus': { outline: '2px solid', outlineColor: 'primary.main' }, borderLeft: `6px solid ${row.color || color || theme.palette.primary.main}`, '@media print': { backgroundColor: 'white !important', color: 'black !important' } }}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={e => onSelect?.(e.target.checked)} inputProps={{ 'aria-label': `Select row ${row.id}` }} />
      </TableCell>
      <TableCell align="center" sx={{ color: 'text.primary', bgcolor: 'background.paper', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="cell">{row.id}</TableCell>
      <TableCell sx={{ color: 'text.primary', bgcolor: 'background.paper', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="cell">{row.category}</TableCell>
      <TableCell sx={{ color: 'text.primary', bgcolor: 'background.paper', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="cell">
        {row.conditions.map((cond, idx) => (
          <div key={idx}>{cond}</div>
        ))}
      </TableCell>
      <TableCell sx={{ color: 'text.primary', bgcolor: 'background.paper', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="cell">
        {row.referenceStandards.map((ref, idx) => (
          <div key={idx}>{ref}</div>
        ))}
      </TableCell>
      <TableCell align="center" sx={{ color: 'text.primary', bgcolor: 'background.paper', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="cell">
        <Checkbox
          checked={row.completed}
          onChange={e => onChange({ ...row, completed: e.target.checked })}
          inputProps={{ 'aria-label': `Completed for ${row.category}` }}
        />
      </TableCell>
      <TableCell sx={{ color: 'text.primary', bgcolor: 'background.paper', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="cell">
        <Tooltip title="Probability of Occurrence">
          <span>PO: {row.riskIndex.PO}</span>
        </Tooltip>
        <Tooltip title="Severity of Occurrence">
          <span> SO: {row.riskIndex.SO}</span>
        </Tooltip>
        <Tooltip title="Assessment Risk Index">
          <span> ARI: {row.riskIndex.ARI}</span>
        </Tooltip>
        <div>Value: {row.riskIndex.value}</div>
      </TableCell>
      <TableCell sx={{ color: 'text.primary', bgcolor: 'background.paper', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="cell">
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {row.tags && row.tags.map(tag => (
            <Chip key={tag} label={tag} size="small" color="info" />
          ))}
        </Box>
        {row.status && (
          <Chip label={row.status} size="small" color={row.status === 'closed' ? 'error' : row.status === 'in_review' ? 'warning' : 'success'} sx={{ ml: 1 }} />
        )}
      </TableCell>
      <TableCell sx={{ color: 'text.primary', bgcolor: 'background.paper', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="cell">
        <TextField
          value={row.comments || ''}
          onChange={e => onChange({ ...row, comments: e.target.value })}
          size="small"
          placeholder="Comments"
          inputProps={{ 'aria-label': `Comments for ${row.category}` }}
        />
      </TableCell>
      {showActions && (
        <TableCell align="right" className="actions-col" sx={{ verticalAlign: 'top', '@media print': { display: 'none !important' } }}>
          <IconButton aria-label="Row actions" onClick={handleMenuOpen} size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
            <MenuItem onClick={handleDuplicate} aria-label="Duplicate row">
              <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleArchive} aria-label="Archive row">
              <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Archive</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleQuickComment} aria-label="Quick comment">
              <ListItemIcon><CommentIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Quick Comment</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleEditMeta} aria-label="Edit metadata">
              <ListItemIcon><InfoOutlinedIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Edit Metadata</ListItemText>
            </MenuItem>
          </Menu>
          <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)}>
            <DialogTitle>Quick Comment</DialogTitle>
            <DialogContent>
              <TextField value={comment} onChange={e => setComment(e.target.value)} fullWidth multiline minRows={2} autoFocus />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCommentSave} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={editMetaDialogOpen} onClose={() => setEditMetaDialogOpen(false)}>
            <DialogTitle>Edit Row Metadata</DialogTitle>
            <DialogContent sx={{ minWidth: 350 }}>
              <TextField label="Comments" value={comment} onChange={e => setComment(e.target.value)} fullWidth multiline minRows={2} sx={{ mb: 2 }} />
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={e => setStatus(e.target.value as any)} fullWidth sx={{ mb: 2 }}>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_review">In Review</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={tags}
                onChange={e => setTags(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                input={<OutlinedInput label="Tags" />}
                fullWidth
                sx={{ mb: 2 }}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{(selected as string[]).map(tag => <Chip key={tag} label={tag} size="small" />)}</Box>
                )}
              >
                {['priority', 'flagged', 'reviewed', 'important'].map(tag => (
                  <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                ))}
              </Select>
              <InputLabel>Row Color</InputLabel>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 40, height: 32, border: 'none', background: 'none', marginBottom: 16 }} />
              <Box sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>
                Created: {createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}<br />
                Last Updated: {updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A'}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditMetaDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleMetaSave} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </TableCell>
      )}
    </TableRow>
  );
};

export default AuditTableRow; 