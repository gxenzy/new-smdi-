import React, { useState, useMemo } from 'react';
import { Paper, Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Select, FormControl, InputLabel, TableSortLabel, IconButton, Menu, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Audit, categories } from './types';
import CategoryRow from './CategoryRow';
import PageBreakWrapper from './PageBreakWrapper';
import { glassCardSx } from '../../../../theme/glassCardSx';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArchiveIcon from '@mui/icons-material/Archive';
import CommentIcon from '@mui/icons-material/Comment';

interface FloorTableProps {
  floor: string;
  selectedAudit: Audit;
  updateAuditField: (field: string, floor: string, category: string, value: any) => void;
  calculateValue: (ari: string) => number;
}

type SortColumn = 'category' | 'completed' | 'riskIndex';

type SortDirection = 'asc' | 'desc';

type FilterStatus = 'all' | 'completed' | 'not_completed';

const FloorTable: React.FC<FloorTableProps> = ({ floor, selectedAudit, updateAuditField, calculateValue }) => {
  const theme = useTheme();
  const [sortColumn, setSortColumn] = useState<SortColumn>('category');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedCategories = useMemo(() => {
    let cats = categories[floor].slice();
    // Filter
    if (filterStatus !== 'all') {
      cats = cats.filter(category => {
        const completed = selectedAudit.complianceData?.[floor]?.[category]?.completed || false;
        return filterStatus === 'completed' ? completed : !completed;
      });
    }
    // Sort
    cats.sort((a, b) => {
      if (sortColumn === 'category') {
        return sortDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      } else if (sortColumn === 'completed') {
        const aVal = selectedAudit.complianceData?.[floor]?.[a]?.completed ? 1 : 0;
        const bVal = selectedAudit.complianceData?.[floor]?.[b]?.completed ? 1 : 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      } else if (sortColumn === 'riskIndex') {
        const aVal = calculateValue(selectedAudit.ariData?.[floor]?.[a] || '');
        const bVal = calculateValue(selectedAudit.ariData?.[floor]?.[b] || '');
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return cats;
  }, [categories, floor, selectedAudit, filterStatus, sortColumn, sortDirection, calculateValue]);

  return (
    <PageBreakWrapper>
      <Paper sx={{ ...glassCardSx(), mb: 3, overflow: 'visible', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, '@media print': { boxShadow: 'none', border: 'none', marginBottom: '20px', breakInside: 'avoid', pageBreakInside: 'avoid' } }}>
        <Box sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <Typography variant="h6" align="center" fontWeight="bold" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.5, px: 2 }}>
            Assessment of Old Building {floor}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 1, gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter by Status"
              onChange={e => setFilterStatus(e.target.value as FilterStatus)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="not_completed">Not Completed</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer sx={{ overflowX: 'auto', backgroundColor: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
          <Table size="small" sx={{ width: '100%', tableLayout: 'auto', '& td, & th': { border: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper, '@media print': { backgroundColor: 'white !important', color: 'black !important' } }, '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} aria-label="Floor Assessment Table">
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '220px' }} />
              <col style={{ minWidth: 80, width: '10%' }} />
            </colgroup>
            <TableHead sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }}>
              <TableRow>
                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }} role="columnheader">Item No.</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }} role="columnheader">
                  <TableSortLabel
                    active={sortColumn === 'category'}
                    direction={sortDirection}
                    onClick={() => handleSort('category')}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }} role="columnheader">Conditions</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }} role="columnheader">Reference Standards</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }} role="columnheader">
                  <TableSortLabel
                    active={sortColumn === 'completed'}
                    direction={sortDirection}
                    onClick={() => handleSort('completed')}
                  >
                    Completed
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }} role="columnheader">
                  <TableSortLabel
                    active={sortColumn === 'riskIndex'}
                    direction={sortDirection}
                    onClick={() => handleSort('riskIndex')}
                  >
                    Risk Index
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ minWidth: 80, textAlign: 'right', bgcolor: 'primary.main', color: 'primary.contrastText', '@media print': { backgroundColor: 'white !important', color: 'black !important' } }} role="columnheader">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedCategories.map((category, index) => (
                <CategoryRow
                  key={category}
                  floor={floor}
                  category={category}
                  index={index}
                  selectedAudit={selectedAudit}
                  updateAuditField={updateAuditField}
                  calculateValue={calculateValue}
                  tabIndex={0}
                  ariaLabel={`Category row for ${category}`}
                  onDuplicateRow={(floor, category) => {
                    // Implement duplicate row logic
                  }}
                  onArchiveRow={(floor, category) => {
                    // Implement archive row logic
                  }}
                  onQuickComment={(floor, category, comment) => {
                    // Implement quick comment logic
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </PageBreakWrapper>
  );
};

export default React.memo(FloorTable); 