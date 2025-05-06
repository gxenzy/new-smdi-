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
    Button
} from '@mui/material';

const floors = [
    "Ground Floor",
    "Mezzanine Floor",
    "2nd Floor",
    "3rd Floor",
    "4th Floor",
    "5th Floor"
];

const categories = {
    "Ground Floor": ["Registrar", "Guidance", "EDP", "Accounting"],
    "Mezzanine Floor": ["GSR 1", "GSR 2", "Research Hub", "Research & CARES Office", "M4", "M3", "M2", "M1", "Safety Office", "Cisco Lab. 2", "Cisco Lab. 3", "Building Maintenance", "Mezzanine Hallway"],
    "2nd Floor": ["Room 207", "Room 208", "Repair Room", "Cisco Lab. 1", "Room 211", "Room 212", "HRD Office", "Female CR", "2nd Floor Hallway"],
    "3rd Floor": ["Room 305", "Room 306", "Room 307", "Room 308", "Room 309", "Cisco Lab. 4", "Room 312", "Nursing Facility", "Nursing Skills Lab. 2", "Nursing Skills Lab. Extension Room", "Female CR", "3rd Floor Hallway"],
    "4th Floor": ["Room 403", "Room 404", "Room 405", "Room 406", "Room 407", "Room 408", "Room 409", "Cisco Lab. 5", "Faculty Room", "Library Extension", "Female CR", "4th Floor Hallway"],
    "5th Floor": ["Room 502", "Room 503", "Room 504", "Room 505", "Room 506", "Room 507", "Room 508", "Room 509", "Storage Room", "Electrical Room", "Male CR", "5th Floor Hallway"]
};

const TableMaker = () => {
    const [selectedFloor, setSelectedFloor] = useState(floors[0]);
    const [rows, setRows] = useState([]);

    const handleAddRow = () => {
        setRows([...rows, { category: '', conditions: '', referenceStandard: '', completed: false, riskIndex: { PO: '', SO: '', ARI: '', value: '' } }]);
    };

    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Table Maker</Typography>
            <Select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                {floors.map((floor) => (
                    <MenuItem key={floor} value={floor}>{floor}</MenuItem>
                ))}
            </Select>
            <Button variant="contained" color="primary" onClick={handleAddRow} sx={{ mt: 2 }}>
                Add Row
            </Button>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ITEM NO.</TableCell>
                            <TableCell>CATEGORY</TableCell>
                            <TableCell>CONDITIONS</TableCell>
                            <TableCell>REFERENCE STANDARDS</TableCell>
                            <TableCell>COMPLETED</TableCell>
                            <TableCell>RISK INDEX</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Select value={row.category} onChange={(e) => handleChange(index, 'category', e.target.value)}>
                                        {categories[selectedFloor].map((category) => (
                                            <MenuItem key={category} value={category}>{category}</MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <TextField value={row.conditions} onChange={(e) => handleChange(index, 'conditions', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <TextField value={row.referenceStandard} onChange={(e) => handleChange(index, 'referenceStandard', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel control={<Checkbox checked={row.completed} onChange={(e) => handleChange(index, 'completed', e.target.checked)} />} label="Yes" />
                                </TableCell>
                                <TableCell>
                                    <TextField value={row.riskIndex.PO} onChange={(e) => handleChange(index, 'riskIndex', { ...row.riskIndex, PO: e.target.value })} placeholder="PO" />
                                    <TextField value={row.riskIndex.SO} onChange={(e) => handleChange(index, 'riskIndex', { ...row.riskIndex, SO: e.target.value })} placeholder="SO" />
                                    <TextField value={row.riskIndex.ARI} onChange={(e) => handleChange(index, 'riskIndex', { ...row.riskIndex, ARI: e.target.value })} placeholder="ARI" />
                                    <TextField value={row.riskIndex.value} onChange={(e) => handleChange(index, 'riskIndex', { ...row.riskIndex, value: e.target.value })} placeholder="Value" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TableMaker;
