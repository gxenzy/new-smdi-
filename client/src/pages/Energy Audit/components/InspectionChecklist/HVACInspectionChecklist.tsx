import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
  Tooltip,
  IconButton,
  Grid,
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

// Define checklist item type
interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  reference: string;
  explanation: string;
  completed: boolean;
  notes: string;
  evidence: File | null;
  evidenceUrl: string;
}

// HVAC inspection checklist based on PEC 2017 and ASHRAE standards
const hvacChecklistData: Omit<ChecklistItem, 'completed' | 'notes' | 'evidence' | 'evidenceUrl'>[] = [
  // General HVAC
  {
    id: 'hvac-gen-1',
    category: 'General',
    item: 'Verify HVAC equipment is properly labeled and identified.',
    reference: 'ASHRAE 15',
    explanation: 'All HVAC equipment must be marked with manufacturer\'s name, model number, and other identifying information.',
  },
  {
    id: 'hvac-gen-2',
    category: 'General',
    item: 'Check that all HVAC equipment is accessible for inspection and maintenance.',
    reference: 'ASHRAE 62.1',
    explanation: 'Sufficient access and working space must be provided around all HVAC equipment for maintenance.',
  },
  {
    id: 'hvac-gen-3',
    category: 'General',
    item: 'Verify proper electrical connections and grounding of HVAC systems.',
    reference: 'PEC 2017 Section 5.0',
    explanation: 'Proper grounding is essential for safety and operation of HVAC electrical systems.',
  },
  
  // Air Conditioning Units
  {
    id: 'hvac-ac-1',
    category: 'Air Conditioning',
    item: 'Check condenser and evaporator coils for cleanliness and damage.',
    reference: 'ASHRAE 180',
    explanation: 'Dirty or damaged coils reduce efficiency and cooling capacity.',
  },
  {
    id: 'hvac-ac-2',
    category: 'Air Conditioning',
    item: 'Verify refrigerant pressure is within manufacturer specifications.',
    reference: 'ASHRAE 15',
    explanation: 'Incorrect refrigerant pressure can indicate leaks or system problems.',
  },
  {
    id: 'hvac-ac-3',
    category: 'Air Conditioning',
    item: 'Check for proper condensate drainage and trap installation.',
    reference: 'ASHRAE 62.1',
    explanation: 'Improper drainage can lead to water damage and poor indoor air quality.',
  },
  {
    id: 'hvac-ac-4',
    category: 'Air Conditioning',
    item: 'Measure and record supply air temperature (should be 10-15°C).',
    reference: 'ASHRAE 55',
    explanation: 'Supply air temperature should be within design parameters for proper cooling.',
  },
  
  // Ventilation
  {
    id: 'hvac-vent-1',
    category: 'Ventilation',
    item: 'Check that outdoor air intakes are clean and unobstructed.',
    reference: 'ASHRAE 62.1',
    explanation: 'Blocked intakes reduce ventilation effectiveness and system efficiency.',
  },
  {
    id: 'hvac-vent-2',
    category: 'Ventilation',
    item: 'Verify that exhaust outlets are properly located away from air intakes.',
    reference: 'ASHRAE 62.1',
    explanation: 'Exhaust air should not be recirculated into the building through air intakes.',
  },
  {
    id: 'hvac-vent-3',
    category: 'Ventilation',
    item: 'Check that ventilation rates meet minimum requirements for occupancy.',
    reference: 'ASHRAE 62.1',
    explanation: 'Minimum ventilation rates are required based on space type and occupancy.',
  },
  
  // Controls & Efficiency
  {
    id: 'hvac-ctrl-1',
    category: 'Controls',
    item: 'Verify thermostat operation and calibration.',
    reference: 'ASHRAE 90.1',
    explanation: 'Thermostats should be properly calibrated for accurate temperature control.',
  },
  {
    id: 'hvac-ctrl-2',
    category: 'Controls',
    item: 'Check for programmable setback schedules during unoccupied hours.',
    reference: 'ASHRAE 90.1',
    explanation: 'Temperature setbacks during unoccupied periods save energy.',
  },
  {
    id: 'hvac-ctrl-3',
    category: 'Controls',
    item: 'Verify economizer operation if applicable.',
    reference: 'ASHRAE 90.1',
    explanation: 'Economizers should use outdoor air for cooling when conditions are favorable.',
  },
  
  // Maintenance
  {
    id: 'hvac-maint-1',
    category: 'Maintenance',
    item: 'Check air filters for cleanliness and proper installation.',
    reference: 'ASHRAE 180',
    explanation: 'Dirty filters restrict airflow and reduce system efficiency.',
  },
  {
    id: 'hvac-maint-2',
    category: 'Maintenance',
    item: 'Verify belt tension and condition on belt-driven equipment.',
    reference: 'ASHRAE 180',
    explanation: 'Loose or damaged belts reduce efficiency and can cause equipment failure.',
  },
  {
    id: 'hvac-maint-3',
    category: 'Maintenance',
    item: 'Check for unusual noise, vibration, or odors during operation.',
    reference: 'ASHRAE 180',
    explanation: 'Abnormal operation can indicate mechanical problems or maintenance needs.',
  },
];

const HVACInspectionChecklist: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    hvacChecklistData.map(item => ({
      ...item,
      completed: false,
      notes: '',
      evidence: null,
      evidenceUrl: '',
    }))
  );
  
  const [filter, setFilter] = useState<string>('all');
  
  // Calculate completion statistics
  const totalItems = checklist.length;
  const completedItems = checklist.filter(item => item.completed).length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  
  // Group items by category
  const categories = Array.from(new Set(checklist.map(item => item.category)));
  
  const handleToggleComplete = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };
  
  const handleNoteChange = (id: string, value: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, notes: value } : item
    ));
  };
  
  const handleEvidenceUpload = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, evidence: file, evidenceUrl: url } : item
    ));
  };
  
  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HVAC Inspection Checklist', 14, 20);
    
    // Add summary
    doc.setFontSize(12);
    doc.text(`Completion: ${completedItems}/${totalItems} items (${completionPercentage.toFixed(1)}%)`, 14, 30);
    
    // Add date and inspector
    const today = new Date().toLocaleDateString();
    doc.text(`Date: ${today}`, 14, 40);
    doc.text(`Inspector: ________________`, 14, 50);
    
    // Add checklist table
    (doc as any).autoTable({
      head: [['Category', 'Item', 'Reference', 'Status', 'Notes']],
      body: checklist.map(item => [
        item.category,
        item.item,
        item.reference,
        item.completed ? '✓' : '✗',
        item.notes || '-',
      ]),
      startY: 60,
      styles: { cellWidth: 'wrap', fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 1: { cellWidth: 80 } },
    });
    
    doc.save('hvac_inspection_checklist.pdf');
  };
  
  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Category', 'Item', 'Reference', 'Completed', 'Notes'];
    const rows = checklist.map(item => [
      item.category,
      item.item.replace(/\n/g, ' '),
      item.reference,
      item.completed ? 'Yes' : 'No',
      item.notes.replace(/\n/g, ' ') || '',
    ]);
    
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'hvac_inspection_checklist.csv');
  };
  
  const filteredChecklist = filter === 'all' 
    ? checklist 
    : filter === 'completed' 
      ? checklist.filter(item => item.completed)
      : filter === 'incomplete'
        ? checklist.filter(item => !item.completed)
        : checklist.filter(item => item.category === filter);
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>HVAC Inspection Checklist</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Based on ASHRAE Standards and PEC 2017
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="body1" gutterBottom>
            This checklist provides a comprehensive guide for inspecting HVAC systems in educational facilities.
            Each item includes a reference to relevant ASHRAE standards or Philippine Electrical Code (PEC) 2017 and an explanation
            to help understand the importance of the requirement.
          </Typography>
        </Box>
        
        {/* Progress Summary */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', mb: 3 }}>
          <Typography variant="h6" gutterBottom>Inspection Progress</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {completedItems}/{totalItems} ({completionPercentage.toFixed(1)}%)
            </Typography>
          </Box>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {categories.map(category => {
              const categoryItems = checklist.filter(item => item.category === category);
              const categoryCompleted = categoryItems.filter(item => item.completed).length;
              const categoryPercentage = (categoryCompleted / categoryItems.length) * 100;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2">{category}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={categoryPercentage} 
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Typography variant="caption">
                          {categoryCompleted}/{categoryItems.length}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
        
        {/* Filter Controls */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button 
            variant={filter === 'all' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('all')}
            size="small"
          >
            All
          </Button>
          <Button 
            variant={filter === 'completed' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('completed')}
            size="small"
            color="success"
          >
            Completed
          </Button>
          <Button 
            variant={filter === 'incomplete' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('incomplete')}
            size="small"
            color="error"
          >
            Incomplete
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          {categories.map(category => (
            <Button 
              key={category}
              variant={filter === category ? 'contained' : 'outlined'} 
              onClick={() => setFilter(category)}
              size="small"
            >
              {category}
            </Button>
          ))}
        </Box>
        
        {/* Export Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<PictureAsPdfIcon />}
            onClick={exportToPDF}
          >
            Export to PDF
          </Button>
          <Button 
            variant="outlined"
            onClick={exportToCSV}
          >
            Export to CSV
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Checklist Items */}
        {filteredChecklist.length === 0 ? (
          <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
            No items match the selected filter.
          </Typography>
        ) : (
          filteredChecklist.map(item => (
            <Paper 
              key={item.id} 
              elevation={1} 
              sx={{ 
                mb: 3, 
                p: 2, 
                borderLeft: '5px solid',
                borderColor: item.completed ? 'success.main' : 'grey.300',
                bgcolor: item.completed ? '#f0f7f0' : '#fff'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={item.completed} 
                      onChange={() => handleToggleComplete(item.id)}
                    />
                  }
                  label=""
                />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      {item.item}
                    </Typography>
                    <Tooltip title={item.explanation} placement="top">
                      <IconButton size="small" color="info">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                      Category: {item.category}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reference: {item.reference}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ pl: 4 }}>
                <TextField
                  label="Notes"
                  value={item.notes}
                  onChange={(e) => handleNoteChange(item.id, e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  size="small"
                  placeholder="Add your observations or findings here..."
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileUploadIcon />}
                    component="label"
                  >
                    Upload Evidence
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleEvidenceUpload(item.id, e.target.files[0]);
                        }
                      }}
                    />
                  </Button>
                  
                  {item.evidenceUrl && (
                    <Button
                      size="small"
                      variant="text"
                      component="a"
                      href={item.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Evidence
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default HVACInspectionChecklist; 