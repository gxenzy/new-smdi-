import React from 'react';
import { TableCell, Box, Typography, Select, MenuItem } from '@mui/material';
import { Audit, riskIndexMapping } from './types';

interface RiskIndexCellProps {
  floor: string;
  category: string;
  selectedAudit: Audit;
  updateAuditField: (field: string, floor: string, category: string, value: any) => void;
  calculateValue: (ari: string) => number;
}

const RiskIndexCell: React.FC<RiskIndexCellProps> = ({ floor, category, selectedAudit, updateAuditField, calculateValue }) => {
  const ari = selectedAudit.ariData?.[floor]?.[category] || '4A';
  return (
    <TableCell sx={{ p: '8px !important', verticalAlign: 'top' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.5, minHeight: 'fit-content' }}>
        <Box>
          <Typography variant="caption" fontWeight="medium" color="text.secondary">
            PO (Probability of Occurrences)
          </Typography>
          <Select
            value={selectedAudit.probabilityData?.[floor]?.[category] || 5}
            onChange={e => updateAuditField('probabilityData', floor, category, e.target.value)}
            size="small"
            fullWidth
            sx={{ height: '32px', '& .MuiSelect-select': { py: 0.5, fontSize: '0.875rem', lineHeight: '1.2' } }}
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
            sx={{ height: '32px', '& .MuiSelect-select': { py: 0.5, fontSize: '0.875rem', lineHeight: '1.2' } }}
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
            sx={{ height: '32px', '& .MuiSelect-select': { py: 0.5, fontSize: '0.875rem', lineHeight: '1.2' } }}
          >
            {Object.keys(riskIndexMapping).map(key => (
              <MenuItem key={key} value={key}>{key}</MenuItem>
            ))}
          </Select>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary', fontWeight: 'medium' }}>
            Value: {calculateValue(ari)}
          </Typography>
        </Box>
      </Box>
    </TableCell>
  );
};

export default React.memo(RiskIndexCell); 