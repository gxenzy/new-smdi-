import React, { useState, useMemo } from 'react';
import { Paper, Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { Audit, categories } from './types';
import DebouncedTextField from './DebouncedTextField';
import TableWrapper from './TableWrapper';
import { glassCardSx } from '../../../../theme/glassCardSx';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArchiveIcon from '@mui/icons-material/Archive';
import CommentIcon from '@mui/icons-material/Comment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { TextField, Button } from '@mui/material';

interface StandardTableProps {
  standard: string;
  selectedAudit: Audit;
  updateAuditField: (field: string, floor: string, standard: string, value: any) => void;
  calculatePercentage: (values: (number | string)[]) => string[];
  onDuplicateRow?: (floor: string) => void;
  onArchiveRow?: (floor: string) => void;
  onQuickComment?: (floor: string, comment: string) => void;
  showActions?: boolean;
}

type SortColumn = 'floor' | 'complied' | 'nonCompliant';
type SortDirection = 'asc' | 'desc';

const StandardTable: React.FC<StandardTableProps> = ({ standard, selectedAudit, updateAuditField, calculatePercentage, onDuplicateRow, onArchiveRow, onQuickComment, showActions = true }) => {
  const theme = useTheme();
  const [sortColumn, setSortColumn] = useState<SortColumn>('floor');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = React.useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = React.useState(false);
  const [comment, setComment] = React.useState('');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedFloors = useMemo(() => {
    const floors = Object.keys(categories);
    return floors.sort((a, b) => {
      if (sortColumn === 'floor') {
        return sortDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      } else if (sortColumn === 'complied') {
        const aVal = selectedAudit.complianceData?.[a]?.[standard]?.complied || 0;
        const bVal = selectedAudit.complianceData?.[b]?.[standard]?.complied || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      } else if (sortColumn === 'nonCompliant') {
        const aVal = selectedAudit.complianceData?.[a]?.[standard]?.nonCompliant || 0;
        const bVal = selectedAudit.complianceData?.[b]?.[standard]?.nonCompliant || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [categories, selectedAudit, sortColumn, sortDirection, standard]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, floor: string) => { setAnchorEl(e.currentTarget); setMenuRow(floor); };
  const handleMenuClose = () => { setAnchorEl(null); setMenuRow(null); };
  const handleDuplicate = (floor: string) => { onDuplicateRow?.(floor); handleMenuClose(); };
  const handleArchive = (floor: string) => { onArchiveRow?.(floor); handleMenuClose(); };
  const handleQuickComment = (floor: string) => { setCommentDialogOpen(true); setMenuRow(floor); handleMenuClose(); };
  const handleCommentSave = () => { if (menuRow) onQuickComment?.(menuRow, comment); setCommentDialogOpen(false); setComment(''); setMenuRow(null); };

  return (
    <TableWrapper>
      <Paper sx={{ ...glassCardSx(), mb: 3, overflow: 'visible', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, '@media print': { boxShadow: 'none', border: 'none', marginBottom: '20px' } }}>
        <Box sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <Typography variant="h6" align="center" fontWeight="bold" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.5, px: 2 }}>
            Standard Compliance per Floor for {standard}
          </Typography>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ width: '100%', tableLayout: 'auto', '& td, & th': { border: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper, '@media print': { backgroundColor: 'white !important', color: 'black !important' } }, '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} aria-label="Standard Compliance Table">
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              {showActions && <col style={{ minWidth: 80, width: '10%' }} />}
            </colgroup>
            <TableHead sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '@media print': {
                backgroundColor: 'white !important',
                color: 'black !important',
                '& .actions-col': { display: 'none !important' },
              },
            }}>
              <TableRow>
                <TableCell role="columnheader" aria-label="Floor">
                  <TableSortLabel
                    active={sortColumn === 'floor'}
                    direction={sortDirection}
                    onClick={() => handleSort('floor')}
                  >
                    FLOOR
                  </TableSortLabel>
                </TableCell>
                <TableCell role="columnheader" aria-label="Complied">
                  <TableSortLabel
                    active={sortColumn === 'complied'}
                    direction={sortDirection}
                    onClick={() => handleSort('complied')}
                  >
                    COMPLIED
                    <Tooltip title="Number of items that meet the standard.">
                      <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                <TableCell role="columnheader" aria-label="Non Compliant">
                  <TableSortLabel
                    active={sortColumn === 'nonCompliant'}
                    direction={sortDirection}
                    onClick={() => handleSort('nonCompliant')}
                  >
                    NON COMPLIANT
                    <Tooltip title="Number of items that do not meet the standard.">
                      <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                <TableCell role="columnheader" aria-label="Percentage">
                  PERCENTAGE
                  <Tooltip title="Percentage of complied vs. non-compliant items.">
                    <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                  </Tooltip>
                </TableCell>
                {showActions && <TableCell role="columnheader" className="actions-col" aria-label="Actions">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedFloors.map((floor, floorIndex) => (
                <TableRow key={floorIndex} hover tabIndex={0} aria-label={`Standard row for ${floor}`}
                  sx={{ '&:focus': { outline: '2px solid', outlineColor: 'primary.main' }, '@media print': { backgroundColor: 'white !important', color: 'black !important' } }}>
                  <TableCell role="cell">{floor}</TableCell>
                  <TableCell role="cell">
                    <DebouncedTextField
                      type="number"
                      placeholder="Complied"
                      value={selectedAudit.complianceData?.[floor]?.[standard]?.complied || ''}
                      onChange={value => {
                        const complied = parseInt(value) || 0;
                        updateAuditField('complianceData', floor, standard, {
                          ...selectedAudit.complianceData?.[floor]?.[standard],
                          complied,
                        });
                      }}
                      size="small"
                      inputProps={{ min: 0, 'aria-label': `Complied for ${floor}` }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell role="cell">
                    <DebouncedTextField
                      type="number"
                      placeholder="Non Compliant"
                      value={selectedAudit.complianceData?.[floor]?.[standard]?.nonCompliant || ''}
                      onChange={value => {
                        const nonCompliant = parseInt(value) || 0;
                        updateAuditField('complianceData', floor, standard, {
                          ...selectedAudit.complianceData?.[floor]?.[standard],
                          nonCompliant,
                        });
                      }}
                      size="small"
                      inputProps={{ min: 0, 'aria-label': `Non Compliant for ${floor}` }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell role="cell" sx={{ whiteSpace: 'nowrap' }}>
                    {calculatePercentage([
                      selectedAudit.complianceData?.[floor]?.[standard]?.complied || 0,
                      selectedAudit.complianceData?.[floor]?.[standard]?.nonCompliant || 0,
                    ]).map((percentage, idx) => (
                      <span key={idx}>
                        {percentage}%
                        {idx < 1 && ' / '}
                      </span>
                    ))}
                  </TableCell>
                  {showActions && <TableCell align="right" className="actions-col" sx={{ verticalAlign: 'top', '@media print': { display: 'none !important' } }}>
                    <IconButton aria-label="Row actions" onClick={e => handleMenuOpen(e, floor)} size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={!!anchorEl && menuRow === floor} onClose={handleMenuClose}>
                      <MenuItem onClick={() => handleDuplicate(floor)} aria-label="Duplicate row">
                        <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Duplicate</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleArchive(floor)} aria-label="Archive row">
                        <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Archive</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleQuickComment(floor)} aria-label="Quick comment">
                        <ListItemIcon><CommentIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Quick Comment</ListItemText>
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
                  </TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </TableWrapper>
  );
};

export default React.memo(StandardTable); 