import React, { useState } from 'react';
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
    Alert
} from '@mui/material';

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

const EnergyAudit = () => {
    // State to hold complied and non-compliant counts for each floor and each standard
    const [complianceData, setComplianceData] = useState({});
    const [ariData, setAriData] = useState({});
    const [probabilityData, setProbabilityData] = useState({});
    const [riskSeverityData, setRiskSeverityData] = useState({});
    const [lastSaved, setLastSaved] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleCompliedChange = (floor, standard, value) => {
        setComplianceData(prev => ({
            ...prev,
            [floor]: {
                ...prev[floor],
                [standard]: {
                    ...prev[floor]?.[standard],
                    complied: value,
                }
            }
        }));
    };

    const handleNonCompliantChange = (floor, standard, value) => {
        setComplianceData(prev => ({
            ...prev,
            [floor]: {
                ...prev[floor],
                [standard]: {
                    ...prev[floor]?.[standard],
                    nonCompliant: value,
                }
            }
        }));
    };

    const handleAriChange = (floor, standard, value) => {
        setAriData(prev => ({
            ...prev,
            [floor]: {
                ...prev[floor],
                [standard]: value,
            }
        }));
    };

    const calculatePercentage = (values) => {
        if (!Array.isArray(values)) {
            return [0, 0, 0, 0, 0];
        }
        const total = values.reduce((acc, val) => acc + (parseInt(val) || 0), 0);
        return values.map(val => total > 0 ? ((parseInt(val) || 0) / total * 100).toFixed(2) : 0);
    };

    const calculateValue = (ari) => {
        return riskIndexMapping[ari] || 0;
    };

    const saveData = () => {
        const dataToSave = {
            complianceData,
            ariData,
            probabilityData,
            riskSeverityData,
            lastSaved: new Date().toLocaleString()
        };
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'energy_audit_data.json';
        a.click();
        URL.revokeObjectURL(url);
        setLastSaved(new Date().toLocaleString());
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ p: 3 }}>
       

            {/* Introduction Section */}
            <div className="border border-gray-400 p-4">
                <h1 className="text-center text-xl font-bold">ELECTRICAL AUDIT CHECKLIST</h1>
                <h2 className="text-center text-lg font-bold mt-4">Introduction</h2>
                <div className="mt-4">
                    <div className="flex justify-between">
                        <span>Date: ____________________</span>
                        <span>Inspector: ____________________</span>
                    </div>
                    <div className="mt-2">Location: ____________________</div>
                    <div className="mt-2">Comments: ____________________</div>
                </div>
            </div>

            {/* Assessment of Old Building */}
            {Object.keys(categories).map((floor, floorIndex) => (
                <React.Fragment key={floorIndex}>
                    <div className="border border-gray-400 mt-8">
                        <div className="bg-gray-800 text-white p-2">
                            <h3 className="text-center font-bold">Assessment of Old Building {floor}</h3>
                        </div>
                        <TableContainer>
                            <Table className="w-full border-collapse">
                                <TableHead>
                                    <TableRow className="bg-gray-800 text-white">
                                        <TableCell className="border border-gray-400 p-2">Item No.</TableCell>
                                        <TableCell className="border border-gray-400 p-2">Category</TableCell>
                                        <TableCell className="border border-gray-400 p-2">Conditions</TableCell>
                                        <TableCell className="border border-gray-400 p-2">Reference Standards</TableCell>
                                        <TableCell className="border border-gray-400 p-2">Completed</TableCell>
                                        <TableCell className="border border-gray-400 p-2">Risk Index</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {categories[floor].map((category, catIndex) => (
                                        <TableRow key={catIndex}>
                                            <TableCell className="border border-gray-400 p-2 text-center">{catIndex + 1}</TableCell>
                                            <TableCell className="border border-gray-400 p-2">{category}</TableCell>
                                            <TableCell className="border border-gray-400 p-2">{conditions}</TableCell>
                                            <TableCell className="border border-gray-400 p-2">{referenceStandards}</TableCell>
                                            <TableCell className="border border-gray-400 p-2">
                                                <FormControlLabel control={<Checkbox />} label="Yes" />
                                                <FormControlLabel control={<Checkbox />} label="No" />
                                            </TableCell>
                                            <TableCell className="border border-gray-400 p-2">
                                                <div>
                                                    PO: 
                                                    <Select defaultValue={5}>
                                                        <MenuItem value={5}>5 - Frequent</MenuItem>
                                                        <MenuItem value={4}>4 - Likely</MenuItem>
                                                        <MenuItem value={3}>3 - Occasional</MenuItem>
                                                        <MenuItem value={2}>2 - Seldom</MenuItem>
                                                        <MenuItem value={1}>1 - Improbable</MenuItem>
                                                    </Select>
                                                </div>
                                                <div>
                                                    SO: 
                                                    <Select defaultValue="A">
                                                        <MenuItem value="A">A - Catastrophic</MenuItem>
                                                        <MenuItem value="B">B - Critical</MenuItem>
                                                        <MenuItem value="C">C - Moderate</MenuItem>
                                                        <MenuItem value="D">D - Minor</MenuItem>
                                                        <MenuItem value="E">E - Negligible</MenuItem>
                                                    </Select>
                                                </div>
                                                <div>
                                                    ARI: 
                                                    <Select defaultValue="4A" onChange={(e) => handleAriChange(floor, category, e.target.value)}>
                                                        <MenuItem value="4A">4A</MenuItem>
                                                        <MenuItem value="4B">4B</MenuItem>
                                                        <MenuItem value="4C">4C</MenuItem>
                                                        <MenuItem value="5A">5A</MenuItem>
                                                        <MenuItem value="5B">5B</MenuItem>
                                                        <MenuItem value="5C">5C</MenuItem>
                                                        <MenuItem value="5D">5D</MenuItem>
                                                        <MenuItem value="5E">5E</MenuItem>
                                                        <MenuItem value="3A">3A</MenuItem>
                                                        <MenuItem value="3B">3B</MenuItem>
                                                        <MenuItem value="3C">3C</MenuItem>
                                                        <MenuItem value="3D">3D</MenuItem>
                                                        <MenuItem value="3E">3E</MenuItem>
                                                        <MenuItem value="2A">2A</MenuItem>
                                                        <MenuItem value="2B">2B</MenuItem>
                                                        <MenuItem value="2C">2C</MenuItem>
                                                        <MenuItem value="2D">2D</MenuItem>
                                                        <MenuItem value="2E">2E</MenuItem>
                                                        <MenuItem value="1A">1A</MenuItem>
                                                        <MenuItem value="1B">1B</MenuItem>
                                                        <MenuItem value="1C">1C</MenuItem>
                                                        <MenuItem value="1D">1D</MenuItem>
                                                        <MenuItem value="1E">1E</MenuItem>
                                                    </Select>
                                                </div>
                                                <div>
                                                    Value: {calculateValue(ariData[floor]?.[category] || "4A")}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </React.Fragment>
            ))}

            {/* Standard Compliance per Floor */}
            {["Size of Wires", "Protection", "Electrical Outlets", "Lighting"].map((standard, index) => (
                <React.Fragment key={index}>
                    <div className="border border-gray-400 mt-8">
                        <div className="bg-gray-800 text-white p-2">
                            <h3 className="text-center font-bold">Standard Compliance per Floor for {standard}</h3>
                        </div>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>FLOOR</TableCell>
                                        <TableCell>COMPLIED</TableCell>
                                        <TableCell>NON COMPLIANT</TableCell>
                                        <TableCell>PERCENTAGE (COMPLIED, NON COMPLIANT)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(categories).map((floor, floorIndex) => (
                                        <TableRow key={floorIndex}>
                                            <TableCell>{floor}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    placeholder="Complied"
                                                    defaultValue={0}
                                                    onChange={(e) => {
                                                        const complied = parseInt(e.target.value) || 0;
                                                        handleCompliedChange(floor, standard, complied);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    placeholder="Non Compliant"
                                                    defaultValue={0}
                                                    onChange={(e) => {
                                                        const nonCompliant = parseInt(e.target.value) || 0;
                                                        handleNonCompliantChange(floor, standard, nonCompliant);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {/* Calculate percentage based on input values */}
                                                {calculatePercentage([
                                                    complianceData[floor]?.[standard]?.complied || 0,
                                                    complianceData[floor]?.[standard]?.nonCompliant || 0
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
                    </div>
                </React.Fragment>
            ))}

            {/* Probability of Occurrences per Floor */}
            {["Size of Wires", "Protection", "Electrical Outlets", "Lighting"].map((standard, index) => (
                <React.Fragment key={index}>
                    <div className="border border-gray-400 mt-8">
                        <div className="bg-gray-800 text-white p-2">
                            <h3 className="text-center font-bold">Probability of Occurrences per Floor for {standard}</h3>
                        </div>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>FLOOR</TableCell>
                                        <TableCell>VALUES (5, 4, 3, 2, 1)</TableCell>
                                        <TableCell>PERCENTAGE (5, 4, 3, 2, 1)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(categories).map((floor, floorIndex) => (
                                        <TableRow key={floorIndex}>
                                            <TableCell>{floor}</TableCell>
                                            <TableCell>
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <TextField
                                                        key={i}
                                                        type="number"
                                                        placeholder={5 - i}
                                                        defaultValue={0}
                                                        onChange={(e) => {
                                                            const values = [
                                                                probabilityData[floor]?.[standard]?.[0] || 0,
                                                                probabilityData[floor]?.[standard]?.[1] || 0,
                                                                probabilityData[floor]?.[standard]?.[2] || 0,
                                                                probabilityData[floor]?.[standard]?.[3] || 0,
                                                                probabilityData[floor]?.[standard]?.[4] || 0,
                                                            ];
                                                            values[i] = parseInt(e.target.value) || 0;
                                                            setProbabilityData(prev => ({
                                                                ...prev,
                                                                [floor]: {
                                                                    ...prev[floor],
                                                                    [standard]: values,
                                                                }
                                                            }));
                                                        }}
                                                    />
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                {calculatePercentage(probabilityData[floor]?.[standard] || [0, 0, 0, 0, 0]).map((percentage, idx) => (
                                                    <span key={idx}>
                                                        {percentage}%
                                                        {idx < 4 && ' / '}
                                                    </span>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </React.Fragment>
            ))}

            {/* Risk Severity per Floor */}
            {["Size of Wires", "Protection", "Electrical Outlets", "Lighting"].map((standard, index) => (
                <React.Fragment key={index}>
                    <div className="border border-gray-400 mt-8">
                        <div className="bg-gray-800 text-white p-2">
                            <h3 className="text-center font-bold">Risk Severity per Floor for {standard}</h3>
                        </div>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>FLOOR</TableCell>
                                        <TableCell>VALUES (5, 4, 3, 2, 1)</TableCell>
                                        <TableCell>PERCENTAGE (5, 4, 3, 2, 1)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(categories).map((floor, floorIndex) => (
                                        <TableRow key={floorIndex}>
                                            <TableCell>{floor}</TableCell>
                                            <TableCell>
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <TextField
                                                        key={i}
                                                        type="number"
                                                        placeholder={5 - i}
                                                        defaultValue={0}
                                                        onChange={(e) => {
                                                            const values = [
                                                                riskSeverityData[floor]?.[standard]?.[0] || 0,
                                                                riskSeverityData[floor]?.[standard]?.[1] || 0,
                                                                riskSeverityData[floor]?.[standard]?.[2] || 0,
                                                                riskSeverityData[floor]?.[standard]?.[3] || 0,
                                                                riskSeverityData[floor]?.[standard]?.[4] || 0,
                                                            ];
                                                            values[i] = parseInt(e.target.value) || 0;
                                                            setRiskSeverityData(prev => ({
                                                                ...prev,
                                                                [floor]: {
                                                                    ...prev[floor],
                                                                    [standard]: values,
                                                                }
                                                            }));
                                                        }}
                                                    />
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                {calculatePercentage(riskSeverityData[floor]?.[standard] || [0, 0, 0, 0, 0]).map((percentage, idx) => (
                                                    <span key={idx}>
                                                        {percentage}%
                                                        {idx < 4 && ' / '}
                                                    </span>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </React.Fragment>
            ))}

            {/* Assessment Risk Index per Floor */}
            {["Size of Wires", "Protection", "Electrical Outlets", "Lighting"].map((standard, index) => (
                <React.Fragment key={index}>
                    <div className="border border-gray-400 mt-8">
                        <div className="bg-gray-800 text-white p-2">
                            <h3 className="text-center font-bold">Assessment Risk Index per Floor for {standard}</h3>
                        </div>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>FLOOR</TableCell>
                                        <TableCell>VALUES (1, 2, 3, 4)</TableCell>
                                        <TableCell>PERCENTAGE (1, 2, 3, 4)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(categories).map((floor, floorIndex) => (
                                        <TableRow key={floorIndex}>
                                            <TableCell>{floor}</TableCell>
                                            <TableCell>
                                                {Array.from({ length: 4 }, (_, i) => (
                                                    <TextField
                                                        key={i}
                                                        type="number"
                                                        placeholder={4 - i}
                                                        defaultValue={0}
                                                        onChange={(e) => {
                                                            const values = [
                                                                riskSeverityData[floor]?.[standard]?.[0] || 0,
                                                                riskSeverityData[floor]?.[standard]?.[1] || 0,
                                                                riskSeverityData[floor]?.[standard]?.[2] || 0,
                                                                riskSeverityData[floor]?.[standard]?.[3] || 0,
                                                            ];
                                                            values[i] = parseInt(e.target.value) || 0;
                                                            setRiskSeverityData(prev => ({
                                                                ...prev,
                                                                [floor]: {
                                                                    ...prev[floor],
                                                                    [standard]: values,
                                                                }
                                                            }));
                                                        }}
                                                    />
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                {calculatePercentage(riskSeverityData[floor]?.[standard] || [0, 0, 0, 0]).map((percentage, idx) => (
                                                    <span key={idx}>
                                                        {percentage}%
                                                        {idx < 3 && ' / '}
                                                    </span>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </React.Fragment>
            ))}

            {/* Save Button */}
            <Button variant="contained" color="primary" onClick={saveData} sx={{ mt: 4 }}>
                Save Data
            </Button>

            {/* Print Button */}
            <Button variant="contained" color="secondary" onClick={() => window.print()} sx={{ mt: 4, ml: 2 }}>
                Print Checklist
            </Button>

            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .border {
                            visibility: visible;
                        }
                        .border * {
                            visibility: visible;
                        }
                    }
                `}
            </style>

            {/* Snackbar for Save Confirmation */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Data saved successfully on {lastSaved}.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EnergyAudit;