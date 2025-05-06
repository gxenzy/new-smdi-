import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import { FixedSizeList } from 'react-window';
import debounce from 'lodash.debounce';

const categories = {
  "Ground Floor": ["Registrar", "Guidance", "EDP", "Accounting"],
  "Mezzanine Floor": ["GSR 1", "GSR 2", "Research Hub", "Research & CARES Office", "M4", "M3", "M2", "M1", "Safety Office", "Cisco Lab. 2", "Cisco Lab. 3", "Building Maintenance", "Mezzanine Hallway"],
  "2nd Floor": ["Room 207", "Room 208", "Repair Room", "Cisco Lab. 1", "Room 211", "Room 212", "HRD Office", "Female CR", "2nd Floor Hallway"],
  "3rd Floor": ["Room 305", "Room 306", "Room 307", "Room 308", "Room 309", "Cisco Lab. 4", "Room 312", "Nursing Facility", "Nursing Skills Lab. 2", "Nursing Skills Lab. Extension Room", "Female CR", "3rd Floor Hallway"],
  "4th Floor": ["Room 403", "Room 404", "Room 405", "Room 406", "Room 407", "Room 408", "Room 409", "Cisco Lab. 5", "Faculty Room", "Library Extension", "Female CR", "4th Floor Hallway"],
  "5th Floor": ["Room 502", "Room 503", "Room 504", "Room 505", "Room 506", "Room 507", "Room 508", "Room 509", "Storage Room", "Electrical Room", "Male CR", "5th Floor Hallway"]
};

const conditions = "Size of Wires, Protection, Electrical Outlet, Lighting";
const referenceStandards = "PEC Article 3, PEC Article 2.40, PEC Article 3.0.1.14-15, PEC Article 3";

// Risk Assessment Criteria Data
const riskAssessmentData = {
  probability: [
    { definition: "Frequent", meaning: "Occurs many times and will continue unless action is taken to change the events.", range: 5 },
    { definition: "Likely", meaning: "Occurs sometimes (50-99% of the time) and follows normal patterns or procedures.", range: 4 },
    { definition: "Occasional", meaning: "Unlikely but possible, occurring 25-50% of the time.", range: 3 },
    { definition: "Seldom", meaning: "Very unlikely (1-25% of the time) and may not have occurred yet.", range: 2 },
    { definition: "Improbable", meaning: "A remote likelihood being almost inconceivable that event will occur.", range: 1 }
  ],
  severity: [
    { condition: "Catastrophic", meaning: "Destruction of electrical system equipment, multiple fatalities, significant environmental impact.", value: "A" },
    { condition: "Critical", meaning: "Significant safety reduction, serious injury or death, major equipment damage.", value: "B" },
    { condition: "Moderate", meaning: "Minor injuries, electrical facility damage, small environmental impact.", value: "C" },
    { condition: "Minor", meaning: "Minimal or no electrical equipment damage, no public relations or regulatory impact.", value: "D" },
    { condition: "Negligible", meaning: "No environmental, public relations, equipment, or operational impact.", value: "E" }
  ],
  riskSeverity: [
    { probability: 5, catastrophic: "5A", critical: "5B", moderate: "5C", minor: "5D", negligible: "5E" },
    { probability: 4, catastrophic: "4A", critical: "4B", moderate: "4C", minor: "4D", negligible: "4E" },
    { probability: 3, catastrophic: "3A", critical: "3B", moderate: "3C", minor: "3D", negligible: "3E" },
    { probability: 2, catastrophic: "2A", critical: "2B", moderate: "2C", minor: "2D", negligible: "2E" },
    { probability: 1, catastrophic: "1A", critical: "1B", moderate: "1C", minor: "1D", negligible: "1E" }
  ],
  assessmentRiskIndex: [
    { criteria: "5A, 5B, 5C, 4A, 4B, 3A", meaning: "Unacceptable under existing circumstances, requires immediate action", value: 4 },
    { criteria: "5D, 5E, 4C, 3B, 3C, 2A, 2B", meaning: "Manageable under risk control and mitigation", value: 3 },
    { criteria: "4D, 4E, 3D, 2C, 1A, 1B", meaning: "Acceptable under review of operation. Requires continued tracking and recorded action plans", value: 2 },
    { criteria: "3E, 2D, 2E, 1C, 1D, 1E", meaning: "Acceptable with continued data and trending for continuous improvement", value: 1 }
  ]
};

// Risk Index Mapping
const riskIndexMapping = {
  "5A": 4, "5B": 4, "5C": 4, "4A": 4, "4B": 4, "3A": 4,
  "5D": 3, "5E": 3, "4C": 3, "3B": 3, "3C": 3, "2A": 3, "2B": 3,
  "4D": 2, "4E": 2, "3D": 2, "2C": 2, "1A": 2, "1B": 2,
  "3E": 1, "2D": 1, "2E": 1, "1C": 1, "1D": 1, "1E": 1
};

const defaultAuditData = {
  complianceData: {},
  ariData: {},
  probabilityData: {},
  riskSeverityData: {},
  lastSaved: null,
};

const TableWrapper = React.memo(({ children }) => (
  <Box sx={{
    '@media print': {
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
      width: '100%'
    }
  }}>
    {children}
  </Box>
));

const PageBreakWrapper = React.memo(({ children }) => (
  <Box sx={{
    pageBreakAfter: 'always',
    breakAfter: 'always',
    '@media print': {
      marginBottom: '1cm',
      '&:last-child': {
        pageBreakAfter: 'avoid',
        breakAfter: 'avoid',
        marginBottom: 0
      }
    }
  }}>
    {children}
  </Box>
));

const RiskIndexCell = React.memo(({ floor, category, selectedAudit, updateAuditField, calculateValue }) => {
  const ari = selectedAudit.ariData?.[floor]?.[category] || "4A";
  return (
    <TableCell sx={{ p: '8px !important', verticalAlign: 'top' }}>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 0.5,
        minHeight: 'fit-content'
      }}>
        <Box>
          <Typography variant="caption" fontWeight="medium" color="text.secondary">
            PO (Probability of Occurrences)
          </Typography>
          <Select
            value={selectedAudit.probabilityData?.[floor]?.[category] || 5}
            onChange={(e) => updateAuditField('probabilityData', floor, category, e.target.value)}
            size="small"
            fullWidth
            sx={{ 
              height: '32px',
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.875rem',
                lineHeight: '1.2'
              }
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
            value={selectedAudit.riskSeverityData?.[floor]?.[category] || "A"}
            onChange={(e) => updateAuditField('riskSeverityData', floor, category, e.target.value)}
            size="small"
            fullWidth
            sx={{ 
              height: '32px',
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.875rem',
                lineHeight: '1.2'
              }
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
            onChange={(e) => updateAuditField('ariData', floor, category, e.target.value)}
            size="small"
            fullWidth
            sx={{ 
              height: '32px',
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.875rem',
                lineHeight: '1.2'
              }
            }}
          >
            {Object.keys(riskIndexMapping).map((key) => (
              <MenuItem key={key} value={key}>{key}</MenuItem>
            ))}
          </Select>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 0.5, 
              color: 'text.secondary',
              fontWeight: 'medium' 
            }}
          >
            Value: {calculateValue(ari)}
          </Typography>
        </Box>
      </Box>
    </TableCell>
  );
});

const CategoryRow = React.memo(({ floor, category, index, selectedAudit, updateAuditField, calculateValue }) => {
  const completed = selectedAudit.complianceData?.[floor]?.[category]?.completed || false;
  
  return (
    <TableRow sx={{ minHeight: '120px', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
      <TableCell align="center" sx={{ 
        fontSize: '0.875rem',
        verticalAlign: 'top',
        pt: 2
      }}>{index + 1}</TableCell>
      <TableCell sx={{ 
        fontSize: '0.875rem',
        p: 1,
        verticalAlign: 'top',
        pt: 2
      }}>{category}</TableCell>
      <TableCell sx={{ 
        fontSize: '0.875rem',
        p: 1,
        verticalAlign: 'top',
        pt: 2
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">Size of Wires</Typography>
          <Typography variant="body2">Protection</Typography>
          <Typography variant="body2">Electrical Outlet</Typography>
          <Typography variant="body2">Lighting</Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ 
        fontSize: '0.875rem',
        p: 1,
        verticalAlign: 'top',
        pt: 2
      }}>
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
          onChange={(e) =>
            updateAuditField('complianceData', floor, category, { completed: e.target.checked })
          }
          sx={{ 
            '& .MuiSvgIcon-root': { 
              fontSize: '1.2rem'
            }
          }}
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

  const VirtualizedTableBody = React.memo(({ items, itemSize, height, row: Row, ...rowProps }) => {
    return (
      <FixedSizeList
        height={height}
        itemCount={items.length}
        itemSize={itemSize}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style}>
            <Row
              {...rowProps}
              index={index}
              category={items[index]}
            />
          </div>
        )}
      </FixedSizeList>
    );
  });

const FloorTable = React.memo(({ floor, selectedAudit, updateAuditField, calculateValue }) => {
  return (
    <PageBreakWrapper>
    <Paper elevation={2} sx={{ 
      mb: 3,
      overflow: 'visible',
      '@media print': {
        boxShadow: 'none',
        border: 'none',
        marginBottom: '20px',
        breakInside: 'avoid',
        pageBreakInside: 'avoid'
      }
    }}>
        <Box sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <Typography
            variant="h6"
            align="center"
            fontWeight="bold"
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText', 
              py: 1.5,
              px: 2
            }}
          >
            Assessment of Old Building {floor}
          </Typography>
        </Box>

        <TableContainer sx={{ 
          overflow: 'visible',
          '@media print': {
            overflow: 'visible',
            border: 'none !important',
            boxShadow: 'none !important',
            padding: 0,
            margin: 0
          }
        }}>
          <Table size="small" sx={{ 
            width: '100%',
            tableLayout: 'auto',  // Changed from 'fixed' to 'auto' to prevent text merging and improve column width handling
            '& td, & th': {
              border: '1px solid rgba(224, 224, 224, 1)',
              whiteSpace: 'normal', // Allow text to wrap instead of merging
              wordBreak: 'break-word', // Break long words to prevent overflow
              textAlign: 'center', // Center text in all cells
              overflowWrap: 'break-word', // Ensure long words break properly
              overflow: 'visible' // Allow overflow to be visible to prevent clipping
            },
            '& .MuiTableCell-root': {
              px: 1,
              py: 0.75,
              fontSize: '0.875rem',
              textAlign: 'center', // Center text in all cells
              overflowWrap: 'break-word',
              overflow: 'visible'
            }
          }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: 'auto' }} />  {/* Changed fixed % widths to auto for better flexibility */}
              <col style={{ width: 'auto' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '220px' }} />
            </colgroup>
            <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }}>Item No.</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }}>Category</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }}>Conditions</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }}>Reference Standards</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }}>Completed</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }}>Risk Index</TableCell>
            </TableRow>
            </TableHead>
    <TableBody>
      {categories[floor].map((category, index) => (
        <CategoryRow
          key={category}
          floor={floor}
          category={category}
          index={index}
          selectedAudit={selectedAudit}
          updateAuditField={updateAuditField}
          calculateValue={calculateValue}
          sx={{ textAlign: 'center' }}
        />
      ))}
    </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </PageBreakWrapper>
  );
});

const DebouncedTextField = React.memo(({ value, onChange, ...props }) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const debouncedUpdate = useMemo(
    () => debounce((val) => onChange(val), 150),
    [onChange]
  );

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    debouncedUpdate(newValue);
  }, [debouncedUpdate]);

  return (
    <TextField
      {...props}
      value={internalValue}
      onChange={handleChange}
    />
  );
});

const StandardTable = React.memo(({ standard, selectedAudit, updateAuditField, calculatePercentage }) => (
  <TableWrapper>
    <Paper elevation={2} sx={{ 
      mb: 3,
      '@media print': {
        boxShadow: 'none',
        border: 'none',
        marginBottom: '20px'
      }
    }}>
      <Box sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        <Typography
          variant="h6"
          align="center"
          fontWeight="bold"
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText', 
            py: 1.5,
            px: 2
          }}
        >
          Standard Compliance per Floor for {standard}
        </Typography>
      </Box>

      <TableContainer sx={{ overflow: 'visible' }}>
        <Table size="small" sx={{ 
          width: '100%',
          tableLayout: 'fixed',
          '& td, & th': {
            border: '1px solid rgba(224, 224, 224, 1)',
          }
        }}>
          <colgroup>
            <col style={{ width: '25%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '25%' }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell>FLOOR</TableCell>
              <TableCell>COMPLIED</TableCell>
              <TableCell>NON COMPLIANT</TableCell>
              <TableCell>PERCENTAGE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(categories).map((floor, floorIndex) => (
              <TableRow key={floorIndex} hover>
                <TableCell>{floor}</TableCell>
                <TableCell>
                  <DebouncedTextField
                    type="number"
                    placeholder="Complied"
                    value={selectedAudit.complianceData?.[floor]?.[standard]?.complied || ''}
                    onChange={(value) => {
                      const complied = parseInt(value) || 0;
                      updateAuditField('complianceData', floor, standard, { 
                        ...selectedAudit.complianceData?.[floor]?.[standard], 
                        complied 
                      });
                    }}
                    size="small"
                    inputProps={{ min: 0 }}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <DebouncedTextField
                    type="number"
                    placeholder="Non Compliant"
                    value={selectedAudit.complianceData?.[floor]?.[standard]?.nonCompliant || ''}
                    onChange={(value) => {
                      const nonCompliant = parseInt(value) || 0;
                      updateAuditField('complianceData', floor, standard, { 
                        ...selectedAudit.complianceData?.[floor]?.[standard], 
                        nonCompliant 
                      });
                    }}
                    size="small"
                    inputProps={{ min: 0 }}
                    fullWidth
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {calculatePercentage([
                    selectedAudit.complianceData?.[floor]?.[standard]?.complied || 0,
                    selectedAudit.complianceData?.[floor]?.[standard]?.nonCompliant || 0
                  ]).map((percentage, idx) => (
                    <span key={idx}>
                      {percentage}%
                      {idx < 1 && ' / '}
                    </span>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </TableWrapper>
));

const OptimizedInput = React.memo(({ label, value, onChange, multiline = false, rows = 1, className }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const textareaRef = useRef(null);
  
  const debouncedUpdate = useMemo(
    () => debounce((val) => onChange && onChange(val), 200),
    [onChange]
  );

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedUpdate(newValue);
    
    // Adjust height for textarea
    if (multiline && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [debouncedUpdate, multiline]);

  return (
    <Box sx={{ width: '100%' }} className={className}>
      <Typography variant="subtitle2" fontWeight="bold">{label}</Typography>
      <TextField
        value={localValue}
        onChange={handleChange}
        multiline={multiline}
        minRows={rows}
        inputRef={textareaRef}
        fullWidth
        inputProps={{
          style: {
            resize: 'none',
          }
        }}
        sx={{
          width: '100%',
          display: 'block',
          '& .MuiInputBase-root': {
            padding: '8px',
            backgroundColor: 'white',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
            height: 'auto',
            minHeight: multiline ? `${rows * 1.5}em` : 'auto'
          },
          '& .MuiInputBase-input': {
            fontSize: '14px',
            lineHeight: '1.5',
            overflow: 'hidden',
            width: '100%',
            '@media print': {
              position: 'static !important',
              overflow: 'visible !important',
              whiteSpace: 'pre-wrap !important',
              wordBreak: 'break-word !important',
              width: '100% !important',
              height: 'auto !important',
              minHeight: multiline ? '120px' : 'auto',
              fontSize: '12pt !important',
              lineHeight: '1.5 !important',
              pageBreakInside: 'auto !important',
              breakInside: 'auto !important'
            }
          },
          '@media print': {
            '& .MuiInputBase-root': {
              position: 'relative !important',
              display: 'block !important',
              width: '100% !important',
              height: 'auto !important',
              minHeight: multiline ? '120px' : 'auto',
              padding: '12px !important',
              border: '1px solid rgba(0, 0, 0, 0.23) !important',
              pageBreakInside: 'auto !important',
              breakInside: 'auto !important',
              boxSizing: 'border-box !important'
            }
          }
        }}
      />
    </Box>
  );
});

const IntroductionSection = React.memo(({ selectedAudit, updateAuditField }) => {
  return (
    <Box sx={{ 
      p: 3, 
      display: 'grid', 
      gap: 3,
      '@media print': {
        padding: '16px',
        width: '100%',
        maxWidth: '210mm',
        margin: '0 auto'
      }
    }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3,
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto'
      }}>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">Date</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DesktopDatePicker
              inputFormat="MM/dd/yyyy"
              value={selectedAudit.date ? new Date(selectedAudit.date) : null}
              onChange={(newValue) => {
                if (newValue instanceof Date && !isNaN(newValue.getTime())) {
                  updateAuditField('date', '', '', newValue.toISOString());
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{ 
                    '& .MuiInputBase-root': {
                      backgroundColor: 'white',
                      height: '32px'
                    }
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Box>

        <OptimizedInput
          label="Inspector"
          value={selectedAudit.inspector || ''}
          onChange={(value) => updateAuditField('inspector', '', '', value)}
          multiline
          rows={2}
          className="print-inspector"
        />

        <OptimizedInput
          label="Location"
          value={selectedAudit.location || ''}
          onChange={(value) => updateAuditField('location', '', '', value)}
          multiline
          rows={2}
          className="print-location"
        />
      </Box>

      <Box sx={{ 
        maxWidth: '210mm',
        width: '100%',
        margin: '0 auto',
        '@media print': {
          width: '100%',
          maxWidth: '100%',
          pageBreakInside: 'auto',
          breakInside: 'auto'
        }
      }}>
        <Box className="print-comments-wrapper" sx={{
          '@media print': {
            width: '100%',
            position: 'relative',
            pageBreakInside: 'auto',
            breakInside: 'auto',
            display: 'block'
          }
        }}>
          <OptimizedInput
            label="Comments"
            value={selectedAudit.comments || ''}
            onChange={(value) => updateAuditField('comments', '', '', value)}
            multiline
            rows={6}
            className="print-comments"
          />
        </Box>
      </Box>
    </Box>
  );
});

const ContentHeader = React.memo(() => (
  <Box sx={{
    position: 'sticky',
    top: 0,
    zIndex: 1,
    bgcolor: 'white',
    borderBottom: '1px solid',
    borderColor: 'divider',
    mb: 2,
    '@media print': {
      display: 'none'
    }
  }}>
    <Typography 
      variant="h5" 
      align="center" 
      fontWeight="bold" 
      sx={{ 
        py: 2,
        color: 'primary.main'
      }}
    >
      ELECTRICAL AUDIT CHECKLIST
    </Typography>
  </Box>
));

const EnergyAuditTables = React.memo(() => {
  const [audits, setAudits] = useState(() => {
    const saved = localStorage.getItem('energyAudits');
    if (saved) {
      return JSON.parse(saved);
    } else {
      return [{
        id: Date.now(),
        name: 'Audit 1',
        complianceData: {},
        ariData: {},
        probabilityData: {},
        riskSeverityData: {},
        lastSaved: null,
      }];
    }
  });
  const [selectedAuditId, setSelectedAuditId] = useState(() => {
    const saved = localStorage.getItem('energyAudits');
    if (saved) {
      const audits = JSON.parse(saved);
      return audits.length > 0 ? audits[0].id : null;
    } else {
      return null;
    }
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('energyAudits', JSON.stringify(audits));
  }, [audits]);

  const selectedAudit = audits.find(audit => audit.id === selectedAuditId);

  const createNewAudit = useCallback(() => {
    const newAudit = {
      id: Date.now(),
      name: `Audit ${audits.length + 1}`,
      ...defaultAuditData,
    };
    setAudits(prev => [...prev, newAudit]);
    setSelectedAuditId(newAudit.id);
  }, [audits.length]);

  const deleteAudit = useCallback((id) => {
    setAudits(prev => {
      const filtered = prev.filter(audit => audit.id !== id);
      if (filtered.length > 0) {
        setSelectedAuditId(filtered[0].id);
      } else {
        setSelectedAuditId(null);
      }
      return filtered;
    });
  }, []);

  const updateAuditField = useCallback((field, floor, standard, value) => {
    setAudits(prev =>
      prev.map(audit => {
        if (audit.id !== selectedAuditId) return audit;
        const updatedAudit = { ...audit };
        if (field === 'date' || field === 'inspector' || field === 'location' || field === 'comments') {
          updatedAudit[field] = value;
        } else {
          if (!updatedAudit[field]) updatedAudit[field] = {};
          if (!updatedAudit[field][floor]) updatedAudit[field][floor] = {};
          updatedAudit[field][floor][standard] = value;
        }
        return updatedAudit;
      })
    );
  }, [selectedAuditId]);

  const calculatePercentage = useCallback((values) => {
    if (!Array.isArray(values)) {
      return [0, 0, 0, 0, 0];
    }
    const total = values.reduce((acc, val) => acc + (parseInt(val) || 0), 0);
    return values.map(val => total > 0 ? ((parseInt(val) || 0) / total * 100).toFixed(2) : 0);
  }, []);

  const calculateValue = useCallback((ari) => {
    return riskIndexMapping[ari] || 0;
  }, []);

  const saveCurrentAudit = useCallback(() => {
    setAudits(prev =>
      prev.map(audit =>
        audit.id === selectedAuditId ? { ...audit, lastSaved: new Date().toLocaleString() } : audit
      )
    );
    setSnackbarOpen(true);
  }, [selectedAuditId]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handlePrint = useCallback(() => {
    const content = printRef.current;
    if (!content) return;
    
    const originalOverflow = document.body.style.overflow;
    const originalHeight = content.style.height;
    
    requestAnimationFrame(() => {
      document.body.style.overflow = 'visible';
      content.style.height = 'auto';
      
      window.print();
      
      requestAnimationFrame(() => {
        document.body.style.overflow = originalOverflow;
        content.style.height = originalHeight;
      });
    });
  }, []);

  const floorTables = useMemo(() => (
    Object.keys(categories).map((floor) => (
      <FloorTable
        key={floor}
        floor={floor}
        selectedAudit={selectedAudit}
        updateAuditField={updateAuditField}
        calculateValue={calculateValue}
      />
    ))
  ), [selectedAudit, updateAuditField, calculateValue]);

  const standardTables = useMemo(() => (
    ["Size of Wires", "Protection", "Electrical Outlets", "Lighting"].map((standard, index) => (
      <StandardTable
        key={index}
        standard={standard}
        selectedAudit={selectedAudit}
        updateAuditField={updateAuditField}
        calculatePercentage={calculatePercentage}
      />
    ))
  ), [selectedAudit, updateAuditField, calculatePercentage]);

  return (
    <Paper elevation={3} sx={{ 
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      height: '100vh',
      overflow: 'hidden',
      bgcolor: '#f5f5f5',
      '@media print': {
        display: 'block',
        height: 'auto',
        overflow: 'visible',
        bgcolor: 'white'
      }
    }}>
      <Box className="no-print" sx={{ 
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'white',
        p: 2,
        '@media print': {
          display: 'none'
        }
      }}>
        <Typography variant="h6" gutterBottom>
          Audits
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={createNewAudit}
          fullWidth
          sx={{ mb: 2 }}
        >
          Create New Audit
        </Button>
        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {audits.map((audit) => (
            <ListItem
              button
              key={audit.id}
              selected={audit.id === selectedAuditId}
              onClick={() => setSelectedAuditId(audit.id)}
              secondaryAction={
                <Tooltip title="Delete Audit">
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAudit(audit.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemText
                primary={audit.name}
                secondary={audit.lastSaved ? `Last saved: ${audit.lastSaved}` : ''}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveCurrentAudit}
            sx={{ flexGrow: 1, mr: 1 }}
          >
            Save Current Audit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ flexGrow: 1, ml: 1 }}
          >
            Print
          </Button>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        '@media print': {
          height: 'auto'
        }
      }}>
        <Box sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          '@media print': {
            display: 'none'
          }
        }}>
          {/* Removed duplicate "ELECTRICAL AUDIT CHECKLIST" header as per user request */}
        </Box>

        <Box 
          ref={printRef} 
          sx={{ 
            flex: 1,
            p: 3,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.25)',
              },
            },
            '@media print': {
              overflow: 'visible',
              height: 'auto',
              padding: 0
            }
          }}
        >
          {selectedAudit ? (
            <>
              <PageBreakWrapper>
                <Paper elevation={2} sx={{ 
                  mb: 3,
                  bgcolor: 'white',
                  border: '1px solid #ddd',
                  overflow: 'visible',
                  '@media print': {
                    backgroundColor: 'white !important',
                    boxShadow: 'none !important',
                    border: '1px solid #000 !important',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    marginBottom: '1cm',
                    '& .MuiInputBase-root': {
                      height: 'auto !important',
                      minHeight: 'unset !important'
                    },
                    '& .print-comments .MuiInputBase-root': {
                      minHeight: '120px !important',
                    },
                    '& textarea': {
                      whiteSpace: 'pre-wrap !important',
                      wordBreak: 'break-word !important',
                      overflow: 'visible !important',
                      height: 'auto !important'
                    }
                  }
                }}>
                  <Typography 
                    variant="h5" 
                    align="center" 
                    fontWeight="bold" 
                    sx={{ 
                      bgcolor: 'primary.dark', 
                      color: 'primary.contrastText', 
                      py: 2,
                      px: 3,
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }}
                  >
                    ELECTRICAL AUDIT CHECKLIST
                  </Typography>
                  <IntroductionSection 
                    selectedAudit={selectedAudit}
                    updateAuditField={updateAuditField}
                  />
                </Paper>
              </PageBreakWrapper>

              {floorTables}
              {standardTables}
            </>
          ) : (
            <Typography>Select or create an audit to begin.</Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
});

export default EnergyAuditTables;
