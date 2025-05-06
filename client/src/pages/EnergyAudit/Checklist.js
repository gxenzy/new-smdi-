import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

const Checklist = () => {
    const [probabilityData, setProbabilityData] = useState([
        { definition: "Frequent", value: 5 },
        { definition: "Likely", value: 4 },
        { definition: "Occasional", value: 3 },
        { definition: "Seldom", value: 2 },
        { definition: "Improbable", value: 1 },
    ]);

    const handleProbabilityChange = (index, value) => {
        const updatedData = [...probabilityData];
        updatedData[index].value = value;
        setProbabilityData(updatedData);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5">Energy Audit Checklist</Typography>
            <Typography variant="h6">Probability of Occurrences</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Qualitative Definition</TableCell>
                        <TableCell>Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {probabilityData.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.definition}</TableCell>
                            <TableCell>
                                <TextField
                                    type="number"
                                    value={item.value}
                                    onChange={(e) => handleProbabilityChange(index, e.target.value)}
                                    variant="outlined"
                                    size="small"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {/* Additional tables for Severity of Occurrences, Risk Severity, and Assessment Risk Index can be added here */}
        </Box>
    );
};

export default Checklist;
