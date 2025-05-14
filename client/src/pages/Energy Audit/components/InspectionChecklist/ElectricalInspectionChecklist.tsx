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

// Electrical inspection checklist based on PEC 2017
const electricalChecklistData: Omit<ChecklistItem, 'completed' | 'notes' | 'evidence' | 'evidenceUrl'>[] = [
  // General
  {
    id: 'elec-gen-1',
    category: 'General',
    item: 'Verify electrical equipment is properly identified and labeled.',
    reference: 'PEC 2017 Section 2.20.6',
    explanation: 'All electrical equipment must be marked with manufacturer\'s name, trademark, or other descriptive marking.',
  },
  {
    id: 'elec-gen-2',
    category: 'General',
    item: 'Check that all electrical equipment is accessible for inspection and maintenance.',
    reference: 'PEC 2017 Section 2.10.1',
    explanation: 'Sufficient access and working space must be provided and maintained around all electrical equipment.',
  },
  {
    id: 'elec-gen-3',
    category: 'General',
    item: 'Verify proper grounding of electrical system.',
    reference: 'PEC 2017 Section 5.0',
    explanation: 'Grounding is essential for safety and proper operation of electrical systems.',
  },
  
  // Distribution Panels
  {
    id: 'elec-panel-1',
    category: 'Distribution Panels',
    item: 'Check panel directory/circuit identification is accurate and up-to-date.',
    reference: 'PEC 2017 Section 2.20.10',
    explanation: 'Circuit directories must identify the purpose of each circuit and be located at each panel.',
  },
  {
    id: 'elec-panel-2',
    category: 'Distribution Panels',
    item: 'Verify minimum working clearances around panels (30" width, 36" depth).',
    reference: 'PEC 2017 Section 2.10.2',
    explanation: 'Working space must permit safe operation and maintenance of electrical equipment.',
  },
  {
    id: 'elec-panel-3',
    category: 'Distribution Panels',
    item: 'Check for proper panel cover and no openings exposing live parts.',
    reference: 'PEC 2017 Section 2.20.4',
    explanation: 'Enclosures must be constructed to protect personnel from accidental contact with live parts.',
  },
  
  // Wiring Methods
  {
    id: 'elec-wiring-1',
    category: 'Wiring Methods',
    item: 'Inspect for proper support and securing of cables and raceways.',
    reference: 'PEC 2017 Section 3.0',
    explanation: 'Cables and raceways must be securely fastened in place and properly supported.',
  },
  {
    id: 'elec-wiring-2',
    category: 'Wiring Methods',
    item: 'Check for proper wire size and type for the application.',
    reference: 'PEC 2017 Section 3.10',
    explanation: 'Conductors must be sized appropriately for the load and application.',
  },
  {
    id: 'elec-wiring-3',
    category: 'Wiring Methods',
    item: 'Verify proper color coding of conductors.',
    reference: 'PEC 2017 Section 3.10.5.1',
    explanation: 'Grounded conductors must be identified by white or gray color, grounding by green or bare, ungrounded by other colors.',
  },
  
  // Lighting
  {
    id: 'elec-light-1',
    category: 'Lighting',
    item: 'Check that all lighting fixtures are securely mounted.',
    reference: 'PEC 2017 Section 5.20.1',
    explanation: 'Fixtures must be securely supported and not dependent on the supply wires for support.',
  },
  {
    id: 'elec-light-2',
    category: 'Lighting',
    item: 'Verify emergency lighting is present and functional in required areas.',
    reference: 'PEC 2017 Section 7.05',
    explanation: 'Emergency lighting is required for exits, stairways, and other critical areas.',
  },
  {
    id: 'elec-light-3',
    category: 'Lighting',
    item: 'Check for proper clearance of recessed lighting from combustible materials.',
    reference: 'PEC 2017 Section 5.20.7',
    explanation: 'Recessed fixtures must have proper clearance from combustible materials unless rated for direct contact.',
  },
  
  // Receptacles
  {
    id: 'elec-recep-1',
    category: 'Receptacles',
    item: 'Verify GFCI protection in required locations (bathrooms, kitchens, outdoors).',
    reference: 'PEC 2017 Section 2.10.8',
    explanation: 'GFCI protection is required in locations where water may be present to prevent shock hazards.',
  },
  {
    id: 'elec-recep-2',
    category: 'Receptacles',
    item: 'Check for proper grounding of receptacles.',
    reference: 'PEC 2017 Section 5.06.4',
    explanation: 'Receptacles with grounding contacts must be connected to an equipment grounding conductor.',
  },
  {
    id: 'elec-recep-3',
    category: 'Receptacles',
    item: 'Verify receptacles are not damaged or showing signs of overheating.',
    reference: 'PEC 2017 Section 2.20.3',
    explanation: 'Damaged receptacles can cause shock hazards and should be replaced.',
  },
];

const ElectricalInspectionChecklist: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    electricalChecklistData.map(item => ({
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
  const categories = Array.from(new Set(checklist.map(item => item.category))) as string[];
  
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
    doc.text('Electrical Inspection Checklist', 14, 20);
    
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
    
    doc.save('electrical_inspection_checklist.pdf');
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
    saveAs(blob, 'electrical_inspection_checklist.csv');
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
        <Typography variant="h4" gutterBottom>Electrical Inspection Checklist</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Based on Philippine Electrical Code (PEC) 2017
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="body1" gutterBottom>
            This checklist provides a comprehensive guide for inspecting electrical systems in educational facilities.
            Each item includes a reference to the relevant section of the Philippine Electrical Code (PEC) 2017 and an explanation
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

export default ElectricalInspectionChecklist; 