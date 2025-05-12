import React from 'react';
import { TableRow, TableCell, Box, Typography, Checkbox, Select, MenuItem } from '@mui/material';
import { Audit, riskIndexMapping } from './types';

interface RiskIndexCellProps {
  floor: string;
  category: string;
  selectedAudit: Audit;
  updateAuditField: (field: string, floor: string, category: string, value: any) => void;
  calculateValue: (ari: string) => number;
}

const RiskIndexCell = React.memo(({
  floor,
  category,
  selectedAudit,
  updateAuditField,
  calculateValue,
}: RiskIndexCellProps) => {
  const ari = selectedAudit.ariData?.[floor]?.[category] || '4A';
  return (
    <TableCell sx={{ p: '8px !important', verticalAlign: 'top' }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 0.5,
        minHeight: 'fit-content',
      }}>
        <Box>
          <Typography variant="caption" fontWeight="medium" color="text.secondary">
            PO (Probability of Occurrences)
          </Typography>
          <Select
            value={selectedAudit.probabilityData?.[floor]?.[category] || 5}
            onChange={e => updateAuditField('probabilityData', floor, category, e.target.value)}
            size="small"
            fullWidth
            sx={{
              height: '32px',
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.875rem',
                lineHeight: '1.2',
              },
            }}
          >
            <MenuItem value={5}>5 - Frequent</MenuItem>
            <MenuItem value={4}>4 - Likely</MenuItem>
            <MenuItem value={3}>3 - Occasional</MenuItem>
            <MenuItem value={2}>2 - Seldom</MenuItem>
            <MenuItem value={1}>1 - Improbable</MenuItem>
          </Select>
        </Box>
        <Box>
          <Typography variant="caption" fontWeight="medium" color="text.secondary">
            SO (Severity of Occurrences)
          </Typography>
          <Select
            value={selectedAudit.riskSeverityData?.[floor]?.[category] || 'A'}
            onChange={e => updateAuditField('riskSeverityData', floor, category, e.target.value)}
            size="small"
            fullWidth
            sx={{
              height: '32px',
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.875rem',
                lineHeight: '1.2',
              },
            }}
          >
            <MenuItem value="A">A - Catastrophic</MenuItem>
            <MenuItem value="B">B - Critical</MenuItem>
            <MenuItem value="C">C - Moderate</MenuItem>
            <MenuItem value="D">D - Minor</MenuItem>
            <MenuItem value="E">E - Negligible</MenuItem>
          </Select>
        </Box>
        <Box>
          <Typography variant="caption" fontWeight="medium" color="text.secondary">
            ARI (Assessment Risk Index)
          </Typography>
          <Select
            value={ari}
            onChange={e => updateAuditField('ariData', floor, category, e.target.value)}
            size="small"
            fullWidth
            sx={{
              height: '32px',
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.875rem',
                lineHeight: '1.2',
              },
            }}
          >
            {Object.keys(riskIndexMapping).map(key => (
              <MenuItem key={key} value={key}>{key}</MenuItem>
            ))}
          </Select>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              color: 'text.secondary',
              fontWeight: 'medium',
            }}
          >
            Value: {calculateValue(ari)}
          </Typography>
        </Box>
      </Box>
    </TableCell>
  );
});

interface CategoryRowProps {
  floor: string;
  category: string;
  index: number;
  selectedAudit: Audit;
  updateAuditField: (field: string, floor: string, category: string, value: any) => void;
  calculateValue: (ari: string) => number;
  tabIndex?: number;
  ariaLabel?: string;
  onDuplicateRow?: (floor: string, category: string) => void;
  onArchiveRow?: (floor: string, category: string) => void;
  onQuickComment?: (floor: string, category: string, comment: string) => void;
}

const CategoryRow = React.memo(({
  floor,
  category,
  index,
  selectedAudit,
  updateAuditField,
  calculateValue,
  tabIndex = -1,
  ariaLabel,
  onDuplicateRow,
  onArchiveRow,
  onQuickComment,
}: CategoryRowProps) => {
  const completed = selectedAudit.complianceData?.[floor]?.[category]?.completed || false;
  return (
    <TableRow sx={{ minHeight: '120px', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
      tabIndex={tabIndex}
      aria-label={ariaLabel || `Category row for ${category}`}
    >
      <TableCell align="center" sx={{ fontSize: '0.875rem', verticalAlign: 'top', pt: 2 }}>{index + 1}</TableCell>
      <TableCell sx={{ fontSize: '0.875rem', p: 1, verticalAlign: 'top', pt: 2 }}>{category}</TableCell>
      <TableCell sx={{ fontSize: '0.875rem', p: 1, verticalAlign: 'top', pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">Size of Wires</Typography>
          <Typography variant="body2">Protection</Typography>
          <Typography variant="body2">Electrical Outlet</Typography>
          <Typography variant="body2">Lighting</Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ fontSize: '0.875rem', p: 1, verticalAlign: 'top', pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">PEC Article 3.0</Typography>
          <Typography variant="body2">PEC Article 2.40</Typography>
          <Typography variant="body2">PEC Article 3.0.1.14-15</Typography>
          <Typography variant="body2">PEC Article 3.0</Typography>
        </Box>
      </TableCell>
      <TableCell align="center" sx={{ verticalAlign: 'top', pt: 2 }}>
        <Checkbox
          checked={completed}
          onChange={e => updateAuditField('complianceData', floor, category, { completed: e.target.checked })}
          sx={{ '& .MuiSvgIcon-root': { fontSize: '1.2rem' } }}
        />
      </TableCell>
      <RiskIndexCell
        floor={floor}
        category={category}
        selectedAudit={selectedAudit}
        updateAuditField={updateAuditField}
        calculateValue={calculateValue}
      />
    </TableRow>
  );
});

export default CategoryRow; 